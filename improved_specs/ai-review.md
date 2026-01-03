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

### Health Score Model

Each project receives a health score (0-100):

```typescript
interface ProjectHealth {
  project_id: UUID;
  health_score: number;        // 0-100
  health_grade: HealthGrade;   // A, B, C, D, F
  factors: HealthFactor[];
  issues: ProjectIssue[];
  suggestions: ReviewSuggestion[];
  last_calculated: DateTime;
}

enum HealthGrade {
  A = "excellent",    // 90-100
  B = "good",         // 75-89
  C = "fair",         // 60-74
  D = "poor",         // 40-59
  F = "critical"      // 0-39
}

interface HealthFactor {
  name: string;
  score: number;      // 0-100 for this factor
  weight: number;     // Contribution to total
  details: string;
}
```

### Health Factors

| Factor | Weight | Scoring Criteria |
|--------|--------|------------------|
| Progress | 0.25 | Tasks completed vs total, recent completions |
| Freshness | 0.20 | Time since last activity |
| Clarity | 0.15 | Tasks have next actions, not vague |
| Dates | 0.15 | Due dates realistic, not all overdue |
| Review | 0.10 | Reviewed on schedule |
| Structure | 0.10 | Appropriate task count, not bloated |
| Blockers | 0.05 | No stuck sequential tasks |

### Score Calculation

```typescript
function calculateHealthScore(project: Project): ProjectHealth {
  const factors: HealthFactor[] = [];

  // Progress factor
  const completed = project.tasks.filter(t => t.status === 'completed').length;
  const total = project.tasks.length;
  const recentCompletions = completionsInLast(project, 14); // days
  const progressScore = total > 0
    ? (completed / total) * 50 + Math.min(recentCompletions * 10, 50)
    : 50;
  factors.push({
    name: "Progress",
    score: progressScore,
    weight: 0.25,
    details: `${completed}/${total} tasks completed, ${recentCompletions} in last 2 weeks`
  });

  // Freshness factor
  const daysSinceActivity = daysSince(project.last_activity);
  const freshnessScore = daysSinceActivity < 7 ? 100 :
    daysSinceActivity < 14 ? 80 :
    daysSinceActivity < 30 ? 60 :
    daysSinceActivity < 60 ? 40 : 20;
  factors.push({
    name: "Freshness",
    score: freshnessScore,
    weight: 0.20,
    details: `Last activity ${daysSinceActivity} days ago`
  });

  // Clarity factor
  const vagueCount = countVagueTasks(project);
  const clarityScore = total > 0
    ? Math.max(0, 100 - (vagueCount / total) * 100)
    : 100;
  factors.push({
    name: "Clarity",
    score: clarityScore,
    weight: 0.15,
    details: `${vagueCount} tasks need clearer next actions`
  });

  // ... other factors

  const totalScore = factors.reduce(
    (sum, f) => sum + f.score * f.weight, 0
  );

  return {
    project_id: project.id,
    health_score: Math.round(totalScore),
    health_grade: scoreToGrade(totalScore),
    factors,
    issues: detectIssues(project, factors),
    suggestions: generateSuggestions(project, factors),
    last_calculated: now()
  };
}
```

## Zombie Task Detection

### What is a Zombie Task?

A task that exists but is effectively dead - unlikely to ever be completed:

```typescript
interface ZombieTask {
  task: Task;
  zombie_type: ZombieType;
  age_days: number;
  confidence: number;
  suggested_action: ZombieAction;
  rationale: string;
}

enum ZombieType {
  ANCIENT = "ancient",           // Very old, never touched
  PERPETUALLY_DEFERRED = "perpetually_deferred",  // Deferred repeatedly
  ABANDONED_PROJECT = "abandoned_project",  // In dead project
  VAGUE_FOREVER = "vague_forever",  // Always vague, never clarified
  DUPLICATE_IGNORED = "duplicate_ignored",  // Similar to completed task
  CONTEXT_LOST = "context_lost"  // Note references outdated things
}

enum ZombieAction {
  DROP = "drop",
  CLARIFY = "clarify",
  DEFER_LONG = "defer_long",     // Move to someday/maybe
  MERGE = "merge",
  DELEGATE = "delegate",
  BREAK_DOWN = "break_down"
}
```

### Detection Algorithm

