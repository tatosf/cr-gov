import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { scrapeBCCR } from "./scrapers/bccr.js";
import { scrapeDeficit } from "./scrapers/countryeconomy.js";
import { scrapeHaciendaExchangeRate } from "./scrapers/hacienda.js";
import {
  EconomicIndicatorsSchema,
  DeficitHistoricalSchema,
  validateSorted,
  validateNoDuplicates,
} from "./scrapers/validators.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.resolve(__dirname, "../src/data/seed");

interface ScraperResult {
  name: string;
  success: boolean;
  error?: string;
  updated?: boolean;
}

function readJSON(filename: string): unknown {
  const filepath = path.join(SEED_DIR, filename);
  return JSON.parse(fs.readFileSync(filepath, "utf-8"));
}

function writeJSON(filename: string, data: unknown): void {
  const filepath = path.join(SEED_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

async function runBCCRScraper(): Promise<ScraperResult> {
  const name = "BCCR Economic Indicators";
  const email = process.env.BCCR_EMAIL;
  const token = process.env.BCCR_TOKEN;

  if (!email || !token) {
    return {
      name,
      success: false,
      error: "BCCR_EMAIL and BCCR_TOKEN env vars required. Register at https://www.bccr.fi.cr",
    };
  }

  try {
    const data = await scrapeBCCR(email, token);

    // Validate
    const parsed = EconomicIndicatorsSchema.safeParse(data);
    if (!parsed.success) {
      return { name, success: false, error: `Validation failed: ${parsed.error.message}` };
    }

    // Check date ordering
    const exDates = data.exchangeRate.map((e) => e.date);
    if (!validateSorted(exDates) || !validateNoDuplicates(exDates)) {
      return { name, success: false, error: "Exchange rate dates not sorted or have duplicates" };
    }

    writeJSON("economic-indicators.json", data);
    return { name, success: true, updated: true };
  } catch (err) {
    return { name, success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function runHaciendaScraper(): Promise<ScraperResult> {
  const name = "Hacienda Exchange Rate (no auth)";

  try {
    const snapshot = await scrapeHaciendaExchangeRate();

    // Read existing economic-indicators.json
    const indicators = readJSON("economic-indicators.json") as {
      sources: string[];
      exchangeRate: Array<{ date: string; buy: number; sell: number }>;
      tbp: Array<{ date: string; value: number }>;
      inflation: Array<{ date: string; value: number }>;
    };

    // Check if we already have today's data
    const lastDate = indicators.exchangeRate[indicators.exchangeRate.length - 1]?.date;
    if (lastDate === snapshot.date) {
      return { name, success: true, updated: false };
    }

    // Append today's exchange rate if it's newer
    if (!lastDate || snapshot.date > lastDate) {
      indicators.exchangeRate.push({
        date: snapshot.date,
        buy: snapshot.buy,
        sell: snapshot.sell,
      });

      // Add Hacienda as a source if not already there
      const haciendaSource = "https://api.hacienda.go.cr/indicadores/tc";
      if (!indicators.sources.includes(haciendaSource)) {
        indicators.sources.push(haciendaSource);
      }

      writeJSON("economic-indicators.json", indicators);
      return { name, success: true, updated: true };
    }

    return { name, success: true, updated: false };
  } catch (err) {
    return { name, success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function runDeficitScraper(): Promise<ScraperResult> {
  const name = "Deficit Historical (countryeconomy.com)";

  try {
    const entries = await scrapeDeficit();

    // Validate
    const parsed = DeficitHistoricalSchema.safeParse(entries);
    if (!parsed.success) {
      return { name, success: false, error: `Validation failed: ${parsed.error.message}` };
    }

    // Read existing budget.json and update only deficitHistorical
    const budget = readJSON("budget.json") as Record<string, unknown>;
    budget.deficitHistorical = entries;
    budget.deficitSources = [
      "https://countryeconomy.com/deficit/costa-rica",
      "https://countryeconomy.com/gdp/costa-rica",
      "https://tradingeconomics.com/costa-rica/government-budget",
    ];

    writeJSON("budget.json", budget);
    return { name, success: true, updated: true };
  } catch (err) {
    return { name, success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║       cr-gov Data Scraper                ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log();

  const results: ScraperResult[] = [];

  // Run BCCR scraper (requires auth)
  console.log("┌─ BCCR Economic Indicators ──────────────");
  const bccrResult = await runBCCRScraper();
  results.push(bccrResult);
  if (!bccrResult.success) {
    console.log(`  ✗ ${bccrResult.error}`);
  } else {
    console.log(`  ✓ ${bccrResult.updated ? "Updated" : "No changes to"} economic-indicators.json`);
  }
  console.log();

  // Run Hacienda scraper (no auth — always works)
  console.log("┌─ Hacienda Exchange Rate ────────────────");
  const haciendaResult = await runHaciendaScraper();
  results.push(haciendaResult);
  if (!haciendaResult.success) {
    console.log(`  ✗ ${haciendaResult.error}`);
  } else {
    console.log(`  ✓ ${haciendaResult.updated ? "Appended today's rate to" : "Already up to date in"} economic-indicators.json`);
  }
  console.log();

  // Run deficit scraper (no auth)
  console.log("┌─ Deficit Historical ────────────────────");
  const deficitResult = await runDeficitScraper();
  results.push(deficitResult);
  if (!deficitResult.success) {
    console.log(`  ✗ ${deficitResult.error}`);
  } else {
    console.log("  ✓ Updated budget.json (deficitHistorical)");
  }
  console.log();

  // Summary
  console.log("════════════════════════════════════════════");
  console.log("Summary:");
  const pad = (s: string, n: number) => s.padEnd(n);
  for (const r of results) {
    const status = r.success ? "✓ OK" : "✗ FAIL";
    const detail = r.success ? (r.updated ? "updated" : "no change") : r.error || "";
    console.log(`  ${pad(r.name, 40)} ${pad(status, 8)} ${detail}`);
  }
  console.log();

  const anySuccess = results.some((r) => r.success);
  const allFailed = results.every((r) => !r.success);

  if (allFailed) {
    console.log("All scrapers failed. No files were updated.");
    process.exit(1);
  }

  if (anySuccess) {
    console.log(`${results.filter((r) => r.success).length}/${results.length} scrapers succeeded.`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
