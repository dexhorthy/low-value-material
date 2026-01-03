# Automation

## Overview

OmniFocus provides multiple automation interfaces to enable scripting, integration, and workflow customization. The automation system spans four main approaches: Omni Automation (JavaScript), URL Schemes, AppleScript, and Shortcuts integration. These systems work together to provide comprehensive automation coverage across platforms.

## Design Principles

1. **Cross-Platform by Default**: Omni Automation uses JavaScript and works identically on macOS, iOS, iPadOS, and visionOS
2. **Multiple Integration Points**: Support both simple URL-based automation and complex programmatic scripting
3. **Backwards Compatibility**: Maintain AppleScript support for legacy workflows while promoting Omni Automation
4. **Security**: Require user consent for sensitive operations, secure credential storage in System Keychain
5. **Discoverability**: Built-in Console, API documentation, and example plug-in library

## Automation Methods

### 1. Omni Automation (JavaScript API)

**Platform**: macOS, iOS, iPadOS, visionOS
**Language**: JavaScript (Core JavaScript frameworks)
**Availability**: OmniFocus 3.8+ (September 2020)

#### Core Capabilities

**Database Access**:
```javascript
// Access main database objects
const tasks = flattenedTasks
const projects = flattenedProjects
const folders = flattenedFolders
const tags = flattenedTags
const inbox = inbox.tasks

// Smart matching search
const results = projectsMatching("Marketing")
```

**Task Creation**:
```javascript
const task = new Task("Task title", inbox.beginning)
task.note = "Task description"
task.deferDate = new Date(2026, 0, 10)
task.dueDate = new Date(2026, 0, 15)
task.addTag(tagNamed("Work"))
task.flagged = true
task.estimatedMinutes = 30
```

**Project & Folder Management**:
```javascript
const project = new Project("Project name", library.beginning)
project.status = Project.Status.Active
project.sequential = true
project.reviewInterval = ReviewInterval.Monthly

const folder = new Folder("Folder name", library.beginning)
folder.status = Folder.Status.Active
```

**Tags**:
```javascript
const tag = new Tag("Tag name")
tag.status = Tag.Status.Active
tag.allowsNextAction = true

// Hierarchical tags
childTag.parent = parentTag
```

**Completion & Modification**:
```javascript
task.markComplete()
task.markIncomplete()
project.markComplete(new Date()) // with specific date

// Move items
task.moveTo(project, Index.Beginning)
```

**Repetition**:
```javascript
const rule = new Task.RepetitionRule()
rule.ruleString = "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO"
rule.method = Task.RepetitionMethod.Fixed
task.repetitionRule = rule
```

**Attachments**:
```javascript
const wrapper = FileWrapper.withContents("file.txt", Data.fromString("contents"))
task.addAttachment(wrapper)

// URL reference
task.addLinkedFileURL(URL.fromString("file:///path/to/file"))
```

**Notifications**:
```javascript
const notification = new Task.Notification.Absolute(new Date(2026, 0, 10, 9, 0))
task.notifications.push(notification)

const relativeNotif = new Task.Notification.Due(-3600) // 1 hour before due
```

**Custom Perspectives**:
```javascript
const perspective = Perspective.Custom.byName("My Perspective")
perspective.makeActive()

// Export perspective
const perspectiveString = perspective.writeToString()
```

**Forms & User Input**:
```javascript
const form = new Form()
form.addField(new Form.Field.String("title", "Task Title", ""))
form.addField(new Form.Field.Date("due", "Due Date", new Date()))
form.addField(new Form.Field.Checkbox("flagged", "Flagged", false))
form.addField(new Form.Field.Option("priority", "Priority", 0, ["High", "Medium", "Low"]))

const formPrompt = form.show("Create Task", "OK")
formPrompt.then(values => {
    const task = new Task(values.title)
    task.dueDate = values.due
    task.flagged = values.flagged
})
```

**Database Operations**:
```javascript
save() // Save changes and trigger sync
undo()
redo()
cleanUp() // Run clean up routine (assign inbox items)
```

#### Plug-In System

**Plug-In Structure**:
```javascript
{
    "type": "action",
    "identifier": "com.example.myplugin",
    "version": "1.0",
    "description": "Description of what this plugin does",
    "label": "Menu Label",
    "shortLabel": "Short Label",
    "paletteLabel": "Palette Label",
    "author": "Author Name",
    "action": (selection, sender) => {
        // Plugin code here
        const tasks = selection.tasks
        const projects = selection.projects
        // ... perform operations
    }
}
```

**Plug-In Types**:
- **Action**: Appears in automation menu, can be assigned keyboard shortcuts
- **Perspective**: Custom perspective definition with filters
- **Resource**: Shared libraries for use by other plug-ins

