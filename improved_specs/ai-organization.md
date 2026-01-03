# AI-Powered Organization Specification

This specification extends `specs/project.md`, `specs/folder.md`, and `specs/tag.md` with intelligent organization capabilities. The system helps users structure their tasks through auto-tagging, task breakdown, project clustering, and template recommendations.

## Overview

Traditional task managers require manual organization. AI-native organization assists by:
- **Auto-tagging**: Suggesting tags based on task content analysis
- **Task breakdown**: Decomposing large tasks into actionable subtasks
- **Project clustering**: Detecting when loose tasks should become a project
- **Template recommendations**: Suggesting project structures for common goals
- **Related task discovery**: Finding similar or connected tasks

## Auto-Tagging System

### Tag Suggestion Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Auto-Tag Engine                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Content    │  │   Pattern    │  │   Entity     │  │
│  │   Analyzer   │  │   Matcher    │  │   Extractor  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│         └─────────────────┼──────────────────┘          │
│                           │                             │
│                    ┌──────▼───────┐                     │
│                    │   Ranker     │                     │
│                    │  (confidence │                     │
│                    │   scoring)   │                     │
│                    └──────────────┘                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Data Model

```typescript
interface TagSuggestion {
  tag_id?: UUID;          // Existing tag match
  tag_name: string;       // Tag name (may be new)
  confidence: number;     // 0-1 confidence score
  reason: TagSuggestionReason;
  is_new_tag: boolean;    // Would create new tag
  parent_suggestion?: UUID; // Suggested parent if new
}

enum TagSuggestionReason {
  KEYWORD_MATCH = "keyword_match",       // Direct word match
  SEMANTIC_MATCH = "semantic_match",     // Meaning-based match
  ENTITY_DETECTED = "entity_detected",   // Person, place, etc.
  PATTERN_LEARNED = "pattern_learned",   // From user history
  PROJECT_DEFAULT = "project_default",   // Project has this tag
  SIMILAR_TASKS = "similar_tasks"        // Other similar tasks have this
}
```

### Content Analysis

Extract signals from task content:

```typescript
interface ContentAnalysis {
  // Named entities
  people: string[];           // "John", "Sarah"
  places: string[];           // "office", "downtown"
  organizations: string[];    // "Acme Corp"

  // Task characteristics
  action_type: ActionType;    // call, email, write, buy, etc.
  energy_level: EnergyLevel;  // inferred from complexity
  context_hints: string[];    // "at computer", "phone needed"

  // Keywords
  keywords: string[];
  topics: string[];
}

enum ActionType {
  CALL = "call",
  EMAIL = "email",
  WRITE = "write",
  READ = "read",
  BUY = "buy",
  MEET = "meet",
  REVIEW = "review",
  CREATE = "create",
  FIX = "fix",
  RESEARCH = "research",
  OTHER = "other"
}
```

### Tag Matching Strategies

#### 1. Keyword Matching
```typescript
function keywordMatch(content: string, tags: Tag[]): TagSuggestion[] {
  const suggestions: TagSuggestion[] = [];

  for (const tag of tags) {
    // Check tag name in content
    if (content.toLowerCase().includes(tag.name.toLowerCase())) {
      suggestions.push({
        tag_id: tag.id,
        tag_name: tag.name,
        confidence: 0.9,
        reason: TagSuggestionReason.KEYWORD_MATCH,
        is_new_tag: false
      });
    }

    // Check tag aliases/synonyms if defined
    for (const alias of tag.aliases || []) {
      if (content.toLowerCase().includes(alias.toLowerCase())) {
        suggestions.push({
          tag_id: tag.id,
          tag_name: tag.name,
          confidence: 0.8,
          reason: TagSuggestionReason.KEYWORD_MATCH,
          is_new_tag: false
        });
      }
    }
  }

  return suggestions;
}
```