```typescript
function detectZombieTasks(tasks: Task[]): ZombieTask[] {
  const zombies: ZombieTask[] = [];

  for (const task of tasks) {
    if (task.status !== 'active') continue;

    // Ancient tasks
    const age = daysSince(task.created_at);
    const lastTouch = daysSince(task.modified_at);
    if (age > 180 && lastTouch > 90) {
      zombies.push({
        task,
        zombie_type: ZombieType.ANCIENT,
        age_days: age,
        confidence: Math.min(0.5 + (age / 365) * 0.5, 1.0),
        suggested_action: ZombieAction.DROP,
        rationale: `Created ${age} days ago, untouched for ${lastTouch} days`
      });
      continue;
    }

    // Perpetually deferred
    const deferCount = countDeferrals(task);
    if (deferCount >= 3) {
      zombies.push({
        task,
        zombie_type: ZombieType.PERPETUALLY_DEFERRED,
        age_days: age,
        confidence: 0.7 + (deferCount * 0.05),
        suggested_action: ZombieAction.DEFER_LONG,
        rationale: `Deferred ${deferCount} times - may belong in someday/maybe`
      });
      continue;
    }

    // Vague forever
    if (isVague(task) && age > 30) {
      zombies.push({
        task,
        zombie_type: ZombieType.VAGUE_FOREVER,
        age_days: age,
        confidence: 0.6,
        suggested_action: ZombieAction.CLARIFY,
        rationale: "Task has been vague for over a month"
      });
    }
  }

  return zombies.sort((a, b) => b.confidence - a.confidence);
}

function isVague(task: Task): boolean {
  const vaguePatterns = [
    /^(think about|consider|look into|maybe|someday)/i,
    /^(stuff|things|misc)/i,
    /\?$/,  // Ends with question mark
  ];

  // Check title
  if (vaguePatterns.some(p => p.test(task.title))) return true;

  // Check if title is too short
  if (task.title.split(' ').length < 3) return true;

  // Check if missing verb
  if (!hasActionVerb(task.title)) return true;

  return false;
}
```

## Stalled Project Detection

### Enhanced Stalled Detection

Beyond basic "no remaining tasks", detect various stall patterns:

```typescript
interface StalledProject {
  project: Project;
  stall_type: StallType;
  stall_duration_days: number;
  blocking_reason?: string;
  suggested_actions: StallAction[];
}

enum StallType {
  EMPTY = "empty",                    // No remaining tasks
  BLOCKED = "blocked",                // First task blocked
  ALL_DEFERRED = "all_deferred",      // All tasks in future
  WAITING = "waiting",                // All tasks waiting on others
  NO_NEXT_ACTION = "no_next_action",  // Has tasks but none actionable
  INACTIVE = "inactive"               // No activity despite tasks
}

interface StallAction {
  action: string;
  description: string;
  auto_applicable: boolean;  // Can be auto-fixed
}
```

### Detection Logic

```typescript
function detectStalledProjects(projects: Project[]): StalledProject[] {
  const stalled: StalledProject[] = [];

  for (const project of projects) {
    if (project.status !== 'active') continue;
    if (project.type === 'single_actions') continue;

    const remaining = project.tasks.filter(t => t.status === 'active');
    const available = remaining.filter(t => isAvailable(t));

    // Empty project
    if (remaining.length === 0) {
      stalled.push({
        project,
        stall_type: StallType.EMPTY,
        stall_duration_days: daysSinceLastCompletion(project),
        suggested_actions: [
          { action: "add_task", description: "Add next action", auto_applicable: false },
          { action: "complete", description: "Mark project complete", auto_applicable: true },
          { action: "drop", description: "Drop project", auto_applicable: true }
        ]
      });
      continue;
    }

    // All deferred
    const allDeferred = remaining.every(t =>
      t.defer_date && t.defer_date > now()
    );
    if (allDeferred) {
      const nextDefer = Math.min(...remaining.map(t => t.defer_date));
      stalled.push({
        project,
        stall_type: StallType.ALL_DEFERRED,
        stall_duration_days: daysSince(project.last_activity),
        blocking_reason: `Next task available ${formatDate(nextDefer)}`,
        suggested_actions: [
          { action: "review_defers", description: "Review defer dates", auto_applicable: false },
          { action: "clear_defer", description: "Make a task available now", auto_applicable: true }
        ]
      });
      continue;
    }

    // No available actions
    if (available.length === 0 && remaining.length > 0) {
      stalled.push({
        project,
        stall_type: StallType.NO_NEXT_ACTION,
        stall_duration_days: daysSince(project.last_activity),
        blocking_reason: determineBlockingReason(remaining),
        suggested_actions: [
          { action: "unblock", description: "Remove blocker from first task", auto_applicable: false },
          { action: "add_available", description: "Add an available task", auto_applicable: false }
        ]
      });
      continue;
    }

    // Inactive despite having tasks
    const daysSinceActivity = daysSince(project.last_activity);
    if (daysSinceActivity > 30 && available.length > 0) {
      stalled.push({
        project,
        stall_type: StallType.INACTIVE,
        stall_duration_days: daysSinceActivity,
        blocking_reason: "Has available tasks but no recent activity",
        suggested_actions: [
          { action: "prioritize", description: "Flag or schedule a task", auto_applicable: false },
          { action: "hold", description: "Put project on hold", auto_applicable: true },
          { action: "review_relevance", description: "Is this still relevant?", auto_applicable: false }
        ]
      });
    }
  }

  return stalled;
}
```

