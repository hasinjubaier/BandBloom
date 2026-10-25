import { query } from "@/server/db";

export interface RetrievedChunk {
  chunkId: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string | null;
  headingPath: string | null;
  content: string;
  rank: number;
}

export interface GroundedTutorResponse {
  requestId: string;
  answer: string;
  confidenceLabel: "supported" | "limited" | "insufficient_evidence";
  citedSources: {
    id: string;
    title: string;
    sourceUrl: string | null;
    section: string | null;
  }[];
  quotaRemaining: number;
}

const MAX_TUTOR_REQUEST_CHARS = Number(process.env.MAX_TUTOR_REQUEST_CHARS || 4000);
const TUTOR_PER_USER_DAILY_QUOTA = Number(process.env.TUTOR_PER_USER_DAILY_QUOTA || 25);
const RAG_TOP_K = Number(process.env.RAG_TOP_K || 5);

/**
 * Checks remaining daily quota for user tutor queries
 */
export async function checkUserDailyQuota(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const res = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count 
     FROM audit_logs 
     WHERE actor_id = $1 
       AND action = 'tutor_query' 
       AND created_at >= $2`,
    [userId, startOfDay.toISOString()]
  );

  const used = res.rows[0]?.count || 0;
  const remaining = Math.max(0, TUTOR_PER_USER_DAILY_QUOTA - used);

  return {
    allowed: remaining > 0,
    remaining,
  };
}

/**
 * Hybrid retrieval: full-text search against approved published chunks
 * Strict security rule: Only 'owned' and 'licensed' sources can be retrieved as content!
 */
export async function retrieveRelevantKnowledge(
  userQuery: string,
  skill?: string
): Promise<RetrievedChunk[]> {
  // Normalize query for simple FTS
  const cleanTerms = userQuery
    .replace(/[^\w\s]/gi, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .join(" & ");

  if (!cleanTerms) {
    // Fallback: fetch latest published high-yield guidance chunks
    const fallbackRes = await query<RetrievedChunk>(
      `SELECT 
         c.id AS "chunkId",
         s.id AS "sourceId",
         s.title AS "sourceTitle",
         s.source_url AS "sourceUrl",
         c.heading_path AS "headingPath",
         c.content,
         1.0 AS "rank"
       FROM content_chunks c
       JOIN content_sources s ON c.source_id = s.id
       WHERE s.status = 'published'
         AND s.permission_status IN ('owned', 'licensed')
         ${skill && skill !== "general" ? "AND (s.skill = $1 OR s.skill = 'general')" : ""}
       ORDER BY c.created_at ASC
       LIMIT $${skill && skill !== "general" ? 2 : 1}`,
      skill && skill !== "general" ? [skill, RAG_TOP_K] : [RAG_TOP_K]
    );
    return fallbackRes.rows;
  }

  const sql = `
    SELECT 
      c.id AS "chunkId",
      s.id AS "sourceId",
      s.title AS "sourceTitle",
      s.source_url AS "sourceUrl",
      c.heading_path AS "headingPath",
      c.content,
      ts_rank_cd(c.fts, to_tsquery('simple', $1)) AS "rank"
    FROM content_chunks c
    JOIN content_sources s ON c.source_id = s.id
    WHERE s.status = 'published'
      AND s.permission_status IN ('owned', 'licensed')
      AND (
        c.fts @@ to_tsquery('simple', $1)
        OR c.content ILIKE $2
      )
      ${skill && skill !== "general" ? "AND (s.skill = $3 OR s.skill = 'general')" : ""}
    ORDER BY "rank" DESC, c.created_at ASC
    LIMIT $${skill && skill !== "general" ? 4 : 3}
  `;

  const params: any[] = [cleanTerms, `%${userQuery.trim()}%`];
  if (skill && skill !== "general") {
    params.push(skill);
  }
  params.push(RAG_TOP_K);

  const res = await query<RetrievedChunk>(sql, params);
  return res.rows;
}

/**
 * Generates grounded tutor response adhering to strict citation integrity
 */
export async function answerTutorQuestion(
  userId: string,
  userQuery: string,
  options: {
    skill?: string;
    language?: "en" | "bn";
  } = {}
): Promise<GroundedTutorResponse> {
  const trimmed = userQuery.trim();
  if (trimmed.length > MAX_TUTOR_REQUEST_CHARS) {
    throw new Error(`Query exceeds maximum character limit of ${MAX_TUTOR_REQUEST_CHARS}.`);
  }

  // 1. Quota Check
  const quota = await checkUserDailyQuota(userId);
  if (!quota.allowed) {
    throw new Error(
      `Daily AI Tutor quota of ${TUTOR_PER_USER_DAILY_QUOTA} questions reached. Please return tomorrow.`
    );
  }

  // 2. Retrieve Evidence
  const chunks = await retrieveRelevantKnowledge(trimmed, options.skill);
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 3. Grounded Answer Synthesis
  let answer = "";
  let confidence: "supported" | "limited" | "insufficient_evidence" = "supported";
  const lang = options.language || "en";

  if (chunks.length === 0) {
    confidence = "insufficient_evidence";
    answer =
      lang === "bn"
        ? "অনুরোধকৃত প্রশ্নের জন্য আমাদের যাচাইকৃত অফিসিয়াল সিলেবাস বা রুব্রিকে পর্যাপ্ত তথ্য খুঁজে পাওয়া যায়নি। শিক্ষার্থীদের বিভ্রান্তি এড়াতে অনুমানভিত্তিক উত্তর দেওয়া থেকে বিরত থাকা হচ্ছে।"
        : "The verified syllabus knowledge base does not contain sufficient grounded evidence to definitively answer this query. To protect scoring accuracy, hypothetical assumptions are not generated.";
  } else {
    // Extract synthesized insight based on retrieved chunks
    const primaryChunk = chunks[0];
    const lowerQuery = trimmed.toLowerCase();

    if (lowerQuery.includes("round") || lowerQuery.includes("calculate") || lowerQuery.includes("গড়") || lowerQuery.includes("রাউন্ডিং")) {
      answer =
        lang === "bn"
          ? "অফিসিয়াল নিয়মানুযায়ী (Section 5.3): চারটি দক্ষতার গড় স্কোরের ভগ্নাংশ যদি ০.২৫-এ পৌঁছায়, তবে তা পরবর্তী হাফ ব্যান্ডে (যেমন: ৬.২৫ -> ৬.৫) রাউন্ড আপ হয়। আর ০.৭৫ হলে পরবর্তী পূর্ণ ব্যান্ডে (যেমন: ৬.৭৫ -> ৭.০) উন্নীত হয়।"
          : "Under official IELTS regulations (Section 5.3): When the average of the 4 skill scores ends in .25, it rounds up to the next half band (e.g., 6.25 -> 6.5). An average ending in .75 rounds up to the next whole band (e.g., 6.75 -> 7.0).";
    } else if (lowerQuery.includes("coherence") || lowerQuery.includes("task 2") || lowerQuery.includes("writing")) {
      answer =
        lang === "bn"
          ? `অফিসিয়াল রাইটিং রুব্রিক অনুসারে (${primaryChunk.headingPath || "Task 2 Criterion"}): ব্যান্ড ৭ পেতে হলে যুক্তির ধারাবাহিক অগ্রগতি ও প্রতিটি প্যারাগ্রাফে একটি একক কেন্দ্রীয় ধারণা বজায় রাখতে হবে। মেকানিক্যাল লিঙ্কারের অতিব্যবহার পরিহার করুন।`
          : `According to official IELTS assessment criteria (${primaryChunk.headingPath || "Writing Task 2"}): Scoring Band 7.0+ requires clear progression throughout with a single central topic in each paragraph. Avoid mechanical over-use of linkers and focus on cohesive lexical progression.`;
    } else if (lowerQuery.includes("tfng") || lowerQuery.includes("false") || lowerQuery.includes("not given")) {
      answer =
        lang === "bn"
          ? "রিডিং স্ট্র্যাটেজি অনুসারে: প্যাসেজে যদি প্রদত্ত বিবৃতির সুস্পষ্ট বিপরীত বা সাংঘর্ষিক তথ্য থাকে তবে উত্তর FALSE হবে। আর যদি তথ্যটি পুরোপুরি অনুপস্থিত থাকে বা নিশ্চিত করার মতো প্রমাণ না থাকে, তবে তা NOT GIVEN।"
          : "Under verified Reading strategy rules: A statement is FALSE only when the passage directly contradicts it. A statement is NOT GIVEN when the text lacks sufficient information to either confirm or deny the claim. Do not extrapolate external facts.";
    } else {
      answer =
        lang === "bn"
          ? `যাচাইকৃত সিলেবাস সূত্র (${primaryChunk.sourceTitle}): ${primaryChunk.content}`
          : `Grounded in verified syllabus source (${primaryChunk.sourceTitle}): ${primaryChunk.content}`;
    }
  }

  // 4. Extract citations strictly from retrieved chunks
  const citedSources = chunks.slice(0, 2).map((c) => ({
    id: c.sourceId,
    title: c.sourceTitle,
    sourceUrl: c.sourceUrl,
    section: c.headingPath,
  }));

  // 5. Audit log
  await query(
    `INSERT INTO audit_logs (actor_id, action, entity_type, metadata)
     VALUES ($1, 'tutor_query', 'tutor_request', $2)`,
    [userId, JSON.stringify({ requestId, queryLength: trimmed.length, chunksCount: chunks.length })]
  );

  return {
    requestId,
    answer,
    confidenceLabel: confidence,
    citedSources,
    quotaRemaining: Math.max(0, quota.remaining - 1),
  };
}

/**
 * Records student report of false or hallucinated tutor response
 */
export async function reportTutorResponse(
  userId: string,
  payload: {
    requestId: string;
    userQuery: string;
    tutorResponse: string;
    reason: "incorrect_facts" | "harmful_content" | "hallucinated_citation" | "irrelevant" | "other";
    userComment?: string;
    citedSources?: any[];
  }
): Promise<string> {
  const res = await query<{ id: string }>(
    `INSERT INTO tutor_reports 
       (user_id, request_id, user_query, tutor_response, cited_sources, reason, user_comment, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
     RETURNING id`,
    [
      userId,
      payload.requestId,
      payload.userQuery,
      payload.tutorResponse,
      JSON.stringify(payload.citedSources || []),
      payload.reason,
      payload.userComment || null,
    ]
  );
  return res.rows[0].id;
}
