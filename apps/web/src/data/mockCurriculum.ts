export interface LessonItem {
  id: string;
  skill: "reading" | "listening" | "writing" | "speaking";
  title: string;
  titleBn: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  testType: "academic" | "general_training" | "both";
  summary: string;
  summaryBn: string;
  tags: string[];
}

export interface QuestionBankItem {
  id: string;
  skill: "reading" | "listening";
  type: string;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  evidenceSentence?: string;
  explanation: string;
  errorTrap: string;
}

export interface OfficialRAGSource {
  id: string;
  title: string;
  sourceUrl: string;
  section: string;
  effectiveDate: string;
  content: string;
}

export const MOCK_LESSONS: LessonItem[] = [
  {
    id: "les-r1",
    skill: "reading",
    title: "Mastering True, False, Not Given (TFNG)",
    titleBn: "True, False, Not Given কৌশল ও সমাধান",
    level: "Intermediate",
    estimatedMinutes: 20,
    testType: "both",
    summary: "Learn to distinguish between contradiction (False) and complete absence of information (Not Given) without falling into quantifier traps.",
    summaryBn: "বিপরীত তথ্য (False) এবং তথ্যের অনুপস্থিতির (Not Given) মধ্যে সূক্ষ্ম পার্থক্য চিহ্নিত করার নিয়ম।",
    tags: ["Strategy", "Reading", "High-Yield"],
  },
  {
    id: "les-r2",
    skill: "reading",
    title: "Matching Headings: Skimming & Topic Sentence Recognition",
    titleBn: "হেডিংস ম্যাচিং: স্কিমিং ও টপিক সেন্টেন্স চেনা",
    level: "Advanced",
    estimatedMinutes: 25,
    testType: "academic",
    summary: "Identify the core argument of academic paragraphs without reading every secondary clause.",
    summaryBn: "অতিরিক্ত শব্দে বিভ্রান্ত না হয়ে অনুচ্ছেদের মূল প্রতিপাদ্য দ্রুত শনাক্ত করুন।",
    tags: ["Headings", "Skimming", "Academic"],
  },
  {
    id: "les-l1",
    skill: "listening",
    title: "Listening Section 3: Handling Multi-Speaker Dialogues",
    titleBn: "লিসেনিং সেকশন ৩: একাধিক বক্তার আলোচনা অনুধাবন",
    level: "Advanced",
    estimatedMinutes: 20,
    testType: "both",
    summary: "Recognize changes in speaker opinion, agreement markers, and distractor statements in university tutorial contexts.",
    summaryBn: "বক্তাদের মত পরিবর্তন এবং বিভ্রান্তিকর বিকল্প (distractor) এড়িয়ে সঠিক উত্তর নির্বাচন।",
    tags: ["Listening", "Section 3", "Distractors"],
  },
  {
    id: "les-w1",
    skill: "writing",
    title: "Writing Task 2: Band 8.0+ Coherence & Cohesion Architectures",
    titleBn: "রাইটিং টাস্ক ২: ব্যান্ড ৮.০+ কোহেরেন্স ও অনুচ্ছেদ গঠন",
    level: "Advanced",
    estimatedMinutes: 30,
    testType: "both",
    summary: "Structure persuasive 4-paragraph essays with clear thesis statements, topic sentences, and seamless cohesive progression.",
    summaryBn: "থিসিস স্টেটমেন্ট ও যুক্তিপূর্ণ অনুচ্ছেদ বিন্যাসের মাধ্যমে রচনাকে সাবলীল করার পদ্ধতি।",
    tags: ["Writing Task 2", "Cohesion", "Band 8"],
  },
  {
    id: "les-s1",
    skill: "speaking",
    title: "Speaking Part 2: The 1-Minute Note-Taking Formula",
    titleBn: "স্পিকিং পার্ট ২: ১ মিনিটের নোট তৈরির কার্যকর ফর্মুলা",
    level: "Intermediate",
    estimatedMinutes: 15,
    testType: "both",
    summary: "Maximize your 60-second preparation time using a 4-point bullet brainstorm to speak fluently for the full 2 minutes.",
    summaryBn: "৬০ সেকেন্ড প্রস্তুতিতে সাবলীলভাবে ২ মিনিট বক্তব্য চালিয়ে যাওয়ার বুলেট কৌশল।",
    tags: ["Speaking", "Cue Card", "Fluency"],
  },
];

