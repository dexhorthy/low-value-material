import { os } from "@orpc/server";
import { z } from "zod";
import { db, tags, taskTags, projectTags } from "@lvm/db";
import { CreateTagInput, UpdateTagInput, TagFilterSchema, TagStatus } from "@lvm/core";
import { eq, and, isNull, isNotNull, asc } from "drizzle-orm";

// Create a new tag
export const createTag = os
  .input(CreateTagInput)
  .handler(async ({ input }) => {
    const [tag] = await db
      .insert(tags)
      .values({
        name: input.name,
        parentId: input.parentId ?? null,
        order: input.position ?? 0,
        allowsNextAction: input.allowsNextAction ?? true,
        childrenMutuallyExclusive: input.childrenMutuallyExclusive ?? false,
        locationLatitude: input.location?.latitude ?? null,
        locationLongitude: input.location?.longitude ?? null,
        locationRadius: input.location?.radius ?? null,
        locationName: input.location?.name ?? null,
      })
      .returning();
    return tag;
  });

// Get tag by ID
export const getTag = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const tag = await db.query.tags.findFirst({
      where: eq(tags.id, input.id),
      with: { children: true },
    });
    return tag ?? null;
  });

// List tags with filters
export const listTags = os
  .input(TagFilterSchema.optional())
  .handler(async ({ input }) => {
    const conditions = [];

    if (input?.status) {
      conditions.push(eq(tags.status, input.status));
    } else if (!input?.includeDropped) {
      // Default: don't include dropped
      conditions.push(
        eq(tags.status, "active")
      );
    }

    if (input?.parentId !== undefined) {
      conditions.push(input.parentId === null
        ? isNull(tags.parentId)
        : eq(tags.parentId, input.parentId));
    }

    if (input?.hasLocation) {
      conditions.push(isNotNull(tags.locationLatitude));
    }

    const result = await db
      .select()
      .from(tags)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(tags.order), asc(tags.name));

    return result;
  });

// Update tag
export const updateTag = os
  .input(z.object({ id: z.string().uuid(), data: UpdateTagInput }))
  .handler(async ({ input }) => {
    const updateData: Record<string, unknown> = {
      modifiedAt: new Date(),
    };

    if (input.data.name !== undefined) updateData.name = input.data.name;
    if (input.data.status !== undefined) updateData.status = input.data.status;
    if (input.data.parentId !== undefined) updateData.parentId = input.data.parentId;
    if (input.data.order !== undefined) updateData.order = input.data.order;
    if (input.data.allowsNextAction !== undefined) updateData.allowsNextAction = input.data.allowsNextAction;
    if (input.data.childrenMutuallyExclusive !== undefined) {
      updateData.childrenMutuallyExclusive = input.data.childrenMutuallyExclusive;
    }

    // Handle location update
    if (input.data.location !== undefined) {
      if (input.data.location === null) {
        updateData.locationLatitude = null;
        updateData.locationLongitude = null;
        updateData.locationRadius = null;
        updateData.locationName = null;
      } else {
        updateData.locationLatitude = input.data.location.latitude;
        updateData.locationLongitude = input.data.location.longitude;
        updateData.locationRadius = input.data.location.radius ?? null;
        updateData.locationName = input.data.location.name ?? null;
      }
    }

    const [tag] = await db
      .update(tags)
      .set(updateData)
      .where(eq(tags.id, input.id))
      .returning();
    return tag;
  });

// Rename tag
export const renameTag = os
  .input(z.object({ id: z.string().uuid(), name: z.string().min(1).max(200) }))
  .handler(async ({ input }) => {
    const [tag] = await db
      .update(tags)
      .set({
        name: input.name,
        modifiedAt: new Date(),
      })
      .where(eq(tags.id, input.id))
      .returning();
    return tag;
  });

// Set tag status
export const setTagStatus = os
  .input(z.object({ id: z.string().uuid(), status: TagStatus }))
  .handler(async ({ input }) => {
    const [tag] = await db
      .update(tags)
      .set({
        status: input.status,
        modifiedAt: new Date(),
      })
      .where(eq(tags.id, input.id))
      .returning();
    return tag;
  });

// Move tag to new parent
export const moveTag = os
  .input(z.object({
    id: z.string().uuid(),
    parentId: z.string().uuid().nullable(),
    position: z.number().int().optional(),
  }))
  .handler(async ({ input }) => {
    const [tag] = await db
      .update(tags)
      .set({
        parentId: input.parentId,
        order: input.position ?? 0,
        modifiedAt: new Date(),
      })
      .where(eq(tags.id, input.id))
      .returning();
    return tag;
  });

