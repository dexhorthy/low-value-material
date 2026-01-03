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
  dueTimeSpecified: z.boolean(),
  deferDate: z.date().nullable(),
  deferTimeSpecified: z.boolean(),
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
  dueTimeSpecified: z.boolean().optional(),
  deferDate: z.date().optional(),
  deferTimeSpecified: z.boolean().optional(),
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
  dueTimeSpecified: z.boolean().optional(),
  deferDate: z.date().nullable().optional(),
  deferTimeSpecified: z.boolean().optional(),
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
  dueTimeSpecified: z.boolean(),
  deferDate: z.date().nullable(),
  deferTimeSpecified: z.boolean(),
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
  dueTimeSpecified: z.boolean().optional(),
  deferDate: z.date().optional(),
  deferTimeSpecified: z.boolean().optional(),
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
  dueTimeSpecified: z.boolean().optional(),
  deferDate: z.date().nullable().optional(),
  deferTimeSpecified: z.boolean().optional(),
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

// ============================================================================
// Effective Date Calculation - specs/due-dates.md, specs/defer-dates.md
// ============================================================================

/**
 * Calculates the effective due date for an item.
 * Per specs/due-dates.md: effective_due_date = min(item.due_date, parent.effective_due_date, project.due_date)
 * Returns the EARLIEST non-null date (most urgent deadline wins).
 */
export function calculateEffectiveDueDate(
  itemDueDate: Date | null,
  parentEffectiveDueDate: Date | null,
  projectDueDate: Date | null
): Date | null {
  const dates = [itemDueDate, parentEffectiveDueDate, projectDueDate].filter(
    (d): d is Date => d !== null
  );
  if (dates.length === 0) return null;
  return new Date(Math.min(...dates.map((d) => d.getTime())));
}

/**
 * Calculates the effective defer date for an item.
 * Per specs/defer-dates.md: effective_defer_date = max(item.defer_date, parent.effective_defer_date, project.defer_date)
 * Returns the LATEST non-null date (parent deferral blocks children).
 */