## Smart Review Prioritization

### Review Queue Ordering

Instead of simple date order, prioritize by review urgency:

```typescript
interface ReviewQueueItem {
  project: Project;
  urgency_score: number;      // 0-100
  urgency_reasons: string[];
  recommended_time: Duration; // Estimated review time
}

function prioritizeReviewQueue(projects: Project[]): ReviewQueueItem[] {
  const needsReview = projects.filter(p =>
    p.status === 'active' &&
    (p.next_review_at <= now() || hasUrgentIssues(p))
  );

  return needsReview
    .map(p => ({
      project: p,
      urgency_score: calculateReviewUrgency(p),
      urgency_reasons: getUrgencyReasons(p),
      recommended_time: estimateReviewTime(p)
    }))
    .sort((a, b) => b.urgency_score - a.urgency_score);
}

function calculateReviewUrgency(project: Project): number {
  let score = 50; // Base score

  // Overdue review
  const daysOverdue = daysSince(project.next_review_at);
  if (daysOverdue > 0) {
    score += Math.min(daysOverdue * 2, 30);
  }

  // Stalled
  if (isStalled(project)) {
    score += 20;
  }

  // Has overdue tasks
  const overdueCount = countOverdueTasks(project);
  score += Math.min(overdueCount * 5, 15);

  // Low health score
  const health = getHealthScore(project);
  if (health < 50) {
    score += (50 - health) / 2;
  }

  // Has zombie tasks
  const zombieCount = countZombieTasks(project);
  score += Math.min(zombieCount * 3, 10);

  return Math.min(score, 100);
}
```

## Automated Cleanup Suggestions

### Cleanup Categories

```typescript
interface CleanupSuggestion {
  category: CleanupCategory;
  items: CleanupItem[];
  impact: "low" | "medium" | "high";
  auto_applicable: boolean;
}

enum CleanupCategory {
  DROP_ZOMBIES = "drop_zombies",
  COMPLETE_DONE = "complete_done",     // Tasks that are actually done
  MERGE_DUPLICATES = "merge_duplicates",
  ARCHIVE_INACTIVE = "archive_inactive",
  FIX_DATES = "fix_dates",             // Unrealistic due dates
  CLARIFY_VAGUE = "clarify_vague",
  ORGANIZE_INBOX = "organize_inbox"
}

interface CleanupItem {
  type: "task" | "project" | "tag";
  id: UUID;
  name: string;
  suggestion: string;
  reason: string;
}
```

### Cleanup Detection

