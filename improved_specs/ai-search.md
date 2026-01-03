# AI-Powered Search & Query Specification

This specification extends `specs/search.md`, `specs/perspectives.md`, and `specs/custom-perspectives.md` with AI-native search capabilities. The system enables semantic search, natural language queries, conversational task discovery, and intelligent perspective creation.

## Overview

Traditional search relies on keyword matching. AI-native search transforms how users find and filter tasks:
- **Semantic search**: Find tasks by meaning, not just keywords
- **Natural language perspectives**: Create complex filters by describing what you want
- **Conversational queries**: Ask questions about your tasks in natural language
- **Smart suggestions**: AI recommends query refinements and related searches

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Search Engine                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐   │
│  │  Keyword    │   │  Vector     │   │  LLM Query          │   │
│  │  Search     │   │  Search     │   │  Processor          │   │
│  │  (BM25)     │   │  (Semantic) │   │  (NL → Structure)   │   │
│  └──────┬──────┘   └──────┬──────┘   └──────────┬──────────┘   │
│         │                 │                      │               │
│         └─────────────────┼──────────────────────┘               │
│                           │                                      │
│                    ┌──────▼───────┐                             │
│                    │   Hybrid     │                             │
│                    │   Ranker     │                             │
│                    └──────┬───────┘                             │
│                           │                                      │
│                    ┌──────▼───────┐                             │
│                    │  Context     │                             │
│                    │  Enricher    │                             │
│                    └──────────────┘                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Model

### SearchQuery

User query with AI interpretation:

```typescript
interface SearchQuery {
  // Original input
  raw_query: string;
  query_type: "keyword" | "semantic" | "natural_language" | "conversational";

  // AI interpretation
  interpreted_intent?: QueryIntent;
  structured_filters?: FilterRule;
  semantic_embedding?: number[];  // Vector for similarity search

  // Context
  search_context: SearchContext;
  conversation_id?: UUID;  // For multi-turn queries
}
```

### QueryIntent

AI-extracted intent from natural language:

```typescript
interface QueryIntent {
  // What user is looking for
  action: "find_tasks" | "find_projects" | "count" | "summarize" | "analyze";

  // Extracted constraints
  temporal?: {
    due_window?: DateRange;
    defer_window?: DateRange;
    created_window?: DateRange;
    modified_window?: DateRange;
  };

  organizational?: {
    projects?: string[];      // Project names/patterns
    folders?: string[];       // Folder names/patterns
    tags?: string[];          // Tag names/patterns
    in_inbox?: boolean;
  };

  status?: {
    availability?: "available" | "remaining" | "all";
    completion?: "completed" | "incomplete" | "any";
    flagged?: boolean;
    overdue?: boolean;
  };

  effort?: {
    duration_max?: number;    // Minutes
    duration_min?: number;
    energy_level?: "high" | "medium" | "low";
  };

  semantic?: {
    topic?: string;           // Conceptual topic
    similar_to?: string;      // Find similar to this description
    keywords?: string[];      // Must contain these terms
  };

  // Confidence
  confidence: number;
  ambiguities?: string[];     // Areas needing clarification
}
```

### SearchResult

Enriched search result:

```typescript
interface SearchResult {
  item: Task | Project | Folder | Tag;
  item_type: "task" | "project" | "folder" | "tag";

  // Relevance scoring
  relevance_score: number;
  keyword_score?: number;
  semantic_score?: number;

  // Match details
  match_highlights: MatchHighlight[];
  match_explanation?: string;  // "Matches 'quarterly report' topic"

  // Context
  project_path?: string[];
  related_items?: UUID[];
}

interface MatchHighlight {
  field: "title" | "note" | "tag" | "project";
  text: string;
  match_start: number;
  match_end: number;
}
```

### SearchContext

Context affecting search behavior:

```typescript
interface SearchContext {
  // Scope
  scope: "here" | "remaining" | "everything" | "focused";
  focus_scope?: UUID[];  // If focus mode active

  // User context
  current_perspective?: string;
  recent_searches?: string[];
  recent_tasks?: UUID[];

  // Preferences
  include_completed?: boolean;
  include_dropped?: boolean;
  respect_defer_dates?: boolean;
}
```

## Semantic Search

### Vector Embeddings

All searchable content is embedded for semantic search:

