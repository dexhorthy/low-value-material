# Custom Perspectives Specification

**Custom Perspectives** (Pro feature) allow users to create tailored views with specific filter rules, grouping, and sorting. This specification extends `specs/perspectives.md` with advanced customization features.

## Overview

Custom perspectives enable:
- Complex filter rule hierarchies
- Situational views (meetings, errands, energy levels)
- Maintenance perspectives (stale items, unfiled projects)
- Duration-based filtering (quick wins)
- Project and folder scoping

## Pro Feature

Custom perspectives require OmniFocus Pro:
- Standard: Built-in perspectives only
- Pro: Create unlimited custom perspectives

## Perspective Editor

### Access

- New Perspective button in sidebar
- Duplicate existing perspective
- Edit existing custom perspective

### Editor Sections

1. **Name & Icon** - Identity
2. **Filter Rules** - What to include
3. **Presentation** - How to display
4. **Layout** - Actions vs Projects mode

## Filter Rules

### Rule Hierarchy

Rules form a tree structure:

```
root (All/Any/None)
├── condition 1
├── condition 2
└── group (All/Any/None)
    ├── condition 3
    └── condition 4
```

### Aggregation Types

| Type | Meaning | Logic |
|------|---------|-------|
| `all` | All must match | AND |
| `any` | Any can match | OR |
| `none` | None can match | NOT |

### Rule Example

"Available items that are flagged OR due soon":

```json
{
  "aggregation": "all",
  "rules": [
    { "type": "availability", "value": "available" },
    {
      "aggregation": "any",
      "rules": [
        { "type": "flagged", "value": true },
        { "type": "status", "value": "due_soon" }
      ]
    }
  ]
}
```

## Filter Conditions

### Availability Conditions

| Condition | Description |
|-----------|-------------|
| `first_available` | First available in project |
| `available` | Currently actionable |
| `remaining` | Not completed/dropped |
| `completed` | Completed items |
| `dropped` | Dropped items |

### Status Conditions

| Condition | Description |
|-----------|-------------|
| `flagged` | Item is flagged |
| `due_soon` | Within due soon threshold |
| `overdue` | Past due date |
| `stalled` | Project with no remaining actions |

### Date Conditions

| Condition | Parameters | Description |
|-----------|------------|-------------|
| `has_due_date` | - | Item has due date |
| `has_defer_date` | - | Item has defer date |
| `due_within` | days | Due within N days |
| `defer_within` | days | Defers within N days |
| `due_before` | date | Due before date |
| `due_after` | date | Due after date |
| `modified_within` | days | Changed within N days |
| `added_within` | days | Created within N days |

### Duration Conditions

| Condition | Parameters | Description |
|-----------|------------|-------------|
| `has_duration` | - | Has estimated duration |
| `duration_less_than` | minutes | Under N minutes |
| `duration_greater_than` | minutes | Over N minutes |
| `duration_equals` | minutes | Exactly N minutes |

Common duration thresholds:
- 5 minutes (quick wins)
- 15 minutes (short tasks)
- 30 minutes (medium tasks)
- 60 minutes (long tasks)

### Container Conditions

| Condition | Parameters | Description |
|-----------|------------|-------------|
| `in_project` | project_id(s) | In specific project(s) |
| `in_folder` | folder_id(s) | In specific folder(s) |
| `has_tag` | tag_id(s) | Has specific tag(s) |
| `has_any_tag` | tag_id(s) | Has any of tags |
| `has_all_tags` | tag_id(s) | Has all of tags |
| `in_inbox` | - | Is inbox item |
| `is_project` | - | Is a project (not action) |

### Text Conditions

| Condition | Parameters | Description |
|-----------|------------|-------------|
| `title_contains` | text | Title contains text |
| `title_matches` | regex | Title matches pattern |
| `note_contains` | text | Note contains text |
| `note_matches` | regex | Note matches pattern |

## Presentation Options

### Display Mode

| Mode | Description |
|------|-------------|
| `actions` | Individual actions (flat list) |
| `projects` | Full project hierarchy |

### Grouping (Actions Mode)

| Grouping | Description |
|----------|-------------|
| `ungrouped` | No grouping |
| `project` | By parent project |
| `folder` | By containing folder |
| `tag` | By tag (duplicates if multiple) |
| `flagged` | By flagged status |
| `due` | By due date |
| `defer` | By defer date |
| `added` | By date added |
| `changed` | By date modified |
| `completed` | By completion date |
| `context` | By first tag |

### Sorting

Multiple sort keys in priority order:

| Sort Key | Description |
|----------|-------------|
| `flagged` | Flagged first |
| `name` | Alphabetical |
| `due` | By due date |
| `defer` | By defer date |
| `added` | By creation date |
| `changed` | By modification date |
| `completed` | By completion date |
| `duration` | By estimated time |
| `project` | By project name |
| `order` | Manual order |

### Sort Direction

Each sort key can be:
- `ascending` (A-Z, earliest first)
- `descending` (Z-A, latest first)

## Layout Options

### View Options

| Option | Description |
|--------|-------------|
| `show_project_paths` | Show project name for actions |
| `show_tags` | Display tag badges |
| `show_due_dates` | Display due date info |
| `show_defer_dates` | Display defer date info |
| `show_estimates` | Display duration estimates |
| `show_notes_preview` | Show note snippet |
| `compact_rows` | Reduced row height |

### Column Options (Desktop)

