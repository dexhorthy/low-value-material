import { describe, expect, test } from "bun:test";
import {
  TaskSchema, CreateTaskInput, TaskStatus,
  CreateFolderInput, FolderStatus,
  CreateProjectInput, ProjectStatus, ProjectType,
  CreateTagInput, TagStatus,
  calculateEffectiveDueDate,
  calculateEffectiveDeferDate,
  isAvailable,
  isDeferred,
  isOverdue,
  isDueSoon,
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

  test("validates task input with time-specified flags", () => {
    const input = {
      title: "Meeting prep",
      dueDate: new Date("2026-01-15T14:00:00Z"),
      dueTimeSpecified: true,
      deferDate: new Date("2026-01-14T09:00:00Z"),
      deferTimeSpecified: true,
    };
    const result = CreateTaskInput.parse(input);
    expect(result.dueTimeSpecified).toBe(true);
    expect(result.deferTimeSpecified).toBe(true);
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
      dueTimeSpecified: false,
      deferDate: null,
      deferTimeSpecified: false,
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
    expect(result.dueTimeSpecified).toBe(false);
    expect(result.deferTimeSpecified).toBe(false);
  });

  test("validates task with time-specified dates", () => {
    const task = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Meeting prep",
      note: null,
      status: "active" as const,
      flagged: false,
      estimatedDuration: 30,
      dueDate: new Date("2026-01-15T14:00:00Z"),
      dueTimeSpecified: true,
      deferDate: new Date("2026-01-14T09:00:00Z"),
      deferTimeSpecified: true,
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
    expect(result.dueTimeSpecified).toBe(true);
    expect(result.deferTimeSpecified).toBe(true);
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

// ============================================================================
// Effective Date Calculation Tests - specs/due-dates.md, specs/defer-dates.md
// ============================================================================

describe("calculateEffectiveDueDate", () => {
  const jan10 = new Date("2026-01-10");
  const jan15 = new Date("2026-01-15");
  const jan20 = new Date("2026-01-20");
  const jan30 = new Date("2026-01-30");

  test("returns null when all dates are null", () => {
    expect(calculateEffectiveDueDate(null, null, null)).toBe(null);
  });

  test("returns item due date when it is the only date", () => {
    const result = calculateEffectiveDueDate(jan15, null, null);
    expect(result?.getTime()).toBe(jan15.getTime());
  });

  test("returns project due date when item has no date", () => {
    const result = calculateEffectiveDueDate(null, null, jan15);
    expect(result?.getTime()).toBe(jan15.getTime());
  });

  test("returns parent effective due date when item has no date", () => {
    const result = calculateEffectiveDueDate(null, jan15, null);
    expect(result?.getTime()).toBe(jan15.getTime());
  });

  test("returns earliest date - item due before project", () => {
    const result = calculateEffectiveDueDate(jan10, null, jan15);
    expect(result?.getTime()).toBe(jan10.getTime());
  });

  test("returns earliest date - project due before item", () => {
    const result = calculateEffectiveDueDate(jan20, null, jan15);
    expect(result?.getTime()).toBe(jan15.getTime());
  });

  test("returns earliest from all three dates", () => {
    const result = calculateEffectiveDueDate(jan20, jan15, jan30);
    expect(result?.getTime()).toBe(jan15.getTime());
  });

  test("spec example: task inherits from project", () => {
    // Project A (due: Jan 15), Task 1 (due: null) → effective due: Jan 15
    const result = calculateEffectiveDueDate(null, null, jan15);
    expect(result?.getTime()).toBe(jan15.getTime());
  });

  test("spec example: task due earlier than project", () => {
    // Task 2 (due: Jan 10), Project (due: Jan 15) → effective due: Jan 10
    const result = calculateEffectiveDueDate(jan10, null, jan15);
    expect(result?.getTime()).toBe(jan10.getTime());
  });

  test("spec example: task due later than project uses project date", () => {
    // Task 3 (due: Jan 20), Project (due: Jan 15) → effective due: Jan 15
    const result = calculateEffectiveDueDate(jan20, null, jan15);
    expect(result?.getTime()).toBe(jan15.getTime());
  });
});

describe("calculateEffectiveDeferDate", () => {
  const jan5 = new Date("2026-01-05");
  const jan8 = new Date("2026-01-08");
  const jan10 = new Date("2026-01-10");
  const jan15 = new Date("2026-01-15");
  const jan20 = new Date("2026-01-20");

  test("returns null when all dates are null", () => {
    expect(calculateEffectiveDeferDate(null, null, null)).toBe(null);
  });

  test("returns item defer date when it is the only date", () => {
    const result = calculateEffectiveDeferDate(jan15, null, null);
    expect(result?.getTime()).toBe(jan15.getTime());
  });

  test("returns project defer date when item has no date", () => {
    const result = calculateEffectiveDeferDate(null, null, jan15);
    expect(result?.getTime()).toBe(jan15.getTime());
  });

  test("returns parent effective defer date when item has no date", () => {
    const result = calculateEffectiveDeferDate(null, jan15, null);
    expect(result?.getTime()).toBe(jan15.getTime());
  });

  test("returns latest date - item deferred later than project", () => {
    const result = calculateEffectiveDeferDate(jan20, null, jan15);
    expect(result?.getTime()).toBe(jan20.getTime());
  });

  test("returns latest date - project deferred later than item", () => {
    const result = calculateEffectiveDeferDate(jan10, null, jan15);
    expect(result?.getTime()).toBe(jan15.getTime());
  });

  test("returns latest from all three dates", () => {
    const result = calculateEffectiveDeferDate(jan10, jan20, jan15);
    expect(result?.getTime()).toBe(jan20.getTime());
  });

  test("spec example: task inherits from project", () => {
    // Project A (defer: Jan 15), Task 1 (defer: null) → effective defer: Jan 15
    const result = calculateEffectiveDeferDate(null, null, jan15);
    expect(result?.getTime()).toBe(jan15.getTime());
  });

  test("spec example: task deferred earlier uses project date", () => {
    // Task 2 (defer: Jan 10), Project (defer: Jan 15) → effective defer: Jan 15
    const result = calculateEffectiveDeferDate(jan10, null, jan15);
    expect(result?.getTime()).toBe(jan15.getTime());
  });

  test("spec example: task deferred later uses task date", () => {
    // Task 3 (defer: Jan 20), Project (defer: Jan 15) → effective defer: Jan 20
    const result = calculateEffectiveDeferDate(jan20, null, jan15);
    expect(result?.getTime()).toBe(jan20.getTime());
  });

  test("spec example: nested hierarchy - Phase 1 blocks subtask", () => {
    // Project (defer: Jan 5), Phase 1 (defer: Jan 10), Subtask B (defer: Jan 8)
    // Subtask B effective defer: Jan 10 (Phase 1 is later)
    const parentEffective = calculateEffectiveDeferDate(jan10, null, jan5); // Phase 1
    expect(parentEffective?.getTime()).toBe(jan10.getTime());
    const result = calculateEffectiveDeferDate(jan8, parentEffective, jan5); // Subtask B
    expect(result?.getTime()).toBe(jan10.getTime());
  });
});

describe("isAvailable", () => {
  const now = new Date("2026-01-15T12:00:00Z");
  const past = new Date("2026-01-10");
  const future = new Date("2026-01-20");

  test("returns true when defer date is null", () => {
    expect(isAvailable(null, now)).toBe(true);
  });

  test("returns true when defer date is in the past", () => {
    expect(isAvailable(past, now)).toBe(true);
  });

  test("returns true when defer date equals now", () => {
    expect(isAvailable(now, now)).toBe(true);
  });

  test("returns false when defer date is in the future", () => {
    expect(isAvailable(future, now)).toBe(false);
  });
});

describe("isDeferred", () => {
  const now = new Date("2026-01-15T12:00:00Z");
  const past = new Date("2026-01-10");
  const future = new Date("2026-01-20");

  test("returns false when defer date is null", () => {
    expect(isDeferred(null, now)).toBe(false);
  });

  test("returns false when defer date is in the past", () => {
    expect(isDeferred(past, now)).toBe(false);
  });

  test("returns false when defer date equals now", () => {
    expect(isDeferred(now, now)).toBe(false);
  });

  test("returns true when defer date is in the future", () => {
    expect(isDeferred(future, now)).toBe(true);
  });
});

describe("isOverdue", () => {
  const now = new Date("2026-01-15T12:00:00Z");
  const past = new Date("2026-01-10");
  const future = new Date("2026-01-20");

  test("returns false when due date is null", () => {
    expect(isOverdue(null, now)).toBe(false);
  });

  test("returns true when due date is in the past", () => {
    expect(isOverdue(past, now)).toBe(true);
  });

  test("returns false when due date equals now", () => {
    expect(isOverdue(now, now)).toBe(false);
  });

  test("returns false when due date is in the future", () => {
    expect(isOverdue(future, now)).toBe(false);
  });
});

describe("isDueSoon", () => {
  const now = new Date("2026-01-15T12:00:00Z");
  const past = new Date("2026-01-10");
  const within48h = new Date("2026-01-17T00:00:00Z"); // 36 hours from now
  const exactly48h = new Date("2026-01-17T12:00:00Z"); // exactly 48 hours
  const beyond48h = new Date("2026-01-20");

  test("returns false when due date is null", () => {
    expect(isDueSoon(null, now, 48)).toBe(false);
  });

  test("returns false when due date is in the past", () => {
    expect(isDueSoon(past, now, 48)).toBe(false);
  });

  test("returns true when due date is within threshold", () => {
    expect(isDueSoon(within48h, now, 48)).toBe(true);
  });

  test("returns true when due date equals threshold boundary", () => {
    expect(isDueSoon(exactly48h, now, 48)).toBe(true);
  });

  test("returns false when due date is beyond threshold", () => {
    expect(isDueSoon(beyond48h, now, 48)).toBe(false);
  });

  test("uses custom threshold", () => {
    // With 24h threshold, 36h away should not be due soon
    expect(isDueSoon(within48h, now, 24)).toBe(false);
    // With 72h threshold, 60h away should be due soon
    const within72h = new Date("2026-01-18T00:00:00Z"); // 60 hours
    expect(isDueSoon(within72h, now, 72)).toBe(true);
  });
});