#### 2. Semantic Matching (LLM-based)
```typescript
function semanticMatch(
  content: string,
  tags: Tag[],
  task_history: Task[]
): TagSuggestion[] {
  // Use LLM to understand task intent and match to tag meanings
  const analysis = await analyzeSemantic(content, tags);

  return analysis.matches.map(m => ({
    tag_id: m.tag_id,
    tag_name: m.tag_name,
    confidence: m.confidence,
    reason: TagSuggestionReason.SEMANTIC_MATCH,
    is_new_tag: false
  }));
}
```

#### 3. Entity Extraction
```typescript
function entityMatch(content: string, tags: Tag[]): TagSuggestion[] {
  const entities = extractEntities(content);
  const suggestions: TagSuggestion[] = [];

  // Match people to person tags
  for (const person of entities.people) {
    const personTag = findTagByName(person, tags, "people");
    if (personTag) {
      suggestions.push({
        tag_id: personTag.id,
        tag_name: personTag.name,
        confidence: 0.95,
        reason: TagSuggestionReason.ENTITY_DETECTED,
        is_new_tag: false
      });
    } else {
      // Suggest creating new person tag
      suggestions.push({
        tag_name: person,
        confidence: 0.7,
        reason: TagSuggestionReason.ENTITY_DETECTED,
        is_new_tag: true,
        parent_suggestion: findTagByName("People", tags)?.id
      });
    }
  }

  return suggestions;
}
```

#### 4. Pattern Learning
```typescript
function patternMatch(
  content: string,
  user_history: TaskHistory[]
): TagSuggestion[] {
  // Find similar past tasks and their tags
  const similar = findSimilarTasks(content, user_history, 10);

  // Count tag frequency in similar tasks
  const tagCounts = new Map<UUID, number>();
  for (const task of similar) {
    for (const tag_id of task.tags) {
      tagCounts.set(tag_id, (tagCounts.get(tag_id) || 0) + 1);
    }
  }

  // Suggest tags that appear in >50% of similar tasks
  return Array.from(tagCounts.entries())
    .filter(([_, count]) => count >= similar.length * 0.5)
    .map(([tag_id, count]) => ({
      tag_id,
      tag_name: getTagName(tag_id),
      confidence: count / similar.length,
      reason: TagSuggestionReason.PATTERN_LEARNED,
      is_new_tag: false
    }));
}
```

### BAML Schema for Tag Suggestion

```baml
class TagAnalysis {
  suggested_tags TagSuggestion[]
  detected_entities DetectedEntities
  inferred_action_type string
  new_tag_recommendations NewTagRecommendation[]
}

class TagSuggestion {
  tag_name string
  confidence float @description("0-1 confidence score")
  reason string @description("Why this tag is suggested")
}

class DetectedEntities {
  people string[]
  places string[]
  organizations string[]
}

class NewTagRecommendation {
  name string
  suggested_parent string?
  rationale string
}

function AnalyzeForTags(
  task_title: string,
  task_note: string,
  existing_tags: string[],
  tag_hierarchy: string
) -> TagAnalysis {
  client Claude
  prompt #"
    Analyze this task and suggest appropriate tags.

    Task: {{ task_title }}
    Note: {{ task_note }}

    Existing tags in system:
    {{ existing_tags }}

    Tag hierarchy:
    {{ tag_hierarchy }}

    Guidelines:
    - Match to existing tags when possible
    - Suggest new tags only if clearly needed
    - Extract people, places, organizations mentioned
    - Identify the type of action (call, email, write, etc.)
    - Consider context clues (at computer, errands, etc.)

    {{ ctx.output_format }}
  "#
}
```

## Task Breakdown System

### Subtask Generation

Automatically decompose large tasks into actionable subtasks:

```typescript
interface TaskBreakdown {
  original_task: Task;
  suggested_subtasks: SubtaskSuggestion[];
  estimated_total_duration: Duration;
  recommended_project_type: ProjectType;
  confidence: number;
}

interface SubtaskSuggestion {
  title: string;
  order: number;
  estimated_duration?: Duration;
  dependencies: number[];  // Indices of prerequisite subtasks
  tags?: string[];
  is_optional: boolean;
}
```

