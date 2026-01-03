import { z } from "zod";

// Task status enum - from specs/task.md
export const TaskStatus = z.enum(["active", "completed", "dropped"]);
export type TaskStatus = z.infer<typeof TaskStatus>;

// Duration in minutes
export const Duration = z.number().int().positive();
export type Duration = z.infer<typeof Duration>;

// Task schema for validation
export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  note: z.string().nullable(),
  status: TaskStatus,
  flagged: z.boolean(),
  estimatedDuration: Duration.nullable(),
  dueDate: z.date().nullable(),
  deferDate: z.date().nullable(),
  completedAt: z.date().nullable(),
  droppedAt: z.date().nullable(),
  projectId: z.string().uuid().nullable(),
  parentTaskId: z.string().uuid().nullable(),
  order: z.number().int(),
  createdAt: z.date(),
  modifiedAt: z.date(),
});
export type Task = z.infer<typeof TaskSchema>;

// Input schemas for operations
export const CreateTaskInput = z.object({
  title: z.string().min(1).max(500),
  note: z.string().optional(),
  flagged: z.boolean().optional(),
  estimatedDuration: Duration.optional(),
  dueDate: z.date().optional(),
  deferDate: z.date().optional(),
  projectId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
});
export type CreateTaskInput = z.infer<typeof CreateTaskInput>;

export const UpdateTaskInput = z.object({
  title: z.string().min(1).max(500).optional(),
  note: z.string().nullable().optional(),
  flagged: z.boolean().optional(),
  estimatedDuration: Duration.nullable().optional(),
  dueDate: z.date().nullable().optional(),
  deferDate: z.date().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  parentTaskId: z.string().uuid().nullable().optional(),
});
export type UpdateTaskInput = z.infer<typeof UpdateTaskInput>;

// Query filters
export const TaskFilterSchema = z.object({
  status: TaskStatus.optional(),
  flagged: z.boolean().optional(),
  projectId: z.string().uuid().nullable().optional(),
  parentTaskId: z.string().uuid().nullable().optional(),
  dueBefore: z.date().optional(),
  dueAfter: z.date().optional(),
  availableOnly: z.boolean().optional(),
});
export type TaskFilter = z.infer<typeof TaskFilterSchema>;
