# Sistema de scraping dinámico sobre Cloudflare

> **Estado:** Propuesta. El schema de base de datos ya existe en [src/lib/db/schema.ts](../src/lib/db/schema.ts); la infraestructura de Cloudflare está parcialmente configurada en [wrangler.toml](../wrangler.toml) (comentada). Este documento define el camino para activarla.

## Motivación

Hoy los datos del sitio son **estáticos**: los JSONs bajo `src/data/seed/` se actualizan solo cuando alguien corre `bun run scrape` localmente y hace commit. Esto significa:

- Los datos se quedan desactualizados entre releases.
- No hay historial — cada corrida pisa la anterior, así que no podemos mostrar series de tiempo reales.
- El repositorio crece con cada cambio de datos (JSONs versionados en Git).
- No es contribuible a escala: nadie va a abrir PRs para actualizar cifras del BCCR cada día.

Queremos que **cada página se actualice dinámicamente desde fuentes oficiales**, con historial, sin intervención humana, y aprovechando la infraestructura que ya pagamos en Cloudflare (el sitio ya se despliega ahí vía OpenNext).

## Arquitectura propuesta

```
                    ┌─────────────────────────────────────┐
                    │      Cloudflare Cron Triggers       │
                    │  (definidos en wrangler.toml)       │
                    └──────────────┬──────────────────────┘
                                   │ dispara por horario
                                   ▼
                    ┌─────────────────────────────────────┐
                    │   Worker: /api/cron/[source]        │
                    │   - BCCR     (diario  06:00 UTC)    │
                    │   - Hacienda (diario  07:00 UTC)    │
                    │   - SICOP    (semanal L  03:00)     │
                    │   - CGR      (semanal L  04:00)     │
                    │   - Asamblea (diario  05:00 UTC)    │
                    └──────────┬──────────────────────────┘
                               │
            ┌──────────────────┼───────────────────────┐
            ▼                  ▼                       ▼
    ┌───────────────┐  ┌───────────────┐      ┌────────────────┐
    │ APIs JSON     │  │ HTML simple   │      │ HTML con JS    │
    │ fetch directo │  │ fetch + regex │      │ Browser        │
    │               │  │ / HTMLRewriter│      │ Rendering API  │
    └───────┬───────┘  └───────┬───────┘      └────────┬───────┘
            │                  │                        │
            └──────────────────┼────────────────────────┘
                               ▼
                    ┌─────────────────────────┐
                    │ Validación con Zod      │
                    │ (schemas existentes en  │
                    │  scripts/scrapers/      │
                    │   validators.ts)        │
                    └──────────┬──────────────┘
                               │ rechaza si no valida
                               ▼
                    ┌─────────────────────────┐
                    │ Cloudflare Queue        │
                    │ "scrape-results"        │
                    │ (retries, back-off)     │
                    └──────────┬──────────────┘
                               ▼
                    ┌─────────────────────────┐
                    │ Consumer Worker         │
                    │ upsert a D1 + log en    │
                    │ ingestion_logs          │
                    └──────────┬──────────────┘
                               ▼
                    ┌─────────────────────────┐
                    │ Cloudflare D1           │
                    │ (schema en              │
                    │  src/lib/db/schema.ts)  │
                    └──────────┬──────────────┘
                               │
                               │ lectura desde páginas
                               ▼
                    ┌─────────────────────────┐
                    │ Next.js (ISR)           │
                    │ revalidate: 300s-3600s  │
                    └─────────────────────────┘
```

## Componentes de Cloudflare a usar

| Servicio | Para qué | Estado |
|---|---|---|
| **Workers** | Ejecutar cada scraper como un handler HTTP | Ya desplegamos el sitio como Worker vía OpenNext |
| **Cron Triggers** | Disparar cada scraper en su horario | Configurado pero comentado en `wrangler.toml` |
| **D1** | Almacenar datos normalizados con historial | Schema listo en `src/lib/db/schema.ts`, sin bindear |
| **HTMLRewriter** | Parsear HTML simple de forma streaming | API nativa de Workers, gratis |
| **Browser Rendering API** | Scrapear sitios con JavaScript pesado (SICOP, algunos portales) | Requiere plan Workers Paid |
| **Queues** | Desacoplar el fetch del write, retries automáticos | Requiere plan Workers Paid |
| **KV** | Marcar "última vez que corrió cada scraper" + cache de responses intermedias | Gratis dentro de límites |
| **R2** | Guardar copias crudas (HTML/PDF) de cada scrape para auditoría y reprocesamiento | Gratis bajo 10GB |
| **Workers AI** | (Opcional) extraer datos estructurados de PDFs usando un modelo pequeño | Pay-per-use |

