import { NextResponse } from "next/server";
import { fetchBCCRIndicator, formatBCCRDate, INDICATORS } from "@/lib/api/bccr";

// This route is triggered by Cloudflare Workers Cron Triggers (daily at 6am)
// In development, you can test it by visiting /api/cron/bccr
export async function GET() {
  const email = process.env.BCCR_EMAIL;
  const token = process.env.BCCR_TOKEN;

  if (!email || !token) {
    return NextResponse.json(
      {
        status: "skipped",
        message:
          "BCCR_EMAIL and BCCR_TOKEN environment variables are required. Register at https://www.bccr.fi.cr to get a free token.",
      },
      { status: 200 }
    );
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // Fetch last 7 days

  const start = formatBCCRDate(startDate);
  const end = formatBCCRDate(endDate);

  const results: Record<string, number> = {};
  const errors: string[] = [];

  for (const [name, code] of Object.entries(INDICATORS)) {
    try {
      const values = await fetchBCCRIndicator(code, start, end, email, token);
      results[name] = values.length;

      // TODO: In Phase 2+ with D1 database connected, upsert these values:
      // for (const val of values) {
      //   await db.insert(economicIndicators).values({
      //     id: `${code}-${val.date}`,
      //     indicatorCode: code,
      //     indicatorName: name,
      //     value: val.value,
      //     date: val.date,
      //     unit: name.includes('USD') ? 'CRC' : '%',
      //     source: 'BCCR',
      //   }).onConflictDoNothing();
      // }
    } catch (err) {
      errors.push(`${name}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  return NextResponse.json({
    status: errors.length > 0 ? "partial" : "success",
    timestamp: new Date().toISOString(),
    results,
    errors: errors.length > 0 ? errors : undefined,
  });
}
