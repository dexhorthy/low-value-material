# Sync Specification

**Sync** keeps your task database synchronized across all devices. Changes made on one device propagate to all others, enabling seamless access from Mac, iOS, and web.

## Overview

Sync enables:
- Access to tasks from any device
- Changes propagate automatically
- Offline editing with later merge
- Encrypted data in transit and at rest
- Push notifications for instant updates

## Sync Architecture

### Change-Based Sync

OmniFocus uses a transaction log model:

```
Local Database ←→ Transaction Log ←→ Sync Server ←→ Other Devices
```

Each device maintains:
- Full copy of the database
- List of changes (transactions)
- Knowledge of other devices' sync state

### Transaction Log

Changes are recorded as transactions:

| Field | Type | Description |
|-------|------|-------------|
| `transaction_id` | UUID | Unique identifier |
| `timestamp` | DateTime | When change occurred |
| `device_id` | UUID | Originating device |
| `operation` | Enum | create, update, delete |
| `entity_type` | String | task, project, folder, tag |
| `entity_id` | UUID | Target entity |
| `changes` | JSON | Field-level changes |

### Sync Process

```
sync() → SyncResult:
  1. Upload local transactions since last sync
  2. Download new transactions from server
  3. Apply remote transactions to local database
  4. Confirm receipt to server
  5. Return sync status
```

## Sync Triggers

### Automatic Triggers

| Trigger | Timing |
|---------|--------|
| App launch | Immediate |
| App foreground | Immediate |
| App background | Before suspension |
| Changes pending | After 1 minute idle |
| Periodic | Every 60 minutes minimum |
| Push notification | Immediate (background) |

### Manual Trigger

User can force sync via:
- Pull-to-refresh gesture
- Sync button in settings
- Menu command (⌘S on Mac)

### Push-Triggered Sync

Push notifications enable instant sync:

1. Device A makes changes and syncs
2. Device A notifies sync server
3. Server sends push to registered devices
4. Device B receives push, syncs in background
5. Device B now has latest changes

## Sync Server Options

### Omni Sync Server

| Feature | Description |
|---------|-------------|
| Provider | The Omni Group |
| Cost | Free |
| Protocol | Proprietary over HTTPS |
| Push sync | Yes |
| Mail Drop | Yes |
| Web access | Yes (OmniFocus for Web) |

### WebDAV Server

Self-hosted or third-party WebDAV:

| Feature | Description |
|---------|-------------|
| Protocol | WebDAV over HTTPS |
| Push sync | Yes (with configuration) |
| Mail Drop | No |
| Web access | No |
| Examples | Synology, NGINX, Apache |

### Unsupported Services

Do NOT use for sync:
- Dropbox
- Google Drive
- iCloud Drive
- OneDrive

These services cannot handle OmniFocus's transaction log model and may corrupt data.

## Encryption

### In Transit

- HTTPS for all sync communication
- TLS 1.2+ required
- Certificate pinning (optional)

### At Rest

Database encryption on server:

| Field | Type | Description |
|-------|------|-------------|
| `encryption_enabled` | Boolean | Whether encryption active |
| `encryption_passphrase` | String | Separate from account password |
| `encryption_version` | Integer | Encryption format version |

### Passphrase Management

```
set_encryption_passphrase(passphrase: String) → void
```

- Default: Uses account password
- Optional: Separate encryption passphrase
- Change requires re-entry on all devices

### Encryption Flow

1. Client encrypts data locally
2. Encrypted payload sent to server
3. Server stores encrypted blob
4. Server cannot read your data

## Device Registration

### Device Record

| Field | Type | Description |
|-------|------|-------------|
| `device_id` | UUID | Unique device identifier |
| `device_name` | String | User-friendly name |
| `device_type` | Enum | mac, iphone, ipad, web |
| `last_sync` | DateTime | Last successful sync |
| `app_version` | String | OmniFocus version |
| `push_token` | String | For push notifications |

### Push Registration

For push-triggered sync:

| Field | Description |
|-------|-------------|
| Device Token | Encrypted string from Apple |
| Group ID | Random identifier for all synced devices |
| Tail Transaction ID | Latest transaction seen |

### Device Management

```
registered_devices() → Device[]
unregister_device(device_id: UUID) → void
```

View and remove devices from sync account.

## Compaction

### Why Compact

Transaction log grows indefinitely. Compaction:
- Consolidates transactions into current state
- Reduces database size
- Improves sync performance

### Compaction Rules

Compaction blocked until all devices have synced:

```
can_compact() → Boolean:
  FOR each registered device:
    IF device.last_sync < oldest_transaction:
      RETURN false
  RETURN true
```

### Stale Device Impact

Devices not synced for extended period:
- Block compaction for all devices
- Increase sync times
- Eventually become incompatible (21+ days)

### Forced Compaction

After 21 days without sync, device becomes incompatible:
- Must download fresh database from server
- Or replace server with local database
- Local unsynced changes may be lost

## Conflict Resolution

### Automatic Resolution

Most conflicts resolved automatically:
- Last-write-wins for simple fields
- Merge for collections (tags)
- Server timestamp is authority

### Repeating Task Conflicts

Special case: completing same repeating task on multiple devices:

