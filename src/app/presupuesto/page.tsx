"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Treemap,
  LineChart,
  Line,
  Cell,
} from "recharts";
import budgetData from "@/data/seed/budget.json";
import { formatCRC, formatPercent } from "@/lib/utils/format";

const SECTOR_COLORS = [
  "#2d5a8e", "#c8102e", "#7ab648", "#f5a623", "#9b59b6",
  "#e74c3c", "#3498db", "#2ecc71", "#e67e22", "#1abc9c",
  "#8e44ad",
];

const sectorData = budgetData.bySector.map((s, i) => ({
  ...s,
  executionRate: +((s.executed / s.allocated) * 100).toFixed(1),
  color: SECTOR_COLORS[i % SECTOR_COLORS.length],
}));

const treemapData = sectorData.map((s) => ({
  name: s.sector,
  size: s.allocated,
  executed: s.executed,
  color: s.color,
}));

const institutionData = budgetData.byInstitution
  .sort((a, b) => b.allocated - a.allocated)
  .map((inst) => ({
    ...inst,
    executionRate: +((inst.executed / inst.allocated) * 100).toFixed(1),
  }));

const historicalData = budgetData.historical.map((h) => ({
  ...h,
  executionRate: +((h.executed / h.allocated) * 100).toFixed(1),
}));

const totalExecutionRate = +(
  (budgetData.totalExecuted / budgetData.totalAllocated) *
  100
).toFixed(1);

interface TreemapContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  color: string;
}

function CustomTreemapContent({ x, y, width, height, name, color }: TreemapContentProps) {
  if (width < 40 || height < 30) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} stroke="#fff" strokeWidth={2} rx={4} />
      {width > 60 && height > 40 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontSize={width > 100 ? 13 : 10}
          fontWeight={600}
        >
          {name}
        </text>
      )}
    </g>
  );
}

export default function PresupuestoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Presupuesto Nacional</h1>
        <p className="text-muted mt-2">
          Presupuesto de la República de Costa Rica — Año fiscal {budgetData.fiscalYear}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-sm text-muted mb-1">Presupuesto Total</div>
          <div className="text-2xl font-bold text-primary">
            {formatCRC(budgetData.totalAllocated)}
          </div>
          <div className="text-xs text-muted mt-1">Aprobado para {budgetData.fiscalYear}</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-sm text-muted mb-1">Ejecutado</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCRC(budgetData.totalExecuted)}
          </div>
          <div className="text-xs text-muted mt-1">
            Al cierre del período
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-sm text-muted mb-1">Ejecución Presupuestaria</div>
          <div className="text-2xl font-bold text-accent">
            {totalExecutionRate}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-accent h-2.5 rounded-full"
              style={{ width: `${totalExecutionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Treemap */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-1">
          Distribución por Sector
        </h2>
        <p className="text-sm text-muted mb-4">
          Tamaño proporcional al presupuesto asignado por sector
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <Treemap
            data={treemapData}
            dataKey="size"
            stroke="#fff"
            content={<CustomTreemapContent x={0} y={0} width={0} height={0} name="" color="" />}
          />
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {sectorData.map((s) => (
            <div key={s.sector} className="flex items-center gap-1.5 text-xs text-muted">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ backgroundColor: s.color }}
              />
              {s.sector}
            </div>
          ))}
        </div>
      </div>

      {/* Sector Execution Bar Chart */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-1">
          Asignado vs Ejecutado por Sector
        </h2>
        <p className="text-sm text-muted mb-4">
          Comparación del presupuesto asignado contra el ejecutado
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sectorData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => formatCRC(v)}
            />
            <YAxis
              type="category"
              dataKey="sector"
              width={130}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: any, name: any) => [
                formatCRC(value),
                name === "allocated" ? "Asignado" : "Ejecutado",
              ]}
            />
            <Legend
              formatter={(value: any) =>
                value === "allocated" ? "Asignado" : "Ejecutado"
              }
            />
            <Bar dataKey="allocated" fill="#2d5a8e" radius={[0, 4, 4, 0]} />
            <Bar dataKey="executed" fill="#7ab648" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Top Institutions */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-1">
            Top Instituciones
          </h2>
          <p className="text-sm text-muted mb-4">
            Ejecución presupuestaria por institución
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={institutionData.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 10 }}
                tickFormatter={(v: number) => formatCRC(v)}
              />
              <YAxis
                type="category"
                dataKey="abbreviation"
                width={60}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  formatCRC(value),
                  name === "allocated" ? "Asignado" : "Ejecutado",
                ]}
                labelFormatter={(label: any) => {
                  const inst = institutionData.find(
                    (i) => i.abbreviation === label
                  );
                  return inst?.name || label;
                }}
              />
              <Bar dataKey="allocated" fill="#2d5a8e" radius={[0, 4, 4, 0]}>
                {institutionData.slice(0, 10).map((_, i) => (
                  <Cell key={i} fill="#2d5a8e" fillOpacity={0.3} />
                ))}
              </Bar>
              <Bar dataKey="executed" fill="#2d5a8e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Historical Trend */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-1">Tendencia Histórica</h2>
          <p className="text-sm text-muted mb-4">
            Presupuesto asignado vs ejecutado (2020-2025)
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => formatCRC(v)}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  formatCRC(value),
                  name === "allocated" ? "Asignado" : "Ejecutado",
                ]}
              />
              <Legend
                formatter={(value: any) =>
                  value === "allocated" ? "Asignado" : "Ejecutado"
                }
              />
              <Line
                type="monotone"
                dataKey="allocated"
                stroke="#2d5a8e"
                strokeWidth={2}
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="executed"
                stroke="#7ab648"
                strokeWidth={2}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Execution Rate Table */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Detalle por Sector
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-semibold">Sector</th>
                <th className="text-right py-3 px-2 font-semibold">Asignado</th>
                <th className="text-right py-3 px-2 font-semibold">Ejecutado</th>
                <th className="text-right py-3 px-2 font-semibold">% Ejecución</th>
                <th className="py-3 px-2 font-semibold w-32">Progreso</th>
              </tr>
            </thead>
            <tbody>
              {sectorData.map((s) => (
                <tr key={s.sector} className="border-b border-border/50 hover:bg-background/50">
                  <td className="py-3 px-2 font-medium">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-sm inline-block shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.sector}
                    </div>
                  </td>
                  <td className="text-right py-3 px-2">{formatCRC(s.allocated)}</td>
                  <td className="text-right py-3 px-2">{formatCRC(s.executed)}</td>
                  <td className="text-right py-3 px-2 font-medium">
                    {formatPercent(s.executionRate)}
                  </td>
                  <td className="py-3 px-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.min(s.executionRate, 100)}%`,
                          backgroundColor: s.color,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source note */}
      <div className="text-center text-sm text-muted space-y-1">
        <p>
          Fuentes:{" "}
          <a
            href="https://www.cgr.go.cr/03-documentos/presupuestos-publicos.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Contraloría General de la República
          </a>
          {" · "}
          <a
            href="https://www.hacienda.go.cr/contenido/12994-presupuesto-nacional"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Ministerio de Hacienda
          </a>
          {" · "}
          <a
            href="https://countryeconomy.com/deficit/costa-rica"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            countryeconomy.com
          </a>
        </p>
        <p className="text-xs text-muted/70">
          Datos de déficit fiscal verificados. Presupuesto institucional basado en datos oficiales.
        </p>
      </div>
    </div>
  );
}
