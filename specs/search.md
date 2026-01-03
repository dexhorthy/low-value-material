# Search Specification

**Search** enables finding tasks, projects, folders, and tags by text matching. Search operates across titles, notes, and tag names with configurable scope.

## Overview

Search helps users:
- Find specific items quickly
- Locate tasks by keyword
- Navigate large databases
- Filter current views
- Access items via Quick Open

## Search Modes

### 1. Outline Search

Filter the current view by search terms:

| Feature | Description |
|---------|-------------|
| Location | Toolbar search field |
| Scope | Current perspective or configurable |
| Results | Filtered in-place in outline |
| Real-time | Updates as you type |

### 2. Quick Open

Navigate to any item instantly:

| Feature | Description |
|---------|-------------|
| Trigger | ⌘O or Quick Open button |
| Scope | Entire database |
| Results | Dropdown list of matches |
| Action | Navigate to selected item |

### 3. Sidebar Search

Filter sidebar contents:

| Feature | Description |
|---------|-------------|
| Location | Sidebar filter field |
| Scope | Projects, folders, or tags |
| Results | Filtered sidebar list |

## Search Scope

### Scope Options

| Scope | Searches |
|-------|----------|
| `here` | Items visible in current outline |
| `remaining` | All active items (not completed/dropped) |
| `everything` | Entire database including completed/dropped |

### Default Scope

- Outline search: `here` (current view)
- Quick Open: `remaining`
- Can be changed per search

## Searchable Fields

### Primary Fields

| Field | Weight | Description |
|-------|--------|-------------|
| Title | High | Item name |
| Note | Medium | Item notes/description |
| Tags | Medium | Assigned tag names |

### Secondary Fields (Optional)

| Field | Description |
|-------|-------------|
| Project name | Parent project |
| Folder name | Containing folder |

## Matching Algorithm

### Smart Match

Matches text:
- From start of words
- From middle of words
- Across word boundaries
- Case insensitive

### Examples

Query "ho" matches:
- "**Ho**me project"
- "P**ho**ne calls"
- "Get started with OmniFocus" (contains "ho")

Query "buy gro" matches:
- "**Buy gro**ceries"

### Ranking

Results ordered by:
1. Exact match (highest)
2. Start-of-word match
3. Contains match
4. Recency (recently modified)
5. Alphabetical (tie-breaker)

## Search Operators

### Basic Operators

| Operator | Example | Meaning |
|----------|---------|---------|
| Space | `buy milk` | Both terms must match |
| Quotes | `"buy milk"` | Exact phrase |
| `-` | `buy -groceries` | Exclude term |

### Field-Specific (Optional)

| Operator | Example | Meaning |
|----------|---------|---------|
| `title:` | `title:report` | Search only title |
| `note:` | `note:important` | Search only notes |
| `tag:` | `tag:work` | Search only tags |
| `project:` | `project:launch` | Search project names |

### Date Operators (Optional)

| Operator | Example | Meaning |
|----------|---------|---------|
| `due:today` | Tasks due today |
| `due:week` | Tasks due this week |
| `defer:tomorrow` | Deferred until tomorrow |
| `modified:week` | Modified this week |

## Outline Search

### Behavior

1. User types in search field
2. Results filter in real-time
3. Non-matching items hidden
4. Matching items shown with context
5. Clear search restores full view

### Result Display

```
Search: "report"
─────────────────────────────
📋 Q1 Planning
  ☐ Write quarterly report      ← match in title
  ☐ Review team updates
    Note: Include report data   ← match in note

📋 Finance
  ☐ Submit expense report       ← match in title
```

### Highlighting

- Matched terms highlighted in results
- Title matches shown prominently
- Note matches may show excerpt

### Context Preservation

When showing search results:
- Show parent project
- Show path to item
- Maintain hierarchy (collapsed)

## Quick Open

### Behavior

1. User presses ⌘O
2. Quick Open panel appears
3. User types search query
4. Results show in dropdown
5. User selects item
6. Navigate to item in appropriate perspective

### Result Types

| Type | Icon | Action |
|------|------|--------|
| Task | ☐ | Open in project context |
| Project | 📋 | Open project |
| Folder | 📁 | Open folder |
| Tag | 🏷 | Open tag view |
| Perspective | 👁 | Switch to perspective |