```typescript
function generateCleanupSuggestions(data: SystemData): CleanupSuggestion[] {
  const suggestions: CleanupSuggestion[] = [];

  // Zombie tasks
  const zombies = detectZombieTasks(data.tasks);
  if (zombies.length > 0) {
    suggestions.push({
      category: CleanupCategory.DROP_ZOMBIES,
      items: zombies.map(z => ({
        type: "task",
        id: z.task.id,
        name: z.task.title,
        suggestion: z.suggested_action,
        reason: z.rationale
      })),
      impact: zombies.length > 10 ? "high" : "medium",
      auto_applicable: false
    });
  }

  // Probably-done tasks
  const probablyDone = findProbablyDoneTasks(data.tasks);
  if (probablyDone.length > 0) {
    suggestions.push({
      category: CleanupCategory.COMPLETE_DONE,
      items: probablyDone.map(t => ({
        type: "task",
        id: t.task.id,
        name: t.task.title,
        suggestion: "Mark complete",
        reason: t.reason
      })),
      impact: "medium",
      auto_applicable: true
    });
  }

  // Unrealistic due dates
  const unrealisticDates = findUnrealisticDueDates(data.tasks);
  if (unrealisticDates.length > 0) {
    suggestions.push({
      category: CleanupCategory.FIX_DATES,
      items: unrealisticDates.map(t => ({
        type: "task",
        id: t.task.id,
        name: t.task.title,
        suggestion: `Reschedule from ${formatDate(t.task.due_date)}`,
        reason: t.reason
      })),
      impact: "high",
      auto_applicable: false
    });
  }

  // Inbox items
  const oldInboxItems = data.tasks.filter(t =>
    !t.project_id && daysSince(t.created_at) > 7
  );
  if (oldInboxItems.length > 0) {
    suggestions.push({
      category: CleanupCategory.ORGANIZE_INBOX,
      items: oldInboxItems.map(t => ({
        type: "task",
        id: t.id,
        name: t.title,
        suggestion: "Process to project",
        reason: `In inbox for ${daysSince(t.created_at)} days`
      })),
      impact: oldInboxItems.length > 20 ? "high" : "medium",
      auto_applicable: false
    });
  }

  return suggestions;
}
```

## Review Session Flow

### AI-Guided Review

```typescript
interface ReviewSession {
  id: UUID;
  started_at: DateTime;
  projects_to_review: ReviewQueueItem[];
  current_index: number;
  completed_reviews: CompletedReview[];
  cleanup_suggestions: CleanupSuggestion[];
  session_stats: ReviewStats;
}

interface ReviewStats {
  projects_reviewed: number;
  tasks_completed: number;
  tasks_dropped: number;
  tasks_created: number;
  issues_resolved: number;
  time_spent: Duration;
}
```

### Review UI Flow

```
┌─────────────────────────────────────────────────────────┐
│ 🔄 Weekly Review                           [2/8 projects]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Project: Website Redesign                                │
│ Health: C (62/100)  │  Last reviewed: 12 days ago       │
│                                                          │
│ ⚠️ Issues detected:                                      │
│   • Stalled - no available tasks (all deferred)         │
│   • 2 tasks overdue                                      │
│   • 1 zombie task (180 days old)                        │
│                                                          │
│ 📋 Tasks (5 remaining):                                 │
│   🔴 ☐ Finalize mockups (overdue 3 days)               │
│   🔴 ☐ Get client feedback (overdue 1 day)             │
│   ⏸️ ☐ Implement homepage (deferred to Jan 15)         │
│   ⏸️ ☐ Test on mobile (deferred to Jan 20)             │
│   💀 ☐ Research competitors (180 days, untouched)       │
│                                                          │
│ 💡 Suggested actions:                                   │
│   [Drop zombie task] [Reschedule overdue] [Clear defer] │
│                                                          │
│ ───────────────────────────────────────────────────────  │
│                                                          │
│ [Skip] [Mark Reviewed] [Complete Project] [Drop Project]│
│                                                          │
│ Progress: ████████░░░░░░░░ 25%   ~12 min remaining      │
└─────────────────────────────────────────────────────────┘
```

## Review Summary Generation

### Post-Review Report

```typescript
interface ReviewSummary {
  session_id: UUID;
  completed_at: DateTime;
  duration: Duration;

  // Statistics
  projects_reviewed: number;
  total_projects: number;
  tasks_completed: number;
  tasks_dropped: number;
  tasks_created: number;

  // Health changes
  health_improvements: HealthChange[];
  health_declines: HealthChange[];

  // Issues
  issues_found: number;
  issues_resolved: number;
  remaining_issues: ProjectIssue[];

  // AI insights
  insights: ReviewInsight[];
  recommendations: string[];
}

interface ReviewInsight {
  type: "observation" | "trend" | "recommendation";
  message: string;
  data?: any;
}
```

