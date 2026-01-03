#!/usr/bin/env bun
import React, { useState, useEffect } from "react";
import { render, Box, Text, useInput, useApp } from "ink";
import { db, tasks } from "@lvm/db";
import { eq, isNull, and } from "drizzle-orm";
import type { Task } from "@lvm/db";

// Task item component
function TaskItem({ task, selected }: { task: Task; selected: boolean }) {
  const statusIcon = task.status === "completed" ? "✓" : task.status === "dropped" ? "✗" : "○";
  const flagIcon = task.flagged ? "⚑" : " ";
  const dueText = task.dueDate
    ? ` 📅 ${task.dueDate.toLocaleDateString()}`
    : "";

  return (
    <Box>
      <Text color={selected ? "cyan" : undefined} bold={selected}>
        {selected ? "▸ " : "  "}
        <Text color={task.status === "completed" ? "green" : task.status === "dropped" ? "gray" : undefined}>
          {statusIcon}
        </Text>
        {" "}
        <Text color={task.flagged ? "yellow" : undefined}>{flagIcon}</Text>
        {" "}
        <Text strikethrough={task.status !== "active"}>
          {task.title}
        </Text>
        <Text dimColor>{dueText}</Text>
      </Text>
    </Box>
  );
}

// Help bar
function HelpBar() {
  return (
    <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
      <Text dimColor>
        ↑/↓ Navigate  •  Enter Complete  •  n New  •  d Drop  •  f Flag  •  q Quit
      </Text>
    </Box>
  );
}

// Main app component
function App() {
  const { exit } = useApp();
  const [taskList, setTasks] = useState<Task[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from database
  async function loadTasks() {
    try {
      setLoading(true);
      const result = await db.query.tasks.findMany({
        where: and(isNull(tasks.parentTaskId), eq(tasks.status, "active")),
        orderBy: (tasks, { asc }) => [asc(tasks.order)],
      });
      setTasks(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  // Keyboard handling
  useInput(async (input, key) => {
    if (input === "q") {
      exit();
      return;
    }

    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
    if (key.downArrow && selectedIndex < taskList.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }

    const selectedTask = taskList[selectedIndex];
    if (!selectedTask) return;

    // Complete task
    if (key.return) {
      await db
        .update(tasks)
        .set({ status: "completed", completedAt: new Date(), modifiedAt: new Date() })
        .where(eq(tasks.id, selectedTask.id));
      await loadTasks();
    }

    // Drop task
    if (input === "d") {
      await db
        .update(tasks)
        .set({ status: "dropped", droppedAt: new Date(), modifiedAt: new Date() })
        .where(eq(tasks.id, selectedTask.id));
      await loadTasks();
    }

    // Toggle flag
    if (input === "f") {
      await db
        .update(tasks)
        .set({ flagged: !selectedTask.flagged, modifiedAt: new Date() })
        .where(eq(tasks.id, selectedTask.id));
      await loadTasks();
    }

    // New task (placeholder - would need input UI)
    if (input === "n") {
      await db.insert(tasks).values({
        title: `New task ${Date.now()}`,
      });
      await loadTasks();
    }
  });

  if (loading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text>Loading tasks...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error: {error}</Text>
        <Text dimColor>Make sure PostgreSQL is running: docker compose up -d</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="blue">📋 Low Value Material - Task Manager</Text>
      </Box>

      {taskList.length === 0 ? (
        <Text dimColor>No active tasks. Press 'n' to create one.</Text>
      ) : (
        <Box flexDirection="column">
          {taskList.map((task, index) => (
            <TaskItem key={task.id} task={task} selected={index === selectedIndex} />
          ))}
        </Box>
      )}

      <HelpBar />
    </Box>
  );
}

render(<App />);
