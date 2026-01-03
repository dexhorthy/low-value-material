# Project Templates Specification

## Overview

Templates allow users to create reusable project blueprints that can be instantiated with customized values. This eliminates repetitive project setup and ensures consistency across recurring workflows.

While OmniFocus doesn't have native template management UI, it provides the underlying mechanisms (TaskPaper import, placeholders, duplication, automation) that enable powerful template workflows.

## Template Storage

Templates are regular OmniFocus projects stored in a designated location:

**Native Approach**
- Create a folder named "Templates" (or similar)
- Store template projects within this folder
- Mark the folder as "dropped" to hide from active views
- To use: duplicate the template project, move to active folder, customize

**External Storage**
- Store templates as TaskPaper files (.taskpaper)
- Keep in iCloud Drive, Dropbox, or local filesystem
- Import via TaskPaper import when needed
- Allows version control and easier editing

**Plugin-Based**
- Third-party plugins (like "Templates for OmniFocus") provide template libraries
- Templates stored within OmniFocus but managed by plugin
- Plugins add UI for browsing and instantiating templates

## TaskPaper Format

TaskPaper is a plain text format that OmniFocus can import:

```
Project Name:
	- Task one @tags(work) @due(2024-12-25)
	- Task two @defer(2024-12-20)
		- Subtask @duration(30m)
	- Task three
		Note text goes here
		Can span multiple lines

Another Project:
	- Single action @flagged
```

**Syntax Rules**
- Projects end with colon `:`
- Tasks start with dash `-` or bullet `•`
- Indentation creates hierarchy
- Tags use `@tagname` or `@tagname(value)` format
- Notes are unadorned text after tasks

**Supported Tag Attributes**
| Tag | Description | Example |
|-----|-------------|---------|
| `@tags()` | Assign tags | `@tags(work, urgent)` |
| `@due()` | Set due date | `@due(2024-12-25)` |
| `@defer()` | Set defer date | `@defer(tomorrow)` |
| `@duration()` | Estimated duration | `@duration(2h)` |
| `@flagged` | Flag the item | `@flagged` |
| `@parallel()` | Project type | `@parallel(true)` |
| `@autodone()` | Auto-complete on last task | `@autodone(true)` |

## Placeholder System

Placeholders allow customization during template instantiation:

### Syntax

Placeholders use guillemet characters: `«placeholder_name»`

- Type on Mac: `Option+\` and `Option+Shift+\`
- Type on iOS: Press and hold `<` or `>` keys
- Names must contain only letters, numbers, underscores (no spaces or punctuation)

### Placeholder Types

**Basic Placeholder** - Prompts for input:
```
Meeting with «client_name»
```

**Default Value** - Pre-fills form field:
```
Review «project_name:Q4 Initiative»
```

**Fixed Value** - Defined in project note, no prompt:
```
In project note:
«client_name»:Acme Corp
«project_code»:ACME-2024

In tasks:
Email «client_name» about «project_code»
```

### Placeholder Locations

Placeholders can appear in:
- Project title
- Task titles
- Note text
- Tag names (creates new tags if needed)
- Date references (via special syntax)

### Date Placeholders

Dates support calculation relative to placeholder values:

```
$DUE=«launch_date»
$DEFER=«launch_date» - 7d

Tasks will calculate dates relative to the launch_date placeholder
```

**Relative Date Syntax**
- `+3d` or `-3d` (days)
- `+2w` or `-2w` (weeks)
- `+1m` or `-1m` (months)
- `+1y` or `-1y` (years)

## Template Instantiation

### Manual Process

1. **Select Template**
   - Navigate to template folder
   - Find desired template project

2. **Duplicate**
   - Right-click → Duplicate (or Cmd+D)
   - Creates copy of template

3. **Customize**
   - Replace placeholders with actual values
   - Adjust dates as needed
   - Move to target folder

4. **Activate**
   - Set project to Active status
   - Begin working on tasks

### Automated Process (via Plugins)

1. **Invoke Template Action**
   - Run plugin command or shortcut
   - Browse template library

2. **Choose Template**
   - Select from list
   - View template preview if available

3. **Fill Placeholders**
   - Form displays all placeholders
   - Enter or select values
   - Date placeholders may show calendar picker

4. **Configure Options**
   - Select destination folder
   - Choose project type if not specified
   - Include/exclude optional sections

5. **Instantiate**
   - Plugin creates project with substituted values
   - Moves to specified location
   - Sets to Active status

### Automation via Shortcuts

Apple Shortcuts can automate template instantiation:

```
Example Shortcut Flow:
1. Get TaskPaper file from Files or iCloud
2. Replace placeholder strings with user input or data
3. Send to OmniFocus via "Add TaskPaper" action
4. Optional: Ask for project location, move project
```

## Optional Sections

Templates can include optional content that users choose to include:

**Syntax** (plugin-specific):
```
Standard task
Optional task $OPTIONAL
	- Subtask under optional parent $OPTIONAL
Another standard task
```

**Behavior**:
- During instantiation, user is prompted: "Include optional task?"
- If included, placeholder substitution proceeds normally
- If excluded, task and descendants are removed

## Advanced Features

### Folder Assignment

Specify destination folder in template project note:

```
$FOLDER=Active Projects/Client Work
```

Template will be instantiated into this folder automatically.

### Nested Placeholders

Placeholders can reference other placeholders:

```
«project_code»:CLI-«year»-«sequence»
«year»:2024
«sequence»:001

