/**
 * BandBloom IELTS SaaS - Reading Module Core Domain & Data Library
 * 
 * Provides:
 * 1. Strict Academic vs General Training specifications & format metrics.
 * 2. Indicative Raw Score Conversion Tables (separately maintained for Academic & GT).
 * 3. 14 Essential IELTS Reading Question Types Library with authoritative strategies & traps.
 * 4. Practice Passages, Questions, Evidence Paragraphs, and Verified Answer Keys.
 * 5. Robust Answer Normalization, Word Limit Enforcement & Marking Engine.
 */

export type ReadingStream = "academic" | "general_training";
export type QuestionCategory = "Verification" | "Matching" | "Completion" | "Choice & Inquiry";
export type QuestionTypeStatusTier = "micro_drill" | "strategy_guide" | "passage_lab";

export interface ScoreBandTier {
  band: number;
  rawScoreRange: string;
  minCorrect: number;
  maxCorrect: number;
  description: string;
}

export interface IndicativeScoreGuide {
  stream: ReadingStream;
  streamLabel: string;
  totalQuestions: number;
  testDurationMinutes: number;
  formatDescription: string;
  sourceVersion: string;
  disclaimer: string;
  tiers: ScoreBandTier[];
}

export interface QuestionTypeDefinition {
  id: string;
  name: string;
  category: QuestionCategory;
  stream: "both" | "academic" | "general_training";
  shortExplanation: string;
  skillAssessed: string;
  strategy: string;
  commonMistakes: string[];
  wordLimitRule?: string;
  statusTier: QuestionTypeStatusTier;
  formatHonestyNotice?: string;
  sampleQuestion: {
    instruction: string;
    passageExcerpt: string;
    prompt: string;
    options?: string[];
    correctAnswer: string;
    evidenceText: string;
    explanation: string;
  };
}

export interface ReadingPassageParagraph {
  label: string; // e.g., "A", "B", "C" or "Notice 1", "Section 2"
  title?: string;
  text: string;
}

export interface ReadingQuestionItem {
  id: string;
  number: number;
  typeId: string;
  typeLabel: string;
  prompt: string;
  instruction?: string;
  options?: string[];
  correctAnswer: string;
  acceptedVariants?: string[];
  maxWords?: number;
  evidenceParagraph: string;
  evidenceQuote: string;
  explanation: string;
  distractorTrap: string;
  strategyTip: string;
}

export interface CompleteReadingPassage {
  id: string;
  stream: ReadingStream;
  partNumber: number; // 1, 2, or 3
  title: string;
  subheading?: string;
  wordCount: number;
  estimatedMinutes: number;
  paragraphs: ReadingPassageParagraph[];
  questions: ReadingQuestionItem[];
}

// ============================================================================
// 1. INDICATIVE RAW SCORE GUIDES (ACADEMIC & GENERAL TRAINING)
// ============================================================================

export const ACADEMIC_RAW_SCORE_GUIDE: IndicativeScoreGuide = {
  stream: "academic",
  streamLabel: "IELTS Academic Reading",
  totalQuestions: 40,
  testDurationMinutes: 60,
  formatDescription: "60 minutes · 40 questions · 3 passages (2,150–2,750 words total)",
  sourceVersion: "Official IELTS Cambridge Assessment Standards (2026.1 Reference)",
  disclaimer:
    "Indicative guidance only. IELTS raw-score conversion thresholds can vary slightly between different test versions to account for minor fluctuations in passage difficulty across official administrations. Raw marks are objectively awarded (1 mark per correct answer).",
  tiers: [
    { band: 9.0, rawScoreRange: "39–40", minCorrect: 39, maxCorrect: 40, description: "Expert User: Fully operational command with fluent accuracy." },
    { band: 8.5, rawScoreRange: "37–38", minCorrect: 37, maxCorrect: 38, description: "Very Good User: Handles complex academic prose with rare unsystematic inaccuracies." },
    { band: 8.0, rawScoreRange: "35–36", minCorrect: 35, maxCorrect: 36, description: "Very Good User: Strong comprehension of detailed academic arguments." },
    { band: 7.5, rawScoreRange: "33–34", minCorrect: 33, maxCorrect: 34, description: "Good User: Effective command, grasps implicit meaning in discursive articles." },
    { band: 7.0, rawScoreRange: "30–32", minCorrect: 30, maxCorrect: 32, description: "Good User: Handles academic vocabulary and complex sentence structures reliably." },
    { band: 6.5, rawScoreRange: "27–29", minCorrect: 27, maxCorrect: 29, description: "Competent User: Generally understands main ideas with occasional misunderstanding." },
    { band: 6.0, rawScoreRange: "23–26", minCorrect: 23, maxCorrect: 26, description: "Competent User: Adequate reading comprehension of familiar academic themes." },
    { band: 5.5, rawScoreRange: "19–22", minCorrect: 19, maxCorrect: 22, description: "Modest User: Partial command, struggles with abstract scholarly synthesis." },
    { band: 5.0, rawScoreRange: "15–18", minCorrect: 15, maxCorrect: 18, description: "Modest User: Comprehends basic facts; frequent errors on detailed arguments." },
    { band: 4.5, rawScoreRange: "12–14", minCorrect: 12, maxCorrect: 14, description: "Limited User: Basic comprehension limited to straightforward factual statements." },
    { band: 4.0, rawScoreRange: "10–11", minCorrect: 10, maxCorrect: 11, description: "Limited User: Frequent breakdowns in comprehension when syntax is complex." },
  ],
};

