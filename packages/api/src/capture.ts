import { os } from "@orpc/server";
import { z } from "zod";
import { db, projects, tags, tasks } from "@lvm/db";
import { baml, type TaskExtractionResult } from "@lvm/ai";
import { eq } from "drizzle-orm";

// Input for AI capture
const CaptureInput = z.object({
  input: z.string().min(1).max(10000),
});

// Extract tasks from natural language input using AI
export const extractTasks = os
  .input(CaptureInput)
  .handler(async ({ input }): Promise<TaskExtractionResult> => {
    // Get existing projects for matching
    const existingProjects = await db
      .select({ title: projects.title })
      .from(projects)
      .where(eq(projects.status, "active"));
    const projectNames = existingProjects.map((p) => p.title);

    // Get existing tags for matching
    const existingTags = await db
      .select({ name: tags.name })
      .from(tags)
      .where(eq(tags.status, "active"));
    const tagNames = existingTags.map((t) => t.name);

    // Call BAML to extract tasks
    const currentDate = new Date().toISOString();
    const result = await baml.ExtractTasks(
      input.input,
      currentDate,
      projectNames,
      tagNames
    );

    return result;
  });

// Check for duplicate tasks
const DuplicateCheckInput = z.object({
  title: z.string().min(1).max(500),
  note: z.string().optional(),
});

export const checkDuplicate = os
  .input(DuplicateCheckInput)
  .handler(async ({ input }) => {
    // Get active tasks for duplicate checking
    const activeTasks = await db
      .select({ title: tasks.title })
      .from(tasks)
      .where(eq(tasks.status, "active"));
    const taskTitles = activeTasks.map((t) => t.title);

    // Call BAML to check duplicates
    const result = await baml.CheckDuplicate(
      input.title,
      input.note,
      taskTitles
    );

    return result;
  });

// Create tasks from extracted data - processes extraction result and creates tasks
const CreateFromExtractionInput = z.object({
  tasks: z.array(
    z.object({
      title: z.string().min(1).max(500),
      note: z.string().optional(),
      dueDate: z.string().optional(), // ISO date string
      deferDate: z.string().optional(), // ISO date string
      estimatedMinutes: z.number().int().positive().optional(),
      projectId: z.string().uuid().optional(),
      tagIds: z.array(z.string().uuid()).optional(),
    })
  ),
});

export const createFromExtraction = os
  .input(CreateFromExtractionInput)
  .handler(async ({ input }) => {
    const createdTasks = [];

    for (const extractedTask of input.tasks) {
      const [task] = await db
        .insert(tasks)
        .values({
          title: extractedTask.title,
          note: extractedTask.note ?? null,
          dueDate: extractedTask.dueDate
            ? new Date(extractedTask.dueDate)
            : null,
          deferDate: extractedTask.deferDate
            ? new Date(extractedTask.deferDate)
            : null,
          estimatedDuration: extractedTask.estimatedMinutes ?? null,
          projectId: extractedTask.projectId ?? null,
        })
        .returning();

      createdTasks.push(task);
    }

    return { tasks: createdTasks, count: createdTasks.length };
  });

export const captureRouter = {
  extractTasks,
  checkDuplicate,
  createFromExtraction,
};
