# Backup and Data Management

This specification defines the backup, restore, archiving, export, and database management features that protect user data and enable data portability in the task management system.

## Overview

Data protection and management capabilities include:
- Automatic and manual backup with configurable retention
- Point-in-time restore with preview capability
- Archive system for completed/dropped items
- Multiple export formats for data portability
- Import from previous versions and external sources
- Database maintenance and size management

## Database Structure

### Primary Database File

```
DatabaseFile {
  filename: String              // "AppName.ofocus"
  format: String                // Database format version
  location: DatabaseLocation    // Storage location
  size: Integer                 // File size in bytes
  last_modified: DateTime
  is_migrated: Boolean          // Has been migrated to current format
}
```

### Database Locations

| Platform | Default Location | Alternative Options |
|----------|-----------------|---------------------|
| macOS | `~/Documents/AppName/` | User-selectable via Finder |
| iOS/iPadOS | Local app storage | iCloud Drive (optional) |
| visionOS | Local app storage | iCloud Drive (optional) |
| Web | Server-side only | N/A |

**Special Case**: When Desktop & Documents sync to iCloud, macOS uses "On My Mac" location instead to avoid syncing the database file itself (sync happens via dedicated sync service).

## Automatic Backup System

### Backup Schedule

| Platform | Frequency | Retention | Storage |
|----------|-----------|-----------|---------|
| macOS | Every 2 hours | Up to 100 backups | Local documents folder |
| iOS/iPadOS | Daily | Up to 100 backups | Local device or iCloud Drive |
| visionOS | Daily | Up to 100 backups | Local device or iCloud Drive |
| Web | Server-managed | N/A | Server-side only |

**Retention Note**: 100 backups typically represents ~2 weeks for continuous Mac users, longer for typical usage since backups don't occur when app is closed.

### Automatic Backup Triggers

Backups are automatically created:

1. **Regular schedule** - Every 2 hours (Mac) or daily (mobile)
2. **Before sync account changes** - When changing sync server or account
3. **Before database migration** - When upgrading to new database format
4. **Before restore** - When reverting to an earlier backup
5. **Before archive operation** - When archiving old items

### Backup File Format

```
BackupFile {
  filename: String              // "AppName-YYYY-MM-DD-HHMMSS.ofocus-backup"
  timestamp: DateTime
  database_version: String
  app_version: String
  size: Integer
  is_encrypted: Boolean         // If from synced database
  contains_archive: Boolean     // Whether archive is included
}
```

### Mobile Backup Settings

```
MobileBackupSettings {
  enabled: Boolean              // Default: true
  storage_location: BackupStorage  // local, icloud_drive
  icloud_enabled: Boolean       // Default: false
  last_backup: DateTime
}

enum BackupStorage {
  local                         // Device storage only
  icloud_drive                  // iCloud Drive folder
}
```

## Manual Backup Operations

### Create Backup Now

```
create_backup() -> BackupFile

// Creates immediate backup outside regular schedule
// Returns backup file metadata
// Follows same naming convention as automatic backups
```

### Export Backup Document

```
export_backup_document(
  destination: FilePath
) -> BackupFile

// Mac-only: File menu → Export → Backup Document
// Creates .ofocus-backup file at user-specified location
// Includes full database and current archive
// Can be used for manual backup before risky operations
```

## Restore Operations

### View Available Backups

```
get_backups() -> BackupFile[]

// Mac: File → Show Backups in Finder
// Mobile: Settings → Database → Backups
// Returns list sorted by timestamp (newest first)
```

### Preview Backup

```
open_backup_preview(backup_id: UUID) -> DatabaseSession

// Opens backup in separate read-only window (Mac)
// Allows browsing backup contents without restoring
// User can verify this is the correct backup
```

### Restore from Backup

```
restore_from_backup(
  backup_id: UUID,
  confirm: Boolean
) -> RestoreResult

RestoreResult {
  success: Boolean
  previous_backup_created: BackupFile  // Backup of pre-restore state
  data_loss_warning: String  // "All data entered since [date] will be lost"
}
```

