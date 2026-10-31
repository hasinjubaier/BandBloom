/**
 * BandBloom IELTS SaaS - Listening Module Core Domain & Data Library
 * 
 * Provides:
 * 1. Authoritative IELTS Listening specifications & 4-part structure (identical for Academic & GT).
 * 2. Indicative Raw Score Conversion Table (Band 9.0 to Band 4.0) with official disclaimer.
 * 3. 13 Official IELTS Listening Question Types Library with strategies, trap warnings, and micro-drills.
 * 4. Calibrated Practice Audio Transcripts, Timestamped Segments, and 40 Valid Scoreable Questions.
 * 5. Robust IELTS Listening Answer Normalization, Word-Limit Enforcement & Marking Engine.
 * 6. Honest Synthetic Practice Audio Disclosures.
 */

export type ListeningQuestionCategory = "Completion" | "Multiple Choice" | "Matching" | "Labelling";
export type ListeningPartNumber = 1 | 2 | 3 | 4;

export interface ScoreBandTier {
  band: number;
  rawScoreRange: string;
  minCorrect: number;
  maxCorrect: number;
  description: string;
}

export interface IndicativeScoreGuide {
  skill: "listening";
  totalQuestions: number;
  testDurationMinutes: number;
  reviewDurationMinutes: number;
  formatDescription: string;
  sourceVersion: string;
  disclaimer: string;
  tiers: ScoreBandTier[];
}

export interface ListeningQuestionTypeDefinition {
  id: string;
  name: string;
  category: ListeningQuestionCategory;
  typicalParts: ListeningPartNumber[];
  shortExplanation: string;
  skillAssessed: string;
  strategy: string;
  commonMistakes: string[];
  wordLimitRule?: string;
  formatHonestyNotice?: string;
  sampleQuestion: {
    instruction: string;
    audioTranscriptExcerpt: string;
    spokenCueTimestamp: string;
    prompt: string;
    options?: string[];
    correctAnswer: string;
    acceptedVariants?: string[];
    explanation: string;
  };
}

export interface ListeningTranscriptSegment {
  speaker: string;
  startTime: string;
  endTime: string;
  text: string;
  questionRef?: string;
}

export interface ListeningQuestionItem {
  id: string;
  number: number;
  partNumber: ListeningPartNumber;
  typeId: string;
  typeLabel: string;
  prompt: string;
  instruction?: string;
  options?: string[];
  correctAnswer: string;
  acceptedVariants?: string[];
  maxWords?: number;
  allowNumber?: boolean;
  maxNumbers?: number;
  wordLimitRule?: string;
  transcriptTimestamp: string;
  evidenceQuote: string;
  explanation: string;
  distractorTrap: string;
  strategyTip: string;
}

export interface ListeningPartData {
  partNumber: ListeningPartNumber;
  title: string;
  context: string;
  speakers: string;
  description: string;
  audioTitle: string;
  audioDurationSeconds: number;
  accent: string;
  provenance: string;
  syntheticNotice: string;
  fullTranscript: string;
  transcriptSegments: ListeningTranscriptSegment[];
  questions: ListeningQuestionItem[];
  // Phase 2 & 3 Audio Asset & Provenance Metadata
  audioUrl: string;
  audioObjectKey: string;
  audioMimeType: string;
  audioFileSizeBytes: number;
  audioSha256: string;
  isSynthetic: boolean;
  ttsProvider: string;
  voiceName: string;
  voiceLanguage: string;
  voiceProvenance: string;
  contentVersion: string;
}

// ============================================================================
// 1. INDICATIVE RAW SCORE GUIDE (BAND 9.0 DOWN TO BAND 4.0)
// ============================================================================

export const LISTENING_RAW_SCORE_GUIDE: IndicativeScoreGuide = {
  skill: "listening",
  totalQuestions: 40,
  testDurationMinutes: 30,
  reviewDurationMinutes: 2,
  formatDescription:
    "4 recorded sections played ONCE only. 40 total questions. Standard test structure is identical for Academic and General Training candidates.",
  sourceVersion: "2026.1",
  disclaimer:
    "BandBloom IELTS Listening raw-score band indicators are diagnostic estimates based on published historical scoring patterns. Official IELTS test forms are equated by Cambridge Assessment English / IDP to account for minor fluctuations in form difficulty; exact boundary scores may vary slightly between test dates.",
  tiers: [
    {
      band: 9.0,
      rawScoreRange: "39 - 40",
      minCorrect: 39,
      maxCorrect: 40,
      description: "Expert User: Fluent, comprehensive understanding of complex arguments and rapid native speech.",
    },
    {
      band: 8.5,
      rawScoreRange: "37 - 38",
      minCorrect: 37,
      maxCorrect: 38,
      description: "Very Good User (High): Handles complex, detailed academic debates and nuanced implicit meanings.",
    },
    {
      band: 8.0,
      rawScoreRange: "35 - 36",
      minCorrect: 35,
      maxCorrect: 36,
      description: "Very Good User: Operational command with only occasional unsystematic inaccuracies or misunderstandings.",
    },
    {
      band: 7.5,
      rawScoreRange: "32 - 34",
      minCorrect: 32,
      maxCorrect: 34,
      description: "Good User (High): Easily follows extended lectures and complex discussions, identifying subtle speaker stances.",
    },
    {
      band: 7.0,
      rawScoreRange: "30 - 31",
      minCorrect: 30,
      maxCorrect: 31,
      description: "Good User: Handles complex language well and understands detailed reasoning in standard accents.",
    },
    {
      band: 6.5,
      rawScoreRange: "26 - 29",
      minCorrect: 26,
      maxCorrect: 29,
      description: "Competent User (High): Generally effective command, though may misinterpret rapid speaker shifts or distractors.",
    },
    {
      band: 6.0,
      rawScoreRange: "23 - 25",
      minCorrect: 23,
      maxCorrect: 25,
      description: "Competent User: Understands direct information in familiar contexts; struggles with dense academic discourse.",
    },
    {
      band: 5.5,
      rawScoreRange: "18 - 22",
      minCorrect: 18,
      maxCorrect: 22,
      description: "Modest User (High): Partial command; grasps main ideas in straightforward situations with frequent misses.",
    },
    {
      band: 5.0,
      rawScoreRange: "16 - 17",
      minCorrect: 16,
      maxCorrect: 17,
      description: "Modest User: Handles basic message transfer in everyday topics; frequent breakdown in academic lectures.",
    },
    {
      band: 4.5,
      rawScoreRange: "13 - 15",
      minCorrect: 13,
      maxCorrect: 15,
      description: "Limited User (High): Basic comprehension limited to very familiar everyday social situations.",
    },
    {
      band: 4.0,
      rawScoreRange: "11 - 12",
      minCorrect: 11,
      maxCorrect: 12,
      description: "Limited User: Basic competence is limited to familiar situations; frequent problems in understanding.",
    },
  ],
};

export function getListeningBandFromScore(rawScore: number): {
  band: number | null;
  tierDescription: string;
  confidenceLabel: "supported" | "insufficient_evidence";
} {
  if (rawScore < 0 || rawScore > 40) {
    return {
      band: null,
      tierDescription: "Invalid raw score.",
      confidenceLabel: "insufficient_evidence",
    };
  }
  for (const tier of LISTENING_RAW_SCORE_GUIDE.tiers) {
    if (rawScore >= tier.minCorrect && rawScore <= tier.maxCorrect) {
      return {
        band: tier.band,
        tierDescription: tier.description,
        confidenceLabel: "supported",
      };
    }
  }
  return {
    band: 3.5,
    tierDescription: "Diagnostic score below Band 4.0 threshold (< 11 correct answers).",
    confidenceLabel: "supported",
  };
}

// ============================================================================
// 2. 13 OFFICIAL IELTS LISTENING QUESTION TYPES LIBRARY
// ============================================================================

