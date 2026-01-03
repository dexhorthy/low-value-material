import { pgTable, uuid, text, timestamp, integer, pgEnum, type AnyPgColumn } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Folder status enum - simpler than project (no on_hold or completed)
export const folderStatusEnum = pgEnum("folder_status", ["active", "dropped"]);

// Folder table - based on specs/folder.md
export const folders = pgTable("folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  status: folderStatusEnum("status").notNull().default("active"),
  parentId: uuid("parent_id").references((): AnyPgColumn => folders.id, { onDelete: "cascade" }),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  modifiedAt: timestamp("modified_at", { withTimezone: true }).notNull().defaultNow(),
});

// Self-referential relation for nested folders
export const foldersRelations = relations(folders, ({ one, many }) => ({
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
    relationName: "children",
  }),
  children: many(folders, {
    relationName: "children",
  }),
}));

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
