import { pgTable, uuid, text, timestamp, boolean, integer, pgEnum, doublePrecision, type AnyPgColumn, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tasks } from "./task";
import { projects } from "./project";

// Tag status enum - includes on_hold (affects task availability)
export const tagStatusEnum = pgEnum("tag_status", ["active", "on_hold", "dropped"]);

// Tag table - based on specs/tag.md
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  status: tagStatusEnum("status").notNull().default("active"),
  parentId: uuid("parent_id").references((): AnyPgColumn => tags.id, { onDelete: "cascade" }),
  order: integer("order").notNull().default(0),
  allowsNextAction: boolean("allows_next_action").notNull().default(true),
  childrenMutuallyExclusive: boolean("children_mutually_exclusive").notNull().default(false),
  // Location fields for location-based tags
  locationLatitude: doublePrecision("location_latitude"),
  locationLongitude: doublePrecision("location_longitude"),
  locationRadius: integer("location_radius"), // meters
  locationName: text("location_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  modifiedAt: timestamp("modified_at", { withTimezone: true }).notNull().defaultNow(),
});

// Junction table for task-tag many-to-many relationship
export const taskTags = pgTable("task_tags", {
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.taskId, table.tagId] }),
]);

// Junction table for project-tag many-to-many relationship
export const projectTags = pgTable("project_tags", {
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.projectId, table.tagId] }),
]);

// Tag relations
export const tagsRelations = relations(tags, ({ one, many }) => ({
  parent: one(tags, {
    fields: [tags.parentId],
    references: [tags.id],
    relationName: "children",
  }),
  children: many(tags, {
    relationName: "children",
  }),
  taskTags: many(taskTags),
  projectTags: many(projectTags),
}));

// Task-Tag junction relations
export const taskTagsRelations = relations(taskTags, ({ one }) => ({
  task: one(tasks, {
    fields: [taskTags.taskId],
    references: [tasks.id],
  }),
  tag: one(tags, {
    fields: [taskTags.tagId],
    references: [tags.id],
  }),
}));

// Project-Tag junction relations
export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, {
    fields: [projectTags.projectId],
    references: [projects.id],
  }),
  tag: one(tags, {
    fields: [projectTags.tagId],
    references: [tags.id],
  }),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type TaskTag = typeof taskTags.$inferSelect;
export type ProjectTag = typeof projectTags.$inferSelect;
