import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const BCCR_WS_URL =
  "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicosXML";

// BCCR indicator codes
export const INDICATORS = {
  USD_BUY: "317", // Tipo cambio compra
  USD_SELL: "318", // Tipo cambio venta
  TBP: "423", // Tasa Básica Pasiva
  INFLATION: "25482", // Inflación interanual
} as const;

const IndicatorRowSchema = z.object({
  NUM_VALOR: z.number(),
  DES_FECHA: z.string(),
  COD_INDICADORINTERNO: z.string().or(z.number()),
});

export interface IndicatorValue {
  value: number;
  date: string;
  code: string;
}

export async function fetchBCCRIndicator(
  indicatorCode: string,
  startDate: string,
  endDate: string,
  email: string,
  token: string
): Promise<IndicatorValue[]> {
  const params = new URLSearchParams({
    Indicador: indicatorCode,
    FechaInicio: startDate, // dd/MM/yyyy
    FechaFinal: endDate,
    Nombre: "cr-gov",
    SubNiveles: "N",
    CorreoElectronico: email,
    Token: token,
  });

  const response = await fetch(`${BCCR_WS_URL}?${params}`, {
    headers: { Accept: "text/xml" },
  });

  if (!response.ok) {
    throw new Error(`BCCR API error: ${response.status}`);
  }

  const xml = await response.text();
  const parser = new XMLParser();
  const result = parser.parse(xml);

  // The BCCR response wraps data in a string XML inside the SOAP envelope
  const innerXml = result?.string || "";
  if (!innerXml) return [];

  const innerResult = parser.parse(innerXml);
  const rows = innerResult?.Datos_de_INGC011_CAT_INDICADORECONOMIC?.INGC011_CAT_INDICADORECONOMIC;

  if (!rows) return [];

  const rowsArray = Array.isArray(rows) ? rows : [rows];

  return rowsArray
    .map((row: unknown) => {
      const parsed = IndicatorRowSchema.safeParse(row);
      if (!parsed.success) return null;
      const { NUM_VALOR, DES_FECHA, COD_INDICADORINTERNO } = parsed.data;
      // Convert BCCR date format to ISO
      const [day, month, year] = String(DES_FECHA).split("/");
      const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      return {
        value: NUM_VALOR,
        date: isoDate,
        code: String(COD_INDICADORINTERNO),
      };
    })
    .filter((v): v is IndicatorValue => v !== null);
}

export function formatBCCRDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
