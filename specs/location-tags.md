# Location-Based Tags Specification

**Location-based tags** enable geographic context for tasks, allowing proximity-aware features like the Nearby perspective and location-triggered notifications.

## Overview

Location information is attached to **tags**, not individual tasks. When a task has a tag with location data, the task inherits that location context. This design means:
- All tasks with a given tag share its location
- Changing a tag's location affects all tasks with that tag
- Tasks can inherit multiple locations through multiple location-based tags

## Data Model

### Location Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `latitude` | Float | Yes | Latitude coordinate (-90 to 90) |
| `longitude` | Float | Yes | Longitude coordinate (-180 to 180) |
| `name` | String | No | Human-readable location name |
| `source` | Enum | Yes | How the location was specified |
| `source_value` | String | Conditional | Source-specific identifier |
| `radius` | Enum | No | Trigger radius (default: `medium`) |
| `notification` | Enum | No | When to notify (default: `none`) |

### Location Source Enum

| Value | Description | `source_value` |
|-------|-------------|----------------|
| `here` | Current device location at time of setting | null |
| `address` | Manual street address entry | Address string |
| `business_search` | Business name or category search | Search query |
| `contact` | Address from device contacts | Contact identifier |
| `pin` | Manually dropped map pin | null |

### Radius Enum

| Value | Distance | Use Case |
|-------|----------|----------|
| `small` | ~200 meters / 650 feet | Home, office - precise locations |
| `medium` | ~500 meters / quarter mile | Neighborhood, campus |
| `large` | ~10 kilometers / 6.2 miles | City or district level |

### Notification Enum

| Value | Description |
|-------|-------------|
| `none` | No location-based notifications |
| `arriving` | Notify when entering the radius |
| `leaving` | Notify when exiting the radius |

## Location Source Details

### Here

Captures the device's current location using available positioning:
- GPS (most accurate)
- Cellular triangulation
- WiFi triangulation

```
set_tag_location(
  tag_id: UUID,
  source: "here"
) → void
```

The system resolves current coordinates and stores them.

### Address

User enters a street address or general location (e.g., "123 Main St" or "Beijing, China"):

```
set_tag_location(
  tag_id: UUID,
  source: "address",
  source_value: "123 Main Street, City, State"
) → void
```

The system geocodes the address to coordinates.

### Business Search

Search for business names or categories. Returns the closest matching result:

```
set_tag_location(
  tag_id: UUID,
  source: "business_search",
  source_value: "Whole Foods"  // Specific business
) → void

set_tag_location(
  tag_id: UUID,
  source: "business_search",
  source_value: "pharmacy"  // Category search
) → void
```

Business search is particularly useful for travelers - a tag for "pharmacy" will find the nearest pharmacy in any city.

### Contact

Pull an address from the device's contacts:

```
set_tag_location(
  tag_id: UUID,
  source: "contact",
  source_value: "contact_id_or_name"
) → void
```

Uses the contact's address field. Updates if the contact's address changes (implementation-dependent).

### Pin

User drops a pin manually on a map interface:

```
set_tag_location(
  tag_id: UUID,
  source: "pin",
  latitude: 37.7749,
  longitude: -122.4194
) → void
```

## Complete Tag Location Example

```
Tag {
  id: "abc-123",
  name: "Grocery Store",
  status: "active",
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    name: "Whole Foods Market",
    source: "business_search",
    source_value: "Whole Foods",
    radius: "medium",
    notification: "arriving"
  }
}
```

## Nearby Perspective

The **Nearby** perspective displays tasks with location-based tags within proximity of the user's current location.

### View Modes

| Mode | Description |
|------|-------------|
| `map` | Visual map with pins at tag locations |
| `list` | Tasks ordered by distance from current location |

### Map View

- Displays pins at each unique tag location
- Tapping a pin shows tasks associated with that location
- Pin popover includes:
  - Tag name
  - Number of available tasks
  - "Get Directions" button (opens Maps app)
  - "Show Tasks" button (navigates to task list)

### List View

- Tasks grouped by tag location
- Ordered by proximity (nearest first)
- Each group header shows:
  - Tag name
  - Location name
  - Distance from current position

### Nearby Query

```
nearby_tasks(
  latitude: Float,
  longitude: Float,
  max_distance?: Integer  // meters, optional limit
) → {
  tag_id: UUID,
  tag_name: String,
  location_name: String,
  distance: Float,  // meters from query point
  tasks: Task[]
}[]
```

Returns location-tagged available tasks sorted by distance.

## Geofence Notifications

When a tag has `notification` set to `arriving` or `leaving`, the system monitors for geofence crossings.

### How It Works

