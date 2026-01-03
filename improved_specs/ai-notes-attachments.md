# AI-Enhanced Notes & Attachments Specification

This specification extends `specs/notes.md` and `specs/attachments.md` with AI-powered processing capabilities. The system transforms passive file storage into intelligent context extraction and task generation.

## Overview

Traditional attachments and notes are static storage. AI-native processing transforms them:
1. **Voice memos** transcribed and parsed for action items
2. **Images** analyzed via OCR and object detection
3. **Documents** summarized and key information extracted
4. **Rich notes** enhanced with smart formatting and linking

This turns every attachment into actionable intelligence rather than passive reference.

## Voice Memo Processing

### Capture Flow

When a user records a voice memo:

```
Record voice → Transcribe → Extract structure → Generate tasks

Example:
Voice: "Okay so after the meeting with Sarah we need to follow up
        on the budget proposal by Friday. Also remind me to book
        the conference room for next Tuesday's presentation."

Extracted:
1. Task: "Follow up on budget proposal with Sarah"
   Due: Friday
   Tags: @meetings, @sarah

2. Task: "Book conference room for presentation"
   Due: Next Tuesday
   Tags: @admin, @meetings
```

### Transcription Processing

Voice recordings go through a multi-stage pipeline:

**Stage 1: Speech-to-Text**
- On-device transcription when possible (privacy, speed)
- Cloud transcription for accuracy when needed
- Support for multiple languages
- Speaker diarization (identify different speakers)

**Stage 2: Content Analysis**
- Identify action items ("need to", "should", "remind me")
- Extract dates and times (relative and absolute)
- Detect people mentioned
- Identify locations
- Flag questions vs decisions vs tasks

**Stage 3: Structure Generation**
- Create task suggestions from action items
- Generate summary for note field
- Suggest tags based on content
- Link to related existing tasks/projects

### Voice Memo UI

```
┌────────────────────────────────────────────────────┐
│ 🎙️ Voice Memo (2:34)                    [▶️ Play] │
├────────────────────────────────────────────────────┤
│                                                     │
│ Transcript:                                         │
│ "After the meeting with Sarah we need to follow    │
│ up on the budget proposal by Friday. Also remind   │
│ me to book the conference room for next Tuesday's  │
│ presentation."                                      │
│                                                     │
│ ────────────────────────────────────────────────   │
│                                                     │
│ Detected action items:                              │
│ ☑ Follow up on budget proposal (due: Friday)       │
│ ☑ Book conference room (due: Tuesday)              │
│                                                     │
│ [Create 2 Tasks]  [Edit]  [Keep as Note Only]      │
└────────────────────────────────────────────────────┘
```

### Voice Memo Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Auto-transcribe | On | Transcribe voice memos automatically |
| Extract action items | On | Detect and suggest tasks from voice |
| On-device processing | Preferred | Use on-device when possible |
| Keep original audio | On | Store audio file alongside transcript |
| Speaker labels | On | Identify different speakers |

## Image & Document OCR

### Supported Content Types

| Type | Processing | Example Use Cases |
|------|------------|-------------------|
| Screenshots | OCR + UI element detection | Capture error messages, settings |
| Photos of whiteboards | OCR + diagram extraction | Meeting notes, brainstorming |
| Business cards | Contact extraction | Add contact as task reference |
| Receipts | Amount + vendor extraction | Expense tracking tasks |
| Handwritten notes | Handwriting OCR | Digitize paper notes |
| PDFs | Full-text + structure extraction | Reference documents |
| Scanned documents | OCR + layout analysis | Legal, medical, forms |

### OCR Processing Pipeline

```
Image input → Pre-processing → OCR → Post-processing → Extraction

Pre-processing:
- Rotation correction
- Contrast enhancement
- Noise reduction
- Deskewing

OCR:
- Text extraction
- Confidence scoring
- Language detection

Post-processing:
- Spell correction
- Layout reconstruction
- Entity extraction (dates, names, amounts)
```

### Extraction Results

When processing an image attachment, the system extracts:

**Text Content**
- Full extracted text
- Confidence score per block
- Language detected

**Structured Data**
- Dates found (meetings, deadlines)
- Names/contacts mentioned
- Amounts/currencies
- URLs and email addresses
- Phone numbers

**Task Suggestions**
- Action items detected in text
- Deadlines found
- Related existing tasks

### Image Processing UI

