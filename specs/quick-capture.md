# Quick Capture Specification

**Quick Capture** enables rapid task entry from anywhere on the device. Multiple capture methods ensure thoughts can be captured with minimal friction.

## Overview

Quick Capture is central to GTD's "capture" principle:
- Capture anything that has your attention
- Get it out of your head and into the system
- Process later (don't organize during capture)
- Minimal friction for maximum adoption

## Capture Methods

### 1. Quick Entry (Desktop)

Global keyboard shortcut opens a floating capture window:

| Feature | Description |
|---------|-------------|
| Trigger | Global hotkey (default: ⌃⌥Space) |
| Availability | System-wide, any app |
| Requirement | App must be running (background OK) |
| Result | Creates inbox item |

### 2. Share Extension

Capture from other apps via system share sheet:

| Feature | Description |
|---------|-------------|
| Trigger | Share menu in supporting apps |
| Content | Text, URLs, images, files |
| Availability | iOS, macOS |
| Result | Creates inbox item with attachment/link |

### 3. Clippings Service (macOS)

Capture selected text from any application:

| Feature | Description |
|---------|-------------|
| Trigger | Configurable keyboard shortcut |
| Content | Selected text |
| Setup | System Settings → Keyboard → Shortcuts |
| Result | Creates inbox item with clipped text |

### 4. Siri Voice Capture

Voice commands for hands-free capture:

| Feature | Description |
|---------|-------------|
| Trigger | "Hey Siri" or Siri button |
| Commands | "Remind me to X in OmniFocus" |
| Parameters | Due date, time, repeat |
| Result | Creates inbox item |

### 5. Email Capture

Forward or send emails to create tasks:

| Feature | Description |
|---------|-------------|
| Trigger | Email to designated address |
| Content | Email subject → title, body → note |
| Attachments | Optionally included |
| Result | Creates inbox item |

### 6. URL Scheme

Capture via URL for automation:

```
omnifocus:///add?name=TITLE&note=NOTE&project=PROJECT
```

### 7. Shortcuts/Automation

Capture via Shortcuts app:

| Action | Description |
|--------|-------------|
| Add OmniFocus Item | Creates task with parameters |
| Add TaskPaper | Imports TaskPaper-formatted text |

## Quick Entry Window

### Window Behavior

| Property | Behavior |
|----------|----------|
| Type | Floating panel |
| Position | Centered or remembers last position |
| Focus | Steals focus from current app |
| Dismiss | Escape, click outside, or Save |

### Default State

Opens with:
- Empty title field (focused)
- Optional: Pre-filled fields from context

### Fields

#### Required Field

| Field | Description |
|-------|-------------|
| Title | Task name (required) |

#### Optional Fields (Configurable)

| Field | Description |
|-------|-------------|
| Note | Extended details |
| Project | Destination project (tentative) |
| Tags | Tag assignment |
| Due Date | Due date/time |
| Defer Date | Defer until date/time |
| Flag | Flagged status |
| Estimated Duration | Time estimate |

### Layout Options

| Mode | Description |
|------|-------------|
| Compact | Title only, quick capture |
| Fluid | Title + single row of fields |
| Columns | Customizable multi-column layout |
| Full | All fields visible |

### Field Customization

Users can configure:
- Which fields appear
- Field order
- Default values

## Context-Aware Capture

### From Safari/Browser

When sharing from browser:
- Title: Page title
- Note: Selected text (if any)
- Attachment: URL

### From Mail

When sharing email:
- Title: Email subject
- Note: Email body excerpt
- Attachment: Link to email

### From Files

When sharing file:
- Title: Filename
- Attachment: File or file reference

### From Photos

When sharing image:
- Title: Empty (user enters)
- Attachment: Image

## Siri Commands

### Add Task

```
"Remind me to [task] in OmniFocus"
```

Creates inbox item with title.

### Add with Due Date

```
"Remind me to [task] at 5pm in OmniFocus"
"Remind me to [task] tomorrow in OmniFocus"
"Remind me to [task] on Friday in OmniFocus"
```

Creates item with due date.

### Add to Project/Tag

```
"Add [task] to my [project/tag] list in OmniFocus"
```

Prompts for disambiguation if needed.

### Add with Repeat

```
"Remind me to [task] every Thursday in OmniFocus"
```

Creates repeating item.

### Siri Limitations

- Lists = projects OR tags (ambiguous)
- Limited field support
- No defer date via Siri
- No flag via Siri

## Shortcuts Actions

### Add OmniFocus Item

Parameters:
- Name (required)
- Note
- Project
- Tags
- Due Date
- Defer Date
- Flag
- Estimated Minutes

### Add TaskPaper to OmniFocus

Import TaskPaper-formatted text:

```
- Task One @due(tomorrow)
- Task Two @tag(Work) @flag
Project Name:
  - Subtask @defer(next week)
```

## Email Capture

### Configuration

| Setting | Description |
|---------|-------------|
| Capture address | Unique email address |
| Authentication | Tied to account |
| Format | Subject → title, body → note |

### Email Processing

```
Subject: Buy groceries
Body:
- Milk
- Bread
- Eggs

→ Creates:
  Title: "Buy groceries"
  Note: "- Milk\n- Bread\n- Eggs"
```

### Attachment Handling

| Option | Behavior |
|--------|----------|
| Include | Attach files to task |
| Strip | Ignore attachments |
| Size limit | Reject large attachments |

## URL Scheme

### Add Item

```
omnifocus:///add?name=TITLE&note=NOTE
```

### Parameters

| Parameter | Description |
|-----------|-------------|
| name | Task title |
| note | Task note |
| project | Project name or ID |
| context | Tag name or ID (legacy) |
| tag | Tag name or ID |
| due | Due date (ISO 8601) |
| defer | Defer date (ISO 8601) |
| flag | true/false |
| estimate | Duration in minutes |
| reveal | Show after adding |
| autosave | Save without showing |

### Example

```
omnifocus:///add?name=Call%20Mom&due=2024-01-15&flag=true&autosave=true
```

## Rapid Entry

### Double-Return Entry

In Quick Entry:
1. Type title
2. Press Return (save)
3. Window stays open
4. Type next title
5. Press Return
6. Repeat...
7. Press Escape to close

### Batch Capture

```
Task 1
Task 2
Task 3
```

Paste multi-line text → creates multiple items.

## Settings

### Quick Entry Preferences

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `quick_entry_shortcut` | KeyCombo | ⌃⌥Space | Global hotkey |
| `clippings_shortcut` | KeyCombo | none | Clippings service hotkey |
| `quick_entry_layout` | Enum | fluid | compact, fluid, columns |
| `visible_fields` | String[] | [title, project, tags] | Fields to show |
| `default_project` | UUID | null | Pre-selected project |
| `auto_save` | Boolean | false | Save without confirmation |
| `clean_up_on_save` | Boolean | false | Apply tentative assignments |

### Share Extension Preferences

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `share_fields` | String[] | [project, tags, due] | Fields in share sheet |
| `share_default_project` | UUID | null | Pre-selected project |

## Operations

### Show Quick Entry

```
show_quick_entry(
  prefill?: {
    title?: String,
    note?: String,
    project_id?: UUID,
    tag_ids?: UUID[],
    due_date?: DateTime,
    defer_date?: DateTime,
    flagged?: Boolean
  }
) → void
```

### Capture from Share

```
capture_from_share(
  content: ShareContent,
  metadata?: CaptureMetadata
) → Task
```

### Capture from Clippings

```
capture_clipping(
  text: String,
  source_app?: String
) → Task
```

### Capture via URL

```
capture_from_url(
  url: URL,
  auto_save: Boolean = false
) → Task
```

## Offline Capture

### Behavior

- Capture always works offline
- Items queued for sync
- No project/tag validation until online
- Tentative assignments preserved

### Sync on Reconnect

- Queued items synced
- Conflicts resolved per sync rules
- User notified of issues

## Performance

### Goals

- Quick Entry appears in < 200ms
- Ready for input immediately
- No database load during capture
- Save is non-blocking

### Optimization

- Pre-initialize Quick Entry window
- Lazy load project/tag lists
- Background save operation

## Edge Cases

### Empty Title

- Warn user
- Require title before save
- Or: Create untitled item

### App Not Running (Desktop)

- Quick Entry does nothing
- Consider: Launch app and show Quick Entry

### Network Offline

- Capture works locally
- Sync when connected

### Invalid Project/Tag Name

- Create as text
- Resolve during processing
- Or: Show error

## Best Practices

### Capture Workflow

1. Capture immediately when thought occurs
2. Minimal detail (title sufficient)
3. Don't organize during capture
4. Process inbox later

### Quick Entry Tips

- Use keyboard shortcut habitually
- Keep window in compact mode
- Double-return for rapid entry
- Process inbox daily

### Siri Tips

- Use simple commands
- Specify due date for time-sensitive items
- Review inbox after Siri capture

## Related Specifications

- `specs/inbox.md` - Where captured items land
- `specs/task.md` - Task data model
- `specs/notifications.md` - Capture reminders
- `specs/sync.md` - Offline capture sync