export function calculateEffectiveDeferDate(
  itemDeferDate: Date | null,
  parentEffectiveDeferDate: Date | null,
  projectDeferDate: Date | null
): Date | null {
  const dates = [itemDeferDate, parentEffectiveDeferDate, projectDeferDate].filter(
    (d): d is Date => d !== null
  );
  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

/**
 * Checks if an item is available based on its effective defer date.
 * Available if: effective_defer_date is null OR effective_defer_date <= now
 */
export function isAvailable(effectiveDeferDate: Date | null, now: Date = new Date()): boolean {
  return effectiveDeferDate === null || effectiveDeferDate <= now;
}

/**
 * Checks if an item is deferred based on its effective defer date.
 * Deferred if: effective_defer_date > now
 */
export function isDeferred(effectiveDeferDate: Date | null, now: Date = new Date()): boolean {
  return effectiveDeferDate !== null && effectiveDeferDate > now;
}

/**
 * Checks if an item is overdue based on its effective due date.
 * Overdue if: effective_due_date < now
 */
export function isOverdue(effectiveDueDate: Date | null, now: Date = new Date()): boolean {
  return effectiveDueDate !== null && effectiveDueDate < now;
}

/**
 * Checks if an item is due soon based on its effective due date and threshold.
 * Due soon if: now < effective_due_date <= now + threshold_hours
 */
export function isDueSoon(
  effectiveDueDate: Date | null,
  now: Date = new Date(),
  thresholdHours: number = 48
): boolean {
  if (effectiveDueDate === null) return false;
  const threshold = new Date(now.getTime() + thresholdHours * 60 * 60 * 1000);
  return effectiveDueDate > now && effectiveDueDate <= threshold;
}

/**
 * Task with computed effective dates for use in queries and views.
 */
export const TaskWithEffectiveDatesSchema = TaskSchema.extend({
  effectiveDueDate: z.date().nullable(),
  effectiveDeferDate: z.date().nullable(),
  hasLocalDueDate: z.boolean(),
  hasLocalDeferDate: z.boolean(),
});
export type TaskWithEffectiveDates = z.infer<typeof TaskWithEffectiveDatesSchema>;

// ============================================================================
// Availability - specs/availability.md
// ============================================================================

/**
 * Blocking reason for why a task is not available.
 */
export const BlockingReason = z.enum([
  "deferred",           // Future defer date
  "sequential",         // Preceding task incomplete in sequential project
  "project_on_hold",    // Project is on hold
  "project_deferred",   // Project has future defer date
  "parent_blocked",     // Parent task is blocked
]);
export type BlockingReason = z.infer<typeof BlockingReason>;

/**
 * Minimal task info needed for sequential blocking check.
 */
export interface TaskForSequentialCheck {
  id: string;
  status: TaskStatus;
  order: number;
  projectId: string | null;
}

/**
 * Minimal project info needed for availability check.
 */
export interface ProjectForAvailabilityCheck {
  id: string;
  type: ProjectType;
  status: ProjectStatus;
  deferDate: Date | null;
}

/**
 * Checks if a task is blocked by sequential project ordering.
 * Per specs/availability.md: In sequential projects, only the first incomplete task is available.
 *
 * @param task - The task to check
 * @param projectType - The type of project (parallel, sequential, single_actions)
 * @param siblingTasks - Other tasks in the same project (must include the task being checked)
 * @returns true if the task is blocked by sequential ordering
 */
export function isBlockedBySequential(
  task: TaskForSequentialCheck,
  projectType: ProjectType | null,
  siblingTasks: TaskForSequentialCheck[]
): boolean {
  // Not blocked if no project
  if (!task.projectId || !projectType) return false;

  // Only sequential projects have blocking
  if (projectType !== "sequential") return false;

  // Find the first incomplete task by order in this project
  const incompleteSiblings = siblingTasks
    .filter(t => t.projectId === task.projectId && t.status === "active")
    .sort((a, b) => a.order - b.order);

  if (incompleteSiblings.length === 0) return false;

  const firstIncomplete = incompleteSiblings[0];

  // Task is blocked if it's not the first incomplete task
  return task.id !== firstIncomplete.id;
}

/**
 * Gets the first available task in a project (the "next action").
 * Per specs/availability.md:
 * - Parallel projects: first incomplete task by order
 * - Sequential projects: first incomplete task by order (same as parallel for this)
 * - Single actions: first incomplete task by order (all are "next" but we return first)
 *
 * @param projectType - The type of project
 * @param tasks - Tasks in the project
 * @returns The first available task, or null if none available
 */
export function getFirstAvailable(
  projectType: ProjectType,
  tasks: TaskForSequentialCheck[]
): TaskForSequentialCheck | null {
  const incompleteTasks = tasks
    .filter(t => t.status === "active")
    .sort((a, b) => a.order - b.order);

  return incompleteTasks[0] ?? null;
}

/**
 * Checks if project status blocks tasks from being available.
 * Per specs/availability.md: Tasks in on_hold, completed, or dropped projects are not available.
 */
export function isProjectBlocking(projectStatus: ProjectStatus | null): boolean {
  if (projectStatus === null) return false;
  return projectStatus !== "active";
}

/**
 * Full availability status for a task.
 */
export interface TaskAvailabilityStatus {
  isAvailable: boolean;
  blockingReasons: BlockingReason[];
}

/**
 * Computes full availability status for a task considering all blocking factors.
 * Per specs/availability.md, a task is available when ALL of the following are true:
 * 1. Task status is active
 * 2. Effective defer date has passed
 * 3. Not blocked by sequential project
 * 4. Project is available (active and not deferred)
 *
 * @param task - The task to check
 * @param effectiveDeferDate - The computed effective defer date
 * @param project - The project the task belongs to (null if no project)
 * @param siblingTasks - Other tasks in the same project
 * @param now - Current time for defer date comparison
 */
export function computeTaskAvailability(
  task: TaskForSequentialCheck & { status: TaskStatus },
  effectiveDeferDate: Date | null,
  project: ProjectForAvailabilityCheck | null,
  siblingTasks: TaskForSequentialCheck[],
  now: Date = new Date()
): TaskAvailabilityStatus {
  const blockingReasons: BlockingReason[] = [];

  // Check defer date
  if (isDeferred(effectiveDeferDate, now)) {
    blockingReasons.push("deferred");
  }

  // Check project status
  if (project && isProjectBlocking(project.status)) {
    blockingReasons.push("project_on_hold");
  }

  // Check project defer date
  if (project?.deferDate && project.deferDate > now) {
    blockingReasons.push("project_deferred");
  }

  // Check sequential blocking
  if (isBlockedBySequential(task, project?.type ?? null, siblingTasks)) {
    blockingReasons.push("sequential");
  }

  return {
    isAvailable: task.status === "active" && blockingReasons.length === 0,
    blockingReasons,
  };
}