```typescript
interface EmbeddingIndex {
  // What gets embedded
  task_embeddings: Map<UUID, TaskEmbedding>;
  project_embeddings: Map<UUID, ProjectEmbedding>;

  // Index metadata
  model: string;           // e.g., "text-embedding-3-small"
  dimension: number;       // e.g., 1536
  last_updated: DateTime;
}

interface TaskEmbedding {
  task_id: UUID;
  embedding: number[];     // Dense vector
  embedded_text: string;   // What was embedded (title + note + tags)
  created_at: DateTime;
}
```

### Embedding Content

What gets combined for task embeddings:

```typescript
function createTaskEmbeddingText(task: Task): string {
  const parts = [
    task.title,
    task.note || "",
    task.tags.map(t => t.name).join(" "),
    task.project?.name || "",
    task.project?.note || ""
  ];

  return parts.filter(Boolean).join(" | ");
}
```

### Similarity Search

```typescript
async function semanticSearch(
  query: string,
  context: SearchContext,
  limit: number = 20
): Promise<SearchResult[]> {
  // 1. Embed the query
  const query_embedding = await embed(query);

  // 2. Find similar items
  const candidates = vectorIndex.findSimilar(
    query_embedding,
    limit * 2,  // Get extra for filtering
    context.scope
  );

  // 3. Apply scope filters
  const filtered = candidates.filter(c =>
    passesScope(c.item, context)
  );

  // 4. Return with scores
  return filtered.slice(0, limit).map(c => ({
    item: c.item,
    item_type: c.item_type,
    relevance_score: c.similarity,
    semantic_score: c.similarity,
    match_highlights: [],
    match_explanation: `Semantically similar to "${query}"`
  }));
}
```

### Index Maintenance

```typescript
// Update embeddings incrementally
async function updateEmbeddingIndex(
  change: ItemChange
): Promise<void> {
  switch (change.type) {
    case "create":
    case "update":
      const text = createTaskEmbeddingText(change.item);
      const embedding = await embed(text);
      await index.upsert(change.item.id, embedding);
      break;

    case "delete":
      await index.delete(change.item.id);
      break;
  }
}

// Background reindexing
async function reindexAll(): Promise<void> {
  const tasks = await getAllTasks();
  const batch_size = 100;

  for (let i = 0; i < tasks.length; i += batch_size) {
    const batch = tasks.slice(i, i + batch_size);
    const texts = batch.map(createTaskEmbeddingText);
    const embeddings = await embedBatch(texts);

    await index.upsertBatch(
      batch.map((t, idx) => ({ id: t.id, embedding: embeddings[idx] }))
    );
  }
}
```

## Hybrid Search

Combines keyword and semantic search for best results:

```typescript
async function hybridSearch(
  query: string,
  context: SearchContext,
  options: HybridSearchOptions = {}
): Promise<SearchResult[]> {
  const {
    keyword_weight = 0.4,
    semantic_weight = 0.6,
    limit = 20
  } = options;

  // Run both searches in parallel
  const [keyword_results, semantic_results] = await Promise.all([
    keywordSearch(query, context, limit * 2),
    semanticSearch(query, context, limit * 2)
  ]);

  // Merge and re-rank
  const merged = mergeResults(keyword_results, semantic_results);

  // Apply hybrid scoring
  return merged
    .map(r => ({
      ...r,
      relevance_score:
        (r.keyword_score || 0) * keyword_weight +
        (r.semantic_score || 0) * semantic_weight
    }))
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, limit);
}
```

### Reciprocal Rank Fusion

Alternative merging strategy for combining result sets:

```typescript
function reciprocalRankFusion(
  result_sets: SearchResult[][],
  k: number = 60
): SearchResult[] {
  const scores = new Map<UUID, number>();

  for (const results of result_sets) {
    results.forEach((result, rank) => {
      const rrf_score = 1 / (k + rank + 1);
      const current = scores.get(result.item.id) || 0;
      scores.set(result.item.id, current + rrf_score);
    });
  }

  // Sort by combined RRF score
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({
      ...findResult(id, result_sets),
      relevance_score: score
    }));
}
```

## Natural Language Query Processing

### Query Parsing

LLM parses natural language into structured filters:

```typescript
async function parseNaturalLanguageQuery(
  query: string,
  context: SearchContext
): Promise<QueryIntent> {
  const system_prompt = `
    Parse the user's task search query into structured filters.

    Available projects: ${await getProjectNames()}
    Available tags: ${await getTagNames()}
    Current date: ${new Date().toISOString()}

    Return a QueryIntent object with extracted constraints.
  `;

  const intent = await llm.parse<QueryIntent>(
    system_prompt,
    query,
    QueryIntentSchema
  );

  return intent;
}
```

### Natural Language Examples

| Query | Extracted Intent |
|-------|------------------|
| "tasks I can do in 15 minutes" | `effort.duration_max: 15, status.availability: "available"` |
| "what's overdue for the acme project" | `status.overdue: true, organizational.projects: ["Acme"]` |
| "things to do at home this weekend" | `organizational.tags: ["@home"], temporal.due_window: [Sat, Sun]` |
| "all my calls and emails" | `organizational.tags: ["@calls", "@email"]` |
| "tasks I haven't touched in a month" | `temporal.modified_window: { before: -30d }` |
| "quick wins for work" | `effort.duration_max: 15, organizational.folders: ["Work"]` |
| "anything related to the product launch" | `semantic.topic: "product launch"` |
| "similar to 'prepare board presentation'" | `semantic.similar_to: "prepare board presentation"` |

### Intent to Filter Rules

Convert QueryIntent to perspective FilterRule:

```typescript
function intentToFilterRule(intent: QueryIntent): FilterRule {
  const rules: Condition[] = [];

  // Temporal constraints
  if (intent.temporal?.due_window) {
    rules.push({
      type: "due_within",
      value: intent.temporal.due_window
    });
  }

  // Status constraints
  if (intent.status?.availability) {
    rules.push({
      type: "availability",
      value: intent.status.availability
    });
  }

  if (intent.status?.overdue) {
    rules.push({
      type: "is_overdue",
      value: true
    });
  }

  if (intent.status?.flagged) {
    rules.push({
      type: "flagged",
      value: true
    });
  }

  // Organizational constraints
  if (intent.organizational?.projects?.length) {
    rules.push({
      type: "in_project",
      value: intent.organizational.projects
    });
  }

  if (intent.organizational?.tags?.length) {
    rules.push({
      aggregation: "any",
      rules: intent.organizational.tags.map(t => ({
        type: "has_tag",
        value: t
      }))
    });
  }

  // Effort constraints
  if (intent.effort?.duration_max) {
    rules.push({
      type: "duration_less_than",
      value: intent.effort.duration_max
    });
  }

  return {
    aggregation: "all",
    rules
  };
}
```

## Natural Language Perspective Creation

Users can create saved perspectives using natural language:

### Flow

```
User: "Create a perspective for quick tasks I can do at the office"

System:
  1. Parse intent: duration < 15min, tag: @office, available
  2. Generate filter rules
  3. Show preview with matching tasks
  4. Confirm and save perspective
```

### Perspective Generation

```typescript
async function generatePerspectiveFromNL(
  description: string
): Promise<GeneratedPerspective> {
  // 1. Parse the description
  const intent = await parseNaturalLanguageQuery(description, {
    scope: "remaining"
  });

  // 2. Generate filter rules
  const filter_rules = intentToFilterRule(intent);

  // 3. Suggest name and icon
  const metadata = await llm.generate<PerspectiveMetadata>(
    `Generate a short name (2-4 words) and appropriate icon for a perspective that shows: ${description}`,
    PerspectiveMetadataSchema
  );

  // 4. Preview results
  const preview = await search({
    structured_filters: filter_rules,
    search_context: { scope: "remaining" }
  });

  return {
    suggested_name: metadata.name,
    suggested_icon: metadata.icon,
    filter_rules,
    preview_count: preview.total_count,
    preview_items: preview.results.slice(0, 5),
    original_description: description,
    confidence: intent.confidence
  };
}
```

### Confirmation UI

