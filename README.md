# GobiernoCR

Plataforma de transparencia del Estado costarricense. Visualiza la estructura, presupuesto, actividad legislativa y contrataciones del gobierno de Costa Rica con datos abiertos.

**[Ver sitio en vivo](https://cr-gov.santiagofischel1.workers.dev)**

## Funcionalidades

- **Maquinaria del Gobierno** — Grafo radial interactivo con la estructura completa del Estado (79 instituciones)
- **Presupuesto Nacional** — Dashboard con treemap, barras comparativas y tendencia historica
- **Indicadores Economicos** — Tipo de cambio, tasa basica pasiva e inflacion del BCCR
- **Asamblea Legislativa** — 57 diputados con asistencia, actividad y perfiles individuales
- **Contrataciones Publicas** — Contratos del Estado con proveedores, distribucion por institucion
- **Relaciones e Influencia** — Grafo de fuerza mostrando relaciones contractuales
- **Busqueda Global** — Busqueda instantanea (Cmd+K) de instituciones, funcionarios, diputados y proveedores
- **Datos Abiertos** — Descarga de todos los datasets en JSON y CSV

## Tech Stack

| Tecnologia | Uso |
|---|---|
| [Next.js 16](https://nextjs.org) | Framework React con App Router y SSG |
| [TypeScript](https://www.typescriptlang.org) | Tipado estatico |
| [Tailwind CSS 4](https://tailwindcss.com) | Sistema de diseno responsive |
| [D3.js](https://d3js.org) | Visualizaciones interactivas (grafos radiales, de fuerza, heatmaps) |
| [Recharts](https://recharts.org) | Graficos estandar (barras, lineas, areas, treemaps, pie) |
| [Cloudflare Workers](https://workers.cloudflare.com) | Hosting serverless en el edge |
| [@opennextjs/cloudflare](https://opennext.js.org) | Adaptador de Next.js para Cloudflare |

## Inicio rapido

### Prerrequisitos

- [Node.js](https://nodejs.org) v20 o superior
- npm

### Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/tatosf/cr-gov.git
cd cr-gov

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Scripts disponibles

| Comando | Descripcion |
|---|---|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de produccion |
| `npm run lint` | Ejecutar ESLint |
| `npm run build:cf` | Build para Cloudflare Workers |
| `npm run deploy` | Build + deploy a Cloudflare |

## Estructura del proyecto

```
cr-gov/
  src/
    app/                          # Paginas (Next.js App Router)
      page.tsx                    # Landing con grafo radial
      gobierno/                   # Estructura del gobierno
        [slug]/page.tsx           # Detalle de institucion
      presupuesto/page.tsx        # Dashboard de presupuesto
      economia/page.tsx           # Indicadores economicos
      asamblea/                   # Asamblea Legislativa
        [slug]/page.tsx           # Perfil de diputado
      contrataciones/page.tsx     # Contrataciones publicas
      relaciones/page.tsx         # Grafo de relaciones
      datos/page.tsx              # Exportacion de datos
      acerca/page.tsx             # Metodologia y fuentes
    components/
      visualizations/             # Componentes D3 + Recharts
        RadialGovernmentGraph.tsx  # Grafo radial del gobierno
        RelationshipForceGraph.tsx # Grafo de fuerza
        AttendanceHeatmap.tsx      # Heatmap de asistencia
      ui/                         # Componentes UI compartidos
        Header.tsx
        Footer.tsx
        SearchDialog.tsx
    data/seed/                    # Datos semilla (JSON)
      institutions.json           # 79 instituciones del Estado
      officials.json              # Funcionarios actuales
      legislators.json            # 57 diputados
      budget.json                 # Presupuesto por sector/institucion
      economic-indicators.json    # Tipo de cambio, TBP, inflacion
      procurement.json            # Contratos publicos
    lib/
      api/bccr.ts                 # Cliente SOAP del BCCR
      db/schema.ts                # Schema Drizzle (D1/SQLite)
      utils/format.ts             # Utilidades de formato
```

## Fuentes de datos

| Fuente | Datos | Estado |
|---|---|---|
| [BCCR](https://www.bccr.fi.cr) | Tipo de cambio, TBP, inflacion | Activo |
| [CGR](https://www.cgr.go.cr) | Presupuesto, contrataciones | Activo |
| [Asamblea Legislativa](https://www.asamblea.go.cr) | Informacion legislativa | Activo |
| [Ojo al Voto](https://www.ojoalvoto.com) | Asistencia de diputados | Activo |
| [MIDEPLAN](https://www.mideplan.go.cr) | Estructura del gobierno | Activo |
| [Datos Abiertos CR](https://datosabiertos.gob.go.cr) | Datasets gubernamentales | Planeado |
| [SICOP](https://sicop.go.cr) | Licitaciones y proveedores | Planeado |
| [TSE](https://www.tse.go.cr) | Resultados electorales | Planeado |

> Los datos actuales son de ejemplo para demostracion. Seran reemplazados por datos reales conforme se conecten las fuentes.

## Contribuir

Las contribuciones son bienvenidas. Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) antes de enviar un PR.

### Resumen rapido

1. Fork del repositorio
2. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## Licencia

Este proyecto es de codigo abierto. Los datos provienen de fuentes gubernamentales oficiales bajo el marco de datos abiertos de Costa Rica (Decreto Ejecutivo No. 40199).

## Contacto

Preguntas, sugerencias o reportes de errores: [abrir un issue](https://github.com/tatosf/cr-gov/issues).
