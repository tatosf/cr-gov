export interface Institution {
  id: string;
  name: string;
  abbreviation?: string;
  type: string;
  parentId?: string;
  sector?: string;
  website?: string;
}

export interface Official {
  id: string;
  name: string;
  title: string;
  institutionId: string;
  startDate: string;
  isCurrent: boolean;
}

export const TYPE_LABELS: Record<string, string> = {
  poder: "Poder del Estado",
  ministerio: "Ministerio",
  autonoma: "Institución Autónoma",
  semi_autonoma: "Semi-autónoma",
  organo_adscrito: "Órgano Adscrito",
  empresa_publica: "Empresa Pública",
  municipalidad: "Municipalidad",
  otro: "Otro",
};

/** Tailwind class pairs for badges */
export const TYPE_BADGE_COLORS: Record<string, string> = {
  poder: "bg-red-100 text-red-800",
  ministerio: "bg-rose-100 text-rose-800",
  autonoma: "bg-blue-100 text-blue-800",
  semi_autonoma: "bg-sky-100 text-sky-800",
  organo_adscrito: "bg-green-100 text-green-800",
  empresa_publica: "bg-amber-100 text-amber-800",
  municipalidad: "bg-purple-100 text-purple-800",
  otro: "bg-gray-100 text-gray-800",
};

/** Hex colors for D3 visualizations */
export const TYPE_HEX_COLORS: Record<string, string> = {
  poder: "#c8102e",
  ministerio: "#e63950",
  autonoma: "#2d5a8e",
  semi_autonoma: "#4a90d9",
  organo_adscrito: "#7ab648",
  empresa_publica: "#f5a623",
  municipalidad: "#9b59b6",
  otro: "#64748b",
};

export const TYPE_DESCRIPTIONS: Record<string, string> = {
  poder: "Uno de los poderes fundamentales del Estado costarricense, establecido por la Constitución Política para garantizar el equilibrio y la separación de funciones.",
  ministerio: "Órgano del Poder Ejecutivo responsable de la formulación y ejecución de políticas públicas en su área de competencia.",
  autonoma: "Institución con independencia administrativa y funcional, creada por ley para cumplir funciones especializadas del Estado.",
  semi_autonoma: "Institución con cierto grado de independencia administrativa, adscrita a un ente rector del Estado.",
  organo_adscrito: "Órgano técnico especializado adscrito a una institución principal, con funciones específicas delegadas.",
  empresa_publica: "Empresa de propiedad estatal que opera en el mercado bajo principios de eficiencia, brindando servicios estratégicos al país.",
  municipalidad: "Gobierno local encargado de la administración de los intereses y servicios del cantón.",
  otro: "Entidad vinculada al aparato estatal con funciones específicas.",
};