### Breakdown Triggers

When to offer task breakdown:

| Trigger | Example |
|---------|---------|
| Long estimated duration | Task > 2 hours |
| Complex title | Contains "and", multiple verbs |
| Vague scope | "Work on project", "Handle situation" |
| User request | "Break this down" command |
| Project creation | New project from task |

### Breakdown Algorithm

```typescript
async function generateBreakdown(task: Task): Promise<TaskBreakdown> {
  // Analyze task complexity
  const complexity = analyzeComplexity(task);

  if (complexity.score < 0.5) {
    return null;  // Task is already atomic
  }

  // Use LLM to generate subtasks
  const breakdown = await llmGenerateSubtasks(task);

  // Validate and refine
  return {
    original_task: task,
    suggested_subtasks: breakdown.subtasks.map((s, i) => ({
      ...s,
      order: i,
      dependencies: inferDependencies(s, breakdown.subtasks)
    })),
    estimated_total_duration: sumDurations(breakdown.subtasks),
    recommended_project_type: inferProjectType(breakdown.subtasks),
    confidence: breakdown.confidence
  };
}
```

### BAML Schema for Task Breakdown

```baml
class TaskBreakdown {
  subtasks Subtask[]
  project_type string @description("parallel | sequential | single_actions")
  rationale string
  confidence float
}

class Subtask {
  title string @description("Clear, actionable subtask title")
  estimated_minutes int?
  depends_on int[] @description("Indices of prerequisite subtasks")
  is_optional bool
  notes string?
}

function BreakdownTask(
  task_title: string,
  task_note: string,
  context: string
) -> TaskBreakdown {
  client Claude
  prompt #"
    Break down this task into actionable subtasks.

    Task: {{ task_title }}
    Notes: {{ task_note }}
    Context: {{ context }}

    Guidelines:
    - Each subtask should be a single, clear action
    - Include time estimates when possible
    - Mark dependencies between subtasks
    - Identify which subtasks are optional
    - Recommend whether subtasks should be sequential or parallel
    - Keep subtasks at a similar level of granularity

    {{ ctx.output_format }}
  "#
}
```

### Breakdown UI

```
┌─────────────────────────────────────────────────────────┐
│ 🔧 Break down: "Plan company offsite"                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Suggested subtasks (sequential):                         │
│                                                          │
│ ☑ 1. Set date and get headcount (30 min)                │
│ ☑ 2. Research venue options (1 hr)                       │
│ ☑ 3. Book venue (15 min) - depends on #2                │
│ ☑ 4. Plan agenda and activities (1 hr) - depends on #1  │
│ ☑ 5. Send calendar invites (15 min) - depends on #3, #4 │
│ ☐ 6. Arrange catering (optional) (30 min)               │
│                                                          │
│ Total: ~3.5 hours                                        │
│                                                          │
│ [Create as Project] [Create Subtasks] [Cancel]          │
└─────────────────────────────────────────────────────────┘
```

## Project Clustering

### Detecting Project Candidates

Identify when loose tasks should become a project:

```typescript
interface ProjectCluster {
  suggested_name: string;
  tasks: Task[];
  common_themes: string[];
  recommended_type: ProjectType;
  confidence: number;
  rationale: string;
}

function detectProjectClusters(tasks: Task[]): ProjectCluster[] {
  // Only consider inbox items and unfiled tasks
  const candidates = tasks.filter(t =>
    !t.project_id && t.status === 'active'
  );

  if (candidates.length < 3) return [];

  // Group by semantic similarity
  const embeddings = await getEmbeddings(candidates);
  const clusters = clusterByEmbedding(embeddings, {
    min_cluster_size: 3,
    similarity_threshold: 0.7
  });

  return clusters.map(cluster => ({
    suggested_name: generateProjectName(cluster.tasks),
    tasks: cluster.tasks,
    common_themes: extractThemes(cluster.tasks),
    recommended_type: inferProjectType(cluster.tasks),
    confidence: cluster.cohesion_score,
    rationale: generateRationale(cluster)
  }));
}
```

