# Settings and Preferences Specification

## Overview

This specification defines all user-configurable settings and preferences in an OmniFocus-like task management application. Settings control application behavior, appearance, defaults, and interaction patterns across all platforms.

## Design Principles

1. **Sensible Defaults**: All settings have well-chosen defaults that work for most users
2. **Discoverability**: Common settings are easily accessible; advanced settings available when needed
3. **Sync vs Local**: Some settings sync across devices (workflow preferences), others are device-specific (UI preferences)
4. **Platform Adaptation**: Settings respect platform conventions and capabilities
5. **Reset Capability**: Individual panes and entire settings can be reset to defaults

## Settings Categories

### 1. General Settings

Controls core application behavior and interaction patterns.

#### 1.1 Outlining Mode

**Purpose**: Controls how items are organized and navigated in the outline view.

**Options**:
- `classic`: Traditional OmniFocus outlining (default)
- `modern`: Simplified modern interaction model

**Synced**: Yes

#### 1.2 Quick Entry Shortcut

**Purpose**: Configurable keyboard shortcut for capturing tasks globally.

**Default**: `Control-Option-Space` (macOS), configurable on iOS via Settings app

**Synced**: No (device-specific)

**Platform**: macOS, iOS (limited)

#### 1.3 Clippings Shortcut

**Purpose**: System-wide keyboard shortcut for web clipping from browser.

**Default**: Platform-specific

**Synced**: No

**Platform**: macOS

#### 1.4 Delete Without Modifier Key

**Purpose**: Allows deletion without requiring Command key for confirmation.

**Type**: Boolean

**Default**: `false`

**Synced**: Yes

**Notes**: When disabled, requires ⌘⌫ to delete; when enabled, ⌫ alone deletes

### 2. Organization Settings

Controls how items are organized, cleaned up, and structured.

#### 2.1 Clean Up Inbox Items

**Purpose**: Determines when inbox items are considered "processed" and removed from inbox.

**Options**:
- `requires_project`: Requires project assignment only
- `requires_tag`: Requires tag assignment only
- `requires_both`: Requires both project and tag (default)
- `requires_either`: Requires project or tag

**Synced**: Yes

**Related**: See inbox.md specification

#### 2.2 Clean Up Resolved Items

**Purpose**: Controls when completed/dropped items are removed from views.

**Options**:
- `immediate`: Hide immediately after completion/drop (default)
- `manual`: Keep visible until manual cleanup command

**Synced**: Yes

**Notes**: Items remain in database regardless; this only affects view filtering

#### 2.3 Default Project Type

**Purpose**: Sets the default type for newly created projects.

**Options**:
- `parallel`: All tasks available simultaneously (default)
- `sequential`: Tasks available one at a time
- `single_action`: Independent task list

**Synced**: Yes

**Related**: See project.md specification

#### 2.4 Hide Projects/Action Groups in Tag Views

**Purpose**: Controls whether project containers appear in Tags and Flagged perspectives.

**Type**: Boolean

**Default**: `false`

**Synced**: Yes

**Effect**: When `true`, only individual tasks shown; when `false`, tasks grouped by project

#### 2.5 Include On Hold Projects in Forecast

**Purpose**: Determines if on-hold projects with future dates appear in Forecast.

**Type**: Boolean

**Default**: `false`

**Synced**: Yes

**License**: Pro feature

**Hidden**: Can be set via hidden preference URL

### 3. Appearance Settings

Controls visual presentation, colors, fonts, and UI elements.

#### 3.1 Color Palette

**Purpose**: Sets light/dark mode for application UI.

**Options**:
- `automatic`: Follow system appearance (default)
- `light`: Always use light palette
- `dark`: Always use dark palette

**Synced**: No (device-specific preference)

**Platform**: All

**Notes**: iOS may also use screen brightness thresholds for automatic switching

#### 3.2 Font Size

**Purpose**: Adjusts text size for readability vs information density.

**Type**: Slider or scale factor

**Range**: 0.75x to 1.5x (typical range)

**Default**: 1.0x

**Synced**: No

**Platform**: macOS, iOS, visionOS

#### 3.3 Color Text for Due Items

**Purpose**: Enables visual color coding for due/overdue items.

