import { os } from "@orpc/server";
import { z } from "zod";
import { db, folders } from "@lvm/db";
import { CreateFolderInput, UpdateFolderInput, FolderFilterSchema } from "@lvm/core";
import { eq, and, isNull, asc } from "drizzle-orm";

// Create a new folder
export const createFolder = os
  .input(CreateFolderInput)
  .handler(async ({ input }) => {
    const [folder] = await db
      .insert(folders)
      .values({
        name: input.name,
        parentId: input.parentId ?? null,
        order: input.position ?? 0,
      })
      .returning();
    return folder;
  });

// Get folder by ID
export const getFolder = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const folder = await db.query.folders.findFirst({
      where: eq(folders.id, input.id),
      with: { children: true },
    });
    return folder ?? null;
  });

// List folders with filters
export const listFolders = os
  .input(FolderFilterSchema.optional())
  .handler(async ({ input }) => {
    const conditions = [];

    if (input?.status) {
      conditions.push(eq(folders.status, input.status));
    } else if (!input?.includeDropped) {
      conditions.push(eq(folders.status, "active"));
    }

    if (input?.parentId !== undefined) {
      conditions.push(input.parentId === null
        ? isNull(folders.parentId)
        : eq(folders.parentId, input.parentId));
    }

    const result = await db
      .select()
      .from(folders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(folders.order), asc(folders.name));

    return result;
  });

// Update folder
export const updateFolder = os
  .input(z.object({ id: z.string().uuid(), data: UpdateFolderInput }))
  .handler(async ({ input }) => {
    const [folder] = await db
      .update(folders)
      .set({
        ...input.data,
        modifiedAt: new Date(),
      })
      .where(eq(folders.id, input.id))
      .returning();
    return folder;
  });

// Rename folder
export const renameFolder = os
  .input(z.object({ id: z.string().uuid(), name: z.string().min(1).max(500) }))
  .handler(async ({ input }) => {
    const [folder] = await db
      .update(folders)
      .set({
        name: input.name,
        modifiedAt: new Date(),
      })
      .where(eq(folders.id, input.id))
      .returning();
    return folder;
  });

// Drop folder (set status to dropped)
export const dropFolder = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const [folder] = await db
      .update(folders)
      .set({
        status: "dropped",
        modifiedAt: new Date(),
      })
      .where(eq(folders.id, input.id))
      .returning();
    return folder;
  });

// Activate folder (restore from dropped)
export const activateFolder = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const [folder] = await db
      .update(folders)
      .set({
        status: "active",
        modifiedAt: new Date(),
      })
      .where(eq(folders.id, input.id))
      .returning();
    return folder;
  });

// Move folder to new parent
export const moveFolder = os
  .input(z.object({
    id: z.string().uuid(),
    targetParentId: z.string().uuid().nullable(),
    position: z.number().int().optional(),
  }))
  .handler(async ({ input }) => {
    const [folder] = await db
      .update(folders)
      .set({
        parentId: input.targetParentId,
        order: input.position ?? 0,
        modifiedAt: new Date(),
      })
      .where(eq(folders.id, input.id))
      .returning();
    return folder;
  });

// Delete folder
export const deleteFolder = os
  .input(z.object({
    id: z.string().uuid(),
    recursive: z.boolean().optional(),
  }))
  .handler(async ({ input }) => {
    // If recursive, cascade will handle children
    // If not recursive, we should move children up first
    if (!input.recursive) {
      const folder = await db.query.folders.findFirst({
        where: eq(folders.id, input.id),
      });
      if (folder) {
        // Move children to parent's parent
        await db
          .update(folders)
          .set({ parentId: folder.parentId })
          .where(eq(folders.parentId, input.id));
      }
    }

    await db.delete(folders).where(eq(folders.id, input.id));
    return { success: true };
  });

// Get folder statistics
export const getFolderStats = os
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    // Get direct child folders
    const childFolders = await db
      .select()
      .from(folders)
      .where(eq(folders.parentId, input.id));

    // TODO: Add project and task counts once those relations are set up
    return {
      folderCount: childFolders.length,
      projectCount: 0, // Will be populated when projects are linked
      totalProjects: 0,
      totalTasks: 0,
      remainingTasks: 0,
    };
  });

export const folderRouter = {
  create: createFolder,
  get: getFolder,
  list: listFolders,
  update: updateFolder,
  rename: renameFolder,
  drop: dropFolder,
  activate: activateFolder,
  move: moveFolder,
  delete: deleteFolder,
  stats: getFolderStats,
};
