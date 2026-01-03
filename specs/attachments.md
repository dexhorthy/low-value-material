# Attachments Specification

Attachments allow users to add files, images, audio recordings, and other media to tasks and projects for context and reference.

## Data Model

### Attachment Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `parent_id` | UUID | Task or Project this attachment belongs to |
| `parent_type` | Enum | `task` or `project` |
| `filename` | String | Original filename with extension |
| `content_type` | String | MIME type (e.g., `image/png`, `application/pdf`) |
| `size_bytes` | Integer | File size in bytes |
| `storage_type` | Enum | `embedded` or `linked` (see Storage Types) |
| `storage_ref` | String | Reference to actual file data (implementation-specific) |
| `created_at` | Timestamp | When attachment was added |
| `modified_at` | Timestamp | When attachment was last modified |
| `thumbnail_ref` | String | null | Reference to generated thumbnail (for images/PDFs) |

### Attachment Association

Tasks and projects have an optional `attachments` field:

```
attachments: Attachment[]  // defaults to []
```

Attachments are stored within the note field conceptually but tracked as separate entities for management.

## Storage Types

### Embedded (Default)

- File data is stored in the sync database
- Syncs across all devices automatically
- Increases database size
- Recommended for essential reference files

```
storage_type: "embedded"
storage_ref: <internal_blob_reference>
```

### Linked (Desktop Only)

- File remains on local filesystem
- Only file path stored in database
- Does NOT sync to other devices
- Path reference breaks if file moves

```
storage_type: "linked"
storage_ref: "file:///Users/name/Documents/reference.pdf"
```

**Warning**: Linked attachments are not available on mobile or other devices. Use only for large files that shouldn't sync.

## Supported Content

### All Platforms

| Category | Extensions | Notes |
|----------|------------|-------|
| Images | jpg, jpeg, png, gif, heic, webp | Thumbnails generated |
| Documents | pdf, doc, docx, xls, xlsx, ppt, pptx | PDF thumbnails generated |
| Text | txt, md, rtf, csv | Searchable content |
| Audio | m4a, mp3, wav, aiff | Recording integration |
| Video | mp4, mov, m4v | Large file warning |

### Platform-Specific

| Platform | Additional Support |
|----------|-------------------|
| macOS | Any file type; Finder drag-drop; Quick Look preview |
| iOS/iPadOS | Files app integration; Camera capture; Document scan |
| Web | Download-only for unsupported types |

## Operations

### Add Attachment

```
add_attachment(
  parent_id: UUID,
  parent_type: "task" | "project",
  file: FileData,
  storage_type: "embedded" | "linked" = "embedded"
) → Attachment
```

- Validates file type against platform capabilities
- Generates thumbnail if applicable
- Updates `parent.modified_at`

### Add Attachment from Source

Convenience methods for common capture scenarios:

```
add_attachment_from_camera(parent_id, parent_type) → Attachment
add_attachment_from_photo_library(parent_id, parent_type) → Attachment
add_attachment_from_document_scan(parent_id, parent_type) → Attachment
add_attachment_from_audio_recording(parent_id, parent_type) → Attachment
add_attachment_from_files(parent_id, parent_type) → Attachment
```

### Remove Attachment

```
remove_attachment(attachment_id: UUID) → void
```

- Deletes attachment record
- Deletes embedded file data (if embedded)
- Updates `parent.modified_at`

### Export Attachment

```
export_attachment(attachment_id: UUID, destination: Path) → void
```

- Copies embedded file to local filesystem
- Useful for extracting files before cleanup

### Get Attachment Data

```
get_attachment_data(attachment_id: UUID) → FileData
```

- Returns raw file bytes
- Handles both embedded and linked storage

## Attachment List

A management interface for viewing all attachments in the database.

### Fields Displayed

| Field | Description |
|-------|-------------|
| Thumbnail | Preview image (or type icon) |
| Filename | Original filename |
| Size | Human-readable file size |
| Date Added | When attachment was created |
| Parent Item | Task or project name (clickable) |

