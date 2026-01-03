import { os } from "@orpc/server";
import { z } from "zod";
import { db, tasks, projects } from "@lvm/db";
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterSchema,
  calculateEffectiveDueDate,
  calculateEffectiveDeferDate,
  isAvailable,
  isDeferred,
  isOverdue,
  isDueSoon,
  isBlockedBySequential,
  computeTaskAvailability,
  getFirstAvailable,
  isProjectBlocking,
  type TaskForSequentialCheck,
  type ProjectForAvailabilityCheck,
} from "@lvm/core";
import { eq, and, lt, gt, isNull, desc, asc } from "drizzle-orm";
import { folderRouter } from "./folder";
import { projectRouter } from "./project";
import { tagRouter } from "./tag";
import { inboxRouter } from "./inbox";
import { captureRouter } from "./capture";

// Helper to compute effective dates for a task by traversing hierarchy
async function computeEffectiveDates(taskId: string): Promise<{
  effectiveDueDate: Date | null;
  effectiveDeferDate: Date | null;
  hasLocalDueDate: boolean;
  hasLocalDeferDate: boolean;
}> {
  // Fetch the task
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });
  if (!task) {
    return {
      effectiveDueDate: null,
      effectiveDeferDate: null,
      hasLocalDueDate: false,
      hasLocalDeferDate: false,
    };
  }

  // Get parent task's effective dates (if exists)
  let parentEffectiveDue: Date | null = null;
  let parentEffectiveDefer: Date | null = null;
  if (task.parentTaskId) {
    const parentDates = await computeEffectiveDates(task.parentTaskId);
    parentEffectiveDue = parentDates.effectiveDueDate;
    parentEffectiveDefer = parentDates.effectiveDeferDate;
  }

  // Get project's dates (if exists)
  let projectDue: Date | null = null;
  let projectDefer: Date | null = null;
  if (task.projectId) {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, task.projectId),
    });
    if (project) {
      projectDue = project.dueDate;
      projectDefer = project.deferDate;
    }
  }

  return {
    effectiveDueDate: calculateEffectiveDueDate(task.dueDate, parentEffectiveDue, projectDue),
    effectiveDeferDate: calculateEffectiveDeferDate(task.deferDate, parentEffectiveDefer, projectDefer),
    hasLocalDueDate: task.dueDate !== null,
    hasLocalDeferDate: task.deferDate !== null,
  };
}

// Create a new task
export const createTask = os
  .input(CreateTaskInput)
  .handler(async ({ input }) => {
    const [task] = await db
      .insert(tasks)
      .values({
        title: input.title,
        note: input.note ?? null,
        flagged: input.flagged ?? false,
        estimatedDuration: input.estimatedDuration ?? null,
        dueDate: input.dueDate ?? null,
        dueTimeSpecified: input.dueTimeSpecified ?? false,
        deferDate: input.deferDate ?? null,
        deferTimeSpecified: input.deferTimeSpecified ?? false,
        projectId: input.projectId ?? null,
        parentTaskId: input.parentTaskId ?? null,
        tentativeProjectId: input.tentativeProjectId ?? null,
        tentativeParentTaskId: input.tentativeParentTaskId ?? null,
      })
      .returning();
    return task;
  });

// Get task by ID
export const getTask = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, input.id),
      with: { subtasks: true },
    });
    return task ?? null;
  });

// Get task with computed effective dates (inheritance-aware)
export const getTaskWithEffectiveDates = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, input.id),
      with: { subtasks: true },
    });
    if (!task) return null;

    const effectiveDates = await computeEffectiveDates(input.id);
    return {
      ...task,
      ...effectiveDates,
    };
  });