**Restore Process** (macOS):

1. File → Show Backups in Finder
2. Double-click backup file to open preview window
3. Yellow banner displays with "Revert to This Backup" button
4. Click "Revert to This Backup"
5. Warning dialog: "Everything you've entered since that backup will be lost"
6. Click "Revert" to confirm

**Important**: If syncing is enabled, restore also replaces data on sync server, forcing all other syncing devices to resynchronize with restored data.

### Mobile Restore

```
// iOS/iPadOS/visionOS
Settings → Database → Backups → [Select Backup] → Restore

// Similar confirmation flow with data loss warning
// Automatic sync server update if sync enabled
```

## Archiving System

### Archive Purpose

Archiving moves old completed or dropped items to a separate file to:
- Reduce primary database size
- Improve sync performance
- Speed up mobile app performance
- Maintain searchable historical reference

### Archive File

```
ArchiveFile {
  filename: String              // "AppName.ofocus-archive"
  location: FilePath            // User-selectable, separate from database
  size: Integer
  item_count: Integer
  oldest_item: DateTime
  newest_item: DateTime
}
```

### Archive Operation

```
archive_old_items(
  completed_before: DateTime,
  dropped_before: DateTime
) -> ArchiveResult

ArchiveResult {
  items_archived: Integer
  completed_count: Integer
  dropped_count: Integer
  space_freed: Integer          // Bytes
  archive_location: FilePath
}
```

**Archiving Rules**:

| Item Type | Archive Condition |
|-----------|------------------|
| Completed tasks | Completed before specified date |
| Completed projects | All tasks completed before specified date |
| Dropped tasks | Dropped and unchanged since specified date |
| Dropped projects | Dropped and unchanged since specified date |
| Active items | Never archived |

### Archive Management

```
// Open archive (read-only by default)
open_archive() -> ArchiveSession

// Restore items from archive (drag-and-drop on Mac)
restore_from_archive(item_ids: UUID[]) -> void

// Import additional archive
import_archive(source: FilePath) -> void

// Export archive
export_archive(destination: FilePath) -> void
```

### Archive Storage Options

| Platform | Default Location | Notes |
|----------|-----------------|-------|
| macOS | User-selectable | Separate from database location |
| iOS/iPadOS | Local or iCloud Drive | Configurable in Database Settings |
| visionOS | Local or iCloud Drive | Configurable in Database Settings |

**iCloud Drive Archives**: Can be accessed and shared between multiple Macs running the app, enabling unified archive across devices.

## Export Formats

### Export Operations

```
export_data(
  format: ExportFormat,
  scope: ExportScope,
  destination: FilePath
) -> ExportResult

enum ExportFormat {
  omnifocus_document       // .ofocus file (viewable in separate window)
  plain_text              // TaskPaper format
  simple_html             // Single HTML file with embedded styles
  csv                     // Standard CSV
  csv_utf16               // UTF-16 encoded CSV
  backup_document         // .ofocus-backup (with restore capability)
}

enum ExportScope {
  selected                // Currently selected items
  entire_database         // All content
  project                 // Specific project and its tasks
  folder                  // Folder and contained projects
  tag                     // All items with tag
  perspective             // Current perspective view
}
```

### Export Format Details

#### OmniFocus Document (.ofocus)

- Full-fidelity native format
- Opens in separate window
- Preserves all metadata, attachments, notes
- Platform: macOS, iOS, iPadOS, visionOS

#### Plain Text (TaskPaper)

- Lightweight text-based format
- Hierarchy via indentation
- Metadata as @tags
- Compatible with TaskPaper app and scripts
- Platform: macOS only

**TaskPaper Example**:
```
Project Name:
  - Task title @due(2026-01-15) @tags(Work, Urgent)
    Note text appears below task
  - Another task @flagged
```

#### Simple HTML

- Single HTML file
- Embedded CSS styles
- Embedded icon images
- Human-readable in any browser
- Platform: macOS only