```
┌────────────────────────────────────────────────────┐
│ 📷 whiteboard-notes.jpg                            │
├────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐   │
│ │         [Image Preview]                      │   │
│ │                                              │   │
│ └──────────────────────────────────────────────┘   │
│                                                     │
│ Extracted text:                                     │
│ "Q4 Goals                                          │
│  - Launch mobile app by Dec 15                     │
│  - Hire 2 engineers                                │
│  - Customer interviews (10 min)"                   │
│                                                     │
│ Detected items:                                     │
│ ☑ Launch mobile app (due: Dec 15)                  │
│ ☑ Hire 2 engineers                                 │
│ ☑ Customer interviews (est: 10 min each)           │
│                                                     │
│ [Create Tasks]  [Add to Note]  [Dismiss]           │
└────────────────────────────────────────────────────┘
```

### Document Summarization

For longer documents (PDFs, Word docs), the system provides:

**Summary Generation**
- Key points extracted
- Main themes identified
- Action items highlighted
- Length: ~10% of original or configurable

**Example:**
```
Attached: quarterly-report.pdf (24 pages)

Summary (auto-generated):
Q3 revenue grew 15% YoY. Key highlights:
• Mobile app downloads exceeded target by 20%
• Customer churn reduced to 4.2%
• Three new enterprise deals closed

Action items mentioned:
• Board presentation scheduled for Oct 15
• Budget review needed by Oct 20
• Hiring plan due to HR by Oct 25
```

## Smart Note Enhancement

### Auto-Formatting

When pasting content into notes, the system intelligently formats:

| Input | Auto-Format |
|-------|-------------|
| URLs | Clickable links with page titles fetched |
| Email addresses | Mailto links |
| Phone numbers | Callable links (mobile) |
| Dates | Linked to calendar, highlight relative dates |
| Task references | Links to related tasks |
| Code snippets | Syntax highlighting |
| Lists | Proper bullet/numbered formatting |

### Context Extraction from Notes

The system continuously analyzes note content for:

**Embedded Dates**
- "Meeting on Tuesday at 3pm" → suggest due/defer date
- "Before the end of Q4" → flag deadline

**People & Contacts**
- Names mentioned → suggest @person tags
- Email addresses → extract for reference

**Related Content**
- Links to similar tasks
- Project connections
- Tag suggestions

### Note Templates

AI-powered templates that auto-populate:

**Meeting Notes Template**
```
Meeting: [Auto-filled from calendar]
Date: [Current date]
Attendees: [From calendar invite]

Agenda:
• [Extracted from invite]

Notes:
[Cursor here]

Action Items:
• [Auto-extracted as you type]
```

**Research Template**
```
Topic: [Extracted from task title]
Sources:
• [Auto-formatted links]

Key Findings:
[Cursor here]

Next Steps:
• [Auto-extracted]
```

## Attachment Intelligence

### Automatic Categorization

Attachments are auto-categorized based on content:

| Category | Detection Method | Auto-Tags |
|----------|------------------|-----------|
| Receipt/Invoice | Amount + vendor detection | @expenses, @finance |
| Meeting notes | Date + attendee patterns | @meetings |
| Screenshot | UI element detection | @reference |
| Code | Syntax detection | @development |
| Design | Image analysis | @design |
| Document | File type + content | @documents |

### Duplicate Detection

Before attaching, check for duplicates:
- Same file hash → warn about exact duplicate
- Similar content → suggest linking to existing
- Same filename → offer to update existing

```
┌────────────────────────────────────────────────────┐
│ ⚠️ Similar attachment exists                       │
├────────────────────────────────────────────────────┤
│                                                     │
│ Existing: quarterly-report-v2.pdf                  │
│   Attached to: "Review Q3 financials"              │
│   Added: 3 days ago                                │
│                                                     │
│ New: quarterly-report-final.pdf                    │
│   Content similarity: 85%                          │
│                                                     │
│ [Attach as New] [Update Existing] [Link to Both]   │
└────────────────────────────────────────────────────┘
```

### Cross-Attachment Search

All attachment content is searchable:
- OCR text from images
- Transcripts from voice memos
- Full text from documents
- Extracted entities (dates, names, amounts)

Search example:
```
Search: "budget proposal sarah"

Results:
1. Voice memo (yesterday) - mentions "budget proposal with Sarah"
2. whiteboard.jpg - contains text "Sarah's budget items"
3. proposal-v2.pdf - document about budget, author: Sarah
```

## Task Generation from Attachments

### Automatic Task Detection

The system identifies task-like content in attachments:

