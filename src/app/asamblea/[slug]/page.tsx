import { notFound } from "next/navigation";
import Link from "next/link";
import legislatorsData from "@/data/seed/legislators.json";
import { AttendanceHeatmap } from "@/components/visualizations/AttendanceHeatmap";

const parties = legislatorsData.parties as Record<
  string,
  { name: string; color: string }
>;

const legislators = legislatorsData.legislators;

export function generateStaticParams() {
  return legislators.map((l) => ({ slug: l.id }));
}

function GaugeChart({ value, label }: { value: number; label: string }) {
  const circumference = 2 * Math.PI * 45;
  const filled = (value / 100) * circumference;
  const color =
    value >= 90 ? "#22c55e" : value >= 80 ? "#eab308" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text
          x="60"
          y="55"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="22"
          fontWeight="700"
          fill="currentColor"
        >
          {value}%
        </text>
        <text
          x="60"
          y="78"
          textAnchor="middle"
          fontSize="10"
          fill="#64748b"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

export default async function LegislatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const legislator = legislators.find((l) => l.id === slug);
  if (!legislator) return notFound();

  const party = parties[legislator.party];
  const rank =
    [...legislators]
      .sort((a, b) => b.attendance - a.attendance)
      .findIndex((l) => l.id === legislator.id) + 1;

  const speechRank =
    [...legislators]
      .sort((a, b) => b.speeches - a.speeches)
      .findIndex((l) => l.id === legislator.id) + 1;

  const provincePeers = legislators.filter(
    (l) => l.province === legislator.province && l.id !== legislator.id
  );

  const partyPeers = legislators.filter(
    (l) => l.party === legislator.party && l.id !== legislator.id
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted mb-6">
        <Link href="/asamblea" className="hover:text-primary">
          Asamblea
        </Link>{" "}
        / {legislator.name}
      </nav>

      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar placeholder */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
            style={{ backgroundColor: party?.color || "#999" }}
          >
            {legislator.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{legislator.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              <span
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${party?.color}20`,
                  color: party?.color,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: party?.color }}
                />
                {party?.name || legislator.party}
              </span>
              <span className="text-sm text-muted px-3 py-1 bg-background rounded-full">
                {legislator.province}
              </span>
              <span className="text-sm text-muted px-3 py-1 bg-background rounded-full">
                Período {legislatorsData.period}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <GaugeChart value={legislator.attendance} label="Asistencia" />
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-primary">
            {legislator.present}
          </div>
          <div className="text-sm text-muted mt-1">
            de {legislator.sessions} sesiones
          </div>
          <div className="text-xs text-muted mt-0.5">Presente</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-primary">
            #{rank}
          </div>
          <div className="text-sm text-muted mt-1">de 57 diputados</div>
          <div className="text-xs text-muted mt-0.5">Ranking asistencia</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-primary">
            {legislator.speeches}
          </div>
          <div className="text-sm text-muted mt-1">#{speechRank} en plenario</div>
          <div className="text-xs text-muted mt-0.5">Discursos</div>
        </div>
      </div>

      {/* Attendance Heatmap */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-1">
          Calendario de Asistencia
        </h2>
        <p className="text-sm text-muted mb-4">
          Asistencia a sesiones plenarias — 2025
        </p>
        <AttendanceHeatmap attendanceRate={legislator.attendance} />
      </div>

      {/* Peers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Same Party */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Compañeros de Fracción ({legislator.party})
          </h2>
          <div className="space-y-2">
            {partyPeers
              .sort((a, b) => b.attendance - a.attendance)
              .slice(0, 5)
              .map((peer) => (
                <Link
                  key={peer.id}
                  href={`/asamblea/${peer.id}`}
                  className="flex items-center justify-between py-1.5 hover:text-primary"
                >
                  <span className="text-sm">{peer.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      peer.attendance >= 90
                        ? "bg-green-100 text-green-800"
                        : peer.attendance >= 80
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {peer.attendance}%
                  </span>
                </Link>
              ))}
          </div>
        </div>

        {/* Same Province */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Diputados por {legislator.province}
          </h2>
          <div className="space-y-2">
            {provincePeers
              .sort((a, b) => b.attendance - a.attendance)
              .slice(0, 5)
              .map((peer) => (
                <Link
                  key={peer.id}
                  href={`/asamblea/${peer.id}`}
                  className="flex items-center justify-between py-1.5 hover:text-primary"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          parties[peer.party]?.color || "#999",
                      }}
                    />
                    <span className="text-sm">{peer.name}</span>
                  </div>
                  <span className="text-xs text-muted">{peer.party}</span>
                </Link>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/asamblea"
          className="text-sm text-primary hover:underline"
        >
          Volver a la lista de diputados
        </Link>
      </div>
    </div>
  );
}
