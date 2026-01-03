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

### Priority 9: AI-Enhanced Notifications & Smart Alerts (MEDIUM)
**Status**: COMPLETED
**Base Specs**: notifications.md, location-tags.md

See `improved_specs/ai-notifications.md` for full specification.

AI enhancements:
- [x] Smart notification timing based on user engagement patterns
- [x] Context-aware delivery (respects meetings, focus states, DND)
- [x] Intelligent bundling with LLM-generated summaries
- [x] Predictive reminders before explicit due dates
- [x] Alert fatigue prevention with automatic throttling
- [x] Morning briefings and evening summaries
- [x] Cross-platform notification intelligence
- [x] Location-aware smart triggers with travel time prediction
- [x] Notification feedback loop for continuous improvement

### Priority 10: AI-Enhanced Batch Editing (MEDIUM)
**Status**: COMPLETED
**Base Specs**: batch-editing.md

See `improved_specs/ai-batch-editing.md` for full specification.

AI enhancements:
- [x] Smart selection - AI identifies items that should be edited together
- [x] Natural language batch commands ("Move these to Marketing, tag as urgent")
- [x] Intelligent grouping - automatic clustering of similar items
- [x] Proactive batch suggestions when editing patterns detected
- [x] AI-assisted inbox processing with guided batch workflows
- [x] Pattern learning from user batch editing behavior
- [x] Mixed value display with AI-suggested common operations

### Priority 11: AI-Powered Focus Mode (LOW)
**Status**: COMPLETED
**Base Specs**: focus-mode.md

See `improved_specs/ai-focus-mode.md` for full specification.

AI enhancements:
- [x] AI-suggested focus sessions based on task context
- [x] Automatic focus mode when detecting deep work needs
- [x] Smart focus scope recommendations
- [x] Integration with system Focus modes (work, personal)
- [x] Focus session analytics and optimization
- [x] Adaptive session duration based on patterns
- [x] Smart break scheduling and recommendations
- [x] Flow state detection and protection

### Priority 12: AI-Enhanced Forecast View (LOW)
**Status**: COMPLETED
**Base Specs**: forecast.md

See `improved_specs/ai-forecast.md` for full specification.

AI enhancements:
- [x] AI-powered day planning with workload optimization
- [x] Predictive scheduling based on task patterns
- [x] Smart time blocking recommendations
- [x] Workload prediction and warnings
- [x] Calendar-aware task suggestions
- [x] Auto-generated daily plans with task placement
- [x] Focus time defense and protection
- [x] Visual workload heatmap and capacity indicators
- [x] Intelligent rescheduling when plans change
- [x] Weekly planning assistant with AI guidance
- [x] Predictive insights and what-if scenarios

### Priority 13: AI-Enhanced Data Management (LOW)
**Status**: COMPLETED
**Base Specs**: backup-data-management.md

See `improved_specs/ai-data-management.md` for full specification.

Note: Per platform principles, NO archive mechanism - use a modern database. This spec reimagines data management for an API-first, modern database architecture.

AI enhancements:
- [x] AI-powered data health monitoring with proactive recommendations
- [x] Intelligent backup scheduling based on activity patterns
- [x] Smart export with AI-recommended format selection
- [x] AI-assisted import with intelligent conflict resolution
- [x] Automatic duplicate detection during import
- [x] Data quality analysis with cleanup suggestions
- [x] Intelligent migration assistance for version upgrades
- [x] AI-powered backup preview with change summarization
- [x] Smart restore recommendations based on recovery goals
- [x] Predictive storage and performance optimization

### Priority 14: AI-Enhanced Sync (LOW)
**Status**: PENDING
**Base Specs**: sync.md

Will be documented in `improved_specs/ai-sync.md`.

AI enhancements:
- [ ] AI-powered conflict resolution with context-aware merging
- [ ] Intelligent sync scheduling based on usage patterns
- [ ] Smart device management with health monitoring
- [ ] Predictive sync optimization for battery and bandwidth
- [ ] AI-assisted troubleshooting with diagnostic insights
- [ ] Intelligent offline queue prioritization
- [ ] Smart compaction timing recommendations
- [ ] Cross-device usage pattern analysis

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
| 2026-01-03 | Priority 9: AI Notifications & Smart Alerts | COMPLETED | Created `ai-notifications.md` with smart timing, bundling, predictive reminders, fatigue prevention |
| 2026-01-03 | Priority 10: AI-Enhanced Batch Editing | COMPLETED | Created `ai-batch-editing.md` with smart selection, NL commands, clustering, inbox assistant |
| 2026-01-03 | Priority 11: AI-Powered Focus Mode | COMPLETED | Created `ai-focus-mode.md` with AI-suggested sessions, deep work detection, system Focus integration, adaptive durations, smart breaks, analytics |
| 2026-01-03 | Priority 12: AI-Enhanced Forecast View | COMPLETED | Created `ai-forecast.md` with AI-generated daily plans, smart time blocking, workload heatmaps, intelligent rescheduling, weekly planning assistant, predictive insights |
| 2026-01-03 | Priority 13: AI-Enhanced Data Management | COMPLETED | Created `ai-data-management.md` with AI-powered health monitoring, intelligent backup scheduling, smart export/import, duplicate detection, quality analysis, migration assistance |

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
