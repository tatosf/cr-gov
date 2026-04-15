# Roadmap de contribuciones

Lista viva de áreas donde el proyecto necesita ayuda. Cada ítem es potencialmente un issue y un PR. Si vas a trabajar en algo, **abre primero un issue** para que no dupliquemos esfuerzo.

Etiquetas de dificultad:
- 🟢 **Fácil** — buen primer PR, no requiere contexto profundo del proyecto.
- 🟡 **Intermedio** — necesitas haber leído [arquitectura.md](./arquitectura.md).
- 🔴 **Avanzado** — requiere diseño previo y/o tocar infraestructura de Cloudflare.

---

## Datos y scraping

| Dificultad | Ítem | Referencia |
|---|---|---|
| 🔴 | Fase 0 del sistema de scraping: conectar D1 | [sistema-de-scraping.md § Fase 0](./sistema-de-scraping.md#fase-0--infraestructura-base) |
| 🟡 | Fase 1: seed de D1 desde los JSONs actuales | [sistema-de-scraping.md § Fase 1](./sistema-de-scraping.md#fase-1--seed-inicial-desde-los-jsons-existentes) |
| 🟡 | Fase 2: activar el cron de BCCR con persistencia real | [sistema-de-scraping.md § Fase 2](./sistema-de-scraping.md#fase-2--primer-cron-worker-bccr) |
| 🟡 | Fase 3: portar scrapers de Hacienda y CountryEconomy a Workers | [sistema-de-scraping.md § Fase 3](./sistema-de-scraping.md#fase-3--portar-scrapers-existentes-a-workers) |
| 🔴 | Fase 4: scraper de CGR con HTMLRewriter | [sistema-de-scraping.md § Fase 4](./sistema-de-scraping.md#fase-4--scrapers-nuevos-con-htmlrewriter) |
| 🔴 | Fase 4: scraper de Asamblea Legislativa (asistencia + votaciones) | [agregar-fuente-de-datos.md](./agregar-fuente-de-datos.md) |
| 🔴 | Fase 5: scraper de SICOP con Browser Rendering API | [sistema-de-scraping.md § Fase 5](./sistema-de-scraping.md#fase-5--browser-rendering-para-sicop) |
| 🔴 | Fase 6: Queues + retries + dashboard de ingestas | [sistema-de-scraping.md § Fase 6](./sistema-de-scraping.md#fase-6--queues-retries-y-observabilidad) |
| 🟡 | Integración con CKAN del portal de datos abiertos | [agregar-fuente-de-datos.md](./agregar-fuente-de-datos.md) |
| 🟢 | Completar `institutions.json` con municipalidades faltantes | [src/data/seed/institutions.json](../src/data/seed/institutions.json) |
| 🟢 | Actualizar `officials.json` con cambios recientes de gabinete | [src/data/seed/officials.json](../src/data/seed/officials.json) |

## Visualizaciones

| Dificultad | Ítem | Referencia |
|---|---|---|
| 🟡 | Filtros por sector en el grafo radial (ej. mostrar solo salud) | [RadialGovernmentGraph.tsx](../src/components/visualizations/RadialGovernmentGraph.tsx) |
| 🔴 | Mapa de Costa Rica con datos por cantón (presupuesto, obra pública) | nuevo componente |
| 🟡 | Timeline interactivo de eventos legislativos (votaciones, leyes aprobadas) | nuevo componente |
| 🟡 | Gráficos comparativos entre períodos de gobierno | [GovernmentHistoricalCharts.tsx](../src/components/charts/GovernmentHistoricalCharts.tsx) |
| 🟢 | Leyenda interactiva del grafo radial (toggle por tipo) | [GraphLegend.tsx](../src/components/visualizations/GraphLegend.tsx) |
| 🟡 | Heatmap de ejecución presupuestaria por institución | nuevo componente |

## UI / UX

| Dificultad | Ítem |
|---|---|
| 🟢 | Modo oscuro completo (ya hay variables CSS, falta el toggle y auditar componentes) |
| 🟢 | Mejoras de accesibilidad: roles ARIA, navegación por teclado en visualizaciones |
| 🟡 | Internacionalización (inglés) con next-intl |
| 🟡 | PWA con service worker para soporte offline de datos cacheados |
| 🟢 | Open Graph images dinámicas por página |
| 🟢 | Skeleton loaders en páginas que consultan D1 |
| 🟢 | Botón de "copiar enlace a esta sección" en páginas largas |

## Infraestructura y tooling

| Dificultad | Ítem |
|---|---|
| 🟡 | Tests unitarios para los scrapers (Vitest) |
| 🟡 | Tests de integración para las rutas cron |
| 🟢 | CI con GitHub Actions: lint + typecheck + build en PRs |
| 🔴 | Deploy preview automático por PR (Cloudflare Pages preview) |
| 🟢 | Pre-commit hooks con lint-staged |
| 🟡 | Logging estructurado en los Workers (JSON) |
| 🔴 | Dashboard `/admin/ingestas` con estado de cada scraper |

## Documentación

| Dificultad | Ítem |
|---|---|
| 🟢 | Traducir `docs/*.md` al inglés en `docs/en/` |
| 🟢 | Diagrama de componentes de cada visualización con anotaciones |
| 🟢 | Agregar screenshots a los docs de contribución |
| 🟡 | Guía para agregar una nueva ruta/página siguiendo las convenciones del proyecto |

---

## Cómo se actualiza este roadmap

Este archivo es contribuible como cualquier otro. Si crees que falta algo o que un ítem ya no es relevante, abre un PR editándolo. Los mantenedores actualizan la dificultad y marcan ítems como completados cuando el trabajo se mergea.
