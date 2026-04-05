"use client";

import institutionsData from "@/data/seed/institutions.json";
import officialsData from "@/data/seed/officials.json";
import legislatorsData from "@/data/seed/legislators.json";
import budgetData from "@/data/seed/budget.json";
import economicData from "@/data/seed/economic-indicators.json";
import procurementData from "@/data/seed/procurement.json";

interface DatasetInfo {
  name: string;
  description: string;
  records: number;
  source: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  filename: string;
}

const datasets: DatasetInfo[] = [
  {
    name: "Instituciones del Estado",
    description: "Estructura organizacional: ministerios, instituciones autónomas, órganos adscritos",
    records: institutionsData.institutions.length,
    source: "MIDEPLAN",
    data: institutionsData,
    filename: "instituciones",
  },
  {
    name: "Funcionarios",
    description: "Ministros, presidentes ejecutivos y altos funcionarios actuales",
    records: officialsData.officials.length,
    source: "MIDEPLAN",
    data: officialsData,
    filename: "funcionarios",
  },
  {
    name: "Diputados",
    description: "Legisladores del período actual con asistencia y actividad",
    records: legislatorsData.legislators.length,
    source: "Ojo al Voto / Asamblea Legislativa",
    data: legislatorsData,
    filename: "diputados",
  },
  {
    name: "Presupuesto Nacional",
    description: "Presupuesto asignado y ejecutado por sector e institución",
    records: budgetData.bySector.length + budgetData.byInstitution.length,
    source: "Contraloría General de la República",
    data: budgetData,
    filename: "presupuesto",
  },
  {
    name: "Indicadores Económicos",
    description: "Tipo de cambio, tasa básica pasiva, inflación",
    records: economicData.exchangeRate.length + economicData.tbp.length + economicData.inflation.length,
    source: "Banco Central de Costa Rica",
    data: economicData,
    filename: "indicadores-economicos",
  },
  {
    name: "Contrataciones Públicas",
    description: "Contratos del Estado con proveedores",
    records: procurementData.contracts.length,
    source: "CGR / SICOP",
    data: procurementData,
    filename: "contrataciones",
  },
];

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h];
        const str = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function getMainArray(data: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (typeof data === "object" && data !== null) {
    for (const val of Object.values(data)) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
        return val as Record<string, unknown>[];
      }
    }
  }
  return null;
}

export default function DatosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Datos Abiertos</h1>
        <p className="text-muted mt-2">
          Descarga los datos utilizados en esta plataforma en formato JSON o CSV.
          Todos los datos son de acceso público y pueden ser reutilizados libremente.
        </p>
      </div>

      <div className="space-y-4">
        {datasets.map((ds) => {
          const csvData = getMainArray(ds.data);
          return (
            <div
              key={ds.filename}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{ds.name}</h2>
                  <p className="text-sm text-muted mt-0.5">{ds.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted">
                    <span>{ds.records} registros</span>
                    <span>Fuente: {ds.source}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => downloadJSON(ds.data, ds.filename)}
                    className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                  >
                    JSON
                  </button>
                  {csvData && (
                    <button
                      onClick={() => downloadCSV(csvData, ds.filename)}
                      className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-background transition-colors"
                    >
                      CSV
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-surface border border-border rounded-2xl p-6 text-sm text-muted space-y-2">
        <h2 className="font-semibold text-foreground">Licencia de uso</h2>
        <p>
          Los datos originales son publicados por instituciones del gobierno de Costa Rica
          bajo el marco de datos abiertos (Decreto Ejecutivo No. 40199). Los datos pueden
          ser descargados, redistribuidos y reutilizados sin restricciones de copyright.
        </p>
        <p>
          Los datos presentados actualmente son de ejemplo para demostración. Serán
          reemplazados por datos reales conforme se conecten las fuentes gubernamentales.
        </p>
      </div>
    </div>
  );
}
