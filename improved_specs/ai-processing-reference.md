# AI Processing Reference Specification

This document provides reference documentation for structured generation and extraction patterns used throughout the AI-native task management system. It covers BAML for LLM interactions and Claude Agent SDK for agent-based workflows.

## BAML for Structured Extraction

BAML (BoundaryML) is a domain-specific language for generating structured outputs from LLMs with type-safe, validated responses.

### Why BAML?

| Feature | Benefit |
|---------|---------|
| Schema-first | Define outputs as types, get validated results |
| Multi-language | Generate clients for Python, TypeScript, Ruby, Go |
| Day-1 model support | Works with any LLM, no native tool-calling required |
| Schema-Aligned Parsing | Handles markdown in JSON, chain-of-thought, etc. |
| Retry/validation built-in | Automatic reprompting on schema validation errors |

### Core Concepts

**Types**: Define your data structures
```baml
class Task {
  title string
  due_date string?
  tags string[]
  estimated_minutes int?
  confidence float
}
```

**Functions**: Define LLM interactions with prompts
```baml
function ExtractTask(input: string) -> Task {
  client Claude
  prompt #"
    Extract task information from this input:
    ---
    {{ input }}
    ---

    {{ ctx.output_format }}
  "#
}
```

**ctx.output_format**: Automatically injects the schema into the prompt, telling the LLM how to format its response.

### Task Capture Schema

```baml
// Date extraction with confidence
class ExtractedDate {
  value string @description("ISO 8601 datetime")
  original_text string @description("The original text that was parsed")
  confidence float @description("0-1 confidence score")
}

// Tag suggestion
class TagSuggestion {
  name string
  confidence float
  is_existing bool @description("Whether this matches an existing tag")
}

// Project suggestion
class ProjectSuggestion {
  name string
  confidence float
  is_existing bool
}

// Main capture intent
class CaptureIntent {
  title string @description("Short, actionable task title")
  note string? @description("Additional details or context")

  due_date ExtractedDate?
  defer_date ExtractedDate?

  suggested_project ProjectSuggestion?
  suggested_tags TagSuggestion[]

  estimated_minutes int? @description("Estimated task duration")
  is_urgent bool @description("Whether task seems time-sensitive")
  is_waiting_for bool @description("Whether task depends on someone else")

  subtasks CaptureIntent[] @description("Detected sub-tasks if input contains multiple items")

  overall_confidence float
  clarification_needed string[]
}

// Main extraction function
function ExtractTaskIntent(
  input: string,
  existing_tags: string[],
  existing_projects: string[],
  current_datetime: string
) -> CaptureIntent {
  client Claude
  prompt #"
    You are a task extraction assistant. Parse the user's input and extract structured task information.

    Current date/time: {{ current_datetime }}

    Existing tags (match if relevant): {{ existing_tags }}
    Existing projects (match if relevant): {{ existing_projects }}

    User input:
    ---
    {{ input }}
    ---

    Guidelines:
    - Extract a clear, actionable title
    - Parse any dates/times mentioned (relative to current datetime)
    - Suggest matching tags and projects from existing lists
    - Detect if input contains multiple separate tasks
    - Set is_urgent=true for time-sensitive language
    - Set is_waiting_for=true if task depends on someone else
    - Include clarification_needed for ambiguous parts

    {{ ctx.output_format }}
  "#
}
```

### Duplicate Detection Schema

```baml
class DuplicateCheck {
  is_duplicate bool
  similarity_score float
  match_type string @description("exact | similar | related | none")
  existing_task_id string?
  suggestion string @description("skip | merge | create_anyway")
  reasoning string
}

function CheckDuplicate(
  new_task_title: string,
  new_task_note: string?,
  existing_tasks: string[]
) -> DuplicateCheck {
  client Claude
  prompt #"
    Determine if this new task is a duplicate of any existing task.

    New task:
    - Title: {{ new_task_title }}
    - Note: {{ new_task_note }}

    Existing tasks:
    {{ existing_tasks }}

    Consider:
    - Exact duplicates (same meaning, different wording)
    - Similar tasks (related but distinct)
    - Tasks that could be merged

    {{ ctx.output_format }}
  "#
}
```

