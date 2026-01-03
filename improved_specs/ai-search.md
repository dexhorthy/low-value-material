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

## Voice-to-Perspective Creation

Voice input provides a hands-free, conversational way to create perspectives. This is especially powerful on mobile or during capture moments when typing is inconvenient.

### Voice Creation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│         🎤  Creating Perspective...                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  You said:                                                        │
│  "Show me all my work calls that are due this week"              │
│                                                                   │
│  I understood:                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Name: Work Calls This Week                                   │ │
│  │ Icon: 📞                                                     │ │
│  │                                                              │ │
│  │ Filters:                                                     │ │
│  │   • Tagged: @work                                           │ │
│  │   • Tagged: @calls                                          │ │
│  │   • Due: This week                                          │ │
│  │   • Status: Available                                       │ │
│  │                                                              │ │
│  │ 7 tasks match                                                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  🎤 "Looks good" or tell me what to change                       │
│                                                                   │
│  [🎤 Keep Talking]    [✓ Create]    [✕ Cancel]                  │
└──────────────────────────────────────────────────────────────────┘
```

### Progressive Voice Refinement

Multi-turn voice conversations allow iterative refinement without switching input modes:

```
User (voice): "Create a perspective for my high priority tasks"

System: Created "High Priority Tasks" with 12 matches.
        Filters: Flagged = true, Status = Available

User (voice): "Also include things due tomorrow"

System: Updated filters. Now showing 18 tasks.
        Added: Due = Tomorrow

User (voice): "But not the ones tagged waiting"

System: Got it. Excluding @waiting. Now 15 tasks.

User (voice): "Perfect, save it"

System: ✓ Perspective "High Priority Tasks" saved to sidebar
```

### Voice Commands During Creation

| Voice Command | Action |
|--------------|--------|
| "Save it" / "Create it" / "Looks good" | Finalize and save perspective |
| "Cancel" / "Never mind" | Abort creation |
| "Add [filter]" / "Also include [criteria]" | Add filter condition |
| "Remove [filter]" / "But not [criteria]" | Remove or exclude condition |
| "Change the name to [name]" | Rename the perspective |
| "Show me the preview" | Read back matching tasks |
| "How many match?" | Report current match count |
| "Start over" | Clear all filters and restart |

### Voice Intent Extraction

The system extracts structured filters from natural voice input:

| Spoken Phrase | Extracted Filter |
|--------------|-----------------|
| "work calls" | Tags: @work, @calls |
| "due this week" | Due date: This week |
| "quick tasks" | Duration: < 15 minutes |
| "overdue" | Status: Overdue |
| "important" / "flagged" | Flagged: true |
| "not waiting" | Exclude tag: @waiting |
| "the acme project" | Project: Acme |
| "at home" | Tag: @home |

### Disambiguation via Voice

When intent is ambiguous, the system asks clarifying questions that can be answered by voice:

```
User (voice): "Show me tasks for the meeting"

System: I found a few possibilities:
        1. Tasks tagged @meetings (8 tasks)
        2. Tasks in project "Q1 Planning Meeting" (3 tasks)
        3. Tasks containing "meeting" in the title (12 tasks)

        Which did you mean? You can say "one", "two", or "three"

User (voice): "The first one"

System: Got it. Creating perspective for tasks tagged @meetings.
```

### Privacy and Speed

For privacy and responsiveness, the system prioritizes on-device processing when possible. This means voice recognition feels instant and your voice data stays on your device for initial processing.

## Proactive Perspective Suggestions

The system observes user behavior patterns and proactively suggests perspectives that would help their workflow—surfacing them before users think to create them.

### Pattern Detection

The system watches for repeated behaviors that indicate a perspective would be valuable:

| Pattern Type | Detection Method | Example |
|-------------|-----------------|---------|
| **Repeated Search** | Same query 3+ times in a week | User searches "budget" every Monday → suggest "Budget Tasks" perspective |
| **Temporal Cluster** | Tasks consistently worked at same time | User works @calls tasks 9-10am → suggest "Morning Calls" perspective |
| **Tag Combination** | Two tags frequently used together | @work + @urgent filtered together → suggest "Work Urgent" perspective |
| **Workflow Sequence** | Consistent task completion patterns | User always does @email then @calls → suggest combined view |
| **Missing Perspective** | High-value views not yet saved | User has many @errands tasks but no Errands perspective |

### Proactive Suggestion UI

Suggestions appear contextually, not intrusively:

**In Search Results:**
```
┌────────────────────────────────────────────────────────────────┐
│ Search: "budget"                                                │
├────────────────────────────────────────────────────────────────┤
│ 💡 You search for "budget" frequently.                          │
│    Save as perspective "Budget Tasks"?                         │
│    [Create]  [Not Now]  [Don't Suggest Again]                  │
├────────────────────────────────────────────────────────────────┤
│ Results (8 tasks)...                                            │
└────────────────────────────────────────────────────────────────┘
```

**In Weekly Review:**
```
┌────────────────────────────────────────────────────────────────┐
│ Weekly Insights                                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📊 This week you worked on 12 tasks tagged @home-office        │
│    but you don't have a Home Office perspective.               │
│                                                                 │
│    Would you like one? It would include:                       │
│    • Available tasks tagged @home-office                       │
│    • Sorted by due date                                        │
│                                                                 │
│    [Create Perspective]  [Maybe Later]                         │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Via Morning Briefing:**
```
"Good morning! I noticed you often look at work tasks
due this week on Monday mornings. Would you like me
to create a 'Weekly Work Planning' perspective?"
```

### Suggestion Ranking

When multiple suggestions are available, they're ranked by:

1. **Frequency** - How often the user does this manually
2. **Time savings** - How much time a perspective would save
3. **Coverage** - How many tasks would be included
4. **Recency** - How recently the pattern occurred

### Learning from Responses

User responses improve future recommendations:

| Response | System Learning |
|----------|----------------|
| Accepted | Boost similar patterns, learn naming preferences |
| Modified | Learn preferred filter adjustments |
| Dismissed | Reduce confidence for this pattern |
| "Don't suggest again" | Suppress this specific pattern permanently |

### Suggestion Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Proactive perspectives | On | Enable proactive perspective suggestions |
| Suggestion frequency | Weekly | How often to suggest (daily/weekly/monthly) |
| Minimum observations | 3 | Pattern occurrences before suggesting |
| Show in search | On | Show suggestions in search results |
| Show in review | On | Show suggestions during review |
| Morning briefing | On | Include suggestions in morning briefing |

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
- [Voice-Enabled AI Workflow Builder 2025](https://blog.dograh.com/voice-enabled-ai-workflow-builder-what-actually-works-in-2025/)
- [AI Voice Assistants for Enterprise](https://www.aimagicx.com/blog/ai-voice-assistants-enterprise-workplace-productivity-2025/)
- [Voice-LLM Trends 2025](https://www.turing.com/resources/voice-llm-trends)
- [Speech-to-Workflow Patterns](https://aiola.ai/product/speech-to-workflow/)