"use client";

import { useState } from "react";
import Link from "next/link";
import legislatorsData from "@/data/seed/legislators.json";

type SortKey = "name" | "attendance" | "speeches" | "party" | "province";
type SortDir = "asc" | "desc";

const parties = legislatorsData.parties as Record<
  string,
  { name: string; color: string }
>;

const legislators = legislatorsData.legislators;

const partyStats = Object.entries(parties).map(([code, party]) => {
  const members = legislators.filter((l) => l.party === code);
  const avgAttendance =
    members.reduce((sum, l) => sum + l.attendance, 0) / members.length;
  return { code, ...party, count: members.length, avgAttendance };
});

const provinceStats = [
  "San José",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limón",
].map((province) => {
  const members = legislators.filter((l) => l.province === province);
  return { province, count: members.length };
});

function AttendanceBadge({ value }: { value: number }) {
  const color =
    value >= 90
      ? "bg-green-100 text-green-800"
      : value >= 80
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {value}%
    </span>
  );
}

export default function AsambleaPage() {
  const [sortKey, setSortKey] = useState<SortKey>("attendance");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterParty, setFilterParty] = useState<string>("all");
  const [filterProvince, setFilterProvince] = useState<string>("all");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const filtered = legislators.filter((l) => {
    if (filterParty !== "all" && l.party !== filterParty) return false;
    if (filterProvince !== "all" && l.province !== filterProvince) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") return mul * a.name.localeCompare(b.name);
    if (sortKey === "party") return mul * a.party.localeCompare(b.party);
    if (sortKey === "province")
      return mul * a.province.localeCompare(b.province);
    if (sortKey === "speeches") return mul * (a.speeches - b.speeches);
    return mul * (a.attendance - b.attendance);
  });

  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Asamblea Legislativa</h1>
        <p className="text-muted mt-2">
          57 diputados y diputadas — Período {legislatorsData.period}. Datos de
          asistencia y actividad legislativa.
        </p>
      </div>

      {/* Party overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {partyStats
          .sort((a, b) => b.count - a.count)
          .map((p) => (
            <button
              key={p.code}
              onClick={() =>
                setFilterParty(filterParty === p.code ? "all" : p.code)
              }
              className={`border rounded-xl p-3 text-center transition-all ${
                filterParty === p.code
                  ? "ring-2 ring-primary border-primary"
                  : "border-border hover:shadow-md"
              }`}
            >
              <div
                className="w-4 h-4 rounded-full mx-auto mb-1"
                style={{ backgroundColor: p.color }}
              />
              <div className="font-bold text-lg">{p.count}</div>
              <div className="text-xs text-muted">{p.code}</div>
              <div className="text-xs text-muted mt-0.5">
                {p.avgAttendance.toFixed(0)}% asist.
              </div>
            </button>
          ))}
      </div>

      {/* Province filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterProvince("all")}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            filterProvince === "all"
              ? "bg-primary text-white border-primary"
              : "border-border hover:bg-background"
          }`}
        >
          Todas las provincias
        </button>
        {provinceStats.map((p) => (
          <button
            key={p.province}
            onClick={() =>
              setFilterProvince(
                filterProvince === p.province ? "all" : p.province
              )
            }
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filterProvince === p.province
                ? "bg-primary text-white border-primary"
                : "border-border hover:bg-background"
            }`}
          >
            {p.province} ({p.count})
          </button>
        ))}
      </div>

      {/* Deputies table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th
                  className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort("name")}
                >
                  Diputado/a{sortIcon("name")}
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort("party")}
                >
                  Partido{sortIcon("party")}
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort("province")}
                >
                  Provincia{sortIcon("province")}
                </th>
                <th
                  className="text-center py-3 px-4 font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort("attendance")}
                >
                  Asistencia{sortIcon("attendance")}
                </th>
                <th
                  className="text-center py-3 px-4 font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleSort("speeches")}
                >
                  Discursos{sortIcon("speeches")}
                </th>
                <th className="text-center py-3 px-4 font-semibold">
                  Sesiones
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((leg) => (
                <tr
                  key={leg.id}
                  className="border-b border-border/50 hover:bg-background/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={`/asamblea/${leg.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {leg.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            parties[leg.party]?.color || "#999",
                        }}
                      />
                      <span>{leg.party}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted">{leg.province}</td>
                  <td className="py-3 px-4 text-center">
                    <AttendanceBadge value={leg.attendance} />
                  </td>
                  <td className="py-3 px-4 text-center">{leg.speeches}</td>
                  <td className="py-3 px-4 text-center text-muted">
                    {leg.present}/{leg.sessions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs text-muted border-t border-border">
          Mostrando {sorted.length} de {legislators.length} diputados
          {filterParty !== "all" && ` — Filtro: ${filterParty}`}
          {filterProvince !== "all" && ` — ${filterProvince}`}
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Top Attendance */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Mayor Asistencia
          </h2>
          <div className="space-y-3">
            {[...legislators]
              .sort((a, b) => b.attendance - a.attendance)
              .slice(0, 5)
              .map((leg, i) => (
                <div
                  key={leg.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted w-6">
                      {i + 1}
                    </span>
                    <div>
                      <Link
                        href={`/asamblea/${leg.id}`}
                        className="font-medium text-sm hover:text-primary"
                      >
                        {leg.name}
                      </Link>
                      <div className="text-xs text-muted">
                        {leg.party} — {leg.province}
                      </div>
                    </div>
                  </div>
                  <AttendanceBadge value={leg.attendance} />
                </div>
              ))}
          </div>
        </div>

        {/* Most Active Speakers */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Más Activos en Plenario
          </h2>
          <div className="space-y-3">
            {[...legislators]
              .sort((a, b) => b.speeches - a.speeches)
              .slice(0, 5)
              .map((leg, i) => (
                <div
                  key={leg.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted w-6">
                      {i + 1}
                    </span>
                    <div>
                      <Link
                        href={`/asamblea/${leg.id}`}
                        className="font-medium text-sm hover:text-primary"
                      >
                        {leg.name}
                      </Link>
                      <div className="text-xs text-muted">
                        {leg.party} — {leg.province}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {leg.speeches} disc.
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-muted">
        <p>
          Fuente:{" "}
          <a
            href="https://www.ojoalvoto.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Ojo al Voto
          </a>{" "}
          /{" "}
          <a
            href="https://www.asamblea.go.cr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Asamblea Legislativa
          </a>{" "}
          — Datos de ejemplo para demostración
        </p>
      </div>
    </div>
  );
}
