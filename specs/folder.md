# Folder Specification

A **Folder** is a container for organizing projects and other folders into a hierarchy. Folders provide structure but do not directly contain tasks.

## Data Model

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | String | Folder name (1-500 chars) |
| `created_at` | Timestamp | When the folder was created |
| `modified_at` | Timestamp | When the folder was last modified |
| `status` | Enum | Current status (see below) |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `parent_id` | UUID | null | Parent folder (null = root level) |
| `order` | Integer | auto | Sort order among siblings |

## Folder Status Enum

Folders have a simpler status than projects:

| Value | Description |
|-------|-------------|
| `active` | Folder is operational and visible |
| `dropped` | Folder is archived/inactive |

### Status Transitions

```
    ┌────────────┐
    │   active   │
    └─────┬──────┘
          │
          ▼
    ┌────────────┐
    │  dropped   │
    └────────────┘
          │
          ▼
     (can restore)
```

- Folders start as `active`
- `active` → `dropped`: Archive folder
- `dropped` → `active`: Restore folder

**Note:** Folders do NOT have `on_hold` or `completed` status - those are project-only states.

### Status Effects on Contents

| Folder Status | Child Folders | Child Projects |
|---------------|---------------|----------------|
| `active` | Normal behavior | Normal behavior |
| `dropped` | Hidden (but retain own status) | Hidden (but retain own status) |

When a folder is dropped:
- All contained projects and folders are hidden from normal views
- Contents retain their individual status (not automatically dropped)
- Restoring the folder reveals contents with their original status

## Hierarchy

Folders can nest to arbitrary depth:

```
📁 Work (folder)
  📁 Client A (folder)
    📋 Website Redesign (project)
    📋 Mobile App (project)
  📁 Client B (folder)
    📋 API Integration (project)
📁 Personal (folder)
  📋 Home Renovation (project)
```

### Containment Rules

| Container | Can Contain |
|-----------|-------------|
| Folder | Folders, Projects |
| Project | Tasks (Actions) |
| Task | Subtasks (Action Groups) |

- Folders contain folders and projects (mixed)
- Folders do NOT directly contain tasks
- Projects are the bridge between folders and tasks

### Ordering

Siblings (folders and projects at the same level) are ordered by:
1. `order` field (ascending)
2. `created_at` as tiebreaker

Folders and projects can be interleaved in the display order.

## Computed Properties

### Children

```
children(folder_id: UUID) → (Folder | Project)[]
```

Returns direct child folders and projects, sorted by `order`.

### Flattened Projects

```
flattened_projects(folder_id: UUID) → Project[]
```

Returns ALL projects nested within the folder at any depth:

```
📁 Work
  📋 Project A          ← included
  📁 Clients
    📋 Project B        ← included
    📁 Active
      📋 Project C      ← included
```

### Flattened Folders

```
flattened_folders(folder_id: UUID) → Folder[]
```

Returns ALL folders nested within the folder at any depth.

### Ancestors

```
ancestors(folder_id: UUID) → Folder[]
```

Returns path from root to this folder (excluding self):

```
For "📁 Active" above: [Work, Clients]
```

## Operations

### Create Folder

```
create_folder(
  name: String,
  parent_id?: UUID,
  position?: Integer
) → Folder
```

- If no `parent_id`, folder is at root level
- `position` specifies order among siblings

### Rename Folder

```
rename_folder(folder_id: UUID, name: String) → Folder
```

### Drop Folder

```
drop_folder(folder_id: UUID) → Folder
```

- Sets `status` = `dropped`
- Contents become hidden but retain their status

### Activate Folder

```
activate_folder(folder_id: UUID) → Folder
```

- Sets `status` = `active`
- Contents become visible again

### Move Folder

```
move_folder(
  folder_id: UUID,
  target_parent_id?: UUID,
  position?: Integer
) → Folder
```

- Moves folder to new parent (or root if null)
- Updates `order` of affected items

### Delete Folder

```
delete_folder(
  folder_id: UUID,
  recursive: Boolean = false
) → void
```

Options when deleting:
- `recursive = true`: Delete all contained folders and projects
- `recursive = false`: Move contents up to parent (or root)

## Queries

### List Root Items

Returns folders and projects with no parent:

```
list_root_items() → (Folder | Project)[]
```

### List Folder Contents

Returns direct children:

```
list_contents(folder_id: UUID, include_dropped: Boolean = false) → (Folder | Project)[]
```

### Find Folder by Name

```
find_folder(name: String, parent_id?: UUID) → Folder?
```

Case-insensitive search within parent scope.

### Get Folder Statistics

```
folder_stats(folder_id: UUID) → {
  project_count: Integer,      // Direct projects
  folder_count: Integer,       // Direct folders
  total_projects: Integer,     // All nested projects
  total_tasks: Integer,        // All tasks in nested projects
  remaining_tasks: Integer,    // Non-completed tasks
}
```

## View Filtering

Folders affect what's visible based on view settings:

| View Setting | Shows |
|--------------|-------|
| Available | Active folders only |
| Remaining | Active folders only |
| All | Active and dropped folders |

## Edge Cases

### Empty Folders
- Folders with no contents are valid
- May indicate organizational placeholder

### Circular References
- System must prevent folder from being its own ancestor
- Validate on every parent change

### Maximum Depth
- Implementation-defined (recommend 20 levels)
- UI may struggle with excessive nesting

### Name Uniqueness
- Names need NOT be unique
- Multiple folders can have the same name
- Use `id` for unambiguous reference

### Moving to Own Descendant
- Prevented: Cannot move folder into its own child/grandchild
- Validate ancestry on move operations

## Integration with Projects

When a project is moved:
- It inherits no properties from the folder
- Tags, dates, and status remain on the project

Folders are purely organizational - they don't propagate properties to contents.

## Out of Scope (Future Specs)

- Focus mode on folders (see `specs/focus-mode.md`)
- Folder-based perspectives (see `specs/perspectives.md`)
- Sync conflict resolution (see `specs/sync.md`)