### Task Suggestion Schema

```baml
enum SuggestionReason {
  OVERDUE @description("Task is past due date")
  DUE_SOON @description("Task due within threshold")
  QUICK_WIN @description("Short task that could be done now")
  CONTEXT_MATCH @description("Matches current location/time/energy")
  BLOCKED_CLEARED @description("Previously blocked task now available")
  PATTERN_MATCH @description("User typically does this task at this time")
}

class TaskSuggestion {
  task_id string
  reason SuggestionReason
  score float @description("0-1 relevance score")
  explanation string
}

function SuggestNextTasks(
  available_tasks: string[],
  current_context: string,
  user_patterns: string[],
  limit: int
) -> TaskSuggestion[] {
  client Claude
  prompt #"
    Suggest the best tasks to work on right now.

    Available tasks:
    {{ available_tasks }}

    Current context:
    {{ current_context }}

    User patterns (when they typically do certain tasks):
    {{ user_patterns }}

    Return up to {{ limit }} suggestions, prioritizing:
    1. Overdue tasks
    2. Tasks due soon
    3. Quick wins (< 15 min)
    4. Context matches
    5. Pattern matches

    {{ ctx.output_format }}
  "#
}
```

## Claude Agent SDK for Workflows

The Claude Agent SDK enables building AI agents that can use tools, manage sessions, and execute complex workflows.

### Core Concepts

**Tools**: Define callable functions the agent can use
```python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool("search_tasks", "Search for tasks by query", {"query": str, "limit": int})
async def search_tasks(args):
    results = await task_db.search(args["query"], limit=args["limit"])
    return {
        "content": [{"type": "text", "text": json.dumps(results)}]
    }
```

**MCP Servers**: Group tools into logical servers
```python
task_tools = create_sdk_mcp_server(
    name="task-manager",
    version="1.0.0",
    tools=[search_tasks, create_task, complete_task, update_task]
)
```

**Agent Options**: Configure agent behavior
```python
from claude_agent_sdk import ClaudeAgentOptions

options = ClaudeAgentOptions(
    mcp_servers={"tasks": task_tools},
    allowed_tools=[
        "mcp__tasks__search_tasks",
        "mcp__tasks__create_task",
    ],
    max_turns=10
)
```

### Task Management Agent Tools

```python
from claude_agent_sdk import tool, create_sdk_mcp_server
from typing import Any
import json

# Search tasks
@tool("search_tasks", "Search tasks by text query", {
    "query": str,
    "include_completed": bool,
    "limit": int
})
async def search_tasks(args: dict[str, Any]) -> dict[str, Any]:
    results = await db.search_tasks(
        query=args["query"],
        include_completed=args.get("include_completed", False),
        limit=args.get("limit", 10)
    )
    return {"content": [{"type": "text", "text": json.dumps(results)}]}

# Create task
@tool("create_task", "Create a new task", {
    "title": str,
    "project_id": str,
    "due_date": str,
    "tags": list,
    "note": str
})
async def create_task(args: dict[str, Any]) -> dict[str, Any]:
    task = await db.create_task(**args)
    return {"content": [{"type": "text", "text": f"Created task: {task.id}"}]}

# Complete task
@tool("complete_task", "Mark a task as completed", {"task_id": str})
async def complete_task(args: dict[str, Any]) -> dict[str, Any]:
    await db.complete_task(args["task_id"])
    return {"content": [{"type": "text", "text": f"Completed task: {args['task_id']}"}]}

# Get suggestions
@tool("get_suggestions", "Get AI-powered task suggestions", {
    "context": str,
    "limit": int
})
async def get_suggestions(args: dict[str, Any]) -> dict[str, Any]:
    suggestions = await ai.suggest_tasks(
        context=args["context"],
        limit=args.get("limit", 5)
    )
    return {"content": [{"type": "text", "text": json.dumps(suggestions)}]}

# Create MCP server
task_agent_server = create_sdk_mcp_server(
    name="task-agent",
    version="1.0.0",
    tools=[search_tasks, create_task, complete_task, get_suggestions]
)
```

