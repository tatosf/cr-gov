import type { Metadata } from "next";
import { RadialGovernmentGraph } from "@/components/visualizations/RadialGovernmentGraph";
import { GraphLegend } from "@/components/visualizations/GraphLegend";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GobiernoCR — Transparencia del Estado Costarricense",
};

const stats = [
  { label: "Poderes del Estado", value: "4", href: "/gobierno" },
  { label: "Ministerios", value: "19", href: "/gobierno" },
  { label: "Inst. Autónomas", value: "30+", href: "/gobierno" },
  { label: "Diputados", value: "57", href: "/asamblea" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Transparencia del Estado Costarricense
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Explora la estructura, presupuesto y actividad del gobierno de Costa
            Rica. Datos abiertos, actualizados y accesibles para todos.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-surface border border-border rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted mt-1">{stat.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Radial Graph */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Maquinaria del Gobierno
          </h2>
          <p className="text-muted mt-2">
            Estructura organizacional del Estado costarricense. Haz clic en un
            nodo para ver detalles de la institución.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 md:p-8 shadow-sm">
          <RadialGovernmentGraph />
          <div className="mt-6">
            <GraphLegend />
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="bg-surface border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            Fuentes de Datos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Contraloría General",
                desc: "Presupuesto, ejecución presupuestaria, auditorías y sanciones a proveedores.",
                status: "Semanal",
              },
              {
                title: "Banco Central (BCCR)",
                desc: "Tipo de cambio, inflación, tasas de interés e indicadores económicos.",
                status: "Diario",
              },
              {
                title: "Asamblea Legislativa",
                desc: "Asistencia de diputados, votaciones, proyectos de ley y comisiones.",
                status: "Diario",
              },
            ].map((source) => (
              <div
                key={source.title}
                className="border border-border rounded-xl p-6"
              >
                <h3 className="font-semibold text-lg">{source.title}</h3>
                <p className="text-sm text-muted mt-2">{source.desc}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Actualización: {source.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
