import { os } from "@orpc/server";
import { z } from "zod";
import { db, tasks, projects } from "@lvm/db";
import { InboxFilterSchema, ProjectType } from "@lvm/core";
import { eq, and, isNull, sql, count, desc, asc } from "drizzle-orm";

// List inbox items - tasks with no project and no parent task
export const listInbox = os
  .input(InboxFilterSchema.optional())
  .handler(async ({ input }) => {
    const conditions = [
      isNull(tasks.projectId),
      isNull(tasks.parentTaskId),
    ];

    if (!input?.includeCompleted) {
      conditions.push(sql`${tasks.status} != 'completed'`);
    }
    if (!input?.includeDropped) {
      conditions.push(sql`${tasks.status} != 'dropped'`);
    }

    const result = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(asc(tasks.order), desc(tasks.createdAt));

    return result;
  });

// Get inbox count (active items only)
export const getInboxCount = os
  .handler(async () => {
    const result = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          isNull(tasks.projectId),
          isNull(tasks.parentTaskId),
          eq(tasks.status, "active")
        )
      );

    return result[0]?.count ?? 0;
  });

// Check if inbox has items
export const hasInboxItems = os
  .handler(async () => {
    const inboxCount = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          isNull(tasks.projectId),
          isNull(tasks.parentTaskId),
          eq(tasks.status, "active")
        )
      );

    return (inboxCount[0]?.count ?? 0) > 0;
  });

// Get inbox statistics
export const getInboxStats = os
  .handler(async () => {
    const now = new Date();

    // Get all inbox items
    const inboxItems = await db
      .select()
      .from(tasks)
      .where(
        and(
          isNull(tasks.projectId),
          isNull(tasks.parentTaskId)
        )
      );

    const active = inboxItems.filter(t => t.status === "active");
    const completed = inboxItems.filter(t => t.status === "completed");
    const deferred = active.filter(t => t.deferDate && t.deferDate > now);
    const available = active.filter(t => !t.deferDate || t.deferDate <= now);
    const flagged = active.filter(t => t.flagged);
    const withDueDate = active.filter(t => t.dueDate);
    const overdue = active.filter(t => t.dueDate && t.dueDate < now);

    return {
      total: inboxItems.length,
      active: active.length,
      available: available.length,
      deferred: deferred.length,
      completed: completed.length,
      flagged: flagged.length,
      withDueDate: withDueDate.length,
      overdue: overdue.length,
    };
  });

// Process inbox item to project
export const processToProject = os
  .input(z.object({
    inboxItemId: z.string().uuid(),
    projectId: z.string().uuid(),
    position: z.number().int().optional(),
  }))
  .handler(async ({ input }) => {
    const [task] = await db
      .update(tasks)
      .set({
        projectId: input.projectId,
        tentativeProjectId: null,
        tentativeParentTaskId: null,
        order: input.position ?? 0,
        modifiedAt: new Date(),
      })
      .where(eq(tasks.id, input.inboxItemId))
      .returning();
    return task;
  });

// Process inbox item as subtask
export const processToTask = os
  .input(z.object({
    inboxItemId: z.string().uuid(),
    parentTaskId: z.string().uuid(),
    position: z.number().int().optional(),
  }))
  .handler(async ({ input }) => {
    // Get the parent task to inherit projectId
    const parentTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, input.parentTaskId),
    });

    const [task] = await db
      .update(tasks)
      .set({
        parentTaskId: input.parentTaskId,
        projectId: parentTask?.projectId ?? null,
        tentativeProjectId: null,
        tentativeParentTaskId: null,
        order: input.position ?? 0,
        modifiedAt: new Date(),
      })
      .where(eq(tasks.id, input.inboxItemId))
      .returning();
    return task;
  });

// Set tentative assignment
export const setTentativeAssignment = os
  .input(z.object({
    inboxItemId: z.string().uuid(),
    projectId: z.string().uuid().nullable().optional(),
    parentTaskId: z.string().uuid().nullable().optional(),
  }))
  .handler(async ({ input }) => {
    const [task] = await db
      .update(tasks)
      .set({
        tentativeProjectId: input.projectId ?? null,
        tentativeParentTaskId: input.parentTaskId ?? null,
        modifiedAt: new Date(),
      })
      .where(eq(tasks.id, input.inboxItemId))
      .returning();
    return task;
  });

// Clean up inbox - apply all tentative assignments
export const cleanUpInbox = os
  .handler(async () => {
    // Get all inbox items with tentative assignments
    const itemsToProcess = await db
      .select()
      .from(tasks)
      .where(
        and(
          isNull(tasks.projectId),
          isNull(tasks.parentTaskId),
          eq(tasks.status, "active"),
          sql`(${tasks.tentativeProjectId} IS NOT NULL OR ${tasks.tentativeParentTaskId} IS NOT NULL)`
        )
      );

    let processed = 0;

    for (const item of itemsToProcess) {
      if (item.tentativeParentTaskId) {
        // Get parent task to inherit projectId
        const parentTask = await db.query.tasks.findFirst({
          where: eq(tasks.id, item.tentativeParentTaskId),
        });

        await db
          .update(tasks)
          .set({
            parentTaskId: item.tentativeParentTaskId,
            projectId: parentTask?.projectId ?? null,
            tentativeProjectId: null,
            tentativeParentTaskId: null,
            modifiedAt: new Date(),
          })
          .where(eq(tasks.id, item.id));
        processed++;
      } else if (item.tentativeProjectId) {
        await db
          .update(tasks)
          .set({
            projectId: item.tentativeProjectId,
            tentativeProjectId: null,
            tentativeParentTaskId: null,
            modifiedAt: new Date(),
          })
          .where(eq(tasks.id, item.id));
        processed++;
      }
    }

    return { processed };
  });

// Convert inbox item to project
export const convertToProject = os
  .input(z.object({
    inboxItemId: z.string().uuid(),
    type: ProjectType.optional(),
  }))
  .handler(async ({ input }) => {
    // Get the inbox item
    const inboxItem = await db.query.tasks.findFirst({
      where: eq(tasks.id, input.inboxItemId),
    });

    if (!inboxItem) {
      throw new Error("Inbox item not found");
    }

    // Create the project from the task
    const type = input.type ?? "parallel";
    const [project] = await db
      .insert(projects)
      .values({
        title: inboxItem.title,
        note: inboxItem.note,
        type,
        flagged: inboxItem.flagged,
        dueDate: inboxItem.dueDate,
        deferDate: inboxItem.deferDate,
        autoComplete: type !== "single_actions",
      })
      .returning();

    // Delete the original task
    await db.delete(tasks).where(eq(tasks.id, input.inboxItemId));

    return project;
  });

// Reorder inbox items
export const reorderInbox = os
  .input(z.object({
    itemId: z.string().uuid(),
    position: z.number().int(),
  }))
  .handler(async ({ input }) => {
    const [task] = await db
      .update(tasks)
      .set({
        order: input.position,
        modifiedAt: new Date(),
      })
      .where(eq(tasks.id, input.itemId))
      .returning();
    return task;
  });

export const inboxRouter = {
  list: listInbox,
  count: getInboxCount,
  hasItems: hasInboxItems,
  stats: getInboxStats,
  processToProject: processToProject,
  processToTask: processToTask,
  setTentativeAssignment: setTentativeAssignment,
  cleanUp: cleanUpInbox,
  convertToProject: convertToProject,
  reorder: reorderInbox,
};