### Clustering Signals

| Signal | Weight | Description |
|--------|--------|-------------|
| Semantic similarity | 0.35 | Task titles/notes about same topic |
| Shared tags | 0.25 | Tasks have common tags |
| Temporal proximity | 0.15 | Created around same time |
| Shared entities | 0.15 | Same people/places mentioned |
| Action sequence | 0.10 | Tasks form logical workflow |

### Cluster Notification

```
┌─────────────────────────────────────────────────────────┐
│ 💡 Related tasks detected                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ These 4 inbox items seem related:                        │
│                                                          │
│   • Research venue options                               │
│   • Get catering quotes                                  │
│   • Send team survey for dates                           │
│   • Book conference room backup                          │
│                                                          │
│ Create project "Team Offsite Planning"?                  │
│                                                          │
│ [Create Project] [Not Related] [Remind Later]           │
└─────────────────────────────────────────────────────────┘
```

## Project Templates

### Template System

Pre-defined structures for common project types:

```typescript
interface ProjectTemplate {
  id: UUID;
  name: string;
  description: string;
  category: string;
  tasks: TemplateTask[];
  default_type: ProjectType;
  default_tags: string[];
  variables: TemplateVariable[];
  popularity_score: number;
}

interface TemplateTask {
  title_template: string;  // "Book venue for {{event_name}}"
  relative_defer_days?: number;
  relative_due_days?: number;
  estimated_duration?: Duration;
  subtasks?: TemplateTask[];
  tags?: string[];
}

interface TemplateVariable {
  name: string;
  type: "string" | "date" | "person" | "number";
  prompt: string;
  required: boolean;
}
```

### Built-in Templates

```yaml
- name: "Event Planning"
  category: "Events"
  variables:
    - name: event_name
      type: string
      prompt: "What's the event?"
    - name: event_date
      type: date
      prompt: "When is it?"
  tasks:
    - title: "Set date and budget for {{event_name}}"
      relative_due_days: -30
    - title: "Book venue"
      relative_due_days: -21
    - title: "Send invitations"
      relative_due_days: -14
    - title: "Confirm catering"
      relative_due_days: -7
    - title: "Final preparations"
      relative_due_days: -1

- name: "Blog Post"
  category: "Content"
  tasks:
    - title: "Research topic"
    - title: "Create outline"
    - title: "Write first draft"
    - title: "Edit and revise"
    - title: "Add images"
    - title: "Publish and promote"

- name: "Hiring Process"
  category: "HR"
  variables:
    - name: role
      type: string
      prompt: "What role?"
  tasks:
    - title: "Write job description for {{role}}"
    - title: "Post to job boards"
    - title: "Review applications"
    - title: "Schedule interviews"
    - title: "Conduct interviews"
    - title: "Check references"
    - title: "Make offer"
```

### Template Recommendation

Suggest templates based on task/project intent:

```typescript
function recommendTemplate(
  input: string,
  templates: ProjectTemplate[]
): TemplateRecommendation[] {
  // Semantic match input to template descriptions
  const matches = await semanticMatch(input, templates);

  return matches
    .filter(m => m.confidence > 0.6)
    .slice(0, 3)
    .map(m => ({
      template: m.template,
      confidence: m.confidence,
      variable_suggestions: inferVariables(input, m.template)
    }));
}
```

## Related Task Discovery

### Finding Connected Tasks

```typescript
interface RelatedTask {
  task: Task;
  relationship: TaskRelationship;
  relevance_score: number;
}

enum TaskRelationship {
  SAME_PROJECT = "same_project",
  SAME_TAGS = "same_tags",
  SEMANTIC_SIMILAR = "semantic_similar",
  SAME_PERSON = "same_person",
  PREREQUISITE = "prerequisite",
  FOLLOW_UP = "follow_up",
  DUPLICATE = "duplicate"
}

function findRelatedTasks(
  task: Task,
  all_tasks: Task[],
  limit: number = 5
): RelatedTask[] {
  const candidates = all_tasks.filter(t => t.id !== task.id);
  const scored: RelatedTask[] = [];

  for (const candidate of candidates) {
    const relationships = detectRelationships(task, candidate);
    if (relationships.length > 0) {
      scored.push({
        task: candidate,
        relationship: relationships[0].type,
        relevance_score: relationships[0].score
      });
    }
  }

  return scored
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, limit);
}
```