| Option | Description |
|--------|-------------|
| `show_checkbox` | Completion checkbox |
| `show_flag` | Flag indicator |
| `show_status` | Status icons |
| `show_dates` | Date columns |

## Common Perspective Patterns

### Today Perspective

```json
{
  "name": "Today",
  "filter": {
    "aggregation": "any",
    "rules": [
      { "type": "flagged", "value": true },
      { "type": "status", "value": "due_soon" },
      { "type": "status", "value": "overdue" },
      { "type": "has_tag", "value": "forecast_tag_id" }
    ]
  },
  "grouping": "ungrouped",
  "sorting": [
    { "key": "flagged", "direction": "descending" },
    { "key": "due", "direction": "ascending" }
  ]
}
```

### Quick Wins (< 5 min)

```json
{
  "name": "Quick Wins",
  "filter": {
    "aggregation": "all",
    "rules": [
      { "type": "availability", "value": "available" },
      { "type": "duration_less_than", "value": 5 }
    ]
  },
  "grouping": "project",
  "sorting": [{ "key": "duration", "direction": "ascending" }]
}
```

### Stale Actions (Not Modified in 6 Months)

```json
{
  "name": "Stale Actions",
  "filter": {
    "aggregation": "all",
    "rules": [
      { "type": "availability", "value": "remaining" },
      { "type": "modified_before", "value": "-6 months" }
    ]
  },
  "grouping": "changed",
  "sorting": [{ "key": "changed", "direction": "ascending" }]
}
```

### Work Context

```json
{
  "name": "Work",
  "filter": {
    "aggregation": "all",
    "rules": [
      { "type": "availability", "value": "available" },
      { "type": "in_folder", "value": "work_folder_id" }
    ]
  },
  "grouping": "project",
  "sorting": [{ "key": "due", "direction": "ascending" }]
}
```

### Waiting For

```json
{
  "name": "Waiting For",
  "filter": {
    "aggregation": "all",
    "rules": [
      { "type": "availability", "value": "remaining" },
      { "type": "has_tag", "value": "waiting_for_tag_id" }
    ]
  },
  "grouping": "project",
  "sorting": [{ "key": "added", "direction": "ascending" }]
}
```

### No Duration Assigned

```json
{
  "name": "No Duration",
  "filter": {
    "aggregation": "all",
    "rules": [
      { "type": "availability", "value": "remaining" },
      { "type": "has_duration", "value": false }
    ]
  },
  "grouping": "project"
}
```

## Operations

### Create Perspective

```
create_custom_perspective(
  name: String,
  filter_rules: FilterRule,
  grouping?: GroupingType,
  sorting?: SortConfig[],
  display_mode?: DisplayMode,
  icon?: String,
  icon_color?: Color,
  options?: ViewOptions
) → Perspective
```

### Update Perspective

```
update_custom_perspective(
  perspective_id: String,
  ...changes
) → Perspective
```

### Duplicate Perspective

```
duplicate_perspective(
  perspective_id: String,
  new_name?: String
) → Perspective
```

### Delete Perspective

```
delete_custom_perspective(perspective_id: String) → void
```

### Export Perspective

```
export_perspective(perspective_id: String) → PerspectiveJSON
```

### Import Perspective

```
import_perspective(data: PerspectiveJSON) → Perspective
```

## Syncing

Custom perspectives sync across devices:

| Property | Syncs |
|----------|-------|
| Name | Yes |
| Icon & color | Yes |
| Filter rules | Yes |
| Grouping/sorting | Yes |
| View options | Yes |

### Version Compatibility

- Newer filter rules may not work on older versions
- Incompatible perspectives are hidden (not deleted)
- Rule structure preserved for when version updates

## Automation Access

### Read Filter Rules

```
perspective.filter_rules → FilterRuleJSON
```

### Modify Filter Rules

```
perspective.set_filter_rules(rules: FilterRuleJSON) → void
```

### Programmatic Creation

```javascript
// Create perspective via automation
const perspective = Perspective.Custom.create({
  name: "My Perspective",
  filterRules: {...},
  grouping: "project"
});
```

## Sharing Perspectives

### Export Format

JSON structure containing:
- Name, icon, color
- Filter rules tree
- Presentation settings
- Sort configuration

### Sharing Methods

- Export to file
- Copy as link (if supported)
- Share via sync to other devices

### Import Handling

- Validate rule structure
- Map project/tag IDs (or use names)
- Handle missing referenced items

## Best Practices

### Filter Design

1. Start with availability filter (available/remaining)
2. Add context filters (tags, projects)
3. Refine with date/status conditions
4. Test with sample data

### Performance

- Simpler rules execute faster
- Avoid excessive nesting
- Limit text search (slower)
- Cache perspective results

### Naming

- Use descriptive names
- Include context (Work:, Home:)
- Indicate purpose (Review:, Planning:)

### Maintenance

- Periodically review perspectives
- Remove unused perspectives
- Update rules as workflow changes

## Edge Cases

### Empty Results

- Valid state (no matching items)
- Show empty state message
- Don't hide perspective

### Conflicting Rules

- Evaluated in order
- All/Any/None logic applied strictly
- Test edge cases

### Deleted References

- Projects/folders/tags in rules may be deleted
- Filter continues working
- Missing references are ignored

### Very Complex Rules

- No hard limit on depth
- Performance may degrade
- Consider simplifying

## Related Specifications

- `specs/perspectives.md` - Core perspective framework
- `specs/availability.md` - Availability states for filtering
- `specs/tag.md` - Tag-based filtering
- `specs/project.md` - Project/folder-based filtering
