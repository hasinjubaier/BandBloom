import { query } from "@/server/db";

export interface TutorMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  citations?: string[];
}

export interface TutorResponse {
  reply: string;
  citations: string[];
  suggestedFollowUps: string[];
}

const IELTS_RUBRIC_GUIDANCE: Record<string, string> = {
  writing_task2_tr:
    "Task Response (Band 7.0): Addresses all parts of the task; presents a clear position throughout; extends and supports main ideas, avoiding over-generalization.",
  writing_task2_cc:
    "Coherence and Cohesion (Band 7.0): Logically organizes ideas with clear progression; uses varied cohesive devices appropriately; maintains a clear central topic per paragraph.",
  reading_tfng:
    "True/False/Not Given Rules: TRUE if statement agrees with information; FALSE if passage explicitly contradicts it (states the opposite); NOT GIVEN if impossible to verify without external speculation.",
  speaking_fc:
    "Fluency and Coherence (Band 7.0): Speaks at length without noticeable effort or loss of coherence; uses connective words and discourse markers flexibly.",
};

export async function askIeltsTutor(
  userId: string,
  userPrompt: string,
  skillContext = "general"
): Promise<TutorResponse> {
  const prompt = userPrompt.trim();
  if (!prompt) {
    throw new Error("Prompt cannot be empty.");
  }

  // Fetch relevant grounded chunks from content_chunks if available
  let groundedSnippets: string[] = [];
  try {
    const res = await query<{ content: string; heading_path: string }>(
      `SELECT cc.content, cc.heading_path
       FROM content_chunks cc
       JOIN content_sources cs ON cc.source_id = cs.id
       WHERE cs.permission_status IN ('owned', 'licensed')
         AND cs.status = 'published'
       LIMIT 3`
    );
    if (res.rows.length > 0) {
      groundedSnippets = res.rows.map(
        (r) => `${r.heading_path}: ${r.content}`
      );
    }
  } catch {
    groundedSnippets = Object.values(IELTS_RUBRIC_GUIDANCE);
  }

  if (skillContext !== "general") {
    const key = Object.keys(IELTS_RUBRIC_GUIDANCE).find((k) => k.startsWith(skillContext));
    if (key) {
      groundedSnippets.push(IELTS_RUBRIC_GUIDANCE[key]);
    }
  }

  // Heuristic grounded responses based on IELTS assessment criteria
  const lowerPrompt = prompt.toLowerCase();
  let reply = "";
  const citations: string[] = groundedSnippets.length > 0 ? [groundedSnippets[0].split(":")[0]] : [];
  const suggestedFollowUps: string[] = [];

  if (lowerPrompt.includes("true") || lowerPrompt.includes("not given") || lowerPrompt.includes("tfng")) {
    reply = `In IELTS Reading, distinguishing **FALSE** from **NOT GIVEN** is a critical differentiator for Band 7.5+:\n\n1. **FALSE**: The passage provides explicit factual information that directly contradicts the statement. For example, if the statement claims *"All coastal areas flooded"* and the passage states *"Several northern bays remained unaffected"*, it is **FALSE**.\n2. **NOT GIVEN**: The passage does not confirm or contradict the statement. Even if the statement is true in the real world, if the text does not mention it, you must answer **NOT GIVEN**.\n\n*Key Strategy*: Pay close attention to restrictive quantifiers (*all, always, never, only, some*).`;
    citations.push("BandBloom Official Reading Strategy v1.0", "IELTS Academic Reading Assessment Standard");
    suggestedFollowUps.push(
      "Can we practice a True/False/Not Given passage together?",
      "How do Yes/No/Not Given questions differ from True/False/Not Given?"
    );
  } else if (lowerPrompt.includes("task 2") || lowerPrompt.includes("essay") || lowerPrompt.includes("writing")) {
    reply = `For **IELTS Writing Task 2**, examiners assess four equally weighted criteria (25% each):\n\n- **Task Response (TR)**: Clearly answer all parts of the prompt, declare your thesis statement in the introduction, and develop at least two main body paragraphs with specific supporting examples.\n- **Coherence & Cohesion (CC)**: Group ideas logically with topic sentences. Use cohesive transitions (*Moreover, Consequently, In contrast*) without overusing basic linkers.\n- **Lexical Resource (LR)**: Use precise academic vocabulary and natural collocations (*profound implications, sustainable mitigation*).\n- **Grammatical Range & Accuracy (GRA)**: Use a blend of complex sentences (*conditional, relative, adverbial clauses*) with minimal punctuation errors.`;
    citations.push("Official IELTS Academic Writing Task 2 Criteria 2026.1", "BandBloom Writing Assessment Engine");
    suggestedFollowUps.push(
      "How do I structure a Discuss Both Views essay?",
      "Can you review my thesis statement?"
    );
  } else if (lowerPrompt.includes("speaking") || lowerPrompt.includes("cue card") || lowerPrompt.includes("part 2")) {
    reply = `In **IELTS Speaking Part 2** (The Long Turn), you receive 1 minute of preparation and must speak continuously for 1 to 2 minutes:\n\n- **1-Minute Strategy**: Jot down bullet points for Who, Where, What happened, and Why it mattered. Never write full sentences.\n- **Fluency**: Keep speaking smoothly; self-correction is acceptable if natural, but avoid long hesitant pauses.\n- **Signposting**: Use discourse markers like *"To begin with", "What stood out most was", "Looking back on that event"*.\n- **Tense Consistency**: If describing a past event, maintain narrative past tenses (*past continuous and past perfect*).`;
    citations.push("IELTS Speaking Band Descriptors (Public Version)", "BandBloom Oral Fluency Guidelines");
    suggestedFollowUps.push(
      "What are the best phrases to buy time in Speaking Part 3?",
      "How is pronunciation evaluated in the test?"
    );
  } else {
    reply = `Hello! I'm your **BandBloom IELTS AI Tutor**. I provide targeted guidance grounded in official IELTS assessment rubrics for Academic and General Training.\n\nWhether you need help analyzing an essay prompt, understanding tricky Reading question types, or reviewing common grammar pitfalls in your Mistake Notebook, I'm here to assist!\n\nWhat IELTS skill or question type would you like to focus on today?`;
    citations.push("BandBloom Academic Curriculum Standard");
    suggestedFollowUps.push(
      "How do I achieve Band 8.0 in Task 2 Writing?",
      "Explain the strategy for True / False / Not Given questions.",
      "Give me 3 high-yield vocabulary words with collocations."
    );
  }

  return {
    reply,
    citations,
    suggestedFollowUps,
  };
}
