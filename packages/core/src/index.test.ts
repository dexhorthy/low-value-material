import { describe, expect, test } from "bun:test";
import { TaskSchema, CreateTaskInput, TaskStatus } from "./index";

describe("TaskStatus", () => {
  test("accepts valid status values", () => {
    expect(TaskStatus.parse("active")).toBe("active");
    expect(TaskStatus.parse("completed")).toBe("completed");
    expect(TaskStatus.parse("dropped")).toBe("dropped");
  });

  test("rejects invalid status values", () => {
    expect(() => TaskStatus.parse("invalid")).toThrow();
  });
});

describe("CreateTaskInput", () => {
  test("validates minimal task input", () => {
    const input = { title: "Test task" };
    const result = CreateTaskInput.parse(input);
    expect(result.title).toBe("Test task");
  });

  test("validates full task input", () => {
    const input = {
      title: "Test task",
      note: "Some notes",
      flagged: true,
      estimatedDuration: 30,
      dueDate: new Date("2026-01-15"),
    };
    const result = CreateTaskInput.parse(input);
    expect(result.title).toBe("Test task");
    expect(result.flagged).toBe(true);
    expect(result.estimatedDuration).toBe(30);
  });

  test("rejects empty title", () => {
    expect(() => CreateTaskInput.parse({ title: "" })).toThrow();
  });

  test("rejects title over 500 chars", () => {
    const longTitle = "a".repeat(501);
    expect(() => CreateTaskInput.parse({ title: longTitle })).toThrow();
  });
});

describe("TaskSchema", () => {
  test("validates complete task object", () => {
    const task = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Test task",
      note: null,
      status: "active" as const,
      flagged: false,
      estimatedDuration: null,
      dueDate: null,
      deferDate: null,
      completedAt: null,
      droppedAt: null,
      projectId: null,
      parentTaskId: null,
      order: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    const result = TaskSchema.parse(task);
    expect(result.id).toBe(task.id);
    expect(result.status).toBe("active");
  });
});
