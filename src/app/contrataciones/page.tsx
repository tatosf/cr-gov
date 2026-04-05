"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import procurementData from "@/data/seed/procurement.json";
import { formatCRC } from "@/lib/utils/format";

const contracts = procurementData.contracts;
const topContractors = procurementData.topContractors;

const COLORS = [
  "#2d5a8e", "#c8102e", "#7ab648", "#f5a623", "#9b59b6",
  "#3498db", "#e74c3c", "#2ecc71", "#e67e22",
];

// By institution
const byInstitution = contracts.reduce(
  (acc, c) => {
    acc[c.institution] = (acc[c.institution] || 0) + c.amount;
    return acc;
  },
  {} as Record<string, number>
);

const institutionData = Object.entries(byInstitution)
  .map(([name, amount]) => ({ name, amount }))
  .sort((a, b) => b.amount - a.amount);

// By type
const byType = contracts.reduce(
  (acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

const typeData = Object.entries(byType).map(([name, value]) => ({
  name,
  value,
}));

// By sector
const bySector = contracts.reduce(
  (acc, c) => {
    acc[c.sector] = (acc[c.sector] || 0) + c.amount;
    return acc;
  },
  {} as Record<string, number>
);

const sectorData = Object.entries(bySector)
  .map(([name, amount]) => ({ name, amount }))
  .sort((a, b) => b.amount - a.amount);

const totalAmount = contracts.reduce((s, c) => s + c.amount, 0);

type SortKey = "amount" | "contractor" | "institution" | "startDate";

export default function ContratacionesPage() {
  const [sortKey, setSortKey] = useState<SortKey>("amount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterSector, setFilterSector] = useState<string>("all");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "contractor" || key === "institution" ? "asc" : "desc");
    }
  };

  const filtered = filterSector === "all"
    ? contracts
    : contracts.filter((c) => c.sector === filterSector);

  const sorted = [...filtered].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortKey === "amount") return mul * (a.amount - b.amount);
    if (sortKey === "contractor") return mul * a.contractor.localeCompare(b.contractor);
    if (sortKey === "institution") return mul * a.institution.localeCompare(b.institution);
    return mul * a.startDate.localeCompare(b.startDate);
  });

  const sectors = [...new Set(contracts.map((c) => c.sector))].sort();
  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Contrataciones Públicas</h1>
        <p className="text-muted mt-2">
          Contratos del Estado costarricense — Datos de la Contraloría General de la República
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-sm text-muted">Total Contratado</div>
          <div className="text-2xl font-bold text-primary">{formatCRC(totalAmount)}</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-sm text-muted">Contratos</div>
          <div className="text-2xl font-bold text-primary">{contracts.length}</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-sm text-muted">Proveedores</div>
          <div className="text-2xl font-bold text-primary">{topContractors.length}</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-sm text-muted">Monto Promedio</div>
          <div className="text-2xl font-bold text-primary">
            {formatCRC(totalAmount / contracts.length)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* By Institution */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Por Institución</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={institutionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(v: number) => formatCRC(v)} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [formatCRC(Number(v)), "Monto"]} />
              <Bar dataKey="amount" fill="#2d5a8e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Type pie */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Por Tipo de Contratación</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }: { name?: string; value?: number }) => `${name ?? ""}: ${value ?? ""}`}
              >
                {typeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Contractors */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Principales Proveedores</h2>
        <div className="space-y-4">
          {topContractors
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 7)
            .map((tc, i) => (
              <div key={tc.id} className="flex items-center gap-4">
                <span className="text-lg font-bold text-muted w-6">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{tc.name}</div>
                  <div className="text-xs text-muted">
                    {tc.contractCount} contrato{tc.contractCount > 1 ? "s" : ""} con{" "}
                    {tc.institutions.join(", ")}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-sm">{formatCRC(tc.totalAmount)}</div>
                </div>
                <div className="w-24 hidden md:block">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${(tc.totalAmount / topContractors[0].totalAmount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Sector filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilterSector("all")}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            filterSector === "all"
              ? "bg-primary text-white border-primary"
              : "border-border hover:bg-background"
          }`}
        >
          Todos los sectores
        </button>
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setFilterSector(filterSector === s ? "all" : s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filterSector === s
                ? "bg-primary text-white border-primary"
                : "border-border hover:bg-background"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Contracts table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th
                  className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort("institution")}
                >
                  Institución{sortIcon("institution")}
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort("contractor")}
                >
                  Proveedor{sortIcon("contractor")}
                </th>
                <th className="text-left py-3 px-4 font-semibold hidden lg:table-cell">
                  Descripción
                </th>
                <th
                  className="text-right py-3 px-4 font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort("amount")}
                >
                  Monto{sortIcon("amount")}
                </th>
                <th className="text-center py-3 px-4 font-semibold hidden md:table-cell">
                  Tipo
                </th>
                <th
                  className="text-center py-3 px-4 font-semibold cursor-pointer hover:text-primary hidden md:table-cell"
                  onClick={() => handleSort("startDate")}
                >
                  Inicio{sortIcon("startDate")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-background/50">
                  <td className="py-3 px-4 font-medium">{c.institution}</td>
                  <td className="py-3 px-4">{c.contractor}</td>
                  <td className="py-3 px-4 text-muted text-xs max-w-xs truncate hidden lg:table-cell">
                    {c.description}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCRC(c.amount)}
                  </td>
                  <td className="py-3 px-4 text-center hidden md:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {c.type.replace("Licitación ", "Lic. ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-muted text-xs hidden md:table-cell">
                    {c.startDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs text-muted border-t border-border">
          {sorted.length} contratos — Total: {formatCRC(sorted.reduce((s, c) => s + c.amount, 0))}
        </div>
      </div>

      <div className="text-center text-sm text-muted">
        <p>
          Fuente:{" "}
          <a href="https://www.cgr.go.cr" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            Contraloría General de la República
          </a>{" "}
          / {" "}
          <a href="https://sicop.go.cr" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            SICOP
          </a>{" "}
          — Datos de ejemplo para demostración
        </p>
      </div>
    </div>
  );
}
