/**
 * BandBloom IELTS SaaS - Practice Catalog Data & Shared Types
 * 
 * Safe for both Client Components and Server Components.
 * Contains canonical practice passages, prompts, rubrics, and types.
 */

export interface ReadingQuestion {
  id: string;
  number: number;
  type: "True/False/Not Given" | "Sentence Completion" | "Matching Headings";
  prompt: string;
  options?: string[];
  correctAnswer: string;
  evidenceParagraph: "A" | "B" | "C" | "D" | "Notice 1" | "Notice 2" | "Notice 3";
  evidenceText: string;
  explanation: string;
  errorTrap: string;
}

export interface ReadingPassageData {
  id: string;
  stream: "academic" | "general_training";
  title: string;
  estimatedMinutes: number;
  paragraphs: { label: string; text: string }[];
  questions: ReadingQuestion[];
}

export interface ListeningQuestion {
  id: string;
  number: number;
  type: "Form Completion" | "Multiple Choice" | "Short Answer";
  prompt: string;
  options?: string[];
  correctAnswer: string;
  transcriptTimestamp: string;
  explanation: string;
}

export interface ListeningActivityData {
  id: string;
  title: string;
  accent: string;
  durationSeconds: number;
  audioUrl?: string;
  dialogueTranscript: string;
  questions: ListeningQuestion[];
  disclaimer?: string;
  syntheticNotice?: string;
}

export interface WritingTaskData {
  id: string;
  type: "academic_task1" | "gt_task1" | "task2";
  title: string;
  stream: "academic" | "general_training" | "both";
  prompt: string;
  contextData?: string;
  minWords: number;
  recommendedMinutes: number;
  criteria: string[];
}

export interface SpeakingCueCardData {
  id: string;
  part: number;
  title: string;
  prompt: string;
  bulletPoints: string[];
  prepTimeSeconds: number;
  speakTimeSeconds: number;
  followUpQuestions: string[];
}

export interface ReadingEvaluationResult {
  score: number;
  total: number;
  percentage: number;
  estimatedBand: number;
  questionResults: {
    questionId: string;
    number: number;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    evidenceParagraph: string;
    evidenceText: string;
    explanation: string;
    errorTrap: string;
  }[];
  mistakesToRecord: {
    skill: "reading";
    errorTag: string;
    questionPrompt: string;
    studentAnswer: string;
    correctAnswer: string;
    reasoning: string;
  }[];
}

export interface ListeningEvaluationResult {
  score: number;
  total: number;
  percentage: number;
  estimatedBand: number;
  questionResults: {
    questionId: string;
    number: number;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    transcriptTimestamp: string;
  }[];
  mistakesToRecord: {
    skill: "listening";
    errorTag: string;
    questionPrompt: string;
    studentAnswer: string;
    correctAnswer: string;
    reasoning: string;
  }[];
}

export interface WritingEvaluationResult {
  task1: {
    wordCount: number;
    minRequired: number;
    meetsLengthRequirement: boolean;
    warningMessage?: string;
    estimatedBand: number;
    rubric: {
      criterion: string;
      band: number;
      feedback: string;
    }[];
  };
  task2: {
    wordCount: number;
    minRequired: number;
    meetsLengthRequirement: boolean;
    warningMessage?: string;
    estimatedBand: number;
    rubric: {
      criterion: string;
      band: number;
      feedback: string;
    }[];
  };
  compositeWritingBand: number;
  weightingNotice: string;
  indicativeDisclaimer: string;
  actionableSuggestions: string[];
}

export interface SpeakingEvaluationResult {
  durationSeconds: number;
  recognizedTranscript: string;
  originalTranscript?: string; // Backwards-compatible alias for recognizedTranscript
  studentEditedTranscript: string;
  transcriptPreservedSeparately: boolean;
  estimatedBand: number | null; // NULL: No overall band issued for partial diagnostic (IELTS Speaking requires all 4 criteria)
  overallBandStatus: "partial_diagnostic" | "evaluated" | "unavailable";
  overallNotice: string;
  evaluatedCriteriaCount: number;
  rubric: {
    criterion: string;
    band: number | null;
    status: "evaluated" | "assessment_limited";
    feedback: string;
  }[];
  pronunciationNotice: string;
  indicativeDisclaimer: string;
}

