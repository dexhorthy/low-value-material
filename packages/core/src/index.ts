import { z } from "zod";

// ============================================================================
// Common Types
// ============================================================================

// Duration in minutes
export const Duration = z.number().int().positive();
export type Duration = z.infer<typeof Duration>;

// ============================================================================
// Task Types - specs/task.md, specs/inbox.md
// ============================================================================

export const TaskStatus = z.enum(["active", "completed", "dropped"]);
export type TaskStatus = z.infer<typeof TaskStatus>;

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
  // Tentative assignment for inbox items
  tentativeProjectId: z.string().uuid().nullable(),
  tentativeParentTaskId: z.string().uuid().nullable(),
  order: z.number().int(),
  createdAt: z.date(),
  modifiedAt: z.date(),
});
export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskInput = z.object({
  title: z.string().min(1).max(500),
  note: z.string().optional(),
  flagged: z.boolean().optional(),
  estimatedDuration: Duration.optional(),
  dueDate: z.date().optional(),
  deferDate: z.date().optional(),
  projectId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
  tentativeProjectId: z.string().uuid().optional(),
  tentativeParentTaskId: z.string().uuid().optional(),
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
  tentativeProjectId: z.string().uuid().nullable().optional(),
  tentativeParentTaskId: z.string().uuid().nullable().optional(),
});
export type UpdateTaskInput = z.infer<typeof UpdateTaskInput>;

export const TaskFilterSchema = z.object({
  status: TaskStatus.optional(),
  flagged: z.boolean().optional(),
  projectId: z.string().uuid().nullable().optional(),
  parentTaskId: z.string().uuid().nullable().optional(),
  dueBefore: z.date().optional(),
  dueAfter: z.date().optional(),
  availableOnly: z.boolean().optional(),
  inboxOnly: z.boolean().optional(), // Tasks with null projectId and parentTaskId
});
export type TaskFilter = z.infer<typeof TaskFilterSchema>;

// ============================================================================
// Folder Types - specs/folder.md
// ============================================================================

export const FolderStatus = z.enum(["active", "dropped"]);
export type FolderStatus = z.infer<typeof FolderStatus>;

export const FolderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(500),
  status: FolderStatus,
  parentId: z.string().uuid().nullable(),
  order: z.number().int(),
  createdAt: z.date(),
  modifiedAt: z.date(),
});
export type Folder = z.infer<typeof FolderSchema>;

export const CreateFolderInput = z.object({
  name: z.string().min(1).max(500),
  parentId: z.string().uuid().optional(),
  position: z.number().int().optional(),
});
export type CreateFolderInput = z.infer<typeof CreateFolderInput>;

export const UpdateFolderInput = z.object({
  name: z.string().min(1).max(500).optional(),
  parentId: z.string().uuid().nullable().optional(),
  order: z.number().int().optional(),
});
export type UpdateFolderInput = z.infer<typeof UpdateFolderInput>;

export const FolderFilterSchema = z.object({
  status: FolderStatus.optional(),
  parentId: z.string().uuid().nullable().optional(),
  includeDropped: z.boolean().optional(),
});
export type FolderFilter = z.infer<typeof FolderFilterSchema>;

// ============================================================================
// Project Types - specs/project.md
// ============================================================================

export const ProjectStatus = z.enum(["active", "on_hold", "completed", "dropped"]);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