// List tasks with filters
export const listTasks = os
  .input(TaskFilterSchema.optional())
  .handler(async ({ input }) => {
    const conditions = [];

    if (input?.status) {
      conditions.push(eq(tasks.status, input.status));
    }
    if (input?.flagged !== undefined) {
      conditions.push(eq(tasks.flagged, input.flagged));
    }
    if (input?.projectId !== undefined) {
      conditions.push(input.projectId === null
        ? isNull(tasks.projectId)
        : eq(tasks.projectId, input.projectId));
    }
    if (input?.parentTaskId !== undefined) {
      conditions.push(input.parentTaskId === null
        ? isNull(tasks.parentTaskId)
        : eq(tasks.parentTaskId, input.parentTaskId));
    }
    if (input?.dueBefore) {
      conditions.push(lt(tasks.dueDate, input.dueBefore));
    }
    if (input?.dueAfter) {
      conditions.push(gt(tasks.dueDate, input.dueAfter));
    }
    // Filter for inbox items only
    if (input?.inboxOnly) {
      conditions.push(isNull(tasks.projectId));
      conditions.push(isNull(tasks.parentTaskId));
    }

    const result = await db
      .select()
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(tasks.order), desc(tasks.createdAt));

    return result;
  });

// Update task
export const updateTask = os
  .input(z.object({ id: z.string().uuid(), data: UpdateTaskInput }))
  .handler(async ({ input }) => {
    const [task] = await db
      .update(tasks)
      .set({
        ...input.data,
        modifiedAt: new Date(),
      })
      .where(eq(tasks.id, input.id))
      .returning();
    return task;
  });

// Complete task
export const completeTask = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const [task] = await db
      .update(tasks)
      .set({
        status: "completed",
        completedAt: new Date(),
        modifiedAt: new Date(),
      })
      .where(eq(tasks.id, input.id))
      .returning();
    return task;
  });

// Drop task
export const dropTask = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const [task] = await db
      .update(tasks)
      .set({
        status: "dropped",
        droppedAt: new Date(),
        modifiedAt: new Date(),
      })
      .where(eq(tasks.id, input.id))
      .returning();
    return task;
  });

// Restore task (un-complete or un-drop)
export const restoreTask = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const [task] = await db
      .update(tasks)
      .set({
        status: "active",
        completedAt: null,
        droppedAt: null,
        modifiedAt: new Date(),
      })
      .where(eq(tasks.id, input.id))
      .returning();
    return task;
  });

// Delete task
export const deleteTask = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    await db.delete(tasks).where(eq(tasks.id, input.id));
    return { success: true };
  });

// Get overdue tasks (due date in the past)
export const overdueTasks = os
  .input(z.object({}).optional())
  .handler(async () => {
    const now = new Date();
    const result = await db
      .select()
      .from(tasks)
      .where(
        and(
          lt(tasks.dueDate, now),
          eq(tasks.status, "active")
        )
      )
      .orderBy(asc(tasks.dueDate));
    return result;
  });

// Get due soon tasks (within threshold hours)
export const dueSoonTasks = os
  .input(z.object({ thresholdHours: z.number().int().positive().optional() }).optional())
  .handler(async ({ input }) => {
    const thresholdHours = input?.thresholdHours ?? 48; // default 48 hours per spec
    const now = new Date();
    const threshold = new Date(now.getTime() + thresholdHours * 60 * 60 * 1000);
    const result = await db
      .select()
      .from(tasks)
      .where(
        and(
          gt(tasks.dueDate, now),
          lt(tasks.dueDate, threshold),
          eq(tasks.status, "active")
        )
      )
      .orderBy(asc(tasks.dueDate));
    return result;
  });

// Get available tasks (not deferred)
export const availableTasks = os
  .input(z.object({}).optional())
  .handler(async () => {
    const now = new Date();
    const result = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.status, "active"),
          // Available if no defer date or defer date has passed
          // Using SQL OR: deferDate IS NULL OR deferDate <= now
        )
      )
      .orderBy(asc(tasks.order), desc(tasks.createdAt));

    // Filter in application layer for OR condition
    return result.filter(task =>
      task.deferDate === null || task.deferDate <= now
    );
  });