```
┌────────────────────────────────────────────────────────────────┐
│ Create Perspective                                              │
├──────────────────────────────────────────────────────────��─────┤
│                                                                 │
│ Your description:                                               │
│ "quick tasks I can do at the office"                           │
│                                                                 │
│ Name: [Quick Office Tasks    ]  Icon: [⚡▼]                    │
│                                                                 │
│ Filter rules:                                                   │
│   ✓ Available tasks                                            │
│   ✓ Duration < 15 minutes                                      │
│   ✓ Tagged: @office                                            │
│                                                                 │
│ Preview (23 tasks match):                                       │
│   ☐ Reply to Tim's email                                       │
│   ☐ Review PR #234                                             │
│   ☐ Update meeting notes                                        │
│   ... and 20 more                                               │
│                                                                 │
│ [Edit Rules]     [Create Perspective]     [Cancel]             │
└────────────────────────────────────────────────────────────────┘
```

### Refinement

If results don't match expectations:

```typescript
async function refinePerspective(
  current: GeneratedPerspective,
  feedback: string
): Promise<GeneratedPerspective> {
  const prompt = `
    Current perspective: ${JSON.stringify(current.filter_rules)}
    User feedback: ${feedback}

    Adjust the filter rules based on the feedback.
  `;

  const adjusted = await llm.generate<FilterRule>(
    prompt,
    FilterRuleSchema
  );

  return {
    ...current,
    filter_rules: adjusted,
    preview_items: await search({ structured_filters: adjusted })
  };
}
```

## Conversational Task Queries

Multi-turn conversations about tasks using RAG-style retrieval:

### Conversation State

```typescript
interface SearchConversation {
  id: UUID;
  messages: ConversationMessage[];
  current_context: SearchContext;
  current_results?: SearchResult[];
  referenced_items: UUID[];  // Items mentioned in conversation
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  query?: SearchQuery;
  results?: SearchResult[];
  timestamp: DateTime;
}
```

### Conversational Flow Example

```
User: "What's overdue?"
Assistant: You have 3 overdue tasks:
  1. Submit quarterly report (2 days overdue)
  2. Call insurance company (1 day overdue)
  3. Review team proposals (3 days overdue)

User: "Just show me the work ones"
Assistant: Filtering to work-related overdue tasks:
  1. Submit quarterly report (2 days overdue) - Work/Reports
  3. Review team proposals (3 days overdue) - Work/Team

User: "How many tasks do I have for the product launch?"
Assistant: You have 12 tasks related to the product launch:
  - 4 completed
  - 5 in progress
  - 3 not started
  Earliest deadline: January 15th

User: "Show me the ones due this week"
Assistant: [Shows 3 tasks due this week for product launch]
```

### Conversational Query Processing

```typescript
async function processConversationalQuery(
  conversation: SearchConversation,
  user_message: string
): Promise<ConversationResponse> {
  // 1. Understand context from conversation history
  const context = buildConversationContext(conversation);

  // 2. Parse the new query with context
  const intent = await parseWithContext(user_message, context);

  // 3. Determine if this refines previous results or is new query
  const is_refinement = detectRefinement(intent, conversation.current_results);

  // 4. Execute search
  let results: SearchResult[];
  if (is_refinement && conversation.current_results) {
    results = refineResults(conversation.current_results, intent);
  } else {
    results = await hybridSearch(intent);
  }

  // 5. Generate natural language response
  const response = await generateResponse(results, intent, context);

  return {
    message: response,
    results,
    updated_context: context
  };
}
```

### Context Understanding

The system maintains context across turns:

```typescript
interface ConversationContext {
  // What we're talking about
  topic?: string;                    // "overdue tasks", "product launch"
  active_filters: FilterRule;        // Current filter state
  referenced_items: UUID[];          // Items mentioned by name

  // Refinement history
  filter_stack: FilterRule[];        // For "go back" functionality

  // Pronouns and references
  last_mentioned_project?: UUID;
  last_mentioned_tag?: UUID;
  last_result_set?: UUID[];
}
```

### Pronoun Resolution

```typescript
function resolvePronouns(
  query: string,
  context: ConversationContext
): string {
  // "it" -> last mentioned task
  // "them" -> last result set
  // "that project" -> last mentioned project
  // "those" -> last result set

  return query
    .replace(/\bthose\b/i, `tasks ${context.last_result_set?.join(", ")}`)
    .replace(/\bthat project\b/i, context.last_mentioned_project || "")
    .replace(/\bit\b/i, context.referenced_items[0] || "");
}
```

## Smart Filter Suggestions

AI suggests query refinements and related searches:

### Suggestion Types

```typescript
interface FilterSuggestion {
  type: "narrow" | "broaden" | "related" | "alternative";
  description: string;
  filter_delta: Partial<FilterRule>;
  estimated_count: number;
}
```