**Type**: Boolean

**Default**: `true`

**Synced**: No

**Effect**: When enabled:
- Due soon items: Yellow/amber text
- Overdue items: Red text

**Related**: See due-dates.md for due soon threshold

#### 3.4 Color Text for First Available Actions

**Purpose**: Highlights first available tasks in sequential projects.

**Type**: Boolean

**Default**: `true`

**Synced**: No

**Effect**: When enabled, first available actions shown in purple/accent color

**Related**: See availability.md specification

#### 3.5 Strike Resolved Items

**Purpose**: Applies strikethrough styling to completed/dropped items.

**Type**: Boolean

**Default**: `true`

**Synced**: No

**Effect**: Visual indication of completion status

#### 3.6 Show Full Item Title

**Purpose**: Controls whether long titles are truncated or displayed in full.

**Type**: Boolean

**Default**: `true`

**Synced**: No

#### 3.7 Perspectives Bar Titles

**Purpose**: Shows text labels on perspective toolbar buttons.

**Type**: Boolean

**Default**: `true`

**Synced**: No

**Platform**: macOS, iPad

#### 3.8 App Icon

**Purpose**: Allows selection of alternate application icons.

**Type**: Enum (available icons)

**Default**: `default`

**Synced**: No

**License**: Pro feature

**Platform**: iOS, macOS

### 4. Layout Settings

Controls outline and inspector display configuration.

#### 4.1 Default Row Layout

**Purpose**: Sets default outline layout mode.

**Options**:
- `fluid`: Flexible flowing layout with configurable fields (default)
- `columns`: Fixed column layout with sortable columns

**Synced**: No (view-specific)

**Platform**: macOS, iPad (desktop-class)

#### 4.2 Fluid Layout Fields

**Purpose**: Configures which fields are displayed and editable in fluid layout.

**Structure**:
```javascript
{
  display_fields: ["title", "note", "defer_date", "due_date", "tags", "flagged"],
  editing_fields: ["title", "note", "defer_date", "due_date", "tags", "flagged", "estimated_duration"]
}
```

**Synced**: No

**Notes**: Display fields shown in row; editing fields shown in inspector

#### 4.3 Columns Layout Configuration

**Purpose**: Defines visible columns and their order in columns layout.

**Available Columns**:
- `title`: Task/project title
- `flagged`: Flag status indicator
- `defer_date`: Defer date/time
- `due_date`: Due date/time
- `tags`: Assigned tags
- `project`: Parent project
- `estimated_duration`: Time estimate
- `note`: Note preview

**Synced**: No

**Platform**: macOS primarily

#### 4.4 Inspector Configuration

**Purpose**: Controls inspector panel field display and ordering.

**Configurable**: Field visibility, field order, section collapsing

**Synced**: No

**Platform**: All

#### 4.5 Hide Status Circles

**Purpose**: Removes visual status indicators (for accessibility).

**Type**: Boolean

**Default**: `false`

**Synced**: No

**Platform**: iOS (VoiceOver users)

**Effect**: Improves VoiceOver experience by allowing custom actions instead of visual tap targets

### 5. Dates and Times Settings

Controls date/time defaults and threshold calculations.

#### 5.1 Due Soon Threshold

**Purpose**: Defines how far in advance items are considered "due soon".

**Type**: Duration

**Range**: Today only to 1 week

**Default**: 48 hours (2 days)

**Synced**: Yes

**Effect**: Affects due soon status, coloring, notifications, badges

**Related**: See due-dates.md specification

#### 5.2 Default Defer Time

**Purpose**: Time applied when setting defer dates without specific time.

**Type**: Time of day

**Default**: 00:00 (midnight)

**Synced**: Yes

**Related**: See defer-dates.md specification

**Notes**: Different from due time default

#### 5.3 Default Due Time

**Purpose**: Time applied when setting due dates without specific time.

**Type**: Time of day

**Default**: 17:00 (5:00 PM)

**Synced**: Yes

**Related**: See due-dates.md specification

#### 5.4 Default Notification Time

**Purpose**: Time of day for scheduled notifications when time not specified.

**Type**: Time of day

**Default**: 09:00 (9:00 AM)

**Synced**: Yes

