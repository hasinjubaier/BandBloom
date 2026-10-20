from datetime import datetime
from typing import Optional
import uuid
from sqlalchemy import (
    Text,
    Integer,
    DateTime,
    ForeignKey,
    CheckConstraint,
    func
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class AiJob(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "ai_jobs"

    type: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    attempt_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("attempts.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    status: Mapped[str] = mapped_column(
        Text,
        default="pending",
        server_default="pending",
        nullable=False,
        index=True
    )
    retry_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)
    max_retries: Mapped[int] = mapped_column(Integer, default=3, server_default="3", nullable=False)
    error_code: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    payload: Mapped[dict] = mapped_column(JSONB, default=dict, server_default="{}", nullable=False)
    result: Mapped[dict] = mapped_column(JSONB, default=dict, server_default="{}", nullable=False)

    __table_args__ = (
        CheckConstraint(
            type.in_(["writing_feedback", "speaking_transcription", "speaking_feedback", "rag_indexing"]),
            name="ck_ai_jobs_type"
        ),
        CheckConstraint(
            status.in_(["pending", "processing", "completed", "failed", "retrying"]),
            name="ck_ai_jobs_status"
        ),
    )

    attempt: Mapped[Optional["Attempt"]] = relationship("Attempt") # noqa: F821


class AuditLog(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "audit_logs"

    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    action: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    entity_type: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, server_default="{}", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.clock_timestamp(),
        nullable=False,
        index=True
    )

    actor: Mapped[Optional["User"]] = relationship("User") # noqa: F821
