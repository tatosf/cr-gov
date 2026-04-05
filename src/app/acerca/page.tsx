import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acerca de GobiernoCR",
  description: "Metodología, fuentes de datos y tecnología detrás de la plataforma de transparencia GobiernoCR.",
};

const dataSources = [
  {
    name: "Banco Central de Costa Rica (BCCR)",
    url: "https://www.bccr.fi.cr",
    data: "Tipo de cambio, tasa básica pasiva, inflación, indicadores económicos",
    frequency: "Diario",
    method: "SOAP Web Service",
    status: "active",
  },
  {
    name: "Contraloría General de la República (CGR)",
    url: "https://www.cgr.go.cr",
    data: "Presupuesto nacional, ejecución presupuestaria, auditorías, sanciones a proveedores",
    frequency: "Semanal",
    method: "Descarga de datos abiertos (CSV/JSON)",
    status: "active",
  },
  {
    name: "Asamblea Legislativa",
    url: "https://www.asamblea.go.cr",
    data: "Información legislativa, ejecución presupuestaria",
    frequency: "Semanal",
    method: "Portal de datos abiertos",
    status: "active",
  },
  {
    name: "Ojo al Voto",
    url: "https://www.ojoalvoto.com",
    data: "Asistencia de diputados, discursos en plenario, actividad legislativa",
    frequency: "Diario",
    method: "API / Web scraping",
    status: "active",
  },
  {
    name: "Portal Nacional de Datos Abiertos",
    url: "https://datosabiertos.gob.go.cr",
    data: "Datasets gubernamentales de múltiples instituciones",
    frequency: "Semanal",
    method: "CKAN API",
    status: "planned",
  },
  {
    name: "SICOP",
    url: "https://sicop.go.cr",
    data: "Contrataciones públicas, licitaciones, proveedores",
    frequency: "Semanal",
    method: "Web scraping",
    status: "planned",
  },
  {
    name: "Ministerio de Hacienda",
    url: "https://www.hacienda.go.cr",
    data: "Datos fiscales, catálogo CABYS, exoneraciones",
    frequency: "Semanal",
    method: "REST API",
    status: "planned",
  },
  {
    name: "MIDEPLAN",
    url: "https://www.mideplan.go.cr",
    data: "Estructura organizacional del Estado, indicadores de desarrollo",
    frequency: "Mensual",
    method: "Curación manual",
    status: "active",
  },
  {
    name: "Tribunal Supremo de Elecciones (TSE)",
    url: "https://www.tse.go.cr",
    data: "Resultados electorales, financiamiento de partidos",
    frequency: "Trimestral",
    method: "Curación manual",
    status: "planned",
  },
];

const techStack = [
  { name: "Next.js 16", desc: "Framework de React con renderizado del lado del servidor" },
  { name: "D3.js", desc: "Visualizaciones interactivas (grafos radiales, de fuerza, heatmaps)" },
  { name: "Recharts", desc: "Gráficos estándar (barras, líneas, áreas, treemaps)" },
  { name: "Tailwind CSS 4", desc: "Sistema de diseño responsive" },
  { name: "Cloudflare Pages + D1", desc: "Hosting y base de datos serverless" },
  { name: "Drizzle ORM", desc: "Acceso tipado a la base de datos" },
  { name: "TypeScript", desc: "Tipado estático para seguridad del código" },
];

export default function AcercaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Acerca de GobiernoCR</h1>
        <p className="text-muted mt-2">
          Metodología, fuentes de datos y tecnología detrás de esta plataforma.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Misión</h2>
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-3 text-sm leading-relaxed">
          <p>
            GobiernoCR es una plataforma de transparencia que busca hacer accesible y
            comprensible la información pública del Estado costarricense. Creemos que la
            transparencia gubernamental no debe estar limitada por la capacidad de procesar
            datos complejos.
          </p>
          <p>
            Costa Rica publica una enorme cantidad de datos a través de portales gubernamentales,
            pero estos datos son difíciles de consumir para la mayoría de los ciudadanos.
            Nuestro objetivo es transformar estos datos en visualizaciones interactivas y
            paneles de control que cualquier persona pueda entender.
          </p>
          <p>
            Este es un proyecto de código abierto, independiente y sin fines de lucro.
            Los datos provienen exclusivamente de fuentes gubernamentales oficiales.
          </p>
        </div>
      </section>

      {/* Data Sources */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Fuentes de Datos</h2>
        <div className="space-y-3">
          {dataSources.map((source) => (
            <div
              key={source.name}
              className="bg-surface border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-sm text-primary hover:underline"
                  >
                    {source.name}
                  </a>
                  <p className="text-xs text-muted mt-1">{source.data}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                    source.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {source.status === "active" ? "Activo" : "Planeado"}
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-muted">
                <span>Frecuencia: {source.frequency}</span>
                <span>Método: {source.method}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Metodología</h2>
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-1">Recolección de datos</h3>
            <p className="text-muted">
              Los datos se obtienen automáticamente de las APIs y portales gubernamentales
              mediante scripts de ingesta programados (cron jobs). Cada ejecución se registra
              en un log de auditoría que incluye la cantidad de registros procesados y cualquier error.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Almacenamiento</h3>
            <p className="text-muted">
              Todos los datos se almacenan localmente en una base de datos con marcas de tiempo.
              Esto permite mantener un historial completo y no depender de la disponibilidad
              de las fuentes originales en tiempo real.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Actualización</h3>
            <p className="text-muted">
              Cada fuente de datos tiene una frecuencia de actualización diferente. Los
              indicadores económicos del BCCR se actualizan diariamente. Los datos presupuestarios
              de la CGR se actualizan semanalmente. La estructura del gobierno se revisa mensualmente.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Limitaciones</h3>
            <p className="text-muted">
              Esta plataforma muestra datos tal como son publicados por las fuentes oficiales.
              No realizamos auditorías independientes ni verificamos la precisión de los datos
              originales. Los datos de ejemplo actuales son ilustrativos y serán reemplazados
              por datos reales conforme se conecten las fuentes.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Tecnología</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="bg-surface border border-border rounded-xl p-4"
            >
              <div className="font-semibold text-sm">{tech.name}</div>
              <div className="text-xs text-muted mt-0.5">{tech.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Legal */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Marco Legal</h2>
        <div className="bg-surface border border-border rounded-2xl p-6 text-sm text-muted space-y-2">
          <p>
            Esta plataforma opera bajo el principio de transparencia pública establecido
            en la Constitución Política de Costa Rica y la Ley de Acceso a la Información
            Pública. Todos los datos utilizados son de acceso público.
          </p>
          <p>
            El Decreto Ejecutivo No. 40199 establece el marco de datos abiertos del
            gobierno costarricense, que garantiza que los datos públicos sean accesibles,
            gratuitos y en formatos abiertos.
          </p>
        </div>
      </section>

      <div className="text-center">
        <Link href="/" className="text-sm text-primary hover:underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
