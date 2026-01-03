import { pgTable, uuid, text, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { folders } from "./folder";
import { tasks } from "./task";

// Project status enum - richer than task status (includes on_hold)
export const projectStatusEnum = pgEnum("project_status", ["active", "on_hold", "completed", "dropped"]);

// Project type enum - controls task availability
export const projectTypeEnum = pgEnum("project_type", ["parallel", "sequential", "single_actions"]);

// Project table - based on specs/project.md
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  note: text("note"),
  status: projectStatusEnum("status").notNull().default("active"),
  type: projectTypeEnum("type").notNull().default("parallel"),
  flagged: boolean("flagged").notNull().default(false),
  dueDate: timestamp("due_date", { withTimezone: true }),
  dueTimeSpecified: boolean("due_time_specified").notNull().default(false),
  deferDate: timestamp("defer_date", { withTimezone: true }),
  deferTimeSpecified: boolean("defer_time_specified").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  droppedAt: timestamp("dropped_at", { withTimezone: true }),
  folderId: uuid("folder_id").references(() => folders.id, { onDelete: "set null" }),
  reviewInterval: integer("review_interval").default(7), // days - default 7 days
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
  autoComplete: boolean("auto_complete").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  modifiedAt: timestamp("modified_at", { withTimezone: true }).notNull().defaultNow(),
});

// Project relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  folder: one(folders, {
    fields: [projects.folderId],
    references: [folders.id],
  }),
  tasks: many(tasks),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
