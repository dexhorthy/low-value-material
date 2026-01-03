import { os } from "@orpc/server";
import { z } from "zod";
import { db, projects, tasks } from "@lvm/db";
import { CreateProjectInput, UpdateProjectInput, ProjectFilterSchema } from "@lvm/core";
import { eq, and, isNull, lt, gt, desc, asc, sql } from "drizzle-orm";

// Create a new project
export const createProject = os
  .input(CreateProjectInput)
  .handler(async ({ input }) => {
    // Set autoComplete default based on type
    const type = input.type ?? "parallel";
    const autoComplete = input.autoComplete ?? (type !== "single_actions");

    const [project] = await db
      .insert(projects)
      .values({
        title: input.title,
        note: input.note ?? null,
        type,
        flagged: input.flagged ?? false,
        dueDate: input.dueDate ?? null,
        deferDate: input.deferDate ?? null,
        folderId: input.folderId ?? null,
        reviewInterval: input.reviewInterval ?? 7,
        autoComplete,
      })
      .returning();
    return project;
  });

// Get project by ID
export const getProject = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, input.id),
      with: { tasks: true, folder: true },
    });
    return project ?? null;
  });

// List projects with filters
export const listProjects = os
  .input(ProjectFilterSchema.optional())
  .handler(async ({ input }) => {
    const conditions = [];

    if (input?.status) {
      conditions.push(eq(projects.status, input.status));
    }
    if (input?.type) {
      conditions.push(eq(projects.type, input.type));
    }
    if (input?.flagged !== undefined) {
      conditions.push(eq(projects.flagged, input.flagged));
    }
    if (input?.folderId !== undefined) {
      conditions.push(input.folderId === null
        ? isNull(projects.folderId)
        : eq(projects.folderId, input.folderId));
    }
    if (input?.dueBefore) {
      conditions.push(lt(projects.dueDate, input.dueBefore));
    }
    if (input?.dueAfter) {
      conditions.push(gt(projects.dueDate, input.dueAfter));
    }
    if (input?.availableOnly) {
      conditions.push(eq(projects.status, "active"));
      // Also check defer date
      const now = new Date();
      conditions.push(
        sql`(${projects.deferDate} IS NULL OR ${projects.deferDate} <= ${now})`
      );
    }

    const result = await db
      .select()
      .from(projects)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(projects.order), desc(projects.createdAt));

    return result;
  });

// Update project
export const updateProject = os
  .input(z.object({ id: z.string().uuid(), data: UpdateProjectInput }))
  .handler(async ({ input }) => {
    const [project] = await db
      .update(projects)
      .set({
        ...input.data,
        modifiedAt: new Date(),
      })
      .where(eq(projects.id, input.id))
      .returning();
    return project;
  });

// Complete project
export const completeProject = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const [project] = await db
      .update(projects)
      .set({
        status: "completed",
        completedAt: new Date(),
        modifiedAt: new Date(),
      })
      .where(eq(projects.id, input.id))
      .returning();
    return project;
  });

// Drop project
export const dropProject = os
  .input(z.object({
    id: z.string().uuid(),
    dropTasks: z.boolean().optional(),
  }))
  .handler(async ({ input }) => {
    // Optionally drop all tasks in the project
    if (input.dropTasks) {
      await db
        .update(tasks)
        .set({
          status: "dropped",
          droppedAt: new Date(),
          modifiedAt: new Date(),
        })
        .where(eq(tasks.projectId, input.id));
    }

    const [project] = await db
      .update(projects)
      .set({
        status: "dropped",
        droppedAt: new Date(),
        modifiedAt: new Date(),
      })
      .where(eq(projects.id, input.id))
      .returning();
    return project;
  });

// Put project on hold
export const holdProject = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const [project] = await db
      .update(projects)
      .set({
        status: "on_hold",
        modifiedAt: new Date(),
      })
      .where(eq(projects.id, input.id))
      .returning();
    return project;
  });

// Activate project (restore from any non-active state)
export const activateProject = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const [project] = await db
      .update(projects)
      .set({
        status: "active",
        completedAt: null,
        droppedAt: null,
        modifiedAt: new Date(),
      })
      .where(eq(projects.id, input.id))
      .returning();
    return project;
  });

// Move project to new folder
export const moveProject = os
  .input(z.object({
    id: z.string().uuid(),
    targetFolderId: z.string().uuid().nullable(),
    position: z.number().int().optional(),
  }))
  .handler(async ({ input }) => {
    const [project] = await db
      .update(projects)
      .set({
        folderId: input.targetFolderId,
        order: input.position ?? 0,
        modifiedAt: new Date(),
      })
      .where(eq(projects.id, input.id))
      .returning();
    return project;
  });

// Mark project as reviewed
export const markReviewed = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const [project] = await db
      .update(projects)
      .set({
        lastReviewedAt: new Date(),
        modifiedAt: new Date(),
      })
      .where(eq(projects.id, input.id))
      .returning();
    return project;
  });

// Delete project
export const deleteProject = os
  .input(z.object({
    id: z.string().uuid(),
    deleteTasks: z.boolean().optional(),
  }))
  .handler(async ({ input }) => {
    if (!input.deleteTasks) {
      // Move tasks to inbox (set projectId to null)
      await db
        .update(tasks)
        .set({
          projectId: null,
          modifiedAt: new Date(),
        })
        .where(eq(tasks.projectId, input.id));
    }

    await db.delete(projects).where(eq(projects.id, input.id));
    return { success: true };
  });

export const projectRouter = {
  create: createProject,
  get: getProject,
  list: listProjects,
  update: updateProject,
  complete: completeProject,
  drop: dropProject,
  hold: holdProject,
  activate: activateProject,
  move: moveProject,
  markReviewed: markReviewed,
  delete: deleteProject,
};
