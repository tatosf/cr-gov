import { XMLParser } from "fast-xml-parser";
import { z } from "zod";
import { fetchXML } from "../lib/html.js";
import type { EconomicIndicators } from "./validators.js";

const BCCR_WS_URL =
  "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicosXML";

const INDICATORS = {
  USD_BUY: "317",
  USD_SELL: "318",
  TBP: "423",
  INFLATION: "25482",
} as const;

const IndicatorRowSchema = z.object({
  NUM_VALOR: z.number(),
  DES_FECHA: z.string(),
  COD_INDICADORINTERNO: z.string().or(z.number()),
});

interface IndicatorValue {
  value: number;
  date: string;
}

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

async function fetchIndicator(
  code: string,
  startDate: string,
  endDate: string,
  email: string,
  token: string
): Promise<IndicatorValue[]> {
  const params = new URLSearchParams({
    Indicador: code,
    FechaInicio: startDate,
    FechaFinal: endDate,
    Nombre: "cr-gov",
    SubNiveles: "N",
    CorreoElectronico: email,
    Token: token,
  });

  const xml = await fetchXML(BCCR_WS_URL, params);
  const parser = new XMLParser();
  const result = parser.parse(xml);

  const innerXml = result?.string || "";
  if (!innerXml) return [];

  const innerResult = parser.parse(innerXml);
  const rows =
    innerResult?.Datos_de_INGC011_CAT_INDICADORECONOMIC
      ?.INGC011_CAT_INDICADORECONOMIC;

  if (!rows) return [];

  const rowsArray = Array.isArray(rows) ? rows : [rows];

  return rowsArray
    .map((row: unknown) => {
      const parsed = IndicatorRowSchema.safeParse(row);
      if (!parsed.success) return null;
      const { NUM_VALOR, DES_FECHA } = parsed.data;
      const [day, month, year] = String(DES_FECHA).split("/");
      const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      return { value: NUM_VALOR, date: isoDate };
    })
    .filter((v): v is IndicatorValue => v !== null);
}

// Sample weekly (every Thursday) from daily exchange rate data
function sampleWeekly(values: IndicatorValue[]): IndicatorValue[] {
  const byDate = new Map(values.map((v) => [v.date, v]));
  const result: IndicatorValue[] = [];
  const seen = new Set<string>();

  for (const v of values) {
    const d = new Date(v.date);
    // Get the Thursday of this week
    const day = d.getDay();
    const diff = day <= 4 ? 4 - day : 4 - day + 7;
    const thursday = new Date(d);
    thursday.setDate(d.getDate() + diff);
    const key = thursday.toISOString().slice(0, 10);

    if (!seen.has(key)) {
      seen.add(key);
      // Use Thursday's value if available, otherwise use closest available
      const actual = byDate.get(key) || v;
      result.push({ value: actual.value, date: key });
    }
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

export async function scrapeBCCR(
  email: string,
  token: string
): Promise<EconomicIndicators> {
  console.log("  Fetching BCCR indicators...");

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 18);

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  // Fetch all indicators
  console.log("  → Exchange rate (buy)...");
  const buyRates = await fetchIndicator(INDICATORS.USD_BUY, start, end, email, token);
  console.log(`    Got ${buyRates.length} values`);

  console.log("  → Exchange rate (sell)...");
  const sellRates = await fetchIndicator(INDICATORS.USD_SELL, start, end, email, token);
  console.log(`    Got ${sellRates.length} values`);

  console.log("  → TBP...");
  const tbpValues = await fetchIndicator(INDICATORS.TBP, start, end, email, token);
  console.log(`    Got ${tbpValues.length} values`);

  console.log("  → Inflation...");
  const inflationValues = await fetchIndicator(INDICATORS.INFLATION, start, end, email, token);
  console.log(`    Got ${inflationValues.length} values`);

  // Build exchange rate array: merge buy/sell by date, sample weekly
  const buyByDate = new Map(buyRates.map((v) => [v.date, v.value]));
  const sellByDate = new Map(sellRates.map((v) => [v.date, v.value]));
  const allDates = [...new Set([...buyByDate.keys(), ...sellByDate.keys()])].sort();

  const dailyRates = allDates
    .filter((d) => buyByDate.has(d) && sellByDate.has(d))
    .map((date) => ({
      date,
      buy: Math.round(buyByDate.get(date)! * 100) / 100,
      sell: Math.round(sellByDate.get(date)! * 100) / 100,
    }));

  // Sample to weekly
  const weeklyBuy = sampleWeekly(dailyRates.map((r) => ({ date: r.date, value: r.buy })));
  const weeklyDates = new Set(weeklyBuy.map((r) => r.date));
  const exchangeRate = weeklyBuy.map((b) => {
    const sellVal = dailyRates.find((r) => r.date === b.date)?.sell || b.value + 2;
    return { date: b.date, buy: b.value, sell: Math.round(sellVal * 100) / 100 };
  });

  // TBP and inflation are already monthly-ish, just deduplicate by month
  const tbp = deduplicateMonthly(tbpValues);
  const inflation = deduplicateMonthly(inflationValues);

  return {
    sources: [
      "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx",
      "https://www.bccr.fi.cr/indicadores-economicos",
      "https://www.inec.cr/economia/indice-de-precios-al-consumidor",
    ],
    exchangeRate,
    tbp: tbp.map((v) => ({ date: v.date, value: Math.round(v.value * 100) / 100 })),
    inflation: inflation.map((v) => ({ date: v.date, value: Math.round(v.value * 100) / 100 })),
  };
}

function deduplicateMonthly(values: IndicatorValue[]): IndicatorValue[] {
  const byMonth = new Map<string, IndicatorValue>();
  for (const v of values) {
    const month = v.date.slice(0, 7); // YYYY-MM
    // Keep the latest value for each month
    if (!byMonth.has(month) || v.date > byMonth.get(month)!.date) {
      byMonth.set(month, v);
    }
  }
  return [...byMonth.values()].sort((a, b) => a.date.localeCompare(b.date));
}