export interface PracticeHubSummary {
  profile: {
    testType: "academic" | "general_training";
    targetBand: number;
  };
  recommendation: {
    type: "study_plan_task" | "mistake_notebook_weakness" | "starter_recommendation";
    title: string;
    description: string;
    skill: "reading" | "listening" | "writing" | "speaking";
    actionHref: string;
    labKey: string;
    badge: string;
    estimatedMinutes: number;
  } | null;
  activeAttempt: {
    id: string;
    examTitle: string;
    startedAt: string;
    deadlineAt: string | null;
  } | null;
  recentAttemptsCount: number;
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ============================================================================
// CANONICAL PRACTICE CONTENT CATALOG
// ============================================================================

export const ACADEMIC_READING_PASSAGE: ReadingPassageData = {
  id: "read-acad-megacities",
  stream: "academic",
  title: "The Architecture of Megacities and Climate Adaptation",
  estimatedMinutes: 20,
  paragraphs: [
    {
      label: "A",
      text: "As global temperatures rise and severe weather incidents escalate, coastal metropolitan regions are pioneering radical civil engineering initiatives. Urban planners can no longer rely on conventional stormwater drainage constructed during the 20th century. Instead, cities such as Rotterdam, Tokyo, and Singapore have developed subterranean flood storage reservoirs and permeable pavement infrastructure.",
    },
    {
      label: "B",
      text: "Critics initially claimed that the exorbitant capital expenditure of underground cisterns would outweigh their ecological utility. However, post-monsoon economic assessments demonstrated that Tokyo's underground G-Cans flood barrier system averted billions of dollars in commercial damage during catastrophic rainfall events. Consequently, several other Asian capitals are now constructing analogous drainage labyrinths.",
    },
    {
      label: "C",
      text: "Beyond mechanical water containment, modern ecological design prioritizes 'sponge city' architectures. These initiatives replace concrete surfaces with bioswales, retention wetlands, and green rooftop canopies. Studies conducted by architectural consortia show that green roofs reduce ambient roof temperatures by up to 15 degrees Celsius while purifying urban runoff.",
    },
    {
      label: "D",
      text: "Nevertheless, implementing sponge city principles in historically dense cities presents daunting logistical impediments. Heritage districts often feature subterranean utilities, antiquated masonry, and strict conservation covenants that forbid structural modifications. Consequently, municipal engineers recommend a hybrid approach where outer suburban belts act as hydrological buffers while inner cores undergo localized retrofitting.",
    },
  ],
  questions: [
    {
      id: "rq-acad-1",
      number: 1,
      type: "True/False/Not Given",
      prompt: "Rotterdam and Singapore have implemented subterranean water storage systems to manage severe weather.",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      correctAnswer: "TRUE",
      evidenceParagraph: "A",
      evidenceText: "Instead, cities such as Rotterdam, Tokyo, and Singapore have developed subterranean flood storage reservoirs and permeable pavement infrastructure. (Paragraph A)",
      explanation: "Paragraph A explicitly names Rotterdam, Tokyo, and Singapore as having developed subterranean flood storage reservoirs.",
      errorTrap: "Keyword Trap: Always confirm each city named in the question stem matches the text.",
    },
    {
      id: "rq-acad-2",
      number: 2,
      type: "True/False/Not Given",
      prompt: "Underground flood mitigation systems in Tokyo cost more to maintain than the commercial damage prevented.",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      correctAnswer: "FALSE",
      evidenceParagraph: "B",
      evidenceText: "Post-monsoon economic assessments demonstrated that Tokyo's underground G-Cans flood barrier system averted billions of dollars in commercial damage during catastrophic rainfall events. (Paragraph B)",
      explanation: "The passage asserts that averted damages reached billions of dollars, contradicting the claim that maintenance costs outweighed commercial savings.",
      errorTrap: "Antonym Trap: The passage disproved initial critic assertions.",
    },
    {
      id: "rq-acad-3",
      number: 3,
      type: "True/False/Not Given",
      prompt: "The European Union provided majority funding for Tokyo's G-Cans flood project.",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      correctAnswer: "NOT GIVEN",
      evidenceParagraph: "B",
      evidenceText: "Paragraph B discusses Tokyo's G-Cans system benefits, but provides no reference to who funded the engineering.",
      explanation: "While Tokyo's G-Cans project is detailed, the passage makes no mention whatsoever of European Union funding.",
      errorTrap: "Extraneous Assumption: Do not extrapolate outside political or economic facts into IELTS Reading.",
    },
    {
      id: "rq-acad-4",
      number: 4,
      type: "Sentence Completion",
      prompt: "Green roofs can lower ambient roof temperatures by as much as _________ degrees Celsius.",
      options: ["5", "10", "15", "25"],
      correctAnswer: "15",
      evidenceParagraph: "C",
      evidenceText: "Studies conducted by architectural consortia show that green roofs reduce ambient roof temperatures by up to 15 degrees Celsius while purifying urban runoff. (Paragraph C)",
      explanation: "Paragraph C explicitly specifies 'up to 15 degrees Celsius'.",
      errorTrap: "Scanning Qualifier: Note the quantifier 'by as much as' matching 'up to'.",
    },
  ],
};

export const GT_READING_PASSAGE: ReadingPassageData = {
  id: "read-gt-fire-safety",
  stream: "general_training",
  title: "Workplace Fire Safety and Emergency Evacuation Procedures",
  estimatedMinutes: 20,
  paragraphs: [
    {
      label: "Notice 1",
      text: "All personnel must familiarize themselves with the two-tone emergency alarm. An intermittent pulsing siren indicates a localized cautionary alert, requiring staff to stand by at their workstations. A continuous unbroken tone signals mandatory evacuation of the facility.",
    },
    {
      label: "Notice 2",
      text: "Staff occupying Wing A and Wing B must exit via Stairwell 3 and proceed immediately to Assembly Point C located in the southern staff car park. Under no circumstances should passenger elevators be used during an evacuation alarm.",
    },
    {
      label: "Notice 3",
      text: "Department floor wardens are solely responsible for verifying roll calls using the digital visitor manifest. Visitors must remain stationed at Assembly Point C until the Chief Safety Officer declares the operational all-clear.",
    },
  ],
  questions: [
    {
      id: "rq-gt-1",
      number: 1,
      type: "True/False/Not Given",
      prompt: "A pulsing alarm tone instructs all staff to immediately evacuate the building.",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      evidenceParagraph: "Notice 1",
      evidenceText: "An intermittent pulsing siren indicates a localized cautionary alert, requiring staff to stand by at their workstations. A continuous unbroken tone signals mandatory evacuation.",
      correctAnswer: "FALSE",
      explanation: "Notice 1 explains that a pulsing siren means staff must stand by, whereas an unbroken continuous tone signals evacuation.",
      errorTrap: "Alarm Differentiation: Pulsing is stand-by; continuous is evacuation.",
    },
    {
      id: "rq-gt-2",
      number: 2,
      type: "True/False/Not Given",
      prompt: "Staff in Wing A may use passenger elevators if stairwells are congested.",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      evidenceParagraph: "Notice 2",
      evidenceText: "Under no circumstances should passenger elevators be used during an evacuation alarm.",
      correctAnswer: "FALSE",
      explanation: "Notice 2 explicitly specifies 'Under no circumstances should passenger elevators be used'.",
      errorTrap: "Absolute Prohibition: 'Under no circumstances' leaves no exception.",
    },
    {
      id: "rq-gt-3",
      number: 3,
      type: "True/False/Not Given",
      prompt: "Department floor wardens must print hard copies of the visitor manifest before 9:00 AM each morning.",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      evidenceParagraph: "Notice 3",
      evidenceText: "Department floor wardens are solely responsible for verifying roll calls using the digital visitor manifest.",
      correctAnswer: "NOT GIVEN",
      explanation: "Notice 3 states that wardens verify roll calls using a digital manifest, but nowhere mentions printing paper copies or a 9:00 AM deadline.",
      errorTrap: "Unsubstantiated Operational Detail: Digital manifest does not imply printing.",
    },
    {
      id: "rq-gt-4",
      number: 4,
      type: "Sentence Completion",
      prompt: "Staff exiting via Stairwell 3 must gather at Assembly Point _________ in the southern car park.",
      options: ["A", "B", "C", "D"],
      evidenceParagraph: "Notice 2",
      evidenceText: "Staff occupying Wing A and Wing B must exit via Stairwell 3 and proceed immediately to Assembly Point C located in the southern staff car park.",
      correctAnswer: "C",
      explanation: "Notice 2 specifies Assembly Point C.",
      errorTrap: "Location Detail: Confirm the letter designation of the assembly zone.",
    },
  ],
};

export const LISTENING_ACTIVITY: ListeningActivityData = {
  id: "listen-campus-tour",
  title: "Campus Tour Booking & University Services Dialogue",
  accent: "Synthetic British/Australian Approximation (Local Browser Voices)",
  disclaimer: "Original BandBloom Practice Dialogue (Unofficial Practice Material — Not affiliated with Cambridge, IDP, or British Council)",
  syntheticNotice: "Synthesized audio uses the browser's native speech synthesis engine. Accents and timbres depend on local device voices and are synthetic approximations, not certified authentic IELTS recordings.",
  durationSeconds: 180,
  dialogueTranscript: `Tour Officer: Good morning, Cambridge University Visitor Center. How may I help you?
Arthur: Hello, I'd like to book a university campus tour for next week. My name is Arthur Pendelton.
Tour Officer: Excellent, Arthur. Which day are you hoping to visit?
Arthur: We were originally planning for Wednesday the 14th, but my colleague can only make Thursday the 15th. So Thursday the 15th please.
Tour Officer: Perfect. And how many visitors will be in your party?
Arthur: There will be 3 of us—myself and two postgraduate researchers.
Tour Officer: Splendid. Please note that parking is available at the North Gate, but permits must be displayed at all times.`,
  questions: [
    {
      id: "lq-1",
      number: 1,
      type: "Form Completion",
      prompt: "Customer Surname: [_____] (First Name: Arthur)",
      options: ["Pendelton", "Pemberton", "Pennington", "Pendleton"],
      correctAnswer: "Pendelton",
      transcriptTimestamp: "0:12",
      explanation: "Arthur introduces himself clearly: 'My name is Arthur Pendelton.'",
    },
    {
      id: "lq-2",
      number: 2,
      type: "Multiple Choice",
      prompt: "Which date has the campus tour been confirmed for?",
      options: ["Wednesday the 14th", "Thursday the 15th", "Friday the 16th"],
      correctAnswer: "Thursday the 15th",
      transcriptTimestamp: "0:25",
      explanation: "Although Wednesday the 14th was initially considered, Arthur changed the booking to Thursday the 15th because of his colleague's schedule.",
    },
    {
      id: "lq-3",
      number: 3,
      type: "Short Answer",
      prompt: "Total number of visitors in the booking party: [_____]",
      options: ["2", "3", "4", "5"],
      correctAnswer: "3",
      transcriptTimestamp: "0:38",
      explanation: "Arthur says: 'There will be 3 of us—myself and two postgraduate researchers.'",
    },
  ],
};

export const WRITING_TASKS: WritingTaskData[] = [
  {
    id: "write-acad-t1",
    type: "academic_task1",
    title: "Academic Task 1: OECD Energy Consumption Comparison",
    stream: "academic",
    prompt:
      "The table below shows energy consumption by economic sector (Residential, Industrial, Commercial, Transport) across five OECD countries in 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    contextData:
      "Sector Breakdown (%):\n- Country A: Industry 42%, Transport 28%, Residential 18%, Commercial 12%\n- Country B: Industry 22%, Transport 38%, Residential 26%, Commercial 14%\n- Country C: Industry 31%, Transport 33%, Residential 21%, Commercial 15%\n- Country D: Industry 15%, Transport 45%, Residential 24%, Commercial 16%\n- Country E: Industry 38%, Transport 25%, Residential 22%, Commercial 15%",
    minWords: 150,
    recommendedMinutes: 20,
    criteria: [
      "Task Achievement: Accurate overview paragraph with key trends and comparative data",
      "Coherence and Cohesion: Logical grouping by sector or country with clear transitions",
      "Lexical Resource: Precise comparative vocabulary (substantially higher, marginal decrease)",
      "Grammatical Range & Accuracy: Complex structures and accurate passive voice",
    ],
  },
  {
    id: "write-gt-t1",
    type: "gt_task1",
    title: "General Training Task 1: Apartment Maintenance Formal Letter",
    stream: "general_training",
    prompt:
      "You recently moved into a rented flat and noticed that the central water heating unit is malfunctioning and two electrical sockets are defective. Write a formal letter to your property management company. In your letter:\n- State clearly the purpose of your letter and your tenancy details\n- Detail the specific defects and explain how they affect your daily routine\n- Specify the exact remedial action and timeframe you expect.\nWrite at least 150 words.",
    minWords: 150,
    recommendedMinutes: 20,
    criteria: [
      "Task Achievement: Fully covers all 3 bullet points with appropriate formal tone",
      "Coherence and Cohesion: Clear paragraph structure with conventional salutation and sign-off",
      "Lexical Resource: Formal administrative and tenancy terminology",
      "Grammatical Range & Accuracy: Polite modal requests (I would appreciate, please ensure)",
    ],
  },
  {
    id: "write-task2-essay",
    type: "task2",
    title: "Writing Task 2: Free University Education vs Tuition Fees",
    stream: "both",
    prompt:
      "Some people believe that university education should be free for all students, while others argue that students should pay tuition fees because higher education leads to personal career and financial benefits. Discuss both views and give your own opinion. Write at least 250 words.",
    minWords: 250,
    recommendedMinutes: 40,
    criteria: [
      "Task Response: Balanced discussion of both perspectives with a sustained personal thesis",
      "Coherence and Cohesion: 4 or 5 paragraph architecture with logical topic sentences",
      "Lexical Resource: High-tier academic lexicon with collocations (socioeconomic mobility)",
      "Grammatical Range & Accuracy: Varied conditional, relative, and concession clauses",
    ],
  },
];

export const SPEAKING_CUE_CARD: SpeakingCueCardData = {
  id: "speak-part2-cue",
  part: 2,
  title: "Describe an environmental initiative in your locality that you admire.",
  prompt: "You will have 1 minute to prepare your notes and up to 2 minutes to speak on this topic.",
  bulletPoints: [
    "What the initiative is and who organized it",
    "How it functions on a day-to-day basis",
    "What positive changes or improvements have resulted from it",
    "And explain why you personally admire this initiative",
  ],
  prepTimeSeconds: 60,
  speakTimeSeconds: 120,
  followUpQuestions: [
    "Part 3: Do you think individual efforts are sufficient to tackle climate change, or must governments intervene with strict legislation?",
    "Part 3: How can schools encourage children to develop lifelong recycling and conservation habits?",
    "Part 3: What economic trade-offs do developing nations face when transitioning to green infrastructure?",
  ],
};
