# Contribuir a GobiernoCR

Gracias por tu interes en contribuir a GobiernoCR. Este documento explica como colaborar en el proyecto.

## Requisitos previos

- Node.js v20 o superior
- npm
- Conocimiento basico de React, TypeScript y Next.js

## Configuracion del entorno

```bash
# 1. Fork y clonar
git clone https://github.com/<tu-usuario>/cr-gov.git
cd cr-gov

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev

# 4. Abrir http://localhost:3000
```

## Flujo de trabajo

1. **Crear un issue** describiendo el cambio o la funcionalidad propuesta
2. **Crear una rama** desde `main`:
   ```bash
   git checkout -b feature/descripcion-corta
   ```
3. **Hacer los cambios** siguiendo las convenciones del proyecto
4. **Verificar que el build pasa**:
   ```bash
   npm run build
   npm run lint
   ```
5. **Hacer commit** con un mensaje descriptivo
6. **Abrir un Pull Request** contra `main`

## Convenciones de codigo

### General
- TypeScript estricto — no usar `any` excepto en callbacks de librerias externas
- Componentes funcionales con hooks
- Archivos en PascalCase para componentes, camelCase para utilidades

### Estilos
- Tailwind CSS 4 con variables CSS custom (`--primary`, `--surface`, etc.)
- Clases responsive con `sm:`, `md:`, `lg:`
- No usar CSS modules ni styled-components

### Visualizaciones
- D3.js para visualizaciones complejas (grafos, heatmaps) — D3 controla el DOM dentro de `useEffect` + `useRef`
- Recharts para graficos estandar (barras, lineas, areas)
- Siempre hacer los componentes responsive con `ResizeObserver`

### Datos
- Los datos semilla estan en `src/data/seed/*.json`
- Los datos deben seguir la estructura existente de cada archivo
- Fuentes de datos nuevas deben ser gubernamentales y de acceso publico

## Areas donde puedes contribuir

La lista completa de areas con niveles de dificultad esta en [docs/roadmap-contribuciones.md](./docs/roadmap-contribuciones.md). Algunos puntos de entrada:

- **Sistema de scraping dinamico** con Cloudflare — el proyecto prioritario. Lee [docs/sistema-de-scraping.md](./docs/sistema-de-scraping.md) para la arquitectura completa y el plan de fases.
- **Agregar una fuente de datos** nueva — guia paso a paso en [docs/agregar-fuente-de-datos.md](./docs/agregar-fuente-de-datos.md).
- **Visualizaciones, UI/UX e infraestructura** — ver el roadmap.

Antes de empezar, lee [docs/arquitectura.md](./docs/arquitectura.md) para entender el stack y el flujo de datos.

## Estructura de los datos semilla

### institutions.json
```json
{
  "id": "identificador-unico",
  "name": "Nombre completo de la institucion",
  "abbreviation": "SIGLAS",
  "type": "ministerio | autonoma | organo_adscrito | empresa_publica | poder | otro",
  "parentId": "id-de-institucion-padre",
  "sector": "sector al que pertenece",
  "website": "https://sitio-oficial.go.cr"
}
```

### officials.json
```json
{
  "id": "nombre-en-slug",
  "name": "Nombre Completo",
  "title": "Cargo",
  "institutionId": "id-de-institucion",
  "startDate": "2022-05-08",
  "isCurrent": true
}
```

## Reporte de errores

Usa [GitHub Issues](https://github.com/tatosf/cr-gov/issues) e incluye:

1. Descripcion del problema
2. Pasos para reproducir
3. Comportamiento esperado vs actual
4. Screenshots si aplica
5. Navegador y sistema operativo

## Codigo de conducta

- Se respetuoso y constructivo
- Enfocate en la transparencia y el interes publico
- No incluir datos personales o privados
- Las discusiones politicas no son el objetivo del proyecto — el enfoque es la transparencia de datos
