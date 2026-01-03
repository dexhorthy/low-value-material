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

Each project displays a health grade (A through F) with a numeric score (0-100). The grade provides at-a-glance status while the score enables tracking improvements over time.

**Grade scale:**
- **A (90-100)**: Excellent - project is on track with recent progress
- **B (75-89)**: Good - project is healthy with minor issues
- **C (60-74)**: Fair - needs attention soon
- **D (40-59)**: Poor - significant issues present
- **F (0-39)**: Critical - requires immediate action

### Health Factors

The health score considers multiple signals:

| Factor | What it measures |
|--------|------------------|
| Progress | Are tasks being completed? Recent activity? |
| Freshness | When was the last action taken? |
| Clarity | Do tasks have clear next actions? |
| Dates | Are due dates realistic? How many overdue? |
| Review | Is the project being reviewed on schedule? |
| Structure | Appropriate number of tasks? Not bloated? |
| Blockers | Are tasks stuck waiting on dependencies? |

## Zombie Task Detection

### What is a Zombie Task?

A zombie task is one that exists but is effectively dead - unlikely to ever be completed. The system identifies these so users can decide to drop, clarify, or properly defer them.

### Types of Zombie Tasks

| Type | Description | Typical Action |
|------|-------------|----------------|
| Ancient | Very old, never touched | Drop or clarify |
| Perpetually Deferred | Rescheduled 3+ times | Move to someday/maybe |
| Abandoned | In a dead or inactive project | Drop or revive project |
| Vague Forever | Never clarified despite age | Clarify or drop |
| Duplicate Ignored | Similar to completed task | Drop |
| Context Lost | References outdated information | Update or drop |

### How Zombies are Identified

A task may be flagged as a zombie when it exhibits patterns like:
- Created 6+ months ago with no recent activity
- Deferred three or more times
- Title is vague (no action verb, too short, ends with "?")
- Project has been inactive for months

## Stalled Project Detection

### What is a Stalled Project?

A project that isn't making progress despite being marked as active. The system detects various stall patterns:

| Stall Type | What it means | Suggested Fix |
|------------|---------------|---------------|
| Empty | No remaining tasks | Add next action or complete project |
| All Deferred | Every task is scheduled for the future | Review defer dates |
| Blocked | First task can't be started | Remove blocker or add different task |
| Waiting | All tasks waiting on others | Follow up or add independent tasks |
| Inactive | Has available tasks but no recent activity | Prioritize, put on hold, or reconsider |

## Smart Review Prioritization

### Review Queue

Instead of reviewing projects in arbitrary order, the system prioritizes by urgency. Projects needing review most appear first.

**Urgency factors:**
- How overdue is the review?
- Is the project stalled?
- Are there overdue tasks?
- What's the health score?
- Are there zombie tasks?

The queue shows estimated review time for each project, helping users plan their review session.

## Automated Cleanup Suggestions

### Cleanup Categories

The system groups cleanup opportunities:

| Category | What it finds |
|----------|---------------|
| Zombie tasks | Tasks to drop or clarify |
| Probably done | Tasks that are actually complete |
| Duplicates | Similar tasks to merge |
| Inactive projects | Projects to archive or drop |
| Unrealistic dates | Due dates that have passed or are impossible |
| Vague tasks | Tasks needing clearer next actions |
| Inbox overflow | Items sitting in inbox too long |

Each suggestion includes why it was flagged and what action to take.

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

| Setting | Default | Description |
|---------|---------|-------------|
| Smart prioritization | On | Order review queue by urgency |
| Show health scores | On | Display project health metrics |
| Zombie threshold | 180 days | Age before task is flagged |
| Stale threshold | 30 days | Inactivity before project is stale |
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
