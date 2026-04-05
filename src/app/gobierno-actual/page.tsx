import type { Metadata } from "next";
import Link from "next/link";
import data from "@/data/seed/gobierno-actual.json";
import { formatCRC, formatDateFull } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Gobierno Actual — Rendición de Cuentas",
  description:
    "Seguimiento de la administración Chaves Robles: leyes aprobadas, infraestructura, decretos, vetos y planes pendientes.",
};

const STATUS_LABELS: Record<string, string> = {
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  en_proceso: "En proceso",
  en_ejecucion: "En ejecución",
  en_planificacion: "En planificación",
  completado: "Completado",
};

const STATUS_COLORS: Record<string, string> = {
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  en_proceso: "bg-yellow-100 text-yellow-800",
  en_ejecucion: "bg-blue-100 text-blue-800",
  en_planificacion: "bg-purple-100 text-purple-800",
  completado: "bg-green-100 text-green-800",
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

const approved = data.laws.filter((l) => l.status === "aprobada");
const rejected = data.laws.filter((l) => l.status === "rechazada");
const inProcess = data.laws.filter((l) => l.status === "en_proceso");

const completedInfra = data.infrastructure.filter(
  (p) => p.status === "completado"
);
const activeInfra = data.infrastructure.filter(
  (p) => p.status !== "completado"
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

        {/* Term progress bar */}
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.summary.lawsApproved}
          </div>
          <div className="text-xs text-muted mt-1">Leyes aprobadas</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-red-500">
            {data.summary.lawsRejected}
          </div>
          <div className="text-xs text-muted mt-1">Leyes rechazadas</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.summary.infrastructureProjects}
          </div>
          <div className="text-xs text-muted mt-1">Obras de infraestructura</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-foreground">
            {data.summary.decreesIssued}
          </div>
          <div className="text-xs text-muted mt-1">Decretos emitidos</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-orange-500">
            {data.summary.vetoesExercised}
          </div>
          <div className="text-xs text-muted mt-1">Vetos ejercidos</div>
        </div>
      </div>

      {/* Laws Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-6">Leyes y Proyectos de Ley</h2>

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
                <div className="text-xs text-muted mt-2">
                  {formatDateFull(law.date)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Process */}
        {inProcess.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
              En proceso ({inProcess.length})
            </h3>
            <div className="space-y-3">
              {inProcess.map((law) => (
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
                  <div className="text-xs text-muted mt-2">
                    {formatDateFull(law.date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
            Rechazadas ({rejected.length})
          </h3>
          <div className="space-y-3">
            {rejected.map((law) => (
              <div
                key={law.id}
                className="bg-surface border border-border rounded-xl p-4 opacity-80"
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
                <div className="text-xs text-muted mt-2">
                  {formatDateFull(law.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Infrastructure Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-6">Obras de Infraestructura</h2>

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
                <span>Presupuesto: {formatCRC(project.budget)}</span>
                <span>Inicio: {formatDateFull(project.startDate)}</span>
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
            </div>
          ))}
        </div>

        {/* Completed projects */}
        {completedInfra.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
              Completadas ({completedInfra.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedInfra.map((project) => (
                <div
                  key={project.id}
                  className="bg-surface border border-green-200 rounded-xl p-4"
                >
                  <h4 className="font-semibold text-sm">{project.title}</h4>
                  <p className="text-xs text-muted mt-1">
                    {project.description}
                  </p>
                  <div className="text-xs text-muted mt-2">
                    {formatCRC(project.budget)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Decrees Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Decretos ejecutivos destacados</h2>
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
              <div className="text-xs text-muted mt-2">
                {formatDateFull(decree.date)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vetoes Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Vetos presidenciales</h2>
        <div className="space-y-3">
          {data.vetoes.map((veto) => (
            <div
              key={veto.id}
              className="bg-surface border border-orange-200 rounded-xl p-4"
            >
              <h3 className="font-semibold text-sm">{veto.title}</h3>
              <p className="text-xs text-muted mt-1">{veto.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-muted">
                  {formatDateFull(veto.date)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  Razón: {veto.reason}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Plans Section */}
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
              <div className="text-xs text-muted mt-2">
                Fecha esperada: {plan.expectedDate}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Source note */}
      <div className="text-center text-sm text-muted">
        <p>
          Fuentes:{" "}
          <a
            href="https://www.asamblea.go.cr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Asamblea Legislativa
          </a>
          ,{" "}
          <a
            href="https://www.presidencia.go.cr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Presidencia
          </a>
          ,{" "}
          <a
            href="https://www.mopt.go.cr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            MOPT
          </a>{" "}
          — Datos de ejemplo para demostración. Contribuye en{" "}
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
