from datetime import date
from typing import Optional
import uuid
from sqlalchemy import (
    Text,
    Date,
    Integer,
    Boolean,
    ForeignKey,
    CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class StudyPlan(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "study_plans"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    plan_version: Mapped[int] = mapped_column(Integer, default=1, server_default="1", nullable=False)
    week_start: Mapped[date] = mapped_column(Date, nullable=False)
    plan_json: Mapped[dict] = mapped_column(JSONB, default=dict, server_default="{}", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="study_plans") # noqa: F821


class MistakeNote(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "mistake_notes"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    source_attempt: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("attempts.id", ondelete="SET NULL"),
        nullable=True
    )
    question_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="SET NULL"),
        nullable=True
    )
    skill: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    error_tag: Mapped[str] = mapped_column(Text, nullable=False)
    user_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    original_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    correct_reasoning: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retry_status: Mapped[str] = mapped_column(
        Text,
        default="pending",
        server_default="pending",
        nullable=False,
        index=True
    )

    __table_args__ = (
        CheckConstraint(skill.in_(["reading", "listening", "writing", "speaking"]), name="ck_mistake_notes_skill"),
        CheckConstraint(retry_status.in_(["pending", "mastered", "retest_needed"]), name="ck_mistake_notes_retry_status"),
    )

    user: Mapped["User"] = relationship("User", back_populates="mistake_notes") # noqa: F821
    attempt: Mapped[Optional["Attempt"]] = relationship("Attempt") # noqa: F821
    question: Mapped[Optional["Question"]] = relationship("Question") # noqa: F821
