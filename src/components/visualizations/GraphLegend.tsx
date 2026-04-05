const legendItems = [
  { label: "Poder del Estado", color: "#c8102e", shape: "square" },
  { label: "Ministerio", color: "#e63950", shape: "square" },
  { label: "Inst. Autónoma", color: "#2d5a8e", shape: "circle" },
  { label: "Empresa Pública", color: "#f5a623", shape: "square" },
  { label: "Órgano Adscrito", color: "#7ab648", shape: "diamond" },
  { label: "Otro", color: "#64748b", shape: "diamond" },
];

function ShapeIcon({ shape, color }: { shape: string; color: string }) {
  const size = 14;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {shape === "circle" ? (
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill={color} />
      ) : shape === "diamond" ? (
        <polygon
          points={`${size / 2},1 ${size - 1},${size / 2} ${size / 2},${size - 1} 1,${size / 2}`}
          fill={color}
        />
      ) : (
        <rect x={1} y={1} width={size - 2} height={size - 2} rx={2} fill={color} />
      )}
    </svg>
  );
}

export function GraphLegend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center text-sm text-muted">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <ShapeIcon shape={item.shape} color={item.color} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
