import hashlib
import json
import time

import httpx
import openai

from app.core.app_logger import get_logger
from app.services.gemini_tts_service import GeminiTTSService
from app.services.prompts.speech import build_speech_instructions

logger = get_logger(__name__)


def get_tts_audio_format(service: object) -> tuple[str, str]:
    """Return the file extension and MIME type of the selected adapter's output."""
    if isinstance(service, GeminiTTSService):
        return "wav", "audio/wav"
    last_format = getattr(service, "last_format", None)
    if last_format is not None:
        return last_format
    return "mp3", "audio/mpeg"


class KokoroTTSService:
    def __init__(self, base_url: str, voice: str) -> None:
        self.base_url = base_url
        self.voice = voice

    async def health(self) -> None:
        """Raise if Kokoro is unreachable."""
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{self.base_url}/v1/models", timeout=5.0)
            r.raise_for_status()

    async def synthesize(
        self, text: str, voice: str | None = None, language: str | None = None
    ) -> bytes:
        """Call Kokoro-FastAPI and return MP3 audio bytes."""
        _ = language  # Kokoro handles language via the voice model itself
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/v1/audio/speech",
                json={
                    "model": "kokoro",
                    "input": text,
                    "voice": voice or self.voice,
                    "response_format": "mp3",
                },
                timeout=30.0,
            )
            response.raise_for_status()
            return response.content


class AntaliaTTSService:
    """Local Turkish TTS served by the Antalia Mini sidecar."""

    name = "antalia"

    def __init__(self, base_url: str, speed: float = 1.0) -> None:
        self.base_url = base_url.rstrip("/")
        self.speed = speed
        self.last_format: tuple[str, str] | None = None

    async def health(self) -> None:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/health", timeout=5.0)
            response.raise_for_status()

    async def synthesize(
        self, text: str, voice: str | None = None, language: str | None = None
    ) -> bytes:
        _ = voice
        if language and not language.lower().startswith("tr"):
            raise RuntimeError("Antalia Mini is Turkish-only")
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/synthesize",
                json={"text": text, "speed": self.speed},
                timeout=120.0,
            )
            response.raise_for_status()
            audio = response.content
            if not audio:
                raise RuntimeError("Antalia returned empty audio")
            self.last_format = ("wav", "audio/wav")
            return audio

    def get_cache_key(
        self, text: str, voice: str | None = None, language: str | None = None
    ) -> str:
        identity = {
            "text": text,
            "locale": language,
            "provider": self.name,
            "model": "antalia-mini-1.0.1",
            "speed": self.speed,
            "format": "wav",
        }
        return hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()


class EdgeTTSService:
    """Free, keyless fallback TTS with Turkish and major-language voices."""

    name = "edge"

    _VOICE_BY_LANGUAGE = {
        "tr": "tr-TR-EmelNeural",
        "en": "en-US-AriaNeural",
        "de": "de-DE-KatjaNeural",
        "fr": "fr-FR-DeniseNeural",
        "es": "es-ES-ElviraNeural",
        "it": "it-IT-ElsaNeural",
        "pt": "pt-BR-FranciscaNeural",
        "ru": "ru-RU-SvetlanaNeural",
    }

    def __init__(self, default_voice: str = "tr-TR-EmelNeural") -> None:
        self.default_voice = default_voice
        self.last_format: tuple[str, str] | None = None

    def _voice_for(self, voice: str | None, language: str | None) -> str:
        if voice and voice.endswith("Neural") and "-" in voice:
            return voice
        exact = {
            "tr-TR": "tr-TR-EmelNeural",
            "en-GB": "en-GB-SoniaNeural",
            "en-US": "en-US-AriaNeural",
            "de-DE": "de-DE-KatjaNeural",
            "fr-FR": "fr-FR-DeniseNeural",
        }
        if language in exact:
            return exact[language]
        prefix = (language or "tr").split("-")[0].lower()
        return self._VOICE_BY_LANGUAGE.get(prefix, self.default_voice)

    async def health(self) -> None:
        return None

    async def synthesize(
        self, text: str, voice: str | None = None, language: str | None = None
    ) -> bytes:
        import edge_tts  # noqa: PLC0415

        selected_voice = self._voice_for(voice, language)
        communicate = edge_tts.Communicate(text, selected_voice)
        chunks: list[bytes] = []
        async for chunk in communicate.stream():
            if chunk.get("type") == "audio":
                chunks.append(chunk["data"])
        audio = b"".join(chunks)
        if not audio:
            raise RuntimeError("Edge TTS returned empty audio")
        self.last_format = ("mp3", "audio/mpeg")
        return audio

    def get_cache_key(
        self, text: str, voice: str | None = None, language: str | None = None
    ) -> str:
        identity = {
            "text": text,
            "locale": language,
            "provider": self.name,
            "model": self._voice_for(voice, language),
            "format": "mp3",
        }
        return hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()


