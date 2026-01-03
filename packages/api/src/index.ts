import { os } from "@orpc/server";
import { z } from "zod";
import { db, tasks } from "@lvm/db";
import { CreateTaskInput, UpdateTaskInput, TaskFilterSchema } from "@lvm/core";
import { eq, and, lt, gt, isNull, desc, asc } from "drizzle-orm";

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
        deferDate: input.deferDate ?? null,
        projectId: input.projectId ?? null,
        parentTaskId: input.parentTaskId ?? null,
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
  },
};

export type Router = typeof router;
