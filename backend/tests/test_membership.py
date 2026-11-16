from datetime import date

import pytest
from sqlalchemy import select

from app.core.config import settings
from app.models.user import User

APPLY_URL = "/api/auth/apply"


def application_data(**overrides):
    data = {
        "username": "ayse.hukuk",
        "email": "ayse@example.com",
        "password": "Test1234!@",
        "display_name": "Ayşe Yılmaz",
        "birth_date": "2001-04-12",
        "law_status": "student",
        "law_school": "İstanbul Üniversitesi Hukuk Fakültesi",
        "kvkk_accepted": "true",
        "terms_accepted": "true",
        "native_language": "tr",
    }
    data.update(overrides)
    return data


def pdf_file(name="edevlet.pdf", content=b"%PDF-1.4 e-Devlet ogrenci belgesi"):
    return {"e_devlet_document": (name, content, "application/pdf")}


async def apply(client, tmp_path, monkeypatch, **overrides):
    monkeypatch.setattr(settings, "MEMBERSHIP_DOCS_DIR", str(tmp_path))
    return await client.post(
        APPLY_URL,
        data=application_data(**overrides),
        files=pdf_file(),
    )


@pytest.mark.asyncio
async def test_apply_creates_pending_member_with_document(
    client, db_session, admin_user, tmp_path, monkeypatch
):
    response = await apply(client, tmp_path, monkeypatch)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["status"] == "pending"
    assert body["application_id"] > 0
    assert "access_token" not in body

    user = (
        await db_session.execute(select(User).where(User.email == "ayse@example.com"))
    ).scalar_one()
    assert user.membership_status == "pending"
    assert user.birth_date == date(2001, 4, 12)
    assert user.law_status == "student"
    assert user.e_devlet_document_name == "edevlet.pdf"
    assert user.e_devlet_document_path
    assert (tmp_path / user.e_devlet_document_path.rsplit("/", 1)[-1]).is_file()


