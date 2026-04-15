# Agregar una fuente de datos

Guía paso a paso para integrar una nueva fuente gubernamental al proyecto. Si vas a trabajar en el sistema dinámico completo, lee primero [sistema-de-scraping.md](./sistema-de-scraping.md).

## Antes de empezar

**Requisitos que tiene que cumplir la fuente:**

1. **Oficial y pública.** Ministerio, institución autónoma, empresa pública, CGR, BCCR, TSE, Poder Judicial, Asamblea, o datos abiertos del portal CKAN. Nada de fuentes secundarias ni de prensa.
2. **Sin datos personales sensibles.** Nombres y cargos de funcionarios públicos están bien. Números de cédula, teléfonos personales, direcciones, no.
3. **Accesible sin login.** Si requiere registro (como BCCR), debe ser registro libre y gratuito.
4. **Términos de uso compatibles.** Si el sitio prohíbe scraping explícitamente en su ToS, no lo hacemos. Muchos sitios gubernamentales no dicen nada, lo cual es OK.

## Paso 1: Definir el schema

Abre [src/lib/db/schema.ts](../src/lib/db/schema.ts). Decide si tu fuente cabe en una tabla existente o necesita una nueva.

**Cabe en existente** si estás agregando datos de:
- Funcionarios → `officials`
- Legisladores → `legislators`
- Instituciones → `institutions`
- Indicadores económicos → `economic_indicators`
- Partidas presupuestarias → `budget_items`
- Contratos → `procurement_contracts`

**Necesitas tabla nueva** si no cabe en ninguna. En ese caso:

```ts
// src/lib/db/schema.ts
export const miNuevaTabla = sqliteTable("mi_nueva_tabla", {
  id: text("id").primaryKey(),
  // columnas específicas de tu fuente
  source: text("source").notNull(),         // siempre incluir
  ingestedAt: integer("ingested_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),          // siempre incluir
});
```

Genera la migración:

```bash
bunx drizzle-kit generate
```

## Paso 2: Escribir el validador Zod

En [scripts/scrapers/validators.ts](../scripts/scrapers/validators.ts), agrega un schema Zod que describa la forma exacta de los datos que esperas extraer. **Ningún dato entra a la base sin pasar por Zod.**

```ts
// scripts/scrapers/validators.ts
import { z } from "zod";

export const miFuenteSchema = z.array(
  z.object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    valor: z.number().finite(),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
);

export type MiFuenteData = z.infer<typeof miFuenteSchema>;
```

## Paso 3: Escribir el scraper

El scraper es una función async que devuelve datos **ya validados** o lanza una excepción. Empieza con un scraper "local" (Node) bajo `scripts/scrapers/` para iterar rápido, y solo después muévelo a un Worker cron.

```ts
// scripts/scrapers/mi-fuente.ts
import { miFuenteSchema, type MiFuenteData } from "./validators";
import { fetchHtml } from "../lib/html";

export async function scrapeMiFuente(): Promise<MiFuenteData> {
  const html = await fetchHtml("https://datos.go.cr/...");

  // Parsear el HTML. Para HTML estático con estructura clara,
  // regex + cheerio funciona bien. Para Workers, usa HTMLRewriter.
  const rows = /* ... extracción ... */;

  // Validar antes de retornar. Si falla, que falle ruidoso.
  return miFuenteSchema.parse(rows);
}
```

**Principios para el scraper:**

- **Rate limit:** nunca más de 1 request/segundo a la misma fuente. Si necesitas varias páginas, agrega `await sleep(1000)` entre ellas.
- **User-Agent identificable:** `GobiernoCR Bot (+https://github.com/tatosf/cr-gov)`. Nada de fingir ser Chrome.
- **Idempotente:** correrlo dos veces seguidas tiene que dar el mismo resultado, no duplicar nada.
- **Sin estado global:** la función recibe todo lo que necesita como argumento y retorna todo lo que produce.
- **Falla temprano:** si la página cambió de estructura y no encuentras lo que esperas, lanza una excepción en vez de retornar `[]`. Un array vacío silencioso es la peor clase de bug de scraping.

## Paso 4: Registrar en el orquestador local

Agrega tu scraper a [scripts/scrape.ts](../scripts/scrape.ts) para que se pueda correr con `bun run scrape`:

