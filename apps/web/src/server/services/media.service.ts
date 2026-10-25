import { query } from "@/server/db";

export interface RecordingUploadRequest {
  attemptId?: string;
  questionId?: string;
  mimeType: string;
  fileSizeBytes: number;
  durationSeconds?: number;
}

export interface RecordingUploadResult {
  recordingId: string;
  uploadUrl: string;
  objectKey: string;
  expiresInSeconds: number;
}

const SIGNED_URL_TTL_SECONDS = Number(process.env.SIGNED_URL_TTL_SECONDS || 300);
const OBJECT_STORAGE_ENDPOINT = process.env.OBJECT_STORAGE_ENDPOINT || "http://localhost:9000";
const OBJECT_STORAGE_BUCKET = process.env.OBJECT_STORAGE_BUCKET || "bandbloom-private-media";

/**
 * Authorizes a speaking or voice recording upload.
 * SECURITY: Checks user's 'recording' consent before issuing upload authorization.
 */
export async function authorizeRecordingUpload(
  userId: string,
  req: RecordingUploadRequest
): Promise<RecordingUploadResult> {
  // 1. Verify consent
  const consentRes = await query<{ id: string }>(
    `SELECT id FROM consents 
     WHERE user_id = $1 AND type = 'recording' AND revoked_at IS NULL
     ORDER BY granted_at DESC LIMIT 1`,
    [userId]
  );

  if (consentRes.rows.length === 0) {
    throw new Error(
      "Audio recording requires explicit user consent. Please enable voice recording consent in Settings."
    );
  }
  const consentId = consentRes.rows[0].id;

  // 2. Validate MIME type & file size (max 25MB)
  const allowedMime = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav", "audio/mpeg"];
  if (!allowedMime.includes(req.mimeType)) {
    throw new Error(`Unsupported audio format '${req.mimeType}'. Supported: ${allowedMime.join(", ")}`);
  }

  const maxBytes = 25 * 1024 * 1024; // 25 MB
  if (req.fileSizeBytes > maxBytes) {
    throw new Error(`Recording exceeds maximum size limit of 25MB.`);
  }

  // 3. Object Key & Retention Calculation (Default 90 days)
  const timestamp = Date.now();
  const ext = req.mimeType.split("/")[1] || "webm";
  const objectKey = `recordings/${userId}/${req.attemptId || "practice"}/${req.questionId || "general"}_${timestamp}.${ext}`;

  const retentionUntil = new Date();
  retentionUntil.setDate(retentionUntil.getDate() + 90);

  // 4. Persist recording metadata in DB
  const recRes = await query<{ id: string }>(
    `INSERT INTO recordings 
       (user_id, attempt_id, question_id, object_key, duration_s, consent_id, retention_until)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      userId,
      req.attemptId || null,
      req.questionId || null,
      objectKey,
      req.durationSeconds || null,
      consentId,
      retentionUntil.toISOString(),
    ]
  );

  const recordingId = recRes.rows[0].id;

  // Signed URL structure for S3-compatible MinIO or AWS S3
  const uploadUrl = `${OBJECT_STORAGE_ENDPOINT}/${OBJECT_STORAGE_BUCKET}/${objectKey}?token=${Buffer.from(recordingId).toString("base64")}&expires=${SIGNED_URL_TTL_SECONDS}`;

  return {
    recordingId,
    uploadUrl,
    objectKey,
    expiresInSeconds: SIGNED_URL_TTL_SECONDS,
  };
}

/**
 * Retrieves learner's recordings (restricted to owner)
 */
export async function getLearnerRecordings(userId: string) {
  const res = await query(
    `SELECT 
       id, object_key, duration_s, created_at, retention_until
     FROM recordings
     WHERE user_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [userId]
  );
  return res.rows;
}

/**
 * Soft deletes a learner recording
 */
export async function deleteLearnerRecording(userId: string, recordingId: string): Promise<boolean> {
  const res = await query(
    `UPDATE recordings 
     SET deleted_at = clock_timestamp() 
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [recordingId, userId]
  );
  return (res.rowCount || 0) > 0;
}
