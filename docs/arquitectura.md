# Arquitectura

Vista rápida del stack y del flujo de datos actual. Este documento refleja **el estado real del repositorio hoy**, no una aspiración.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router, React Server Components) |
| Lenguaje | TypeScript estricto |
| Estilos | Tailwind CSS 4 con variables CSS custom |
| Gráficos | D3.js v7 (visualizaciones complejas), Recharts (gráficos estándar) |
| Base de datos | Drizzle ORM + SQLite local / Cloudflare D1 (schema definido, aún no conectado) |
| Hosting | Cloudflare (Workers + Pages vía OpenNext) |
| Scraping actual | Scripts locales en `scripts/scrapers/` ejecutados manualmente |

## Estructura de carpetas

```
cr-gov/
├── src/
│   ├── app/                    Rutas del App Router
│   │   ├── api/cron/bccr/      Endpoint de actualización de datos BCCR
│   │   ├── gobierno/           Estructura del gobierno (grafo radial)
│   │   ├── asamblea/           Asamblea Legislativa
│   │   ├── economia/           Indicadores económicos
│   │   ├── presupuesto/        Presupuesto nacional
│   │   ├── contrataciones/     Contratos públicos
│   │   ├── relaciones/         Grafo de relaciones entre entidades
│   │   └── datos/              Dashboard de datos agregados
│   ├── components/
│   │   ├── ui/                 Header, Footer, Search
│   │   ├── charts/             Gráficos con Recharts
│   │   └── visualizations/     D3: grafo radial, heatmap, force graph
│   ├── lib/
│   │   ├── api/                Clientes de APIs externas (BCCR, etc.)
│   │   ├── db/schema.ts        Definición de tablas Drizzle
│   │   ├── types/              Tipos compartidos
│   │   └── utils/              Formateadores y helpers
│   └── data/seed/              JSONs semilla (fuente de verdad actual)
├── scripts/
│   ├── scrape.ts               Orquestador que corre todos los scrapers
│   ├── lib/html.ts             Utilidades de fetch + parseo XML/HTML
│   └── scrapers/
│       ├── bccr.ts             Banco Central — indicadores económicos
│       ├── countryeconomy.ts   Déficit fiscal
│       ├── hacienda.ts         Ministerio de Hacienda — tipo de cambio
│       └── validators.ts       Schemas Zod para validar los datos
└── docs/                       (Esta carpeta)
```

Los archivos de configuración en la raíz (`package.json`, `tsconfig.json`, `next.config.ts`, `wrangler.toml`, `drizzle.config.ts`, etc.) viven ahí por convención de sus herramientas respectivas y **no deben moverse**.

## Flujo de datos (hoy)

```
┌──────────────────┐     bun run scrape     ┌─────────────────────┐
│ Fuentes externas │ ◄───────────────────── │ scripts/scrapers/*  │
│ (BCCR, Hacienda, │                        └─────────┬───────────┘
│  CountryEconomy) │                                  │ valida con Zod
└──────────────────┘                                  ▼
                                            ┌─────────────────────┐
                                            │ src/data/seed/*.json│
                                            └─────────┬───────────┘
                                                      │ import directo
                                                      ▼
                                            ┌─────────────────────┐
                                            │ Componentes Next.js │
                                            └─────────────────────┘
```

**Limitaciones del modelo actual:**
- Los datos son **estáticos**: se actualizan solo cuando alguien corre `bun run scrape` localmente y hace commit.
- No hay historial — cada corrida sobrescribe el JSON anterior.
- El schema de Drizzle existe ([src/lib/db/schema.ts](../src/lib/db/schema.ts)) pero la base de datos aún no está conectada.
- Solo hay una ruta cron ([src/app/api/cron/bccr/route.ts](../src/app/api/cron/bccr/route.ts)) y está deshabilitada en `wrangler.toml`.

La propuesta para superar estas limitaciones está en [sistema-de-scraping.md](./sistema-de-scraping.md).

## Rutas y páginas

Cada sección del sitio es una ruta del App Router bajo `src/app/`. Las páginas consumen los JSONs de `src/data/seed/` directamente vía import estático, lo que permite que Next.js las pre-renderice en build time. Cuando migremos a D1, las páginas pasarán a leer desde la base de datos con ISR (`revalidate`) para mantener el performance.

## Visualizaciones

- **[RadialGovernmentGraph](../src/components/visualizations/RadialGovernmentGraph.tsx)** — árbol radial de instituciones con pinch/zoom en móvil.
- **[RelationshipForceGraph](../src/components/visualizations/RelationshipForceGraph.tsx)** — grafo de fuerzas entre entidades.
- **[AttendanceHeatmap](../src/components/visualizations/AttendanceHeatmap.tsx)** — asistencia legislativa por sesión.
- **[GovernmentHistoricalCharts](../src/components/charts/GovernmentHistoricalCharts.tsx)** — comparaciones históricas con Recharts.

Todas usan `ResizeObserver` para ser responsive y siguen el patrón D3-dentro-de-useEffect.