class FallbackTTSService:
    """Try providers in order and expose the format of the provider that succeeded."""

    name = "fallback"

    def __init__(self, services: list[object]) -> None:
        self.services = services
        self.last_format: tuple[str, str] | None = None
        self.last_provider: str | None = None

    async def health(self) -> None:
        last_error: Exception | None = None
        for service in self.services:
            health = getattr(service, "health", None)
            if health is None:
                return
            try:
                await health()
                return
            except Exception as exc:  # noqa: BLE001
                last_error = exc
        if last_error is not None:
            raise last_error

    async def synthesize(
        self, text: str, voice: str | None = None, language: str | None = None
    ) -> bytes:
        errors: list[str] = []
        for service in self.services:
            try:
                audio = await service.synthesize(text, voice, language=language)  # type: ignore[attr-defined]
                self.last_format = getattr(service, "last_format", None)
                self.last_provider = getattr(service, "name", type(service).__name__)
                logger.info("[tts] provider=%s succeeded", self.last_provider)
                return audio
            except Exception as exc:  # noqa: BLE001
                provider = getattr(service, "name", type(service).__name__)
                errors.append(f"{provider}: {type(exc).__name__}: {exc}")
                logger.warning("[tts] provider=%s failed: %s", provider, exc)
        raise RuntimeError("All TTS providers failed: " + " | ".join(errors))

    def get_cache_key(
        self, text: str, voice: str | None = None, language: str | None = None
    ) -> str:
        parts = []
        for service in self.services:
            getter = getattr(service, "get_cache_key", None)
            if getter is not None:
                parts.append(getter(text, voice, language))
            else:
                parts.append(getattr(service, "name", type(service).__name__))
        identity = {
            "text": text,
            "locale": language,
            "provider": self.name,
            "chain": parts,
        }
        return hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()


class OpenAITTSService:
    def __init__(
        self,
        api_key: str,
        model: str,
        voice: str,
        speed: float = 1.0,
        timeout: float | None = None,
    ) -> None:
        self._client = openai.AsyncOpenAI(api_key=api_key)
        self.model = model
        self.voice = voice
        self.speed = speed
        self.timeout = timeout

    async def health(self) -> None:
        """Raise if OpenAI TTS is unreachable (lightweight models list call)."""
        await self._client.models.list()

    def get_instructions(self, language: str | None = None) -> str | None:
        if self.model == "gpt-4o-mini-tts" or self.model.startswith("gpt-4o-mini-tts-"):
            return build_speech_instructions(language)
        return None

    def get_cache_key(
        self, text: str, voice: str | None = None, language: str | None = None
    ) -> str:
        identity = {
            "text": text,
            "locale": language,
            "provider": "openai",
            "model": self.model,
            "voice": voice or self.voice,
            "speed": self.speed,
            "format": "mp3",
        }
        instructions = self.get_instructions(language)
        if instructions:
            identity["instructions"] = instructions
        return hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()

    async def synthesize(
        self, text: str, voice: str | None = None, language: str | None = None
    ) -> bytes:
        """Call OpenAI TTS API and return MP3 audio bytes."""
        text = text.strip()
        if not text:
            logger.warning("[tts-openai] Empty text received for synthesis")
            return b""

        req_voice = (voice or self.voice).strip()
        input_len = len(text)
        start_t = time.perf_counter()
        logger.info(
            "[tts-openai] request_start model=%s voice=%s chars=%d",
            self.model,
            req_voice,
            input_len,
        )
        request_payload = {
            "model": self.model,
            "voice": req_voice,
            "input": text,
            "response_format": "mp3",
            "speed": self.speed,
        }
        instructions = self.get_instructions(language)
        if instructions:
            request_payload["instructions"] = instructions
        if self.timeout is not None:
            request_payload["timeout"] = self.timeout

        response = await self._client.audio.speech.create(**request_payload)
        audio = response.content
        if not audio:
            raise RuntimeError("OpenAI TTS returned empty audio payload")
        elapsed_ms = (time.perf_counter() - start_t) * 1000
        request_id = getattr(response, "request_id", None)
        if request_id is None:
            headers = getattr(response, "headers", None)
            if headers is not None:
                request_id = headers.get("x-request-id")
        logger.info(
            "[tts-openai] request_ok model=%s voice=%s chars=%d bytes=%d ms=%.1f request_id=%s",
            self.model,
            req_voice,
            input_len,
            len(audio),
            round(elapsed_ms, 1),
            request_id,
        )
        return audio
