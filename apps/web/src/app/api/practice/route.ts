import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth/session";
import {
  getPracticeHubSummary,
  evaluateReadingSubmission,
  evaluateListeningSubmission,
  evaluateWritingSubmission,
  evaluateSpeakingSubmission,
  persistPracticeAttempt,
} from "@/server/services/practice.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const summary = await getPracticeHubSummary(user.id);
    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    const status = err.status || (err.message === "Authentication required" ? 401 : 500);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load practice hub summary." },
      { status }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required." },
        { status: 400 }
      );
    }

    if (action === "evaluate_reading") {
      const { answers = {}, stream = "academic", persist = true } = body;
      const evaluation = evaluateReadingSubmission(answers, stream);

      let savedAttemptId: string | null = null;
      if (persist) {
        const examId =
          stream === "academic"
            ? "11111111-1111-1111-1111-111111111111"
            : "11111111-1111-1111-1111-111111111112";

        const res = await persistPracticeAttempt(user.id, {
          examId,
          skill: "reading",
          answers,
          estimatedBand: evaluation.estimatedBand,
          feedbackText: `Scored ${evaluation.score}/${evaluation.total} (${evaluation.percentage}%) on ${stream} reading drill.`,
          rubricJson: evaluation,
          mistakes: evaluation.mistakesToRecord,
        });
        savedAttemptId = res.attemptId;
      }

      return NextResponse.json({
        success: true,
        evaluation,
        attemptId: savedAttemptId,
      });
    }

    if (action === "evaluate_listening") {
      const { answers = {}, persist = true } = body;
      const evaluation = evaluateListeningSubmission(answers);

      let savedAttemptId: string | null = null;
      if (persist) {
        const examId = "22222222-2222-2222-2222-222222222222";
        const res = await persistPracticeAttempt(user.id, {
          examId,
          skill: "listening",
          answers,
          estimatedBand: evaluation.estimatedBand,
          feedbackText: `Scored ${evaluation.score}/${evaluation.total} (${evaluation.percentage}%) on listening dialogue drill.`,
          rubricJson: evaluation,
          mistakes: evaluation.mistakesToRecord,
        });
        savedAttemptId = res.attemptId;
      }

      return NextResponse.json({
        success: true,
        evaluation,
        attemptId: savedAttemptId,
      });
    }

    if (action === "evaluate_writing") {
      const { task1Text = "", task2Text = "", isGT = false, persist = true } = body;
      const evaluation = evaluateWritingSubmission(task1Text, task2Text, isGT);

      let savedAttemptId: string | null = null;
      if (persist) {
        const examId = "33333333-3333-3333-3333-333333333333";
        const res = await persistPracticeAttempt(user.id, {
          examId,
          skill: "writing",
          answers: { task1: task1Text, task2: task2Text },
          estimatedBand: evaluation.compositeWritingBand,
          feedbackText: `Task 1: Band ${evaluation.task1.estimatedBand} (${evaluation.task1.wordCount} words). Task 2: Band ${evaluation.task2.estimatedBand} (${evaluation.task2.wordCount} words). Composite Writing Band: ${evaluation.compositeWritingBand}.`,
          rubricJson: evaluation,
        });
        savedAttemptId = res.attemptId;
      }

      return NextResponse.json({
        success: true,
        evaluation,
        attemptId: savedAttemptId,
      });
    }

    if (action === "evaluate_speaking") {
      const {
        recognizedTranscript = "",
        originalTranscript = "",
        studentEditedTranscript = "",
        durationSeconds = 0,
        persist = true,
      } = body;

      const speechText = (recognizedTranscript || originalTranscript || "").trim();

      const evaluation = evaluateSpeakingSubmission(
        speechText,
        studentEditedTranscript,
        durationSeconds
      );

      let savedAttemptId: string | null = null;
      if (persist) {
        const examId = "44444444-4444-4444-4444-444444444444";
        const res = await persistPracticeAttempt(user.id, {
          examId,
          skill: "speaking",
          answers: {
            recognizedTranscript: speechText,
            studentEditedTranscript,
            durationSeconds,
          },
          estimatedBand: evaluation.estimatedBand, // null
          feedbackText: `Speaking Part 2 practice turn recorded for ${durationSeconds} seconds. Partial diagnostic generated for Fluency, Lexical Resource, and Grammar. Overall band withheld (Pronunciation uncalibrated).`,
          rubricJson: evaluation,
        });
        savedAttemptId = res.attemptId;
      }

      return NextResponse.json({
        success: true,
        evaluation,
        attemptId: savedAttemptId,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported action: ${action}` },
      { status: 400 }
    );
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process practice evaluation." },
      { status: err.status || 500 }
    );
  }
}
