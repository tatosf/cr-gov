"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts";
import budgetData from "@/data/seed/budget.json";
import { formatCRC, formatPercent } from "@/lib/utils/format";

const PRESIDENT_COLORS: Record<string, string> = {
  Solís: "#2d5a8e",
  Alvarado: "#7ab648",
  Chaves: "#c8102e",
};

const employmentData = budgetData.employmentHistorical.map((d) => ({
  ...d,
  label: d.year.toString(),
}));

const deficitData = budgetData.deficitHistorical.map((d) => ({
  ...d,
  label: d.year.toString(),
  absDeficit: Math.abs(d.deficit),
}));

const latestEmployment =
  budgetData.employmentHistorical[budgetData.employmentHistorical.length - 1];
const firstEmployment = budgetData.employmentHistorical[0];
const employeeChange = latestEmployment.employees - firstEmployment.employees;
const employeeChangePercent = +(
  (employeeChange / firstEmployment.employees) *
  100
).toFixed(1);

const latestDeficit =
  budgetData.deficitHistorical[budgetData.deficitHistorical.length - 1];
const worstDeficit = budgetData.deficitHistorical.reduce((worst, d) =>
  d.deficitGdpPercent < worst.deficitGdpPercent ? d : worst
);

export function GovernmentHistoricalCharts() {
  return (
    <div className="space-y-8">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-sm text-muted mb-1">Empleados públicos</div>
          <div className="text-2xl font-bold">
            {latestEmployment.employees.toLocaleString("es-CR")}
          </div>
          <div className="text-xs text-muted mt-1">
            {latestEmployment.year}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-sm text-muted mb-1">Cambio desde {firstEmployment.year}</div>
          <div
            className={`text-2xl font-bold ${employeeChange > 0 ? "text-red-500" : "text-green-500"}`}
          >
            {employeeChange > 0 ? "+" : ""}
            {employeeChange.toLocaleString("es-CR")}
          </div>
          <div className="text-xs text-muted mt-1">
            {employeeChangePercent > 0 ? "+" : ""}
            {employeeChangePercent}%
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-sm text-muted mb-1">Déficit fiscal actual</div>
          <div className="text-2xl font-bold text-red-500">
            {formatPercent(Math.abs(latestDeficit.deficitGdpPercent))} PIB
          </div>
          <div className="text-xs text-muted mt-1">
            {formatCRC(Math.abs(latestDeficit.deficit))}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-sm text-muted mb-1">Peor déficit</div>
          <div className="text-2xl font-bold text-red-600">
            {formatPercent(Math.abs(worstDeficit.deficitGdpPercent))} PIB
          </div>
          <div className="text-xs text-muted mt-1">
            {worstDeficit.year} ({worstDeficit.president})
          </div>
        </div>
      </div>

      {/* Employment Chart */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-1">
          Empleados del sector público
        </h3>
        <p className="text-sm text-muted mb-4">
          Últimas tres administraciones (Solís, Alvarado, Chaves)
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={employmentData}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="employeeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2d5a8e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2d5a8e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(v: number) =>
                `${(v / 1000).toFixed(0)}k`
              }
              domain={["dataMin - 10000", "dataMax + 10000"]}
            />
            <Tooltip
              formatter={(value: any) => [
                `${Number(value).toLocaleString("es-CR")} empleados`,
                "Empleados",
              ]}
              labelFormatter={(label: any) => {
                const item = employmentData.find(
                  (d) => d.year === Number(label)
                );
                return `${label} — Pres. ${item?.president || ""}`;
              }}
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.75rem",
              }}
            />
            <Area
              type="monotone"
              dataKey="employees"
              stroke="#2d5a8e"
              strokeWidth={2}
              fill="url(#employeeGradient)"
              name="Empleados"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs">
          {Object.entries(PRESIDENT_COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deficit Chart */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-1">
          Déficit fiscal (% del PIB)
        </h3>
        <p className="text-sm text-muted mb-4">
          Evolución del déficit por administración. Valores negativos indican déficit.
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={deficitData}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(v: number) => `${v.toFixed(1)}%`}
              domain={["dataMin - 1", 0]}
            />
            <Tooltip
              formatter={(value: any) => [
                `${Number(value).toFixed(1)}% del PIB`,
                "Déficit",
              ]}
              labelFormatter={(label: any) => {
                const item = deficitData.find(
                  (d) => d.year === Number(label)
                );
                return `${label} — Pres. ${item?.president || ""} — ${formatCRC(item?.absDeficit || 0)}`;
              }}
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.75rem",
              }}
            />
            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
            <Bar dataKey="deficitGdpPercent" name="Déficit (% PIB)" radius={[4, 4, 0, 0]}>
              {deficitData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PRESIDENT_COLORS[entry.president] || "#64748b"}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs">
          {Object.entries(PRESIDENT_COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted text-center">
        Fuentes: Ministerio de Hacienda, BCCR, MIDEPLAN, Estado de la Nación.
        Datos aproximados basados en informes públicos.
      </p>
    </div>
  );
}