export const ProjectType = z.enum(["parallel", "sequential", "single_actions"]);
export type ProjectType = z.infer<typeof ProjectType>;

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  note: z.string().nullable(),
  status: ProjectStatus,
  type: ProjectType,
  flagged: z.boolean(),
  dueDate: z.date().nullable(),
  deferDate: z.date().nullable(),
  completedAt: z.date().nullable(),
  droppedAt: z.date().nullable(),
  folderId: z.string().uuid().nullable(),
  reviewInterval: z.number().int().nullable(), // days
  lastReviewedAt: z.date().nullable(),
  autoComplete: z.boolean(),
  order: z.number().int(),
  createdAt: z.date(),
  modifiedAt: z.date(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectInput = z.object({
  title: z.string().min(1).max(500),
  note: z.string().optional(),
  type: ProjectType.optional(),
  flagged: z.boolean().optional(),
  dueDate: z.date().optional(),
  deferDate: z.date().optional(),
  folderId: z.string().uuid().optional(),
  reviewInterval: z.number().int().optional(),
  autoComplete: z.boolean().optional(),
});
export type CreateProjectInput = z.infer<typeof CreateProjectInput>;

export const UpdateProjectInput = z.object({
  title: z.string().min(1).max(500).optional(),
  note: z.string().nullable().optional(),
  type: ProjectType.optional(),
  flagged: z.boolean().optional(),
  dueDate: z.date().nullable().optional(),
  deferDate: z.date().nullable().optional(),
  folderId: z.string().uuid().nullable().optional(),
  reviewInterval: z.number().int().nullable().optional(),
  autoComplete: z.boolean().optional(),
});
export type UpdateProjectInput = z.infer<typeof UpdateProjectInput>;

export const ProjectFilterSchema = z.object({
  status: ProjectStatus.optional(),
  type: ProjectType.optional(),
  flagged: z.boolean().optional(),
  folderId: z.string().uuid().nullable().optional(),
  dueBefore: z.date().optional(),
  dueAfter: z.date().optional(),
  availableOnly: z.boolean().optional(),
  dueForReview: z.boolean().optional(),
  stalled: z.boolean().optional(),
});
export type ProjectFilter = z.infer<typeof ProjectFilterSchema>;

// ============================================================================
// Tag Types - specs/tag.md
// ============================================================================

export const TagStatus = z.enum(["active", "on_hold", "dropped"]);
export type TagStatus = z.infer<typeof TagStatus>;

export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  radius: z.number().int().positive().optional(), // meters
  name: z.string().optional(),
});
export type Location = z.infer<typeof LocationSchema>;

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  status: TagStatus,
  parentId: z.string().uuid().nullable(),
  order: z.number().int(),
  allowsNextAction: z.boolean(),
  childrenMutuallyExclusive: z.boolean(),
  locationLatitude: z.number().nullable(),
  locationLongitude: z.number().nullable(),
  locationRadius: z.number().int().nullable(),
  locationName: z.string().nullable(),
  createdAt: z.date(),
  modifiedAt: z.date(),
});
export type Tag = z.infer<typeof TagSchema>;

export const CreateTagInput = z.object({
  name: z.string().min(1).max(200),
  parentId: z.string().uuid().optional(),
  position: z.number().int().optional(),
  allowsNextAction: z.boolean().optional(),
  childrenMutuallyExclusive: z.boolean().optional(),
  location: LocationSchema.optional(),
});
export type CreateTagInput = z.infer<typeof CreateTagInput>;

export const UpdateTagInput = z.object({
  name: z.string().min(1).max(200).optional(),
  status: TagStatus.optional(),
  parentId: z.string().uuid().nullable().optional(),
  order: z.number().int().optional(),
  allowsNextAction: z.boolean().optional(),
  childrenMutuallyExclusive: z.boolean().optional(),
  location: LocationSchema.nullable().optional(),
});
export type UpdateTagInput = z.infer<typeof UpdateTagInput>;

export const TagFilterSchema = z.object({
  status: TagStatus.optional(),
  parentId: z.string().uuid().nullable().optional(),
  includeDropped: z.boolean().optional(),
  hasLocation: z.boolean().optional(),
});
export type TagFilter = z.infer<typeof TagFilterSchema>;

// ============================================================================
// Inbox Types - specs/inbox.md
// ============================================================================

export const InboxFilterSchema = z.object({
  includeCompleted: z.boolean().optional(),
  includeDropped: z.boolean().optional(),
});
export type InboxFilter = z.infer<typeof InboxFilterSchema>;

export const InboxStatsSchema = z.object({
  total: z.number().int(),
  active: z.number().int(),
  available: z.number().int(),
  deferred: z.number().int(),
  completed: z.number().int(),
  flagged: z.number().int(),
  withDueDate: z.number().int(),
  overdue: z.number().int(),
});
export type InboxStats = z.infer<typeof InboxStatsSchema>;