El único servicio de pago **obligatorio** es el Workers Paid plan ($5/mes) para Cron Triggers con más de 3 crons, Queues y Browser Rendering. Todo lo demás cabe en el plan gratuito en la escala actual del proyecto.

## Fuentes de datos objetivo

Estas son las fuentes que ya identificamos (ver `src/data/seed/` y `scripts/scrapers/` para las existentes):

| Fuente | Qué entrega | Formato | Frecuencia sugerida | Complejidad |
|---|---|---|---|---|
| **BCCR** (Banco Central) | Tipo de cambio, inflación, TBP | SOAP/XML con token | Diaria 06:00 | Baja — ya hay cliente |
| **Hacienda** | Tipo de cambio oficial | HTML | Diaria 07:00 | Baja — ya hay scraper |
| **CountryEconomy** | Déficit fiscal histórico | HTML | Semanal | Baja — ya hay scraper |
| **CGR** (Contraloría) | Presupuesto nacional, ejecución | Excel/CSV vía portal | Semanal | Media — parseo de Excel |
| **SICOP** | Contratos públicos | HTML con JS | Semanal | Alta — necesita Browser Rendering |
| **Asamblea Legislativa** | Asistencia, votaciones, diputados | HTML/PDF | Diaria | Media — PDFs con Workers AI |
| **Poder Judicial** | Jueces, expedientes públicos agregados | HTML | Mensual | Media |
| **Datos Abiertos CR** | CKAN API con catálogos oficiales | JSON | Diaria | Baja |
| **TSE** (Tribunal Supremo Elecciones) | Resultados electorales, padrón | HTML/CSV | Por evento | Media |

## Plan de migración por fases

La migración no tiene que ser big-bang. Cada fase es contribuible por separado.

### Fase 0 — Infraestructura base

**Objetivo:** conectar D1 y descomentar los Cron Triggers en `wrangler.toml`.

**Pasos:**
1. `wrangler d1 create cr-gov-db` → copiar el `database_id` a `wrangler.toml`.
2. `wrangler d1 execute cr-gov-db --file=drizzle/migrations/0000_init.sql` (generar con `drizzle-kit generate`).
3. Descomentar el bloque `[[d1_databases]]` en `wrangler.toml`.
4. Agregar `wrangler d1 execute` al script de deploy para que las migraciones se corran automáticamente.
5. Crear un helper `src/lib/db/client.ts` que reciba el binding `DB` y retorne una instancia Drizzle.

**Buen primer issue para contribuir.**

### Fase 1 — Seed inicial desde los JSONs existentes

**Objetivo:** poblar D1 con los datos que hoy viven en `src/data/seed/` sin perder nada.

**Pasos:**
1. Script `scripts/seed-d1.ts` que lee cada JSON y hace `INSERT OR REPLACE` en la tabla correspondiente.
2. Correrlo con `wrangler d1 execute --local` primero, luego `--remote`.
3. Modificar **una sola página** (ej. `/gobierno-actual`) para leer de D1 en vez del import estático. Mantener el resto apuntando a JSONs mientras tanto.
4. Verificar que la página funciona en preview.

### Fase 2 — Primer Cron Worker (BCCR)

**Objetivo:** que los indicadores económicos se actualicen solos cada mañana.

Ya existe [src/app/api/cron/bccr/route.ts](../src/app/api/cron/bccr/route.ts) con el fetch pero sin persistencia. Hay que:

1. Reemplazar el `TODO` de la línea 36 con los `db.insert(...).onConflictDoNothing()` reales.
2. Escribir un log en `ingestion_logs` al inicio y otro al final con `status` y `recordsProcessed`.
3. Descomentar el primer cron en `wrangler.toml`: `"0 6 * * *"`.
4. Configurar los secrets `BCCR_EMAIL` y `BCCR_TOKEN` con `wrangler secret put`.
5. Validar en Cloudflare dashboard → Workers → cr-gov → Logs que el cron está corriendo.

### Fase 3 — Portar scrapers existentes a Workers

**Objetivo:** mover `scripts/scrapers/hacienda.ts` y `scripts/scrapers/countryeconomy.ts` a rutas cron dentro de Next.js.

Estos dos scrapers ya validan con Zod y no usan dependencias raras, así que portarlos es mayormente:

1. Crear `src/app/api/cron/hacienda/route.ts` y `src/app/api/cron/countryeconomy/route.ts`.
2. Reemplazar el `writeFileSync` por `db.insert(...)`.
3. Mover las utilidades compartidas de `scripts/lib/html.ts` a `src/lib/scraping/` para que el código del Worker las pueda importar.
4. Agregar los crons correspondientes a `wrangler.toml`.

El script local `bun run scrape` puede seguir existiendo para correr manualmente en desarrollo, solo apuntando a la misma lógica compartida en `src/lib/scraping/`.