### BAML Schema for Insights

```baml
class ReviewInsights {
  observations string[] @description("Notable patterns or issues observed")
  trends string[] @description("Changes compared to previous reviews")
  recommendations string[] @description("Actionable suggestions")
  celebration string? @description("Positive acknowledgment if warranted")
}

function GenerateReviewInsights(
  session_stats: string,
  health_changes: string,
  issues_summary: string,
  previous_reviews: string
) -> ReviewInsights {
  client Claude
  prompt #"
    Generate insights from this review session.

    Session statistics:
    {{ session_stats }}

    Health changes:
    {{ health_changes }}

    Issues summary:
    {{ issues_summary }}

    Previous review patterns:
    {{ previous_reviews }}

    Guidelines:
    - Be specific and actionable
    - Note positive trends as well as concerns
    - Limit to 3-5 key insights
    - Include celebration if user made good progress

    {{ ctx.output_format }}
  "#
}
```

### Summary UI

```
┌─────────────────────────────────────────────────────────┐
│ ✅ Review Complete!                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Session Summary (23 minutes)                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                          │
│ 📊 Statistics                                           │
│   • 8 projects reviewed                                 │
│   • 12 tasks completed                                  │
│   • 5 tasks dropped                                     │
│   • 3 new tasks created                                 │
│   • 7 issues resolved                                   │
│                                                          │
│ 📈 Health Improvements                                  │
│   • Website Redesign: C → B (+15)                       │
│   • Q1 Planning: D → C (+18)                           │
│                                                          │
│ 💡 Insights                                             │
│   • You've cleared your backlog of zombie tasks         │
│   • 3 projects haven't had activity in 30+ days         │
│   • Consider batching your "waiting for" tasks          │
│                                                          │
│ 🎉 Great job! Your system health improved 12% overall.  │
│                                                          │
│ [View Full Report] [Schedule Next Review] [Done]        │
└─────────────────────────────────────────────────────────┘
```

## API Endpoints

### Get Project Health

```
GET /api/projects/{project_id}/health

Response: ProjectHealth
```

### Get All Health Scores

```
GET /api/health/overview

Response: {
  overall_score: number,
  grade: HealthGrade,
  projects: ProjectHealth[],
  top_issues: ProjectIssue[],
  zombies: ZombieTask[],
  stalled: StalledProject[]
}
```

### Get Review Queue

```
GET /api/review/queue

Response: {
  queue: ReviewQueueItem[],
  total_estimated_time: Duration,
  overdue_count: number
}
```

### Start Review Session

```
POST /api/review/start

Response: ReviewSession
```

### Complete Project Review

```
POST /api/review/session/{session_id}/complete/{project_id}
Body: {
  actions_taken: ReviewAction[]
}

Response: {
  session: ReviewSession,
  next_project: ReviewQueueItem | null
}
```

### Get Cleanup Suggestions

```
GET /api/cleanup/suggestions

Response: {
  suggestions: CleanupSuggestion[],
  estimated_cleanup_time: Duration
}
```

### Apply Cleanup

```
POST /api/cleanup/apply
Body: {
  category: CleanupCategory,
  item_ids: UUID[],
  action: string
}

Response: {
  applied: number,
  failed: number,
  errors: string[]
}
```

### Generate Review Summary

```
POST /api/review/session/{session_id}/summary

Response: ReviewSummary
```

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `review.smart_prioritization` | Boolean | true | Use AI to order review queue |
| `review.show_health_scores` | Boolean | true | Display health metrics |
| `review.zombie_threshold_days` | Integer | 180 | Days before task is zombie |
| `review.stale_threshold_days` | Integer | 30 | Days of inactivity for stale |
| `review.auto_detect_issues` | Boolean | true | Automatically find problems |
| `review.generate_insights` | Boolean | true | AI-generated review insights |
| `review.cleanup_suggestions` | Boolean | true | Show cleanup recommendations |
| `review.session_reminders` | Boolean | true | Remind to complete review |

## Performance

| Operation | Target Latency |
|-----------|---------------|
| Health score (single) | < 100ms |
| Health overview (all) | < 500ms |
| Zombie detection | < 300ms |
| Stalled detection | < 200ms |
| Review queue | < 200ms |
| Generate summary | < 1s |

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