**Plug-In Distribution**:
- Shareable via `.omnifocusjs` file bundles
- Automatic sync via iCloud between user's devices
- Third-party distribution via direct download or plugin repositories
- Built-in plug-in library at omni-automation.com

**Execution Context**:
```javascript
// Access to selection
const selection = document.windows[0].selection
const selectedTasks = selection.tasks
const selectedProjects = selection.projects

// Access to app and document
app.name // "OmniFocus"
app.version // "3.13.1"
document.fileType // "OmniFocus Database"
```

#### Advanced Features

**HTTP Requests**:
```javascript
const url = URL.fromString("https://api.example.com/data")
const request = URL.FetchRequest.fromString(url.string)
request.method = "POST"
request.headers = {"Content-Type": "application/json"}
request.bodyString = JSON.stringify({key: "value"})

request.fetch().then(response => {
    const data = JSON.parse(response.bodyString)
    // Process API response
})
```

**Speech Synthesis**:
```javascript
Speech.speak("Task completed")
Speech.Voice.default.speak("Task completed", 1.0) // rate parameter
```

**Credential Storage**:
```javascript
const credential = new Credential("Service Name")
credential.write("username", "password")
const password = credential.read("username")
credential.remove("username")
```

**Crypto Operations**:
```javascript
const data = Data.fromString("text")
const sha256 = Crypto.SHA256(data)
const sha512 = Crypto.SHA512(data)
```

**Clipboard**:
```javascript
Clipboard.copyString("text")
const text = Clipboard.getString()
```

**Console & Debugging**:
- Built-in Automation Console window
- `console.log()` for debugging
- Error messages with stack traces
- Script execution history

### 2. URL Schemes

**Platform**: macOS, iOS, iPadOS
**Protocol**: `omnifocus:///`

#### Navigation URLs

**Built-in Perspectives**:
```
omnifocus:///inbox
omnifocus:///projects
omnifocus:///tags
omnifocus:///flagged
omnifocus:///forecast
omnifocus:///review
omnifocus:///nearby
```

**iOS-Only Perspectives**:
```
omnifocus:///today
omnifocus:///past
omnifocus:///soon
```

**Custom Perspectives** (Pro):
```
omnifocus:///perspective/PerspectiveName
```

**Reference Views**:
```
omnifocus:///completed
omnifocus:///changed
```

#### Adding Tasks (`/add` action)

**Basic Syntax**:
```
omnifocus:///add?name=Task%20Title&note=Description
```

**Full Parameter Set** (iOS 2.14+, macOS 2.10+):

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `name` | string | Task title (required) | `name=Review%20document` |
| `note` | string | Task note/description | `note=Check%20section%202` |
| `project` | string | Project name (case-insensitive) | `project=Marketing` |
| `context` | string | Tag/context name | `context=Work` |
| `defer` | date | Defer date | `defer=2026-01-15` or `defer=tomorrow%208am` |
| `due` | date | Due date | `due=2026-01-20` or `due=friday%205pm` |
| `estimate` | duration | Estimated time | `estimate=30m` or `estimate=2h` |
| `flag` | boolean | Flagged status | `flag=true` |
| `parallel` | boolean | Parallel vs sequential | `parallel=true` |
| `autocomplete` | boolean | Auto-complete when children done | `autocomplete=false` |
| `completed` | timestamp | Mark as completed | `completed=2026-01-10T14:30` |
| `repeat-rule` | string | Recurrence pattern (RFC 2445) | `repeat-rule=FREQ%3DWEEKLY` |
| `repeat-method` | enum | fixed / start-after-completion / due-after-completion | `repeat-method=fixed` |
| `attachment` | base64 | Base64-encoded file | `attachment=...` |
| `reveal-new-item` | boolean | Show newly created item | `reveal-new-item=true` |

**Date Format Options**:
- ISO 8601: `2026-01-15T09:00`
- Natural language: `tomorrow`, `next monday 8am`, `jan 15 5pm`
- Relative: `+2d`, `+3w`, `+1m`

**Example URLs**:
```
omnifocus:///add?name=Buy%20groceries&context=Errands&due=tomorrow

omnifocus:///add?name=Weekly%20review&project=Personal&defer=monday%208am&due=monday%205pm&flag=true

omnifocus:///add?name=Daily%20standup&repeat-rule=FREQ%3DDAILY%3BBYHOUR%3D9%3BBYMINUTE%3D0&repeat-method=fixed
```

#### TaskPaper Import (`/paste` action)