### Fase 4 — Scrapers nuevos con HTMLRewriter

**Objetivo:** integrar CGR y la Asamblea Legislativa usando HTMLRewriter (API nativa de Workers, streaming, súper eficiente).

Ejemplo de patrón:

```ts
// src/lib/scraping/html-rewriter.ts
export async function extractRows(url: string, selector: string): Promise<string[][]> {
  const response = await fetch(url);
  const rows: string[][] = [];
  let currentRow: string[] = [];

  const rewriter = new HTMLRewriter()
    .on(`${selector} tr`, {
      element() {
        if (currentRow.length) rows.push(currentRow);
        currentRow = [];
      },
    })
    .on(`${selector} td`, {
      text(text) {
        if (text.lastInTextNode) currentRow.push(text.text.trim());
      },
    });

  await rewriter.transform(response).text();
  if (currentRow.length) rows.push(currentRow);
  return rows;
}
```

### Fase 5 — Browser Rendering para SICOP

**Objetivo:** scrapear contratos públicos desde SICOP, que carga datos vía JavaScript.

Necesita el binding de Browser Rendering en `wrangler.toml`:

```toml
[browser]
binding = "BROWSER"
```

Y luego en el Worker:

```ts
import puppeteer from "@cloudflare/puppeteer";

export async function scrapeSicop(env: Env) {
  const browser = await puppeteer.launch(env.BROWSER);
  const page = await browser.newPage();
  await page.goto("https://www.sicop.go.cr/...", { waitUntil: "networkidle0" });
  const data = await page.evaluate(() => {
    // extraer del DOM ya renderizado
  });
  await browser.close();
  return data;
}
```

### Fase 6 — Queues, retries y observabilidad

**Objetivo:** cuando un scrape falla (timeout, rate limit, 503), reintentar automáticamente sin bloquear el cron ni perder datos.

1. Crear una Queue `scrape-results` en `wrangler.toml`.
2. El Worker cron **no escribe directo a D1** — publica el resultado (ya validado) en la Queue.
3. Un consumer Worker lee de la Queue y hace el upsert. Si falla, la Queue reintenta con back-off exponencial hasta 3 veces.
4. Mandar un webhook a Slack/Discord cuando un scrape falla más de 3 veces seguidas.
5. Dashboard básico en `/admin/ingestas` (protegido) que lee `ingestion_logs` para mostrar el estado de cada fuente.

### Fase 7 — R2 para auditoría y reprocesamiento

**Objetivo:** guardar una copia cruda de cada respuesta HTTP que scrapeamos, para poder:
- Reprocesar datos históricos si cambia nuestro parser.
- Auditar por qué un dato salió con un valor raro.
- Probar cambios en el scraper contra HTML real sin hacer otra request.

Guardar en R2 bajo la ruta `raw/{source}/{YYYY-MM-DD}/{timestamp}-{hash}.html`. Ciclo de vida: borrar después de 90 días.

## Cómo contribuir a este sistema

Cada una de las fases anteriores es un issue separado y un PR manejable. Si quieres ayudar:

1. **Lee primero [arquitectura.md](./arquitectura.md)** para entender el estado actual.
2. **Elige una fase** de las que no están hechas. La Fase 0 y la Fase 2 son los mejores puntos de entrada.
3. **Abre un issue** con el título `[Scraping] Fase X: <descripción>` antes de empezar, para que no dupliquemos trabajo.
4. **Sigue la guía** en [agregar-fuente-de-datos.md](./agregar-fuente-de-datos.md) si estás agregando una fuente nueva.
5. **Mantén los tipos y la validación Zod.** Ningún dato entra a D1 sin pasar por Zod.

## Decisiones abiertas

Cosas que el equipo mantenedor aún no decidió y donde una propuesta bien argumentada es bienvenida:

- **¿Incremental o snapshot?** ¿Guardamos solo el último valor de cada indicador o la serie completa? (La propuesta actual: serie completa para indicadores económicos y presupuesto, último valor + historial de cambios para datos de personas.)
- **¿Cómo manejar fuentes que cambian de estructura?** ¿Versioning de parsers? ¿Fallback a snapshot manual?
- **¿Rate limiting de respeto?** Algunas fuentes no tienen política explícita. Propuesta: 1 request/segundo con User-Agent identificable (`GobiernoCR Bot (+https://github.com/tatosf/cr-gov)`).
- **¿Retención de logs?** `ingestion_logs` puede crecer rápido. Propuesta: 90 días en D1, después mover a R2.

## Referencias externas

- [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)
- [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [Browser Rendering API](https://developers.cloudflare.com/browser-rendering/)
- [Queues](https://developers.cloudflare.com/queues/)
- [HTMLRewriter API](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/)
- [Drizzle ORM con D1](https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1)
