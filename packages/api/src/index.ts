import { os } from "@orpc/server";
import { z } from "zod";
import { db, tasks } from "@lvm/db";
import { CreateTaskInput, UpdateTaskInput, TaskFilterSchema } from "@lvm/core";
import { eq, and, lt, gt, isNull, desc, asc } from "drizzle-orm";
import { folderRouter } from "./folder";
import { projectRouter } from "./project";
import { tagRouter } from "./tag";
import { inboxRouter } from "./inbox";
import { captureRouter } from "./capture";

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

// Router - plain object with procedures
export const router = {
  task: {
    create: createTask,
    get: getTask,
    list: listTasks,
    update: updateTask,
    complete: completeTask,
    drop: dropTask,
    restore: restoreTask,
    delete: deleteTask,
    overdue: overdueTasks,
    dueSoon: dueSoonTasks,
    available: availableTasks,
    deferred: deferredTasks,
  },
  folder: folderRouter,
  project: projectRouter,
  tag: tagRouter,
  inbox: inboxRouter,
  capture: captureRouter,
};

export type Router = typeof router;
