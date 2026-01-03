# AI-Assisted Review Specification

This specification extends `specs/review.md` with intelligent review assistance. The system helps users maintain a healthy task system through smart prioritization, automated issue detection, and guided cleanup.

## Overview

The GTD Weekly Review is critical but often skipped due to effort. AI-assisted review reduces friction by:
- **Smart prioritization**: Surface projects that need attention most
- **Automated detection**: Find stalled projects, zombie tasks, issues
- **Guided cleanup**: Suggest specific actions for each problem
- **Health scoring**: Quantify overall system health
- **Review summaries**: Generate insights from review sessions

## Project Health Scoring

### What Users See

Each project displays a health grade (Excellent, Good, Fair, Poor, Critical) with a numeric score. The grade provides at-a-glance status while the score enables tracking improvements over time.

### What Influences Health

The system considers multiple signals to assess a project's health:
- **Progress**: Are tasks being completed? Is there recent activity?
- **Clarity**: Do tasks have clear next actions and well-defined outcomes?
- **Dates**: Are due dates realistic and being met?
- **Activity**: Is the project actively being worked on or reviewed?
- **Structure**: Is the project appropriately sized and focused?
- **Blockers**: Are tasks stuck waiting on dependencies or external factors?

## Zombie Task Detection

### What is a Zombie Task?

A zombie task is one that exists but is effectively dead - unlikely to ever be completed. The system identifies these so users can decide to drop, clarify, or properly defer them.

### Types of Zombie Tasks

The system identifies several patterns of zombie tasks:
- **Ancient**: Very old with no recent progress, often forgotten
- **Perpetually Deferred**: Repeatedly rescheduled but never acted on
- **Abandoned**: Left in an inactive or dropped project
- **Vague Forever**: Unclear goals despite age, never properly clarified
- **Duplicate Ignored**: Similar to a task that was already completed
- **Context Lost**: References outdated information or dependencies

### How Zombies are Identified

The system flags potential zombie tasks based on patterns like:
- Extended age with no recent activity
- Repeated deferrals without progress
- Unclear or vague task titles
- Associated project showing no recent activity

## Stalled Project Detection

### What is a Stalled Project?

A project that isn't making progress despite being marked as active. The system detects when projects lose momentum and suggests ways to revive them.

**Common stall patterns:**
- **No available tasks**: All tasks deferred or blocked with nothing to start
- **All deferred**: Every remaining task is scheduled for a future date
- **Blocked progression**: The first task can't be started due to blockers
- **Waiting dependent**: All tasks waiting on external input or other work
- **Inactive with capacity**: Has available work but no recent progress

## Smart Review Prioritization

### Review Queue

Instead of reviewing projects in arbitrary order, the system prioritizes by urgency. Projects needing review most appear first.

**What makes a project high priority:**
- Review is significantly overdue
- Project shows stall patterns
- Contains overdue tasks
- Health status is declining
- Has potential zombie tasks

The queue shows estimated review time for each project, helping users plan their review session.

## Automated Cleanup Suggestions

### Cleanup Categories

The system identifies cleanup opportunities across your projects and inbox:

**Types of suggestions:**
- **Zombie tasks**: Tasks unlikely to be completed, suggesting drop or clarification
- **Possibly completed**: Tasks that appear done but aren't marked complete
- **Duplicates**: Similar tasks that could be consolidated
- **Stale projects**: Projects showing no recent activity, worth archiving or dropping
- **Unrealistic dates**: Due dates that have passed or lack sufficient time
- **Unclear next steps**: Tasks with vague descriptions needing clarification
- **Inbox backlog**: Items waiting too long for processing

Each suggestion explains why it was identified and what action you might take.

## Review Session Flow

### Starting a Review

When the user starts a review session, the system:
1. Builds a prioritized queue of projects needing review
2. Shows estimated total time
3. Presents cleanup suggestions across all projects

### Reviewing Each Project

For each project, the user sees:
- Health score and grade
- Detected issues (stalled, zombies, overdue)
- Task list with status indicators
- Suggested actions for problems

**Example review screen:**
```
Project: Website Redesign
Health: C (62/100)  │  Last reviewed: 12 days ago

Issues detected:
  • Stalled - no available tasks (all deferred)
  • 2 tasks overdue
  • 1 zombie task (180 days old)

Tasks (5 remaining):
  🔴 ☐ Finalize mockups (overdue 3 days)
  🔴 ☐ Get client feedback (overdue 1 day)
  ⏸️ ☐ Implement homepage (deferred to Jan 15)
  ⏸️ ☐ Test on mobile (deferred to Jan 20)
  💀 ☐ Research competitors (180 days, untouched)

Suggested actions:
  [Drop zombie task] [Reschedule overdue] [Clear defer]

[Skip] [Mark Reviewed] [Complete Project] [Drop Project]
```

### Review Actions

During review, users can:
- Mark tasks complete or drop them
- Reschedule overdue tasks
- Add new next actions
- Mark project as reviewed, completed, or dropped
- Skip to review later

## Review Summary

### Post-Review Report

After completing a review session, users see a summary:

```
Review Complete!

Session Summary (23 minutes)

Statistics
  • 8 projects reviewed
  • 12 tasks completed
  • 5 tasks dropped
  • 3 new tasks created
  • 7 issues resolved

Health Improvements
  • Website Redesign: C → B (+15)
  • Q1 Planning: D → C (+18)

Insights
  • You've cleared your backlog of zombie tasks
  • 3 projects haven't had activity in 30+ days
  • Consider batching your "waiting for" tasks

Great job! Your system health improved 12% overall.
```

### AI-Generated Insights

The summary includes observations, trends, and recommendations:
- **Observations**: Notable patterns or issues found
- **Trends**: How this review compares to previous ones
- **Recommendations**: Actionable suggestions for improvement
- **Celebration**: Acknowledgment of progress made

## User Settings

Users can configure how the review system works for their needs:

| Setting | Default | Description |
|---------|---------|-------------|
| Smart prioritization | On | Order review queue by urgency |
| Show health scores | On | Display project health metrics |
| Auto-detect issues | On | Find problems automatically |
| Generate insights | On | AI-generated review insights |
| Cleanup suggestions | On | Show cleanup recommendations |
| Session reminders | On | Remind if review not completed |

## Related Specifications

- `specs/review.md` - Base review system
- `specs/project.md` - Project data model
- `specs/availability.md` - Task availability
- `improved_specs/ai-suggestions.md` - Task recommendations
- `improved_specs/ai-organization.md` - Tag cleanup

## Sources

- [GTD in the Age of AI](https://www.dearflow.ai/blog/getting-things-done-gtd-in-the-age-of-ai)
- [AI Task Managers 2025](https://monday.com/blog/task-management/ai-task-manager/)
- [AI Project Management Tools](https://clickup.com/blog/ai-project-management-tools/)
- [Wrike Predictive AI](https://www.wrike.com/)
