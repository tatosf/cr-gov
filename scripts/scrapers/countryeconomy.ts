import * as cheerio from "cheerio";
import { fetchHTML } from "../lib/html.js";
import type { DeficitEntry } from "./validators.js";

const DEFICIT_URL = "https://countryeconomy.com/deficit/costa-rica";
const GDP_URL = "https://countryeconomy.com/gdp/costa-rica";

// President by year mapping
const PRESIDENT_MAP: Record<number, DeficitEntry["president"]> = {
  2010: "Chinchilla",
  2011: "Chinchilla",
  2012: "Chinchilla",
  2013: "Chinchilla",
  2014: "Solís",
  2015: "Solís",
  2016: "Solís",
  2017: "Solís",
  2018: "Alvarado",
  2019: "Alvarado",
  2020: "Alvarado",
  2021: "Alvarado",
  2022: "Chaves",
  2023: "Chaves",
  2024: "Chaves",
  2025: "Chaves",
  2026: "Chaves",
};

interface GDPRow {
  year: number;
  gdpUSD: number; // in millions USD
}

async function scrapeGDP(): Promise<GDPRow[]> {
  console.log("  → Fetching GDP data...");
  const html = await fetchHTML(GDP_URL);
  const $ = cheerio.load(html);
  const rows: GDPRow[] = [];

  $("table.tabledat tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    const yearText = cells.eq(0).attr("data-value");
    const gdpDolText = cells.filter(".dol").attr("data-value");

    if (!yearText || !gdpDolText) return;

    const year = new Date(yearText).getFullYear();
    const gdpUSD = parseFloat(gdpDolText);

    if (!isNaN(year) && !isNaN(gdpUSD) && year >= 2010) {
      rows.push({ year, gdpUSD });
    }
  });

  console.log(`    Got ${rows.length} GDP rows`);
  return rows;
}

// Approximate annual average exchange rates CRC/USD (from BCCR historical data)
const EXCHANGE_RATES: Record<number, number> = {
  2010: 526,
  2011: 506,
  2012: 503,
  2013: 500,
  2014: 545,
  2015: 535,
  2016: 545,
  2017: 570,
  2018: 577,
  2019: 588,
  2020: 585,
  2021: 620,
  2022: 645,
  2023: 535,
  2024: 515,
  2025: 490,
  2026: 470,
};

export async function scrapeDeficit(): Promise<DeficitEntry[]> {
  console.log("  Fetching deficit data from countryeconomy.com...");

  const [deficitHtml, gdpRows] = await Promise.all([
    fetchHTML(DEFICIT_URL),
    scrapeGDP(),
  ]);

  const $ = cheerio.load(deficitHtml);
  const gdpByYear = new Map(gdpRows.map((r) => [r.year, r.gdpUSD]));
  const entries: DeficitEntry[] = [];

  $("table.tabledat tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    const yearText = cells.eq(0).attr("data-value");
    const deficitDolText = cells.filter(".dol").attr("data-value");
    const deficitGdpText = cells.last().attr("data-value");

    if (!yearText || !deficitDolText || !deficitGdpText) return;

    const year = new Date(yearText).getFullYear();
    const deficitUSD = parseFloat(deficitDolText); // in millions USD
    const deficitGdpPercent = parseFloat(deficitGdpText);

    if (isNaN(year) || isNaN(deficitUSD) || isNaN(deficitGdpPercent)) return;
    if (year < 2014) return; // Only last 3 presidencies

    const president = PRESIDENT_MAP[year];
    if (!president) return;

    const exchangeRate = EXCHANGE_RATES[year] || 530;
    const gdpUSD = gdpByYear.get(year);

    // Convert to CRC (millions USD → CRC)
    const deficitCRC = Math.round(deficitUSD * exchangeRate * 1_000_000);
    const gdpCRC = gdpUSD
      ? Math.round(gdpUSD * exchangeRate * 1_000_000)
      : Math.round(Math.abs(deficitCRC / (deficitGdpPercent / 100)));

    entries.push({
      year,
      deficit: deficitCRC,
      deficitGdpPercent,
      gdp: gdpCRC,
      president,
    });
  });

  // Sort chronologically
  entries.sort((a, b) => a.year - b.year);

  console.log(`    Got ${entries.length} deficit entries (${entries[0]?.year}-${entries[entries.length - 1]?.year})`);
  return entries;
}