1. System registers geofences for all tags with active notifications
2. Uses low-power location monitoring (not continuous GPS)
3. When device enters/exits a geofence, notification fires
4. Notification includes tag name and available task count

### Technical Characteristics

| Aspect | Behavior |
|--------|----------|
| **Battery** | Minimal impact - uses region monitoring, not continuous GPS |
| **Accuracy** | Varies - may trigger early/late by 100-500 meters |
| **Quick pass-through** | May not trigger if moving quickly (e.g., highway) |
| **Re-entry delay** | May not re-trigger if leaving and re-entering quickly |
| **Maximum geofences** | Platform-limited (iOS: ~20 concurrent regions) |

### Notification Content

```
{
  title: "Near: {tag_name}",
  body: "{available_count} available tasks",
  tag_id: UUID,
  action: "open_tag_in_nearby"
}
```

### Prerequisites

For location notifications to work:
- Location Services enabled for the app
- Notification permissions granted
- Background App Refresh enabled
- App not manually force-closed
- Low Power Mode disabled (iOS)

## Operations

### Set Tag Location

```
set_tag_location(
  tag_id: UUID,
  source: LocationSource,
  source_value?: String,
  latitude?: Float,      // Required for "pin" source
  longitude?: Float,     // Required for "pin" source
  name?: String,
  radius?: Radius,
  notification?: NotificationTrigger
) → void
```

### Update Location Settings

```
update_tag_location(
  tag_id: UUID,
  name?: String,
  radius?: Radius,
  notification?: NotificationTrigger
) → void
```

### Remove Tag Location

```
remove_tag_location(tag_id: UUID) → void
```

Removes all location data from the tag.

### List Location Tags

```
list_location_tags(
  include_dropped: Boolean = false
) → Tag[]
```

Returns all tags that have location data.

## Queries

### Tags Near Location

```
tags_near_location(
  latitude: Float,
  longitude: Float,
  max_distance?: Integer
) → {
  tag: Tag,
  distance: Float
}[]
```

### Tasks by Location

```
tasks_at_location(
  latitude: Float,
  longitude: Float,
  radius: Integer  // meters
) → Task[]
```

Returns available tasks whose tags have locations within the specified radius.

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `nearby_enabled` | Boolean | true | Show Nearby perspective |
| `location_notifications_enabled` | Boolean | true | Allow location-triggered notifications |
| `nearby_max_distance` | Integer | null | Max distance in meters (null = unlimited) |
| `nearby_default_view` | Enum | `list` | Default view mode for Nearby |

## Platform Considerations

### Mobile (iOS/Android)

- Full support for all features
- Background location monitoring available
- Geofence notifications supported
- Map integration with native maps

### Desktop (macOS/Windows)

- Location setting via address, business search, pin
- "Here" uses IP-based location (less precise)
- No geofence notifications
- Nearby perspective uses last known mobile location

### Web

- Limited location support
- Browser geolocation API (requires permission)
- No background location monitoring
- No geofence notifications

## Best Practices

### Effective Location Tags

| Do | Don't |
|----|-------|
| Use for recurring physical locations | Use for one-off errands |
| Use business search for chains/categories | Create location tags for every task |
| Set appropriate radius for location type | Use `small` radius for general areas |
| Enable notifications sparingly | Enable notifications on many tags |

### Tag Organization

Group location tags under a parent for organization:

```
Places
  Home (location: ...)
  Office (location: ...)
  Grocery Store (location: ...)
  Gym (location: ...)
Errands
  Hardware Store (location: "hardware store")
  Pharmacy (location: "pharmacy")
```

### Errand vs Location Tags

- **Errand tags**: Use business search for category (e.g., "pharmacy") - works anywhere
- **Location tags**: Use specific address for fixed places (e.g., home, office)

## Edge Cases

### No Available Tasks

- Tags appear in Nearby even with zero available tasks (shows tag location)
- Notifications only fire if available task count > 0

### Overlapping Locations

- Tasks may appear under multiple tags if locations overlap
- Each tag location treated independently

### Location Resolution Failure

- Business search returns no results: error returned, no location set
- Address geocoding fails: error returned, no location set
- Contact has no address: error returned, no location set

### Stale Business Search

- Business search results are point-in-time
- Business may close/move; location data persists
- User can refresh location to re-search

### Offline Behavior

- Nearby perspective requires internet for map tiles
- List view works offline with cached distances
- Location notifications work offline (uses system geofencing)

## Relationship to Other Specifications

- **Tag spec** (`specs/tag.md`): Defines base location fields on tags
- **Notifications spec** (`specs/notifications.md`): Location notification delivery
- **Perspectives spec** (`specs/perspectives.md`): Nearby as built-in perspective
