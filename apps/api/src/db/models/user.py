from datetime import date, datetime
from typing import Optional, List
import uuid
from sqlalchemy import (
    String,
    Text,
    Date,
    Integer,
    Numeric,
    DateTime,
    ForeignKey,
    CheckConstraint,
    func
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False, index=True)
    auth_subject: Mapped[Optional[str]] = mapped_column(Text, unique=True, nullable=True)
    role: Mapped[str] = mapped_column(
        Text,
        default="student",
        server_default="student",
        nullable=False
    )
    status: Mapped[str] = mapped_column(
        Text,
        default="active",
        server_default="active",
        nullable=False,
        index=True
    )

    __table_args__ = (
        CheckConstraint(role.in_(["student", "content_creator", "reviewer", "admin"]), name="ck_users_role"),
        CheckConstraint(status.in_(["active", "pending_verification", "suspended", "deleted"]), name="ck_users_status"),
    )

    # Relationships
    profile: Mapped[Optional["Profile"]] = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    consents: Mapped[List["Consent"]] = relationship("Consent", back_populates="user", cascade="all, delete-orphan")
    attempts: Mapped[List["Attempt"]] = relationship("Attempt", back_populates="user", cascade="all, delete-orphan") # noqa: F821
    study_plans: Mapped[List["StudyPlan"]] = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan") # noqa: F821
    mistake_notes: Mapped[List["MistakeNote"]] = relationship("MistakeNote", back_populates="user", cascade="all, delete-orphan") # noqa: F821
    recordings: Mapped[List["Recording"]] = relationship("Recording", back_populates="user", cascade="all, delete-orphan") # noqa: F821


class Profile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    test_type: Mapped[str] = mapped_column(
        Text,
        default="academic",
        server_default="academic",
        nullable=False
    )
    target_band: Mapped[Optional[float]] = mapped_column(Numeric(2, 1), nullable=True)
    target_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    daily_minutes: Mapped[int] = mapped_column(Integer, default=60, server_default="60", nullable=False)
    timezone: Mapped[str] = mapped_column(Text, default="UTC", server_default="UTC", nullable=False)
    ui_language: Mapped[str] = mapped_column(Text, default="en", server_default="en", nullable=False)

    __table_args__ = (
        CheckConstraint(test_type.in_(["academic", "general_training"]), name="ck_profiles_test_type"),
        CheckConstraint("target_band >= 0.0 AND target_band <= 9.0", name="ck_profiles_target_band"),
        CheckConstraint("daily_minutes > 0", name="ck_profiles_daily_minutes"),
        CheckConstraint(ui_language.in_(["en", "bn"]), name="ck_profiles_ui_language"),
    )

    user: Mapped["User"] = relationship("User", back_populates="profile")


class Consent(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "consents"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    type: Mapped[str] = mapped_column(Text, nullable=False)
    policy_version: Mapped[str] = mapped_column(Text, nullable=False)
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.clock_timestamp(),
        nullable=False
    )
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, server_default="{}", nullable=False)

    __table_args__ = (
        CheckConstraint(type.in_(["recording", "ai_processing", "model_improvement", "terms_and_privacy"]), name="ck_consents_type"),
    )

    user: Mapped["User"] = relationship("User", back_populates="consents")
