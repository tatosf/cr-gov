import type { Metadata } from "next";
import { RelationshipForceGraph } from "@/components/visualizations/RelationshipForceGraph";

export const metadata: Metadata = {
  title: "Relaciones e Influencia",
  description: "Grafo interactivo de relaciones contractuales entre instituciones del Estado y proveedores.",
};

export default function RelacionesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Relaciones e Influencia</h1>
        <p className="text-muted mt-2">
          Grafo de relaciones entre instituciones del Estado y proveedores.
          El grosor de las líneas representa el monto de los contratos.
          Arrastra los nodos para explorar.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 md:p-8">
        <RelationshipForceGraph />

        {/* Legend */}
        <div className="flex flex-wrap gap-6 justify-center mt-6 text-sm text-muted">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#2d5a8e] inline-block" />
            Institución
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#f5a623] inline-block" />
            Proveedor
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-gray-400 inline-block rounded" />
            Contrato (grosor = monto)
          </div>
        </div>
      </div>

      <div className="mt-6 bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-3">Sobre esta visualización</h2>
        <div className="text-sm text-muted space-y-2">
          <p>
            Este grafo muestra las relaciones contractuales entre instituciones del Estado
            (cuadrados azules) y sus proveedores (círculos naranjas). El tamaño de cada nodo
            es proporcional al monto total de contratos.
          </p>
          <p>
            Las conexiones entre múltiples instituciones y un mismo proveedor pueden indicar
            proveedores estratégicos o concentración en contrataciones. Esta herramienta
            permite visualizar patrones que no son evidentes en tablas de datos.
          </p>
          <p>
            Los datos provienen de la Contraloría General de la República y SICOP.
            Esta es una versión de demostración con datos de ejemplo.
          </p>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-muted">
        <p>
          Fuente:{" "}
          <a
            href="https://www.cgr.go.cr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Contraloría General de la República
          </a>{" "}
          — Datos de ejemplo para demostración
        </p>
      </div>
    </div>
  );
}