**Platform**: All

#### 5.5 Default Review Interval

**Purpose**: Default frequency for project reviews.

**Type**: Duration

**Default**: 7 days (1 week)

**Synced**: Yes

**Related**: See review.md specification

**Notes**: Can be overridden per-project

#### 5.6 Floating Time Zones

**Purpose**: Controls whether times float with time zone changes.

**Type**: Boolean

**Default**: `false`

**Synced**: Yes

**Hidden**: Available via hidden preference

**Effect**: When `true`, times remain fixed regardless of time zone; when `false`, times adjust for local time zone

### 6. Notifications Settings

Controls notification behavior, sounds, and badge counts.

#### 6.1 Default Notifications

**Purpose**: Enables automatic notifications for date-based events.

**Structure**:
```javascript
{
  notify_on_deferred: true,     // When items become available
  notify_on_due: true,           // At due time
  notify_on_latest_start: false, // Before defer + duration = due
  notify_on_planned: false       // Planned date reminders (4.7+)
}
```

**Synced**: Yes

**Related**: See notifications.md specification

#### 6.2 Notification Sounds

**Purpose**: Configures audio alerts for different notification types.

**Structure**:
```javascript
{
  due_sound: "system_default",
  deferred_sound: "system_default",
  location_sound: "system_default",
  custom_sound: "system_default"
}
```

**Synced**: No (device-specific)

**Platform**: macOS, iOS

#### 6.3 App Icon Badge

**Purpose**: Determines what count appears on app icon badge.

**Options**:
- `overdue`: Count of overdue items only (default)
- `due_soon`: Count of overdue + due soon items
- `flagged`: Count of flagged items
- `none`: No badge

**Synced**: No

**Platform**: iOS, macOS

#### 6.4 Perspectives Bar Badges

**Purpose**: Shows item counts on perspective toolbar buttons.

**Type**: Boolean

**Default**: `true`

**Synced**: No

**Platform**: macOS, iPad

#### 6.5 Sidebar Badges

**Purpose**: Displays counts in sidebar for projects, tags, folders.

**Type**: Boolean

**Default**: `true`

**Synced**: No

**Platform**: All

#### 6.6 Location Notifications Enabled

**Purpose**: Master switch for location-based notifications.

**Type**: Boolean

**Default**: `false`

**Synced**: No (requires device authorization)

**Platform**: iOS, watchOS

**Related**: See location-tags.md specification

**Notes**: Requires separate iOS location permissions

### 7. Focus Mode Settings

Controls focus behavior and persistence.

#### 7.1 Remember Focus

**Purpose**: Determines if focus state persists across app launches.

**Type**: Boolean

**Default**: `false`

**Synced**: No

**Related**: See focus-mode.md specification

#### 7.2 Include Inbox During Focus

**Purpose**: Controls whether inbox items are visible when focus is active.

**Type**: Boolean

**Default**: `true`

**Synced**: No

**Effect**: When `true`, inbox always visible regardless of focus

#### 7.3 Search Respects Focus

**Purpose**: Limits search results to focused scope.

**Type**: Boolean

**Default**: `true`

**Synced**: No

**Related**: See search.md specification

### 8. Quick Capture Settings

Controls capture behavior and field defaults.

#### 8.1 Quick Entry Layout

**Purpose**: Determines initial field visibility in Quick Entry.

**Options**:
- `minimal`: Title only
- `standard`: Title, project, tags (default)
- `expanded`: All fields visible

**Synced**: Yes

**Platform**: macOS, iOS (Share Extension)

**Related**: See quick-capture.md specification

#### 8.2 Quick Entry Visible Fields

**Purpose**: Configures which fields are shown in Quick Entry window.

**Type**: Array of field names

**Default**: `["title", "project", "tags", "defer_date", "due_date", "note"]`

**Synced**: Yes

#### 8.3 Quick Entry Default Project

**Purpose**: Pre-selects a default project for captured items.

**Type**: Project ID or null

**Default**: `null` (inbox)

**Synced**: Yes

#### 8.4 Quick Entry Default Tags

**Purpose**: Pre-applies tags to captured items.

**Type**: Array of tag IDs

**Default**: `[]`

**Synced**: Yes

### 9. Sync Settings

