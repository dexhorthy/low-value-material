# Specifications Improvement Plan

This document tracks the translation of base specs into AI-native enhanced specifications for "low-value-material" - an OmniFocus clone that is fully AI native.

## Core Platform Principles

- **Native apps**: Desktop (with global launcher hotkey) and mobile
- **API-first**: Data stored behind an API, syncs anywhere
- **Modern database**: No archive mechanism needed - use a real database
- **MCP/Tool integration**: Tasks can connect to external tools via MCP

## Improvement Priority Queue

### Priority 0: RESEARCH BAML FOR AI PROCESSING
**Status**: COMPLETED

See `improved_specs/ai-processing-reference.md` for:
- BAML structured extraction patterns for task capture
- Claude Agent SDK tool definitions for task management
- Integration architecture combining both approaches

### Priority 1: AI-Powered Capture & Processing (HIGH)
**Status**: COMPLETED
**Base Specs**: inbox.md, task.md

See `improved_specs/ai-capture.md` for full specification.

AI enhancements:
- [x] Natural language task parsing ("Call mom tomorrow at 3pm" -> task with due date)
- [x] Voice-to-task with intent detection
- [x] Auto-suggestion of project/tag assignment based on content
- [x] Smart duplicate detection
- [x] Context extraction from pasted content (emails, URLs, etc.)
- [x] Global launcher hotkey integration for desktop
- [x] Mobile share sheet with AI processing

### Priority 2: Intelligent Task Suggestions (HIGH)
**Status**: COMPLETED
**Base Specs**: task.md, availability.md, perspectives.md

See `improved_specs/ai-suggestions.md` for full specification.

AI enhancements:
- [x] "What should I work on next?" recommendations
- [x] Energy/time-based task suggestions
- [x] Context-aware suggestions (location, calendar, time of day)
- [x] Proactive task surfacing based on patterns
- [x] Deadline risk assessment and warnings

### Priority 3: Smart Project & Task Organization (MEDIUM)
**Status**: COMPLETED
**Base Specs**: project.md, folder.md, tag.md

See `improved_specs/ai-organization.md` for full specification.

AI enhancements:
- [x] Auto-project creation from task clusters
- [x] Tag suggestions based on content analysis
- [x] Project template recommendations
- [x] Automatic task breakdown suggestions
- [x] Related task discovery

### Priority 4: AI-Assisted Review Process (MEDIUM)
**Status**: COMPLETED
**Base Specs**: project.md (review system)

See `improved_specs/ai-review.md` for full specification.

AI enhancements:
- [x] Smart review prioritization
- [x] Stalled project detection with suggested actions
- [x] "Zombie" task identification (old, untouched)
- [x] Project health scoring
- [x] Automated cleanup suggestions

### Priority 5: MCP/Tool Integration Layer (MEDIUM)
**Status**: COMPLETED
**Base Specs**: task.md (operations)

See `improved_specs/mcp-integration.md` for full specification.

AI enhancements:
- [x] Task automation via connected tools
- [x] External data fetching for task context
- [x] Automated task creation from tool events
- [x] Progress tracking via tool integrations
- [x] Smart notifications via connected channels

### Priority 6: Predictive Scheduling (LOW)
**Status**: COMPLETED
**Base Specs**: due-dates.md, defer-dates.md, repeat.md

See `improved_specs/ai-scheduling.md` for full specification.

AI enhancements:
- [x] Duration estimation based on similar tasks
- [x] Optimal defer date suggestions
- [x] Repeat pattern detection from behavior
- [x] Calendar-aware scheduling
- [x] Workload balancing suggestions

### Priority 7: Natural Language Search & Queries (LOW)
**Status**: COMPLETED
**Base Specs**: search.md, perspectives.md, custom-perspectives.md

See `improved_specs/ai-search.md` for full specification.

AI enhancements:
- [x] Semantic search across all items
- [x] Natural language perspective creation
- [x] Conversational task queries
- [x] Smart filtering suggestions
- [x] Voice-to-perspective creation with progressive refinement
- [x] Proactive perspective suggestions based on behavior patterns