export const LISTENING_QUESTION_TYPES: ListeningQuestionTypeDefinition[] = [
  {
    id: "form_completion",
    name: "Form Completion",
    category: "Completion",
    typicalParts: [1],
    shortExplanation:
      "Record factual details such as names, dates, addresses, vehicle plates, or currency amounts on a structured administrative form.",
    skillAssessed: "Listening for specific factual data, numbers, phone digits, and spelled-out surnames.",
    strategy:
      "1. Read the form prompts in the 30-second silence to predict grammar and expected data type (e.g., surname, postcode).\n2. Listen for letters spelled aloud and numbers grouped in standard patterns.\n3. Be alert for self-correction distractors (e.g., speaker changes date or spelling mid-sentence).\n4. Check word limits strictly.",
    commonMistakes: [
      "Missing letter alterations when speaker says 'Double L' or 'No, sorry, that is an E not an I'.",
      "Writing extra words that breach the word limit.",
      "Mishearing zero ('oh' vs 'zero' vs 'nought').",
    ],
    wordLimitRule: "NO MORE THAN TWO WORDS AND/OR A NUMBER",
    sampleQuestion: {
      instruction: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
      audioTranscriptExcerpt:
        "Officer: Can you confirm the street name? Liam: It is 14 Ravenscroft Road. That is R-A-V-E-N-S-C-R-O-F-T.",
      spokenCueTimestamp: "0:28",
      prompt: "Delivery Address: 14 [_____] Road",
      correctAnswer: "Ravenscroft",
      acceptedVariants: ["Ravenscroft", "ravenscroft"],
      explanation: "Liam explicitly spells out R-A-V-E-N-S-C-R-O-F-T after stating the address.",
    },
  },
  {
    id: "note_completion",
    name: "Note Completion",
    category: "Completion",
    typicalParts: [1, 2, 3, 4],
    shortExplanation:
      "Fill in gaps within bulleted or indented notes summarizing key facts or recommendations from the audio.",
    skillAssessed: "Identifying main points and specific factual details within structured note layouts.",
    strategy:
      "1. Use headings to navigate the audio stream.\n2. Identify the part of speech required for each blank (noun, adjective, verb).\n3. Keep words verbatim from the recording—do not paraphrase.",
    commonMistakes: [
      "Changing the word form heard in the audio (e.g., writing 'insulation' instead of 'insulated').",
      "Losing position in the audio when the speaker moves to the next bullet point.",
    ],
    wordLimitRule: "NO MORE THAN TWO WORDS",
    sampleQuestion: {
      instruction: "Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.",
      audioTranscriptExcerpt:
        "Director: All gym members must complete a brief safety induction lasting approximately thirty minutes before using weight machines.",
      spokenCueTimestamp: "1:15",
      prompt: "Requirement: Complete a mandatory 30-minute [_____] prior to gym equipment access.",
      correctAnswer: "safety induction",
      acceptedVariants: ["safety induction", "induction"],
      explanation: "The director specifies completing a brief 'safety induction' before using equipment.",
    },
  },
  {
    id: "table_completion",
    name: "Table Completion",
    category: "Completion",
    typicalParts: [1, 2, 3],
    shortExplanation:
      "Complete missing entries in a structured grid categorizing dates, events, costs, facilities, or criteria.",
    skillAssessed: "Tracking comparative categories across columns and rows in real time.",
    strategy:
      "1. Read column headers first, then scan horizontally and vertically to understand the relationship.\n2. Predict what category of data is missing in each cell.\n3. Listen for transition words indicating movement between table rows.",
    commonMistakes: [
      "Filling in details from the wrong column or category.",
      "Including units of measurement when they are already printed in the column header.",
    ],
    wordLimitRule: "NO MORE THAN ONE WORD AND/OR A NUMBER",
    sampleQuestion: {
      instruction: "Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
      audioTranscriptExcerpt:
        "Receptionist: The beginner swim coaching occurs every Tuesday at 6 pm, with a lane fee of eight pounds per session.",
      spokenCueTimestamp: "0:45",
      prompt: "Swim Class (Tuesday 6 pm) - Fee: £[_____]",
      correctAnswer: "8",
      acceptedVariants: ["8", "eight"],
      explanation: "The fee stated is eight pounds; since the currency symbol is in the prompt, only '8' or 'eight' is needed.",
    },
  },
  {
    id: "flow_chart_completion",
    name: "Flow-chart Completion",
    category: "Completion",
    typicalParts: [3, 4],
    shortExplanation:
      "Complete the sequential steps of a scientific methodology, industrial process, or research pipeline.",
    skillAssessed: "Following stage-by-stage chronological order and identifying transitional markers.",
    strategy:
      "1. Scan the direction arrows to understand the linear flow of the procedure.\n2. Listen for signpost markers: 'initially', 'subsequently', 'following this step', 'in the final stage'.\n3. Note any conditional branches or dependencies.",
    commonMistakes: [
      "Jumping ahead when a speaker mentions a future phase before discussing the intermediate step.",
      "Writing a plural form when singular is required by the grammatical context.",
    ],
    wordLimitRule: "NO MORE THAN TWO WORDS",
    sampleQuestion: {
      instruction: "Complete the flow-chart below. Write NO MORE THAN TWO WORDS for each step.",
      audioTranscriptExcerpt:
        "Dr. Evans: Before processing telemetry figures, the automated script executes statistical outlier filtering to eliminate sensor anomalies.",
      spokenCueTimestamp: "2:10",
      prompt: "Stage 3: Execute [_____] to remove sensor anomalies.",
      correctAnswer: "outlier filtering",
      acceptedVariants: ["outlier filtering", "statistical outlier filtering"],
      explanation: "Dr. Evans describes the third processing stage as outlier filtering.",
    },
  },
  {
    id: "summary_completion",
    name: "Summary Completion",
    category: "Completion",
    typicalParts: [3, 4],
    shortExplanation:
      "Fill in gaps in a continuous paragraph summarizing a section of a dialogue or academic lecture.",
    skillAssessed: "Understanding synthesized ideas, paraphrasing, and grammatical agreement.",
    strategy:
      "1. Read the summary text carefully before the recording starts to grasp the overarching narrative.\n2. Pay close attention to synonyms and grammatical clues around each gap.\n3. Words inserted MUST come verbatim from the recording and fit the grammar of the sentence.",
    commonMistakes: [
      "Paraphrasing the speaker's exact words instead of extracting the exact token.",
      "Violating the word limit count.",
    ],
    wordLimitRule: "NO MORE THAN ONE WORD ONLY",
    sampleQuestion: {
      instruction: "Complete the summary below. Write ONE WORD ONLY for each answer.",
      audioTranscriptExcerpt:
        "Prof. Thorne: Marine biologists discovered that the acoustic beam is focused forward through a dense fatty organ called the melon.",
      spokenCueTimestamp: "1:42",
      prompt: "Echolocating cetaceans project acoustic clicks through a fatty fore-head organ called the [_____].",
      correctAnswer: "melon",
      acceptedVariants: ["melon"],
      explanation: "The lecture specifically names the fatty organ as the melon.",
    },
  },
  {
    id: "sentence_completion",
    name: "Sentence Completion",
    category: "Completion",
    typicalParts: [3, 4],
    shortExplanation:
      "Complete standalone sentences extracted from an academic talk, ensuring factual and grammatical accuracy.",
    skillAssessed: "Detailed listening for specific academic terminology and core assertions.",
    strategy:
      "1. Underline key keywords in the sentence stem.\n2. Anticipate the word class (e.g., abstract noun, technical descriptor).\n3. Keep your focus steady because sentence completion questions often occur close together.",
    commonMistakes: [
      "Misspelling technical terms.",
      "Failing to notice negatives (e.g., 'rarely', 'unlikely', 'contrary to').",
    ],
    wordLimitRule: "NO MORE THAN TWO WORDS",
    sampleQuestion: {
      instruction: "Complete the sentences below. Write NO MORE THAN TWO WORDS for each answer.",
      audioTranscriptExcerpt:
        "Prof. Thorne: High-intensity naval sonar exercises have been shown to trigger severe decompression sickness in beaked whales.",
      spokenCueTimestamp: "3:05",
      prompt: "Deep-diving beaked whales suffer decompression sickness primarily during naval [_____] exercises.",
      correctAnswer: "sonar",
      acceptedVariants: ["sonar", "naval sonar"],
      explanation: "The professor directly links decompression sickness to naval sonar exercises.",
    },
  },
  {
    id: "short_answer",
    name: "Short-Answer Questions",
    category: "Completion",
    typicalParts: [1, 2, 4],
    shortExplanation:
      "Answer direct factual inquiries using concise words or numbers extracted directly from the recording.",
    skillAssessed: "Locating answers to specific interrogatives (Who, What, Where, When, How much).",
    strategy:
      "1. Identify the question word and highlight what piece of information is requested.\n2. Disregard background anecdotes and focus on the answer to the prompt.\n3. Do not write in full sentences—only supply the requested factual tokens.",
    commonMistakes: [
      "Writing full sentences which violate the word limit.",
      "Writing conversational filler words (e.g. 'about', 'around').",
    ],
    wordLimitRule: "NO MORE THAN TWO WORDS AND/OR A NUMBER",
    sampleQuestion: {
      instruction: "Answer the question below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER.",
      audioTranscriptExcerpt:
        "Liam: Which bus stop is closest to the accommodation entrance? Sarah: That would be the Elm Street stop, right outside the pharmacy.",
      spokenCueTimestamp: "0:58",
      prompt: "What is the name of the bus stop closest to the student residence?",
      correctAnswer: "Elm Street",
      acceptedVariants: ["Elm Street", "elm street"],
      explanation: "Sarah indicates the closest stop is Elm Street.",
    },
  },
  {
    id: "multiple_choice_single",
    name: "Multiple Choice (Single Answer)",
    category: "Multiple Choice",
    typicalParts: [2, 3],
    shortExplanation:
      "Select the single correct option (A, B, or C) that answers a question or completes a sentence stem.",
    skillAssessed: "Distinguishing primary arguments and speaker attitudes from tempting distractors.",
    strategy:
      "1. Read the stem first to understand the question focus.\n2. Underline distinguishing differences between the options (not common words).\n3. Listen for qualifying language ('initially we thought', 'however', 'on the other hand').\n4. Speakers will usually mention ALL THREE options; only one is factually correct in context.",
    commonMistakes: [
      "Choosing an option simply because you hear the exact words spoken (often used as a trap).",
      "Failing to wait for the speaker's final confirmation or agreement.",
    ],
    sampleQuestion: {
      instruction: "Choose the correct letter, A, B, or C.",
      audioTranscriptExcerpt:
        "Jack: I initially thought the telemetry failure was due to low battery voltage. Elena: But your bench test proved the battery was fine, right? Jack: Yes, it turned out water ingress through the rubber gasket was the actual problem.",
      spokenCueTimestamp: "1:32",
      prompt: "What was the actual cause of the telemetry failure?",
      options: [
        "A: Insufficient battery voltage",
        "B: Water ingress through a gasket",
        "C: Software communication timeout",
      ],
      correctAnswer: "B",
      acceptedVariants: ["B", "b", "Water ingress through a gasket"],
      explanation: "While battery voltage (A) was initially suspected, Jack confirms water ingress (B) was the actual problem.",
    },
  },
  {
    id: "multiple_choice_multi",
    name: "Multiple Choice (Multiple Answers)",
    category: "Multiple Choice",
    typicalParts: [2, 3],
    shortExplanation:
      "Select two or three correct options from a list of five or more possibilities (e.g., Choose TWO).",
    skillAssessed: "Evaluating multiple criteria and identifying confirmed items from an extensive catalog.",
    strategy:
      "1. Check how many letters are required (e.g., 'Choose TWO letters, A-E').\n2. Note that each correct letter counts as one mark in standard IELTS.\n3. Track the discussion systematically through the list.\n4. Eliminate options where the speaker expresses doubt or disqualifies an option.",
    commonMistakes: [
      "Selecting only one option when two are asked for.",
      "Confusing suggestions that were rejected with agreed decisions.",
    ],
    sampleQuestion: {
      instruction: "Choose TWO letters, A-E.",
      audioTranscriptExcerpt:
        "Dr. Evans: For the renewable field study, university insurance requires both a signed risk assessment and verified cold-weather protective gear. Student laptops are optional.",
      spokenCueTimestamp: "2:40",
      prompt: "Which TWO items are mandatory under university field study regulations?",
      options: [
        "A: Signed risk assessment",
        "B: GPS satellite beacon",
        "C: Verified protective gear",
        "D: High-powered drone",
        "E: Personal laptop",
      ],
      correctAnswer: "A, C",
      acceptedVariants: ["A, C", "A,C", "C, A", "C,A", "AC", "CA"],
      explanation: "Dr. Evans specifies the signed risk assessment (A) and cold-weather protective gear (C) as mandatory.",
    },
  },
  {
    id: "matching_features",
    name: "Matching Features & Opinions",
    category: "Matching",
    typicalParts: [2, 3],
    shortExplanation:
      "Match a numbered list of items to a set of categories, opinions, people, or time periods.",
    skillAssessed: "Attributing specific opinions, duties, or findings to designated speakers or entities.",
    strategy:
      "1. Read the list of lettered options first (usually fewer than the questions).\n2. Listen for speaker names or topic anchors to know which question is being addressed.\n3. Options can sometimes be used more than once if instructions state 'NB: You may use any letter more than once'.",
    commonMistakes: [
      "Associating an opinion with the speaker who simply summarized it rather than held it.",
      "Failing to track synonymous expressions of the category letters.",
    ],
    sampleQuestion: {
      instruction: "Match each research task with the responsible person: E (Elena), J (Jack), or B (Both).",
      audioTranscriptExcerpt:
        "Elena: I will handle the acoustic calibration in the marine tank, while Jack can run the historical weather models. Jack: Sounds good, and we can both draft the progress report together on Friday.",
      spokenCueTimestamp: "3:10",
      prompt: "Who will conduct the acoustic calibration in the marine tank?",
      options: ["A: Elena", "B: Jack", "C: Both students"],
      correctAnswer: "A",
      acceptedVariants: ["A", "a", "Elena"],
      explanation: "Elena explicitly states: 'I will handle the acoustic calibration in the marine tank.'",
    },
  },
  {
    id: "plan_labelling",
    name: "Plan Labelling",
    category: "Labelling",
    typicalParts: [2],
    shortExplanation:
      "Label specific rooms, entrances, or safety equipment on an architectural floor plan of a building.",
    skillAssessed: "Following indoor spatial directions and navigational cues.",
    strategy:
      "1. Identify the starting point indicated by the speaker ('We are currently standing in the main lobby').\n2. Note relative directions: 'on your right', 'down the corridor', 'second door on the left', 'opposite the stairs'.\n3. Trace the speaker's path with your finger or cursor on the screen.",
    commonMistakes: [
      "Losing orientation when the speaker turns around ('As you face the courtyard...').",
      "Confusing left and right based on speaker perspective versus observer perspective.",
    ],
    sampleQuestion: {
      instruction: "Label the plan below. Choose the correct letter, A-D, for each room.",
      audioTranscriptExcerpt:
        "Director: Standing at the reception desk, the Olympic pool is directly ahead of you. If you take the corridor to your left, past the locker area, you will find the Squash Courts at the end on your right.",
      spokenCueTimestamp: "1:50",
      prompt: "Squash Courts location on the leisure centre plan:",
      options: [
        "A: Directly ahead of reception",
        "B: End of left corridor on the right",
        "C: Next to the cafeteria",
        "D: Outside the main entrance",
      ],
      correctAnswer: "B",
      acceptedVariants: ["B", "b"],
      explanation: "The director directs: 'take the corridor to your left, past the locker area, you will find the Squash Courts at the end on your right.'",
    },
  },
  {
    id: "map_labelling",
    name: "Map Labelling",
    category: "Labelling",
    typicalParts: [2],
    shortExplanation:
      "Label landmarks, trail intersections, or designated zones on an outdoor geographical map.",
    skillAssessed: "Navigating outdoor environments using compass orientations (North, South, East, West) and spatial landmarks.",
    strategy:
      "1. Check the compass rose immediately to orient yourself.\n2. Identify known reference landmarks: river, bridge, main gate, car park, crossroads.\n3. Listen for directional terms: 'north-east', 'adjacent to', 'bend in the path', 'over the footbridge'.",
    commonMistakes: [
      "Forgetting compass directions and assuming 'top' is always 'straight ahead'.",
      "Missing quick transitions across bridges or road junctions.",
    ],
    sampleQuestion: {
      instruction: "Write the correct letter, A-E, next to each location.",
      audioTranscriptExcerpt:
        "Guide: Cross the stone bridge heading east. Just beyond the bridge, immediately to your north, is the Heritage Orchard.",
      spokenCueTimestamp: "2:04",
      prompt: "Location of the Heritage Orchard:",
      options: [
        "A: North of the stone bridge after crossing east",
        "B: South of the car park",
        "C: West of the entrance gate",
        "D: Centre of the meadow",
      ],
      correctAnswer: "A",
      acceptedVariants: ["A", "a"],
      explanation: "The guide instructs to cross east and locate the orchard immediately to the north.",
    },
  },
  {
    id: "diagram_labelling",
    name: "Diagram Labelling",
    category: "Labelling",
    typicalParts: [3, 4],
    shortExplanation:
      "Label parts of an engineering tool, scientific apparatus, or anatomical structure based on an explanatory recording.",
    skillAssessed: "Understanding technical descriptions and visual-spatial mechanisms.",
    strategy:
      "1. Inspect the diagram to identify the moving or stationary components.\n2. Listen for descriptive adjectives describing shape, material, and position: 'cylindrical chamber', 'conical funnel', 'lower valve'.\n3. Verify words against strict word limits.",
    commonMistakes: [
      "Labeling the mechanism with the input material rather than the component name.",
      "Spelling errors in technical component words.",
    ],
    wordLimitRule: "NO MORE THAN TWO WORDS",
    sampleQuestion: {
      instruction: "Label the diagram below. Write NO MORE THAN TWO WORDS for each label.",
      audioTranscriptExcerpt:
        "Prof. Thorne: Echoing pulses return through the cetacean's lower jawbone, which contains a specialized acoustic fat channel conducting sound to the inner ear.",
      spokenCueTimestamp: "2:20",
      prompt: "Part 3: Echo receptor channel located within the [_____].",
      correctAnswer: "lower jawbone",
      acceptedVariants: ["lower jawbone", "jawbone"],
      explanation: "Prof. Thorne explains that returning pulses enter through the lower jawbone.",
    },
  },
];

