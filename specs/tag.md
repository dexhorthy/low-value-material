# Tag Specification

A **Tag** represents an association that a task has to the world around it. Tags can denote people, places, things, energy levels, priorities, or any context relevant to task completion.

## Overview

Tags replaced the older "Contexts" concept, with key improvements:
- Tasks can have **multiple tags** (contexts were single-assignment)
- Tags have **no predefined purpose** - fully user-defined
- Tags support **hierarchical nesting**

## Data Model

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | String | Tag name (1-200 chars) |
| `created_at` | Timestamp | When the tag was created |
| `modified_at` | Timestamp | When the tag was last modified |
| `status` | Enum | Current status (see below) |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `parent_id` | UUID | null | Parent tag (null = top-level) |
| `order` | Integer | auto | Sort order among siblings |
| `allows_next_action` | Boolean | true | If false, tagged tasks cannot be "next action" |
| `children_mutually_exclusive` | Boolean | false | Only one child tag assignable at a time |
| `location` | Location | null | Geographic location for location-based features |

### Location Fields (Optional)

| Field | Type | Description |
|-------|------|-------------|
| `location.latitude` | Float | Latitude coordinate |
| `location.longitude` | Float | Longitude coordinate |
| `location.radius` | Integer | Trigger radius in meters |
| `location.name` | String | Human-readable location name |

## Tag Status Enum

| Value | Description |
|-------|-------------|
| `active` | Tag is operational |
| `on_hold` | Tag is paused; tagged items become unavailable |
| `dropped` | Tag is archived |

### Status Transitions

```
              ┌─────────────────┐
              │     active      │
              └────────┬────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               │               ▼
┌─────────────┐        │        ┌───────────┐
│   on_hold   │◄───────┴───────►│  dropped  │
└─────────────┘                 └───────────┘
```

### Status Effects

| Status | Tagged Tasks |
|--------|--------------|
| `active` | Normal availability (per other rules) |
| `on_hold` | Become unavailable (hidden from Available view) |
| `dropped` | Hidden from most views |

**Important:** When a tag goes `on_hold`, ALL tasks with that tag become unavailable, even if they have other active tags.

## Hierarchical Tags

Tags can nest to create organizational groups:

```
🏷️ People
  🏷️ Alice
  🏷️ Bob
  🏷️ Charlie
🏷️ Energy
  🏷️ High
  🏷️ Medium
  🏷️ Low
🏷️ Places
  🏷️ Home
  🏷️ Office
  🏷️ Errands
```

### Nesting Behavior

- Tags can nest to arbitrary depth
- Child tags inherit nothing from parents (unlike folder→project)
- Assigning a child tag does NOT auto-assign the parent
- Filtering by parent can optionally include children

### Mutually Exclusive Children

When `children_mutually_exclusive = true`:
- Only ONE child of that tag can be assigned to a task
- Assigning a new child removes any existing sibling
- Useful for: priority levels, energy states, exclusive categories

```
🏷️ Priority (mutually_exclusive: true)
  🏷️ High     ← Assigning this...
  🏷️ Medium   ← ...removes this
  🏷️ Low
```

## Tag Assignment

### Many-to-Many Relationship

```
Task ←──────→ Tag
     (junction table)
```

- A task can have 0 to many tags
- A tag can be assigned to 0 to many tasks
- Order of tags on a task is preserved

### Assignment to Projects

Projects can also have tags:
- Project tags serve as defaults for new tasks
- New tasks inherit project tags at creation time
- Inheritance is one-time; later changes don't propagate
- Tasks can modify their tags independently after creation

### Assignment Operations

```
add_tag(item_id: UUID, tag_id: UUID) → void
add_tags(item_id: UUID, tag_ids: UUID[]) → void
remove_tag(item_id: UUID, tag_id: UUID) → void
remove_tags(item_id: UUID, tag_ids: UUID[]) → void
clear_tags(item_id: UUID) → void
set_tags(item_id: UUID, tag_ids: UUID[]) → void  // Replace all
```

## Allows Next Action

The `allows_next_action` property controls task availability:

| Value | Effect |
|-------|--------|
| `true` | Tagged tasks can be "next action" in their project |
| `false` | Tagged tasks are never "next action" even if first in sequence |

