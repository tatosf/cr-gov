import type { Metadata } from "next";
import Link from "next/link";
import data from "@/data/seed/gobierno-actual.json";
import { formatCRC, formatDateFull } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Gobierno Actual — Rendición de Cuentas",
  description:
    "Seguimiento de la administración Chaves Robles: leyes aprobadas, infraestructura, vetos y planes pendientes.",
};

const STATUS_LABELS: Record<string, string> = {
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  en_proceso: "En proceso",
  pendiente_firma: "Pendiente de firma",
  en_ejecucion: "En ejecución",
  en_planificacion: "En planificación",
  completado: "Completado",
};

const STATUS_COLORS: Record<string, string> = {
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  en_proceso: "bg-yellow-100 text-yellow-800",
  pendiente_firma: "bg-amber-100 text-amber-800",
  en_ejecucion: "bg-blue-100 text-blue-800",
  en_planificacion: "bg-purple-100 text-purple-800",
  completado: "bg-green-100 text-green-800",
};

const RESOLUTION_LABELS: Record<string, string> = {
  resellado: "Resellado por Asamblea",
  archivado: "Archivado",
  pendiente: "Pendiente",
};

const RESOLUTION_COLORS: Record<string, string> = {
  resellado: "bg-blue-100 text-blue-800",
  archivado: "bg-gray-100 text-gray-600",
  pendiente: "bg-yellow-100 text-yellow-800",
};

const CATEGORY_LABELS: Record<string, string> = {
  empleo: "Empleo",
  infraestructura: "Infraestructura",
  economía: "Economía",
  transparencia: "Transparencia",
  seguridad: "Seguridad",
  tecnología: "Tecnología",
  ambiente: "Ambiente",
  social: "Social",
  salud: "Salud",
  educación: "Educación",
};

function SourceLink({ url, name }: { url: string; name: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
    >
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
      {name}
    </a>
  );
}

function formatBudget(amount: number, currency: string) {
  if (currency === "USD") {
    if (amount >= 1_000_000_000)
      return `$${(amount / 1_000_000_000).toFixed(1)}B USD`;
    if (amount >= 1_000_000)
      return `$${(amount / 1_000_000).toFixed(0)}M USD`;
    return `$${amount.toLocaleString("en-US")} USD`;
  }
  return formatCRC(amount);
}

const approved = data.laws.filter((l) => l.status === "aprobada");
const pendingSignature = data.laws.filter(
  (l) => l.status === "pendiente_firma"
);

const completedInfra = data.infrastructure.filter(
  (p) => p.status === "completado"
);
const activeInfra = data.infrastructure.filter(
  (p) => p.status !== "completado"
);

const vetoesResellados = data.vetoes.filter(
  (v) => v.resolution === "resellado"
);
const vetoesArchivados = data.vetoes.filter(
  (v) => v.resolution === "archivado"
);
const vetoesPendientes = data.vetoes.filter(
  (v) => v.resolution === "pendiente"
);

