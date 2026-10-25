import { NextResponse } from "next/server";
import { query } from "@/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");

    let sql = `
      SELECT id, skill, title, level, module_type AS "moduleType", content_version AS "contentVersion", status, content
      FROM lessons
      WHERE status = 'published'
    `;
    const params: any[] = [];

    if (skill) {
      sql += ` AND (skill = $1 OR skill = 'general')`;
      params.push(skill);
    }

    sql += ` ORDER BY created_at ASC`;

    const res = await query(sql, params);

    return NextResponse.json({
      success: true,
      lessons: res.rows,
    });
  } catch (error: any) {
    console.error("List lessons error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load lessons." },
      { status: 500 }
    );
  }
}