**Basic Syntax**:
```
omnifocus:///paste?target=inbox&content=TaskPaper%20text
```

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `content` | string | TaskPaper-formatted text (required) |
| `target` | string | Container path (project/folder name) |
| `index` | number | Insertion position (0-based) |

**TaskPaper Format**:
```
Project Name:
    - Task 1 @context(Work) @defer(2026-01-15) @due(2026-01-20)
    - Task 2 @flagged
    Child Project:
        - Subtask
```

**Example**:
```
omnifocus:///paste?content=Project%3A%0A%20%20%20%20-%20Task%201%0A%20%20%20%20-%20Task%202&target=Work
```

#### x-callback-url Support

**Return URL to Created Item**:
```
omnifocus:///add?name=Task&x-success=callback://x-callback-url/success?id={{id}}
```

**Callback Parameters**:
- `{{id}}`: Unique identifier of created item
- `{{url}}`: OmniFocus URL to the item (`omnifocus:///task/id`)

### 3. AppleScript

**Platform**: macOS only
**Availability**: OmniFocus Pro
**Language**: AppleScript

#### Core Object Model

**Application**:
```applescript
tell application "OmniFocus"
    -- Database access
    set theDoc to default document
    set theTasks to every task of theDoc
    set theProjects to every project of theDoc
    set theFolders to every folder of theDoc
    set theTags to every tag of theDoc
end tell
```

**Creating Tasks**:
```applescript
tell application "OmniFocus"
    tell default document
        set newTask to make new inbox task with properties {name:"Task name", note:"Description"}

        -- Set properties
        set defer date of newTask to (current date) + (1 * days)
        set due date of newTask to (current date) + (7 * days)
        set flagged of newTask to true
        set estimated minutes of newTask to 30
    end tell
end tell
```

**Creating Projects**:
```applescript
tell application "OmniFocus"
    tell default document
        set newProject to make new project with properties {name:"Project name"}

        -- Set project properties
        set sequential of newProject to true
        set status of newProject to active status
        set review interval of newProject to {steps:1, unit:weeks}

        -- Add task to project
        tell newProject
            make new task with properties {name:"First task"}
        end tell
    end tell
end tell
```

**Tags**:
```applescript
tell application "OmniFocus"
    tell default document
        -- Create tag
        set workTag to make new tag with properties {name:"Work"}

        -- Assign tag to task
        add workTag to tags of newTask

        -- Hierarchical tags
        set childTag to make new tag with properties {name:"Meetings"}
        set parent of childTag to workTag
    end tell
end tell
```

**Querying**:
```applescript
tell application "OmniFocus"
    tell default document
        -- Available tasks
        set availableTasks to every task whose completed is false and blocked is false

        -- Due soon
        set dueSoon to every task whose due date ≤ ((current date) + (2 * days))

        -- Flagged in specific project
        set flaggedTasks to every task of project "Marketing" whose flagged is true
    end tell
end tell
```

**Completion**:
```applescript
tell application "OmniFocus"
    tell default document
        set completed of task 1 to true
        set completion date of task 1 to current date
    end tell
end tell
```

#### Script Integration

**Script Folder**:
- Location: `~/Library/Application Scripts/com.omnigroup.OmniFocus3/`
- Access via: Help > Open Scripts Folder
- Scripts appear in OmniFocus toolbar

**Script Menu**:
- Scripts can be assigned keyboard shortcuts in System Preferences
- Scripts can access selected items in OmniFocus

**Example: Process Inbox Script**:
```applescript
tell application "OmniFocus"
    tell default document
        set inboxTasks to every inbox task

        repeat with aTask in inboxTasks
            -- Show task for processing
            set selected of content of window 1 to {aTask}

            -- Prompt user for project
            set projectName to text returned of (display dialog "Project:" default answer "")

            if projectName is not "" then
                set taskProject to first project whose name is projectName
                move aTask to end of tasks of taskProject
            end if
        end repeat
    end tell
end tell
```

**Common Script Patterns**:
- Process inbox items in batch
- Generate reports on task counts/time estimates
- Populate project templates with placeholders
- Verify all projects have next actions
- Calculate total time for selected items
- Clean up completed/dropped items

#### AppleScript Resources

**Dictionary**: File > Open Dictionary in Script Editor, choose OmniFocus.app

**Community Scripts**:
- Learn OmniFocus AppleScript Directory
- GitHub repositories (brandonpittman/OmniFocus, etc.)
- Inside OmniFocus AppleScript examples

**Migration Note**: While AppleScript remains supported, Omni Group recommends Omni Automation for new scripts due to cross-platform compatibility.

### 4. Shortcuts Integration

