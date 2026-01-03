# Focus Mode Specification

**Focus Mode** temporarily narrows the scope of your database to selected folders or projects. While focused, all perspectives show only items within the focused scope.

## Overview

Focus Mode helps with:
- Concentrating on a specific area of responsibility
- Reducing overwhelm during work sessions
- Creating temporary filtered views
- Separating work/personal contexts

Focus requires OmniFocus Pro.

## Data Model

### Focus State

| Field | Type | Description |
|-------|------|-------------|
| `is_focused` | Boolean | Whether focus is active |
| `focused_items` | UUID[] | IDs of focused projects/folders |
| `focus_scope` | Enum | `projects`, `folders`, or `mixed` |

### Focus Scope

Focus can include:
- One or more projects
- One or more folders
- Mix of projects and folders

Items contained within focused folders are automatically included.

## Focus Operations

### Enter Focus

```
focus_on(item_ids: UUID[]) → void
```

- Accepts project and/or folder IDs
- Sets `is_focused = true`
- Stores focused item IDs
- Immediately applies to all perspectives

### Exit Focus (Unfocus)

```
unfocus() → void
```

- Clears focus state
- Sets `is_focused = false`
- Restores full database view

### Toggle Focus

```
toggle_focus(item_ids: UUID[]) → void
```

- If unfocused: focus on items
- If focused on same items: unfocus
- If focused on different items: change focus to new items

### Add to Focus

```
add_to_focus(item_ids: UUID[]) → void
```

- Expands current focus to include additional items
- No effect if not currently focused

### Remove from Focus

```
remove_from_focus(item_ids: UUID[]) → void
```

- Narrows current focus by removing items
- If last item removed, unfocus entirely

## Focus Scope Calculation

### What's Included

When focused on a folder:
```
included_items =
  folder
  + all nested folders (recursive)
  + all projects in folder (recursive)
  + all tasks in those projects
```

When focused on a project:
```
included_items =
  project
  + all tasks in project (recursive)
```

### What's Excluded

Everything not in the focus scope:
- Other folders
- Other projects
- Inbox items (always visible or configurable)
- Tags perspective shows only relevant tags

## Effect on Perspectives

### Inbox

| Setting | Behavior |
|---------|----------|
| Always visible | Inbox items always shown |
| Hidden during focus | Inbox hidden when focused |
| Configurable | User preference |