**Detection Signals**
- Action verbs: "need to", "should", "must", "will"
- Deadline language: "by Friday", "due next week"
- Assignment language: "John will", "team needs to"
- Question format: "Can we...?", "Should we...?"

### Batch Task Creation

When multiple action items detected:

```
┌────────────────────────────────────────────────────┐
│ 📄 meeting-notes.pdf                               │
├────────────────────────────────────────────────────┤
│                                                     │
│ 5 action items detected:                           │
│                                                     │
│ ☑ Send revised proposal to client (due: Mon)       │
│   → Assign to: Me                                  │
│                                                     │
│ ☑ Schedule follow-up call                          │
│   → Assign to: Me                                  │
│                                                     │
│ ☐ Update project timeline                          │
│   → Assign to: Team (skip)                         │
│                                                     │
│ ☑ Review competitor analysis                       │
│   → Assign to: Me                                  │
│                                                     │
│ ☑ Prepare demo environment (due: Wed)              │
│   → Assign to: Me                                  │
│                                                     │
│ [Create 4 Tasks]  [Edit Selection]  [Skip All]     │
└────────────────────────────────────────────────────┘
```

### Attachment-Task Linking

Created tasks maintain bidirectional links to source:
- Task shows "Created from: meeting-notes.pdf"
- Attachment shows "Tasks created: 4"
- Clicking navigates between them

## Privacy & Processing Options

### Processing Modes

| Mode | Description | Trade-offs |
|------|-------------|------------|
| Local Only | All processing on-device | Slower, less accurate |
| Hybrid | OCR local, LLM cloud | Balance of speed/privacy |
| Cloud | Full cloud processing | Fastest, most accurate |
| Manual | No auto-processing | Full control, more work |

### Sensitive Content Handling

- Auto-detect potentially sensitive content (SSN, credit cards, etc.)
- Warn before cloud processing of sensitive attachments
- Option to exclude specific attachments from AI processing
- Redaction tools for sensitive information

### Data Retention

| Data Type | Default Retention | User Control |
|-----------|-------------------|--------------|
| Original files | Permanent | Delete anytime |
| Transcripts | Permanent | Delete anytime |
| OCR text | Permanent | Delete with file |
| Processing logs | 30 days | Disable logging |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Auto-process attachments | On | Automatically analyze new attachments |
| OCR images | On | Extract text from images |
| Transcribe voice | On | Transcribe voice memos |
| Summarize documents | On | Generate summaries for long docs |
| Detect action items | On | Find and suggest tasks |
| Processing mode | Hybrid | Local, Hybrid, or Cloud |
| Keep originals | On | Store original files |
| Smart formatting | On | Auto-format pasted content |

## Platform Considerations

### Desktop
- Full processing capabilities
- Drag-drop from Finder/Explorer
- Quick Look preview integration
- Bulk attachment processing

### Mobile
- Camera capture with instant OCR
- Voice memo recording
- Document scanner built-in
- Share sheet integration
- Background processing

### Web
- Upload and process
- Preview and playback
- Limited offline processing

## Edge Cases

### Processing Failures

When AI processing fails:
- Store original unprocessed
- Queue for retry
- Allow manual processing trigger
- Show partial results if available

### Large Files

- Warn for files > 10 MB before cloud upload
- Offer local-only processing for very large files
- Progressive processing for long documents

### Unsupported Languages

- Detect language before processing
- Fall back to basic storage if unsupported
- Indicate processing limitations to user

### Handwriting Quality

- Confidence scores for handwriting OCR
- Allow user correction
- Learn from corrections over time

## Related Specifications

- `specs/attachments.md` - Base attachment storage
- `specs/notes.md` - Rich text notes
- `improved_specs/ai-capture.md` - Task capture with AI
- `improved_specs/mcp-integration.md` - External tool connections

## Sources

Research informing this specification:
- [Otter AI](https://otter.ai) - Meeting transcription and action items
- [Fireflies.ai](https://fireflies.ai/) - AI note-taking and task creation
- [ClickUp Brain](https://clickup.com/blog/ai-tools-for-note-taking/) - Voice-to-task and OCR
- [Mistral OCR](https://mistral.ai/news/mistral-ocr) - Document understanding AI
- [Google Document AI](https://cloud.google.com/document-ai) - Enterprise OCR and extraction
- [Voiset](https://www.voiset.io/task-manager) - Voice-based task management
- [Motion](https://www.usemotion.com/) - Meeting notes to tasks
