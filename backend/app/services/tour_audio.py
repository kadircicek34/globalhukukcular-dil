"""Persistent, shared cache for localized dashboard tour narration."""

import asyncio
import fcntl
import hashlib
import json
import os
import tempfile
from pathlib import Path

from app.core.config import settings
from app.services.gemini_tts_service import GeminiTTSService
from app.services.tts_service import (
    AntaliaTTSService,
    EdgeTTSService,
    FallbackTTSService,
    KokoroTTSService,
    OpenAITTSService,
    get_tts_audio_format,
)

TTSService = (
    KokoroTTSService
    | OpenAITTSService
    | GeminiTTSService
    | AntaliaTTSService
    | EdgeTTSService
    | FallbackTTSService
)

OPENAI_VOICES = frozenset(
    {"alloy", "ash", "coral", "echo", "fable", "nova", "onyx", "sage", "shimmer"}
)


def _effective_voice(service: TTSService, voice: str | None) -> str | None:
    # Kokoro owns its single configured voice; UI voice names do not apply.
    if isinstance(service, KokoroTTSService):
        return service.voice
    # Antalia Mini is a single-voice Turkish model.
    if isinstance(service, AntaliaTTSService):
        return None
    return voice


def _cache_key(service: TTSService, text: str, locale: str, voice: str | None) -> str:
    getter = getattr(service, "get_cache_key", None)
    if getter is not None:
        return str(getter(text, voice, locale))
    effective_voice = _effective_voice(service, voice) or getattr(service, "voice", None)
    identity = {
        "text": text,
        "locale": locale,
        "provider": "local",
        "model": "kokoro",
        "voice": effective_voice,
        "speed": 1.0,
        "format": "mp3",
    }
    return hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()


def _cached_path(service: TTSService, directory: Path, key: str) -> Path | None:
    for extension, media_type in (("wav", "audio/wav"), ("mp3", "audio/mpeg")):
        candidate = directory / f"{key}.{extension}"
        if candidate.is_file() and candidate.stat().st_size > 0:
            service.last_format = (extension, media_type)  # type: ignore[attr-defined]
            return candidate
    return None


async def get_tour_audio(
    service: TTSService,
    *,
    locale: str,
    text: str,
    voice: str | None,
) -> Path:
    key = _cache_key(service, text, locale, voice)
    directory = Path(settings.AUDIO_STORAGE_PATH) / "tour" / locale
    directory.mkdir(parents=True, exist_ok=True)
    path = _cached_path(service, directory, key)
    if path is not None:
        return path

    # The shared audio volume also shares this lock across Uvicorn workers.
    # Nonblocking acquisition keeps provider calls and lock waits cancellable.
    async with asyncio.timeout(120):
        with (directory / f"{key}.lock").open("a+b") as lock:
            while True:
                try:
                    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                    break
                except BlockingIOError:
                    await asyncio.sleep(0.1)
            try:
                path = _cached_path(service, directory, key)
                if path is not None:
                    return path
                audio = await service.synthesize(
                    text, _effective_voice(service, voice), language=locale
                )
                if not audio:
                    raise ValueError("Empty tour narration")
                extension, _ = get_tts_audio_format(service)
                destination = directory / f"{key}.{extension}"
                temporary = None
                try:
                    with tempfile.NamedTemporaryFile(
                        dir=directory, suffix=".tmp", delete=False
                    ) as out:
                        temporary = Path(out.name)
                        out.write(audio)
                    os.replace(temporary, destination)
                finally:
                    if temporary is not None:
                        temporary.unlink(missing_ok=True)
                return destination
            finally:
                fcntl.flock(lock, fcntl.LOCK_UN)
