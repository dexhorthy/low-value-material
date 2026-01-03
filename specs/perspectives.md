# Perspectives Specification

A **Perspective** is a customizable view into your tasks and projects. Perspectives filter, group, and sort items according to specific criteria, providing focused views for different workflows.

## Overview

Perspectives are essential for GTD implementation:
- **Inbox**: Capture point for unprocessed items
- **Projects**: Hierarchical project organization
- **Tags**: Context-based task views
- **Forecast**: Date-driven planning
- **Review**: Periodic project assessment
- **Custom**: User-defined filtered views

## Data Model

### Perspective Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `name` | String | Display name |
| `type` | Enum | `built_in` or `custom` |
| `icon` | String | null | Icon identifier or custom image |
| `icon_color` | Color | null | Color applied to icon |
| `filter_rules` | FilterRule | What items to include |
| `grouping` | GroupingType | How to group items |
| `sorting` | SortingType[] | How to sort items |
| `display_mode` | DisplayMode | Projects vs actions view |
| `show_in_sidebar` | Boolean | Visible in sidebar/home |
| `sidebar_order` | Integer | Position in sidebar |

## Built-In Perspectives

### Core Perspectives

| Perspective | Purpose | Default Filter |
|-------------|---------|----------------|
| `inbox` | Capture unprocessed items | Items without project |
| `projects` | Project hierarchy | All projects and folders |
| `tags` | Context-based view | All tags with tasks |
| `flagged` | Important items | Flagged items |
| `forecast` | Date planning | Due/deferred by date |
| `review` | Project maintenance | Projects due for review |

### Reference Perspectives

| Perspective | Purpose | Default Filter |
|-------------|---------|----------------|
| `nearby` | Location-based | Tasks with nearby location tags |
| `completed` | History | Recently completed items |
| `changed` | Recent activity | Recently modified items |

### Built-In Perspective Properties

Built-in perspectives:
- Cannot be deleted
- Have fixed core functionality
- Allow limited customization (some filtering options)
- Cannot change icons (except custom perspectives)
- Always available in sidebar

## Custom Perspectives

Custom perspectives (Pro feature) allow full control:

### Creation

```
create_perspective(
  name: String,
  filter_rules: FilterRule,
  grouping?: GroupingType,
  sorting?: SortingType[],
  display_mode?: DisplayMode,
  icon?: String,
  icon_color?: Color
) → Perspective
```

### Capabilities

| Feature | Built-In | Custom |
|---------|----------|--------|
| Delete | No | Yes |
| Rename | No | Yes |
| Change icon | No | Yes |
| Change color | No | Yes |
| Custom filters | Limited | Full |
| Full editor | No | Yes |

## Filter Rules

Filters determine which items appear in a perspective.

### Rule Structure

```
FilterRule {
  operator: "all" | "any" | "none"
  conditions: Condition[]
  children: FilterRule[]  // Nested rule groups
}
```

### Operators

| Operator | Meaning |
|----------|---------|
| `all` | ALL conditions must match (AND) |
| `any` | ANY condition can match (OR) |
| `none` | NO conditions can match (NOT) |

### Hierarchical Rules

Rules can be nested:

```
all:
  - status = available
  - any:
      - tag = "Work"
      - tag = "Office"
  - none:
      - flagged = true
```

This matches: Available items tagged Work OR Office, but NOT flagged.

### Condition Types

#### Status Conditions

| Condition | Values |
|-----------|--------|
| `availability` | available, remaining, all |
| `status` | active, completed, dropped |
| `flagged` | true, false |
| `has_due_date` | true, false |
| `has_defer_date` | true, false |
| `is_overdue` | true, false |
| `is_due_soon` | true, false |

#### Date Conditions

| Condition | Values |
|-----------|--------|
| `due_date` | before, after, on, within |
| `defer_date` | before, after, on, within |
| `completed_date` | before, after, on, within |
| `added_date` | before, after, on, within |
| `changed_date` | before, after, on, within |

#### Container Conditions

| Condition | Values |
|-----------|--------|
| `project` | specific project(s) |
| `folder` | specific folder(s) |
| `tag` | specific tag(s) |
| `has_project` | true, false |
| `in_inbox` | true, false |

#### Text Conditions

| Condition | Values |
|-----------|--------|
| `title_contains` | text string |
| `note_contains` | text string |
| `title_matches` | regex pattern |

#### Duration Conditions

| Condition | Values |
|-----------|--------|
| `estimated_duration` | less than, greater than, equals |

## Display Modes

### Entire Projects

```
display_mode = projects
```

- Shows full project hierarchy
- Projects with their contained tasks
- Folders visible
- Maintains parent-child relationships

### Individual Actions

```
display_mode = actions
```

- Flat list of matching actions
- No project hierarchy
- Can show project path as context
- Allows flexible grouping/sorting

### Comparison

| Feature | Projects Mode | Actions Mode |
|---------|---------------|--------------|
| Hierarchy | Preserved | Flattened |
| Grouping | By project/folder | Flexible |
| Focus | Project-centric | Task-centric |
| Best for | Planning | Execution |

## Grouping Options

When using `display_mode = actions`:

