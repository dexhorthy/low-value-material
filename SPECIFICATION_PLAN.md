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
| Folder | Not Started | `specs/folder.md` |
| Tag | Not Started | `specs/tag.md` |
| Inbox | Not Started | `specs/inbox.md` |

### Priority 2: Date/Time System
| Spec | Status | File |
|------|--------|------|
| Due Dates | Not Started | `specs/due-dates.md` |
| Defer Dates | Not Started | `specs/defer-dates.md` |
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
