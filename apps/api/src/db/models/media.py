from datetime import datetime
from typing import Optional
import uuid
from sqlalchemy import (
    Text,
    BigInteger,
    Integer,
    DateTime,
    ForeignKey,
    CheckConstraint,
    func
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..base import Base, UUIDPrimaryKeyMixin

class MediaAsset(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "media_assets"

    object_key: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    mime_type: Mapped[str] = mapped_column(Text, nullable=False)
    transcript_ref: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    license_status: Mapped[str] = mapped_column(Text, nullable=False)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    retention_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, server_default="{}", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.clock_timestamp(),
        nullable=False
    )

    __table_args__ = (
        CheckConstraint(license_status.in_(["owned", "licensed", "public_domain", "pending", "prohibited"]), name="ck_media_assets_license"),
    )


class Recording(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "recordings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    attempt_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("attempts.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    question_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="SET NULL"),
        nullable=True
    )
    object_key: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    duration_s: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    consent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("consents.id", ondelete="SET NULL"),
        nullable=True
    )
    retention_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.clock_timestamp(),
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="recordings") # noqa: F821
    attempt: Mapped[Optional["Attempt"]] = relationship("Attempt") # noqa: F821
    question: Mapped[Optional["Question"]] = relationship("Question") # noqa: F821
