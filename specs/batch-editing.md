# Batch Editing Specification

This specification covers selecting and editing multiple items simultaneously in an OmniFocus-like task manager.

## Overview

Batch editing allows users to:
- Select multiple items (actions, projects, folders, tags)
- View and edit shared properties in the Inspector
- Apply changes to all selected items at once
- Perform bulk operations like move, delete, and convert

This reduces repetitive editing and enables efficient inbox processing, reorganization, and maintenance.

## Selection

### Entering Selection Mode

**Desktop (Mac)**
- Click to select single item
- ⌘+Click to add/remove items from selection
- Shift+Click to select range between last selected and clicked item
- ⌘+A to select all visible items in outline

**Mobile (iOS/iPadOS)**
- Tap Select (or Edit) button to enter selection mode
- Tap items to toggle selection
- Tap Select All for visible items
- Tap Done or Cancel to exit selection mode

**Touch Gestures**
- Long-press and hold to "lift" item for drag selection
- While holding, tap additional items to add to selection
- Badge count shows total selected items

### Selection Scope

Selection operates within the current view:
- In Inbox: select inbox items
- In a Project: select actions within that project
- In a Perspective: select visible actions/projects
- In Tags sidebar: select tags
- In Projects sidebar: select projects/folders

### Selection Persistence

Selection is ephemeral:
- Clears when navigating away
- Clears when performing most operations
- Does not sync between devices

## Inspector with Multiple Selection

### Mixed Value Display

When multiple items are selected, the Inspector shows:

| Field State | Display |
|-------------|---------|
| All same | Normal value display |
| Some differ | "Mixed" or field-specific indicator |
| All empty | Empty field |

**Field-specific mixed indicators:**
- Status: shows "Mixed" if different statuses
- Flag: half-filled icon if some flagged, some not
- Tags: all assigned tags shown, with visual emphasis for tags on ALL items
- Dates: "Mixed" or empty if dates differ
- Project: "Mixed" if assigned to different projects
- Duration: "Mixed" if estimates differ

### Editing Behavior

**Applying a value:**
- Setting any field applies that value to ALL selected items
- Overwrites existing values (not additive)
- Example: Setting due date = tomorrow gives all items that due date

**Tags (additive behavior):**
- Adding a tag adds it to all items (doesn't remove existing tags)
- Removing a tag removes from all items that have it
- Tags shown with strong emphasis = on all items
- Tags shown with weak emphasis = on some items

**Clearing a value:**
- Clearing a field removes the value from all items
- Example: Clear due date removes due date from all selected

### Editable Fields

All standard task fields can be batch edited:

| Field | Batch Editable | Notes |
|-------|---------------|-------|
| Title | No | Must edit individually |
| Note | No | Must edit individually |
| Project | Yes | Move all to same project |
| Tags | Yes | Additive assignment |
| Due Date | Yes | Same date for all |
| Defer Date | Yes | Same date for all |
| Planned Date | Yes | Same date for all |
| Flag | Yes | Flag/unflag all |
| Status | Yes | Complete/drop all |
| Estimated Duration | Yes | Same estimate for all |
| Repeat | Yes | Same repeat rule for all |

## Bulk Operations

### Move

Move selected items to a new location:
- To a project (actions become tasks in that project)
- To a folder (projects become contained by that folder)
- To inbox (removes project assignment from actions)
- To another position in outline (reorder)

**Drag and Drop:**
- Drag selection to project in sidebar
- Drag selection to tag in sidebar (assigns tag, doesn't move)
- Drag selection to date in Forecast (assigns due date)
- Drop on item to create action group (nesting)

**Move Dialog:**
- Invoked via Move button in Inspector toolbar
- Shows project/folder hierarchy for selection
- Recent destinations shown for quick access

### Delete

Delete selected items:
- Confirmation dialog for bulk delete
- Deleted items can be recovered (undo or from database backup)
- Deleting a project deletes contained actions
- Deleting a folder deletes contained projects

### Convert

Convert between item types:
- Action → Project: Creates project with action as first task
- Project → Action: Flattens project (loses contained tasks)
- Multiple actions → Project: Creates project containing selected actions

### Complete/Drop

Change status in bulk:
- Complete All: Marks all as completed
- Drop All: Marks all as dropped
- Applies to projects and actions

### Flag/Unflag

Toggle flag status:
- Flag All: Applies flag to all
- Unflag All: Removes flag from all
- Works on actions and projects

### Clean Up

After bulk editing, Clean Up tidies the outline:
- Moves items that no longer belong in current view
- Processes tentative assignments
- Removes completed items (per view settings)

Triggers:
- Automatic (on perspective/view change)
- Manual (Clean Up button or menu)
- Pull-to-refresh gesture (mobile)

## Outline Operations

### Reordering

Within a project or inbox:
- Drag selected items to new position
- Insert marker shows drop location
- Respects sequential project ordering

### Grouping

Create action groups:
- Drop items onto another item to nest
- Selected items become children of drop target
- Drop target becomes action group (if was action)

### Indent/Outdent

Adjust hierarchy:
- Indent: Makes items children of preceding sibling
- Outdent: Moves items up one hierarchy level
- Applies to all selected items

Keyboard shortcuts:
- ⌘+] : Indent
- ⌘+[ : Outdent

## Keyboard Shortcuts (Desktop)

| Shortcut | Action |
|----------|--------|
| ⌘+A | Select All |
| ⌘+Click | Add/remove from selection |
| Shift+Click | Select range |
| Delete/Backspace | Delete selected |
| ⌘+K | Complete selected |
| ⇧+⌘+D | Duplicate selected |
| ⌘+] | Indent |
| ⌘+[ | Outdent |

## Edit Mode (Mobile)

### Entering Edit Mode

- Tap Edit/Select in toolbar or menu
- Long-press on item (some implementations)
- Swipe gesture (some implementations)

### Edit Mode UI

While in Edit mode:
- Selection circles appear on each row
- Bottom toolbar shows batch operations
- Inspector available for batch property editing
- Navigation may be restricted

### Bottom Bar Actions

Compact view shows overflow menu, wide view shows buttons:
- Move
- Tag (quick tag assignment)
- Flag
- Date (quick date picker)
- More (complete, drop, delete, convert)

## Constraints

### Selection Limits

- No hard limit on selection count
- Performance may degrade with very large selections
- Some operations may warn on large selections

### Type Mixing

Selecting items of different types:
- Status field adapts to show common statuses (Active, Completed, Dropped)
- Type-specific fields hidden when not applicable to all
- Some operations may be disabled for mixed types

### View Restrictions

Some operations respect current view:
- Cannot move to hidden projects (filtered out)
- Cannot assign dropped tags (unless showing dropped)
- Clean Up respects current perspective rules

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `editing.select_on_tap` | false | Single tap selects vs opens |
| `editing.drag_delay` | 200ms | Hold duration before drag initiates |
| `editing.confirm_bulk_delete` | true | Show confirmation for multi-delete |
| `editing.auto_clean_up` | true | Clean up after batch operations |

## Related Specifications

- `specs/inbox.md` - Inbox processing workflow
- `specs/task.md` - Task data model
- `specs/project.md` - Project containment
- `specs/tag.md` - Tag assignment