#### CSV Formats

- Standard CSV: UTF-8 encoding
- CSV UTF-16: For Excel compatibility
- Columns: title, type, status, project, tags, due_date, defer_date, etc.
- Platform: macOS, iOS, iPadOS, visionOS

**Mobile Export Limitation**: Mobile platforms (iOS/iPadOS/visionOS) currently support only CSV format export.

#### Backup Document (.ofocus-backup)

- Same as automatic backups
- Includes full database and archive
- Can be restored via "Revert to This Backup"
- Platform: macOS only

### Export Settings

```
ExportSettings {
  include_notes: Boolean        // Default: true
  include_attachments: Boolean  // Default: true
  include_dropped: Boolean      // Default: false
  include_completed: Boolean    // Default: true
  date_format: String           // ISO 8601, locale-specific, etc.
  encoding: String              // UTF-8, UTF-16, etc.
}
```

## Import Operations

### Import Sources

```
import_data(
  source: FilePath,
  import_type: ImportType,
  options: ImportOptions
) -> ImportResult

enum ImportType {
  previous_version         // From OmniFocus 2 or 3
  backup_document         // .ofocus-backup file
  omnifocus_document      // .ofocus file
  taskpaper              // TaskPaper formatted text
  archive                // .ofocus-archive file
}
```

### Import from Previous Versions

When upgrading to new major version:

```
MigrationOptions {
  source_version: Integer       // 2, 3, or 4
  migrate_database: Boolean     // Default: true
  import_archive: Boolean       // Default: true
  sync_account: SyncAccount?    // Existing sync account

  // Migration behavior
  create_backup_first: Boolean  // Default: true
  check_device_compatibility: Boolean  // Default: true
}
```

**Migration Process**:

1. Check if all synced devices compatible with new database format
2. Create automatic backup of current database
3. Convert database to new format
4. Optionally import existing archive
5. Resume sync with new format (forcing other devices to upgrade)

**Compatibility Note**: Users can defer migration to maintain backward compatibility, but lose access to new features until migration completes.

### Import TaskPaper

```
import_taskpaper(
  source: FilePath | String,
  destination: TaskContainer    // inbox, specific project, folder
) -> ImportResult

ImportResult {
  projects_created: Integer
  tasks_created: Integer
  tags_created: Integer
  warnings: String[]           // Unrecognized metadata, parsing errors
}
```

**TaskPaper Import Rules**:
- Top-level items with colons become projects
- Indented items become tasks
- `@tag(value)` becomes metadata
- `@due(date)`, `@defer(date)`, `@flagged` recognized
- Unrecognized @tags become regular tags

## Database Maintenance

### Database Information

```
DatabaseInfo {
  format_version: String
  app_version: String
  total_size: Integer           // Bytes
  attachment_size: Integer      // Bytes
  task_count: Integer
  project_count: Integer
  folder_count: Integer
  tag_count: Integer

  oldest_item: DateTime
  newest_item: DateTime
  last_archived: DateTime?

  sync_enabled: Boolean
  sync_server: String?
  last_sync: DateTime?
}

get_database_info() -> DatabaseInfo
```

### Database Health

```
check_database_health() -> HealthReport

HealthReport {
  status: HealthStatus          // healthy, warning, critical
  size_warning: Boolean         // Large database affecting performance
  old_items_count: Integer      // Completed items > 1 year old
  attachment_warnings: String[] // Large or broken attachments

  recommendations: String[]     // "Consider archiving items before 2025"
}

enum HealthStatus {
  healthy
  warning                       // Performance may be affected
  critical                      // Action recommended
}
```

### Size Reduction

While there's no vacuum/compress operation, size is managed via:

1. **Archive old items** - Primary size reduction method
2. **Remove large attachments** - Export then delete unnecessary attachments
3. **Complete/drop stale items** - Remove items no longer needed
4. **Prune tags** - Delete unused tags

### Database Migration