Default: Inbox items always visible (focus doesn't hide inbox).

### Projects

Only focused projects/folders visible:
- Sidebar shows focused folders/projects only
- Main outline shows only focused items
- Unfocused projects completely hidden

### Tags

Tags perspective behavior during focus:
- Shows all tags
- But only tasks within focus scope appear under each tag
- Empty tags may be hidden or shown (configurable)

### Forecast

Forecast during focus:
- Shows only due/deferred items from focused scope
- Calendar events unaffected
- Badge counts reflect focused scope

### Review

Review during focus:
- Shows only projects within focused scope
- Review counts reflect focused scope

### Custom Perspectives

Custom perspectives during focus:
- Filter rules still apply
- BUT results intersected with focus scope
- Focus acts as additional implicit filter

## Visual Indicators

### Focus Bar

When focused, a focus bar appears:

```
┌────────────────────────────────────────────────────┐
│ 🎯 Focus: Work Projects, Personal         [Unfocus] │
└────────────────────────────────────────────────────┘
```

Components:
- Focus icon
- Label showing focused items
- Unfocus button

### Sidebar Indication

Focused items may be visually distinguished:
- Different background color
- Focus badge/icon
- Clear boundary between focused/unfocused

### Badge Counts

All badge counts reflect focused scope:
- Inbox count (if affected)
- Perspective counts
- Due soon/overdue counts

## Persistence

### Session Persistence

| Behavior | Description |
|----------|-------------|
| Persists during session | Focus remains while app is open |
| Persists across perspective changes | Switching perspectives keeps focus |
| Quit behavior | Configurable (remember or clear) |

### Sync Behavior

Focus state is:
- **Not synced** between devices (local only)
- Each device has independent focus
- Rationale: Focus is contextual to current work session

### Restoration

| Setting | Behavior |
|---------|----------|
| Remember focus | Restore focus when app reopens |
| Clear on quit | Start unfocused each session |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘⇧F | Focus on selection / Unfocus |
| ⌘⇧⌥F | Add selection to focus |

## Toolbar Integration

### Focus Button

Toolbar button with states:
- **Unfocused**: Shows "Focus" - clicks to focus on selection
- **Focused**: Shows "Unfocus" - clicks to exit focus

### Contextual Menu

Right-click on project/folder:
- "Focus on [Item]"
- "Add to Focus" (if already focused)
- "Remove from Focus" (if item is in focus)

## iOS/macOS Focus Mode Integration

### System Focus Modes

OmniFocus can integrate with OS-level Focus modes:

```
set_focus_filter(
  system_focus: String,  // "Work", "Personal", etc.
  omnifocus_focus: UUID[]  // Folders/projects to focus
) → void
```

When system Focus activates:
- OmniFocus automatically focuses on configured items
- When system Focus deactivates, OmniFocus unfocuses

### Configuration

| OS Focus Mode | OmniFocus Focus |
|---------------|-----------------|
| Work | Work folder |
| Personal | Personal folder |
| Do Not Disturb | No change |

## Queries

### Is Focused

```
is_focused() → Boolean
```

### Get Focused Items

```
get_focused_items() → (Project | Folder)[]
```

### Is In Focus Scope

```
is_in_focus_scope(item_id: UUID) → Boolean
```

Returns true if item is within current focus scope.

### Focused Perspective Results

```
get_perspective_items_focused(
  perspective_id: String
) → Item[]
```

Returns perspective results filtered by focus scope.

## Edge Cases

### Focus on Empty Folder

- Valid operation
- All perspectives show no items (except Inbox)
- Useful for starting a new area

### Focus Item Deleted

- If all focused items deleted, automatically unfocus
- If some focused items remain, continue with remaining

### Focus on Completed/Dropped Project

- Allowed
- Shows completed/dropped items per perspective settings

### Focus on Inbox

- Inbox cannot be focused (it's not a project/folder)
- Inbox items have no container to focus

### Nested Focus

- Cannot create nested/layered focus
- New focus replaces existing focus
- Use multiple folders to approximate

### Focus and Search

- Search results can be limited to focus scope
- Or search can ignore focus (configurable)

## Settings

### Focus Preferences

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `remember_focus` | Boolean | false | Restore focus on app launch |
| `inbox_during_focus` | Enum | visible | `visible`, `hidden`, `separate` |
| `search_respects_focus` | Boolean | true | Limit search to focus scope |
| `empty_tags_during_focus` | Enum | hide | `show`, `hide` |

## Automation

### Focus via Shortcuts

```
// Shortcut action
Focus OmniFocus on: [Work Folder]
```

### Focus via URL Scheme

```
omnifocus:///focus?id=PROJECT_ID
omnifocus:///unfocus
```

### Focus via Scripting

```javascript
// Focus on specific folder
const workFolder = Folder.byName("Work");
document.focus([workFolder]);

// Unfocus
document.unfocus();
```

## Best Practices

### When to Use Focus

- Deep work sessions on specific project
- Separating work/personal during business hours
- Client-specific work sessions
- Reducing overwhelm from large database

### When NOT to Use Focus

- Quick tasks across multiple areas
- Weekly review (need full visibility)
- Inbox processing (usually needs context)

### Focus Workflow

1. Select project or folder
2. Press ⌘⇧F to focus
3. Work exclusively in that area
4. Switch perspectives as needed (focus persists)
5. Press ⌘⇧F to unfocus when done

## Related Specifications

- `specs/perspectives.md` - How focus affects perspectives
- `specs/project.md` - Project structure for focusing
- `specs/folder.md` - Folder hierarchy for focusing
- `specs/custom-perspectives.md` - Focus interaction with filters
