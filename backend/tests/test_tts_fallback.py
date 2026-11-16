import sys
from types import SimpleNamespace

import pytest

from app.services.tts_service import (
    AntaliaTTSService,
    EdgeTTSService,
    FallbackTTSService,
    get_tts_audio_format,
)


class FakeTTS:
    def __init__(self, name, *, fail=False, audio=b"ID3", fmt=("mp3", "audio/mpeg")):
        self.name = name
        self.fail = fail
        self.audio = audio
        self.last_format = fmt

    async def health(self):
        if self.fail:
            raise RuntimeError("offline")

    async def synthesize(self, text, voice=None, language=None):
        if self.fail:
            raise RuntimeError(f"{self.name} offline")
        return self.audio

    def get_cache_key(self, text, voice=None, language=None):
        return f"{self.name}:{language}:{text}"


@pytest.mark.asyncio
async def test_fallback_uses_second_provider_and_exposes_its_format():
    primary = FakeTTS("antalia", fail=True, fmt=("wav", "audio/wav"))
    fallback = FakeTTS("edge", audio=b"ID3edge", fmt=("mp3", "audio/mpeg"))
    service = FallbackTTSService([primary, fallback])
    audio = await service.synthesize("Merhaba", language="tr")
    assert audio == b"ID3edge"
    assert service.last_provider == "edge"
    assert get_tts_audio_format(service) == ("mp3", "audio/mpeg")


@pytest.mark.asyncio
async def test_antalia_is_turkish_only_before_any_network_call():
    service = AntaliaTTSService("http://unused")
    with pytest.raises(RuntimeError, match="Turkish-only"):
        await service.synthesize("Hello", language="en-GB")


@pytest.mark.asyncio
async def test_edge_tts_maps_language_and_returns_mp3(monkeypatch):
    class FakeCommunicate:
        def __init__(self, text, voice):
            assert text == "Merhaba"
            assert voice == "tr-TR-EmelNeural"

        async def stream(self):
            yield {"type": "audio", "data": b"ID3"}
            yield {"type": "WordBoundary", "data": b""}

    monkeypatch.setitem(
        sys.modules, "edge_tts", SimpleNamespace(Communicate=FakeCommunicate)
    )
    service = EdgeTTSService("tr-TR-EmelNeural")
    audio = await service.synthesize("Merhaba", language="tr")
    assert audio == b"ID3"
    assert get_tts_audio_format(service) == ("mp3", "audio/mpeg")
    assert service.get_cache_key("Merhaba", language="tr") == service.get_cache_key(
        "Merhaba", language="tr"
    )
