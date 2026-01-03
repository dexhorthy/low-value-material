import { describe, expect, test } from "bun:test";
import {
  TaskSchema, CreateTaskInput, TaskStatus,
  CreateFolderInput, FolderStatus,
  CreateProjectInput, ProjectStatus, ProjectType,
  CreateTagInput, TagStatus,
} from "./index";

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
      tentativeProjectId: null,
      tentativeParentTaskId: null,
      order: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    const result = TaskSchema.parse(task);
    expect(result.id).toBe(task.id);
    expect(result.status).toBe("active");
  });
});

// Folder tests
describe("FolderStatus", () => {
  test("accepts valid status values", () => {
    expect(FolderStatus.parse("active")).toBe("active");
    expect(FolderStatus.parse("dropped")).toBe("dropped");
  });

  test("rejects invalid status values", () => {
    expect(() => FolderStatus.parse("completed")).toThrow();
  });
});

describe("CreateFolderInput", () => {
  test("validates minimal folder input", () => {
    const input = { name: "Work" };
    const result = CreateFolderInput.parse(input);
    expect(result.name).toBe("Work");
  });

  test("validates folder with parent", () => {
    const input = {
      name: "Client A",
      parentId: "123e4567-e89b-12d3-a456-426614174000",
    };
    const result = CreateFolderInput.parse(input);
    expect(result.name).toBe("Client A");
    expect(result.parentId).toBe("123e4567-e89b-12d3-a456-426614174000");
  });
});

// Project tests
describe("ProjectStatus", () => {
  test("accepts valid status values", () => {
    expect(ProjectStatus.parse("active")).toBe("active");
    expect(ProjectStatus.parse("on_hold")).toBe("on_hold");
    expect(ProjectStatus.parse("completed")).toBe("completed");
    expect(ProjectStatus.parse("dropped")).toBe("dropped");
  });
});

describe("ProjectType", () => {
  test("accepts valid type values", () => {
    expect(ProjectType.parse("parallel")).toBe("parallel");
    expect(ProjectType.parse("sequential")).toBe("sequential");
    expect(ProjectType.parse("single_actions")).toBe("single_actions");
  });
});

describe("CreateProjectInput", () => {
  test("validates minimal project input", () => {
    const input = { title: "Build Website" };
    const result = CreateProjectInput.parse(input);
    expect(result.title).toBe("Build Website");
  });

  test("validates project with all fields", () => {
    const input = {
      title: "Build Website",
      note: "Project notes",
      type: "sequential" as const,
      flagged: true,
      autoComplete: false,
    };
    const result = CreateProjectInput.parse(input);
    expect(result.title).toBe("Build Website");
    expect(result.type).toBe("sequential");
    expect(result.flagged).toBe(true);
  });
});

// Tag tests
describe("TagStatus", () => {
  test("accepts valid status values", () => {
    expect(TagStatus.parse("active")).toBe("active");
    expect(TagStatus.parse("on_hold")).toBe("on_hold");
    expect(TagStatus.parse("dropped")).toBe("dropped");
  });
});

describe("CreateTagInput", () => {
  test("validates minimal tag input", () => {
    const input = { name: "Home" };
    const result = CreateTagInput.parse(input);
    expect(result.name).toBe("Home");
  });

  test("validates tag with location", () => {
    const input = {
      name: "Grocery Store",
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 500,
        name: "Whole Foods",
      },
    };
    const result = CreateTagInput.parse(input);
    expect(result.name).toBe("Grocery Store");
    expect(result.location?.latitude).toBe(37.7749);
    expect(result.location?.radius).toBe(500);
  });

  test("validates tag with behavioral flags", () => {
    const input = {
      name: "Waiting For",
      allowsNextAction: false,
    };
    const result = CreateTagInput.parse(input);
    expect(result.allowsNextAction).toBe(false);
  });
});