export const MOCK_READING_PASSAGE = {
  title: "The Architecture of Megacities and Climate Adaptation",
  text: `
[Paragraph A] As global temperatures rise and severe weather incidents escalate, coastal metropolitan regions are pioneering radical civil engineering initiatives. Urban planners can no longer rely on conventional stormwater drainage constructed during the 20th century. Instead, cities such as Rotterdam, Tokyo, and Singapore have developed subterranean flood storage reservoirs and permeable pavement infrastructure.

[Paragraph B] Critics initially claimed that the exorbitant capital expenditure of underground cisterns would outweigh their ecological utility. However, post-monsoon economic assessments demonstrated that Tokyo's underground G-Cans flood barrier system averted billions of dollars in commercial damage during catastrophic rainfall events. Consequently, several other Asian capitals are now constructing analogous drainage labyrinths.

[Paragraph C] Beyond mechanical water containment, modern ecological design prioritizes 'sponge city' architectures. These initiatives replace concrete surfaces with bioswales, retention wetlands, and green rooftop canopies. Studies conducted by architectural consortia show that green roofs reduce ambient roof temperatures by up to 15 degrees Celsius while purifying urban runoff.

[Paragraph D] Nevertheless, implementing sponge city principles in historically dense cities presents daunting logistical impediments. Heritage districts often feature subterranean utilities, antiquated masonry, and strict conservation covenants that forbid structural modifications. Consequently, municipal engineers recommend a hybrid approach where outer suburban belts act as hydrological buffers while inner cores undergo localized retrofitting.
  `,
  questions: [
    {
      id: "rq-1",
      number: 1,
      type: "True/False/Not Given",
      prompt: "Rotterdam and Singapore have implemented subterranean water storage systems to manage severe weather.",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      correctAnswer: "TRUE",
      evidence: "Instead, cities such as Rotterdam, Tokyo, and Singapore have developed subterranean flood storage reservoirs and permeable pavement infrastructure. (Paragraph A)",
      explanation: "Paragraph A explicitly names Rotterdam, Tokyo, and Singapore as having developed subterranean flood storage reservoirs.",
      errorTrap: "Keyword Trap - Be sure to confirm each city named in the stem matches the text.",
    },
    {
      id: "rq-2",
      number: 2,
      type: "True/False/Not Given",
      prompt: "Underground flood mitigation systems in Tokyo cost more to maintain than the commercial damage prevented.",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      correctAnswer: "FALSE",
      evidence: "Post-monsoon economic assessments demonstrated that Tokyo's underground G-Cans flood barrier system averted billions of dollars in commercial damage during catastrophic rainfall events. (Paragraph B)",
      explanation: "The text states the system averted billions of dollars, directly contradicting the statement that costs outweighed utility.",
      errorTrap: "Quantifier/Antonym Trap - The passage disproved initial critic concerns.",
    },
    {
      id: "rq-3",
      number: 3,
      type: "True/False/Not Given",
      prompt: "The European Union provided majority funding for Tokyo's G-Cans flood project.",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      correctAnswer: "NOT GIVEN",
      evidence: "Paragraph B discusses Tokyo's G-Cans system benefits, but provides no reference to who funded the engineering.",
      explanation: "While Tokyo's system is discussed in detail, the passage makes no mention of European Union funding.",
      errorTrap: "Extraneous Assumption - Do not extrapolate outside facts into IELTS Reading.",
    },
    {
      id: "rq-4",
      number: 4,
      type: "Sentence Completion",
      prompt: "Green roofs can lower ambient roof temperatures by as much as _________ degrees Celsius.",
      options: ["5", "10", "15", "25"],
      correctAnswer: "15",
      evidence: "Studies conducted by architectural consortia show that green roofs reduce ambient roof temperatures by up to 15 degrees Celsius. (Paragraph C)",
      explanation: "Paragraph C explicitly specifies 'up to 15 degrees Celsius'.",
      errorTrap: "Scanning error - Check exact number modifier (up to 15).",
    },
  ],
};