// Get deferred tasks (defer date in the future)
export const deferredTasks = os
  .input(z.object({}).optional())
  .handler(async () => {
    const now = new Date();
    const result = await db
      .select()
      .from(tasks)
      .where(
        and(
          gt(tasks.deferDate, now),
          eq(tasks.status, "active")
        )
      )
      .orderBy(asc(tasks.deferDate));
    return result;
  });

// Get tasks with effective dates computed (inheritance-aware query)
export const listTasksWithEffectiveDates = os
  .input(z.object({}).optional())
  .handler(async () => {
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, "active"))
      .orderBy(asc(tasks.order), desc(tasks.createdAt));

    // Compute effective dates for each task
    const tasksWithDates = await Promise.all(
      allTasks.map(async (task) => {
        const effectiveDates = await computeEffectiveDates(task.id);
        return { ...task, ...effectiveDates };
      })
    );
    return tasksWithDates;
  });

// Get overdue tasks using EFFECTIVE due dates (inheritance-aware)
export const overdueTasksEffective = os
  .input(z.object({}).optional())
  .handler(async () => {
    const now = new Date();
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, "active"));

    const tasksWithDates = await Promise.all(
      allTasks.map(async (task) => {
        const effectiveDates = await computeEffectiveDates(task.id);
        return { ...task, ...effectiveDates };
      })
    );

    return tasksWithDates
      .filter((task) => isOverdue(task.effectiveDueDate, now))
      .sort((a, b) => {
        if (!a.effectiveDueDate || !b.effectiveDueDate) return 0;
        return a.effectiveDueDate.getTime() - b.effectiveDueDate.getTime();
      });
  });

// Get due soon tasks using EFFECTIVE due dates (inheritance-aware)
export const dueSoonTasksEffective = os
  .input(z.object({ thresholdHours: z.number().int().positive().optional() }).optional())
  .handler(async ({ input }) => {
    const thresholdHours = input?.thresholdHours ?? 48;
    const now = new Date();
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, "active"));

    const tasksWithDates = await Promise.all(
      allTasks.map(async (task) => {
        const effectiveDates = await computeEffectiveDates(task.id);
        return { ...task, ...effectiveDates };
      })
    );

    return tasksWithDates
      .filter((task) => isDueSoon(task.effectiveDueDate, now, thresholdHours))
      .sort((a, b) => {
        if (!a.effectiveDueDate || !b.effectiveDueDate) return 0;
        return a.effectiveDueDate.getTime() - b.effectiveDueDate.getTime();
      });
  });

// Get available tasks using EFFECTIVE defer dates and sequential blocking (inheritance-aware)
export const availableTasksEffective = os
  .input(z.object({}).optional())
  .handler(async () => {
    const now = new Date();
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, "active"))
      .orderBy(asc(tasks.order), desc(tasks.createdAt));

    // Group tasks by project for sequential blocking check
    const projectIds = [...new Set(allTasks.filter(t => t.projectId).map(t => t.projectId!))];
    const projectsData = projectIds.length > 0
      ? await db.query.projects.findMany({
          where: (p, { inArray }) => inArray(p.id, projectIds),
        })
      : [];
    const projectMap = new Map(projectsData.map(p => [p.id, p]));

    // Compute effective dates and availability for each task
    const tasksWithAvailability = await Promise.all(
      allTasks.map(async (task) => {
        const effectiveDates = await computeEffectiveDates(task.id);
        const project = task.projectId ? projectMap.get(task.projectId) : null;

        // Get sibling tasks in same project for sequential check
        const siblingTasks: TaskForSequentialCheck[] = task.projectId
          ? allTasks.filter(t => t.projectId === task.projectId).map(t => ({
              id: t.id,
              status: t.status,
              order: t.order,
              projectId: t.projectId,
            }))
          : [];

        const projectForCheck: ProjectForAvailabilityCheck | null = project
          ? { id: project.id, type: project.type, status: project.status, deferDate: project.deferDate }
          : null;

        const taskForCheck: TaskForSequentialCheck = {
          id: task.id,
          status: task.status,
          order: task.order,
          projectId: task.projectId,
        };

        const availability = computeTaskAvailability(
          taskForCheck,
          effectiveDates.effectiveDeferDate,
          projectForCheck,
          siblingTasks,
          now
        );

        return {
          ...task,
          ...effectiveDates,
          ...availability,
        };
      })
    );

    return tasksWithAvailability.filter((task) => task.isAvailable);
  });