Controls synchronization behavior and server configuration.

#### 9.1 Sync Server

**Purpose**: Configures sync backend and credentials.

**Options**:
- `omni_sync_server`: Official Omni Group sync
- `webdav`: Custom WebDAV server

**Structure**:
```javascript
{
  type: "omni_sync_server" | "webdav",
  account: "email@example.com",     // Omni Sync Server
  url: "https://dav.example.com",   // WebDAV only
  username: "user",                  // WebDAV only
  encryption_passphrase: "..."       // Optional, client-side encryption
}
```

**Synced**: No (device-specific credentials)

**Related**: See sync.md specification

#### 9.2 Automatic Sync

**Purpose**: Enables background sync without manual trigger.

**Type**: Boolean

**Default**: `true`

**Synced**: No

**Effect**: When enabled, syncs on launch, on changes, and periodically

#### 9.3 Sync Interval

**Purpose**: Frequency of automatic sync checks (when idle).

**Type**: Duration

**Default**: 15 minutes

**Range**: 5 minutes to 1 hour

**Synced**: No

**Hidden**: Can be adjusted via hidden preference

#### 9.4 Push Notifications for Sync

**Purpose**: Enables immediate sync when other devices make changes.

**Type**: Boolean

**Default**: `true`

**Synced**: No

**Platform**: iOS, macOS

**Notes**: Requires device registration with sync server

### 10. Backup Settings

Controls automatic backup behavior.

#### 10.1 Automatic Backup Enabled

**Type**: Boolean

**Default**: `true`

**Synced**: No

**Related**: See backup-data-management.md specification

#### 10.2 Backup Frequency

**Purpose**: How often automatic backups are created.

**Platform-specific**:
- macOS: Every 2 hours
- iOS/iPadOS: Daily

**Synced**: No

**Notes**: Cannot be changed directly; platform-specific behavior

#### 10.3 Backup Retention

**Purpose**: How many backups to keep before pruning oldest.

**Default**: Up to 100 backups (~2 weeks of continuous use)

**Synced**: No

**Hidden**: Can be adjusted via hidden preference

### 11. Advanced Settings

Advanced and hidden preferences for power users.

#### 11.1 Auto-Complete Projects and Groups

**Purpose**: Automatically marks projects/groups complete when all children complete.

**Type**: Boolean

**Default**: `true`

**Synced**: Yes

**Hidden**: Available via hidden preference URL

**Related**: See project.md auto-completion behavior

#### 11.2 Include All-Day Events in Forecast

**Purpose**: Shows calendar all-day events in Forecast perspective.

**Type**: Boolean

**Default**: `true`

**Synced**: Yes

**Hidden**: Available via hidden preference

**Related**: See forecast.md specification

#### 11.3 Snooze Interval

**Purpose**: Duration for notification snooze action.

**Type**: Duration

**Default**: 15 minutes

**Synced**: Yes

**Hidden**: Available via hidden preference

#### 11.4 Date Picker Minute Interval

**Purpose**: Granularity of time selection in date pickers.

**Type**: Integer (minutes)

**Options**: 1, 5, 15, 30

**Default**: 5

**Synced**: No

**Platform**: iOS

#### 11.5 Bulk Deletion Threshold

**Purpose**: Number of items that triggers confirmation dialog for batch delete.

**Type**: Integer

**Default**: 10

**Synced**: No

**Hidden**: Available via hidden preference

#### 11.6 Nearby Radius

**Purpose**: Default search radius for Nearby perspective.

**Type**: Distance

**Default**: Medium (~500m)

**Synced**: Yes

**Hidden**: Available via hidden preference

**Related**: See location-tags.md specification

#### 11.7 Tag Column Width

**Purpose**: Controls width of tag column in outline views.

**Type**: Integer (pixels)

**Default**: Auto

**Synced**: No

**Platform**: macOS

**Hidden**: Available via hidden preference

#### 11.8 Open Links in New Window

**Purpose**: Controls browser behavior for links clicked in notes.

**Type**: Boolean

**Default**: `false`

**Synced**: No

**Platform**: macOS

**Hidden**: Available via hidden preference

### 12. Privacy and Security Settings

Controls data protection and access.