### Relationship Detection

```typescript
function detectRelationships(task1: Task, task2: Task): Relationship[] {
  const relationships: Relationship[] = [];

  // Same project
  if (task1.project_id && task1.project_id === task2.project_id) {
    relationships.push({
      type: TaskRelationship.SAME_PROJECT,
      score: 0.9
    });
  }

  // Shared tags
  const sharedTags = intersection(task1.tags, task2.tags);
  if (sharedTags.length > 0) {
    relationships.push({
      type: TaskRelationship.SAME_TAGS,
      score: 0.3 + (0.1 * sharedTags.length)
    });
  }

  // Semantic similarity
  const similarity = await semanticSimilarity(task1, task2);
  if (similarity > 0.7) {
    relationships.push({
      type: TaskRelationship.SEMANTIC_SIMILAR,
      score: similarity
    });
  }

  // Check for duplicates
  if (similarity > 0.95) {
    relationships.push({
      type: TaskRelationship.DUPLICATE,
      score: similarity
    });
  }

  return relationships;
}
```

### Related Tasks UI

```
Task: "Call John about Q2 budget"

Related:
├── 📋 Same project: Q2 Planning
│   └── ☐ Finalize Q2 projections
├── 🏷️ Same tags: @John, @finance
│   └── ☐ Review John's expense report
└── 🔗 Similar tasks:
    └── ☐ Email John meeting notes
```

## Tag Cleanup & Reorganization

### Tag Health Analysis

```typescript
interface TagHealth {
  tag: Tag;
  health_score: number;  // 0-1
  issues: TagIssue[];
  suggestions: TagSuggestion[];
}

interface TagIssue {
  type: TagIssueType;
  severity: "low" | "medium" | "high";
  description: string;
}

enum TagIssueType {
  UNUSED = "unused",              // No tasks use this tag
  RARELY_USED = "rarely_used",    // Very few tasks
  DUPLICATE_NAME = "duplicate",   // Similar name to another tag
  ORPHANED = "orphaned",          // Parent deleted
  TOO_BROAD = "too_broad",        // Used on too many diverse tasks
  INCONSISTENT = "inconsistent"   // Similar tasks don't have it
}
```

### Cleanup Recommendations

```typescript
function analyzeTagHealth(tags: Tag[], tasks: Task[]): TagHealth[] {
  return tags.map(tag => {
    const issues: TagIssue[] = [];
    const suggestions: TagSuggestion[] = [];

    // Check usage
    const usage = tasks.filter(t => t.tags.includes(tag.id));
    if (usage.length === 0) {
      issues.push({
        type: TagIssueType.UNUSED,
        severity: "medium",
        description: "This tag has no tasks"
      });
    } else if (usage.length < 3) {
      issues.push({
        type: TagIssueType.RARELY_USED,
        severity: "low",
        description: `Only ${usage.length} tasks use this tag`
      });
    }

    // Check for similar tags
    const similar = findSimilarTags(tag, tags);
    if (similar.length > 0) {
      issues.push({
        type: TagIssueType.DUPLICATE_NAME,
        severity: "medium",
        description: `Similar to: ${similar.map(s => s.name).join(", ")}`
      });
      suggestions.push({
        action: "merge",
        target: similar[0],
        rationale: "These tags appear to be duplicates"
      });
    }

    return {
      tag,
      health_score: calculateHealthScore(issues),
      issues,
      suggestions
    };
  });
}
```

### Periodic Cleanup