**Platform**: macOS (12.0+), iOS, iPadOS
**Availability**: Built-in when OmniFocus is installed

#### Built-in Shortcuts Actions

**Add New Item**:
- Adds task with configurable properties
- Inputs: Name, Note, Project, Tags, Dates, Flag, Estimate
- Output: Created task object

**Add TaskPaper**:
- Imports TaskPaper-formatted text
- Input: TaskPaper string
- Optional target project/folder

**Find Items**:
- Search for tasks matching criteria
- Filters: Name, Note, Tags, Project, Folder, Flagged, Status, Dates
- Output: Array of matching tasks

**Find Projects**:
- Search for projects matching criteria
- Filters: Name, Note, Tags, Folder, Status, Review dates
- Output: Array of matching projects

**Find Tags**:
- Search for tags matching criteria
- Filters: Name, Status, Parent tag
- Output: Array of matching tags

**Show in OmniFocus**:
- Navigate to specific item or perspective
- Input: Project, Task, Tag, Folder, or Perspective name
- Opens OmniFocus to the specified location

**Run Omni Automation Script** (OmniFocus 3.8+):
- Execute JavaScript Omni Automation code
- Input: Script text or plug-in reference
- Optional input data from previous Shortcut actions
- Output: Script return value

**Run Omni Automation Plug-In** (OmniFocus 3.8+):
- Execute installed Omni Automation plug-in
- Input: Plug-in identifier
- Optional input data

#### Shortcut Composition Patterns

**Quick Capture from Share Sheet**:
```
Receive URLs from Share Sheet
→ Add New Item (name: URL, note: URL)
```

**Location-Based Reminder**:
```
Get Current Location
→ Find Tags (with location matching)
→ Find Items (with tag)
→ Show in OmniFocus
```

**Daily Planning**:
```
Find Items (due today OR deferred today OR flagged)
→ Show List
→ Choose from List
→ Show in OmniFocus
```

**Create Task from Calendar Event**:
```
Find Calendar Events (today)
→ Repeat with Each
  → Add New Item (name: event title, due: event end time)
```

**Batch Tag Assignment**:
```
Find Items (in project "X")
→ Repeat with Each
  → Run Omni Automation Script ("item.addTag(tagNamed('TagName'))")
```

**Weekly Review Report**:
```
Find Projects (needs review)
→ Get Count
→ Show Notification ("X projects need review")
→ Show in OmniFocus (Review perspective)
```

#### Shortcuts Integration with Omni Automation

**Passing Data to Scripts**:
```javascript
// In Omni Automation script accessed via Shortcuts
const input = args[0] // Access data from previous Shortcut action
// Process input and return result
return {result: "processed data"}
```

**Returning Data to Shortcuts**:
```javascript
// Script returns data that can be used by subsequent Shortcut actions
return {
    taskCount: tasks.length,
    projectName: project.name,
    nextReview: project.nextReviewDate
}
```

## Security & Permissions

**User Consent**:
- URL schemes may require user confirmation for task creation
- Omni Automation plug-ins require explicit installation
- AppleScript requires System Preferences > Security > Automation permissions

**Credential Storage**:
- Credentials stored in System Keychain
- Access requires Keychain authorization
- Per-credential read/write/delete permissions

**File System Access**:
- Sandboxed file access
- User must approve file access via system dialogs
- Bookmarks for persistent file access

**Network Access**:
- HTTP/HTTPS requests allowed
- User should review plug-in source before installation if making network calls

## Platform Matrix

| Feature | macOS | iOS | iPadOS | visionOS | Web |
|---------|-------|-----|--------|----------|-----|
| Omni Automation | ✓ | ✓ | ✓ | ✓ | ✗ |
| URL Schemes | ✓ | ✓ | ✓ | ? | ✗ |
| AppleScript | ✓ | ✗ | ✗ | ✗ | ✗ |
| Shortcuts | ✓ | ✓ | ✓ | ✓ | ✗ |
| Automation Console | ✓ | ✓ | ✓ | ✓ | ✗ |
| Plug-In Sync | ✓ | ✓ | ✓ | ✓ | n/a |

## Best Practices

**Choosing an Automation Method**:
1. **Simple task capture**: URL Schemes or Shortcuts
2. **Cross-platform scripts**: Omni Automation (JavaScript)
3. **Complex Mac workflows**: Omni Automation (modern) or AppleScript (legacy)
4. **Integration with iOS automations**: Shortcuts + Omni Automation
5. **Quick prototyping**: Automation Console

**Script Organization**:
- Use plug-ins for reusable scripts
- Include version numbers and descriptions
- Test on all target platforms
- Provide error messages for user errors
- Document required OmniFocus version