// Get deferred tasks using EFFECTIVE defer dates (inheritance-aware)
export const deferredTasksEffective = os
  .input(z.object({}).optional())
  .handler(async () => {
    const now = new Date();
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, "active"));

    const tasksWithDates = await Promise.all(
      allTasks.map(async (task) => {
        const effectiveDates = await computeEffectiveDates(task.id);
        return { ...task, ...effectiveDates };
      })
    );

    return tasksWithDates
      .filter((task) => isDeferred(task.effectiveDeferDate, now))
      .sort((a, b) => {
        if (!a.effectiveDeferDate || !b.effectiveDeferDate) return 0;
        return a.effectiveDeferDate.getTime() - b.effectiveDeferDate.getTime();
      });
  });

// Get "next actions" - first available task from each project plus all inbox/standalone tasks
// Per specs/availability.md: Next actions are available tasks that are the first available in their project
export const nextActions = os
  .input(z.object({}).optional())
  .handler(async () => {
    const now = new Date();
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, "active"))
      .orderBy(asc(tasks.order), desc(tasks.createdAt));

    // Get all projects
    const projectIds = [...new Set(allTasks.filter(t => t.projectId).map(t => t.projectId!))];
    const projectsData = projectIds.length > 0
      ? await db.query.projects.findMany({
          where: (p, { inArray }) => inArray(p.id, projectIds),
        })
      : [];
    const projectMap = new Map(projectsData.map(p => [p.id, p]));

    // Compute availability for all tasks
    const tasksWithAvailability = await Promise.all(
      allTasks.map(async (task) => {
        const effectiveDates = await computeEffectiveDates(task.id);
        const project = task.projectId ? projectMap.get(task.projectId) : null;

        const siblingTasks: TaskForSequentialCheck[] = task.projectId
          ? allTasks.filter(t => t.projectId === task.projectId).map(t => ({
              id: t.id,
              status: t.status,
              order: t.order,
              projectId: t.projectId,
            }))
          : [];

        const projectForCheck: ProjectForAvailabilityCheck | null = project
          ? { id: project.id, type: project.type, status: project.status, deferDate: project.deferDate }
          : null;

        const taskForCheck: TaskForSequentialCheck = {
          id: task.id,
          status: task.status,
          order: task.order,
          projectId: task.projectId,
        };

        const availability = computeTaskAvailability(
          taskForCheck,
          effectiveDates.effectiveDeferDate,
          projectForCheck,
          siblingTasks,
          now
        );

        return {
          ...task,
          ...effectiveDates,
          ...availability,
        };
      })
    );

    // Filter to available tasks
    const availableTasks = tasksWithAvailability.filter(t => t.isAvailable);

    // For tasks with projects, keep only the first available in each project
    const projectFirstAvailable = new Set<string>();
    const nextActionTasks = availableTasks.filter(task => {
      // Inbox/standalone tasks are always next actions
      if (!task.projectId) return true;

      // For project tasks, only the first available (by order) is a next action
      if (projectFirstAvailable.has(task.projectId)) return false;

      // This is the first available task in this project
      projectFirstAvailable.add(task.projectId);
      return true;
    });

    return nextActionTasks;
  });

