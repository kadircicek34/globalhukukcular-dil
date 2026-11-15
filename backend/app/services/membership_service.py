"""Secure storage helpers for GH Dil membership e-Devlet documents."""

from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

MAX_DOCUMENT_BYTES = 5 * 1024 * 1024
ALLOWED_DOCUMENT_TYPES = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
}


def documents_dir() -> Path:
    path = Path(settings.MEMBERSHIP_DOCS_DIR)
    path.mkdir(parents=True, exist_ok=True)
    return path


def _validate_bytes(content_type: str | None, data: bytes) -> str:
    if content_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yalnızca PDF, JPEG veya PNG belge yükleyebilirsiniz",
        )
    if len(data) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Belge dosyası geçersiz")

    if content_type == "application/pdf" and data.startswith(b"%PDF-"):
        return "pdf"
    if content_type == "image/jpeg" and data.startswith(b"\xff\xd8\xff"):
        if data.endswith(b"\xff\xd9"):
            return "jpg"
    if content_type == "image/png" and data.startswith(b"\x89PNG\r\n\x1a\n"):
        if len(data) >= 24 and data[12:16] == b"IHDR":
            width = int.from_bytes(data[16:20], "big")
            height = int.from_bytes(data[20:24], "big")
            if width > 0 and height > 0:
                return "png"
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Belge dosyası geçersiz")


def safe_display_name(filename: str | None) -> str:
    name = os.path.basename((filename or "edevlet-belgesi").replace("\\", "/")).strip()
    return name[:255] or "edevlet-belgesi"


async def save_e_devlet_document(file: UploadFile) -> tuple[str, str, str]:
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    data = await file.read(MAX_DOCUMENT_BYTES + 1)
    if len(data) > MAX_DOCUMENT_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Belge en fazla 5 MB olabilir",
        )
    ext = _validate_bytes(content_type, data)
    filename = f"{uuid.uuid4().hex}.{ext}"
    destination = documents_dir() / filename
    destination.write_bytes(data)
    return str(destination), safe_display_name(file.filename), content_type


def delete_document(path: str | None) -> None:
    if not path:
        return
    try:
        candidate = Path(path)
        base = documents_dir().resolve()
        if candidate.resolve().parent == base:
            candidate.unlink(missing_ok=True)
    except OSError:
        pass


def resolve_document_path(stored_path: str | None) -> Path | None:
    """Resolve a stored document path, refusing anything outside the docs directory."""
    if not stored_path:
        return None
    candidate = Path(stored_path)
    if candidate.name != os.path.basename(candidate.name):
        return None
    base = documents_dir().resolve()
    resolved = (base / candidate.name).resolve()
    if resolved.parent != base or not resolved.is_file():
        return None
    return resolved
