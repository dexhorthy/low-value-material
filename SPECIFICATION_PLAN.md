# OmniFocus Clone - Specification Plan

This document tracks progress on clean-room specifications for an OmniFocus-like task management application.

## Overview

OmniFocus is a task management application built around the Getting Things Done (GTD) methodology. Key differentiators include:
- Sequential vs parallel project types
- Defer dates (not just due dates)
- Powerful perspectives (custom filtered views)
- Review system for periodic project assessment
- Location-based contexts/tags

## Specification Priority

### Priority 1: Core Data Model (Foundation)
| Spec | Status | File |
|------|--------|------|
| Task/Action | ✅ Done | `specs/task.md` |
| Project | ✅ Done | `specs/project.md` |
| Folder | ✅ Done | `specs/folder.md` |
| Tag | ✅ Done | `specs/tag.md` |
| Inbox | ✅ Done | `specs/inbox.md` |

### Priority 2: Date/Time System
| Spec | Status | File |
|------|--------|------|
| Due Dates | ✅ Done | `specs/due-dates.md` |
| Defer Dates | ✅ Done | `specs/defer-dates.md` |
| Repeat Patterns | ✅ Done | `specs/repeat.md` |
| Availability | ✅ Done | `specs/availability.md` |

### Priority 3: Views/Perspectives
| Spec | Status | File |
|------|--------|------|
| Perspectives Core | ✅ Done | `specs/perspectives.md` |
| Forecast View | ✅ Done | `specs/forecast.md` |
| Review System | ✅ Done | `specs/review.md` |
| Custom Perspectives | ✅ Done | `specs/custom-perspectives.md` |

### Priority 4: Organization Features
| Spec | Status | File |
|------|--------|------|
| Focus Mode | ✅ Done | `specs/focus-mode.md` |
| Quick Capture | ✅ Done | `specs/quick-capture.md` |
| Search | ✅ Done | `specs/search.md` |
| Batch Editing | ✅ Done | `specs/batch-editing.md` |

### Priority 5: Platform Features
| Spec | Status | File |
|------|--------|------|
| Sync | ✅ Done | `specs/sync.md` |
| Notifications | ✅ Done | `specs/notifications.md` |
| Location-Based Tags | ✅ Done | `specs/location-tags.md` |

### Priority 6: Data Model Extensions
| Spec | Status | File |
|------|--------|------|
| Attachments | ✅ Done | `specs/attachments.md` |
| Rich Text Notes | ✅ Done | `specs/notes.md` |
| Automation | ✅ Done | `specs/automation.md` |

### Priority 7: Advanced Features
| Spec | Status | File |
|------|--------|------|
| AI Capabilities | ✅ Done | `specs/ai-capabilities.md` |

### Priority 8: Data Management
| Spec | Status | File |
|------|--------|------|
| Backup & Data Management | ✅ Done | `specs/backup-data-management.md` |

### Priority 9: AI-Enhanced Features
| Spec | Status | File |
|------|--------|------|
| AI Capture | ✅ Done | `improved_specs/ai-capture.md` |
| AI Scheduling | ✅ Done | `improved_specs/ai-scheduling.md` |
| AI Notes & Attachments | ✅ Done | `improved_specs/ai-notes-attachments.md` |
| AI Organization | ✅ Done | `improved_specs/ai-organization.md` |
| AI Search | ✅ Done | `improved_specs/ai-search.md` |
| AI Suggestions | ✅ Done | `improved_specs/ai-suggestions.md` |
| AI Review | ✅ Done | `improved_specs/ai-review.md` |
| AI Notifications | ✅ Done | `improved_specs/ai-notifications.md` |
| AI Batch Editing | ✅ Done | `improved_specs/ai-batch-editing.md` |
| AI Perspectives | ✅ Done | `improved_specs/ai-perspectives.md` |
| AI Processing Reference | ✅ Done | `improved_specs/ai-processing-reference.md` |
| MCP Integration | ✅ Done | `improved_specs/mcp-integration.md` |
| AI Forecast | 📝 TODO | `improved_specs/ai-forecast.md` |
| AI Focus | 📝 TODO | `improved_specs/ai-focus.md` |

