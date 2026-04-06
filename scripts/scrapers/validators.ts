import { z } from "zod";

// ── Economic Indicators ────────────────────────────────────────

export const ExchangeRateEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  buy: z.number().min(300).max(800),
  sell: z.number().min(300).max(800),
});

export const TBPEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.number().min(0).max(30),
});

export const InflationEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.number().min(-15).max(50),
});

export const EconomicIndicatorsSchema = z.object({
  sources: z.array(z.string().url()),
  exchangeRate: z.array(ExchangeRateEntrySchema).min(1),
  tbp: z.array(TBPEntrySchema).min(1),
  inflation: z.array(InflationEntrySchema).min(1),
});

// ── Deficit Historical ─────────────────────────────────────────

export const DeficitEntrySchema = z.object({
  year: z.number().int().min(2010).max(2030),
  deficit: z.number().max(0), // always negative
  deficitGdpPercent: z.number().min(-20).max(10),
  gdp: z.number().positive(),
  president: z.enum(["Chinchilla", "Solís", "Alvarado", "Chaves"]),
  projected: z.boolean().optional(),
});

export const DeficitHistoricalSchema = z.array(DeficitEntrySchema).min(5);

// ── Helpers ────────────────────────────────────────────────────

export function validateSorted(dates: string[]): boolean {
  for (let i = 1; i < dates.length; i++) {
    if (dates[i] <= dates[i - 1]) return false;
  }
  return true;
}

export function validateNoDuplicates(dates: string[]): boolean {
  return new Set(dates).size === dates.length;
}

export type EconomicIndicators = z.infer<typeof EconomicIndicatorsSchema>;
export type DeficitEntry = z.infer<typeof DeficitEntrySchema>;