export const GT_RAW_SCORE_GUIDE: IndicativeScoreGuide = {
  stream: "general_training",
  streamLabel: "IELTS General Training Reading",
  totalQuestions: 40,
  testDurationMinutes: 60,
  formatDescription: "60 minutes · 40 questions · 3 sections (Notices, Workplace & General)",
  sourceVersion: "Official IELTS Cambridge Assessment Standards (2026.1 Reference)",
  disclaimer:
    "Indicative guidance only. In General Training Reading, higher raw scores are required to attain corresponding bands compared to Academic Reading, reflecting the everyday and workplace nature of Sections 1 and 2.",
  tiers: [
    { band: 9.0, rawScoreRange: "40", minCorrect: 40, maxCorrect: 40, description: "Expert User: Flawless comprehension across workplace, public, and general texts." },
    { band: 8.5, rawScoreRange: "39", minCorrect: 39, maxCorrect: 39, description: "Very Good User: Near-perfect score with maximum of one error across all 3 sections." },
    { band: 8.0, rawScoreRange: "37–38", minCorrect: 37, maxCorrect: 38, description: "Very Good User: High accuracy on both factual notices and complex Section 3 prose." },
    { band: 7.5, rawScoreRange: "36", minCorrect: 36, maxCorrect: 36, description: "Good User: Solid mastery; minimal errors in everyday and employment material." },
    { band: 7.0, rawScoreRange: "34–35", minCorrect: 34, maxCorrect: 35, description: "Good User: Handles workplace contracts, manuals, and extended general topics." },
    { band: 6.5, rawScoreRange: "32–33", minCorrect: 32, maxCorrect: 33, description: "Competent User: Reliable on Section 1 & 2; minor slips on Section 3 inference." },
    { band: 6.0, rawScoreRange: "30–31", minCorrect: 30, maxCorrect: 31, description: "Competent User: Requires 30 correct marks (vs 23 in Academic) due to shorter texts." },
    { band: 5.5, rawScoreRange: "27–29", minCorrect: 27, maxCorrect: 29, description: "Modest User: Handles basic notices and timetables; struggles with dense text." },
    { band: 5.0, rawScoreRange: "23–26", minCorrect: 23, maxCorrect: 26, description: "Modest User: Understands direct public information; misses implicit nuances." },
    { band: 4.5, rawScoreRange: "19–22", minCorrect: 19, maxCorrect: 22, description: "Limited User: Basic scanning ability for explicit names, dates, and numbers." },
    { band: 4.0, rawScoreRange: "15–18", minCorrect: 15, maxCorrect: 18, description: "Limited User: Frequent difficulty synthesizing operational workplace instructions." },
  ],
};

// ============================================================================
// 2. 14 ESSENTIAL IELTS READING QUESTION TYPES & STRATEGIES
// ============================================================================