### Quick Open Results

```
┌─────────────────────────────────────┐
│ 🔍 report                           │
├─────────────────────────────────────┤
│ ☐ Write quarterly report            │
│   Q1 Planning                       │
│ ☐ Submit expense report             │
│   Finance                           │
│ 📋 Annual Report Project            │
│ 🏷 Reports (tag)                    │
└─────────────────────────────────────┘
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| ↓/↑ | Move selection |
| Return | Open selected |
| Escape | Close Quick Open |
| ⌘1-9 | Open nth result |

## Sidebar Search

### Projects Sidebar

Filter projects and folders by name:
- Type to filter
- Shows matching projects
- Shows folders containing matches
- Hides non-matching items

### Tags Sidebar

Filter tags by name:
- Type to filter
- Shows matching tags
- Shows parent tags of matches
- Hides non-matching tags

## Search Operations

### Perform Search

```
search(
  query: String,
  scope: SearchScope = here,
  fields: SearchField[] = [title, note, tags]
) → SearchResults
```

### Clear Search

```
clear_search() → void
```

Restores full view.

### Quick Open Search

```
quick_open(query: String) → SearchResults
```

Searches entire database for navigation.

## Search Results Object

```
SearchResults {
  query: String
  scope: SearchScope
  total_count: Integer
  items: SearchResultItem[]
}

SearchResultItem {
  item: Task | Project | Folder | Tag
  match_locations: MatchLocation[]
  relevance_score: Float
}

MatchLocation {
  field: String  // "title", "note", "tag"
  start: Integer
  length: Integer
}
```

## Performance

### Indexing

- Full-text index on title, note, tags
- Index updated on item changes
- Background index maintenance

### Optimization

- Debounce typing (150-300ms)
- Limit initial results
- Load more on scroll
- Cache recent searches

### Large Databases

- 10,000+ items: Optimize queries
- Consider search result limits
- Progressive loading

## Focus Mode Interaction

Search behavior with Focus Mode:

| Setting | Behavior |
|---------|----------|
| Respects focus | Results limited to focus scope |
| Ignores focus | Search entire database |

Configurable in settings.

## Settings

### Search Preferences

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `default_scope` | Enum | here | Default search scope |
| `search_fields` | String[] | [title, note, tags] | Fields to search |
| `show_completed` | Boolean | false | Include completed in results |
| `respect_focus` | Boolean | true | Limit to focus scope |
| `highlight_matches` | Boolean | true | Highlight matched text |
| `max_results` | Integer | 100 | Maximum results shown |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘O | Quick Open |
| ⌘F | Focus search field |
| Escape | Clear search / Close Quick Open |
| ⌘⇧F | Search Everything |

## Edge Cases

### Empty Query

- Show all items (no filter)
- Quick Open shows recent items

### No Results

- Show "No results" message
- Suggest broadening scope
- Offer to search Everything

### Special Characters

- Escape special regex characters
- Handle quotes properly
- Unicode support

### Very Long Notes

- Index full note text
- Show excerpt in results
- Highlight match location

### Deleted Items

- Exclude from search by default
- Option to include in Everything scope

## Automation

### Search via URL Scheme

```
omnifocus:///search?q=QUERY&scope=everything
```

### Search via Scripting

```javascript
// Find matching tasks
const results = document.flattenedTasks.filter(task =>
  task.name.includes("report")
);

// Smart match function
const matches = database.projectsMatching("report");
```

## Best Practices

### Effective Searching

1. Start with specific terms
2. Use scope appropriately
3. Quick Open for navigation
4. Outline search for filtering

### Search vs. Perspectives

| Use Search When | Use Perspective When |
|-----------------|---------------------|
| One-time lookup | Repeated query |
| Ad-hoc filtering | Saved filter |
| Finding specific item | Workflow view |

## Related Specifications

- `specs/perspectives.md` - Saved searches as perspectives
- `specs/custom-perspectives.md` - Text filter conditions
- `specs/focus-mode.md` - Search scope interaction
- `specs/task.md` - Searchable task fields
