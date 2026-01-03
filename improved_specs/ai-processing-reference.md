# AI Processing Reference Specification

This document describes how the AI-native task management system processes and understands user input. It covers the mental model for how AI extracts, validates, and learns from user interactions.

## Overview

The system uses AI processing at several key points:
- **Task capture**: Extracting structured task data from natural language
- **Duplicate detection**: Identifying similar or identical existing tasks
- **Task suggestions**: Recommending what to work on next
- **Conversational interface**: Understanding and responding to user queries

## Task Capture Processing

### What Gets Extracted

When a user provides input (text, voice, shared content), the system extracts:

| Field | Description | Example |
|-------|-------------|---------|
| Title | Short, actionable task title | "Call mom about birthday party" |
| Note | Additional context | "She wants to discuss catering options" |
| Due date | When task should be done | "tomorrow 3pm" → specific date/time |
| Defer date | When to start showing task | "next week" → Monday |
| Project | Matched from existing projects | "Acme Website" (0.85 confidence) |
| Tags | Matched or suggested tags | @calls, @family |
| Duration | Estimated time to complete | 15 minutes |
| Urgency | Whether task is time-sensitive | true/false |
| Waiting | Whether blocked on someone | true if "waiting for John" |

### Confidence Scores

Each extracted field includes a confidence score (0-1):
- **High confidence (0.9+)**: System is very sure, can auto-apply
- **Medium confidence (0.7-0.9)**: Likely correct, user should confirm
- **Low confidence (<0.7)**: Uncertain, ask user to clarify

### Handling Ambiguity

When input is unclear, the system:
1. Provides best-guess interpretation
2. Lists what needs clarification
3. Offers alternative interpretations

**Example:**
```
Input: "meeting on the 15th"

Interpretation: Meeting on December 15
Clarification needed: Which month?
Alternatives: [November 15] [December 15] [January 15]
```

## Duplicate Detection

Before creating a task, the system checks for potential duplicates.

### Match Types

| Type | Description | Example |
|------|-------------|---------|
| Exact | Same meaning, possibly different wording | "Call mom" vs "Phone mom" |
| Similar | Related but distinct tasks | "Call mom about party" vs "Call mom about gift" |
| Related | Connected but clearly different | "Plan party" vs "Buy party supplies" |

### User Options

When a potential duplicate is found, user can:
- **Update existing**: Add new info to the existing task
- **Create anyway**: Make a new task despite similarity
- **Skip**: Don't create the task

## Task Suggestions

### Why Tasks Are Suggested

Each suggestion includes an explanation:

**Urgency Reasons**
- Overdue: Past due date
- Due soon: Deadline approaching
- At risk: Not enough time to complete before deadline

**Context Reasons**
- Location match: You're near the tagged location
- Time fit: Task duration fits available time
- Energy match: Task complexity matches your energy level

**Pattern Reasons**
- Typical time: You usually do this type of task now
- Routine: Part of your regular workflow

**Productivity Reasons**
- Quick win: Can be completed quickly
- Unblocks others: Enables dependent tasks
- Momentum: Keeps project moving

### Scoring Factors

Tasks are ranked by combining:
- Urgency (deadlines, overdue status)
- Context match (time, location, energy)
- User patterns (when you typically do things)
- Effort fit (task duration vs available time)
- Dependencies (what unblocks other work)

## Conversational Interface

### Understanding User Queries

The system interprets natural language queries:

| Query | Understanding |
|-------|---------------|
| "What's overdue?" | Find tasks past due date |
| "Tasks for Acme project" | Filter by project |
| "Quick tasks I can do now" | Available + short duration |
| "What should I work on?" | Get AI suggestions |

### Maintaining Context

In multi-turn conversations, the system tracks:
- Current topic being discussed
- Active filters from previous queries
- References like "it", "them", "those"
- Last mentioned project or tag

This allows natural follow-ups like "just the urgent ones" without repeating context.

## Learning and Improvement

The system improves over time by tracking:

### From Corrections
- When users modify extracted data, the system learns preferences
- Tag suggestions adjust based on which ones you accept or dismiss
- Date parsing improves based on your vocabulary

### From Patterns
- When you typically do certain types of tasks
- How long tasks actually take vs estimates
- Which projects and tags you use together

### Privacy Controls

Users can:
- Disable pattern learning entirely
- Clear learned patterns
- See what the system has learned
- Opt out of cloud processing for on-device only

## Processing Flow

### Capture Flow

```
User Input (text/voice/share)
         ↓
    AI Extraction
    (title, dates, tags, etc.)
         ↓
    Duplicate Check
         ↓
    User Confirmation
         ↓
    Create Task
```

### Suggestion Flow

```
User asks "What's next?"
         ↓
    Gather Context
    (time, location, calendar, energy)
         ↓
    Score Available Tasks
         ↓
    Apply Diversity Rules
         ↓
    Present Top Suggestions
```

## Related Specifications

- `improved_specs/ai-capture.md` - Task capture details
- `improved_specs/ai-suggestions.md` - Suggestion system
- `improved_specs/ai-search.md` - Search and queries

## Sources

- [BAML Documentation](https://docs.boundaryml.com/home)
- [Structured Output from LLMs](https://boundaryml.com/blog/structured-output-from-llms)
- [Claude Agent SDK](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk)