Result: CLI-2024-001
```

### Date Propagation

When template has project-level defer or due dates:
- User prompted to adjust all task dates proportionally
- Example: Shifting project start by 1 week shifts all tasks by 1 week
- Maintains relative timing between tasks

### Tag Creation

When placeholder appears in tag position and references non-existent tag:
- New tag created automatically
- Useful for client-specific or project-specific tags

## Common Template Patterns

### Event Planning
```
«event_name» Planning:
	- Book venue @defer(«event_date» - 90d) @tags(planning)
	- Send invitations @defer(«event_date» - 30d) @tags(communications)
	- Prepare materials @defer(«event_date» - 7d) @tags(preparation)
	- Event day checklist @defer(«event_date»)
```

### Client Onboarding
```
Client Onboarding - «client_name»:
	- Send welcome packet @tags(«client_name», admin)
	- Schedule kickoff call @defer(today) @due(today + 2d)
	- Create project workspace @tags(setup)
	- Assign account manager @tags(admin)

	$FOLDER=Active Projects/Clients/«client_name»
```

### Weekly Review
```
Weekly Review - Week of «week_start»:
	- Review calendar for next week @duration(15m)
	- Process inbox to zero @duration(20m)
	- Review project list @duration(30m)
	- Review waiting-for items @duration(10m)
	- Plan next week priorities @duration(15m)

	$DUE=«week_start» + 6d
```

### Software Release
```
«version_number» Release:
	- Code freeze @due(«release_date» - 14d) @tags(dev)
	- QA testing @defer(«release_date» - 14d) @due(«release_date» - 7d) @tags(qa)
	- Release notes @defer(«release_date» - 7d) @tags(docs)
	- Deploy to production @due(«release_date») @tags(ops)
	- Post-release monitoring @defer(«release_date») @due(«release_date» + 1d) @tags(ops)
```

## Template Maintenance

**Updating Templates**
- Edit template project directly
- Changes apply to future instantiations only
- Existing projects from template unchanged

**Version Control** (for TaskPaper templates)
- Store in Git repository
- Track changes over time
- Share with team members

**Template Library Organization**
- Use subfolders to categorize templates
- Naming convention: `[TEMPLATE] Project Name`
- Include README note in template with usage instructions

## Integration Points

### URL Scheme

Templates can be instantiated via URL scheme:

```
omnifocus:///paste?target=projects&content=[TaskPaper content]
```

Automation tools can construct URLs with pre-filled placeholders.

### Shortcuts Actions

- **Add TaskPaper**: Sends TaskPaper text to OmniFocus
- **Find Projects**: Locate template project by name
- **Duplicate Project**: Copy template programmatically
- **Run Script**: Execute Omni Automation for complex logic

### Omni Automation

JavaScript API provides full control:

```javascript
const template = projectsMatching("Template: Client Onboarding")[0]
const newProject = template.duplicate()
newProject.name = newProject.name.replace("Template: ", "")
// ... replace placeholders, move to folder, etc.
```

### Third-Party Plugins

Popular plugins:
- **Templates for OmniFocus** by Kaitlin Salzke
- **Populate Template Placeholders** by Curt Clifton
- Various community-created shortcuts and workflows

## Settings & Preferences

**Template Folder Location**
- User-defined folder within OmniFocus hierarchy
- Can use multiple template folders for organization

**Auto-Cleanup**
- Option to automatically delete template projects after instantiation
- Useful for external TaskPaper templates imported temporarily

**Placeholder Style**
- Default: guillemets `« »`
- Alternative: double braces `{{ }}` (tool-dependent)
- Double square brackets `[[ ]]` (some plugins)

## Best Practices

**For Template Creators**
- Include clear placeholder names
- Provide default values where sensible
- Add usage instructions in project note
- Use consistent date placeholder strategy
- Test template instantiation before sharing

**For Template Users**
- Review generated project before activating
- Verify date calculations are correct
- Adjust task hierarchy as needed for specific instance
- Delete unused optional sections

**For Teams**
- Standardize on placeholder naming conventions
- Share template library via external storage
- Document template purpose and usage
- Version control TaskPaper templates

## Platform Considerations

| Platform | Native Duplication | TaskPaper Import | Plugin Support | Shortcuts |
|----------|-------------------|------------------|----------------|-----------|
| macOS | ✓ | ✓ | ✓ | ✓ |
| iOS/iPadOS | ✓ | ✓ | ✓ | ✓ |
| visionOS | ✓ | ✓ | ✓ | ✓ |
| Web | ✓ | ✗ | ✗ | ✗ |

**Web Limitations**: Basic duplication only, no TaskPaper import or automation

## Related Specifications

- `specs/automation.md` - Automation systems that enable templates
- `specs/project.md` - Project data model
- `specs/task.md` - Task data model
- `improved_specs/ai-organization.md` - AI-assisted template creation
- `specs/quick-capture.md` - Quick Entry integration

## Out of Scope

**Not Covered Here**:
- Specific plugin implementation details
- TaskPaper full specification (external format)
- Template distribution/marketplace
- Collaborative template editing

**Future Considerations**:
- Native template UI in OmniFocus
- Cloud-based template library
- Template versioning and updates
- Conditional logic in templates (if/then)
- Template inheritance and composition

## Sources

Research for this specification:
- [Templates for OmniFocus Plugin](https://github.com/ksalzke/templates-for-omnifocus)
- [Create Project Templates Tutorial](https://learnomnifocus.com/tutorial/create-project-templates-with-the-templates-for-omnifocus-plug-in/)
- [OmniFocus Automation Shortcuts](https://omni-automation.com/shortcuts/omnifocus.html)
- [Using Project Templates - The Sweet Setup](https://thesweetsetup.com/using-project-templates-in-omnifocus-so-you-can-spend-less-time-thinking-and-more-time-doing/)
