from datetime import datetime
from typing import Optional, List
import uuid
from sqlalchemy import (
    Text,
    Integer,
    DateTime,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    Computed,
    func
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from ..base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class ContentSource(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "content_sources"

    title: Mapped[str] = mapped_column(Text, nullable=False)
    source_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    owner: Mapped[str] = mapped_column(Text, nullable=False)
    permission_status: Mapped[str] = mapped_column(Text, nullable=False)
    source_type: Mapped[str] = mapped_column(Text, nullable=False)
    skill: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    test_type: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    locale: Mapped[str] = mapped_column(Text, default="en", server_default="en", nullable=False)
    version: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    next_review_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(Text, default="draft", server_default="draft", nullable=False)

    __table_args__ = (
        CheckConstraint(
            permission_status.in_(["owned", "licensed", "link_only", "pending", "prohibited"]),
            name="ck_content_sources_permission"
        ),
        CheckConstraint(
            source_type.in_(["official_guidance", "original_lesson", "internal_policy", "sample_answer"]),
            name="ck_content_sources_type"
        ),
        CheckConstraint(
            status.in_(["draft", "approved", "published", "retired"]),
            name="ck_content_sources_status"
        ),
        CheckConstraint(
            "status <> 'published' OR permission_status IN ('owned', 'licensed', 'link_only')",
            name="publishable_only"
        ),
    )

    chunks: Mapped[List["ContentChunk"]] = relationship(
        "ContentChunk",
        back_populates="source",
        cascade="all, delete-orphan",
        order_by="ContentChunk.chunk_no"
    )


class ContentChunk(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "content_chunks"

    source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("content_sources.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    chunk_no: Mapped[int] = mapped_column(Integer, nullable=False)
    heading_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, server_default="{}", nullable=False)
    content_hash: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[Optional[List[float]]] = mapped_column(Vector(1536), nullable=True)
    fts: Mapped[Optional[str]] = mapped_column(
        TSVECTOR,
        Computed("to_tsvector('simple', content)", persisted=True),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.clock_timestamp(),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint("source_id", "chunk_no", "content_hash", name="uq_chunk_version"),
    )

    source: Mapped["ContentSource"] = relationship("ContentSource", back_populates="chunks")


class TutorReport(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "tutor_reports"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    request_id: Mapped[str] = mapped_column(Text, nullable=False)
    user_query: Mapped[str] = mapped_column(Text, nullable=False)
    tutor_response: Mapped[str] = mapped_column(Text, nullable=False)
    cited_sources: Mapped[dict] = mapped_column(JSONB, default=list, server_default="[]", nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    user_comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        Text,
        default="pending",
        server_default="pending",
        nullable=False,
        index=True
    )
    reviewer_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.clock_timestamp(),
        nullable=False
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        CheckConstraint(
            reason.in_(["incorrect_facts", "harmful_content", "hallucinated_citation", "irrelevant", "other"]),
            name="ck_tutor_reports_reason"
        ),
        CheckConstraint(
            status.in_(["pending", "reviewed", "resolved", "dismissed"]),
            name="ck_tutor_reports_status"
        ),
    )

    user: Mapped["User"] = relationship("User") # noqa: F821
