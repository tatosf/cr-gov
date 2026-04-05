import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import institutionsData from "@/data/seed/institutions.json";
import officialsData from "@/data/seed/officials.json";

interface Institution {
  id: string;
  name: string;
  abbreviation?: string;
  type: string;
  parentId?: string;
  sector?: string;
  website?: string;
}

const institutions = institutionsData.institutions as Institution[];

const TYPE_LABELS: Record<string, string> = {
  poder: "Poder del Estado",
  ministerio: "Ministerio",
  autonoma: "Institución Autónoma",
  semi_autonoma: "Semi-autónoma",
  organo_adscrito: "Órgano Adscrito",
  empresa_publica: "Empresa Pública",
  municipalidad: "Municipalidad",
  otro: "Otro",
};

const TYPE_COLORS: Record<string, string> = {
  poder: "bg-red-100 text-red-800",
  ministerio: "bg-rose-100 text-rose-800",
  autonoma: "bg-blue-100 text-blue-800",
  semi_autonoma: "bg-sky-100 text-sky-800",
  organo_adscrito: "bg-green-100 text-green-800",
  empresa_publica: "bg-amber-100 text-amber-800",
  otro: "bg-gray-100 text-gray-800",
};

const DESCRIPTIONS: Record<string, string> = {
  poder: "Uno de los poderes fundamentales del Estado costarricense, establecido por la Constitución Política para garantizar el equilibrio y la separación de funciones.",
  ministerio: "Órgano del Poder Ejecutivo responsable de la formulación y ejecución de políticas públicas en su área de competencia.",
  autonoma: "Institución con independencia administrativa y funcional, creada por ley para cumplir funciones especializadas del Estado.",
  semi_autonoma: "Institución con cierto grado de independencia administrativa, adscrita a un ente rector del Estado.",
  organo_adscrito: "Órgano técnico especializado adscrito a una institución principal, con funciones específicas delegadas.",
  empresa_publica: "Empresa de propiedad estatal que opera en el mercado bajo principios de eficiencia, brindando servicios estratégicos al país.",
  municipalidad: "Gobierno local encargado de la administración de los intereses y servicios del cantón.",
  otro: "Entidad vinculada al aparato estatal con funciones específicas.",
};

export function generateStaticParams() {
  return institutions.map((inst) => ({ slug: inst.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const institution = institutions.find((i) => i.id === slug);
  if (!institution) return { title: "Institución no encontrada" };
  return {
    title: institution.name,
    description: `${TYPE_LABELS[institution.type] || institution.type} — ${institution.sector || "gobierno"}. Información, estructura y enlaces.`,
  };
}

export default async function InstitutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const institution = institutions.find((i) => i.id === slug);
  if (!institution) return notFound();

  const official = officialsData.officials.find(
    (o) => o.institutionId === institution.id
  );
  const parent = institution.parentId
    ? institutions.find((i) => i.id === institution.parentId)
    : null;
  const children = institutions.filter((i) => i.parentId === institution.id);

  const typeLabel = TYPE_LABELS[institution.type] || institution.type;
  const typeColor = TYPE_COLORS[institution.type] || TYPE_COLORS.otro;
  const description = DESCRIPTIONS[institution.type] || DESCRIPTIONS.otro;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/gobierno" className="hover:text-foreground">
          Gobierno
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{institution.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {institution.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {institution.abbreviation && (
                <span className="text-sm font-mono bg-background px-2 py-0.5 rounded border border-border">
                  {institution.abbreviation}
                </span>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${typeColor}`}
              >
                {typeLabel}
              </span>
              {institution.sector && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {institution.sector}
                </span>
              )}
            </div>
          </div>
          {institution.website && (
            <a
              href={institution.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-light transition-colors shrink-0"
            >
              Sitio web oficial
              <svg
                className="w-4 h-4"
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
            </a>
          )}
        </div>
      </div>

      {/* Official */}
      {official && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Jerarca actual</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {official.name
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <div className="font-semibold">{official.name}</div>
              <div className="text-sm text-muted">{official.title}</div>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Sobre esta institución</h2>
        <p className="text-sm text-muted leading-relaxed">{description}</p>
      </div>

      {/* Parent institution */}
      {parent && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Institución superior</h2>
          <Link
            href={`/gobierno/${parent.id}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors"
          >
            <span
              className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_COLORS[parent.type] || TYPE_COLORS.otro}`}
            >
              {TYPE_LABELS[parent.type] || parent.type}
            </span>
            <div>
              <div className="font-medium text-sm">{parent.name}</div>
              {parent.abbreviation && (
                <div className="text-xs text-muted">{parent.abbreviation}</div>
              )}
            </div>
          </Link>
        </div>
      )}

      {/* Child institutions */}
      {children.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">
            Instituciones adscritas ({children.length})
          </h2>
          <div className="space-y-1">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/gobierno/${child.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors"
              >
                <span
                  className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_COLORS[child.type] || TYPE_COLORS.otro}`}
                >
                  {TYPE_LABELS[child.type] || child.type}
                </span>
                <div>
                  <div className="font-medium text-sm">{child.name}</div>
                  {child.sector && (
                    <div className="text-xs text-muted">{child.sector}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related sections */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Explorar más</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/gobierno"
            className="p-3 rounded-lg border border-border hover:bg-background transition-colors text-sm"
          >
            <div className="font-medium">Todas las instituciones</div>
            <div className="text-xs text-muted mt-0.5">
              Estructura completa del gobierno
            </div>
          </Link>
          <Link
            href="/presupuesto"
            className="p-3 rounded-lg border border-border hover:bg-background transition-colors text-sm"
          >
            <div className="font-medium">Presupuesto</div>
            <div className="text-xs text-muted mt-0.5">
              Asignación y ejecución presupuestaria
            </div>
          </Link>
          <Link
            href="/contrataciones"
            className="p-3 rounded-lg border border-border hover:bg-background transition-colors text-sm"
          >
            <div className="font-medium">Contrataciones</div>
            <div className="text-xs text-muted mt-0.5">
              Contratos públicos y proveedores
            </div>
          </Link>
          <Link
            href="/relaciones"
            className="p-3 rounded-lg border border-border hover:bg-background transition-colors text-sm"
          >
            <div className="font-medium">Relaciones</div>
            <div className="text-xs text-muted mt-0.5">
              Grafo de relaciones institucionales
            </div>
          </Link>
        </div>
      </div>

      <div className="text-center">
        <Link href="/gobierno" className="text-sm text-primary hover:underline">
          ← Volver a estructura del gobierno
        </Link>
      </div>
    </div>
  );
}
