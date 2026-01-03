# AI-Powered Capture Specification

This specification extends `specs/inbox.md` with AI-native capture and processing capabilities. The goal is frictionless task ingestion from any input modality, with intelligent extraction of structured data.

## Overview

Traditional task capture requires manual field entry. AI-native capture inverts this:
1. User provides unstructured input (text, voice, clipboard, URL)
2. System intelligently extracts and structures task data
3. User confirms or adjusts before saving

This reduces capture friction while improving data quality.

## Input Modalities

### Text Input

Type or paste natural language text to capture a task:

```
Input: "Call mom tomorrow at 3pm about her birthday party"

Extracted:
  title: "Call mom about her birthday party"
  due_date: [tomorrow 15:00]
  suggested_tags: ["@calls", "family"]
```

### Voice Input

Speak naturally to capture a task. The system understands context clues:

```
Voice: "Remind me to pick up the dry cleaning when I'm near downtown"

Extracted:
  title: "Pick up dry cleaning"
  suggested_tags: ["@errands", "downtown"]
  location_trigger: "downtown area"
```

The user can review and edit the extracted information before saving.

### Clipboard/Share Sheet

When you paste or share content, the system intelligently extracts task information:

| Content Type | Extracted As |
|--------------|------------|
| Email | Title from subject, tags from sender, due dates from content |
| URL | Title from page, tags from domain, details from content |
| Calendar invite | Title from event, due date from time, tags from attendees |
| Text or image | Title and details extracted from content |

### Global Launcher (Desktop)

A system-wide hotkey opens a floating capture interface with:
- Single-line input with AI expansion
- Voice input toggle
- Recent tags/projects for quick assignment
- Keyboard-navigable suggestions
- Escape to dismiss, Enter to capture

### Mobile Quick Capture

- Widget for home screen
- Share sheet extension
- Notification reply action
- Siri/Assistant integration
- Lock screen quick capture (iOS 18+)

## What Gets Extracted

When processing user input, the system extracts and suggests:

**Core Task Information**
- Title: A clear, actionable task title
- Note: Additional details or context

**Date Information**
- Due date from natural language ("tomorrow", "next Tuesday")
- Defer date if mentioned

**Organization**
- Matching project suggestion
- Relevant tag suggestions

**Task Metadata**
- Estimated duration
- Whether task is waiting on someone else

### Understanding Date References

The system understands natural date language:

| Input | Interpreted As |
|-------|--------|
| "tomorrow" | next calendar day |
| "next Tuesday" | next Tuesday |
| "in 3 days" | 3 days from now |
| "end of month" | last day of current month |
| "Q2" | April 1 - June 30 |
| "3pm" | today at 3pm, or tomorrow if in the past |

When ambiguous, the system asks:
```
Input: "meeting on the 15th"

Which month? November 15 or December 15?
[Nov 15] [Dec 15] [Other...]
```

### Project and Tag Suggestions

The system suggests matching projects and tags based on your input:

```
Input: "Fix the login bug for acme project"

Project suggestions:
  - "Acme Corp Website"
  - "Acme Mobile App"

Tag suggestions:
  - "@bugs"
  - "@development"
```

The system shows the most likely matches so you can select or correct them.

### Multiple Tasks

When your input contains multiple tasks, the system separates them:

```
Input: "Need to buy groceries, call the dentist, and finish the report by Friday"

Extracted tasks:
  1. "Buy groceries" (tags: @errands)
  2. "Call the dentist" (tags: @calls)
  3. "Finish the report" (due: Friday)

Prompt: "Create 3 separate tasks?"
```

### Context Enhancement

When you reference calendar events, locations, recent tasks, or external content (emails, URLs), the system can use that context to improve extraction. For example:
- "before my 2pm meeting" automatically extracts the actual meeting time
- "at the store" can match to location-tagged contexts
- Similar past tasks inform duration and project suggestions

## Confirmation UI

AI extraction requires user confirmation to prevent errors:

### Quick Confirm

When the extraction is clear and accurate, the user sees a summary of the extracted task (title, due date, tags) with options to create the task, edit details, or cancel.

### Detailed Review

When you need to verify or adjust extracted information, a form view allows editing:
- Title and note
- Due date and defer date
- Project assignment
- Tag assignment
- Uncertainty warnings when extraction confidence is low

### Batch Confirm

When multiple tasks are detected in a single input, the user can select which tasks to create, edit them individually, or create all at once.

## Smart Duplicate Detection

Before creating a task, the system checks for potential duplicates and presents options to the user. When a similar task is found, you can decide to update the existing task or create a new one.

UI for duplicates:
```
┌────────────────────────────────────────────┐
│ ⚠️ Similar task exists:                    │
│                                            │
│ Existing: "Call mom" (created yesterday)   │
│ New:      "Call mom about birthday"        │
│                                            │
│ [Update Existing]  [Create New]  [Cancel]  │
└────────────────────────────────────────────┘
```


## Improving Over Time

As you capture tasks and make adjustments, the system learns your preferences:

- Better project and tag suggestions
- Improved understanding of your date language and patterns
- Understanding of how you prefer to name tasks

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Auto-suggest tags | On | Suggest tags based on task content |
| Auto-suggest project | On | Suggest project based on task content |
| Auto-extract dates | On | Extract dates from natural language |
| Duplicate check | On | Check for duplicates before creating |
| Learn from corrections | On | Improve suggestions based on your edits |
| Voice capture | On | Enable voice input |
| Global hotkey | Cmd+Shift+Space | Desktop quick capture shortcut |

## Privacy & Security

- You control how your task data is handled
- Task content isn't shared with third parties without your consent
- You can view and control what data is being used for suggestions
- A privacy-focused mode is available if you prefer local-only processing

## Related Specifications

- `specs/inbox.md` - Base inbox and capture operations
- `specs/task.md` - Task data model
- `improved_specs/ai-suggestions.md` - AI task recommendations
- `improved_specs/mcp-integration.md` - Tool integration for capture