### Suggestion Generation

```typescript
async function generateFilterSuggestions(
  current_results: SearchResult[],
  intent: QueryIntent
): Promise<FilterSuggestion[]> {
  const suggestions: FilterSuggestion[] = [];

  // Too many results? Suggest narrowing
  if (current_results.length > 20) {
    // Suggest filtering by project
    const projects = extractCommonProjects(current_results);
    if (projects.length > 1) {
      suggestions.push({
        type: "narrow",
        description: `Filter to ${projects[0].name} project`,
        filter_delta: { in_project: projects[0].id },
        estimated_count: countInProject(current_results, projects[0].id)
      });
    }

    // Suggest filtering by tag
    const tags = extractCommonTags(current_results);
    if (tags.length > 0) {
      suggestions.push({
        type: "narrow",
        description: `Only @${tags[0].name} tasks`,
        filter_delta: { has_tag: tags[0].id },
        estimated_count: countWithTag(current_results, tags[0].id)
      });
    }
  }

  // No results? Suggest broadening
  if (current_results.length === 0) {
    suggestions.push({
      type: "broaden",
      description: "Include completed tasks",
      filter_delta: { include_completed: true },
      estimated_count: await countWithCompleted(intent)
    });

    suggestions.push({
      type: "broaden",
      description: "Search all projects",
      filter_delta: { in_project: null },
      estimated_count: await countAllProjects(intent)
    });
  }

  // Related searches
  const related = await findRelatedSearches(intent);
  suggestions.push(...related.map(r => ({
    type: "related" as const,
    description: r.description,
    filter_delta: r.filters,
    estimated_count: r.estimated_count
  })));

  return suggestions;
}
```

### Suggestion UI

```
┌────────────────────────────────────────────────────────────────┐
│ Search: "product launch tasks"                                  │
├────────────────────────────────────────────────────────────────┤
│ 47 results                                                      │
│                                                                 │
│ Refine your search:                                            │
│   [Due this week (12)]  [High priority (8)]  [Unassigned (5)] │
│                                                                 │
│ Related searches:                                              │
│   "product launch blockers"  "marketing tasks"  "QA checklist" │
└────────────────────────────────────────────────────────────────┘
```

## Search UI Components

### Unified Search Bar

Single search interface supporting all modes:

```
┌────────────────────────────────────────────────────────────────┐
│ 🔍 [                                                    ] [⚙️] │
│     Try: "tasks due this week" or "similar to quarterly report" │
├────────────────────────────────────────────────────────────────┤
│ Recent:                                                         │
│   overdue  •  @work tasks  •  quick wins                       │
│                                                                 │
│ Suggested:                                                      │
│   📍 Errands nearby (3 tasks)                                  │
│   ⚡ Quick wins (12 tasks under 15 min)                        │
└────────────────────────────────────────────────────────────────┘
```

### Search Results Display

```
┌────────────────────────────────────────────────────────────────┐
│ Results for "quarterly report" (3 matches)                      │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ☐ Submit quarterly report          📅 Due: Jan 5               │
│   Work / Finance                    Exact match in title       │
│                                                                 │
│ ☐ Review Q4 results for report     📅 Due: Jan 3               │
│   Work / Finance                    Related: "report"          │
│                                                                 │
│ ☐ Prepare data visualizations                                  │
│   Work / Analytics                  Semantic: report prep      │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│ Refine: [Finance only]  [Due this week]  [Include completed]   │
│                                                                 │
│ 💡 Save as perspective                                         │
└────────────────────────────────────────────────────────────────┘
```

### Voice Search

Desktop and mobile voice search:

```
┌──────────────────────────────────┐
│         🎤 Listening...          │
│                                  │
│  "Show me tasks for the..."      │
│                                  │
│  [Cancel]                        │
└──────────────────────────────────┘
```

## API Endpoints

### Unified Search

```
POST /api/search
Body:
{
  "query": "quarterly report tasks",
  "mode": "hybrid",  // "keyword" | "semantic" | "hybrid" | "natural_language"
  "context": SearchContext,
  "limit": 20,
  "offset": 0
}

Response:
{
  "results": SearchResult[],
  "total_count": number,
  "query_interpretation": QueryIntent,
  "suggestions": FilterSuggestion[],
  "search_time_ms": number
}
```

