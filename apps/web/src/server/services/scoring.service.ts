/**
 * BandBloom Centralized IELTS Scoring & Assessment Engine
 * Adheres strictly to Section 5.3 & Appendix A #4 of the Blueprint
 */

export interface RawScoreConversion {
  raw: number;
  band: number;
}

export const ACADEMIC_READING_TABLE: [number, number, number][] = [
  // [minRaw, maxRaw, band]
  [39, 40, 9.0],
  [37, 38, 8.5],
  [35, 36, 8.0],
  [33, 34, 7.5],
  [30, 32, 7.0],
  [27, 29, 6.5],
  [23, 26, 6.0],
  [19, 22, 5.5],
  [15, 18, 5.0],
  [13, 14, 4.5],
  [10, 12, 4.0],
  [8, 9, 3.5],
  [6, 7, 3.0],
  [4, 5, 2.5],
  [0, 3, 2.0],
];

export const GENERAL_READING_TABLE: [number, number, number][] = [
  [40, 40, 9.0],
  [39, 39, 8.5],
  [37, 38, 8.0],
  [36, 36, 7.5],
  [34, 35, 7.0],
  [32, 33, 6.5],
  [30, 31, 6.0],
  [27, 29, 5.5],
  [23, 26, 5.0],
  [19, 22, 4.5],
  [15, 18, 4.0],
  [12, 14, 3.5],
  [9, 11, 3.0],
  [6, 8, 2.5],
  [0, 5, 2.0],
];

export const LISTENING_TABLE: [number, number, number][] = [
  [39, 40, 9.0],
  [37, 38, 8.5],
  [35, 36, 8.0],
  [32, 34, 7.5],
  [30, 31, 7.0],
  [26, 29, 6.5],
  [23, 25, 6.0],
  [18, 22, 5.5],
  [16, 17, 5.0],
  [13, 15, 4.5],
  [10, 12, 4.0],
  [8, 9, 3.5],
  [6, 7, 3.0],
  [4, 5, 2.5],
  [0, 3, 2.0],
];

/**
 * Official IELTS Band Score Rounding
 * - Fraction < 0.25 -> floor to whole band (.0)
 * - Fraction >= 0.25 and < 0.75 -> round to half band (.5)
 * - Fraction >= 0.75 -> ceil to next whole band (1.0)
 */
export function roundIELTSBand(rawAvg: number | null | undefined): number | null {
  if (rawAvg === null || rawAvg === undefined || isNaN(rawAvg)) {
    return null;
  }
  const wholePart = Math.floor(rawAvg);
  const fractionPart = Math.round((rawAvg - wholePart) * 1000) / 1000;

  if (fractionPart < 0.25) {
    return Number(wholePart.toFixed(1));
  } else if (fractionPart < 0.75) {
    return Number((wholePart + 0.5).toFixed(1));
  } else {
    return Number((wholePart + 1.0).toFixed(1));
  }
}

/**
 * Calculate overall band score from 4 skill components.
 * Returns null if any of the 4 components is null or undefined.
 */
export function calculateOverallBand(
  listening: number | null | undefined,
  reading: number | null | undefined,
  writing: number | null | undefined,
  speaking: number | null | undefined
): number | null {
  if (
    listening === null ||
    listening === undefined ||
    reading === null ||
    reading === undefined ||
    writing === null ||
    writing === undefined ||
    speaking === null ||
    speaking === undefined
  ) {
    return null;
  }
  const avg = (listening + reading + writing + speaking) / 4.0;
  return roundIELTSBand(avg);
}

export function rawMarksToBand(
  raw: number,
  skill: "reading" | "listening",
  testType: "academic" | "general_training" = "academic"
): number {
  const table =
    skill === "listening"
      ? LISTENING_TABLE
      : testType === "general_training"
      ? GENERAL_READING_TABLE
      : ACADEMIC_READING_TABLE;

  for (const [min, max, band] of table) {
    if (raw >= min && raw <= max) {
      return band;
    }
  }
  return 0.0;
}

/**
 * Normalizes text response for objective comparison
 */
export function normalizeAnswerText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Evaluates student answer against official answer key / options
 */
export function evaluateObjectiveAnswer(
  questionType: string,
  studentAnswer: string | null | undefined,
  correctAnswer: string,
  validOptions?: string[]
): { isCorrect: boolean; awardedMarks: number } {
  if (!studentAnswer || !studentAnswer.trim()) {
    return { isCorrect: false, awardedMarks: 0 };
  }

  const normStudent = normalizeAnswerText(studentAnswer);
  const normCorrect = normalizeAnswerText(correctAnswer);

  if (
    questionType === "true_false_not_given" ||
    questionType === "True/False/Not Given" ||
    questionType === "yes_no_not_given" ||
    questionType === "Yes/No/Not Given"
  ) {
    // Normalization for TFNG
    const tfngMap: Record<string, string> = {
      t: "true",
      true: "true",
      f: "false",
      false: "false",
      ng: "not given",
      notgiven: "not given",
      "not given": "not given",
      y: "yes",
      yes: "yes",
      n: "no",
      no: "no",
    };
    const sVal = tfngMap[normStudent] || normStudent;
    const cVal = tfngMap[normCorrect] || normCorrect;
    const isCorrect = sVal === cVal;
    return { isCorrect, awardedMarks: isCorrect ? 1.0 : 0.0 };
  }

  if (questionType === "multiple_choice" || questionType === "matching") {
    const isCorrect = normStudent === normCorrect;
    return { isCorrect, awardedMarks: isCorrect ? 1.0 : 0.0 };
  }

  // Completion / short answer
  if (normStudent === normCorrect) {
    return { isCorrect: true, awardedMarks: 1.0 };
  }

  // Check valid alternate options if provided (e.g. ['15', '15 degrees', 'fifteen'])
  if (validOptions && validOptions.length > 0) {
    for (const opt of validOptions) {
      if (normStudent === normalizeAnswerText(opt)) {
        return { isCorrect: true, awardedMarks: 1.0 };
      }
    }
  }

  return { isCorrect: false, awardedMarks: 0.0 };
}
