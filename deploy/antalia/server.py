"""Minimal internal HTTP wrapper around the local Antalia Mini Turkish TTS model.

The GH Dil backend calls this sidecar over the private Docker network. Keeping the
model in a separate Python 3.12 container avoids coupling the FastAPI 3.14 runtime
to PyTorch and lets the model weights stay on a read-only bind mount.
"""

from __future__ import annotations

import io
import json
import os
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import soundfile as sf
from antalia_mini import Antalia

MODEL_PATH = os.environ.get("ANTALIA_MODEL", "/models/antalia-mini")
SAMPLE_RATE = int(os.environ.get("ANTALIA_SAMPLE_RATE", "24000"))
MAX_TEXT_LENGTH = 4000

print(f"[antalia] loading model from {MODEL_PATH}", flush=True)
tts = Antalia(MODEL_PATH, variant="fp16", sample_rate=SAMPLE_RATE)
lock = threading.Lock()
print("[antalia] model ready", flush=True)


class Handler(BaseHTTPRequestHandler):
    server_version = "ghdil-antalia/1.0"

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        # Keep the sidecar quiet; the backend logs synthesis outcomes.
        return

    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        if self.path.rstrip("/") == "/health":
            self._send_json(200, {"status": "ok", "model": "antalia-mini"})
            return
        self._send_json(404, {"detail": "not found"})

    def do_POST(self) -> None:  # noqa: N802
        if self.path.rstrip("/") != "/synthesize":
            self._send_json(404, {"detail": "not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 1_000_000:
                self._send_json(413, {"detail": "invalid body"})
                return
            payload = json.loads(self.rfile.read(length) or b"{}")
            text = str(payload.get("text") or "").strip()
            if not text:
                self._send_json(422, {"detail": "text is required"})
                return
            if len(text) > MAX_TEXT_LENGTH:
                text = text[:MAX_TEXT_LENGTH]
            speed = min(2.0, max(0.5, float(payload.get("speed") or 1.0)))
            with lock:
                speech = tts.say(text, speed=speed, seed=0)
            buffer = io.BytesIO()
            sf.write(buffer, speech.audio, speech.sample_rate, format="WAV", subtype="PCM_16")
            data = buffer.getvalue()
            self.send_response(200)
            self.send_header("Content-Type", "audio/wav")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except (ValueError, TypeError) as exc:
            self._send_json(422, {"detail": str(exc)})
        except Exception as exc:  # noqa: BLE001
            print(f"[antalia] synthesis failed: {type(exc).__name__}: {exc}", flush=True)
            self._send_json(500, {"detail": "synthesis failed"})


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", 8099), Handler).serve_forever()