## Research Sources
- [OmniFocus Features](https://www.omnigroup.com/omnifocus/features)
- [Zapier GTD + OmniFocus Guide](https://zapier.com/blog/getting-things-done-gtd-omnifocus/)

## Progress Log

### 2026-01-03 - Iteration 1
- Created initial SPECIFICATION_PLAN.md
- Researched OmniFocus core features via web search
- Identified 5 priority tiers for specifications
- Created task.md specification (core data model foundation)

### 2026-01-03 - Iteration 2
- Researched project types (parallel, sequential, single-action)
- Created project.md specification covering:
  - Project types and their task availability rules
  - Status enum (active, on_hold, completed, dropped)
  - Review system with intervals
  - Auto-complete behavior
  - Nested action groups with mixed types

### 2026-01-03 - Iteration 3
- Researched folder hierarchy and status behavior
- Created folder.md specification covering:
  - Folder status (active, dropped) - simpler than projects
  - Hierarchy with unlimited nesting depth
  - Containment rules (folders contain folders and projects, not tasks)
  - Flattened queries for nested content
  - Status effects on contained items

### 2026-01-03 - Iteration 4
- Researched tags (formerly contexts) in depth
- Created tag.md specification covering:
  - Multi-tag assignment (improvement over single-context)
  - Hierarchical/nested tags
  - Status enum (active, on_hold, dropped) with availability effects
  - `allows_next_action` for blocking tags (e.g., "Waiting For")
  - `children_mutually_exclusive` for exclusive groups (e.g., priority levels)
  - Location-based tags with coordinates and radius
  - Tag inheritance from projects to tasks at creation time

### 2026-01-03 - Iteration 5
- Researched OmniFocus Inbox and GTD capture workflow
- Created inbox.md specification covering:
  - Inbox as special capture container (not a project/folder)
  - Inbox items are tasks with null project_id/parent_task_id
  - Full task properties available on inbox items (dates, tags, flags)
  - Tentative assignment for batch processing with Clean Up
  - Capture methods: direct entry, Quick Entry, external capture
  - Processing operations: assign to project, convert to project, complete directly
  - Availability rules for inbox items (no sequential blocking)
  - Two-minute rule integration for GTD practitioners
- Priority 1: Core Data Model is now COMPLETE

### 2026-01-03 - Iteration 6
- Researched OmniFocus due dates, effective due dates, and date inheritance
- Researched OmniFocus 4.7 Planned Dates feature (August 2025)
- Created due-dates.md specification covering:
  - Due date data model with all-day vs specific time support
  - Due states: normal, due soon (amber), overdue (red)
  - Configurable due soon threshold (default 48 hours)
  - Configurable default due time (default 5 PM)
  - Effective due date calculation with inheritance from parent/project
  - Queries for due on date, overdue, due soon, due in range
  - Forecast integration and notifications
  - Best practices: use sparingly for hard deadlines only

### 2026-01-03 - Iteration 7
- Researched OmniFocus defer dates vs due dates vs planned dates
- Researched OmniFocus 4.7 Planned Dates for scheduling without hiding
- Created defer-dates.md specification covering:
  - Defer date data model with all-day vs specific time support
  - Default defer time (midnight) vs default due time (5 PM)
  - Defer states: deferred (grayed, hidden) → available (normal)
  - Effective defer date calculation using max() (opposite of due date min())
  - Interaction with due dates: defer + due for time-boxed work
  - Planned dates as third date type (scheduling without hiding)
  - Queries for available, deferred, becoming available
  - Visual treatment: grayed text for deferred items
  - Best practices: use for hiding future work, not scheduling

### 2026-01-03 - Iteration 8
- Researched OmniFocus repeat patterns and recurring task options
- Researched OmniFocus 4.7 repeat limits and catch-up features
- Created repeat.md specification covering:
  - Three schedule types: regularly, due again, defer again
  - Anchor date options: defer, due, or planned date
  - Repeat intervals: minutes to years, with weekday selection
  - Repeat limits: end after date or end after count (4.7+)
  - Catch up automatically: skip missed occurrences (4.7+)
  - Completion behavior: original completed, new instance created
  - Properties carried forward vs reset
  - Repeating projects with task reset
  - Edge cases: no dates, dropping vs completing, subtasks

### 2026-01-03 - Iteration 9
- Researched OmniFocus task availability and blocking conditions
- Researched first available, next action, and status calculations
- Created availability.md specification covering:
  - Task status enum: available, blocked, next, due_soon, overdue, completed, dropped
  - Six blocking conditions: defer, sequential, project status, tag status, allows_next_action, parent
  - Complete availability formula combining all conditions
  - Remaining vs Available distinction (set relationship)
  - Project type effects: parallel, sequential, single-action
  - Nested action groups with independent types
  - First available calculation and edge cases
  - Effective properties: defer_date (max), due_date (min), flagged (OR)
  - Queries: available_tasks, remaining_tasks, blocked_by
  - View filtering and visual indicators
- Priority 2: Date/Time System is now COMPLETE

### 2026-01-03 - Iteration 10
- Researched OmniFocus perspectives, built-in views, and custom perspectives
- Researched perspective editor, filter rules, grouping, and sorting
- Created perspectives.md specification covering:
  - Built-in perspectives: Inbox, Projects, Tags, Flagged, Forecast, Review, Nearby
  - Reference perspectives: Completed, Changed
  - Custom perspectives (Pro feature) with full editor
  - Filter rule hierarchy with All/Any/None operators
  - Condition types: status, dates, containers, text, duration
  - Display modes: entire projects vs individual actions
  - Grouping options: ungrouped, project, tag, dates, flagged
  - Sorting options with multiple criteria and direction
  - Sidebar/Home configuration and ordering
  - Syncing and version compatibility

### 2026-01-03 - Iteration 11
- Researched OmniFocus Forecast perspective and date-based views
- Researched Forecast tag, calendar integration, and piano keys UI
- Created forecast.md specification covering:
  - Timeline structure with "piano keys" date tiles
  - ForecastDay object with status, badge, and item sections
  - Badge color logic: none, available, due_soon, overdue
  - Sections: Calendar Events, Due, Deferred, Tagged, Planned
  - Forecast tag for "do today" items without fake due dates
  - Calendar integration with system calendars
  - Drag-and-drop date modification with modifier keys
  - Past (overdue) and Future sections
  - Quick reschedule operations

### 2026-01-03 - Iteration 12
- Researched OmniFocus Review perspective and GTD weekly review
- Researched review intervals, stalled projects, and mark reviewed workflow
- Created review.md specification covering:
  - Project review fields: review_interval, last_reviewed_at, next_review_at
  - Default review interval (7 days) with per-project override
  - Review perspective sorted by next review date
  - Stalled project detection (active with zero remaining tasks)
  - Mark reviewed operation and workflow
  - Visual indicators: maroon dot, stalled badge
  - Review queries: needs_review, stalled, review_schedule
  - Settings: default interval, include on-hold, show stalled
  - Weekly review workflow and best practices

### 2026-01-03 - Iteration 13
- Researched OmniFocus custom perspectives (Pro feature)
- Researched filter rule conditions, grouping, and sorting options
- Created custom-perspectives.md specification covering:
  - Filter rule hierarchy with All/Any/None aggregation
  - Condition types: availability, status, dates, duration, containers, text
  - Duration filtering for quick wins (5/15/30/60 min thresholds)
  - Presentation: display mode, grouping, sorting with direction
  - Common patterns: Today, Quick Wins, Stale, Waiting For, No Duration
  - Operations: create, update, duplicate, delete, export, import
  - Syncing and version compatibility
  - Automation access for programmatic creation
- Priority 3: Views/Perspectives is now COMPLETE

### 2026-01-03 - Iteration 14
- Researched OmniFocus Focus mode for narrowing database scope
- Researched focus persistence, visual indicators, and iOS/macOS integration
- Created focus-mode.md specification covering:
  - Focus state: is_focused, focused_items, focus_scope
  - Operations: focus_on, unfocus, toggle_focus, add_to_focus, remove_from_focus
  - Scope calculation: folders include nested contents recursively
  - Effect on perspectives: intersects with perspective filters
  - Visual indicators: focus bar with unfocus button
  - Persistence: session-based, not synced between devices
  - iOS/macOS Focus Mode integration for automatic context switching
  - Keyboard shortcuts: ⌘⇧F for focus/unfocus
  - Settings: remember_focus, inbox_during_focus, search_respects_focus

### 2026-01-03 - Iteration 15
- Researched OmniFocus Quick Entry, Share Extension, and capture methods
- Researched Siri integration, URL scheme, and Shortcuts actions
- Created quick-capture.md specification covering:
  - Seven capture methods: Quick Entry, Share Extension, Clippings, Siri, Email, URL Scheme, Shortcuts
  - Quick Entry window with configurable fields and layout modes
  - Context-aware capture from Safari, Mail, Files, Photos
  - Siri commands: add task, due date, project/tag, repeat
  - Shortcuts actions: Add OmniFocus Item, Add TaskPaper
  - URL scheme parameters for automation
  - Rapid entry with double-return for batch capture
  - Settings: hotkey, layout, visible fields, defaults
  - Offline capture with sync on reconnect

### 2026-01-03 - Iteration 16
- Researched OmniFocus search and Quick Open functionality
- Researched search scopes, fields, and matching algorithms
- Created search.md specification covering:
  - Three search modes: Outline Search, Quick Open, Sidebar Search
  - Search scopes: here, remaining, everything
  - Searchable fields: title, note, tags (with weighting)
  - Smart match algorithm: start-of-word, contains, case insensitive
  - Search operators: space (AND), quotes (phrase), minus (exclude)
  - Optional field-specific operators: title:, note:, tag:, project:
  - Quick Open for navigation with ⌘O
  - Result ranking by relevance and recency
  - Keyboard shortcuts and navigation
  - Focus mode interaction settings

### 2026-01-03 - Iteration 17
- Reviewed existing batch-editing.md specification
- Verified comprehensive coverage of:
  - Selection model: enter mode, selection actions, scope, persistence
  - Inspector with multiple selection: mixed value display, editing behavior
  - Editable fields matrix (title/note not editable, tags additive)
  - Bulk operations: move, delete, convert, complete/drop, flag
  - Outline operations: reordering, grouping, indent/outdent
  - Keyboard shortcuts and edit mode (mobile)
  - Constraints: selection limits, type mixing, view restrictions
- Priority 4: Organization Features is now COMPLETE

### 2026-01-03 - Iteration 18
- Researched OmniFocus sync architecture and Omni Sync Server
- Researched push-triggered sync, WebDAV protocol, and encryption
- Created sync.md specification covering:
  - Change-based sync with transaction log model
  - Sync triggers: automatic, manual, push-triggered
  - Server options: Omni Sync Server vs WebDAV (not Dropbox/iCloud)
  - Encryption: in transit (HTTPS) and at rest (client-side)
  - Device registration and push notification architecture
  - Compaction process and stale device handling (21-day limit)
  - Conflict resolution: last-write-wins, repeating task duplicates
  - Sync states and offline support with queue
  - Mail Drop: email-to-inbox feature with encryption handling
  - Error handling and retry strategy

### 2026-01-03 - Iteration 19
- Researched OmniFocus notification system and alert settings
- Researched badge counts, Today widget, and Apple Watch complications
- Created notifications.md specification covering:
  - Automatic notification types: due, deferred, latest_start, planned, location
  - Per-item notifications: before_due (relative) and custom (Pro, absolute)
  - Notification data model with kind, anchor, and fire offset
  - Before-due options from 1 minute to 4 weeks
  - Global settings: notify_on_due, notify_on_deferred, due_soon_threshold
  - Badge configuration: app icon (overdue/due_soon/flagged) and sidebar badges
  - iOS badge limitations (sync-triggered only, not real-time)
  - Sound settings with per-type configuration
  - Interactive notification actions: complete, snooze (15 min)
  - Today widget item types and Forecast widget
  - Apple Watch complications and complication sources
  - Location notifications with geofence triggers
  - Calendar alarms integration (14-day lookahead)
  - Notification lifecycle for date changes and repeating items
  - Platform differences matrix (macOS, iOS, Watch, Web)

### 2026-01-03 - Iteration 20
- Researched OmniFocus location-based tags and Nearby perspective
- Researched geofence notifications, radius settings, and region monitoring
- Created location-tags.md specification covering:
  - Location object data model with coordinates, source, radius, notification trigger
  - Location source types: here, address, business_search, contact, pin
  - Radius options: small (~200m), medium (~500m), large (~10km)
  - Notification triggers: arriving, leaving, none
  - Nearby perspective with map and list view modes
  - Geofence notification mechanics and technical limitations
  - Platform considerations (mobile vs desktop vs web)
  - Best practices for location tag organization
- Priority 5: Platform Features is now COMPLETE

### 2026-01-03 - Iteration 21
- Identified missing specifications referenced in task.md "Out of Scope" section
- Researched OmniFocus attachment support via official docs and support articles
- Researched file embedding vs linking, sync behavior, platform differences
- Created attachments.md specification covering:
  - Attachment data model with embedded/linked storage types
  - Supported content types by platform (images, documents, audio, video)
  - Operations: add, remove, export, get attachment data
  - Attachment List management interface with sort/filter/batch operations
  - Sync behavior for embedded (syncs) vs linked (local only) attachments
  - Size recommendations and warnings (10MB single file, 500MB total)
  - Platform integration: macOS drag-drop/Quick Look, iOS camera/scanner/Files
  - Mail Drop integration for email attachments
  - Automation support via URL scheme, Shortcuts, Omni Automation
- Added Priority 6: Data Model Extensions to track remaining specs

### 2026-01-03 - Iteration 22
- Researched OmniFocus rich text notes and RTF formatting support
- Researched Omni Automation Text and Style objects for note manipulation
- Researched Format menu options and keyboard shortcuts
- Created notes.md specification covering:
  - Dual access: `note` (plain text) and `note_text` (rich TextObject)
  - Text Object structure with attribute runs and ranges
  - Style Object with font, paragraph, decoration, and advanced attributes
  - Supported formatting via Format menu (bold, italic, underline, strikethrough, etc.)
  - Style management: Copy Style, Paste Style, Clear Style, Simplify Style
  - Link embedding with URL properties and behavior
  - Inline attachments within note text flow
  - Text manipulation operations: insert, append, replace, remove
  - Search operations within notes
  - Note: Markdown NOT supported; uses Rich Text Format (RTF)
  - Platform considerations for macOS, iOS, Web, Vision Pro
  - Automation via URL scheme, Shortcuts, and Omni Automation JavaScript

### 2026-01-03 - Iteration 23
- Researched OmniFocus automation systems and integration methods
- Researched Omni Automation JavaScript API (version 3.13.1)
- Researched URL schemes for navigation and task creation
- Researched AppleScript support and dictionary
- Researched Shortcuts integration and actions (iOS/iPadOS/macOS)
- Created automation.md specification covering:
  - Omni Automation: JavaScript API with cross-platform support (macOS, iOS, iPadOS, visionOS)
  - Core capabilities: database access, task/project/folder/tag CRUD, completion, attachments
  - Plug-in system: action/perspective/resource types, distribution, execution context
  - Advanced features: HTTP requests, forms, speech synthesis, credential storage, crypto
  - URL Schemes: navigation URLs, /add action with 15+ parameters, /paste for TaskPaper import
  - x-callback-url support for automation chaining
  - AppleScript: Mac-only Pro feature, full object model, script folder integration
  - Shortcuts: 7 built-in actions (Add Item, Find Items/Projects/Tags, Run Script, etc.)
  - Security model: user consent, keychain storage, sandboxed file access
  - Platform matrix showing feature availability across devices
  - Best practices: choosing automation methods, error handling, performance optimization
  - Example workflows: daily planning, weekly review, quick capture, project templates
- Priority 6: Data Model Extensions is now COMPLETE
- ALL SPECIFICATIONS COMPLETE (22 specifications across 6 priority tiers)

### 2026-01-03 - Iteration 24
- Researched OmniFocus 4.8+ AI capabilities and Apple Intelligence integration
- Researched on-device Foundation Models framework and privacy approach
- Researched LanguageModel API: Session, respond(), respondWithSchema()
- Researched built-in AI plug-ins: Help Me Plan, Intelligent Assist, Help Me Estimate
- Researched AI-powered project generation and task breakdown features
- Researched custom AI plug-in development and distribution
- Created ai-capabilities.md specification covering:
  - Privacy-first on-device AI with Apple Foundation Models (macOS/iOS/iPadOS/visionOS 26+)
  - LanguageModel API with text and structured JSON/XML responses
  - Built-in features: Help Me Plan (task breakdown), Intelligent Assist (context-aware sub-tasks), Help Me Estimate (time estimates), Project Templates via AI, Clipboard Events
  - AI-assisted workflows: project ideation, rapid creation, batch processing
  - Custom plug-in development with JavaScript examples and schema definitions
  - Platform requirements: Apple Silicon M1+/A17+, 8GB+ RAM, OS 26+
  - Settings: AI preferences, per-feature controls, privacy controls
  - Limitations: non-deterministic, limited context, no learning, language support
  - Best practices: effective prompting, quality control, when to use AI
  - Integration with perspectives, repeating tasks, review system, tags, sync
  - Future directions: smarter scheduling, effort optimization, context awareness
- Added Priority 7: Advanced Features to track emerging capabilities
- ALL SPECIFICATIONS COMPLETE (23 specifications across 7 priority tiers)

### 2026-01-03 - Iteration 25
- Researched OmniFocus backup, restore, and data management features
- Researched automatic backup system (2-hour Mac, daily mobile schedule)
- Researched backup retention (up to 100 backups, ~2 weeks continuous use)
- Researched restore process with preview and revert capability
- Researched archiving system for completed/dropped items
- Researched export formats: OmniFocus, TaskPaper, HTML, CSV, Backup Document
- Researched import capabilities from previous versions and TaskPaper
- Researched database maintenance and size management strategies
- Created backup-data-management.md specification covering:
  - Database structure and file locations by platform
  - Automatic backup schedule: 2-hour (Mac) vs daily (mobile)
  - Backup triggers: scheduled, pre-sync, pre-migration, pre-restore
  - Manual backup operations and export to .ofocus-backup
  - Restore operations with preview window and data loss warnings
  - Sync impact: restore replaces server data, forces device resync
  - Archive system for reducing database size and improving performance
  - Archive operations: move completed/dropped items to separate file
  - Archive storage options including iCloud Drive for multi-Mac access
  - Export formats by platform: full support on Mac, CSV-only on mobile
  - TaskPaper plain text format with @tag metadata
  - Simple HTML with embedded styles and CSV UTF-8/UTF-16
  - Import from previous versions with database migration
  - Import TaskPaper with automatic project/task/tag creation
  - Database health checking and size reduction recommendations
  - Security considerations for backups, exports, and archives
  - Platform differences matrix across macOS/iOS/visionOS/Web
  - Best practices for users and implementers
- Added Priority 8: Data Management to track data protection features
- ALL SPECIFICATIONS COMPLETE (24 specifications across 8 priority tiers)

### 2026-01-03 - Iteration 26
- Identified need for AI-enhanced feature specifications in improved_specs/
- Catalogued existing 11 AI-enhanced specs created previously
- Researched AI-powered perspectives, natural language filtering, and context-aware views
- Researched perspectivist approaches to NLP and multi-perspective reasoning frameworks
- Researched context-aware systems and task-aware attention mechanisms
- Created ai-perspectives.md specification covering:
  - Natural language perspective creation with text interpretation
  - Smart perspective suggestions based on workflow patterns
  - Intelligent filter recommendations with context-awareness
  - Perspective templates with adaptive customization
  - Context-aware perspective switching with automatic triggers
  - Usage-based learning and optimization
  - Intelligent grouping and sorting recommendations
  - Perspective discovery and search
  - AI-assisted perspective maintenance and cleanup
  - Duplicate detection and health checks
  - Privacy controls and local processing
- Added Priority 9: AI-Enhanced Features to track improved_specs/ specifications
- Progress: 12 of 14 AI-enhanced specs complete (AI Forecast and AI Focus remain)