export const READING_QUESTION_TYPES: QuestionTypeDefinition[] = [
  // Group 1: Verification
  {
    id: "tfng",
    name: "True / False / Not Given",
    category: "Verification",
    stream: "both",
    shortExplanation: "Evaluates whether factual claims in the question match, contradict, or are omitted from the text.",
    skillAssessed: "Factual information verification and qualifier recognition.",
    statusTier: "passage_lab",
    formatHonestyNotice: "Interactive drill on card + live passage lab included. Full 40-question mock requires 40-item published set.",
    strategy:
      "1. Identify the core proposition and watch for qualifying words (e.g. 'all', 'predominantly', 'rarely', 'unanimously').\n2. Locate the corresponding section in the text using proper nouns or non-paraphrasable keywords.\n3. Apply the strict triad rule:\n   - TRUE: The passage explicitly confirms the proposition in full.\n   - FALSE: The passage states the direct contrary or opposite meaning.\n   - NOT GIVEN: The passage mentions the topic, but lacks sufficient evidence to confirm or deny the specific claim.\n4. Base judgment solely on passage evidence, never on external general knowledge.",
    commonMistakes: [
      "Extraneous Knowledge Trap: Assuming a statement is True because it is true in the real world.",
      "Conflating False and Not Given: Assuming that absence of proof means False. False requires a direct contradiction.",
      "Ignoring Extreme Quantifiers: Missing words like 'always', 'only', 'entirely' which turn a plausible statement into False.",
    ],
    sampleQuestion: {
      instruction: "Do the following statements agree with the information given in the text? Choose TRUE, FALSE, or NOT GIVEN.",
      passageExcerpt:
        "While several European capitals have deployed subterranean water retention vaults, municipal authorities in Vienna opted exclusively for canal diversion networks.",
      prompt: "Vienna utilizes underground vaults alongside its canal diversion network to manage flash floods.",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      correctAnswer: "FALSE",
      evidenceText: "Vienna opted exclusively for canal diversion networks.",
      explanation: "The word 'exclusively' directly contradicts the claim that Vienna utilizes underground vaults alongside canal diversions.",
    },
  },
  {
    id: "ynng",
    name: "Yes / No / Not Given",
    category: "Verification",
    stream: "both",
    shortExplanation: "Evaluates whether statements reflect the writer's opinions, arguments, or claims.",
    skillAssessed: "Recognizing writer stance, attitudes, tone, and subjective claims (distinct from objective facts).",
    statusTier: "micro_drill",
    formatHonestyNotice: "Interactive drill on card + strategy guide included. Sectional & 40-question mock sets will unlock upon complete publication.",
    strategy:
      "1. Understand that YNNG tests opinions, perspectives, and arguments rather than empirical facts.\n2. Look for attitude markers: 'in the author's view', 'unjustifiably', 'convincingly', 'regrettably'.\n3. Match the claim against the writer's stated philosophy:\n   - YES: The statement accurately paraphrases the writer's argument.\n   - NO: The statement contradicts the stance taken by the writer.\n   - NOT GIVEN: It is impossible to know what the writer thinks about this specific sub-issue.",
    commonMistakes: [
      "Confusing TFNG with YNNG: Writing TRUE/FALSE instead of YES/NO on the answer sheet (in official tests this can be marked wrong).",
      "Confusing Participant Views with Author Views: Attributing a quote from a researcher to the author themselves.",
    ],
    sampleQuestion: {
      instruction: "Do the following statements agree with the claims of the writer? Choose YES, NO, or NOT GIVEN.",
      passageExcerpt:
        "It is fundamentally misguided to view artificial intelligence merely as an efficiency instrument; it represents a profound philosophical rupture with human cognition.",
      prompt: "The writer believes artificial intelligence should primarily be celebrated as a productivity enhancement.",
      options: ["YES", "NO", "NOT GIVEN"],
      correctAnswer: "NO",
      evidenceText: "It is fundamentally misguided to view artificial intelligence merely as an efficiency instrument...",
      explanation: "The writer explicitly states this viewpoint is 'fundamentally misguided', directly opposing the question statement.",
    },
  },

  // Group 2: Matching Tasks
  {
    id: "headings",
    name: "Matching Headings",
    category: "Matching",
    stream: "both",
    shortExplanation: "Matches roman-numeral headings to paragraphs by identifying each paragraph's central theme.",
    skillAssessed: "Distinguishing main ideas from supporting examples, explanations, and transitional remarks.",
    statusTier: "micro_drill",
    formatHonestyNotice: "Interactive drill on card + strategy guide included. Sectional & 40-question mock sets will unlock upon complete publication.",
    strategy:
      "1. Read the list of headings first and underline keywords, noting headings with similar themes.\n2. Skim each paragraph for its overall communicative purpose, not just sentence 1.\n3. Never rely exclusively on the first or last sentence; main ideas frequently appear mid-paragraph following contrast words like 'However', 'Yet', or 'Conversely'.\n4. Cross out used headings, but remember distractors exist (always more headings than paragraphs).",
    commonMistakes: [
      "The 'First Sentence Myth': Relying blindly on sentence 1, which is often just a transition from the previous paragraph.",
      "Word-Spotting Trap: Picking a heading simply because a keyword from the heading appears verbatim in an example.",
    ],
    sampleQuestion: {
      instruction: "Choose the correct heading for each paragraph from the list of headings.",
      passageExcerpt:
        "Paragraph B: Although early investments in subterranean flood tunnels attracted fierce criticism regarding cost, municipal auditors confirmed that damage prevented during the 2024 typhoons exceeded capital expenditures threefold.",
      prompt: "Which heading best captures Paragraph B?",
      options: [
        "i. Financial justification for ambitious engineering",
        "ii. Technical challenges of tunnel boring",
        "iii. Future meteorological predictions",
      ],
      correctAnswer: "i. Financial justification for ambitious engineering",
      evidenceText: "municipal auditors confirmed that damage prevented ... exceeded capital expenditures threefold.",
      explanation: "The central idea focuses on the monetary return on investment overcoming initial criticism.",
    },
  },
  {
    id: "matching_info",
    name: "Matching Information",
    category: "Matching",
    stream: "both",
    shortExplanation: "Locates specific details, reasons, descriptions, or comparisons across numbered paragraphs.",
    skillAssessed: "Targeted scanning for specific textual components across a non-linear passage.",
    statusTier: "micro_drill",
    formatHonestyNotice: "Interactive drill on card + strategy guide included. Sectional & 40-question mock sets will unlock upon complete publication.",
    strategy:
      "1. Re-read the instruction carefully: look out for 'NB: You may use any letter more than once'.\n2. Note the type of information requested: a comparison, an explanation of a cause, a reference to a historical date, or a description of an experiment.\n3. Scan for conceptual synonyms rather than identical wording.\n4. Remember questions are NOT in passage order.",
    commonMistakes: [
      "Assuming Questions are Sequential: Matching Information questions appear in random order throughout the passage.",
      "Missing the 'NB' Note: Failing to realize that one paragraph might contain answers to two separate questions.",
    ],
    sampleQuestion: {
      instruction: "Which paragraph contains the following information? Write the correct letter, A-D.",
      passageExcerpt:
        "Paragraph C: Sponge cities replace non-porous asphalt with permeable bioswales, reducing urban heat by 15°C and filtering toxic runoff before it reaches coastal estuaries.",
      prompt: "A description of the environmental benefits produced by natural urban drainage systems.",
      options: ["Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D"],
      correctAnswer: "Paragraph C",
      evidenceText: "reducing urban heat by 15°C and filtering toxic runoff before it reaches coastal estuaries.",
      explanation: "Paragraph C explicitly describes temperature reduction and runoff filtration.",
    },
  },
  {
    id: "matching_features",
    name: "Matching Features",
    category: "Matching",
    stream: "both",
    shortExplanation: "Matches opinions, inventions, or research findings to a list of named persons, historical eras, or locations.",
    skillAssessed: "Synthesizing viewpoints and tracking multiple researchers across academic arguments.",
    statusTier: "micro_drill",
    formatHonestyNotice: "Interactive drill on card + strategy guide included. Sectional & 40-question mock sets will unlock upon complete publication.",
    strategy:
      "1. Locate and underline all named persons or entities in the passage first (they stand out as capital letters).\n2. Read what each person says or discovers directly before attempting to match.\n3. Beware of reporting verbs: 'argued that', 'concluded that', 'hypothesized that'.\n4. A single researcher's name may appear in multiple paragraphs.",
    commonMistakes: [
      "Stopping at the first mention of a researcher's name when they speak again three paragraphs later.",
      "Confusing the lead researcher's opinion with the contrary hypothesis of their colleagues.",
    ],
    sampleQuestion: {
      instruction: "Match each statement with the correct researcher, A-C.",
      passageExcerpt:
        "Dr. Aris Thorne demonstrated that coral polyp calcification accelerated in micro-turbulent currents, disputing Elena Rostova's theory of static sedimentation.",
      prompt: "Discovered that water turbulence can positively stimulate coral skeleton formation.",
      options: ["A. Dr. Aris Thorne", "B. Elena Rostova", "C. Marcus Vance"],
      correctAnswer: "A. Dr. Aris Thorne",
      evidenceText: "Dr. Aris Thorne demonstrated that coral polyp calcification accelerated in micro-turbulent currents...",
      explanation: "The passage directly credits Thorne with demonstrating the acceleration in turbulent currents.",
    },
  },
  {
    id: "matching_sentence_endings",
    name: "Matching Sentence Endings",
    category: "Matching",
    stream: "both",
    shortExplanation: "Completes sentence stems by selecting the grammatically and logically correct ending from a list.",
    skillAssessed: "Understanding cohesive links, complex sentence logic, and cause-and-effect relationships.",
    statusTier: "micro_drill",
    formatHonestyNotice: "Interactive drill on card + strategy guide included. Sectional & 40-question mock sets will unlock upon complete publication.",
    strategy:
      "1. Read the sentence stems first; questions follow passage order.\n2. Predict the required grammatical structure (e.g. verb tense, preposition, singular/plural noun).\n3. Eliminate options that produce ungrammatical combinations with the stem.\n4. Verify that the combined sentence reflects the exact meaning of the passage.",
    commonMistakes: [
      "Choosing an ending that is factually true in isolation but does not complete the stem's grammatical syntax.",
      "Selecting an ending that reverses the cause-and-effect relationship described in the passage.",
    ],
    sampleQuestion: {
      instruction: "Complete each sentence with the correct ending, A-D.",
      passageExcerpt:
        "Early Polynesian mariners navigated vast oceanic expanses because they interpreted subtle variations in wave refraction patterns caused by distant archipelagos.",
      prompt: "Polynesian navigators successfully crossed the Pacific Ocean because they...",
      options: [
        "A. relied on mechanical compasses imported from Asia.",
        "B. analyzed wave reflections generated by offshore landmasses.",
        "C. avoided travel during monsoon transitions.",
        "D. travelled exclusively along shallow continental shelves.",
      ],
      correctAnswer: "B. analyzed wave reflections generated by offshore landmasses.",
      evidenceText: "because they interpreted subtle variations in wave refraction patterns caused by distant archipelagos.",
      explanation: "Wave refraction patterns caused by archipelagos matches wave reflections generated by offshore landmasses.",
    },
  },

  // Group 3: Completion Tasks
  {
    id: "sentence_completion",
    name: "Sentence Completion",
    category: "Completion",
    stream: "both",
    wordLimitRule: "NO MORE THAN TWO WORDS AND/OR A NUMBER",
    shortExplanation: "Fills in gaps in sentences using exact words taken directly from the passage within word limits.",
    skillAssessed: "Locating precise details and adhering strictly to word count and spelling constraints.",
    statusTier: "passage_lab",
    formatHonestyNotice: "Interactive drill on card + live passage lab included. Full 40-question mock requires 40-item published set.",
    strategy:
      "1. Read the word count instruction first (e.g., 'NO MORE THAN TWO WORDS'). Exceeding this limit is an automatic zero.\n2. Identify the required part of speech for the blank (noun, verb, adjective, number).\n3. Find the keywords in the text; words MUST be copied verbatim from the text without alteration.\n4. Double-check your spelling; a misspelled word receives no mark.",
    commonMistakes: [
      "Word Count Violation: Writing three words when the instruction says 'NO MORE THAN TWO WORDS'.",
      "Grammatical Transformation Trap: Changing 'analyzed' to 'analysis' when the original word should be copied unchanged.",
      "Spelling Slips: Dropping plurals or misspelling technical terms.",
    ],
    sampleQuestion: {
      instruction: "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage.",
      passageExcerpt:
        "Biomimetic architectural panels utilize tiny structural grooves to repel organic pollutants without chemical detergents.",
      prompt: "The exterior panels stay clean because tiny ___________ prevent pollutants from adhering.",
      correctAnswer: "structural grooves",
      evidenceText: "utilize tiny structural grooves to repel organic pollutants",
      explanation: "'structural grooves' exactly fits the noun phrase requirement within the two-word limit.",
    },
  },
  {
    id: "summary_completion",
    name: "Summary Completion",
    category: "Completion",
    stream: "both",
    wordLimitRule: "NO MORE THAN TWO WORDS",
    shortExplanation: "Completes a condensed summary of a passage section using words from the text or a word bank.",
    skillAssessed: "Synthesizing extended arguments and recognizing paraphrased syntax.",
    statusTier: "micro_drill",
    formatHonestyNotice: "Interactive drill on card + strategy guide included. Sectional & 40-question mock sets will unlock upon complete publication.",
    strategy:
      "1. Read the title of the summary to locate the relevant paragraphs in the passage.\n2. Skim the entire summary to grasp its overall logic before filling blanks.\n3. Determine the grammatical role of each blank (e.g. needs a passive participle, comparative adjective).\n4. If using a word bank, identify synonyms; if using text words, copy them verbatim.",
    commonMistakes: [
      "Ignoring Surrounding Grammar: Inserting a singular noun when the verb following the gap is plural ('are').",
      "Selecting Words Outside the Target Paragraphs: Missing that the summary concentrates on a specific subsection.",
    ],
    sampleQuestion: {
      instruction: "Complete the summary below. Choose NO MORE THAN TWO WORDS from the text.",
      passageExcerpt:
        "The reintroduction of apex predators transformed river hydrology. By curbing deer populations, bankside willows regenerated, stabilizing the soil and reducing riverbank erosion.",
      prompt: "The restoration of predators protected waterways because riverbanks experienced reduced ___________ following vegetation recovery.",
      correctAnswer: "erosion",
      evidenceText: "stabilizing the soil and reducing riverbank erosion.",
      explanation: "'erosion' directly completes the noun clause after 'reduced'.",
    },
  },
  {
    id: "note_completion",
    name: "Note Completion",
    category: "Completion",
    stream: "both",
    wordLimitRule: "NO MORE THAN ONE WORD AND/OR A NUMBER",
    shortExplanation: "Fills in gaps within bullet-pointed notes, often summarizing technical processes or lecture points.",
    skillAssessed: "Skimming hierarchical lists and identifying concise factual data.",
    statusTier: "micro_drill",
    formatHonestyNotice: "Interactive drill on card + strategy guide included. Sectional & 40-question mock sets will unlock upon complete publication.",
    strategy:
      "1. Use note headings and bullet indentation to navigate the text quickly.\n2. Pay close attention to parallel bullet structures.\n3. Respect strict single-word limits (e.g., 'ONE WORD ONLY').\n4. Write only the missing word, do not repeat words already printed in the note stem.",
    commonMistakes: [
      "Repeating Prepositions: Writing 'in Australia' when 'in' is already printed before the gap.",
      "Overlooking Number Qualifications: Omitting units when not supplied in the note line.",
    ],
    sampleQuestion: {
      instruction: "Complete the notes below. Choose ONE WORD ONLY from the passage.",
      passageExcerpt:
        "To preserve seed viability, samples are dehydrated until moisture content drops below five percent before cryogenic immersion.",
      prompt: "• Seeds undergo thorough ___________ to decrease water levels prior to freezing.",
      correctAnswer: "dehydration",
      evidenceText: "samples are dehydrated until moisture content drops...",
      explanation: "Noun 'dehydration' or participle 'drying' represents the process described.",
    },
  },
  {
    id: "table_completion",
    name: "Table Completion",
    category: "Completion",
    stream: "both",
    wordLimitRule: "NO MORE THAN TWO WORDS",
    shortExplanation: "Populates missing cells in a categorical table comparing dates, features, locations, or materials.",
    skillAssessed: "Scanning across column categories and intersecting row criteria.",
    statusTier: "micro_drill",
    formatHonestyNotice: "Interactive drill on card + strategy guide included. Sectional & 40-question mock sets will unlock upon complete publication.",
    strategy:
      "1. Read table column headers (e.g. 'Method', 'Cost', 'Primary Limitation') to understand data organization.\n2. Scan the text for the row entry keyword first, then read horizontally for the column detail.\n3. Maintain grammatical consistency with other items in the same column.",
    commonMistakes: [
      "Scanning down the wrong column when headers have similar names.",
      "Exceeding cell word limits with descriptive adjectives.",
    ],
    sampleQuestion: {
      instruction: "Complete the table below. Choose NO MORE THAN TWO WORDS from the text.",
      passageExcerpt:
        "Method Alpha requires basalt aggregate, costing $400 per ton, but exhibits high tensile vulnerability in sub-zero climates.",
      prompt: "Table Row: Method Alpha | Primary Drawback: ___________",
      correctAnswer: "tensile vulnerability",
      evidenceText: "exhibits high tensile vulnerability in sub-zero climates",
      explanation: "Directly names the primary operational drawback.",
    },
  },
  {
    id: "flowchart_completion",
    name: "Flow-chart Completion",
    category: "Completion",
    stream: "both",
    wordLimitRule: "NO MORE THAN TWO WORDS",
    shortExplanation: "Completes sequentially linked boxes illustrating stages of a scientific or mechanical process.",
    skillAssessed: "Tracing chronological markers, sequencing signals, and cyclic causal steps.",
    statusTier: "micro_drill",
    formatHonestyNotice: "Interactive drill on card + strategy guide included. Sectional & 40-question mock sets will unlock upon complete publication.",
    strategy:
      "1. Follow the flow arrows; arrows indicate chronological or operational order.\n2. Scan for sequencing signal words: 'initially', 'subsequently', 'following this', 'once cooled'.\n3. Locate the starting phase in the passage and read linearly forward.",
    commonMistakes: [
      "Skipping an intermediate step described parenthetically in the passage.",
      "Reversing upstream and downstream process stages.",
    ],
    sampleQuestion: {
      instruction: "Complete the flow-chart below. Choose NO MORE THAN TWO WORDS from the text.",
      passageExcerpt:
        "Water vapor enters the condenser chamber, where chilled seawater coils cause rapid condensation into purified distillate.",
      prompt: "[Condenser Chamber] -> Contact with chilled coils produces ___________",
      correctAnswer: "purified distillate",
      evidenceText: "cause rapid condensation into purified distillate.",
      explanation: "Identifies the terminal product of the condensation phase.",
    },
  },
  {
    id: "diagram_completion",
    name: "Diagram Label Completion",
    category: "Completion",
    stream: "both",
    wordLimitRule: "NO MORE THAN ONE WORD",
    shortExplanation: "Labels designated components or mechanical parts on an illustration based on passage descriptions.",
    skillAssessed: "Translating spatial and mechanical descriptions into visual schematic components.",
    statusTier: "micro_drill",
    formatHonestyNotice: "Interactive drill on card + strategy guide included. Sectional & 40-question mock sets will unlock upon complete publication.",
    strategy:
      "1. Examine the diagram orientation and any already-labelled parts for landmarks.\n2. Scan for spatial prepositions: 'adjacent to', 'surrounding', 'directly beneath', 'perpendicular'.\n3. Copy exact technical terms used in the passage.",
    commonMistakes: [
      "Confusing internal components with outer casing parts.",
      "Misinterpreting directional arrows pointing to flows rather than physical parts.",
    ],
    sampleQuestion: {
      instruction: "Label the diagram below. Choose ONE WORD ONLY from the text.",
      passageExcerpt:
        "The turbine housing is anchored by a reinforced pivot at the apex, allowing 360-degree rotation into prevailing winds.",
      prompt: "Apex Anchor Component: [Diagram pointer #3] -> ___________",
      correctAnswer: "pivot",
      evidenceText: "anchored by a reinforced pivot at the apex",
      explanation: "Single word identifying the component at the apex.",
    },
  },

  // Group 4: Choice & Inquiry
  {
    id: "multiple_choice",
    name: "Multiple Choice (Single & Multiple)",
    category: "Choice & Inquiry",
    stream: "both",
    shortExplanation: "Selects the best answer from 4 options, or selects multiple correct answers from a longer list.",
    skillAssessed: "Detailed comprehension of complex arguments and distractor elimination.",
    statusTier: "micro_drill",
    formatHonestyNotice: "Interactive drill on card + strategy guide included. Sectional & 40-question mock sets will unlock upon complete publication.",
    strategy:
      "1. Read the question stem thoroughly and isolate keywords before reading the options.\n2. Formulate your own tentative answer from the text before looking at options to avoid falling for distractors.\n3. Beware of common distractors:\n   - True in the real world, but not in the text.\n   - Mentioned in the passage, but does not answer the specific question.\n   - Uses exact text words, but twists the logical relationship.\n4. For multiple-answer questions (e.g. 'Choose TWO letters'), ensure you select the requested number of answers.",
    commonMistakes: [
      "The 'Familiar Word Trap': Choosing an option simply because it shares 3 exact words with the passage.",
      "Failing to check whether the question asks for 'the writer's intention' versus 'a factual result'.",
    ],
    sampleQuestion: {
      instruction: "Choose the correct letter, A, B, C, or D.",
      passageExcerpt:
        "While opponents argued the high-speed rail line would destabilize suburban property values, longitudinal census data revealed a 14% increase in local municipal tax revenues.",
      prompt: "What did subsequent economic research demonstrate regarding the rail project?",
      options: [
        "A. Construction deadlines were substantially exceeded.",
        "B. Suburban property values collapsed as predicted.",
        "C. Municipal governments experienced increased tax receipts.",
        "D. Opposition protests delayed track commissioning.",
      ],
      correctAnswer: "C. Municipal governments experienced increased tax receipts.",
      evidenceText: "longitudinal census data revealed a 14% increase in local municipal tax revenues.",
      explanation: "Directly paraphrases the 14% tax revenue increase.",
    },
  },
  {
    id: "short_answer",
    name: "Short-Answer Questions",
    category: "Choice & Inquiry",
    stream: "both",
    wordLimitRule: "NO MORE THAN TWO WORDS",
    shortExplanation: "Answers direct factual questions using words retrieved directly from the passage within word limits.",
    skillAssessed: "Fast factual retrieval and concise synthesis within word constraints.",
    statusTier: "passage_lab",
    formatHonestyNotice: "Interactive drill on card + live GT passage lab included. Full 40-question mock requires 40-item published set.",
    strategy:
      "1. Identify the question word: 'Who' (person), 'When' (date/time), 'Where' (place), 'What' (object/concept), 'Why' (reason).\n2. Find the relevant paragraph and locate the direct factual answer.\n3. Copy the exact words from the passage without adding articles or prepositions that violate word count.\n4. Check spelling carefully.",
    commonMistakes: [
      "Adding filler words like 'It was the...' which pushes the answer over the two-word limit.",
      "Misidentifying the specific entity asked for (e.g. giving the company name instead of the founder's name).",
    ],
    sampleQuestion: {
      instruction: "Answer the question below. Choose NO MORE THAN TWO WORDS from the passage.",
      passageExcerpt:
        "The observatory was constructed under the supervision of Chief Astronomer Kenneth Wright between 1912 and 1915.",
      prompt: "Who directed the construction of the observatory facility?",
      correctAnswer: "Kenneth Wright",
      evidenceText: "under the supervision of Chief Astronomer Kenneth Wright",
      explanation: "'Kenneth Wright' directly answers 'Who' within two words.",
    },
  },
];