@pytest.mark.asyncio
async def test_apply_requires_birth_date(client, tmp_path, monkeypatch):
    data = application_data()
    data.pop("birth_date")
    monkeypatch.setattr(settings, "MEMBERSHIP_DOCS_DIR", str(tmp_path))
    response = await client.post(APPLY_URL, data=data, files=pdf_file())
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_apply_requires_document(client, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "MEMBERSHIP_DOCS_DIR", str(tmp_path))
    response = await client.post(APPLY_URL, data=application_data())
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_apply_requires_kvkk(client, tmp_path, monkeypatch):
    response = await apply(client, tmp_path, monkeypatch, kvkk_accepted="false")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_apply_rejects_invalid_document_type(client, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "MEMBERSHIP_DOCS_DIR", str(tmp_path))
    response = await client.post(
        APPLY_URL,
        data=application_data(),
        files={"e_devlet_document": ("belge.txt", b"merhaba dunya", "text/plain")},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_apply_rejects_oversized_document(client, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "MEMBERSHIP_DOCS_DIR", str(tmp_path))
    payload = b"%PDF-1.4 " + b"x" * (5 * 1024 * 1024)
    response = await client.post(APPLY_URL, data=application_data(), files=pdf_file(content=payload))
    assert response.status_code == 413


@pytest.mark.asyncio
async def test_apply_rejects_duplicate_email(client, tmp_path, monkeypatch):
    first = await apply(client, tmp_path, monkeypatch)
    assert first.status_code == 201
    second = await apply(
        client, tmp_path, monkeypatch, username="baska.kullanici", email="ayse@example.com"
    )
    assert second.status_code == 409


@pytest.mark.asyncio
async def test_pending_member_can_login_immediately(client, admin_user, tmp_path, monkeypatch):
    assert (await apply(client, tmp_path, monkeypatch)).status_code == 201
    response = await client.post(
        "/api/auth/login", json={"email": "ayse@example.com", "password": "Test1234!@"}
    )
    assert response.status_code == 200
    assert response.json()["access_token"]


@pytest.mark.asyncio
async def test_admin_can_list_and_approve_then_member_logs_in(
    client, db_session, admin_user, tmp_path, monkeypatch
):
    assert (await apply(client, tmp_path, monkeypatch)).status_code == 201
    _, admin_headers = admin_user

    listed = await client.get("/api/admin/memberships?status=pending", headers=admin_headers)
    assert listed.status_code == 200, listed.text
    item = listed.json()["items"][0]
    assert item["birth_date"] == "2001-04-12"
    assert item["law_status"] == "student"
    assert item["document_name"] == "edevlet.pdf"

    approved = await client.post(
        f"/api/admin/memberships/{item['id']}/approve", headers=admin_headers
    )
    assert approved.status_code == 200, approved.text
    assert approved.json()["status"] == "approved"

    login = await client.post(
        "/api/auth/login", json={"email": "ayse@example.com", "password": "Test1234!@"}
    )
    assert login.status_code == 200, login.text
    assert login.json()["access_token"]


@pytest.mark.asyncio
async def test_admin_can_reject_with_reason(client, db_session, admin_user, tmp_path, monkeypatch):
    assert (await apply(client, tmp_path, monkeypatch)).status_code == 201
    _, admin_headers = admin_user
    user = (
        await db_session.execute(select(User).where(User.email == "ayse@example.com"))
    ).scalar_one()

    response = await client.post(
        f"/api/admin/memberships/{user.id}/reject",
        headers=admin_headers,
        json={"reason": "e-Devlet belgesi okunamadı"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "rejected"

    await db_session.refresh(user)
    assert user.membership_note == "e-Devlet belgesi okunamadı"
    login = await client.post(
        "/api/auth/login", json={"email": "ayse@example.com", "password": "Test1234!@"}
    )
    assert login.status_code == 403
    assert login.json()["detail"] == "Membership application rejected"


@pytest.mark.asyncio
async def test_document_is_admin_only(
    client, db_session, admin_user, test_user, tmp_path, monkeypatch
):
    assert (await apply(client, tmp_path, monkeypatch)).status_code == 201
    _, admin_headers = admin_user
    _, user_headers = test_user
    user = (
        await db_session.execute(select(User).where(User.email == "ayse@example.com"))
    ).scalar_one()

    forbidden = await client.get(
        f"/api/admin/memberships/{user.id}/document", headers=user_headers
    )
    assert forbidden.status_code == 403

    allowed = await client.get(
        f"/api/admin/memberships/{user.id}/document", headers=admin_headers
    )
    assert allowed.status_code == 200
    assert allowed.headers["cache-control"] == "private, no-store"
    assert allowed.content.startswith(b"%PDF-")


@pytest.mark.asyncio
async def test_non_admin_cannot_approve(client, test_user, tmp_path, monkeypatch):
    assert (await apply(client, tmp_path, monkeypatch)).status_code == 201
    _, user_headers = test_user
    response = await client.post("/api/admin/memberships/1/approve", headers=user_headers)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_public_register_is_closed_when_membership_required(client, monkeypatch):
    monkeypatch.setattr(settings, "MEMBERSHIP_REQUIRED", True)
    response = await client.post(
        "/api/auth/register",
        json={
            "username": "bypass",
            "email": "bypass@example.com",
            "password": "Test1234!@",
            "display_name": "Bypass",
            "native_language": "tr",
        },
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Membership application required"


@pytest.mark.asyncio
async def test_first_applicant_becomes_admin(client, db_session, tmp_path, monkeypatch):
    first = await apply(client, tmp_path, monkeypatch)
    assert first.status_code == 201
    # A fresh database starts empty; the first application is the bootstrap admin.
    assert first.json()["status"] == "approved"
    user = (
        await db_session.execute(select(User).where(User.email == "ayse@example.com"))
    ).scalar_one()
    assert user.role == "admin"


@pytest.mark.asyncio
async def test_pending_token_can_access_protected_routes(
    client, db_session, admin_user, tmp_path, monkeypatch
):
    from app.core.security import create_access_token

    assert (await apply(client, tmp_path, monkeypatch)).status_code == 201
    user = (
        await db_session.execute(select(User).where(User.email == "ayse@example.com"))
    ).scalar_one()
    token = create_access_token(user.id, user.role)
    response = await client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["membership_status"] == "pending"


@pytest.mark.asyncio
async def test_rejected_member_refresh_is_revoked(
    client, db_session, admin_user, tmp_path, monkeypatch
):
    assert (await apply(client, tmp_path, monkeypatch)).status_code == 201
    _, admin_headers = admin_user
    user = (
        await db_session.execute(select(User).where(User.email == "ayse@example.com"))
    ).scalar_one()
    approved = await client.post(
        f"/api/admin/memberships/{user.id}/approve", headers=admin_headers
    )
    assert approved.status_code == 200
    login = await client.post(
        "/api/auth/login", json={"email": "ayse@example.com", "password": "Test1234!@"}
    )
    assert login.status_code == 200
    user.membership_status = "rejected"
    await db_session.commit()
    refreshed = await client.post("/api/auth/refresh")
    assert refreshed.status_code == 403


@pytest.mark.asyncio
async def test_reject_reason_whitespace_is_rejected(
    client, admin_user, tmp_path, monkeypatch
):
    assert (await apply(client, tmp_path, monkeypatch)).status_code == 201
    _, admin_headers = admin_user
    response = await client.post(
        "/api/admin/memberships/1/reject",
        headers=admin_headers,
        json={"reason": "   "},
    )
    assert response.status_code == 422