#### 12.1 App Lock (iOS)

**Purpose**: Requires authentication before accessing OmniFocus data.

**Type**: Boolean

**Default**: `false`

**Synced**: No

**Platform**: iOS, iPadOS

**Authentication Methods**:
- Touch ID
- Face ID
- Device passcode

**Grace Period**: 90 seconds when switching apps

#### 12.2 Biometric Unlock

**Purpose**: Enables biometric authentication for app lock.

**Type**: Boolean

**Default**: `true` (when App Lock enabled)

**Synced**: No

**Platform**: iOS, iPadOS

#### 12.3 Anonymous Usage Data

**Purpose**: Opts into sharing anonymous usage statistics with Omni Group.

**Type**: Boolean

**Default**: `false` (explicit opt-in)

**Synced**: No

**Platform**: macOS, iOS

**Notes**: Never includes personal data or task content

### 13. Accessibility Settings

Settings specific to accessibility features.

#### 13.1 VoiceOver Optimizations

**Purpose**: Enables VoiceOver-specific UI adaptations.

**Type**: Boolean

**Default**: Auto-detected based on system VoiceOver state

**Synced**: No

**Platform**: macOS, iOS

**Effect**: Modifies interaction patterns for screen reader users

#### 13.2 Reduce Motion

**Purpose**: Respects system "Reduce Motion" accessibility setting.

**Type**: Boolean

**Default**: Follows system preference

**Synced**: No

**Platform**: iOS, macOS

#### 13.3 Increase Contrast

**Purpose**: Enhances contrast for better visibility.

**Type**: Boolean

**Default**: Follows system preference

**Synced**: No

**Platform**: iOS, macOS

### 14. Update Settings

Controls application update behavior.

#### 14.1 Check for Updates

**Purpose**: Enables automatic update checking.

**Type**: Boolean

**Default**: `true`

**Synced**: No

**Platform**: macOS (Omni Store version), iOS (App Store automatic)

**Notes**: App Store versions managed by iOS update settings

#### 14.2 Update Channel

**Purpose**: Selects update track for beta testing.

**Options**:
- `release`: Stable releases only (default)
- `beta`: Include beta versions

**Synced**: No

**Platform**: macOS, iOS (TestFlight)

## Settings Persistence

### Storage Locations

**Synced Settings**:
- Stored in database
- Sync with Omni Sync Server or WebDAV
- Consistent across all devices

**Local Settings**:
- Stored in platform preferences system
- macOS: `~/Library/Preferences/com.omnigroup.OmniFocus*.plist`
- iOS: UserDefaults
- Not synced between devices

### Settings Migration

When upgrading between major versions:
1. Settings automatically migrated from previous version
2. Deprecated settings removed or replaced
3. New settings added with sensible defaults
4. User notified of significant changes

## Hidden Preferences System

### URL Scheme Interface

Hidden preferences are set via special URL:

```
omnifocus:///change-preference?id=<preference_id>&value=<value>
```

**Examples**:
```
omnifocus:///change-preference?id=SnoozeInterval&value=10
omnifocus:///change-preference?id=AutomaticallyCompleteProjects&value=true
```

**Security**: URLs can only be triggered from:
- Safari/browser (user must confirm)
- Shortcuts with explicit user action
- Not available from arbitrary apps for security

### Purpose

Hidden preferences exist for:
- Advanced power-user customization
- Beta feature flags
- Platform-specific tuning
- Options with overwhelming complexity for UI

**Philosophy**: Hidden preferences are NOT a substitute for good defaults or proper UI design.

## Settings UI Organization

### macOS Organization

Settings accessed via `OmniFocus > Settings...` (⌘,)

**Tabs**:
1. General
2. Organization
3. Appearance
4. Layout
5. Dates & Times
6. Notifications
7. Sync
8. Update

**Reset Buttons**: Each tab has "Reset" button; Option-click reveals "Reset All"

### iOS Organization

Settings accessed via gear icon in app or Settings app integration.

**Sections**:
1. General
2. Organization
3. Appearance
4. Dates & Times
5. Notifications
6. Focus
7. Quick Capture
8. Privacy
9. Sync
10. About

### Web Organization

Simplified settings appropriate for web platform.