**Performance**:
- Batch operations when possible
- Use `save()` sparingly (triggers sync)
- Filter queries at database level, not in script
- Cache frequently accessed objects

**Error Handling**:
```javascript
try {
    const project = projectNamed("Marketing")
    if (!project) {
        throw new Error("Project 'Marketing' not found")
    }
    // ... operations
} catch (error) {
    console.error(error.message)
    new Alert("Error", error.message).show()
}
```

**User Feedback**:
```javascript
// Progress indication for long operations
const progress = new Progress("Processing tasks...")
progress.totalUnitCount = tasks.length

tasks.forEach((task, index) => {
    // ... process task
    progress.completedUnitCount = index + 1
})

progress.finish()
```

## Example Workflows

### 1. Daily Planning Plug-In

```javascript
(() => {
    const action = new PlugIn.Action(function(selection, sender) {
        // Get today's tasks
        const today = Calendar.current.startOfDay(new Date())
        const tomorrow = new Date(today.getTime() + 86400000)

        const todayTasks = flattenedTasks.filter(task => {
            if (task.completed) return false

            // Overdue, due today, or deferred to today
            const isOverdue = task.dueDate && task.dueDate < today
            const isDueToday = task.dueDate && task.dueDate >= today && task.dueDate < tomorrow
            const isDeferredToday = task.deferDate && task.deferDate >= today && task.deferDate < tomorrow
            const isFlagged = task.flagged

            return isOverdue || isDueToday || isDeferredToday || isFlagged
        })

        // Create report
        const report = todayTasks.map(task => {
            const project = task.containingProject ? task.containingProject.name : "Inbox"
            const estimate = task.estimatedMinutes ? `${task.estimatedMinutes}m` : "no estimate"
            return `${task.name} (${project}) - ${estimate}`
        }).join("\n")

        // Show alert with results
        new Alert("Today's Tasks", `${todayTasks.length} tasks:\n\n${report}`).show()
    })

    action.validate = function(selection, sender) {
        return true
    }

    return action
})()
```

### 2. Weekly Review Report

```javascript
(() => {
    const action = new PlugIn.Action(function(selection, sender) {
        const needsReview = flattenedProjects.filter(project => {
            return project.status === Project.Status.Active &&
                   project.nextReviewDate &&
                   project.nextReviewDate <= new Date()
        })

        const stalled = flattenedProjects.filter(project => {
            return project.status === Project.Status.Active &&
                   project.tasks.filter(t => !t.completed).length === 0
        })

        const report = [
            `Projects Needing Review: ${needsReview.length}`,
            needsReview.map(p => `  • ${p.name}`).join("\n"),
            "",
            `Stalled Projects: ${stalled.length}`,
            stalled.map(p => `  • ${p.name}`).join("\n")
        ].join("\n")

        new Alert("Weekly Review", report).show()

        // Open Review perspective
        Perspective.BuiltIn.Review.makeActive()
    })

    action.validate = function(selection, sender) {
        return true
    }

    return action
})()
```

### 3. URL Scheme: Quick Errands Capture

```
omnifocus:///add?name=[[prompt:What%20to%20buy?]]&context=Errands&defer=[[date:next-location-visit]]
```

Used with iOS Shortcuts or launcher apps for rapid capture.

### 4. Shortcut: Create Project from Template

```
1. Ask for Input (Project Name)
2. Run Omni Automation Script:
   ```
   const projectName = args[0]
   const template = projectNamed("Template: Project")
   const newProject = template.duplicate()
   newProject.name = projectName
   newProject.status = Project.Status.Active
   return newProject.name
   ```
3. Show Notification (Project Created: [result])
```

## Resources

- **Omni Automation Documentation**: https://omni-automation.com/omnifocus/
- **API Reference**: https://omni-automation.com/omnifocus/OF-API.html
- **URL Scheme Reference**: https://inside.omnifocus.com/url-schemes
- **AppleScript Dictionary**: Open Script Editor > File > Open Dictionary > OmniFocus
- **Shortcuts Gallery**: https://support.omnigroup.com/omnifocus-shortcuts
- **Community Examples**: Learn OmniFocus (learnomnifocus.com)

## Out of Scope

The following features are referenced but specified elsewhere:

- **Mail Drop**: Email-to-inbox automation (see `sync.md`)
- **Siri Integration**: Voice capture (see `quick-capture.md`)
- **Notifications**: Task alerts (see `notifications.md`)
- **Quick Entry**: System-wide capture window (see `quick-capture.md`)
- **Calendar Integration**: Event display in Forecast (see `forecast.md`)
- **Sync**: Multi-device synchronization (see `sync.md`)