// ============================================================================
// 3. ANSWER NORMALIZATION & STRICT VALIDATION ENGINE
// ============================================================================

export interface AnswerValidationResult {
  isCorrect: boolean;
  normalizedStudent: string;
  expectedAnswer: string;
  wordCount: number;
  numberCount: number;
  wordLimitExceeded: boolean;
  statusMessage: string;
}

/**
 * Normalizes user answer text by trimming excess whitespace, converting to standard casing,
 * and stripping superfluous outer punctuation (quotes, parentheses, periods, commas, colons, etc.).
 */
export function normalizeAnswer(raw: string): string {
  if (!raw) return "";
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^[“"'`(\[]+|[”"'`).,;:!?\]]+$/g, "");
}

/**
 * Checks whether a token represents a numeric expression under IELTS rules.
 * Matches integer, decimals, currencies, percentages, and ordinal numerals (e.g. "15", "15.5", "$400", "15%", "1st").
 */
export function isNumericToken(token: string): boolean {
  if (!token) return false;
  const stripped = token.replace(/^[$€£¥]/, "").replace(/[%]$/, "").replace(/(st|nd|rd|th)$/i, "");
  return !isNaN(Number(stripped)) && stripped.trim().length > 0;
}

/**
 * Counts words and numbers in a string according to official IELTS rules.
 * Rule 1: Hyphenated words count as single words (e.g., 'state-of-the-art' = 1 word).
 * Rule 2: Compound tokens like '15th' count as numbers.
 */
export function countIeltsTokens(text: string): { wordCount: number; numberCount: number; totalTokens: number } {
  if (!text) return { wordCount: 0, numberCount: 0, totalTokens: 0 };
  // Normalize internal hyphen spaces: "state - of - the - art" -> "state-of-the-art"
  const cleaned = text.trim().replace(/\s*-\s*/g, "-");
  if (!cleaned) return { wordCount: 0, numberCount: 0, totalTokens: 0 };

  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  let wordCount = 0;
  let numberCount = 0;

  for (const token of rawTokens) {
    const norm = token.replace(/^[“"'`(\[]+|[”"'`).,;:!?\]]+$/g, "");
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

/**
 * Counts words in a string according to official IELTS rules (hyphenated words count as one).
 */
export function countIeltsWords(text: string): number {
  return countIeltsTokens(text).wordCount;
}

/**
 * Helper to extract letter choices from strings like "A, C" or "B and D" or "B,D".
 */
export function extractChoiceLetters(str: string): string[] {
  if (!str) return [];
  const matches = str.toUpperCase().match(/\b[A-H]\b/g);
  return matches ? Array.from(new Set(matches)).sort() : [];
}

export interface ValidateReadingAnswerOptions {
  correctAnswer: string;
  acceptedVariants?: string[];
  maxWords?: number;
  allowNumber?: boolean;
  maxNumbers?: number;
  wordLimitRule?: string;
  typeId?: string;
  usedOptions?: string[];
  allowReuse?: boolean;
}

/**
 * Strictly validates student reading answer against answer key and acceptable variants.
 * Applies case normalization, word-limit validation, multi-letter choice handling,
 * and specific TFNG/YNNG logic.
 */
export function validateReadingAnswer(
  studentAnswer: string,
  question: ValidateReadingAnswerOptions
): AnswerValidationResult {
  const normStudent = normalizeAnswer(studentAnswer);
  const tokenMetrics = countIeltsTokens(normStudent);

  // Derive word & number constraints from wordLimitRule if not explicitly passed
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
      if (ruleUpper.includes("AND/OR A NUMBER") || ruleUpper.includes("A NUMBER")) {
        allowNumber = true;
      } else if (ruleUpper.includes("ONLY") || !ruleUpper.includes("NUMBER")) {
        allowNumber = false;
      }
    }
  }

  // Default allowNumber to true for general completion tasks unless explicitly restricted
  if (allowNumber === undefined) {
    allowNumber = true;
  }

  // 1. Check strict "ONE NUMBER ONLY" constraint (0 words allowed)
  if (maxWords === 0) {
    if (tokenMetrics.wordCount > 0) {
      return {
        isCorrect: false,
        normalizedStudent: normStudent,
        expectedAnswer: question.correctAnswer,
        wordCount: tokenMetrics.wordCount,
        numberCount: tokenMetrics.numberCount,
        wordLimitExceeded: true,
        statusMessage: "Exceeded word limit: The instruction specifies ONE NUMBER ONLY (no words permitted).",
      };
    }
    if (tokenMetrics.numberCount > 1) {
      return {
        isCorrect: false,
        normalizedStudent: normStudent,
        expectedAnswer: question.correctAnswer,
        wordCount: tokenMetrics.wordCount,
        numberCount: tokenMetrics.numberCount,
        wordLimitExceeded: true,
        statusMessage: `Exceeded number limit: You wrote ${tokenMetrics.numberCount} numbers (maximum allowed is 1).`,
      };
    }
  }

  // 2. Check general word limit violation (IELTS rule: exceeding limit is automatically marked 0)
  if (maxWords !== undefined && maxWords > 0) {
    const violatesWordBudget = allowNumber
      ? tokenMetrics.wordCount > maxWords
      : tokenMetrics.totalTokens > maxWords;

    if (violatesWordBudget) {
      return {
        isCorrect: false,
        normalizedStudent: normStudent,
        expectedAnswer: question.correctAnswer,
        wordCount: tokenMetrics.wordCount,
        numberCount: tokenMetrics.numberCount,
        wordLimitExceeded: true,
        statusMessage: `Exceeded word limit: You wrote ${tokenMetrics.wordCount} words (maximum allowed is ${maxWords}).`,
      };
    }
  }

  // 3. Check number count violation if specified
  if (maxNumbers !== undefined && maxNumbers > 0 && tokenMetrics.numberCount > maxNumbers) {
    return {
      isCorrect: false,
      normalizedStudent: normStudent,
      expectedAnswer: question.correctAnswer,
      wordCount: tokenMetrics.wordCount,
      numberCount: tokenMetrics.numberCount,
      wordLimitExceeded: true,
      statusMessage: `Exceeded number limit: You wrote ${tokenMetrics.numberCount} numbers (maximum allowed is ${maxNumbers}).`,
    };
  }

  if (!normStudent) {
    return {
      isCorrect: false,
      normalizedStudent: "",
      expectedAnswer: question.correctAnswer,
      wordCount: 0,
      numberCount: 0,
      wordLimitExceeded: false,
      statusMessage: "Unanswered",
    };
  }

  // 4. Check matching option reuse constraint
  const normLower = normStudent.toLowerCase();
  if (question.allowReuse === false && question.usedOptions && question.usedOptions.length > 0) {
    const isAlreadyUsed = question.usedOptions.some(
      (opt) => normalizeAnswer(opt).toLowerCase() === normLower
    );
    if (isAlreadyUsed) {
      return {
        isCorrect: false,
        normalizedStudent: normStudent,
        expectedAnswer: question.correctAnswer,
        wordCount: tokenMetrics.wordCount,
        numberCount: tokenMetrics.numberCount,
        wordLimitExceeded: false,
        statusMessage: "Option already used: Each option may only be used once in this matching task.",
      };
    }
  }

  // 5. Build complete list of valid acceptable answers
  const validCandidates: string[] = [
    question.correctAnswer,
    ...(question.acceptedVariants || []),
  ].map((c) => normalizeAnswer(c).toLowerCase());

  // 6. Special TFNG shorthand acceptance (TRUE -> T, FALSE -> F, NOT GIVEN -> NG)
  const isTfng = question.typeId === "tfng" || validCandidates.includes("true") || validCandidates.includes("false");
  const isYnng = question.typeId === "ynng" || validCandidates.includes("yes") || validCandidates.includes("no");

  if (isTfng) {
    // If student enters Y/YES for TFNG, reject strictly
    if (normLower === "yes" || normLower === "y" || normLower === "no" || normLower === "n") {
      return {
        isCorrect: false,
        normalizedStudent: normStudent.toUpperCase(),
        expectedAnswer: question.correctAnswer,
        wordCount: tokenMetrics.wordCount,
        numberCount: tokenMetrics.numberCount,
        wordLimitExceeded: false,
        statusMessage: "Incorrect format: Use TRUE, FALSE, or NOT GIVEN for factual verification.",
      };
    }
    if (validCandidates.includes("true") && (normLower === "true" || normLower === "t")) {
      return { isCorrect: true, normalizedStudent: "TRUE", expectedAnswer: question.correctAnswer, wordCount: 1, numberCount: 0, wordLimitExceeded: false, statusMessage: "Correct" };
    }
    if (validCandidates.includes("false") && (normLower === "false" || normLower === "f")) {
      return { isCorrect: true, normalizedStudent: "FALSE", expectedAnswer: question.correctAnswer, wordCount: 1, numberCount: 0, wordLimitExceeded: false, statusMessage: "Correct" };
    }
    if (validCandidates.includes("not given") && (normLower === "not given" || normLower === "notgiven" || normLower === "ng")) {
      return { isCorrect: true, normalizedStudent: "NOT GIVEN", expectedAnswer: question.correctAnswer, wordCount: 2, numberCount: 0, wordLimitExceeded: false, statusMessage: "Correct" };
    }
  }

  if (isYnng) {
    // If student enters T/TRUE for YNNG, reject strictly
    if (normLower === "true" || normLower === "t" || normLower === "false" || normLower === "f") {
      return {
        isCorrect: false,
        normalizedStudent: normStudent.toUpperCase(),
        expectedAnswer: question.correctAnswer,
        wordCount: tokenMetrics.wordCount,
        numberCount: tokenMetrics.numberCount,
        wordLimitExceeded: false,
        statusMessage: "Incorrect format: Use YES, NO, or NOT GIVEN for claims/opinions.",
      };
    }
    if (validCandidates.includes("yes") && (normLower === "yes" || normLower === "y")) {
      return { isCorrect: true, normalizedStudent: "YES", expectedAnswer: question.correctAnswer, wordCount: 1, numberCount: 0, wordLimitExceeded: false, statusMessage: "Correct" };
    }
    if (validCandidates.includes("no") && (normLower === "no" || normLower === "n")) {
      return { isCorrect: true, normalizedStudent: "NO", expectedAnswer: question.correctAnswer, wordCount: 1, numberCount: 0, wordLimitExceeded: false, statusMessage: "Correct" };
    }
    if (validCandidates.includes("not given") && (normLower === "not given" || normLower === "notgiven" || normLower === "ng")) {
      return { isCorrect: true, normalizedStudent: "NOT GIVEN", expectedAnswer: question.correctAnswer, wordCount: 2, numberCount: 0, wordLimitExceeded: false, statusMessage: "Correct" };
    }
  }

  // 4. Multiple Choice letter set comparison (e.g. "B, D" vs "D, B")
  const expectedLetters = extractChoiceLetters(question.correctAnswer);
  if (expectedLetters.length > 0) {
    const studentLetters = extractChoiceLetters(normStudent);
    // Student selected extra letters trying to guess -> Automatic zero
    if (studentLetters.length > expectedLetters.length) {
      return {
        isCorrect: false,
        normalizedStudent: normStudent,
        expectedAnswer: question.correctAnswer,
        wordCount: tokenMetrics.wordCount,
        numberCount: tokenMetrics.numberCount,
        wordLimitExceeded: false,
        statusMessage: `Too many options selected: Expected ${expectedLetters.length}, you chose ${studentLetters.length}.`,
      };
    }
    // Matching exact letter set
    if (
      studentLetters.length === expectedLetters.length &&
      studentLetters.every((l, idx) => l === expectedLetters[idx])
    ) {
      return {
        isCorrect: true,
        normalizedStudent: studentLetters.join(", "),
        expectedAnswer: question.correctAnswer,
        wordCount: tokenMetrics.wordCount,
        numberCount: tokenMetrics.numberCount,
        wordLimitExceeded: false,
        statusMessage: "Correct",
      };
    }
  }

  // 5. General string comparison (case-insensitive, whitespace normalized, content-authorized variants only)
  const isMatched = validCandidates.some((target) => target === normLower);

  return {
    isCorrect: isMatched,
    normalizedStudent: normStudent,
    expectedAnswer: question.correctAnswer,
    wordCount: tokenMetrics.wordCount,
    numberCount: tokenMetrics.numberCount,
    wordLimitExceeded: false,
    statusMessage: isMatched ? "Correct" : "Incorrect",
  };
}

/**
 * Calculates raw score to indicative band mapping.
 */
export function calculateIndicativeReadingBand(
  rawScore: number,
  stream: ReadingStream,
  totalPossible = 40
): number {
  // If practice set has fewer than 40 questions, scale proportionally
  const scaledScore = totalPossible === 40 ? rawScore : Math.round((rawScore / totalPossible) * 40);
  const guide = stream === "academic" ? ACADEMIC_RAW_SCORE_GUIDE : GT_RAW_SCORE_GUIDE;

  for (const tier of guide.tiers) {
    if (scaledScore >= tier.minCorrect) {
      return tier.band;
    }
  }
  return 3.5;
}