**Available Settings**:
- Appearance (color scheme)
- Dates & Times defaults
- Organization basics

**Not Available**:
- Sync (managed by sign-in)
- Notifications (browser permission-based)
- Advanced layout options

## Settings Import/Export

### Export Format

Settings can be exported to JSON for:
- Backup/restore
- Sharing configurations
- Version control
- Documentation

**Structure**:
```json
{
  "version": "4.0",
  "synced_settings": {
    "organization": {
      "default_project_type": "parallel",
      "clean_up_inbox": "requires_both"
    },
    "dates": {
      "due_soon_threshold_hours": 48,
      "default_defer_time": "00:00",
      "default_due_time": "17:00"
    }
  },
  "local_settings": {
    "appearance": {
      "color_palette": "automatic",
      "font_size": 1.0
    }
  }
}
```

### Import Process

1. Validate JSON structure and version
2. Apply synced settings to database
3. Apply local settings to device preferences
4. Restart perspectives/views to reflect changes
5. Log any skipped or invalid settings

## Platform Differences Matrix

| Setting Category | macOS | iOS | iPadOS | Web | visionOS |
|-----------------|-------|-----|--------|-----|----------|
| General | Full | Full | Full | Limited | Full |
| Organization | Full | Full | Full | Full | Full |
| Appearance | Full | Full | Full | Limited | Full |
| Layout | Full | Limited | Full | Limited | Full |
| Dates & Times | Full | Full | Full | Full | Full |
| Notifications | Full | Full | Full | Browser | Full |
| Focus | Full | Full | Full | Session | Full |
| Quick Capture | Full | Limited | Full | N/A | Full |
| Sync | Full | Full | Full | Account | Full |
| Backup | Local | Local | Local | N/A | iCloud |
| Privacy/Lock | N/A | Full | Full | Session | Full |
| Hidden Prefs | Full | Limited | Limited | N/A | Limited |

## Best Practices

### For Users

1. **Start with defaults**: Default settings are well-tested for most workflows
2. **Customize incrementally**: Change one setting at a time to understand effects
3. **Export configurations**: Back up settings when you have a working configuration
4. **Use hidden preferences cautiously**: Only modify if you understand implications

### For Implementers

1. **Sensible defaults first**: Spend time choosing defaults that work for 80% of users
2. **Progressive disclosure**: Common settings accessible, advanced settings available but not prominent
3. **Setting validation**: Validate ranges and combinations to prevent invalid states
4. **Migration paths**: Always provide upgrade paths from previous versions
5. **Documentation**: Document effects of each setting, especially hidden preferences
6. **Platform respect**: Respect platform conventions (iOS Settings app integration, macOS menu structure)
7. **Sync carefully**: Only sync settings that are workflow-related, not device-specific
8. **Reset capability**: Always allow resetting to defaults at both granular and complete levels

## Integration with Other Specifications

- **Availability** (availability.md): Due soon threshold, defer/due times
- **Due Dates** (due-dates.md): Default due time, due soon threshold
- **Defer Dates** (defer-dates.md): Default defer time
- **Review** (review.md): Default review interval
- **Focus Mode** (focus-mode.md): Remember focus, inbox during focus, search respects focus
- **Quick Capture** (quick-capture.md): Quick Entry layout, defaults, visible fields
- **Search** (search.md): Focus interaction
- **Notifications** (notifications.md): Notification defaults, sounds, badges
- **Sync** (sync.md): Server configuration, automatic sync, push notifications
- **Backup** (backup-data-management.md): Automatic backup frequency, retention
- **Forecast** (forecast.md): Include on-hold projects, all-day events
- **Project** (project.md): Default project type, auto-completion

## Out of Scope

This specification does NOT cover:
- **License management**: Pro feature unlock, subscription status
- **Account management**: Omni Account creation, password reset
- **Plug-in preferences**: Settings defined by third-party plugins
- **Device-specific settings**: iOS system settings, macOS accessibility beyond app control
- **Beta/TestFlight settings**: Internal development/testing options
- **Analytics implementation**: How usage data is collected and transmitted
- **Settings UI implementation**: Specific widget/control implementations
- **Data validation logic**: Detailed validation rules (covered in respective specs)