```
migrate_database(
  target_version: String,
  create_backup: Boolean        // Default: true
) -> MigrationResult

MigrationResult {
  success: Boolean
  backup_created: BackupFile?
  migration_log: String[]
  incompatible_devices: Device[]  // Devices that need updating
}
```

## Settings

### Backup Settings

```
BackupSettings {
  // Desktop
  automatic_backups: Boolean    // Default: true
  backup_interval: Duration     // Default: 2 hours (not user-configurable)
  max_backups: Integer          // Default: 100 (not user-configurable)
  backup_location: FilePath     // User-selectable via Finder

  // Mobile
  mobile_backups_enabled: Boolean  // Default: true
  mobile_backup_schedule: BackupSchedule  // daily (not configurable)
  store_in_icloud: Boolean      // Default: false
}
```

### Archive Settings

```
ArchiveSettings {
  archive_location: FilePath    // User-selectable
  store_archive_in_icloud: Boolean  // Default: false (Mac)

  // Auto-archive suggestions
  suggest_archive: Boolean      // Default: true
  suggest_threshold: Integer    // Default: 1000 completed items
}
```

### Export Settings

```
ExportPreferences {
  default_format: ExportFormat  // User preference
  default_encoding: String      // UTF-8, UTF-16
  include_notes: Boolean        // Default: true
  include_attachments: Boolean  // Default: true
  include_completed: Boolean    // Default: true
  include_dropped: Boolean      // Default: false
}
```

## Security Considerations

### Backup Encryption

- Local backups are NOT encrypted by default
- Backups from synced databases maintain encryption state
- iCloud Drive backups use iCloud's encryption
- Manual backup files should be stored securely

### Export Security

- Exported files contain full task data in plain text (except .ofocus format)
- CSV/HTML exports are not encrypted
- Consider data sensitivity when choosing export format and destination

### Archive Security

- Archives have same security as primary database
- iCloud archives use iCloud encryption
- Local archives are unencrypted unless on encrypted volume

## Platform Differences

| Feature | macOS | iOS/iPadOS | visionOS | Web |
|---------|-------|-----------|----------|-----|
| Automatic backups | Every 2 hours | Daily | Daily | Server-managed |
| Manual backups | Yes | Limited | Limited | No |
| Backup preview | Full window | List view | List view | No |
| Restore | Full UI | Settings UI | Settings UI | N/A |
| Archive management | Full | View only | View only | Limited |
| Export formats | All | CSV only | CSV only | CSV only |
| Import formats | All | All | All | Limited |
| iCloud backup | N/A | Optional | Optional | N/A |
| iCloud archive | Yes | Yes | Yes | N/A |

## Best Practices

### For Users

1. **Enable iCloud backup** on mobile for off-device protection
2. **Archive annually** to keep database performant
3. **Verify backups** by occasionally opening backup preview
4. **Export before major changes** when doing bulk edits or automation
5. **Keep archives accessible** but separate from primary database
6. **Review backup location** when setting up new devices

### For Implementations

1. **Backup before destructive operations** - Always create backup before migration, restore, or major changes
2. **Validate backups** - Test that backups can be restored
3. **Warn about data loss** - Clear warnings before restore operations
4. **Preserve encryption state** - Backups should maintain encryption
5. **Optimize archive queries** - Archive access should be read-only and performant
6. **Support incremental operations** - Allow partial restores from archive

## Related Specifications

- `specs/sync.md` - Sync service and encrypted sync
- `specs/attachments.md` - Attachment storage and sync
- `specs/automation.md` - Automated export/import operations
- `specs/task.md` - Task data model
- `specs/project.md` - Project data model

## Out of Scope

- **Real-time continuous backup** (backup on every change)
- **Backup to third-party cloud services** (Dropbox, Google Drive) - only iCloud
- **Selective restore** (restoring individual items from backup) - full database restore only
- **Automatic archive scheduling** - archives are manual operation
- **Backup versioning/branching** - simple linear backup history
- **Compression algorithms** - implementation detail
- **Database repair tools** - handled by support if needed
- **Project templates** - separate feature using export/import or automation
