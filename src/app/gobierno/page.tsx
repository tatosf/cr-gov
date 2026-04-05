import type { Metadata } from "next";
import institutionsData from "@/data/seed/institutions.json";
import officialsData from "@/data/seed/officials.json";
import Link from "next/link";
import type { Institution } from "@/lib/types/institutions";
import { TYPE_LABELS, TYPE_BADGE_COLORS } from "@/lib/types/institutions";

export const metadata: Metadata = {
  title: "Estructura del Gobierno",
  description: "Estructura organizacional del Estado costarricense: ministerios, instituciones autónomas y órganos adscritos.",
};

const officialMap = new Map(
  officialsData.officials.map((o) => [o.institutionId, o])
);

const institutions = institutionsData.institutions as Institution[];

const poderes = institutions.filter((i) => i.type === "poder");
const ministerios = institutions.filter((i) => i.type === "ministerio");
const autonomas = institutions.filter((i) => i.type === "autonoma");
const empresas = institutions.filter((i) => i.type === "empresa_publica");
const adscritos = institutions.filter((i) => i.type === "organo_adscrito");
const otros = institutions.filter((i) => i.type === "otro");

function InstitutionCard({ inst }: { inst: Institution }) {
  const official = officialMap.get(inst.id);
  const parent = inst.parentId
    ? institutions.find((i) => i.id === inst.parentId)
    : null;

  return (
    <Link
      href={`/gobierno/${inst.id}`}
      className="block bg-surface border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm leading-tight">{inst.name}</h3>
          {inst.abbreviation && (
            <span className="text-xs text-muted">{inst.abbreviation}</span>
          )}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_BADGE_COLORS[inst.type] || TYPE_BADGE_COLORS.otro}`}
        >
          {TYPE_LABELS[inst.type] || inst.type}
        </span>
      </div>
      {parent && (
        <div className="text-xs text-muted mt-2">
          Adscrito a: {parent.abbreviation || parent.name}
        </div>
      )}
      {inst.sector && (
        <div className="text-xs text-muted mt-1">Sector: {inst.sector}</div>
      )}
      {official && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <div className="text-xs font-medium">{official.title}</div>
          <div className="text-xs text-muted">{official.name}</div>
        </div>
      )}
    </Link>
  );
}

function Section({
  title,
  count,
  items,
}: {
  title: string;
  count: number;
  items: Institution[];
}) {
  return (
    <div className="mb-10">
      <div className="flex items-baseline gap-2 mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="text-sm text-muted">({count})</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((inst) => (
          <InstitutionCard key={inst.id} inst={inst} />
        ))}
      </div>
    </div>
  );
}

export default function GobiernoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Estructura del Gobierno</h1>
        <p className="text-muted mt-2">
          {institutions.length} instituciones que conforman el Estado costarricense.
          Datos de MIDEPLAN.
        </p>
        <div className="mt-4">
          <Link
            href="/"
            className="text-sm text-primary hover:underline"
          >
            Ver visualización radial en la página principal
          </Link>
        </div>
      </div>

      <Section title="Poderes del Estado" count={poderes.length} items={poderes} />
      <Section title="Ministerios" count={ministerios.length} items={ministerios} />
      <Section
        title="Instituciones Autónomas"
        count={autonomas.length}
        items={autonomas}
      />
      <Section
        title="Empresas Públicas"
        count={empresas.length}
        items={empresas}
      />
      <Section
        title="Órganos Adscritos"
        count={adscritos.length}
        items={adscritos}
      />
      <Section title="Otros" count={otros.length} items={otros} />
    </div>
  );
}