// Delete tag
export const deleteTag = os
  .input(z.object({
    id: z.string().uuid(),
    deleteChildren: z.boolean().optional(),
  }))
  .handler(async ({ input }) => {
    if (!input.deleteChildren) {
      // Move children to parent's parent
      const tag = await db.query.tags.findFirst({
        where: eq(tags.id, input.id),
      });
      if (tag) {
        await db
          .update(tags)
          .set({ parentId: tag.parentId })
          .where(eq(tags.parentId, input.id));
      }
    }

    // Delete the tag (cascade will remove from junction tables)
    await db.delete(tags).where(eq(tags.id, input.id));
    return { success: true };
  });

// Add tag to task
export const addTagToTask = os
  .input(z.object({
    taskId: z.string().uuid(),
    tagId: z.string().uuid(),
  }))
  .handler(async ({ input }) => {
    // Check if tag has mutually exclusive parent
    const tag = await db.query.tags.findFirst({
      where: eq(tags.id, input.tagId),
      with: { parent: true },
    });

    if (tag?.parent?.childrenMutuallyExclusive) {
      // Get sibling tags
      const siblings = await db
        .select()
        .from(tags)
        .where(eq(tags.parentId, tag.parentId!));

      const siblingIds = siblings.map(s => s.id);

      // Remove any existing sibling tags from this task
      for (const siblingId of siblingIds) {
        if (siblingId !== input.tagId) {
          await db
            .delete(taskTags)
            .where(
              and(
                eq(taskTags.taskId, input.taskId),
                eq(taskTags.tagId, siblingId)
              )
            );
        }
      }
    }

    // Add the tag
    await db
      .insert(taskTags)
      .values({
        taskId: input.taskId,
        tagId: input.tagId,
      })
      .onConflictDoNothing();

    return { success: true };
  });

// Remove tag from task
export const removeTagFromTask = os
  .input(z.object({
    taskId: z.string().uuid(),
    tagId: z.string().uuid(),
  }))
  .handler(async ({ input }) => {
    await db
      .delete(taskTags)
      .where(
        and(
          eq(taskTags.taskId, input.taskId),
          eq(taskTags.tagId, input.tagId)
        )
      );
    return { success: true };
  });

// Add tag to project
export const addTagToProject = os
  .input(z.object({
    projectId: z.string().uuid(),
    tagId: z.string().uuid(),
  }))
  .handler(async ({ input }) => {
    await db
      .insert(projectTags)
      .values({
        projectId: input.projectId,
        tagId: input.tagId,
      })
      .onConflictDoNothing();
    return { success: true };
  });

// Remove tag from project
export const removeTagFromProject = os
  .input(z.object({
    projectId: z.string().uuid(),
    tagId: z.string().uuid(),
  }))
  .handler(async ({ input }) => {
    await db
      .delete(projectTags)
      .where(
        and(
          eq(projectTags.projectId, input.projectId),
          eq(projectTags.tagId, input.tagId)
        )
      );
    return { success: true };
  });

// Get tags for a task
export const getTaskTags = os
  .input(z.object({ taskId: z.string().uuid() }))
  .handler(async ({ input }) => {
    const result = await db
      .select({ tag: tags })
      .from(taskTags)
      .innerJoin(tags, eq(taskTags.tagId, tags.id))
      .where(eq(taskTags.taskId, input.taskId))
      .orderBy(asc(taskTags.order));

    return result.map(r => r.tag);
  });

// Get tags for a project
export const getProjectTags = os
  .input(z.object({ projectId: z.string().uuid() }))
  .handler(async ({ input }) => {
    const result = await db
      .select({ tag: tags })
      .from(projectTags)
      .innerJoin(tags, eq(projectTags.tagId, tags.id))
      .where(eq(projectTags.projectId, input.projectId))
      .orderBy(asc(projectTags.order));

    return result.map(r => r.tag);
  });

// List location tags
export const listLocationTags = os
  .handler(async () => {
    const result = await db
      .select()
      .from(tags)
      .where(
        and(
          isNotNull(tags.locationLatitude),
          eq(tags.status, "active")
        )
      )
      .orderBy(asc(tags.name));

    return result;
  });

export const tagRouter = {
  create: createTag,
  get: getTag,
  list: listTags,
  update: updateTag,
  rename: renameTag,
  setStatus: setTagStatus,
  move: moveTag,
  delete: deleteTag,
  addToTask: addTagToTask,
  removeFromTask: removeTagFromTask,
  addToProject: addTagToProject,
  removeFromProject: removeTagFromProject,
  getTaskTags: getTaskTags,
  getProjectTags: getProjectTags,
  listLocationTags: listLocationTags,
};
