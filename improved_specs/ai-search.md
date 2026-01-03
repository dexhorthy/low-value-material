# AI-Powered Search & Query Specification

This specification extends `specs/search.md`, `specs/perspectives.md`, and `specs/custom-perspectives.md` with AI-native search capabilities. The system enables semantic search, natural language queries, conversational task discovery, and intelligent perspective creation.

## Overview

Traditional search relies on keyword matching. AI-native search transforms how users find and filter tasks:
- **Semantic search**: Find tasks by meaning, not just keywords
- **Natural language perspectives**: Create complex filters by describing what you want
- **Conversational queries**: Ask questions about your tasks in natural language
- **Smart suggestions**: AI recommends query refinements and related searches

## Search Modes

The system supports multiple search modes that work together:

### Keyword Search
Traditional text matching against task titles, notes, tags, and project names. Fast and predictable - good for finding exact terms.

### Semantic Search
Finds tasks by meaning rather than exact words. A search for "quarterly finances" would find tasks about "Q2 budget review" even without matching keywords.

**What gets considered for semantic matching:**
- Task title
- Task note content
- Associated tags
- Project name and description

### Hybrid Search
Combines keyword and semantic results, ranking by a weighted blend of both scores. This is the default mode, giving users the benefits of both approaches.

### Natural Language Search
Interprets questions and requests in plain English:
- "tasks I can do in 15 minutes" → finds short-duration available tasks
- "what's overdue for the acme project" → finds overdue items in that project
- "things to do at home this weekend" → matches @home tag and weekend dates

## Natural Language Query Examples

| Query | What It Finds |
|-------|---------------|
| "tasks I can do in 15 minutes" | Available tasks with short estimated duration |
| "what's overdue for the acme project" | Overdue tasks in the Acme project |
| "things to do at home this weekend" | Tasks tagged @home with weekend due dates |
| "all my calls and emails" | Tasks tagged @calls or @email |
| "tasks I haven't touched in a month" | Tasks not modified in 30+ days |
| "quick wins for work" | Short tasks in Work folder |
| "anything related to the product launch" | Tasks semantically related to product launch |
| "similar to 'prepare board presentation'" | Tasks similar to that description |

## Natural Language Perspective Creation

Users can create saved perspectives by describing what they want in plain language.

### How It Works

1. User describes the perspective: "quick tasks I can do at the office"
2. System interprets the intent and suggests filter rules
3. System suggests a name and icon
4. User sees a preview of matching tasks
5. User can adjust and save

### Creation Interface

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

If the preview doesn't match expectations, users can provide feedback like "also include tasks from my home office" and the system will adjust the filters accordingly.

## Conversational Task Queries

Users can have multi-turn conversations to explore and refine their task searches. The system maintains context across turns, understanding pronouns and refinements.

### Example Conversation

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

### Context Understanding

The system tracks:
- Current topic being discussed
- Active filters from previous queries
- Items mentioned by name
- Pronouns like "it", "them", "those" referring to previous results
- "That project" referring to the last mentioned project

This allows natural follow-ups like "just the overdue ones" without repeating the full context.

## Smart Filter Suggestions

When viewing search results, the system suggests ways to refine the query:

### Suggestion Types

| Type | When Used | Example |
|------|-----------|---------|
| Narrow | Too many results | "Filter to Finance project (12 tasks)" |
| Broaden | No or few results | "Include completed tasks" |
| Related | Always | "product launch blockers", "marketing tasks" |
| Alternative | Ambiguous query | Different interpretations of the query |

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

Desktop and mobile support voice input for hands-free searching.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Default search mode | Hybrid | Which search mode to use by default |
| Include completed | Off | Include completed tasks in results |
| Respect focus | On | Limit results to focus scope when active |
| Show suggestions | On | Show filter refinement suggestions |
| Voice search | On | Enable voice input |

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