// Get the first available task in a specific project
export const firstAvailableInProject = os
  .input(z.object({ projectId: z.string().uuid() }))
  .handler(async ({ input }) => {
    const now = new Date();

    // Get the project
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, input.projectId),
    });
    if (!project) return null;

    // Get all active tasks in the project
    const projectTasks = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.projectId, input.projectId), eq(tasks.status, "active")))
      .orderBy(asc(tasks.order));

    if (projectTasks.length === 0) return null;

    // Compute availability for each task
    const siblingTasks: TaskForSequentialCheck[] = projectTasks.map(t => ({
      id: t.id,
      status: t.status,
      order: t.order,
      projectId: t.projectId,
    }));

    const projectForCheck: ProjectForAvailabilityCheck = {
      id: project.id,
      type: project.type,
      status: project.status,
      deferDate: project.deferDate,
    };

    for (const task of projectTasks) {
      const effectiveDates = await computeEffectiveDates(task.id);
      const taskForCheck: TaskForSequentialCheck = {
        id: task.id,
        status: task.status,
        order: task.order,
        projectId: task.projectId,
      };

      const availability = computeTaskAvailability(
        taskForCheck,
        effectiveDates.effectiveDeferDate,
        projectForCheck,
        siblingTasks,
        now
      );

      if (availability.isAvailable) {
        return { ...task, ...effectiveDates, ...availability };
      }
    }

    return null;
  });

// Get blocked tasks with their blocking reasons
export const blockedTasks = os
  .input(z.object({}).optional())
  .handler(async () => {
    const now = new Date();
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, "active"))
      .orderBy(asc(tasks.order), desc(tasks.createdAt));

    const projectIds = [...new Set(allTasks.filter(t => t.projectId).map(t => t.projectId!))];
    const projectsData = projectIds.length > 0
      ? await db.query.projects.findMany({
          where: (p, { inArray }) => inArray(p.id, projectIds),
        })
      : [];
    const projectMap = new Map(projectsData.map(p => [p.id, p]));

    const tasksWithAvailability = await Promise.all(
      allTasks.map(async (task) => {
        const effectiveDates = await computeEffectiveDates(task.id);
        const project = task.projectId ? projectMap.get(task.projectId) : null;

        const siblingTasks: TaskForSequentialCheck[] = task.projectId
          ? allTasks.filter(t => t.projectId === task.projectId).map(t => ({
              id: t.id,
              status: t.status,
              order: t.order,
              projectId: t.projectId,
            }))
          : [];

        const projectForCheck: ProjectForAvailabilityCheck | null = project
          ? { id: project.id, type: project.type, status: project.status, deferDate: project.deferDate }
          : null;

        const taskForCheck: TaskForSequentialCheck = {
          id: task.id,
          status: task.status,
          order: task.order,
          projectId: task.projectId,
        };

        const availability = computeTaskAvailability(
          taskForCheck,
          effectiveDates.effectiveDeferDate,
          projectForCheck,
          siblingTasks,
          now
        );

        return {
          ...task,
          ...effectiveDates,
          ...availability,
        };
      })
    );

    return tasksWithAvailability.filter((task) => !task.isAvailable);
  });

// Router - plain object with procedures
export const router = {
  task: {
    create: createTask,
    get: getTask,
    getWithEffectiveDates: getTaskWithEffectiveDates,
    list: listTasks,
    listWithEffectiveDates: listTasksWithEffectiveDates,
    update: updateTask,
    complete: completeTask,
    drop: dropTask,
    restore: restoreTask,
    delete: deleteTask,
    // Simple queries (task's own dates only)
    overdue: overdueTasks,
    dueSoon: dueSoonTasks,
    available: availableTasks,
    deferred: deferredTasks,
    // Effective queries (inheritance-aware, includes sequential blocking)
    overdueEffective: overdueTasksEffective,
    dueSoonEffective: dueSoonTasksEffective,
    availableEffective: availableTasksEffective,
    deferredEffective: deferredTasksEffective,
    // Availability queries (specs/availability.md)
    nextActions: nextActions,
    firstAvailableInProject: firstAvailableInProject,
    blocked: blockedTasks,
  },
  folder: folderRouter,
  project: projectRouter,
  tag: tagRouter,
  inbox: inboxRouter,
  capture: captureRouter,
};

export type Router = typeof router;
