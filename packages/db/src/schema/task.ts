import { pgTable, uuid, text, timestamp, boolean, integer, pgEnum, type AnyPgColumn } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Task status enum
export const taskStatusEnum = pgEnum("task_status", ["active", "completed", "dropped"]);

// Task table - based on specs/task.md
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  note: text("note"),
  status: taskStatusEnum("status").notNull().default("active"),
  flagged: boolean("flagged").notNull().default(false),
  estimatedDuration: integer("estimated_duration"), // minutes
  dueDate: timestamp("due_date", { withTimezone: true }),
  deferDate: timestamp("defer_date", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  droppedAt: timestamp("dropped_at", { withTimezone: true }),
  projectId: uuid("project_id"), // FK to projects (future)
  parentTaskId: uuid("parent_task_id").references((): AnyPgColumn => tasks.id, { onDelete: "cascade" }),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  modifiedAt: timestamp("modified_at", { withTimezone: true }).notNull().defaultNow(),
});

// Self-referential relation for subtasks
export const tasksRelations = relations(tasks, ({ one, many }) => ({
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
    relationName: "subtasks",
  }),
  subtasks: many(tasks, {
    relationName: "subtasks",
  }),
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