### Operations

- **Sort** by any column
- **Filter** by content type category
- **Select Multiple** for batch operations
- **Delete Selected** removes multiple attachments
- **Export Selected** saves files to local folder
- **Navigate to Parent** opens the associated task/project

### Queries

```
list_all_attachments(
  sort_by: "filename" | "size" | "date" | "parent" = "date",
  sort_direction: "asc" | "desc" = "desc",
  filter_type?: String  // MIME type prefix, e.g., "image/"
) → Attachment[]

get_attachments_by_parent(parent_id: UUID) → Attachment[]

get_total_attachment_size() → Integer  // bytes
```

## Sync Behavior

### Embedded Attachments

1. New attachment created locally → queued for upload
2. Sync pushes attachment data to server with transaction
3. Other devices pull attachment data
4. Large files may sync slowly on cellular connections

### Linked Attachments

- Never synced
- Appear as "unavailable" on other devices
- Useful for desktop-only reference to large local files

### Conflict Resolution

- Attachments use same last-write-wins as other data
- Concurrent adds to same parent: both attachments kept
- Concurrent delete and modify: delete wins

## Size Considerations

### Recommended Limits

| Metric | Recommendation | Notes |
|--------|---------------|-------|
| Single file | < 10 MB | Larger files slow sync |
| Total per task | < 50 MB | Consider linking large files |
| Database total | < 500 MB | Monitor via Attachment List |

### Size Warnings

System should warn users when:
- Adding file > 10 MB (suggestion to link instead)
- Database attachments total > 500 MB
- Sync would transfer > 100 MB on cellular

## Platform Integration

### macOS

- **Drag and Drop**: Option-drag from Finder to note field
- **Menu**: Edit > Attach File
- **Context Menu**: Control-click > Attach File
- **Quick Look**: Space bar to preview selected attachment
- **Open With**: Double-click opens in default app

### iOS/iPadOS

- **Attachment Button**: Tap in note field
- **Share Sheet**: Add files from other apps
- **Camera**: Take photo directly
- **Document Scanner**: Built-in scan to PDF
- **Audio Recording**: Record voice memo
- **Drag and Drop** (iPad): From Files or other apps

### Web

- **Upload Button**: Standard file picker
- **Download**: Click to download attachment
- **Preview**: In-browser for images and PDFs

## Search Integration

Attachments contribute to search in two ways:

1. **Filename Search**: Attachment filenames are searchable
2. **Content Search** (optional): Text extracted from PDFs/documents

```
search_attachments(query: String) → Attachment[]
```

## Mail Drop Integration

Email attachments sent via Mail Drop are automatically converted to embedded attachments on the resulting inbox item.

See `specs/quick-capture.md` for Mail Drop details.

## Automation

### URL Scheme

```
omnifocus:///add?name=Task&attachment=<base64_data>
```

### Shortcuts Actions

- **Add Item with Attachment**: Creates task with file attachment
- **Get Attachments**: Returns attachments from specified task

### Omni Automation

```javascript
// Add attachment via automation
task.addAttachment(fileWrapper)

// Access attachments
task.attachments.forEach(att => {
  console.log(att.name, att.type)
})
```

## Edge Cases

### File Type Restrictions

- Some platforms cannot preview all file types
- Store anyway; show generic icon and allow download
- Warn if file type incompatible with target platforms

### Orphaned Attachments

- Attachment without valid parent should not occur
- If detected during sync: log error, associate with Inbox item

### Storage Full

- Check available space before large attachment
- Queue attachment for later if sync fails due to space
- Surface error to user with cleanup suggestions

### Linked File Moved/Deleted

- Detect on access attempt
- Show "File not found" with option to:
  - Relocate (browse for moved file)
  - Remove attachment record
  - Convert to embedded (if file found elsewhere)
