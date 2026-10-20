from typing import Optional, List
import uuid
from sqlalchemy import (
    Text,
    Integer,
    Boolean,
    ForeignKey,
    CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class Lesson(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "lessons"

    skill: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    level: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    module_type: Mapped[str] = mapped_column(Text, default="both", server_default="both", nullable=False)
    content_version: Mapped[str] = mapped_column(Text, default="1.0", server_default="1.0", nullable=False)
    status: Mapped[str] = mapped_column(Text, default="draft", server_default="draft", nullable=False, index=True)
    content: Mapped[dict] = mapped_column(JSONB, default=dict, server_default="{}", nullable=False)

    __table_args__ = (
        CheckConstraint(skill.in_(["reading", "listening", "writing", "speaking", "general"]), name="ck_lessons_skill"),
        CheckConstraint(level.in_(["beginner", "intermediate", "advanced"]), name="ck_lessons_level"),
        CheckConstraint(module_type.in_(["academic", "general_training", "both"]), name="ck_lessons_module_type"),
        CheckConstraint(status.in_(["draft", "approved", "published", "retired"]), name="ck_lessons_status"),
    )


class Question(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "questions"

    skill: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    type: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    module: Mapped[str] = mapped_column(Text, default="both", server_default="both", nullable=False, index=True)
    difficulty: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    context_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    media_asset_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("media_assets.id", ondelete="SET NULL"),
        nullable=True
    )
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rights_status: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, default="draft", server_default="draft", nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, default=1, server_default="1", nullable=False)

    __table_args__ = (
        CheckConstraint(skill.in_(["reading", "listening", "writing", "speaking"]), name="ck_questions_skill"),
        CheckConstraint(type.in_([
            "multiple_choice",
            "true_false_not_given",
            "yes_no_not_given",
            "matching",
            "completion",
            "short_answer",
            "diagram_label",
            "task1_writing",
            "task2_writing",
            "part1_speaking",
            "part2_speaking",
            "part3_speaking"
        ]), name="ck_questions_type"),
        CheckConstraint(module.in_(["academic", "general_training", "both"]), name="ck_questions_module"),
        CheckConstraint(difficulty.in_(["easy", "medium", "hard"]), name="ck_questions_difficulty"),
        CheckConstraint(rights_status.in_(["owned", "licensed", "link_only", "pending", "prohibited"]), name="ck_questions_rights_status"),
        CheckConstraint(status.in_(["draft", "approved", "published", "retired"]), name="ck_questions_status"),
    )

    # Relationships
    options: Mapped[List["QuestionOption"]] = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")
    media_asset: Mapped[Optional["MediaAsset"]] = relationship("MediaAsset") # noqa: F821
    responses: Mapped[List["Response"]] = relationship("Response", back_populates="question") # noqa: F821


class QuestionOption(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "question_options"

    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    option_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    option_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    question: Mapped["Question"] = relationship("Question", back_populates="options")