// ============================================================================
// 3. 4 CALIBRATED LISTENING PARTS (40 QUESTIONS TOTAL)
// ============================================================================

export const LISTENING_PARTS: ListeningPartData[] = [
  // --------------------------------------------------------------------------
  // PART 1: Everyday Social Conversation (Housing Accommodation Enquiry)
  // --------------------------------------------------------------------------
  {
    partNumber: 1,
    title: "Part 1: Student Accommodation & Tenancy Agreement",
    context: "Everyday Social Conversation between two speakers",
    speakers: "Sarah (Housing Officer) & Liam Patel (International Student)",
    description:
      "A conversation between a university accommodation officer and an incoming postgraduate student arranging a residential tenancy.",
    audioTitle: "Campus Accommodation Services - Tenancy Registration",
    audioDurationSeconds: 159,
    accent: "British English & International English (BandBloom Calibrated)",
    provenance: "Original BandBloom Educational Asset",
    syntheticNotice:
      "Synthesized diagnostic audio generated for practice purposes. Speech cadence reflects authentic IELTS Part 1 pacing (140-160 wpm).",
    audioUrl: "/audio/listening/part1_tenancy_dialogue.wav",
    audioObjectKey: "listening/part1_tenancy_dialogue.wav",
    audioMimeType: "audio/wav",
    audioFileSizeBytes: 7021496,
    audioSha256: "88d1339dfd73a29793d279e26fb927a8df3ab7067325a4960198261b484d7d1e",
    isSynthetic: true,
    ttsProvider: "system_speech_synthesizer",
    voiceName: "Microsoft George / Zira Synthetic",
    voiceLanguage: "en-GB / en-US",
    voiceProvenance: "Synthesized diagnostic practice audio from calibrated official IELTS dialogue transcript",
    contentVersion: "2026.1",
    fullTranscript: `Sarah: Good morning, City University Student Accommodation Services. My name is Sarah. How can I assist you today?
Liam: Good morning, Sarah. I am an incoming postgraduate student from Canada, and I'd like to finalize my accommodation booking for the upcoming academic year.
Sarah: Welcome to City University! Let me pull up our international tenancy portal. Could I take your full name, please?
Liam: Yes, my first name is Liam, and my surname is Patel. That's P-A-T-E-L.
Sarah: Thank you, Liam. And what is your student identification number?
Liam: It's CU-84920.
Sarah: Perfect. Now, regarding your intended move-in date. Our standard semester begins on the 25th of September.
Liam: I was initially hoping to arrive early on the 10th, but my flight departs on the 17th, so I will arrive to move into the flat on the 18th of September.
Sarah: Splendid. The 18th of September is officially registered. Now, which category of accommodation did you request?
Liam: I originally applied for a shared en-suite room in Hall A, but due to my research hours, I decided on a private studio apartment.
Sarah: Excellent. The self-contained studio apartment is located in Victoria Court. The monthly rental is 650 pounds.
Liam: And does that require a security deposit?
Liam: Yes, the refundable security deposit is 800 pounds, payable prior to key collection.
Sarah: Note that high-speed internet and water are fully included in the monthly rent, but electricity is metered separately.
Liam: That sounds reasonable. What about transportation? Is there a public bus stop nearby?
Sarah: Yes, the nearest bus stop is located right outside on Elm Street, approximately two minutes' walk from the lobby.
Liam: Perfect. Which documents do I need to bring for key collection?
Sarah: You must bring your university acceptance letter and a verified bank statement showing maintenance funds.
Liam: Understood. What is the emergency contact number for the accommodation office?
Sarah: Our 24-hour reception desk number is 07700 900342.
Liam: And finally, what payment method is preferred for the monthly rent?
Sarah: All enrolled students are required to arrange payment via monthly direct debit from a UK bank account.`,
    transcriptSegments: [
      {
        speaker: "Sarah",
        startTime: "0:02",
        endTime: "0:09",
        text: "Good morning, City University Student Accommodation Services. My name is Sarah. How can I assist you today?",
      },
      {
        speaker: "Liam",
        startTime: "0:10",
        endTime: "0:22",
        text: "Good morning, Sarah. I am an incoming postgraduate student from Canada, and I'd like to finalize my accommodation booking for the upcoming academic year.",
      },
      {
        speaker: "Sarah",
        startTime: "0:23",
        endTime: "0:29",
        text: "Welcome to City University! Let me pull up our international tenancy portal. Could I take your full name, please?",
      },
      {
        speaker: "Liam",
        startTime: "0:30",
        endTime: "0:37",
        text: "Yes, my first name is Liam, and my surname is Patel. That's P-A-T-E-L.",
        questionRef: "lq-1",
      },
      {
        speaker: "Sarah",
        startTime: "0:38",
        endTime: "0:45",
        text: "Thank you, Liam. And what is your student identification number?",
      },
      {
        speaker: "Liam",
        startTime: "0:46",
        endTime: "0:52",
        text: "It's CU-84920.",
      },
      {
        speaker: "Sarah",
        startTime: "0:53",
        endTime: "1:00",
        text: "Now, regarding your intended move-in date. Our standard semester begins on the 25th of September.",
      },
      {
        speaker: "Liam",
        startTime: "1:01",
        endTime: "1:14",
        text: "I was initially hoping to arrive early on the 10th, but my flight departs on the 17th, so I will arrive to move into the flat on the 18th of September.",
        questionRef: "lq-2",
      },
      {
        speaker: "Sarah",
        startTime: "1:15",
        endTime: "1:21",
        text: "Splendid. The 18th of September is officially registered. Now, which category of accommodation did you request?",
      },
      {
        speaker: "Liam",
        startTime: "1:22",
        endTime: "1:32",
        text: "I originally applied for a shared en-suite room in Hall A, but due to my research hours, I decided on a private studio apartment.",
        questionRef: "lq-3",
      },
      {
        speaker: "Sarah",
        startTime: "1:33",
        endTime: "1:42",
        text: "The self-contained studio apartment is located in Victoria Court. The monthly rental is 650 pounds.",
        questionRef: "lq-4",
      },
      {
        speaker: "Sarah",
        startTime: "1:43",
        endTime: "1:52",
        text: "The refundable security deposit is 800 pounds, payable prior to key collection.",
        questionRef: "lq-5",
      },
      {
        speaker: "Sarah",
        startTime: "1:53",
        endTime: "2:02",
        text: "Note that high-speed internet and water are fully included in the monthly rent, but electricity is metered separately.",
        questionRef: "lq-6",
      },
      {
        speaker: "Liam",
        startTime: "2:03",
        endTime: "2:10",
        text: "That sounds reasonable. What about transportation? Is there a public bus stop nearby?",
      },
      {
        speaker: "Sarah",
        startTime: "2:11",
        endTime: "2:20",
        text: "Yes, the nearest bus stop is located right outside on Elm Street, approximately two minutes' walk from the lobby.",
        questionRef: "lq-7",
      },
      {
        speaker: "Liam",
        startTime: "2:21",
        endTime: "2:26",
        text: "Perfect. Which documents do I need to bring for key collection?",
      },
      {
        speaker: "Sarah",
        startTime: "2:27",
        endTime: "2:36",
        text: "You must bring your university acceptance letter and a verified bank statement showing maintenance funds.",
        questionRef: "lq-8",
      },
      {
        speaker: "Sarah",
        startTime: "2:37",
        endTime: "2:46",
        text: "Our 24-hour reception desk number is 07700 900342.",
        questionRef: "lq-9",
      },
      {
        speaker: "Sarah",
        startTime: "2:47",
        endTime: "2:58",
        text: "All enrolled students are required to arrange payment via monthly direct debit from a UK bank account.",
        questionRef: "lq-10",
      },
    ],
    questions: [
      {
        id: "lq-1",
        number: 1,
        partNumber: 1,
        typeId: "form_completion",
        typeLabel: "Form Completion",
        prompt: "Student Surname: [_____] (First Name: Liam)",
        instruction: "Write ONE WORD ONLY for each answer.",
        correctAnswer: "Patel",
        acceptedVariants: ["Patel", "patel"],
        maxWords: 1,
        allowNumber: false,
        wordLimitRule: "ONE WORD ONLY",
        transcriptTimestamp: "0:30",
        evidenceQuote: "Yes, my first name is Liam, and my surname is Patel. That's P-A-T-E-L.",
        explanation: "Liam explicitly spells out his surname: P-A-T-E-L.",
        distractorTrap: "No distractor used on the surname itself; focuses on letter recognition.",
        strategyTip: "Be ready to write letters rapidly as they are spelled.",
      },
      {
        id: "lq-2",
        number: 2,
        partNumber: 1,
        typeId: "form_completion",
        typeLabel: "Form Completion",
        prompt: "Move-in Date: [_____] September",
        instruction: "Write ONE WORD OR A NUMBER for each answer.",
        correctAnswer: "18th",
        acceptedVariants: ["18th", "18", "eighteenth"],
        maxWords: 1,
        allowNumber: true,
        wordLimitRule: "ONE WORD OR A NUMBER",
        transcriptTimestamp: "1:01",
        evidenceQuote: "I was initially hoping to arrive early on the 10th... so I will arrive to move into the flat on the 18th of September.",
        explanation: "Liam mentions the 10th as an initial thought and the 25th as semester start, but confirms the 18th for move-in.",
        distractorTrap: "The 10th and 25th are distractor dates mentioned in the same turn.",
        strategyTip: "Listen for contrastive connectors like 'but' and 'so I will arrive on...'",
      },
      {
        id: "lq-3",
        number: 3,
        partNumber: 1,
        typeId: "form_completion",
        typeLabel: "Form Completion",
        prompt: "Accommodation Category: [_____]",
        instruction: "Write NO MORE THAN TWO WORDS for each answer.",
        correctAnswer: "studio apartment",
        acceptedVariants: ["studio apartment", "studio", "private studio"],
        maxWords: 2,
        allowNumber: false,
        wordLimitRule: "NO MORE THAN TWO WORDS",
        transcriptTimestamp: "1:22",
        evidenceQuote: "I originally applied for a shared en-suite room in Hall A, but due to my research hours, I decided on a private studio apartment.",
        explanation: "Liam changed his preference from a shared en-suite room to a studio apartment.",
        distractorTrap: "Shared en-suite room was his initial choice, but later rejected.",
        strategyTip: "Watch out for past tense phrases: 'I originally applied for...'",
      },
      {
        id: "lq-4",
        number: 4,
        partNumber: 1,
        typeId: "form_completion",
        typeLabel: "Form Completion",
        prompt: "Monthly Rent: £[_____]",
        instruction: "Write ONE NUMBER ONLY for each answer.",
        correctAnswer: "650",
        acceptedVariants: ["650", "six hundred and fifty"],
        maxWords: 0,
        maxNumbers: 1,
        allowNumber: true,
        wordLimitRule: "ONE NUMBER ONLY",
        transcriptTimestamp: "1:33",
        evidenceQuote: "The monthly rental is 650 pounds.",
        explanation: "The officer clearly states 650 pounds per month.",
        distractorTrap: "Do not confuse the rent (650) with the security deposit (800).",
        strategyTip: "Since the currency symbol (£) is printed in the prompt, write only the digits.",
      },
      {
        id: "lq-5",
        number: 5,
        partNumber: 1,
        typeId: "form_completion",
        typeLabel: "Form Completion",
        prompt: "Refundable Security Deposit: £[_____]",
        instruction: "Write ONE NUMBER ONLY for each answer.",
        correctAnswer: "800",
        acceptedVariants: ["800", "eight hundred"],
        maxWords: 0,
        maxNumbers: 1,
        allowNumber: true,
        wordLimitRule: "ONE NUMBER ONLY",
        transcriptTimestamp: "1:43",
        evidenceQuote: "The refundable security deposit is 800 pounds, payable prior to key collection.",
        explanation: "Sarah states the deposit is 800 pounds.",
        distractorTrap: "Do not confuse with the 650 rent figure heard immediately before.",
        strategyTip: "Listen for the specific keyword 'deposit'.",
      },
      {
        id: "lq-6",
        number: 6,
        partNumber: 1,
        typeId: "note_completion",
        typeLabel: "Note Completion",
        prompt: "Utilities Included in Rent: Water and [_____]",
        instruction: "Write ONE WORD ONLY for each answer.",
        correctAnswer: "internet",
        acceptedVariants: ["internet", "Internet"],
        maxWords: 1,
        allowNumber: false,
        wordLimitRule: "ONE WORD ONLY",
        transcriptTimestamp: "1:53",
        evidenceQuote: "Note that high-speed internet and water are fully included in the monthly rent, but electricity is metered separately.",
        explanation: "Internet and water are included; electricity is excluded.",
        distractorTrap: "Electricity is mentioned but explicitly stated as metered separately.",
        strategyTip: "Check which items are included versus charged extra.",
      },
      {
        id: "lq-7",
        number: 7,
        partNumber: 1,
        typeId: "short_answer",
        typeLabel: "Short-Answer Questions",
        prompt: "Name of Nearest Bus Stop: [_____] Street",
        instruction: "Write ONE WORD ONLY for each answer.",
        correctAnswer: "Elm",
        acceptedVariants: ["Elm", "elm"],
        maxWords: 1,
        allowNumber: false,
        wordLimitRule: "ONE WORD ONLY",
        transcriptTimestamp: "2:11",
        evidenceQuote: "Yes, the nearest bus stop is located right outside on Elm Street, approximately two minutes' walk from the lobby.",
        explanation: "Sarah says the bus stop is on Elm Street. 'Street' is already printed in prompt.",
        distractorTrap: "Writing 'Elm Street' would duplicate 'Street' and breach ONE WORD ONLY.",
        strategyTip: "Read what comes after the blank to avoid duplicating printed words.",
      },
      {
        id: "lq-8",
        number: 8,
        partNumber: 1,
        typeId: "short_answer",
        typeLabel: "Short-Answer Questions",
        prompt: "Required Document for Keys: University letter and [_____]",
        instruction: "Write NO MORE THAN TWO WORDS for each answer.",
        correctAnswer: "bank statement",
        acceptedVariants: ["bank statement", "a bank statement"],
        maxWords: 2,
        allowNumber: false,
        wordLimitRule: "NO MORE THAN TWO WORDS",
        transcriptTimestamp: "2:27",
        evidenceQuote: "You must bring your university acceptance letter and a verified bank statement showing maintenance funds.",
        explanation: "Sarah specifies bringing an acceptance letter and a bank statement.",
        distractorTrap: "Maintenance funds describes the purpose of the statement, not the document itself.",
        strategyTip: "Extract the exact noun phrase indicating the physical paper.",
      },
      {
        id: "lq-9",
        number: 9,
        partNumber: 1,
        typeId: "form_completion",
        typeLabel: "Form Completion",
        prompt: "24-Hour Reception Desk Telephone: [_____]",
        instruction: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        correctAnswer: "07700 900342",
        acceptedVariants: ["07700 900342", "07700900342", "07700-900342"],
        maxWords: 0,
        maxNumbers: 2,
        allowNumber: true,
        wordLimitRule: "NO MORE THAN A NUMBER",
        transcriptTimestamp: "2:37",
        evidenceQuote: "Our 24-hour reception desk number is 07700 900342.",
        explanation: "The receptionist dictates 07700 900342.",
        distractorTrap: "Double numbers ('double-seven', 'double-zero') require fast notation.",
        strategyTip: "Write phone numbers as digits without punctuation.",
      },
      {
        id: "lq-10",
        number: 10,
        partNumber: 1,
        typeId: "note_completion",
        typeLabel: "Note Completion",
        prompt: "Mandatory Payment Method: Monthly [_____]",
        instruction: "Write NO MORE THAN TWO WORDS for each answer.",
        correctAnswer: "direct debit",
        acceptedVariants: ["direct debit", "Direct Debit"],
        maxWords: 2,
        allowNumber: false,
        wordLimitRule: "NO MORE THAN TWO WORDS",
        transcriptTimestamp: "2:47",
        evidenceQuote: "All enrolled students are required to arrange payment via monthly direct debit from a UK bank account.",
        explanation: "Sarah states that rent must be paid via monthly direct debit.",
        distractorTrap: "UK bank account is where funds are drawn from, not the payment method name.",
        strategyTip: "Match the word that collocates with 'monthly'.",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // PART 2: Everyday Social Monologue (Sports & Leisure Centre Tour)
  // --------------------------------------------------------------------------
  {
    partNumber: 2,
    title: "Part 2: Riverside Sports & Community Centre Orientation",
    context: "Everyday Social Monologue by a single speaker",
    speakers: "Marcus Henderson (Facilities Director)",
    description:
      "A guided orientation speech given by the facilities director of a modern community sports centre to new community members.",
    audioTitle: "Riverside Sports Centre - Member Orientation & Layout",
    audioDurationSeconds: 158,
    accent: "Australian English (BandBloom Calibrated)",
    provenance: "Original BandBloom Educational Asset",
    syntheticNotice:
      "Synthesized diagnostic audio generated for practice purposes. Speech cadence reflects authentic IELTS Part 2 pacing (135-150 wpm).",
    audioUrl: "/audio/listening/part2_sports_centre.wav",
    audioObjectKey: "listening/part2_sports_centre.wav",
    audioMimeType: "audio/wav",
    audioFileSizeBytes: 6974684,
    audioSha256: "bac16e3a67ae25841a470796abdbde4c2e865025d1b9c11239df3933ccca3824",
    isSynthetic: true,
    ttsProvider: "system_speech_synthesizer",
    voiceName: "Microsoft George Synthetic",
    voiceLanguage: "en-GB",
    voiceProvenance: "Synthesized diagnostic practice audio from calibrated official IELTS monologue transcript",
    contentVersion: "2026.1",
    fullTranscript: `Marcus: Good evening everyone, and a warm welcome to the Riverside Sports and Community Centre. My name is Marcus Henderson, and I am delighted to give you an overview of our freshly renovated facilities.
Before we explore the floor plan, let me touch upon our membership terms. While regular annual adult membership is 300 dollars, verified university students and senior citizens receive an automatic twenty percent discount upon presenting valid photo ID.
Our operational hours have also expanded. From Monday through Friday, our doors open promptly at 6:00 am. However, on Saturdays and Sundays, opening time is shifted to 7:00 am to accommodate weekend facility maintenance.
Now, please direct your attention to the building plan displayed on your handouts. You are currently standing at the Main Entrance facing north. Directly ahead of you through the double turnstiles lies our central reception desk.
If you walk past reception and head straight ahead to the rear of the building, you will enter the Northern Wing, which houses our heated 50-metre Olympic swimming pool.
Now, if you return to reception and look to your left along the West Corridor, the first doorway on your right leads to our newly expanded Fitness Suite and free-weights gym.
Continue further down that West Corridor to the very end, and on your left you will locate the four glass-backed Squash Courts, positioned directly behind the healthy juice bar.
Opposite the squash courts on your right is the Aerobics Studio, where high-intensity interval training and yoga classes take place.
A quick reminder regarding our changing facilities: to secure personal lockers in both changing rooms, members must deposit a two-pound coin or token, which is refunded immediately upon unlocking.
Regarding sporting gear: table tennis bats and badminton racquets are provided completely free of charge at the equipment counter, though members must provide their own shuttlecocks and footwear.
Outside parking is accessible from River Road. Please remember that all vehicles must display a valid parking permit on their dashboard, or pay-and-display fees will apply.
Our on-site Waterside Café serves freshly prepared snacks daily from 8:00 am. We pride ourselves on catering for diverse dietary needs, featuring extensive vegan and gluten-free menus.
Finally, before using any advanced cardiovascular or weight equipment, every member must attend a thirty-minute introductory induction session with a certified personal trainer.`,
    transcriptSegments: [
      {
        speaker: "Marcus",
        startTime: "0:02",
        endTime: "0:12",
        text: "Good evening everyone, and a warm welcome to the Riverside Sports and Community Centre. My name is Marcus Henderson.",
      },
      {
        speaker: "Marcus",
        startTime: "0:13",
        endTime: "0:25",
        text: "While regular annual adult membership is 300 dollars, verified university students and senior citizens receive an automatic twenty percent discount upon presenting valid photo ID.",
        questionRef: "lq-11",
      },
      {
        speaker: "Marcus",
        startTime: "0:26",
        endTime: "0:39",
        text: "From Monday through Friday, our doors open promptly at 6:00 am. However, on Saturdays and Sundays, opening time is shifted to 7:00 am to accommodate weekend facility maintenance.",
        questionRef: "lq-12",
      },
      {
        speaker: "Marcus",
        startTime: "0:40",
        endTime: "0:52",
        text: "Directly ahead of you through the double turnstiles lies our central reception desk. If you walk past reception straight to the rear, you will enter the Northern Wing, which houses our heated 50-metre Olympic swimming pool.",
        questionRef: "lq-13",
      },
      {
        speaker: "Marcus",
        startTime: "0:53",
        endTime: "1:05",
        text: "If you look to your left along the West Corridor, the first doorway on your right leads to our newly expanded Fitness Suite and free-weights gym.",
        questionRef: "lq-14",
      },
      {
        speaker: "Marcus",
        startTime: "1:06",
        endTime: "1:18",
        text: "Continue further down that West Corridor to the very end, and on your left you will locate the four glass-backed Squash Courts, positioned directly behind the healthy juice bar.",
        questionRef: "lq-15",
      },
      {
        speaker: "Marcus",
        startTime: "1:19",
        endTime: "1:32",
        text: "To secure personal lockers in both changing rooms, members must deposit a two-pound coin or token, which is refunded immediately upon unlocking.",
        questionRef: "lq-16",
      },
      {
        speaker: "Marcus",
        startTime: "1:33",
        endTime: "1:44",
        text: "Regarding sporting gear: table tennis bats and badminton racquets are provided completely free of charge at the equipment counter.",
        questionRef: "lq-17",
      },
      {
        speaker: "Marcus",
        startTime: "1:45",
        endTime: "1:55",
        text: "Please remember that all vehicles must display a valid parking permit on their dashboard, or pay-and-display fees will apply.",
        questionRef: "lq-18",
      },
      {
        speaker: "Marcus",
        startTime: "1:56",
        endTime: "2:08",
        text: "Our on-site Waterside Café serves freshly prepared snacks daily from 8:00 am. We pride ourselves on catering for diverse dietary needs, featuring extensive vegan and gluten-free menus.",
        questionRef: "lq-19",
      },
      {
        speaker: "Marcus",
        startTime: "2:09",
        endTime: "2:20",
        text: "Finally, before using any advanced cardiovascular or weight equipment, every member must attend a thirty-minute introductory induction session with a certified personal trainer.",
        questionRef: "lq-20",
      },
    ],
    questions: [
      {
        id: "lq-11",
        number: 11,
        partNumber: 2,
        typeId: "table_completion",
        typeLabel: "Table Completion",
        prompt: "Student and Senior Citizen Membership Discount: [_____]%",
        instruction: "Write ONE NUMBER ONLY for each answer.",
        correctAnswer: "20",
        acceptedVariants: ["20", "twenty"],
        maxWords: 0,
        maxNumbers: 1,
        allowNumber: true,
        wordLimitRule: "ONE NUMBER ONLY",
        transcriptTimestamp: "0:13",
        evidenceQuote: "verified university students and senior citizens receive an automatic twenty percent discount upon presenting valid photo ID.",
        explanation: "Marcus specifies a 20 percent discount.",
        distractorTrap: "300 dollars is the regular full price; 20 is the percentage discount.",
        strategyTip: "The '%' symbol is in the prompt; write only 20.",
      },
      {
        id: "lq-12",
        number: 12,
        partNumber: 2,
        typeId: "multiple_choice_single",
        typeLabel: "Multiple Choice (Single Answer)",
        prompt: "What time does the sports centre open on weekend mornings?",
        options: ["A: 6:00 am", "B: 7:00 am", "C: 8:00 am"],
        correctAnswer: "B",
        acceptedVariants: ["B", "b", "7:00 am", "7:00"],
        transcriptTimestamp: "0:26",
        evidenceQuote: "From Monday through Friday, our doors open promptly at 6:00 am. However, on Saturdays and Sundays, opening time is shifted to 7:00 am...",
        explanation: "Weekdays open at 6:00 am, but weekends open at 7:00 am.",
        distractorTrap: "6:00 am is the weekday opening time; 8:00 am is when the café opens.",
        strategyTip: "Identify the contrastive phrase: 'However, on Saturdays and Sundays...'",
      },
      {
        id: "lq-13",
        number: 13,
        partNumber: 2,
        typeId: "plan_labelling",
        typeLabel: "Plan Labelling",
        prompt: "Where is the 50-metre Olympic swimming pool located on the facility plan?",
        options: [
          "A: Northern Wing at the rear",
          "B: First room on the West Corridor",
          "C: Directly adjacent to reception turnstiles",
        ],
        correctAnswer: "A",
        acceptedVariants: ["A", "a", "Northern Wing at the rear"],
        transcriptTimestamp: "0:40",
        evidenceQuote: "If you walk past reception and head straight ahead to the rear of the building, you will enter the Northern Wing, which houses our heated 50-metre Olympic swimming pool.",
        explanation: "Marcus specifies the pool is in the Northern Wing straight to the rear.",
        distractorTrap: "West corridor houses the gym and squash courts.",
        strategyTip: "Follow the directional trajectory: past reception, straight to the rear.",
      },
      {
        id: "lq-14",
        number: 14,
        partNumber: 2,
        typeId: "plan_labelling",
        typeLabel: "Plan Labelling",
        prompt: "Fitness Suite location along the West Corridor: First doorway on the [_____]",
        instruction: "Write ONE WORD ONLY for each answer.",
        correctAnswer: "right",
        acceptedVariants: ["right", "Right"],
        maxWords: 1,
        allowNumber: false,
        wordLimitRule: "ONE WORD ONLY",
        transcriptTimestamp: "0:53",
        evidenceQuote: "If you look to your left along the West Corridor, the first doorway on your right leads to our newly expanded Fitness Suite...",
        explanation: "The corridor is to the left, but the doorway itself is on the right.",
        distractorTrap: "Left is the direction you turn into the corridor; right is the side the room is on.",
        strategyTip: "Distinguish between corridor orientation and room side.",
      },
      {
        id: "lq-15",
        number: 15,
        partNumber: 2,
        typeId: "short_answer",
        typeLabel: "Short-Answer Questions",
        prompt: "The squash courts are located directly behind which facility?",
        instruction: "Write NO MORE THAN TWO WORDS for each answer.",
        correctAnswer: "juice bar",
        acceptedVariants: ["juice bar", "healthy juice bar", "the juice bar"],
        maxWords: 2,
        allowNumber: false,
        wordLimitRule: "NO MORE THAN TWO WORDS",
        transcriptTimestamp: "1:06",
        evidenceQuote: "...locate the four glass-backed Squash Courts, positioned directly behind the healthy juice bar.",
        explanation: "Marcus mentions the courts are directly behind the juice bar.",
        distractorTrap: "Waterside café is a different facility located elsewhere.",
        strategyTip: "Listen for the prepositional anchor 'behind the...'",
      },
      {
        id: "lq-16",
        number: 16,
        partNumber: 2,
        typeId: "note_completion",
        typeLabel: "Note Completion",
        prompt: "Changing Room Lockers: Require a [_____] deposit (refunded upon unlocking).",
        instruction: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        correctAnswer: "two-pound coin",
        acceptedVariants: ["two-pound coin", "2-pound coin", "two pound coin", "£2 coin", "2 pound coin"],
        maxWords: 2,
        maxNumbers: 1,
        allowNumber: true,
        wordLimitRule: "NO MORE THAN TWO WORDS AND/OR A NUMBER",
        transcriptTimestamp: "1:19",
        evidenceQuote: "...members must deposit a two-pound coin or token, which is refunded immediately upon unlocking.",
        explanation: "A two-pound coin or token is required for locker security.",
        distractorTrap: "Do not write just 'coin'; specify 'two-pound coin'.",
        strategyTip: "Include numerical value when describing currency deposits.",
      },
      {
        id: "lq-17",
        number: 17,
        partNumber: 2,
        typeId: "matching_features",
        typeLabel: "Matching Features & Opinions",
        prompt: "Which sports items are available free of charge at the counter?",
        options: [
          "A: Table tennis bats & badminton racquets",
          "B: Shuttlecocks & court footwear",
          "C: Squash balls & gym towels",
        ],
        correctAnswer: "A",
        acceptedVariants: ["A", "a"],
        transcriptTimestamp: "1:33",
        evidenceQuote: "table tennis bats and badminton racquets are provided completely free of charge at the equipment counter, though members must provide their own shuttlecocks and footwear.",
        explanation: "Bats and racquets are free; shuttlecocks and footwear must be brought by members.",
        distractorTrap: "Shuttlecocks and footwear are mentioned in the same sentence as items members must supply.",
        strategyTip: "Notice the contrasting clause: 'though members must provide their own...'",
      },
      {
        id: "lq-18",
        number: 18,
        partNumber: 2,
        typeId: "sentence_completion",
        typeLabel: "Sentence Completion",
        prompt: "To avoid pay-and-display penalties, parkers must display a valid [_____] on their vehicle dashboard.",
        instruction: "Write NO MORE THAN TWO WORDS for each answer.",
        correctAnswer: "parking permit",
        acceptedVariants: ["parking permit", "permit"],
        maxWords: 2,
        allowNumber: false,
        wordLimitRule: "NO MORE THAN TWO WORDS",
        transcriptTimestamp: "1:45",
        evidenceQuote: "Please remember that all vehicles must display a valid parking permit on their dashboard, or pay-and-display fees will apply.",
        explanation: "Marcus requires displaying a parking permit on the dashboard.",
        distractorTrap: "Pay-and-display fees apply only if the permit is missing.",
        strategyTip: "Identify the object placed on the dashboard.",
      },
      {
        id: "lq-19",
        number: 19,
        partNumber: 2,
        typeId: "note_completion",
        typeLabel: "Note Completion",
        prompt: "Waterside Café: Special menus provided for [_____] and gluten-free diets.",
        instruction: "Write ONE WORD ONLY for each answer.",
        correctAnswer: "vegan",
        acceptedVariants: ["vegan", "Vegan"],
        maxWords: 1,
        allowNumber: false,
        wordLimitRule: "ONE WORD ONLY",
        transcriptTimestamp: "1:56",
        evidenceQuote: "...featuring extensive vegan and gluten-free menus.",
        explanation: "The café features vegan and gluten-free options.",
        distractorTrap: "'Gluten-free' is already printed in the question prompt.",
        strategyTip: "Do not repeat the word printed after 'and'.",
      },
      {
        id: "lq-20",
        number: 20,
        partNumber: 2,
        typeId: "form_completion",
        typeLabel: "Form Completion",
        prompt: "Mandatory Gym Induction Duration: [_____] minutes",
        instruction: "Write ONE NUMBER ONLY for each answer.",
        correctAnswer: "30",
        acceptedVariants: ["30", "thirty"],
        maxWords: 0,
        maxNumbers: 1,
        allowNumber: true,
        wordLimitRule: "ONE NUMBER ONLY",
        transcriptTimestamp: "2:09",
        evidenceQuote: "...every member must attend a thirty-minute introductory induction session with a certified personal trainer.",
        explanation: "Induction duration is 30 minutes.",
        distractorTrap: "No distractor numbers in this sentence; focus on number spelling.",
        strategyTip: "Write '30' directly as digits.",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // PART 3: Educational / Training Discussion (Renewable Energy Project)
  // --------------------------------------------------------------------------
  {
    partNumber: 3,
    title: "Part 3: Offshore Wind Turbine Field Study Project",
    context: "Educational/Training Discussion between 2-3 speakers",
    speakers: "Dr. Angela Evans (Tutor), Elena & Jack (Postgraduate Engineering Students)",
    description:
      "A university tutorial discussing an offshore wind turbine pilot study, telemetry sensor calibration, and research methodology.",
    audioTitle: "Faculty of Renewable Energy - Tutorial & Project Supervision",
    audioDurationSeconds: 176,
    accent: "Scottish English & Standard British (BandBloom Calibrated)",
    provenance: "Original BandBloom Educational Asset",
    syntheticNotice:
      "Synthesized diagnostic audio generated for practice purposes. Speech cadence reflects authentic IELTS Part 3 pacing (145-165 wpm).",
    audioUrl: "/audio/listening/part3_wind_turbine.wav",
    audioObjectKey: "listening/part3_wind_turbine.wav",
    audioMimeType: "audio/wav",
    audioFileSizeBytes: 7778292,
    audioSha256: "0e43a9da30f17e56b9d99d4b3a4853fc6e138051fa9a9e4c56eeaffc0280d4f4",
    isSynthetic: true,
    ttsProvider: "system_speech_synthesizer",
    voiceName: "Microsoft George / Zira Synthetic",
    voiceLanguage: "en-GB / en-US",
    voiceProvenance: "Synthesized diagnostic practice audio from calibrated official IELTS academic discussion transcript",
    contentVersion: "2026.1",
    fullTranscript: `Dr. Evans: Good afternoon, Elena, Jack. Come in and take a seat. Today we need to evaluate your preliminary proposal for the coastal wind turbine telemetry study.
Elena: Thank you, Dr. Evans. As you know, we selected offshore floating turbines rather than onshore arrays because offshore installations experience significantly higher laminar wind speeds and avoid complex terrestrial boundary turbulence.
Jack: That's right. But during our bench testing last week, we ran into an unexpected obstacle with the acoustic sensor package.
Dr. Evans: Ah, what kind of problem occurred, Jack?
Jack: Well, we anticipated interference from high salt humidity. But in fact, the telemetry module experienced severe signal clipping because the sensor gain was set far too high for coastal gust dynamics.
Dr. Evans: That is a classic mistake in prototype marine sensors. Older telemetry devices had fixed analog attenuators, whereas modern units require manual digital calibration before deployment.
Elena: Exactly. Once Jack adjusted the analog-to-digital converter threshold, the dynamic response smoothed out.
Dr. Evans: Excellent. Now let's review your data processing pipeline. Looking at your methodology flow-chart, what is your first procedural step after retrieving raw data packets?
Jack: Stage one is hardware telemetry decompression and timestamp synchronization across all three turbine towers.
Elena: Then in stage two, before any analytical modeling, the automated script runs atmospheric pressure logging to calibrate air density variables.
Dr. Evans: Crucial, because wind kinetic energy is directly proportional to air density. And stage three?
Jack: In the third stage, we perform statistical outlier filtering to eliminate transient radio frequency spikes.
Elena: And finally, stage four consists of comparative variance analysis, comparing our field figures against the national grid benchmark database.
Dr. Evans: That is a very coherent methodology. Now, regarding university project requirements: have you both completed the mandatory risk documentation?
Jack: We have drafted the emergency evacuation protocol. But university ethics rules specify that we cannot embark on coastal sea trials without a certified marine safety officer on board the research vessel.
Elena: And Dr. Evans, when is our final milestone draft due?
Dr. Evans: The complete draft chapter must be uploaded to the portal by midnight on the 24th of November.
Jack: And where shall we convene for next week's supervisory meeting?
Dr. Evans: Next Tuesday we will meet in Room 402 in Science Block B, as this tutorial room is booked for doctoral examinations.`,
    transcriptSegments: [
      {
        speaker: "Dr. Evans",
        startTime: "0:02",
        endTime: "0:12",
        text: "Good afternoon, Elena, Jack. Come in and take a seat. Today we need to evaluate your preliminary proposal for the coastal wind turbine telemetry study.",
      },
      {
        speaker: "Elena",
        startTime: "0:13",
        endTime: "0:25",
        text: "As you know, we selected offshore floating turbines rather than onshore arrays because offshore installations experience significantly higher laminar wind speeds and avoid complex terrestrial boundary turbulence.",
        questionRef: "lq-21",
      },
      {
        speaker: "Jack",
        startTime: "0:26",
        endTime: "0:41",
        text: "We anticipated interference from high salt humidity. But in fact, the telemetry module experienced severe signal clipping because the sensor gain was set far too high for coastal gust dynamics.",
        questionRef: "lq-22",
      },
      {
        speaker: "Dr. Evans",
        startTime: "0:42",
        endTime: "0:56",
        text: "That is a classic mistake in prototype marine sensors. Older telemetry devices had fixed analog attenuators, whereas modern units require manual digital calibration before deployment.",
        questionRef: "lq-23",
      },
      {
        speaker: "Jack",
        startTime: "0:57",
        endTime: "1:08",
        text: "Stage one is hardware telemetry decompression and timestamp synchronization across all three turbine towers.",
      },
      {
        speaker: "Elena",
        startTime: "1:09",
        endTime: "1:21",
        text: "Then in stage two, before any analytical modeling, the automated script runs atmospheric pressure logging to calibrate air density variables.",
        questionRef: "lq-24",
      },
      {
        speaker: "Jack",
        startTime: "1:22",
        endTime: "1:33",
        text: "In the third stage, we perform statistical outlier filtering to eliminate transient radio frequency spikes.",
        questionRef: "lq-25",
      },
      {
        speaker: "Elena",
        startTime: "1:34",
        endTime: "1:46",
        text: "And finally, stage four consists of comparative variance analysis, comparing our field figures against the national grid benchmark database.",
        questionRef: "lq-26",
      },
      {
        speaker: "Jack",
        startTime: "1:47",
        endTime: "2:01",
        text: "We have drafted the emergency evacuation protocol. But university ethics rules specify that we cannot embark on coastal sea trials without a certified marine safety officer on board the research vessel.",
        questionRef: "lq-27",
      },
      {
        speaker: "Dr. Evans",
        startTime: "2:02",
        endTime: "2:13",
        text: "The complete draft chapter must be uploaded to the portal by midnight on the 24th of November.",
        questionRef: "lq-28",
      },
      {
        speaker: "Jack",
        startTime: "2:14",
        endTime: "2:18",
        text: "And where shall we convene for next week's supervisory meeting?",
      },
      {
        speaker: "Dr. Evans",
        startTime: "2:19",
        endTime: "2:28",
        text: "Next Tuesday we will meet in Room 402 in Science Block B, as this tutorial room is booked for doctoral examinations.",
        questionRef: "lq-29",
      },
      {
        speaker: "Elena",
        startTime: "2:29",
        endTime: "2:36",
        text: "Thank you Dr. Evans, we will prepare the calibrated sensor logs and see you in Room 402.",
        questionRef: "lq-30",
      },
    ],
    questions: [
      {
        id: "lq-21",
        number: 21,
        partNumber: 3,
        typeId: "multiple_choice_single",
        typeLabel: "Multiple Choice (Single Answer)",
        prompt: "Why did Elena and Jack choose offshore turbines rather than onshore locations?",
        options: [
          "A: Lower maintenance costs and cheaper anchoring",
          "B: Higher laminar wind speeds without terrestrial turbulence",
          "C: Closer proximity to coastal power consumption centres",
        ],
        correctAnswer: "B",
        acceptedVariants: ["B", "b", "Higher laminar wind speeds without terrestrial turbulence"],
        transcriptTimestamp: "0:13",
        evidenceQuote: "offshore installations experience significantly higher laminar wind speeds and avoid complex terrestrial boundary turbulence.",
        explanation: "Elena explicitly states that offshore turbines offer higher laminar wind speeds and avoid boundary turbulence.",
        distractorTrap: "Cost and anchoring are not mentioned; student focuses on aerodynamic turbulence.",
        strategyTip: "Look for causal justifications: 'because offshore installations experience...'",
      },
      {
        id: "lq-22",
        number: 22,
        partNumber: 3,
        typeId: "multiple_choice_single",
        typeLabel: "Multiple Choice (Single Answer)",
        prompt: "What was the actual cause of signal clipping in the telemetry bench test?",
        options: [
          "A: Salt humidity corroding copper terminals",
          "B: Radio frequency interference from coastal radar",
          "C: Excessively high sensor gain settings",
        ],
        correctAnswer: "C",
        acceptedVariants: ["C", "c", "Excessively high sensor gain settings"],
        transcriptTimestamp: "0:26",
        evidenceQuote: "the telemetry module experienced severe signal clipping because the sensor gain was set far too high for coastal gust dynamics.",
        explanation: "Jack confirms excessive sensor gain caused the signal clipping.",
        distractorTrap: "Salt humidity was what they anticipated, but NOT the actual cause.",
        strategyTip: "Be alert for: 'We anticipated X... but in fact the issue was Y.'",
      },
      {
        id: "lq-23",
        number: 23,
        partNumber: 3,
        typeId: "matching_features",
        typeLabel: "Matching Features & Opinions",
        prompt: "According to Dr. Evans, modern marine telemetry sensors require:",
        options: [
          "A: Manual digital calibration before deployment",
          "B: Fixed analog attenuator replacement",
          "C: Wireless satellite communication links",
        ],
        correctAnswer: "A",
        acceptedVariants: ["A", "a", "Manual digital calibration before deployment"],
        transcriptTimestamp: "0:42",
        evidenceQuote: "Older telemetry devices had fixed analog attenuators, whereas modern units require manual digital calibration before deployment.",
        explanation: "Dr. Evans clarifies that modern units require manual digital calibration.",
        distractorTrap: "Fixed analog attenuators belonged to older devices.",
        strategyTip: "Listen for the contrast marker 'whereas modern units require...'",
      },
      {
        id: "lq-24",
        number: 24,
        partNumber: 3,
        typeId: "flow_chart_completion",
        typeLabel: "Flow-chart Completion",
        prompt: "Methodology Stage 2: Automated [_____] to calibrate air density variables.",
        instruction: "Write NO MORE THAN TWO WORDS for each answer.",
        correctAnswer: "pressure logging",
        acceptedVariants: ["pressure logging", "atmospheric pressure logging"],
        maxWords: 2,
        allowNumber: false,
        wordLimitRule: "NO MORE THAN TWO WORDS",
        transcriptTimestamp: "1:09",
        evidenceQuote: "...the automated script runs atmospheric pressure logging to calibrate air density variables.",
        explanation: "Stage 2 involves atmospheric pressure logging.",
        distractorTrap: "Air density is the variable being calibrated, not the process name.",
        strategyTip: "Identify the action executed by the script.",
      },
      {
        id: "lq-25",
        number: 25,
        partNumber: 3,
        typeId: "flow_chart_completion",
        typeLabel: "Flow-chart Completion",
        prompt: "Methodology Stage 3: Perform [_____] to eliminate radio spikes.",
        instruction: "Write NO MORE THAN TWO WORDS for each answer.",
        correctAnswer: "outlier filtering",
        acceptedVariants: ["outlier filtering", "statistical outlier filtering"],
        maxWords: 2,
        allowNumber: false,
        wordLimitRule: "NO MORE THAN TWO WORDS",
        transcriptTimestamp: "1:22",
        evidenceQuote: "In the third stage, we perform statistical outlier filtering to eliminate transient radio frequency spikes.",
        explanation: "Jack specifies performing outlier filtering in stage 3.",
        distractorTrap: "Radio frequency spikes are the unwanted artifacts eliminated.",
        strategyTip: "Find the procedure that eliminates the spikes.",
      },
      {
        id: "lq-26",
        number: 26,
        partNumber: 3,
        typeId: "flow_chart_completion",
        typeLabel: "Flow-chart Completion",
        prompt: "Methodology Stage 4: Conduct comparative [_____] against national benchmarks.",
        instruction: "Write NO MORE THAN TWO WORDS for each answer.",
        correctAnswer: "variance analysis",
        acceptedVariants: ["variance analysis"],
        maxWords: 2,
        allowNumber: false,
        wordLimitRule: "NO MORE THAN TWO WORDS",
        transcriptTimestamp: "1:34",
        evidenceQuote: "And finally, stage four consists of comparative variance analysis, comparing our field figures against the national grid benchmark database.",
        explanation: "Elena names comparative variance analysis.",
        distractorTrap: "Benchmark database is the comparator, not the analytical method.",
        strategyTip: "Notice 'comparative' in prompt matches 'comparative variance analysis'.",
      },
      {
        id: "lq-27",
        number: 27,
        partNumber: 3,
        typeId: "short_answer",
        typeLabel: "Short-Answer Questions",
        prompt: "Who must accompany the students on board the vessel during coastal trials?",
        instruction: "Write NO MORE THAN THREE WORDS for each answer.",
        correctAnswer: "safety officer",
        acceptedVariants: [
          "safety officer",
          "marine safety officer",
          "certified safety officer",
          "certified marine safety officer",
        ],
        maxWords: 3,
        allowNumber: false,
        wordLimitRule: "NO MORE THAN THREE WORDS",
        transcriptTimestamp: "1:47",
        evidenceQuote: "...we cannot embark on coastal sea trials without a certified marine safety officer on board the research vessel.",
        explanation: "Jack mentions that a certified marine safety officer must be present.",
        distractorTrap: "Dr. Evans will not be on board; an accredited safety officer is required.",
        strategyTip: "Focus on the specific role designated by ethics rules.",
      },
      {
        id: "lq-28",
        number: 28,
        partNumber: 3,
        typeId: "form_completion",
        typeLabel: "Form Completion",
        prompt: "Draft Chapter Submission Deadline: [_____] November",
        instruction: "Write ONE WORD OR A NUMBER for each answer.",
        correctAnswer: "24th",
        acceptedVariants: ["24th", "24", "twenty-fourth"],
        maxWords: 1,
        allowNumber: true,
        wordLimitRule: "ONE WORD OR A NUMBER",
        transcriptTimestamp: "2:02",
        evidenceQuote: "The complete draft chapter must be uploaded to the portal by midnight on the 24th of November.",
        explanation: "Dr. Evans sets the deadline as the 24th of November.",
        distractorTrap: "Midnight is the time of day, 24th is the date requested.",
        strategyTip: "Write '24th' or '24' next to November.",
      },
      {
        id: "lq-29",
        number: 29,
        partNumber: 3,
        typeId: "short_answer",
        typeLabel: "Short-Answer Questions",
        prompt: "Next Tutorial Meeting Room Number: Room [_____]",
        instruction: "Write ONE NUMBER ONLY for each answer.",
        correctAnswer: "402",
        acceptedVariants: ["402", "four hundred and two"],
        maxWords: 0,
        maxNumbers: 1,
        allowNumber: true,
        wordLimitRule: "ONE NUMBER ONLY",
        transcriptTimestamp: "2:19",
        evidenceQuote: "Next Tuesday we will meet in Room 402 in Science Block B...",
        explanation: "The meeting will take place in Room 402.",
        distractorTrap: "Science Block B is the building name, 402 is the room number.",
        strategyTip: "Extract the exact digits following 'Room'.",
      },
      {
        id: "lq-30",
        number: 30,
        partNumber: 3,
        typeId: "note_completion",
        typeLabel: "Note Completion",
        prompt: "Next Meeting Building: Science Block [_____]",
        instruction: "Write ONE WORD ONLY for each answer.",
        correctAnswer: "B",
        acceptedVariants: ["B", "b"],
        maxWords: 1,
        allowNumber: false,
        wordLimitRule: "ONE WORD ONLY",
        transcriptTimestamp: "2:19",
        evidenceQuote: "...in Room 402 in Science Block B, as this tutorial room is booked...",
        explanation: "Dr. Evans identifies Science Block B.",
        distractorTrap: "Room 402 is the room; Block B is the building wing.",
        strategyTip: "Single letter designations are common in campus descriptions.",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // PART 4: Academic Subject Monologue (Marine Bioacoustics Lecture)
  // --------------------------------------------------------------------------
  {
    partNumber: 4,
    title: "Part 4: Cetacean Echolocation & Anthropogenic Bioacoustics",
    context: "Academic Monologue / University Lecture by a single speaker",
    speakers: "Professor David Thorne (Chair of Marine Bioacoustics)",
    description:
      "A university lecture exploring the evolutionary physiology of odontocete echolocation and the ecological impact of anthropogenic ocean noise.",
    audioTitle: "Faculty of Biological Sciences - Lecture 14: Marine Bioacoustics",
    audioDurationSeconds: 182,
    accent: "Standard Southern British (RP) (BandBloom Calibrated)",
    provenance: "Original BandBloom Educational Asset",
    syntheticNotice:
      "Synthesized diagnostic audio generated for practice purposes. Speech cadence reflects authentic IELTS Part 4 pacing (130-145 wpm).",
    audioUrl: "/audio/listening/part4_marine_bioacoustics.wav",
    audioObjectKey: "listening/part4_marine_bioacoustics.wav",
    audioMimeType: "audio/wav",
    audioFileSizeBytes: 8007934,
    audioSha256: "d9aadbc24aaecddb4c3e1d8749c95af0d97fa48ecc4e57021fcca85a845d39a2",
    isSynthetic: true,
    ttsProvider: "system_speech_synthesizer",
    voiceName: "Microsoft George Synthetic",
    voiceLanguage: "en-GB",
    voiceProvenance: "Synthesized diagnostic practice audio from calibrated official IELTS academic lecture transcript",
    contentVersion: "2026.1",
    fullTranscript: `Prof. Thorne: Good morning. Today we continue our examination of sensory adaptations in aquatic mammals by analyzing the bioacoustics of odontocetes—the toothed whales, dolphins, and porpoises.
Unlike terrestrial mammals, whose primary spatial perception relies heavily upon vision, toothed cetaceans have evolved a biosonar system known as echolocation.
This system operates across extraordinary frequency bandwidths, allowing animals to navigate, forage, and detect micro-anatomical prey features in environments of zero ambient light.
To produce ultrasonic clicks, air is forced through specialized pressurized nasal passages containing paired fatty structures termed phonic lips.
Vibrations generated at these phonic lips are not transmitted directly into open water. Instead, the acoustic pulse is propagated into the melon—an elliptical, lipid-rich organ situated in the forehead.
The melon acts as an organic acoustic lens, focusing divergent sound waves into a tight, directional beam projected forward into the ocean column.
When this ultrasonic pulse strikes an organism or submerged obstacle, reflected echoes bounce back toward the cetacean.
Curiously, returning signals are not received primarily through the external ear canals, which are degenerate and sealed with vestigial wax.
Instead, returning acoustic vibrations penetrate the lower jawbone, which is hollow and filled with low-viscosity acoustic lipids that channel vibrations directly to the tympanoperiotic bone of the middle ear.
From here, high-speed neural pathways convey signals to the auditory cortex, enabling the animal to construct a three-dimensional cognitive map of its surroundings.
However, in recent decades, this evolutionary mastery has encountered severe disruption from anthropogenic ocean noise.
Commercial cargo vessels produce continuous low-frequency noise pollution that overlaps with the communicative whistles and foraging clicks of coastal delphinids.
Furthermore, industrial offshore pile-driving during offshore wind turbine construction generates massive acoustic shockwaves capable of causing permanent hearing loss in harbor porpoises.
Even more critical are deep-water naval exercises utilizing active mid-frequency sonar.
Exposure to intense sonar pulses causes beaked whales to panic and execute rapid, panicked vertical ascents, triggering lethal decompression sickness similar to the bends in human scuba divers.
In response to this ecological crisis, several marine sanctuaries have mandated vessel speed restrictions, reducing noise cavitation by up to fifty percent.
Additionally, research consortia are deploying networks of autonomous acoustic buoys to track whale pods in real time, automatically notifying commercial vessels to reroute away from vital migratory corridors.`,
    transcriptSegments: [
      {
        speaker: "Prof. Thorne",
        startTime: "0:02",
        endTime: "0:14",
        text: "Good morning. Today we continue our examination of sensory adaptations in aquatic mammals by analyzing the bioacoustics of odontocetes—the toothed whales, dolphins, and porpoises.",
      },
      {
        speaker: "Prof. Thorne",
        startTime: "0:15",
        endTime: "0:28",
        text: "To produce ultrasonic clicks, air is forced through specialized pressurized nasal passages containing paired fatty structures termed phonic lips.",
        questionRef: "lq-31",
      },
      {
        speaker: "Prof. Thorne",
        startTime: "0:29",
        endTime: "0:42",
        text: "Instead, the acoustic pulse is propagated into the melon—an elliptical, lipid-rich organ situated in the forehead.",
        questionRef: "lq-32",
      },
      {
        speaker: "Prof. Thorne",
        startTime: "0:43",
        endTime: "0:56",
        text: "Curiously, returning signals are not received primarily through the external ear canals... instead, returning acoustic vibrations penetrate the lower jawbone.",
        questionRef: "lq-33",
      },
      {
        speaker: "Prof. Thorne",
        startTime: "0:57",
        endTime: "1:11",
        text: "From here, high-speed neural pathways convey signals to the auditory cortex, enabling the animal to construct a three-dimensional cognitive map of its surroundings.",
        questionRef: "lq-34",
      },
      {
        speaker: "Prof. Thorne",
        startTime: "1:12",
        endTime: "1:25",
        text: "This system operates across extraordinary frequency bandwidths, allowing animals to navigate, forage, and detect prey features in environments of zero ambient light.",
        questionRef: "lq-35",
      },
      {
        speaker: "Prof. Thorne",
        startTime: "1:26",
        endTime: "1:39",
        text: "Commercial cargo vessels produce continuous low-frequency noise pollution that overlaps with the communicative whistles and foraging clicks of coastal delphinids.",
        questionRef: "lq-36",
      },
      {
        speaker: "Prof. Thorne",
        startTime: "1:40",
        endTime: "1:54",
        text: "Furthermore, industrial offshore pile-driving during offshore wind turbine construction generates massive acoustic shockwaves capable of causing permanent hearing loss in harbor porpoises.",
        questionRef: "lq-37",
      },
      {
        speaker: "Prof. Thorne",
        startTime: "1:55",
        endTime: "2:09",
        text: "Even more critical are deep-water naval exercises utilizing active mid-frequency sonar, triggering lethal decompression sickness.",
        questionRef: "lq-38",
      },
      {
        speaker: "Prof. Thorne",
        startTime: "2:10",
        endTime: "2:23",
        text: "In response to this ecological crisis, several marine sanctuaries have mandated vessel speed restrictions, reducing noise cavitation by up to fifty percent.",
        questionRef: "lq-39",
      },
      {
        speaker: "Prof. Thorne",
        startTime: "2:24",
        endTime: "2:38",
        text: "Additionally, research consortia are deploying networks of autonomous acoustic buoys to track whale pods in real time, automatically notifying commercial vessels to reroute.",
        questionRef: "lq-40",
      },
    ],
    questions: [
      {
        id: "lq-31",
        number: 31,
        partNumber: 4,
        typeId: "sentence_completion",
        typeLabel: "Sentence Completion",
        prompt: "Ultrasonic clicks are generated by forcing pressurized air past the [_____] inside nasal passages.",
        instruction: "Write NO MORE THAN TWO WORDS for each answer.",
        correctAnswer: "phonic lips",
        acceptedVariants: ["phonic lips"],
        maxWords: 2,
        allowNumber: false,
        wordLimitRule: "NO MORE THAN TWO WORDS",
        transcriptTimestamp: "0:15",
        evidenceQuote: "To produce ultrasonic clicks, air is forced through specialized pressurized nasal passages containing paired fatty structures termed phonic lips.",
        explanation: "Prof. Thorne identifies the phonic lips as the structures generating clicks.",
        distractorTrap: "Melon focuses the beam, but phonic lips generate the initial vibration.",
        strategyTip: "Look for the specific anatomical component that generates the sound.",
      },
      {
        id: "lq-32",
        number: 32,
        partNumber: 4,
        typeId: "note_completion",
        typeLabel: "Note Completion",
        prompt: "Acoustic Lens: Divergent sound waves are focused forward by a forehead organ known as the [_____].",
        instruction: "Write ONE WORD ONLY for each answer.",
        correctAnswer: "melon",
        acceptedVariants: ["melon", "Melon"],
        maxWords: 1,
        allowNumber: false,
        wordLimitRule: "ONE WORD ONLY",
        transcriptTimestamp: "0:29",
        evidenceQuote: "...the acoustic pulse is propagated into the melon—an elliptical, lipid-rich organ situated in the forehead.",
        explanation: "The forehead organ is called the melon.",
        distractorTrap: "Do not write 'fatty organ' or 'acoustic lens'; the specific noun is melon.",
        strategyTip: "Biological terms are stated clearly after definition phrases like 'known as' or 'termed'.",
      },
      {
        id: "lq-33",
        number: 33,
        partNumber: 4,
        typeId: "sentence_completion",
        typeLabel: "Sentence Completion",
        prompt: "Returning acoustic echoes enter through lipid channels located inside the animal's lower [_____].",
        instruction: "Write ONE WORD ONLY for each answer.",
        correctAnswer: "jawbone",
        acceptedVariants: ["jawbone", "jaw"],
        maxWords: 1,
        allowNumber: false,
        wordLimitRule: "ONE WORD ONLY",
        transcriptTimestamp: "0:43",
        evidenceQuote: "...returning acoustic vibrations penetrate the lower jawbone, which is hollow and filled with low-viscosity acoustic lipids...",
        explanation: "Echoes enter via the lower jawbone.",
        distractorTrap: "External ear canals are mentioned as degenerate and sealed.",
        strategyTip: "Contrast what does NOT work (ear canals) with what does (jawbone).",
      },
      {
        id: "lq-34",
        number: 34,
        partNumber: 4,
        typeId: "note_completion",
        typeLabel: "Note Completion",
        prompt: "Signals are relayed from the middle ear directly to the auditory [_____] for spatial cognitive processing.",
        instruction: "Write ONE WORD ONLY for each answer.",
        correctAnswer: "cortex",
        acceptedVariants: ["cortex"],
        maxWords: 1,
        allowNumber: false,
        wordLimitRule: "ONE WORD ONLY",
        transcriptTimestamp: "0:57",
        evidenceQuote: "From here, high-speed neural pathways convey signals to the auditory cortex...",
        explanation: "Prof. Thorne specifies the auditory cortex.",
        distractorTrap: "Auditory is already printed in the question prompt.",
        strategyTip: "Ensure you do not repeat the word printed directly preceding the blank.",
      },
      {
        id: "lq-35",
        number: 35,
        partNumber: 4,
        typeId: "summary_completion",
        typeLabel: "Summary Completion",
        prompt: "Echolocation allows toothed cetaceans to hunt effectively in conditions of zero ambient [_____].",
        instruction: "Write ONE WORD ONLY for each answer.",
        correctAnswer: "light",
        acceptedVariants: ["light"],
        maxWords: 1,
        allowNumber: false,
        wordLimitRule: "ONE WORD ONLY",
        transcriptTimestamp: "1:12",
        evidenceQuote: "...allowing animals to navigate, forage, and detect micro-anatomical prey features in environments of zero ambient light.",
        explanation: "The lecture states zero ambient light.",
        distractorTrap: "Ambient is printed in prompt; write only light.",
        strategyTip: "Collocates with 'zero ambient...'",
      },
      {
        id: "lq-36",
        number: 36,
        partNumber: 4,
        typeId: "sentence_completion",
        typeLabel: "Sentence Completion",
        prompt: "Commercial cargo vessels generate low-frequency [_____] that interferes with delphinid communicative whistles.",
        instruction: "Write NO MORE THAN TWO WORDS for each answer.",
        correctAnswer: "noise pollution",
        acceptedVariants: ["noise pollution", "noise"],
        maxWords: 2,
        allowNumber: false,
        wordLimitRule: "NO MORE THAN TWO WORDS",
        transcriptTimestamp: "1:26",
        evidenceQuote: "Commercial cargo vessels produce continuous low-frequency noise pollution that overlaps with the communicative whistles...",
        explanation: "Cargo ships generate low-frequency noise pollution.",
        distractorTrap: "Cavitation is mentioned later in the lecture regarding vessel speed.",
        strategyTip: "Match the compound noun phrase modifying low-frequency.",
      },
      {
        id: "lq-37",
        number: 37,
        partNumber: 4,
        typeId: "summary_completion",
        typeLabel: "Summary Completion",
        prompt: "Offshore pile-driving produces shockwaves capable of causing permanent [_____] in harbor porpoises.",
        instruction: "Write NO MORE THAN TWO WORDS for each answer.",
        correctAnswer: "hearing loss",
        acceptedVariants: ["hearing loss"],
        maxWords: 2,
        allowNumber: false,
        wordLimitRule: "NO MORE THAN TWO WORDS",
        transcriptTimestamp: "1:40",
        evidenceQuote: "...acoustic shockwaves capable of causing permanent hearing loss in harbor porpoises.",
        explanation: "Shockwaves cause permanent hearing loss.",
        distractorTrap: "'Permanent' is in the prompt; write 'hearing loss'.",
        strategyTip: "Identify the medical or physiological damage suffered.",
      },
      {
        id: "lq-38",
        number: 38,
        partNumber: 4,
        typeId: "note_completion",
        typeLabel: "Note Completion",
        prompt: "Beaked whales develop decompression sickness when exposed to naval [_____] exercises.",
        instruction: "Write ONE WORD ONLY for each answer.",
        correctAnswer: "sonar",
        acceptedVariants: ["sonar"],
        maxWords: 1,
        allowNumber: false,
        wordLimitRule: "ONE WORD ONLY",
        transcriptTimestamp: "1:55",
        evidenceQuote: "Even more critical are deep-water naval exercises utilizing active mid-frequency sonar.",
        explanation: "Prof. Thorne attributes decompression sickness to naval sonar exercises.",
        distractorTrap: "Mid-frequency describes the sonar, but sonar is the core noun.",
        strategyTip: "Write the key technological system causing the panic response.",
      },
      {
        id: "lq-39",
        number: 39,
        partNumber: 4,
        typeId: "sentence_completion",
        typeLabel: "Sentence Completion",
        prompt: "Marine sanctuaries have successfully lowered acoustic cavitation by imposing vessel speed [_____].",
        instruction: "Write ONE WORD ONLY for each answer.",
        correctAnswer: "restrictions",
        acceptedVariants: ["restrictions", "limits"],
        maxWords: 1,
        allowNumber: false,
        wordLimitRule: "ONE WORD ONLY",
        transcriptTimestamp: "2:10",
        evidenceQuote: "...several marine sanctuaries have mandated vessel speed restrictions, reducing noise cavitation...",
        explanation: "Sanctuaries mandated speed restrictions.",
        distractorTrap: "Vessel speed is in the prompt; write only restrictions.",
        strategyTip: "Check which noun collocates with 'vessel speed...'",
      },
      {
        id: "lq-40",
        number: 40,
        partNumber: 4,
        typeId: "note_completion",
        typeLabel: "Note Completion",
        prompt: "Real-time whale pod tracking is achieved using autonomous acoustic [_____].",
        instruction: "Write ONE WORD ONLY for each answer.",
        correctAnswer: "buoys",
        acceptedVariants: ["buoys", "acoustic buoys"],
        maxWords: 1,
        allowNumber: false,
        wordLimitRule: "ONE WORD ONLY",
        transcriptTimestamp: "2:24",
        evidenceQuote: "Additionally, research consortia are deploying networks of autonomous acoustic buoys to track whale pods in real time...",
        explanation: "The tracking devices are acoustic buoys.",
        distractorTrap: "Autonomous acoustic is already partially in the prompt.",
        strategyTip: "Spelling of 'buoys' is crucial (B-U-O-Y-S).",
      },
    ],
  },
];

// ============================================================================
// 4. ROBUST ANSWER NORMALIZATION & MARKING ENGINE
// ============================================================================

export interface AnswerValidationResult {
  isCorrect: boolean;
  scoreAwarded: number;
  wordCount: number;
  numberCount: number;
  totalTokens: number;
  wordLimitExceeded: boolean;
  statusMessage: string;
}

export interface ValidateListeningAnswerOptions {
  correctAnswer: string;
  acceptedVariants?: string[];
  maxWords?: number;
  allowNumber?: boolean;
  maxNumbers?: number;
  wordLimitRule?: string;
  typeId?: string;
}

export function normalizeAnswer(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[.,;:!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isNumericToken(token: string): boolean {
  if (!token) return false;
  // Strip trailing ordinal markers (e.g. 1st, 2nd, 3rd, 18th)
  const stripped = token.replace(/(\d+)(st|nd|rd|th)$/i, "$1");
  // Check pure digits or decimals, currency symbols, percentages
  if (/^[$£€]?\d+(\.\d+)?%?$/.test(stripped)) return true;
  // Spelled-out number words
  const numberWords = new Set([
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
    "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety", "hundred", "thousand", "million",
    "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth",
    "eighteenth", "twenty-fourth",
  ]);
  return numberWords.has(token.toLowerCase());
}

export function countIeltsTokens(text: string): {
  wordCount: number;
  numberCount: number;
  totalTokens: number;
} {
  if (!text) return { wordCount: 0, numberCount: 0, totalTokens: 0 };
  // Normalize internal hyphen spaces: "two - pound" -> "two-pound"
  const cleaned = text.trim().replace(/\s*-\s*/g, "-");
  if (!cleaned) return { wordCount: 0, numberCount: 0, totalTokens: 0 };

  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  let wordCount = 0;
  let numberCount = 0;

  for (const token of rawTokens) {
    const norm = token.replace(/^["'`(\[]+|["'`).,;:!?\]]+$/g, "");
    if (!norm) continue;
    if (isNumericToken(norm)) {
      numberCount++;
    } else {
      wordCount++;
    }
  }

  return {
    wordCount,
    numberCount,
    totalTokens: wordCount + numberCount,
  };
}

export function extractChoiceLetters(str: string): string[] {
  if (!str) return [];
  const matches = str.toUpperCase().match(/\b[A-H]\b/g);
  return matches ? Array.from(new Set(matches)).sort() : [];
}

/**
 * Validates a student's listening response against the question answer key and IELTS word constraints.
 * 
 * Rules:
 * - Word limit breach results in 0 score and clear warning.
 * - Hyphenated words are counted as a single word.
 * - Punctuation and casing are normalized.
 * - Standard British and American spellings are supported.
 * - Equivalence for spelled-out numbers vs digits (e.g., "18" == "18th" == "eighteenth").
 */
export function validateListeningAnswer(
  studentAnswer: string,
  question: ValidateListeningAnswerOptions
): AnswerValidationResult {
  const normStudent = normalizeAnswer(studentAnswer);
  const tokenMetrics = countIeltsTokens(normStudent);

  // Derive constraints from wordLimitRule if not explicitly specified
  let maxWords = question.maxWords;
  let allowNumber = question.allowNumber;
  let maxNumbers = question.maxNumbers;

  if (question.wordLimitRule) {
    const ruleUpper = question.wordLimitRule.toUpperCase();
    if (ruleUpper.includes("ONE NUMBER ONLY")) {
      maxWords = 0;
      maxNumbers = 1;
      allowNumber = true;
    } else if (ruleUpper.includes("THREE WORDS")) {
      if (maxWords === undefined) maxWords = 3;
    } else if (ruleUpper.includes("TWO WORDS")) {
      if (maxWords === undefined) maxWords = 2;
    } else if (ruleUpper.includes("ONE WORD")) {
      if (maxWords === undefined) maxWords = 1;
    }

    if (allowNumber === undefined) {
      if (ruleUpper.includes("AND/OR A NUMBER") || ruleUpper.includes("OR A NUMBER") || ruleUpper.includes("A NUMBER")) {
        allowNumber = true;
      } else if (ruleUpper.includes("ONLY") || !ruleUpper.includes("NUMBER")) {
        allowNumber = false;
      }
    }
  }

  // 1. Check for empty answer
  if (!normStudent) {
    return {
      isCorrect: false,
      scoreAwarded: 0,
      wordCount: 0,
      numberCount: 0,
      totalTokens: 0,
      wordLimitExceeded: false,
      statusMessage: "No answer provided.",
    };
  }

  // 2. Strict word-limit enforcement
  if (maxWords !== undefined && tokenMetrics.wordCount > maxWords) {
    return {
      isCorrect: false,
      scoreAwarded: 0,
      wordCount: tokenMetrics.wordCount,
      numberCount: tokenMetrics.numberCount,
      totalTokens: tokenMetrics.totalTokens,
      wordLimitExceeded: true,
      statusMessage: `Word limit exceeded: submitted ${tokenMetrics.wordCount} words (maximum allowed is ${maxWords}). 0 marks awarded.`,
    };
  }

  if (allowNumber === false && tokenMetrics.numberCount > 0) {
    return {
      isCorrect: false,
      scoreAwarded: 0,
      wordCount: tokenMetrics.wordCount,
      numberCount: tokenMetrics.numberCount,
      totalTokens: tokenMetrics.totalTokens,
      wordLimitExceeded: true,
      statusMessage: `Number not permitted: answer contains ${tokenMetrics.numberCount} numerical token(s) when words only are required.`,
    };
  }

  if (maxNumbers !== undefined && tokenMetrics.numberCount > maxNumbers) {
    return {
      isCorrect: false,
      scoreAwarded: 0,
      wordCount: tokenMetrics.wordCount,
      numberCount: tokenMetrics.numberCount,
      totalTokens: tokenMetrics.totalTokens,
      wordLimitExceeded: true,
      statusMessage: `Number limit exceeded: submitted ${tokenMetrics.numberCount} numbers (maximum allowed is ${maxNumbers}).`,
    };
  }

  // 3. Multi-choice letters handling (e.g. "A, C" or "Choose TWO")
  const normCorrect = normalizeAnswer(question.correctAnswer);
  const correctChoiceLetters = extractChoiceLetters(normCorrect);
  const studentChoiceLetters = extractChoiceLetters(normStudent);

  if (correctChoiceLetters.length > 1 && studentChoiceLetters.length > 0) {
    const isMultiMatch =
      correctChoiceLetters.length === studentChoiceLetters.length &&
      correctChoiceLetters.every((l, idx) => l === studentChoiceLetters[idx]);

    return {
      isCorrect: isMultiMatch,
      scoreAwarded: isMultiMatch ? 1 : 0,
      wordCount: tokenMetrics.wordCount,
      numberCount: tokenMetrics.numberCount,
      totalTokens: tokenMetrics.totalTokens,
      wordLimitExceeded: false,
      statusMessage: isMultiMatch
        ? "Correct multiple-choice combination."
        : `Selected [${studentChoiceLetters.join(", ")}], but correct selection is [${correctChoiceLetters.join(", ")}].`,
    };
  }

  // 4. Exact and Accepted Variant Matching
  const candidateKeys = [question.correctAnswer, ...(question.acceptedVariants || [])];
  for (const rawKey of candidateKeys) {
    const normKey = normalizeAnswer(rawKey);

    // Direct string equality
    if (normStudent === normKey) {
      return {
        isCorrect: true,
        scoreAwarded: 1,
        wordCount: tokenMetrics.wordCount,
        numberCount: tokenMetrics.numberCount,
        totalTokens: tokenMetrics.totalTokens,
        wordLimitExceeded: false,
        statusMessage: "Correct.",
      };
    }

    // Single choice letter match
    if (/^[A-H]$/i.test(normStudent) && /^[A-H]$/i.test(normKey)) {
      if (normStudent.toUpperCase() === normKey.toUpperCase()) {
        return {
          isCorrect: true,
          scoreAwarded: 1,
          wordCount: tokenMetrics.wordCount,
          numberCount: tokenMetrics.numberCount,
          totalTokens: tokenMetrics.totalTokens,
          wordLimitExceeded: false,
          statusMessage: "Correct choice selected.",
        };
      }
    }

    // Number equality (e.g. "18th" == "18", "two" == "2")
    const studentNumeric = normStudent.replace(/(\d+)(st|nd|rd|th)$/i, "$1");
    const keyNumeric = normKey.replace(/(\d+)(st|nd|rd|th)$/i, "$1");
    if (studentNumeric === keyNumeric) {
      return {
        isCorrect: true,
        scoreAwarded: 1,
        wordCount: tokenMetrics.wordCount,
        numberCount: tokenMetrics.numberCount,
        totalTokens: tokenMetrics.totalTokens,
        wordLimitExceeded: false,
        statusMessage: "Correct numerical answer.",
      };
    }

    // Spelled number equivalence map
    const wordToNumMap: Record<string, string> = {
      zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5",
      six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
      eleven: "11", twelve: "12", thirteen: "13", fourteen: "14", fifteen: "15",
      sixteen: "16", seventeen: "17", eighteen: "18", nineteen: "19", twenty: "20",
      thirty: "30", forty: "40", fifty: "50", sixty: "60", seventy: "70", eighty: "80", ninety: "90",
      first: "1", second: "2", third: "3", fourth: "4", fifth: "5",
      sixth: "6", seventh: "7", eighth: "8", ninth: "9", tenth: "10",
      eleventh: "11", twelfth: "12", thirteenth: "13", fourteenth: "14", fifteenth: "15",
      sixteenth: "16", seventeenth: "17", eighteenth: "18", nineteenth: "19", twentieth: "20",
      "twenty-fourth": "24", twentyfourth: "24",
      "twenty-fifth": "25", twentyfifth: "25",
    };
    if (
      wordToNumMap[studentNumeric] === keyNumeric ||
      wordToNumMap[keyNumeric] === studentNumeric
    ) {
      return {
        isCorrect: true,
        scoreAwarded: 1,
        wordCount: tokenMetrics.wordCount,
        numberCount: tokenMetrics.numberCount,
        totalTokens: tokenMetrics.totalTokens,
        wordLimitExceeded: false,
        statusMessage: "Correct (numerical word equivalent).",
      };
    }
  }

  // 5. Incorrect
  return {
    isCorrect: false,
    scoreAwarded: 0,
    wordCount: tokenMetrics.wordCount,
    numberCount: tokenMetrics.numberCount,
    totalTokens: tokenMetrics.totalTokens,
    wordLimitExceeded: false,
    statusMessage: `Incorrect. Expected '${question.correctAnswer}'.`,
  };
}