### Natural Language Query

```
POST /api/search/natural
Body:
{
  "query": "tasks I can do in 15 minutes at home",
  "context": SearchContext
}

Response:
{
  "interpreted_intent": QueryIntent,
  "filter_rules": FilterRule,
  "results": SearchResult[],
  "confidence": number,
  "clarifications_needed": string[]
}
```

### Conversational Query

```
POST /api/search/conversation
Body:
{
  "conversation_id": UUID | null,
  "message": "just the overdue ones"
}

Response:
{
  "conversation_id": UUID,
  "response": string,
  "results": SearchResult[],
  "suggestions": FilterSuggestion[]
}
```

### Generate Perspective

```
POST /api/perspectives/generate
Body:
{
  "description": "quick tasks I can do at the office"
}

Response:
{
  "suggested_name": string,
  "suggested_icon": string,
  "filter_rules": FilterRule,
  "preview": {
    "count": number,
    "sample_items": SearchResult[]
  },
  "confidence": number
}
```

### Similar Tasks

```
GET /api/search/similar/{task_id}
Query params:
  limit: number (default: 10)

Response:
{
  "similar_tasks": SearchResult[],
  "similarity_basis": string  // "Same project", "Similar title", "Related topic"
}
```

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `search.default_mode` | Enum | hybrid | Default search mode |
| `search.semantic_weight` | Float | 0.6 | Weight for semantic results in hybrid |
| `search.keyword_weight` | Float | 0.4 | Weight for keyword results in hybrid |
| `search.include_completed` | Boolean | false | Include completed tasks by default |
| `search.respect_focus` | Boolean | true | Limit to focus scope if active |
| `search.show_suggestions` | Boolean | true | Show filter refinement suggestions |
| `search.conversation_history` | Integer | 10 | Turns to keep in conversation |
| `search.voice_enabled` | Boolean | true | Enable voice search |
| `search.nl_confidence_threshold` | Float | 0.7 | Min confidence for auto-apply NL filters |

## Performance Requirements

| Operation | Target Latency | Notes |
|-----------|---------------|-------|
| Keyword search | < 50ms | BM25 on indexed content |
| Semantic search | < 200ms | Vector similarity lookup |
| Hybrid search | < 250ms | Parallel execution |
| NL query parsing | < 500ms | LLM inference |
| Embedding generation | < 100ms | Per task, batched |
| Perspective generation | < 1s | Full flow with preview |
| Conversation response | < 800ms | With context |

## Privacy Considerations

- Embeddings generated on-device when possible
- Search queries not logged by default
- Conversation history stored locally
- Option to disable cloud-based semantic search
- No query content shared with third parties

## Edge Cases

### No Results

- Show "No results" with helpful suggestions
- Offer to broaden search
- Suggest related queries

### Ambiguous Query

- Ask clarifying question
- Show multiple interpretations
- Default to most likely intent

### Very Long Query

- Extract key terms
- Summarize for semantic search
- Show interpretation for confirmation

### Offline Mode

- Keyword search available offline
- Semantic search requires connection
- Cache recent embeddings

### Large Result Sets

- Paginate results
- Show count with preview
- Offer refinement suggestions

## Related Specifications

- `specs/search.md` - Base search functionality
- `specs/perspectives.md` - Perspective framework
- `specs/custom-perspectives.md` - Custom perspective creation
- `improved_specs/ai-capture.md` - AI task capture
- `improved_specs/ai-suggestions.md` - AI task recommendations

## Sources

Research informing this specification:
- [Semantic Search APIs 2025](https://www.shaped.ai/blog/the-10-best-semantic-search-apis-in-2025)
- [Enterprise Semantic Search](https://www.voiceflow.com/blog/semantic-search)
- [Natural Language Query Interfaces](https://www.sencha.com/blog/from-chat-to-action-empowering-users-to-transform-data-grids-with-natural-language/)
- [RAG Best Practices 2025](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/rag-best-practice-with-ai-search/4357711)
- [Hybrid Search Strategies](https://www.elastic.co/search-labs/blog/elastic-query-dsl-structured-datasets)
- [Conversational AI UX](https://futurepulseai.blog/2025/10/25/the-ux-and-front-end-challenges-of-ai-powered-search-and-rag-interfaces/)