Use case: "Waiting For" tag where tasks are blocked on external input.

```
🏷️ Waiting For (allows_next_action: false)
```

Tasks with this tag won't show as available even if they're the first task in a sequential project.

## Location-Based Tags

Tags with location data enable proximity features:

```
🏷️ Grocery Store
  location:
    latitude: 37.7749
    longitude: -122.4194
    radius: 500  // meters
    name: "Whole Foods Market"
```

### Nearby Queries

```
nearby_tasks(
  latitude: Float,
  longitude: Float,
  max_distance?: Integer  // meters, default unlimited
) → Task[]
```

Returns available tasks with location-tagged tags within range.

## Computed Properties

### Tasks by Tag

```
tag_tasks(tag_id: UUID) → Task[]           // All tasks with this tag
tag_available_tasks(tag_id: UUID) → Task[] // Available tasks only
tag_remaining_tasks(tag_id: UUID) → Task[] // Non-completed tasks
```

### Flattened Tags

```
flattened_tags(tag_id: UUID) → Tag[]  // All descendants
```

### Tag Statistics

```
tag_stats(tag_id: UUID) → {
  task_count: Integer,      // Tasks directly tagged
  available_count: Integer, // Available tasks
  remaining_count: Integer, // Non-completed tasks
  child_count: Integer,     // Direct child tags
}
```

## Operations

### Create Tag

```
create_tag(
  name: String,
  parent_id?: UUID,
  position?: Integer,
  ...optional_fields
) → Tag
```

### Rename Tag

```
rename_tag(tag_id: UUID, name: String) → Tag
```

### Change Status

```
set_tag_status(tag_id: UUID, status: TagStatus) → Tag
```

### Move Tag

```
move_tag(
  tag_id: UUID,
  parent_id?: UUID,     // null = top level
  position?: Integer
) → Tag
```

### Delete Tag

```
delete_tag(tag_id: UUID) → void
```

- Removes tag from all tasks/projects
- Does NOT delete the tasks themselves
- Child tags can be: deleted recursively OR moved up to parent

## Queries

### List Tags

```
list_tags(
  parent_id?: UUID,          // null = top-level only
  include_dropped: Boolean = false,
  recursive: Boolean = false
) → Tag[]
```

### Find Tag

```
find_tag(name: String, parent_id?: UUID) → Tag?
```

Case-insensitive name search.

### Tags with Location

```
list_location_tags() → Tag[]
```

Returns all tags that have location data.

## Special Tags

### Forecast Tag

One tag can be designated as the "Forecast Tag":
- Tasks with this tag appear in the Forecast view
- Only one tag can be the forecast tag at a time
- Configured at the application settings level

```
set_forecast_tag(tag_id: UUID) → void
get_forecast_tag() → Tag?
```

## Common Tag Patterns

### Energy Levels
```
🔋 Energy
  ⚡ High
  🔸 Medium
  🔹 Low
```

### Priority
```
🎯 Priority (mutually_exclusive)
  🔴 Urgent
  🟡 Important
  🟢 Normal
```

### People
```
👥 People
  👤 Alice
  👤 Bob
```

### Waiting For
```
⏳ Waiting For (allows_next_action: false)
```

### Locations
```
📍 Places
  🏠 Home (location: ...)
  🏢 Office (location: ...)
  🛒 Grocery Store (location: ...)
```

## Edge Cases

### Empty Tags
- Tags with no assigned tasks are valid
- May represent future categories

### Duplicate Names
- Tags can have the same name (different IDs)
- Not recommended; can confuse users
- Find operations return first match

### Circular Parent References
- Prevented: tag cannot be its own ancestor
- Validate on every parent change

### Deleting Tags with Tasks
- Tag is removed from tasks
- Tasks remain unchanged otherwise

### Status Conflicts
- If task has multiple tags and one is `on_hold`:
  - Task is unavailable (on_hold "wins")
- All tags must be `active` for task to be available via tag status

## Out of Scope (Future Specs)

- Location-based notifications (see `specs/notifications.md`)
- Nearby perspective (see `specs/perspectives.md`)
- Tag-based custom perspectives (see `specs/custom-perspectives.md`)
