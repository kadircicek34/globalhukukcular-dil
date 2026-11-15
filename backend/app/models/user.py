from __future__ import annotations

from datetime import UTC, date, datetime

from sqlalchemy import Boolean, Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.config import settings
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(10), nullable=False, default="user")
    native_language: Mapped[str] = mapped_column(String(10), nullable=False)
    target_language: Mapped[str] = mapped_column(String(10), nullable=False, default="en-GB")
    ui_locale: Mapped[str | None] = mapped_column(String(10), nullable=True)
    flashcard_back_content: Mapped[str] = mapped_column(
        String(20), nullable=False, default="definition", server_default="definition"
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    conversation_max_duration: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=settings.DEFAULT_CONVERSATION_MAX_DURATION,
    )
    conversation_inactivity_timeout: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=settings.DEFAULT_CONVERSATION_INACTIVITY_TIMEOUT,
    )
    # Silence in milliseconds that ends a spoken turn; 0 means derive it from the CEFR level.
    conversation_speech_pause: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    conversation_weekly_sessions: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=settings.DEFAULT_CONVERSATION_WEEKLY_SESSIONS,
    )
    conversation_daily_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=settings.DEFAULT_CONVERSATION_DAILY_MINUTES,
    )
    conversation_weekly_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=settings.DEFAULT_CONVERSATION_WEEKLY_MINUTES,
    )
    monthly_tokens_limit: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=settings.DEFAULT_MONTHLY_TOKENS_LIMIT,
    )
    # Billing identifiers and shared subscription access snapshot.
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subscription_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="none",
        # Values: "none" plus Stripe Subscription.status values used by Checkout.
    )
    subscription_ends_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    revenuecat_synced_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    trial_used: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    assessment_voice_trial_used: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    freemium_trial_ends_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    freemium_trial_used: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # GH Dil membership application. Existing rows are approved by default.
    membership_status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="approved", server_default="approved", index=True
    )
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    law_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    law_school: Mapped[str | None] = mapped_column(String(200), nullable=True)
    graduation_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    e_devlet_document_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    e_devlet_document_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    e_devlet_document_mime: Mapped[str | None] = mapped_column(String(100), nullable=True)
    kvkk_accepted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    application_submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    membership_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    membership_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    membership_reviewed_by: Mapped[int | None] = mapped_column(Integer, nullable=True)

    avatar: Mapped[str | None] = mapped_column(Text, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    learning_goals: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array string
    dismissed_dashboard_banner_revision: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=lambda: datetime.now(UTC).replace(tzinfo=None)
    )
    last_login: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    @property
    def document_name(self) -> str | None:
        return self.e_devlet_document_name

    @property
    def document_mime(self) -> str | None:
        return self.e_devlet_document_mime
