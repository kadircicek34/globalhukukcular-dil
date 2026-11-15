"""Create or promote an approved GH Dil administrator.

Usage (inside the backend container):
    python scripts/create_admin.py --email admin@example.com --password '...' \
        --username admin --name 'Admin'
"""

from __future__ import annotations

import argparse
import asyncio
import sys

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import User


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--username", default="admin")
    parser.add_argument("--name", default="GH Dil Yönetici")
    args = parser.parse_args()

    async with AsyncSessionLocal() as db:
        user = (
            await db.execute(select(User).where(User.email == args.email.lower()))
        ).scalar_one_or_none()
        if user is None:
            user = User(
                username=args.username,
                email=args.email.lower(),
                display_name=args.name,
                hashed_password=hash_password(args.password),
                role="admin",
                native_language="tr",
                target_language="en-GB",
                is_active=True,
                is_verified=True,
                membership_status="approved",
            )
            db.add(user)
        else:
            user.role = "admin"
            user.membership_status = "approved"
            user.is_active = True
            user.is_verified = True
            if args.password:
                user.hashed_password = hash_password(args.password)
        await db.commit()
        await db.refresh(user)
        print(f"admin ready: id={user.id} email={user.email}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