export default function GobiernoActualPage() {
  const startDate = new Date(data.administration.startDate);
  const now = new Date();
  const daysInOffice = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const endDate = new Date(data.administration.endDate);
  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progressPercent = Math.min(
    +((daysInOffice / totalDays) * 100).toFixed(1),
    100
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gobierno Actual</h1>
        <p className="text-muted mt-2">
          Rendición de cuentas de la administración{" "}
          {data.administration.president}
        </p>
      </div>

      {/* Administration info */}
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {data.administration.president}
            </h2>
            <p className="text-muted text-sm mt-1">
              {data.administration.party}
            </p>
            <p className="text-xs text-muted mt-1">
              {formatDateFull(data.administration.startDate)} —{" "}
              {formatDateFull(data.administration.endDate)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {daysInOffice.toLocaleString("es-CR")}
            </div>
            <div className="text-xs text-muted">días en el cargo</div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Progreso del mandato</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.summary.lawsApproved}
          </div>
          <div className="text-xs text-muted mt-1">
            Leyes aprobadas (total)
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-primary">
            {data.summary.lawsFromExecutive}
          </div>
          <div className="text-xs text-muted mt-1">Del Poder Ejecutivo</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-amber-600">
            {data.summary.lawsPendingSignature}
          </div>
          <div className="text-xs text-muted mt-1">Pendientes de firma</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-red-500">
            {data.summary.vetoesExercised}
          </div>
          <div className="text-xs text-muted mt-1">
            Vetos (récord histórico)
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-lg font-bold text-blue-600">
            {data.summary.vetoesOverridden}
          </div>
          <div className="text-xs text-muted mt-1">Vetos resellados</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-lg font-bold text-gray-500">
            {data.summary.vetoesArchived}
          </div>
          <div className="text-xs text-muted mt-1">Vetos archivados</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-lg font-bold text-yellow-600">
            {data.summary.vetoesPending}
          </div>
          <div className="text-xs text-muted mt-1">Vetos pendientes</div>
        </div>
      </div>

      {/* Legislative production by year */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-semibold mb-4">
          Producción legislativa por año
        </h2>
        <p className="text-xs text-muted mb-4">
          La Asamblea 2022-2026 es la segunda más productiva en 25 años
        </p>
        <div className="grid grid-cols-3 gap-4">
          {data.legislativeByYear.map((ly) => (
            <div key={ly.year} className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {ly.approved}
              </div>
              <div className="text-xs text-muted mt-1">{ly.year}</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{
                    width: `${(ly.approved / 240) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <SourceLink
            url="https://www.teletica.com/politica/cuantos-proyectos-de-ley-ha-aprobado-la-actual-asamblea-legislativa_383702"
            name="Teletica — Producción legislativa"
          />
        </div>
      </div>

      {/* Key Laws */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-6">
          Leyes destacadas de esta administración
        </h2>

        {/* Approved */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            Aprobadas ({approved.length})
          </h3>
          <div className="space-y-3">
            {approved.map((law) => (
              <div
                key={law.id}
                className="bg-surface border border-border rounded-xl p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">
                      {law.title}
                      <span className="text-muted font-normal ml-2">
                        N° {law.number}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {law.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {CATEGORY_LABELS[law.category] || law.category}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[law.status]}`}
                    >
                      {STATUS_LABELS[law.status]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted">
                    {formatDateFull(law.date)}
                  </span>
                  <SourceLink url={law.sourceUrl} name={law.sourceName} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending signature */}
        {pendingSignature.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-amber-700 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
              Pendientes de firma presidencial ({pendingSignature.length})
            </h3>
            <div className="space-y-3">
              {pendingSignature.map((law) => (
                <div
                  key={law.id}
                  className="bg-surface border border-amber-200 rounded-xl p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">
                        {law.title}
                        <span className="text-muted font-normal ml-2">
                          N° {law.number}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1">
                        {law.description}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[law.status]}`}
                    >
                      {STATUS_LABELS[law.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted">
                      {formatDateFull(law.date)}
                    </span>
                    <SourceLink url={law.sourceUrl} name={law.sourceName} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vetoes Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2">
          Vetos presidenciales ({data.vetoes.length})
        </h2>
        <p className="text-sm text-muted mb-6">
          Récord histórico de vetos. De los {data.vetoes.length} vetos:{" "}
          {vetoesResellados.length} resellados por la Asamblea,{" "}
          {vetoesArchivados.length} archivados, {vetoesPendientes.length}{" "}
          pendientes.
        </p>

        {/* Resellados */}
        {vetoesResellados.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
              Resellados por la Asamblea ({vetoesResellados.length})
            </h3>
            <div className="space-y-3">
              {vetoesResellados.map((veto) => (
                <div
                  key={veto.id}
                  className="bg-surface border border-blue-200 rounded-xl p-4"
                >
                  <h3 className="font-semibold text-sm">{veto.title}</h3>
                  <p className="text-xs text-muted mt-1">
                    {veto.description}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted">
                        {formatDateFull(veto.date)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                        {veto.reason}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full ${RESOLUTION_COLORS[veto.resolution]}`}
                      >
                        {RESOLUTION_LABELS[veto.resolution]}
                      </span>
                    </div>
                    <SourceLink
                      url={veto.sourceUrl}
                      name={veto.sourceName}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pendientes */}
        {vetoesPendientes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-semibold text-yellow-700 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
              Pendientes de resolución ({vetoesPendientes.length})
            </h3>
            <div className="space-y-3">
              {vetoesPendientes.map((veto) => (
                <div
                  key={veto.id}
                  className="bg-surface border border-yellow-200 rounded-xl p-4"
                >
                  <h3 className="font-semibold text-sm">{veto.title}</h3>
                  <p className="text-xs text-muted mt-1">
                    {veto.description}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted">
                        {formatDateFull(veto.date)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                        {veto.reason}
                      </span>
                    </div>
                    <SourceLink
                      url={veto.sourceUrl}
                      name={veto.sourceName}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Archivados */}
        {vetoesArchivados.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
              Archivados ({vetoesArchivados.length})
            </h3>
            <div className="space-y-3">
              {vetoesArchivados.map((veto) => (
                <div
                  key={veto.id}
                  className="bg-surface border border-border rounded-xl p-4 opacity-75"
                >
                  <h3 className="font-semibold text-sm">{veto.title}</h3>
                  <p className="text-xs text-muted mt-1">
                    {veto.description}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted">
                        {formatDateFull(veto.date)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                        {veto.reason}
                      </span>
                    </div>
                    <SourceLink
                      url={veto.sourceUrl}
                      name={veto.sourceName}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Infrastructure Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2">
          Infraestructura vial ({data.infrastructure.length} proyectos
          mayores)
        </h2>
        <p className="text-sm text-muted mb-6">
          7 proyectos viales en construcción con inversión combinada de $1,407
          millones (USD).
        </p>

        {/* Active projects */}
        <div className="space-y-4 mb-6">
          {activeInfra.map((project) => (
            <div
              key={project.id}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="text-xs text-muted mt-1">
                    {project.description}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[project.status]}`}
                >
                  {STATUS_LABELS[project.status]}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted mt-3">
                <span>
                  Inversión:{" "}
                  {formatBudget(project.budget, project.budgetCurrency)}
                </span>
                <span>
                  Inicio: {formatDateFull(project.startDate)}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>Avance</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${project.progress}%`,
                      backgroundColor:
                        project.progress >= 80
                          ? "#22c55e"
                          : project.progress >= 40
                            ? "#3b82f6"
                            : "#f59e0b",
                    }}
                  />
                </div>
              </div>
              <div className="mt-3">
                <SourceLink
                  url={project.sourceUrl}
                  name={project.sourceName}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Completed */}
        {completedInfra.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
              Completadas ({completedInfra.length})
            </h3>
            <div className="space-y-3">
              {completedInfra.map((project) => (
                <div
                  key={project.id}
                  className="bg-surface border border-green-200 rounded-xl p-4"
                >
                  <h4 className="font-semibold text-sm">{project.title}</h4>
                  <p className="text-xs text-muted mt-1">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted">
                      {formatBudget(
                        project.budget,
                        project.budgetCurrency
                      )}
                      {" · "}
                      {project.completedDate
                        ? `Completado: ${formatDateFull(project.completedDate)}`
                        : ""}
                    </span>
                    <SourceLink
                      url={project.sourceUrl}
                      name={project.sourceName}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hospital Projects */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2">Infraestructura hospitalaria</h2>
        <p className="text-sm text-muted mb-6">
          60 proyectos completados por ₡377,236 millones. Fideicomiso de $700M
          para 53 obras hospitalarias y 30+ áreas de salud.
        </p>
        <div className="space-y-3">
          {data.hospitalProjects.map((project) => (
            <div
              key={project.id}
              className="bg-surface border border-border rounded-xl p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{project.title}</h3>
                  <p className="text-xs text-muted mt-1">
                    {project.description}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[project.status]}`}
                >
                  {STATUS_LABELS[project.status]}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted">
                  {formatBudget(project.budget, project.budgetCurrency)}
                </span>
                <SourceLink
                  url={project.sourceUrl}
                  name={project.sourceName}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Megaprojects NOT completed */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-700">
          Megaproyectos que no se completarán
        </h2>
        <p className="text-sm text-muted mb-4">
          Proyectos viales prometidos que no serán terminados antes del fin del
          mandato (mayo 2026).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.megaprojectsNotCompleted.map((project) => (
            <div
              key={project.id}
              className="bg-surface border border-red-200 rounded-xl p-4"
            >
              <h3 className="font-semibold text-sm">{project.title}</h3>
              <p className="text-xs text-muted mt-1">
                {project.description}
              </p>
              <div className="mt-2">
                <SourceLink
                  url={project.sourceUrl}
                  name={project.sourceName}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decrees Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          Decretos ejecutivos destacados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.decrees.map((decree) => (
            <div
              key={decree.id}
              className="bg-surface border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm">{decree.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 shrink-0">
                  {CATEGORY_LABELS[decree.category] || decree.category}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">{decree.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted">
                  {formatDateFull(decree.date)}
                </span>
                <SourceLink
                  url={decree.sourceUrl}
                  name={decree.sourceName}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Plans */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Planes pendientes</h2>
        <p className="text-sm text-muted mb-4">
          Proyectos y planes anunciados que aún no se han completado.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.pendingPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-surface border border-dashed border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm">{plan.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 shrink-0">
                  {CATEGORY_LABELS[plan.category] || plan.category}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">{plan.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted">
                  Fecha esperada: {plan.expectedDate}
                </span>
                <SourceLink url={plan.sourceUrl} name={plan.sourceName} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Sources */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Fuentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-primary hover:underline p-2 rounded-lg hover:bg-background transition-colors"
            >
              <svg
                className="w-3 h-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {source.name}
            </a>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-muted">
        <p>
          Datos basados en informes públicos verificables. Contribuye en{" "}
          <a
            href="https://github.com/tatosf/cr-gov"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            GitHub
          </a>{" "}
          para mantener esta información actualizada.
        </p>
      </div>
    </div>
  );
}
