from datetime import datetime
from typing import Optional, List
import uuid
from sqlalchemy import (
    Text,
    Integer,
    Numeric,
    Boolean,
    DateTime,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    Index,
    func
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class Exam(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "exams"

    title: Mapped[str] = mapped_column(Text, nullable=False)
    test_type: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    config_version: Mapped[str] = mapped_column(Text, default="1.0", server_default="1.0", nullable=False)
    start_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(Text, default="draft", server_default="draft", nullable=False, index=True)

    __table_args__ = (
        CheckConstraint(test_type.in_(["academic", "general_training"]), name="ck_exams_test_type"),
        CheckConstraint(status.in_(["draft", "scheduled", "active", "archived"]), name="ck_exams_status"),
    )

    sections: Mapped[List["ExamSection"]] = relationship("ExamSection", back_populates="exam", cascade="all, delete-orphan", order_by="ExamSection.order_index")
    attempts: Mapped[List["Attempt"]] = relationship("Attempt", back_populates="exam")


class ExamSection(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "exam_sections"

    exam_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("exams.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    skill: Mapped[str] = mapped_column(Text, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    config: Mapped[dict] = mapped_column(JSONB, default=dict, server_default="{}", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.clock_timestamp(),
        nullable=False
    )

    __table_args__ = (
        CheckConstraint(skill.in_(["reading", "listening", "writing", "speaking"]), name="ck_exam_sections_skill"),
    )

    exam: Mapped["Exam"] = relationship("Exam", back_populates="sections")
    questions: Mapped[List["ExamSectionQuestion"]] = relationship("ExamSectionQuestion", back_populates="section", cascade="all, delete-orphan", order_by="ExamSectionQuestion.question_order")


class ExamSectionQuestion(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "exam_section_questions"

    exam_section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("exam_sections.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    question_order: Mapped[int] = mapped_column(Integer, default=1, server_default="1", nullable=False)
    allocated_marks: Mapped[float] = mapped_column(Numeric(5, 2), default=1.0, server_default="1.0", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.clock_timestamp(),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint("exam_section_id", "question_id", name="uq_section_question"),
        CheckConstraint("question_order > 0", name="ck_esq_order"),
        CheckConstraint("allocated_marks > 0", name="ck_esq_marks"),
    )

    section: Mapped["ExamSection"] = relationship("ExamSection", back_populates="questions")
    question: Mapped["Question"] = relationship("Question") # noqa: F821



class Attempt(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "attempts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    exam_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("exams.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    status: Mapped[str] = mapped_column(
        Text,
        default="in_progress",
        server_default="in_progress",
        nullable=False,
        index=True
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.clock_timestamp(),
        nullable=False
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    deadline_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    config_snapshot: Mapped[dict] = mapped_column(JSONB, default=dict, server_default="{}", nullable=False)

    __table_args__ = (
        CheckConstraint(status.in_(["in_progress", "submitted", "abandoned", "evaluated"]), name="ck_attempts_status"),
        Index(
            "idx_attempts_one_active_per_exam",
            user_id,
            exam_id,
            unique=True,
            postgresql_where=(status == "in_progress")
        ),
    )

    user: Mapped["User"] = relationship("User", back_populates="attempts") # noqa: F821
    exam: Mapped["Exam"] = relationship("Exam", back_populates="attempts")
    responses: Mapped[List["Response"]] = relationship("Response", back_populates="attempt", cascade="all, delete-orphan")
    scores: Mapped[List["Score"]] = relationship("Score", back_populates="attempt", cascade="all, delete-orphan")
    feedback_entries: Mapped[List["Feedback"]] = relationship("Feedback", back_populates="attempt", cascade="all, delete-orphan")


class Response(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "responses"

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("attempts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    response_json: Mapped[dict] = mapped_column(JSONB, nullable=False)
    saved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.clock_timestamp(),
        nullable=False
    )
    awarded_marks: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)

    __table_args__ = (
        UniqueConstraint("attempt_id", "question_id", name="uq_attempt_question"),
    )

    attempt: Mapped["Attempt"] = relationship("Attempt", back_populates="responses")
    question: Mapped["Question"] = relationship("Question", back_populates="responses") # noqa: F821


class Score(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "scores"

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("attempts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    skill: Mapped[str] = mapped_column(Text, nullable=False)
    raw_score: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)
    estimated_band: Mapped[Optional[float]] = mapped_column(Numeric(2, 1), nullable=True)
    scoring_version: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_label: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_unofficial: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.clock_timestamp(),
        nullable=False
    )

    __table_args__ = (
        CheckConstraint(skill.in_(["overall", "reading", "listening", "writing", "speaking"]), name="ck_scores_skill"),
        CheckConstraint("estimated_band >= 0.0 AND estimated_band <= 9.0", name="ck_scores_estimated_band"),
        CheckConstraint(confidence_label.in_(["supported", "limited", "insufficient_evidence"]), name="ck_scores_confidence"),
        UniqueConstraint("attempt_id", "skill", name="uq_attempt_skill_score"),
    )

    attempt: Mapped["Attempt"] = relationship("Attempt", back_populates="scores")


class Feedback(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "feedback"

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("attempts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    skill: Mapped[str] = mapped_column(Text, nullable=False)
    rubric_json: Mapped[dict] = mapped_column(JSONB, default=dict, server_default="{}", nullable=False)
    feedback_text: Mapped[str] = mapped_column(Text, nullable=False)
    model_version: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        Text,
        default="generated",
        server_default="generated",
        nullable=False
    )
    reviewer_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint(skill.in_(["reading", "listening", "writing", "speaking"]), name="ck_feedback_skill"),
        CheckConstraint(status.in_(["generated", "reviewed", "published", "flagged"]), name="ck_feedback_status"),
        Index("idx_feedback_attempt_skill", attempt_id, skill),
    )

    attempt: Mapped["Attempt"] = relationship("Attempt", back_populates="feedback_entries")