### Conversational Task Interface

```python
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions
import asyncio

async def chat_with_tasks(user_message: str):
    options = ClaudeAgentOptions(
        mcp_servers={"tasks": task_agent_server},
        allowed_tools=[
            "mcp__tasks__search_tasks",
            "mcp__tasks__create_task",
            "mcp__tasks__complete_task",
            "mcp__tasks__get_suggestions",
        ],
        system_prompt="""You are a helpful task management assistant.
        Help users manage their tasks by:
        - Creating tasks from natural language
        - Finding and completing tasks
        - Suggesting what to work on next

        Always confirm before creating or completing tasks."""
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query(user_message)

        async for msg in client.receive_response():
            if hasattr(msg, 'result'):
                return msg.result
```

### Workflow Example: Daily Review

```python
async def daily_review_workflow():
    """Agent-driven daily review process."""

    options = ClaudeAgentOptions(
        mcp_servers={"tasks": task_agent_server},
        system_prompt="""Conduct a daily review:
        1. Show overdue tasks
        2. Show tasks due today
        3. Identify stalled projects
        4. Suggest priorities for today
        """
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("Run my daily review")

        results = []
        async for msg in client.receive_response():
            if hasattr(msg, 'result'):
                results.append(msg.result)

        return results
```

## Integration Architecture

### Capture Flow with BAML

```
User Input (text/voice)
         ↓
┌─────────────────────────┐
│ BAML: ExtractTaskIntent │
│   - Parse dates         │
│   - Match tags/projects │
│   - Detect subtasks     │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│ BAML: CheckDuplicate    │
│   - Compare to existing │
│   - Suggest action      │
└──────────┬──────────────┘
           ↓
     Confirmation UI
           ↓
     Create Task(s)
```

### Agent Workflow with Claude SDK

```
User Query ("What should I do next?")
         ↓
┌─────────────────────────┐
│ Claude Agent SDK        │
│   - Understands intent  │
│   - Calls tools:        │
│     • search_tasks      │
│     • get_suggestions   │
│   - Formats response    │
└──────────┬──────────────┘
           ↓
     Natural Language Response
     + Structured Suggestions
```

### Combined Architecture

```
┌────────────────────────────────────────────────────────┐
│                    API Layer                           │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────┐    ┌──────────────────────────────┐ │
│  │    BAML      │    │    Claude Agent SDK          │ │
│  │              │    │                              │ │
│  │ • Extraction │    │ • Conversational interface   │ │
│  │ • Validation │    │ • Multi-step workflows       │ │
│  │ • Parsing    │    │ • Tool orchestration         │ │
│  └──────┬───────┘    └──────────────┬───────────────┘ │
│         │                           │                  │
│         └─────────────┬─────────────┘                  │
│                       │                                │
│              ┌────────▼────────┐                       │
│              │   Task Database │                       │
│              │   (API-first)   │                       │
│              └─────────────────┘                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Best Practices

### BAML Best Practices

1. **Be specific in prompts**: Include examples and edge cases
2. **Use @description**: Add context for enum values and fields
3. **Set confidence thresholds**: Don't auto-accept low confidence extractions
4. **Handle errors gracefully**: BAML retries on parse failure
5. **Version your schemas**: Breaking changes need migration

### Claude Agent SDK Best Practices

1. **Limit tool scope**: Only expose necessary tools
2. **Set max_turns**: Prevent runaway agent loops
3. **Use system prompts**: Guide agent behavior clearly
4. **Validate tool inputs**: Don't trust agent-provided args blindly
5. **Log tool calls**: Audit trail for debugging

## Sources

- [BAML Documentation](https://docs.boundaryml.com/home)
- [BAML GitHub](https://github.com/BoundaryML/baml)
- [Structured Output Comparison](https://boundaryml.com/blog/structured-output-from-llms)
- [Claude Agent SDK Docs](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk)
- [BAML vs Instructor](https://dev.to/rosgluk/baml-vs-instructor-structured-llm-outputs-2p2b)
