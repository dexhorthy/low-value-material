# AI-Powered Capture Specification

This specification extends `specs/inbox.md` with AI-native capture and processing capabilities. The goal is frictionless task ingestion from any input modality, with intelligent extraction of structured data.

## Overview

Traditional task capture requires manual field entry. AI-native capture inverts this:
1. User provides unstructured input (text, voice, clipboard, URL)
2. System extracts structured task data via LLM
3. User confirms or adjusts before saving

This reduces capture friction from ~30 seconds to ~3 seconds while improving data quality.

## Input Modalities

### Text Input

Natural language text processed via LLM to extract task components:

```
Input: "Call mom tomorrow at 3pm about her birthday party"

Extracted:
  title: "Call mom about her birthday party"
  due_date: [tomorrow 15:00]
  suggested_tags: ["@calls", "family"]
  confidence: 0.95
```

### Voice Input

Native speech-to-text with post-processing:

```
Voice: "Remind me to pick up the dry cleaning when I'm near downtown"

Transcription → LLM Processing:
  title: "Pick up dry cleaning"
  suggested_tags: ["@errands", "downtown"]
  location_trigger: "downtown area"
  confidence: 0.88
```

Voice processing pipeline:
1. Speech-to-text transcription
2. Intent detection and entity extraction
3. Confidence scoring
4. Confirmation UI (with edit capability)

### Clipboard/Share Sheet

Content-aware parsing for pasted or shared content:

| Content Type | Extraction |
|--------------|------------|
| Email | Subject → title, sender → tag, dates → due/defer |
| URL | Page title → title, domain → tag, article content → note |
| Calendar invite | Event → title, time → due_date, attendees → tags |
| Image | OCR → title/note, object detection → tags |
| Plain text | NLP parsing → full task structure |

### Global Launcher (Desktop)

System-wide hotkey (configurable, default: `Cmd+Shift+Space` / `Ctrl+Shift+Space`):

```
┌─────────────────────────────────────────┐
│ 🎤 [                                  ] │
│     Type or speak to capture...         │
│                                         │
│  Recent: @work  @home  Project Alpha    │
└─────────────────────────────────────────┘
```

Launcher features:
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

## LLM Task Extraction

### What Gets Extracted

When processing user input, the system extracts:

**Core Task Information**
- Title: A clear, actionable task title
- Note: Additional details or context

**Date Information**
- Due date with original text ("tomorrow", "next Tuesday")
- Defer date if mentioned
- Confidence level for each date interpretation

**Organization Suggestions**
- Matching or new project suggestion
- Relevant tag suggestions (existing or new)
- Each with confidence scores

**Task Metadata**
- Estimated duration
- Urgency indicators
- Whether task is waiting on someone else

**Multi-Task Detection**
- If input contains multiple tasks, each is extracted separately

**Confidence & Clarification**
- Overall confidence score
- List of areas needing clarification

### Date/Time Parsing

The LLM handles complex temporal expressions:

| Input | Parsed |
|-------|--------|
| "tomorrow" | next calendar day |
| "next Tuesday" | next Tuesday (not today if Tuesday) |
| "in 3 days" | current date + 3 days |
| "end of month" | last day of current month |
| "after the meeting" | requires context (calendar lookup) |
| "before vacation" | requires context (calendar/project lookup) |
| "Q2" | April 1 - June 30 |
| "3pm" | today 15:00 if future, else tomorrow 15:00 |

Ambiguous dates trigger clarification:
```
Input: "meeting on the 15th"

Clarification: "Which month? November 15 or December 15?"
Options: [Nov 15] [Dec 15] [Other...]
```

### Project/Tag Matching

Fuzzy matching against existing entities:

```
Input: "Fix the login bug for acme project"

Project matching:
  - "Acme Corp Website" (0.85 confidence)
  - "Acme Mobile App" (0.72 confidence)

Tag matching:
  - "@bugs" (0.91 confidence)
  - "@development" (0.78 confidence)
```

Matching strategies:
1. Exact name match (highest confidence)
2. Fuzzy name match (high confidence)
3. Semantic similarity (medium confidence)
4. Historical assignment patterns (medium confidence)

### Multi-Task Detection

The LLM detects when input contains multiple tasks:

```
Input: "Need to buy groceries, call the dentist, and finish the report by Friday"

Extracted tasks:
  1. "Buy groceries" (tags: @errands)
  2. "Call the dentist" (tags: @calls)
  3. "Finish the report" (due: Friday)

UI prompt: "Create 3 separate tasks?"
```

### Context Enhancement

The system can pull additional context:

| Context Source | Enhancement |
|----------------|-------------|
| Calendar | "before my 2pm" → actual event time |
| Location | "at the store" → nearest matching location tag |
| Recent tasks | Similar task patterns suggest duration/project |
| Email thread | Extract relevant details for task note |
| URL content | Summarize linked content for note |

## Confirmation UI

AI extraction requires user confirmation to prevent errors:

### Quick Confirm (High Confidence)

When confidence > 0.9:
```
┌────────────────────────────────────────────┐
│ ✓ Call mom about her birthday party        │
│   📅 Tomorrow 3:00 PM                       │
│   🏷️ @calls, family                        │
│                                            │
│ [Create Task]  [Edit...]  [Cancel]         │
└────────────────────────────────────────────┘
```

### Detailed Review (Lower Confidence)

When confidence < 0.9 or clarification needed:
```
┌────────────────────────────────────────────┐
│ Title: [Call mom about her birthday party] │
│                                            │
│ Due:    [Tomorrow    ] [3:00 PM  ]         │
│ Defer:  [None        ]                     │
│ Project:[Inbox       ▼]                    │
│ Tags:   [@calls ×] [family ×] [+]         │
│                                            │
│ ⚠️ Uncertain: Is this the right time?      │
│                                            │
│ [Create Task]              [Cancel]        │
└────────────────────────────────────────────┘
```

### Batch Confirm (Multiple Tasks)

When multiple tasks detected:
```
┌────────────────────────────────────────────┐
│ Create 3 tasks?                            │
│                                            │
│ ☑ Buy groceries (@errands)                 │
│ ☑ Call the dentist (@calls)                │
│ ☑ Finish the report (due: Friday)          │
│                                            │
│ [Create All]  [Create Selected]  [Cancel]  │
└────────────────────────────────────────────┘
```

## Smart Duplicate Detection

Before creating a task, the system checks for potential duplicates and presents options to the user.

### Detection Methods
1. **Exact match**: Same title (case-insensitive)
2. **Fuzzy match**: High string similarity (>0.85)
3. **Semantic match**: LLM determines same intent
4. **Recent match**: Same task created in last 24h

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

## Capture Metadata

Each captured task retains metadata about how it was created:

- **Capture source**: How the task was input (text, voice, share, email, clipboard, API)
- **Original input**: The raw user input before processing
- **Extraction confidence**: How confident the AI was in its interpretation
- **User modifications**: Which fields the user changed from AI suggestions

## Learning from Corrections

The system improves over time by tracking when users modify AI suggestions:

- Fine-tunes project and tag matching based on corrections
- Improves date parsing for the user's vocabulary and patterns
- Learns the user's preferred task naming conventions

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Auto-suggest tags | On | Suggest tags based on task content |
| Auto-suggest project | On | Suggest project based on task content |
| Auto-extract dates | On | Extract dates from natural language |
| Confidence threshold | 90% | Threshold for auto-confirm (lower = more review) |
| Duplicate check | On | Check for duplicates before creating |
| Learn from corrections | On | Improve suggestions based on your edits |
| Voice capture | On | Enable voice input |
| Global hotkey | Cmd+Shift+Space | Desktop quick capture shortcut |

## Privacy Considerations

- Voice processing should prefer on-device when possible
- User can disable cloud-based AI extraction
- Original input stored for audit/correction learning
- No task content shared with third parties without consent
- Local-only mode available (reduced AI features)

## Edge Cases

### Empty Input
- Ignore empty submissions
- Prompt for input if launcher opened with no content

### Ambiguous Intent
- Ask clarifying questions
- Provide multiple interpretations to choose from
- Default to conservative interpretation

### Unsupported Language
- Fallback to basic text capture
- Store original for later processing
- Indicate limited AI support

### Network Unavailable
- Queue for later AI processing
- Allow basic capture without AI
- Process queued items when online

### Very Long Input
- Summarize for title
- Store full text in note
- Extract multiple tasks if appropriate

## Related Specifications

- `specs/inbox.md` - Base inbox and capture operations
- `specs/task.md` - Task data model
- `improved_specs/ai-suggestions.md` - AI task recommendations
- `improved_specs/mcp-integration.md` - Tool integration for capture

## Sources

Research informing this specification:
- [AI Task Managers 2025](https://monday.com/blog/task-management/ai-task-manager/)
- [LLM Intent Detection](https://medium.com/@jps.soares/using-llms-for-intent-detection-c378cd824962)
- [Intent Assistant Research](https://intentassistant.github.io/)
- [Large Action Models](https://www.exxactcorp.com/blog/deep-learning/large-action-models-llms-for-performing-tasks)
- [NLP Models 2025](https://lumenalta.com/insights/7-of-the-best-natural-language-processing-models-in-2025)
