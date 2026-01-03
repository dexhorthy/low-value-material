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
1. Native STT (Whisper, system APIs)
2. LLM intent detection and entity extraction
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

### Extraction Schema

The LLM extracts a structured `CaptureIntent` object:

```typescript
interface CaptureIntent {
  // Core fields
  title: string;
  note?: string;

  // Date extraction
  due_date?: {
    value: DateTime;
    confidence: number;
    original_text: string;  // "tomorrow", "next Tuesday"
  };
  defer_date?: {
    value: DateTime;
    confidence: number;
    original_text: string;
  };

  // Organization suggestions
  suggested_project?: {
    id?: UUID;           // Existing project match
    name?: string;       // New project suggestion
    confidence: number;
  };
  suggested_tags?: Array<{
    id?: UUID;           // Existing tag match
    name?: string;       // New tag suggestion
    confidence: number;
  }>;

  // Duration estimation
  estimated_duration?: {
    value: Duration;
    confidence: number;
  };

  // Flags
  is_urgent?: boolean;
  is_waiting_for?: boolean;

  // Multi-task detection
  subtasks?: CaptureIntent[];

  // Overall confidence
  confidence: number;
  requires_clarification?: string[];
}
```

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
1. Exact name match (confidence: 1.0)
2. Fuzzy name match (confidence: 0.7-0.95)
3. Semantic similarity (confidence: 0.5-0.8)
4. Historical assignment patterns (confidence: 0.6-0.9)

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

Before creating, check for potential duplicates:

```typescript
interface DuplicateCheck {
  existing_task: Task;
  similarity_score: number;  // 0-1
  match_type: "exact" | "similar" | "related";
  suggestion: "skip" | "merge" | "create_anyway";
}
```

Detection methods:
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

## Data Model Extensions

### Capture Metadata

New fields on Task:

```typescript
interface CaptureMetadata {
  capture_source: "text" | "voice" | "share" | "email" | "clipboard" | "api";
  original_input: string;
  ai_extracted: boolean;
  extraction_confidence: number;
  user_modified_fields: string[];  // Fields user changed from AI suggestion
}
```

### Learning from Corrections

Track when users modify AI suggestions to improve future extraction:

```typescript
interface CaptureCorrection {
  capture_id: UUID;
  field: string;
  ai_suggested: any;
  user_selected: any;
  timestamp: DateTime;
}
```

Use corrections to:
- Fine-tune project/tag matching
- Improve date parsing for user's vocabulary
- Learn user's task naming patterns

## API Endpoints

### Parse Intent

```
POST /api/capture/parse
{
  "input": "Call mom tomorrow at 3pm",
  "input_type": "text",
  "context": {
    "current_location": { "lat": 37.7, "lng": -122.4 },
    "current_time": "2025-01-03T10:00:00Z",
    "recent_projects": ["uuid1", "uuid2"]
  }
}

Response:
{
  "intent": CaptureIntent,
  "alternatives": CaptureIntent[],  // Other interpretations
  "duplicates": DuplicateCheck[]
}
```

### Create from Intent

```
POST /api/capture/create
{
  "intent": CaptureIntent,
  "confirmed_fields": ["title", "due_date"],
  "modified_fields": {
    "project_id": "uuid-123"
  }
}

Response:
{
  "task": Task,
  "created_subtasks": Task[]
}
```

### Transcribe Voice

```
POST /api/capture/transcribe
{
  "audio": base64_encoded_audio,
  "format": "wav",
  "language": "en"
}

Response:
{
  "transcription": "Call mom tomorrow at 3pm",
  "confidence": 0.97,
  "alternatives": ["Call mom tomorrow at 3:00 PM"]
}
```

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `capture.auto_tag` | Boolean | true | Auto-suggest tags based on content |
| `capture.auto_project` | Boolean | true | Auto-suggest project based on content |
| `capture.auto_date` | Boolean | true | Extract dates from natural language |
| `capture.confidence_threshold` | Float | 0.9 | Threshold for auto-confirm |
| `capture.duplicate_check` | Boolean | true | Check for duplicates before create |
| `capture.learn_from_corrections` | Boolean | true | Improve AI from user corrections |
| `capture.voice_enabled` | Boolean | true | Enable voice capture |
| `capture.global_hotkey` | KeyCombo | Cmd+Shift+Space | Desktop launcher shortcut |

## Performance Requirements

| Operation | Target Latency | Notes |
|-----------|---------------|-------|
| Text parsing | < 500ms | Local preprocessing + API call |
| Voice transcription | < 1s | Streaming preferred |
| Project/tag matching | < 100ms | Local fuzzy match |
| Duplicate detection | < 200ms | Local + semantic |
| Full capture flow | < 2s | End-to-end with confirmation |

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