| Grouping | Description |
|----------|-------------|
| `ungrouped` | Flat list, no grouping |
| `project` | By parent project |
| `folder` | By containing folder |
| `tag` | By tag (duplicates if multiple) |
| `flagged` | Flagged first, then unflagged |
| `due_date` | By due date (today, tomorrow, etc.) |
| `defer_date` | By defer date |
| `added_date` | By date added (newest first) |
| `changed_date` | By date modified |
| `completed_date` | By completion date |

### Date Grouping Granularity

Date-based groupings use adaptive granularity:
- Today, Yesterday
- This Week, Last Week
- This Month, Last Month
- Older / Future

## Sorting Options

Multiple sort criteria can be combined:

| Sort Key | Description |
|----------|-------------|
| `flagged` | Flagged items first |
| `name` | Alphabetical by title |
| `due_date` | By due date (earliest first) |
| `defer_date` | By defer date (soonest first) |
| `added_date` | By creation date |
| `changed_date` | By modification date |
| `completed_date` | By completion date |
| `duration` | By estimated duration (shortest first) |
| `project` | Alphabetical by project name |
| `order` | Manual order within project |

### Sort Direction

Each sort key can be:
- Ascending (A-Z, oldest first, shortest first)
- Descending (Z-A, newest first, longest first)

### Null Handling

Items without a value for the sort key:
- Dates: Null items first or last (configurable)
- Duration: Null items typically last

## View Options

Additional display settings:

| Option | Description |
|--------|-------------|
| `show_project_paths` | Display project name for each action |
| `show_due_dates` | Display due date badges |
| `show_defer_dates` | Display defer date info |
| `show_estimates` | Display duration estimates |
| `show_notes` | Expand notes inline |
| `show_tags` | Display tag badges |
| `compact_mode` | Reduced spacing |

## Sidebar & Home

### Sidebar Configuration

Perspectives can be:
- Shown or hidden in sidebar
- Reordered by drag-and-drop
- Starred/pinned for quick access

### Home View

Home displays perspective tiles with:
- Perspective icon and name
- Count of items matching filter
- Color-coded urgency indicators

### Sidebar Order

```
set_sidebar_order(
  perspective_id: String,
  position: Integer
) → void
```

## Focus Mode Integration

Perspectives respect focus mode:

```
IF focus_mode_active:
  perspective_results = perspective_results
    .filter(item => item.is_in_focused_scope)
```

See `specs/focus-mode.md` for details.

## Operations

### Create Custom Perspective

```
create_perspective(
  name: String,
  ...options
) → Perspective
```

### Edit Perspective

```
update_perspective(
  perspective_id: String,
  ...changes
) → Perspective
```

### Delete Custom Perspective

```
delete_perspective(perspective_id: String) → void
```

Only custom perspectives can be deleted.

### Duplicate Perspective

```
duplicate_perspective(perspective_id: String) → Perspective
```

Creates a copy with "(copy)" suffix.

### Reset Built-In Perspective

```
reset_perspective(perspective_id: String) → Perspective
```

Restores default settings for built-in perspectives.

## Queries

### Get Perspective Results

```
get_perspective_items(perspective_id: String) → Item[]
```

Returns all items matching the perspective's filter rules.

### Get Perspective Count

```
get_perspective_count(perspective_id: String) → Integer
```

Returns count of matching items (for badges).

### List All Perspectives

```
list_perspectives(include_built_in: Boolean = true) → Perspective[]
```

## Syncing

Perspectives sync across devices:

| Property | Syncs |
|----------|-------|
| Name | Yes |
| Icon | Yes |
| Color | Yes |
| Filter rules | Yes |
| Grouping/sorting | Yes |
| Sidebar position | Yes |
| Custom perspectives | Yes |

### Version Compatibility

- Perspectives created in newer versions may not work in older versions
- Incompatible perspectives are hidden (not deleted)
- Core functionality preserved when possible

## Performance

### Optimization

For large databases:
- Cache perspective results
- Incremental updates on item changes
- Lazy loading for scroll

### Invalidation

Recalculate perspective results when:
- Item status changes
- Item dates change
- Item tags change
- Item moves between projects
- Filter rules change

## Edge Cases

### Empty Perspectives

- Valid state (no matching items)
- Show empty state message
- Count displays 0

### Conflicting Rules

- Rules are evaluated in order
- Later rules can override earlier ones
- `none` rules are evaluated last

### Circular Focus

- Focus mode + perspective focus
- Both restrictions apply (intersection)

### Deleted Tags/Projects in Rules

- Filter continues to work
- Missing references are ignored
- Consider cleanup notification

## Best Practices

### Perspective Design

1. Start with availability filter (available vs remaining)
2. Add context filters (tags, projects)
3. Choose appropriate grouping
4. Sort by actionable criteria
5. Keep filters simple and focused

### Common Custom Perspectives

| Name | Purpose | Filter |
|------|---------|--------|
| Today | Daily focus | Due today + Flagged + Forecast tag |
| Errands | Location batch | Tag = Errands, Available |
| Quick Wins | Short tasks | Duration < 15min, Available |
| Waiting | Delegated items | Tag = Waiting For |
| Stalled | Projects needing attention | Projects with 0 remaining tasks |

## Related Specifications

- `specs/forecast.md` - Date-based Forecast perspective
- `specs/review.md` - Review perspective and workflow
- `specs/custom-perspectives.md` - Advanced custom perspective features
- `specs/focus-mode.md` - Focus mode interaction
- `specs/availability.md` - Available vs Remaining filtering
