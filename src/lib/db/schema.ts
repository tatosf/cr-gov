import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ── Institution types ──────────────────────────────────────────────
export const institutionTypeEnum = [
  "poder",
  "ministerio",
  "autonoma",
  "semi_autonoma",
  "organo_adscrito",
  "empresa_publica",
  "municipalidad",
  "otro",
] as const;
export type InstitutionType = (typeof institutionTypeEnum)[number];

// ── Tables ─────────────────────────────────────────────────────────
export const institutions = sqliteTable("institutions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation"),
  type: text("type").notNull(), // InstitutionType
  parentId: text("parent_id").references((): ReturnType<typeof text> => institutions.id),
  sector: text("sector"),
  website: text("website"),
  logoUrl: text("logo_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const officials = sqliteTable("officials", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  institutionId: text("institution_id").references(() => institutions.id),
  photoUrl: text("photo_url"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(true),
  source: text("source"),
});

export const legislators = sqliteTable("legislators", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  party: text("party"),
  province: text("province"),
  photoUrl: text("photo_url"),
  periodStart: text("period_start"),
  periodEnd: text("period_end"),
  email: text("email"),
});

export const legislativeAttendance = sqliteTable("legislative_attendance", {
  id: text("id").primaryKey(),
  legislatorId: text("legislator_id").references(() => legislators.id),
  sessionType: text("session_type").notNull(), // "plenaria" | "comision"
  sessionDate: text("session_date").notNull(),
  present: integer("present", { mode: "boolean" }).notNull(),
  justified: integer("justified", { mode: "boolean" }).default(false),
  source: text("source"),
  ingestedAt: integer("ingested_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const budgetItems = sqliteTable("budget_items", {
  id: text("id").primaryKey(),
  institutionId: text("institution_id").references(() => institutions.id),
  fiscalYear: integer("fiscal_year").notNull(),
  category: text("category"),
  subcategory: text("subcategory"),
  allocatedAmount: real("allocated_amount").notNull(),
  executedAmount: real("executed_amount"),
  currency: text("currency").notNull().default("CRC"),
  source: text("source"),
  ingestedAt: integer("ingested_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const economicIndicators = sqliteTable("economic_indicators", {
  id: text("id").primaryKey(),
  indicatorCode: text("indicator_code").notNull(),
  indicatorName: text("indicator_name").notNull(),
  value: real("value").notNull(),
  date: text("date").notNull(),
  unit: text("unit"),
  source: text("source"),
  ingestedAt: integer("ingested_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const procurementContracts = sqliteTable("procurement_contracts", {
  id: text("id").primaryKey(),
  institutionId: text("institution_id").references(() => institutions.id),
  contractorName: text("contractor_name").notNull(),
  contractorIdNumber: text("contractor_id_number"),
  description: text("description"),
  amount: real("amount"),
  currency: text("currency").default("CRC"),
  contractType: text("contract_type"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  sourceUrl: text("source_url"),
  ingestedAt: integer("ingested_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const relationships = sqliteTable("relationships", {
  id: text("id").primaryKey(),
  sourceEntityType: text("source_entity_type").notNull(),
  sourceEntityId: text("source_entity_id").notNull(),
  targetEntityType: text("target_entity_type").notNull(),
  targetEntityId: text("target_entity_id").notNull(),
  relationshipType: text("relationship_type").notNull(),
  weight: real("weight"),
  metadata: text("metadata"), // JSON string
});

export const ingestionLogs = sqliteTable("ingestion_logs", {
  id: text("id").primaryKey(),
  source: text("source").notNull(),
  status: text("status").notNull(), // "success" | "partial" | "failed"
  recordsProcessed: integer("records_processed"),
  errorMessage: text("error_message"),
  startedAt: integer("started_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});