```
Device A: Complete "Weekly Review" → Creates new instance
Device B: Complete "Weekly Review" → Creates new instance
Sync: Both completions honored → Duplicate instances created
```

Prevention: Sync before completing repeating tasks.

### Manual Resolution

Some conflicts require user decision:
- File/attachment conflicts
- Major structural conflicts
- Database version mismatches

## Sync States

### Item Sync Status

| Status | Meaning |
|--------|---------|
| `synced` | Matches server state |
| `pending_upload` | Local changes not yet sent |
| `pending_download` | Server has newer version |
| `conflict` | Conflicting changes detected |

### Overall Sync Status

| Status | Description |
|--------|-------------|
| `idle` | No sync in progress |
| `syncing` | Sync operation active |
| `error` | Last sync failed |
| `offline` | No network connection |

## Offline Support

### Offline Behavior

- All operations work offline
- Changes queued locally
- Sync when connection restored
- No feature restrictions

### Offline Queue

```
OfflineChange {
  id: UUID
  timestamp: DateTime
  operation: Operation
  entity: Entity
  queued_at: DateTime
}
```

Queue processes on reconnection, oldest first.

## Mail Drop

Email-to-inbox feature (Omni Sync Server only):

### Configuration

| Field | Type | Description |
|-------|------|-------------|
| `mail_drop_enabled` | Boolean | Feature active |
| `mail_drop_addresses` | String[] | Generated email addresses |

### Address Format

```
username+randomstring@sync.omnigroup.com
```

Random string prevents spam/abuse.

### Email Processing

| Email Part | Becomes |
|------------|---------|
| Subject | Task title |
| Body | Task note |
| Attachments | Task attachments |

### Mail Drop with Encryption

When database encrypted:
1. Email arrives at server
2. Stored in temporary container (unencrypted)
3. Client syncs, retrieves from container
4. Client encrypts and integrates
5. Temporary item removed

## Sync Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `sync_enabled` | Boolean | false | Master sync switch |
| `sync_server_type` | Enum | omni | omni, webdav |
| `sync_server_url` | URL | null | WebDAV server URL |
| `account_username` | String | null | Sync account username |
| `sync_on_wifi_only` | Boolean | false | Restrict to Wi-Fi |
| `push_enabled` | Boolean | true | Push notifications |
| `sync_interval` | Integer | 60 | Minutes between syncs |

## Operations

### Initialize Sync

```
setup_sync(
  server_type: SyncServerType,
  credentials: Credentials,
  server_url?: URL
) → SyncSetupResult
```

First-time sync setup.

### Perform Sync

```
sync(
  force: Boolean = false
) → SyncResult

SyncResult {
  status: SyncStatus
  transactions_uploaded: Integer
  transactions_downloaded: Integer
  conflicts: Conflict[]
  duration_ms: Integer
}
```

### Check Sync Status

```
get_sync_status() → SyncStatus
get_last_sync_time() → DateTime
get_pending_changes_count() → Integer
```

### Reset Sync

```
reset_sync_data(
  direction: "upload" | "download"
) → void
```

Replace local or server database entirely.

## Error Handling

### Common Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| `auth_failed` | Invalid credentials | Re-authenticate |
| `network_error` | No connection | Retry when online |
| `server_error` | Server issue | Retry later |
| `incompatible_database` | Version mismatch | Update app or reset |
| `encryption_mismatch` | Wrong passphrase | Enter correct passphrase |
| `stale_device` | 21+ days offline | Reset sync |

### Retry Strategy

Automatic retry with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 30 seconds
- Attempt 3: 2 minutes
- Attempt 4: 10 minutes
- Then: Wait for manual trigger

## Performance

### Optimization

- Delta sync (only changes)
- Compression in transit
- Background sync (iOS)
- Batched transactions

### Factors Affecting Speed

| Factor | Impact |
|--------|--------|
| Database size | Larger = slower initial sync |
| Attachments | Large files slow sync |
| Network speed | Faster connection = faster sync |
| Server location | Closer = lower latency |
| Pending changes | More changes = longer sync |

### Initial Sync

First sync downloads entire database:
- May take several minutes
- Progress indicator shown
- Can be large with attachments

## Security Considerations

### Account Security

- Strong password required
- Optional separate encryption passphrase
- Two-factor authentication (where supported)

### Data Privacy

With encryption enabled:
- Server cannot read your data
- Omni Group cannot access your tasks
- WebDAV admin cannot access your tasks

### Revoking Access

To remove a device:
1. Unregister from sync settings
2. Change encryption passphrase
3. Other devices prompted for new passphrase

## Troubleshooting

### Sync Log

Accessible in settings:
- Records all sync operations
- Shows errors and warnings
- Timestamps for diagnosis

### Common Issues

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Sync stuck | Stale device | Unregister stale devices |
| Slow sync | Large database | Reduce attachments |
| Duplicates | Repeating task conflict | Sync more frequently |
| Missing items | Not synced before change | Check sync status |

### Database Reset

Nuclear option when sync broken:
1. Choose which database is authoritative
2. Reset other devices to download
3. Or replace server with local

## Related Specifications

- `specs/quick-capture.md` - Capture methods including email
- `specs/task.md` - Task data model
- `specs/notifications.md` - Push notification system
- `specs/inbox.md` - Where Mail Drop items land
