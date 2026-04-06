/**
 * Hacienda API scraper — NO authentication required
 *
 * Endpoints (from https://github.com/ruiznorlan/public-apis-cr):
 * - https://api.hacienda.go.cr/indicadores/tc — Exchange rates (USD + EUR)
 *
 * Returns today's exchange rate only (no historical data).
 * Used as a supplement to BCCR data and as a fallback when BCCR credentials
 * are not available.
 */

const HACIENDA_TC_URL = "https://api.hacienda.go.cr/indicadores/tc";

interface HaciendaTCResponse {
  dolar: {
    venta: { fecha: string; valor: number };
    compra: { fecha: string; valor: number };
  };
  euro: {
    fecha: string;
    dolares: number;
    colones: number;
  };
}

export interface ExchangeRateSnapshot {
  date: string;
  buy: number;
  sell: number;
  eurUsd: number;
  eurCrc: number;
}

export async function scrapeHaciendaExchangeRate(): Promise<ExchangeRateSnapshot> {
  console.log("  → Fetching Hacienda exchange rate (no auth)...");

  const response = await fetch(HACIENDA_TC_URL, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Hacienda API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as HaciendaTCResponse;

  const result: ExchangeRateSnapshot = {
    date: data.dolar.compra.fecha,
    buy: Math.round(data.dolar.compra.valor * 100) / 100,
    sell: Math.round(data.dolar.venta.valor * 100) / 100,
    eurUsd: data.euro.dolares,
    eurCrc: Math.round(data.euro.colones * 100) / 100,
  };

  console.log(`    Date: ${result.date}, Buy: ₡${result.buy}, Sell: ₡${result.sell}`);
  return result;
}