```
┌─────────────────────────────────────────────────────────┐
│ 🧹 Tag Cleanup Suggestions                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ⚠️ Unused tags (consider deleting):                     │
│   • @old-project (0 tasks, created 6 months ago)        │
│   • @temp (0 tasks)                                     │
│                                                          │
│ 🔄 Possible duplicates (consider merging):              │
│   • @email and @emails → merge into @email?             │
│   • @John and @john-smith → merge?                      │
│                                                          │
│ 📊 Inconsistent tagging:                                │
│   • 5 tasks mention "budget" but lack @finance tag      │
│                                                          │
│ [Review All] [Auto-fix Safe Issues] [Dismiss]           │
└─────────────────────────────────────────────────────────┘
```

## API Endpoints

### Get Tag Suggestions

```
POST /api/tags/suggest
Body: {
  task_title: string,
  task_note?: string,
  existing_tags?: UUID[]
}

Response: {
  suggestions: TagSuggestion[],
  new_tag_recommendations: NewTagRecommendation[]
}
```

### Generate Task Breakdown

```
POST /api/tasks/{task_id}/breakdown
Body: {
  context?: string
}

Response: TaskBreakdown
```

### Apply Breakdown

```
POST /api/tasks/{task_id}/apply-breakdown
Body: {
  subtask_indices: number[],  // Which suggested subtasks to create
  create_as_project: boolean,
  project_name?: string,
  project_type?: ProjectType
}

Response: {
  created_tasks: Task[],
  project?: Project
}
```

### Detect Project Clusters

```
GET /api/inbox/clusters

Response: {
  clusters: ProjectCluster[]
}
```

### Get Template Recommendations

```
POST /api/templates/recommend
Body: {
  query: string
}

Response: {
  recommendations: TemplateRecommendation[]
}
```

### Get Related Tasks

```
GET /api/tasks/{task_id}/related
Query: limit=5

Response: {
  related: RelatedTask[]
}
```

### Analyze Tag Health

```
GET /api/tags/health

Response: {
  tags: TagHealth[],
  overall_score: number,
  top_issues: TagIssue[]
}
```

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `organization.auto_tag` | Boolean | true | Suggest tags automatically |
| `organization.auto_tag_threshold` | Float | 0.7 | Min confidence for suggestions |
| `organization.breakdown_threshold` | Duration | 2h | Suggest breakdown for tasks longer than this |
| `organization.detect_clusters` | Boolean | true | Find related inbox items |
| `organization.cluster_min_size` | Integer | 3 | Min tasks to form cluster |
| `organization.show_related` | Boolean | true | Show related tasks |
| `organization.tag_cleanup_interval` | Duration | 30d | How often to suggest cleanup |
| `organization.learn_patterns` | Boolean | true | Learn from user tagging |

## Privacy & Performance

### Privacy
- Content analysis happens on-device when possible
- LLM calls use task titles only (not notes) by default
- User can disable pattern learning
- No sharing of task content without consent

### Performance

| Operation | Target Latency |
|-----------|---------------|
| Tag suggestions | < 300ms |
| Task breakdown | < 1s |
| Cluster detection | < 500ms |
| Related task search | < 200ms |
| Template match | < 100ms |

## Related Specifications

- `specs/project.md` - Project data model
- `specs/tag.md` - Tag system
- `specs/folder.md` - Folder hierarchy
- `specs/inbox.md` - Inbox processing
- `improved_specs/ai-capture.md` - Task capture with extraction
- `improved_specs/ai-processing-reference.md` - BAML patterns

## Sources

- [AI Subtask Generation - Dart](https://www.itsdart.com/features/ai-subtask-generation)
- [ClickUp AI Subtask Generator](https://clickup.com/p/features/ai/subtask-generator)
- [AI Content Tagging Tools](https://numerous.ai/blog/ai-content-tagging)
- [Auto-tagging with AI - Kontent.ai](https://kontent.ai/blog/ai-based-auto-tagging-of-content-what-you-need-to-know/)
- [ML Recommendation Systems](https://www.itransition.com/machine-learning/recommendation-systems)