export const MOCK_WRITING_TASK2 = {
  prompt: "Some people believe that universities should only provide students with knowledge and skills relevant to their future careers. Others think that university education should be broader and focus on intellectual development regardless of employability. Discuss both views and give your own opinion.",
  minWords: 250,
  recommendedMinutes: 40,
  modelEssay: `It is frequently debated whether higher education institutions should solely emphasize vocational proficiencies or whether they ought to offer a comprehensive intellectual curriculum. While training students for specific professions ensures immediate economic productivity, I firmly believe that universities should cultivate critical thinking and broad scholarly inquiry alongside career training.

On the one hand, proponents of vocational focus argue that tuition costs have surged globally, obligating universities to deliver tangible return on investment. If graduates enter the labor market equipped with pragmatic expertise in engineering, software development, or finance, national unemployment declines and industries flourish. For instance, vocational polytechnic universities in Germany maintain close industrial partnerships, enabling almost immediate graduate placement. From this perspective, orienting syllabi strictly toward commercial utility appears both pragmatic and economically sensible.

On the other hand, a purely career-oriented curriculum risks obsolescence in a world rapidly reshaped by automation and artificial intelligence. When universities prioritize holistic cognitive development—such as analytical reasoning, ethical deliberation, and multidisciplinary problem-solving—graduates acquire transferable adaptability. A student steeped in philosophy or literature may not possess technical coding abilities upon graduation, but they possess the cognitive agility required to assimilate novel concepts and lead complex organizations. Historically, the most groundbreaking innovators were polymaths whose intellects transcended narrow occupational boundaries.

In conclusion, although the necessity of career readiness cannot be dismissed, higher education must not be reduced to vocational apprenticeships. In my view, the optimal approach is a balanced pedagogy where students master foundational professional skills while engaging in rigorous intellectual and ethical development.`,
  rubricBreakdown: {
    taskResponse: {
      band: 8.5,
      notes: "Directly addresses all parts of the prompt, balances both viewpoints thoroughly, and maintains a clear, nuanced personal stance throughout.",
    },
    coherenceCohesion: {
      band: 8.5,
      notes: "Logically sequenced paragraphs with precise topic sentences. Transitions (On the one hand, Consequently, In conclusion) flow effortlessly.",
    },
    lexicalResource: {
      band: 8.5,
      notes: "Sophisticated academic collocations (tangible return on investment, holistic cognitive development, transferable adaptability, polymaths).",
    },
    grammaticalRange: {
      band: 8.5,
      notes: "Wide variety of complex structures (passive constructions, modal verbs, conditional forms) with error-free execution.",
    },
  },
};

export const MOCK_SPEAKING_CUE_CARD = {
  part: 2,
  title: "Describe an environmental initiative in your locality that you admire.",
  bullets: [
    "What the initiative is and who organized it",
    "How it functions on a day-to-day basis",
    "What changes or improvements have resulted from it",
    "And explain why you personally admire this initiative",
  ],
  prepTimeSeconds: 60,
  speakTimeSeconds: 120,
};

export const MOCK_RAG_SOURCES: OfficialRAGSource[] = [
  {
    id: "src-1",
    title: "IELTS Official Band Descriptors: Writing Task 2 (Public Version)",
    sourceUrl: "https://www.ielts.org/take-a-test/preparation-resources/writing-test-resources",
    section: "Coherence & Cohesion (Band 7-9)",
    effectiveDate: "2026.1",
    content: "Band 8: Sequences information and ideas logically; manages all aspects of cohesion well; uses paragraphing sufficiently and appropriately. Band 7: Logically organizes information and ideas; there is clear progression throughout.",
  },
  {
    id: "src-2",
    title: "IELTS Updates to Test Delivery & Computer-Delivered Format",
    sourceUrl: "https://www.ielts.org/news-and-insights/updates-to-ielts-test-delivery",
    section: "Computer-Delivered Transition 2026",
    effectiveDate: "March 2026",
    content: "Computer-delivered testing is the primary standard global delivery format. Paper-based delivery is phased out across major international centers. One Skill Retake allows candidates to retake any one skill within 60 days.",
  },
  {
    id: "src-3",
    title: "IELTS Calculation of the Overall Band Score",
    sourceUrl: "https://www.ielts.org/take-a-test/your-results/ielts-scoring-in-detail",
    section: "Rounding Table Rules",
    effectiveDate: "Official Standard",
    content: "If the average of the four skills ends in .25, the overall score rounds up to the next half band (e.g., 6.25 -> 6.5). If it ends in .75, it rounds up to the next whole band (e.g., 6.75 -> 7.0).",
  },
];