```ts
import { scrapeMiFuente } from "./scrapers/mi-fuente";

// ... dentro del main ...
const miFuenteData = await scrapeMiFuente();
writeFileSync(
  "src/data/seed/mi-fuente.json",
  JSON.stringify(miFuenteData, null, 2)
);
```

En este punto ya tienes un scraper funcional local. Pruébalo:

```bash
bun run scrape
git diff src/data/seed/mi-fuente.json
```

Si el diff se ve razonable, sigue al siguiente paso. Si no, itera.

## Paso 5: Migrar a un Cron Worker

Una vez que el scraper local funciona, lo movemos a Cloudflare para que corra solo. Crea una ruta cron bajo `src/app/api/cron/`:

```ts
// src/app/api/cron/mi-fuente/route.ts
import { NextResponse } from "next/server";
import { scrapeMiFuente } from "@/lib/scraping/mi-fuente";
import { getDb } from "@/lib/db/client";
import { miNuevaTabla, ingestionLogs } from "@/lib/db/schema";

export async function GET() {
  const db = getDb();
  const logId = crypto.randomUUID();

  await db.insert(ingestionLogs).values({
    id: logId,
    source: "mi-fuente",
    status: "partial", // se actualiza al final
    startedAt: new Date(),
  });

  try {
    const data = await scrapeMiFuente();

    for (const row of data) {
      await db
        .insert(miNuevaTabla)
        .values({ ...row, source: "mi-fuente" })
        .onConflictDoUpdate({
          target: miNuevaTabla.id,
          set: row,
        });
    }

    await db
      .update(ingestionLogs)
      .set({
        status: "success",
        recordsProcessed: data.length,
        completedAt: new Date(),
      })
      .where(eq(ingestionLogs.id, logId));

    return NextResponse.json({ status: "success", count: data.length });
  } catch (err) {
    await db
      .update(ingestionLogs)
      .set({
        status: "failed",
        errorMessage: err instanceof Error ? err.message : String(err),
        completedAt: new Date(),
      })
      .where(eq(ingestionLogs.id, logId));

    return NextResponse.json(
      { status: "failed", error: String(err) },
      { status: 500 }
    );
  }
}
```

Nota que el scraper ahora se importa desde `@/lib/scraping/mi-fuente` (código compartido), no desde `scripts/scrapers/`. Mueve la lógica común allá y deja `scripts/scrapers/mi-fuente.ts` como un thin wrapper para correr local.

## Paso 6: Agregar el cron trigger

En [wrangler.toml](../wrangler.toml), agrega la expresión cron bajo `[triggers]`:

```toml
[triggers]
crons = [
  "0 6 * * *",      # BCCR
  "30 6 * * *",     # Mi fuente (todos los días a las 6:30 UTC)
]
```

Cada ruta bajo `/api/cron/*` responde a un cron diferente. La convención: el cron dispara todos los endpoints y cada uno decide qué hacer según la hora (o agregamos lógica de routing por hora en el Worker handler).

## Paso 7: Consumir los datos desde una página

En el componente de servidor correspondiente:

```tsx
// src/app/mi-pagina/page.tsx
import { getDb } from "@/lib/db/client";
import { miNuevaTabla } from "@/lib/db/schema";

export const revalidate = 3600; // ISR cada hora

export default async function MiPagina() {
  const db = getDb();
  const data = await db.select().from(miNuevaTabla).orderBy(miNuevaTabla.fecha);

  return <div>{/* render */}</div>;
}
```

## Checklist antes de abrir el PR

- [ ] Schema agregado a `src/lib/db/schema.ts` (o reutilicé uno existente).
- [ ] Migración generada con `drizzle-kit generate` y committeada.
- [ ] Validador Zod en `scripts/scrapers/validators.ts`.
- [ ] Scraper local funciona (`bun run scrape`) y produce output razonable.
- [ ] Rate limit de al menos 1 segundo entre requests.
- [ ] User-Agent identificable.
- [ ] El scraper lanza excepción (no retorna vacío) si no encuentra los selectores esperados.
- [ ] Ruta cron creada bajo `src/app/api/cron/`.
- [ ] Cron trigger agregado a `wrangler.toml` (comentado si aún no hay acceso al plan pago).
- [ ] Logs de ingesta escritos a `ingestion_logs`.
- [ ] Página que consume los datos tiene `revalidate` configurado.
- [ ] Al menos una fuente oficial citada en el README de la página.
- [ ] `bun run build` pasa.
- [ ] `bun run lint` pasa.