### Priority 8: AI-Enhanced Notes & Attachments (MEDIUM)
**Status**: COMPLETED
**Base Specs**: notes.md, attachments.md

See `improved_specs/ai-notes-attachments.md` for full specification.

AI enhancements:
- [x] Voice memo transcription with action item extraction
- [x] OCR for images, screenshots, whiteboards, handwritten notes
- [x] Document summarization and key point extraction
- [x] Automatic task generation from attachment content
- [x] Smart note formatting and context extraction
- [x] Cross-attachment search (OCR text, transcripts, documents)
- [x] Automatic categorization and tagging of attachments
- [x] Duplicate attachment detection
- [x] Bidirectional linking between tasks and source attachments

## Progress Log

| Date | Item | Status | Notes |
|------|------|--------|-------|
| 2026-01-03 | Priority 0: BAML/Agent SDK Research | COMPLETED | Created `ai-processing-reference.md` with BAML schemas and Claude Agent SDK patterns |
| 2026-01-03 | Priority 1: AI-Powered Capture | COMPLETED | Created `ai-capture.md` with NLP parsing, voice input, duplicate detection, global launcher |
| 2026-01-03 | Priority 2: Intelligent Task Suggestions | COMPLETED | Created `ai-suggestions.md` with scoring engine, context awareness, deadline risk, morning briefing |
| 2026-01-03 | Priority 3: Smart Organization | COMPLETED | Created `ai-organization.md` with auto-tagging, task breakdown, project clustering, templates, related tasks |
| 2026-01-03 | Priority 4: AI-Assisted Review | COMPLETED | Created `ai-review.md` with health scoring, zombie detection, stalled projects, cleanup suggestions |
| 2026-01-03 | Priority 5: MCP Integration | COMPLETED | Created `mcp-integration.md` with task automation, webhooks, context enrichment, progress tracking |
| 2026-01-03 | Priority 6: Predictive Scheduling | COMPLETED | Created `ai-scheduling.md` with duration estimation, timing suggestions, pattern detection, workload balancing |
| 2026-01-03 | Priority 7: NL Search & Queries | COMPLETED | Created `ai-search.md` with semantic search, NL perspective creation, conversational queries, smart filtering |
| 2026-01-03 | Wishlist: Voice-to-Perspective | COMPLETED | Added voice-to-perspective creation with progressive refinement to `ai-search.md` |
| 2026-01-03 | Wishlist: Proactive Perspectives | COMPLETED | Added proactive perspective suggestions based on behavior patterns to `ai-search.md` |
| 2026-01-03 | Wishlist: Auto-tag | ALREADY DONE | Already covered in `ai-organization.md` Auto-Tagging section |
| 2026-01-03 | Wishlist: Tag Cleanup | ALREADY DONE | Already covered in `ai-organization.md` Tag Lifecycle Management section |
| 2026-01-03 | Priority 8: AI Notes & Attachments | COMPLETED | Created `ai-notes-attachments.md` with voice transcription, OCR, document summarization, task extraction |

## Implementation Notes

### Global Launcher Hotkey (Desktop)
- System-wide keyboard shortcut to open quick capture
- Should support text and voice input
- AI processes input to extract structured task data
- Minimal UI - just capture and go

### Voice Input
- Native speech-to-text on mobile and desktop
- AI post-processing to extract intent, dates, projects
- Confirmation UI before task creation
- Background transcription support

### MCP Integration Architecture
Tasks can have an `mcp_connections` field:
```
mcp_connections: [{
  server_id: String,
  tool_name: String,
  config: Object,
  trigger: "on_complete" | "on_create" | "on_due" | "manual"
}]
```

This allows tasks to:
- Execute tools when completed
- Pull data from external sources
- Create tasks from external events
- Report progress to external systems


## Wishlist (maintained by project manager)

All wishlist items have been addressed:

- [x] **text-or-voice to perspective generator** - See `ai-search.md` Voice-to-Perspective Creation section
- [x] **auto-tag** - See `ai-organization.md` Auto-Tagging section
- [x] **recurring tag cleanup and re-organization** - See `ai-organization.md` Tag Lifecycle Management section
