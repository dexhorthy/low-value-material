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
| Repeat Patterns | Not Started | `specs/repeat.md` |
| Availability | Not Started | `specs/availability.md` |

### Priority 3: Views/Perspectives
| Spec | Status | File |
|------|--------|------|
| Perspectives Core | Not Started | `specs/perspectives.md` |
| Forecast View | Not Started | `specs/forecast.md` |
| Review System | Not Started | `specs/review.md` |
| Custom Perspectives | Not Started | `specs/custom-perspectives.md` |

### Priority 4: Organization Features
| Spec | Status | File |
|------|--------|------|
| Focus Mode | Not Started | `specs/focus-mode.md` |
| Quick Capture | Not Started | `specs/quick-capture.md` |
| Search | Not Started | `specs/search.md` |
| Batch Editing | Not Started | `specs/batch-editing.md` |

### Priority 5: Platform Features
| Spec | Status | File |
|------|--------|------|
| Sync | Not Started | `specs/sync.md` |
| Notifications | Not Started | `specs/notifications.md` |
| Location-Based Tags | Not Started | `specs/location-tags.md` |

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
