# AI Capabilities

## Overview

OmniFocus 4.8+ integrates Apple Intelligence through on-device Foundation Models, enabling AI-powered task planning, breakdown, and estimation directly within the application. All AI processing occurs locally on the user's device, ensuring privacy and performance without requiring cloud connectivity or third-party API dependencies.

## Core Principles

- **Privacy First**: All AI queries execute on-device using Apple's Foundation Models framework
- **Optional**: AI features are entirely opt-in; the application functions fully without them
- **Augmentative**: AI assists planning but doesn't replace user judgment or control
- **Local Processing**: No data sent to external services; requires Apple Intelligence-capable hardware

## Data Model

### AI Context

AI operations work with the existing OmniFocus data model:

- Tasks: title, note, project, tags, dates, estimated_time
- Projects: title, note, type (parallel, sequential, single-action), status
- User Input: natural language prompts describing goals or requirements

### AI-Generated Content

The AI can generate structured content that maps to OmniFocus entities:

- **Sub-tasks**: New task objects with titles, notes, and optional metadata
- **Project Structures**: Complete project hierarchies with action groups
- **Time Estimates**: Estimated duration values for tasks
- **Planning Steps**: Ordered sequences of actionable items

## Technical Architecture

### LanguageModel API

The Omni Automation framework provides access to Apple's Foundation Models through the `LanguageModel` class.

#### Session Constructor

```javascript
const session = new LanguageModel.Session()
```

Creates a new communication session with the on-device Foundation Model.

#### Response Methods

**Text Response** (Conversational)
```javascript
session.respond(prompt: String) → Promise<String>
```
- Returns natural language text suitable for display
- Non-deterministic: identical prompts may yield different responses
- Executes asynchronously

**Structured Response** (JSON)
```javascript
session.respondWithSchema(
  prompt: String,
  schema: LanguageModel.Schema,
  generationOptions: LanguageModel.GenerationOptions | null
) → Promise<String>
```
- Returns JSON data conforming to provided schema
- Enables predictable data extraction for automation
- Supports nested objects and arrays

#### Response Formats

**Conversational Text**
```
"Here are the steps to install solar panels:
1. Research local regulations
2. Get multiple quotes..."
```

**Structured JSON** (in triple-backtick blocks)
````
```json
{
  "tasks": [
    {"title": "Research regulations", "estimated_hours": 2},
    {"title": "Get quotes", "estimated_hours": 4}
  ]
}
```
````

**Structured XML** (alternative format)
````
```xml
<tasks>
  <task title="Research regulations" hours="2"/>
  <task title="Get quotes" hours="4"/>
</tasks>
```
````

### Error Handling

```javascript
try {
  const response = await session.respond(prompt)
  // Process response
} catch (error) {
  // error.name: Error type identifier
  // error.message: Human-readable description
  new Alert(error.name, error.message).show()
}
```

## Built-in AI Features

### Help Me Plan (AFM0005)

**Purpose**: Breaks down selected tasks into actionable sub-tasks

**Input**:
- Selected task or project
- Task title and note content
- Optional: User refinement prompt

**Output**:
- Series of sub-tasks added to the selected item
- Each with title, description, and priority

**Example Use Case**:
```
Input Task: "Renovate kitchen"
AI-Generated Sub-tasks:
  1. Set renovation budget (High priority)
  2. Research and hire general contractor (High)
  3. Select appliances and fixtures (Medium)
  4. Schedule demolition (Medium)
  5. Plan temporary kitchen setup (Low)
```

### Intelligent Assist (AFM0003)

**Purpose**: Analyzes task context to generate relevant sub-tasks

**Input**:
- Selected task/project title
- Task notes containing context or requirements
- Existing tags or project hierarchy

**Output**:
- Contextually appropriate sub-tasks
- Respects project type (sequential vs parallel)

**Example Use Case**:
```
Input: "Launch marketing campaign" with note "Target: developers, Budget: $10k"
Generated:
  - Define campaign messaging for developer audience
  - Allocate $10k budget across channels
  - Create content calendar
  - Design ad creative
  - Set up tracking and analytics
```

### Help Me Estimate (AFM0004)

**Purpose**: Provides time estimates for task completion

**Input**:
- Task title and description
- Task complexity indicators from notes
- Optional: Historical context from similar tasks

**Output**:
- Estimated duration in hours or days
- Rationale for estimate (in task note)
- Confidence level indicators

**Example Use Case**:
```
Task: "Implement user authentication system"
AI Estimate: 16-24 hours
Rationale: "Includes backend API setup (8h), frontend integration (6h),
            testing (4h), and security review (2-4h)"
```

### Project Templates via AI (AFM0002)

**Purpose**: Generates complete project structures from prompts

**Input**:
- Natural language project description
- Goals, constraints, preferences (e.g., "new exercise routine: 3x/week,
  45min, strength focus")

**Output**:
- New project with hierarchical task structure
- Tasks with descriptions, priorities, and suggested defer/due dates
- Tags applied based on context

**Example Use Case**:
```
Prompt: "Exercise routine: 3x/week, 45min sessions, focus on strength"
Generated Project: "Strength Training Routine"
  - Monday: Upper Body
    - Warm-up (5 min)
    - Bench press: 3 sets
    - Rows: 3 sets
    - Overhead press: 3 sets
  - Wednesday: Lower Body
    - Warm-up (5 min)
    - Squats: 3 sets
    - Deadlifts: 3 sets
    - Lunges: 3 sets
  - Friday: Full Body
    [... etc ...]
```

### Clipboard Events (AFM0006)

**Purpose**: Converts event descriptions into inbox tasks

**Input**:
- Clipboard text containing event details
- Date/time information
- Location or context

**Output**:
- Individual inbox tasks for each event
- Defer/due dates parsed from text
- Tags inferred from context

**Example Use Case**:
```
Clipboard: "Team meeting tomorrow 2pm, prepare Q1 report"
Generated Tasks:
  1. "Attend team meeting" (due: tomorrow 2pm)
  2. "Prepare Q1 report" (defer: today, due: tomorrow 1:45pm)
```

## AI-Assisted Workflows

### Project Ideation to Execution

1. **Initial Capture**: Create task with rough project idea
2. **AI Planning**: Run "Help Me Plan" on captured task
3. **Review & Refine**: Edit generated sub-tasks, adjust order/hierarchy
4. **Estimation**: Run "Help Me Estimate" on refined tasks
5. **Scheduling**: Use Forecast view to assign defer/due dates
6. **Execution**: Work through available tasks

### Rapid Project Creation

1. **Prompt Entry**: Use Quick Entry to describe project goals
2. **AI Generation**: Apply project template generator with detailed prompt
3. **Import**: AI creates complete project structure
4. **Customization**: Adjust tasks, dates, tags as needed
5. **Activate**: Set project status to Active

### Batch Processing with AI

1. **Select Multiple Tasks**: Use batch editing to select similar tasks
2. **Context Building**: Add shared context to notes
3. **AI Enhancement**: Run Intelligent Assist on selection
4. **Review**: Approve or modify generated sub-tasks
5. **Distribution**: Assign to projects and set dates

## AI Plug-in Development

### Creating Custom AI Plug-ins

Developers can create custom Omni Automation plug-ins that leverage the Foundation Models API.

#### Basic Structure

```javascript
(async () => {
  try {
    // Get user input or context
    const task = document.windows[0].content.selectedTasks[0]
    const prompt = `Analyze this task and suggest improvements: ${task.name}`

    // Query AI
    const session = new LanguageModel.Session()
    const response = await session.respond(prompt)

    // Process and apply results
    console.log(response)
    // ... create tasks, set properties, etc.

  } catch (error) {
    new Alert(error.name, error.message).show()
  }
})()
```

#### Structured Response Example

```javascript
const schema = new LanguageModel.Schema({
  type: "object",
  properties: {
    subtasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          note: { type: "string" },
          estimated_minutes: { type: "integer" },
          priority: { type: "string", enum: ["high", "medium", "low"] }
        }
      }
    }
  }
})

const prompt = `Break down "${task.name}" into specific sub-tasks`
const response = await session.respondWithSchema(prompt, schema, null)
const data = JSON.parse(response)

// Create tasks from structured data
data.subtasks.forEach(item => {
  const newTask = new Task(item.title, task.beginning)
  newTask.note = item.note
  newTask.estimatedMinutes = item.estimated_minutes
  // ... set other properties
})
```

### Plug-in Types

**Action Plug-ins**: Perform operations on selected items or current perspective
**Perspective Plug-ins**: Generate custom filtered views with AI assistance
**Resource Plug-ins**: Provide reusable AI prompts or templates

### Distribution

Plug-ins can be:
- Shared via URLs (Omni Automation website)
- Installed via `.omnifocusjs` or `.omnijs` files
- Synced across devices via Omni Sync Server

## Platform Requirements

### Hardware Requirements

- Apple Silicon (M1/M2/M3+) or A17+ chip
- Minimum RAM: 8GB (recommended: 16GB+)
- Apple Intelligence-capable device

### OS Requirements

- macOS Tahoe (26.0+)
- iOS 26.0+
- iPadOS 26.0+
- visionOS 26.0+

### Availability by Platform

| Feature | macOS | iOS | iPadOS | visionOS | Web |
|---------|-------|-----|--------|----------|-----|
| LanguageModel API | ✅ | ✅ | ✅ | ✅ | ❌ |
| Help Me Plan | ✅ | ✅ | ✅ | ✅ | ❌ |
| Intelligent Assist | ✅ | ✅ | ✅ | ✅ | ❌ |
| Help Me Estimate | ✅ | ✅ | ✅ | ✅ | ❌ |
| Custom Plug-ins | ✅ | ✅ | ✅ | ✅ | ❌ |

**Note**: Web version doesn't support on-device AI due to platform limitations.

## Settings & Configuration

### AI Preferences

```
Preferences → Automation → Apple Intelligence
```

**Available Settings**:
- `ai_enabled`: Master switch for all AI features (default: true)
- `show_ai_suggestions`: Display AI-generated content inline (default: true)
- `ai_auto_apply`: Automatically apply AI suggestions without confirmation (default: false)
- `ai_logging_enabled`: Log AI queries to Automation Console (default: false)
- `ai_default_prompt_language`: Language for AI prompts (default: system language)

### Per-Feature Controls

Each AI feature can be individually enabled/disabled:
- Help Me Plan
- Intelligent Assist
- Help Me Estimate
- Clipboard Events
- Custom Plug-ins

### Privacy Controls

**Data Processing**:
- All processing occurs on-device
- No telemetry sent to Omni or Apple
- Prompts and responses not logged unless explicitly enabled
- AI queries don't sync between devices

**Content Warnings**:
- AI may generate inaccurate or inappropriate content
- User review required before accepting suggestions
- Override or delete AI-generated content freely

## Limitations & Best Practices

### Current Limitations

1. **Non-Deterministic**: Same prompt may yield different results
2. **Context Window**: Limited to task/project data plus prompt (~2000 tokens)
3. **No Learning**: Model doesn't learn from user corrections or preferences
4. **Language Support**: Best results in English; other languages vary
5. **Specialized Domains**: General knowledge only; not domain expert
6. **Hardware Dependent**: Requires recent Apple Silicon devices

### Best Practices

#### Effective Prompting

**Be Specific**:
```
❌ "Plan this project"
✅ "Break down kitchen renovation into sequential phases with 2-3 tasks each,
    focusing on contractor coordination and material selection"
```

**Provide Context**:
```
❌ "Estimate this task"
✅ "Estimate time for 'Implement OAuth' - I'm experienced with authentication
    but new to this OAuth provider"
```

**Iterate**:
- Review AI output critically
- Refine prompts based on results
- Combine AI suggestions with domain expertise

#### When to Use AI

**Good Use Cases**:
- Breaking down ambiguous large projects
- Generating checklists for routine processes
- Estimating unfamiliar task durations
- Ideation and brainstorming

**Poor Use Cases**:
- Tasks requiring specialized/current knowledge
- Critical decisions without verification
- Generating content that must be 100% accurate
- Privacy-sensitive information processing

#### Quality Control

1. **Review Before Accepting**: Always review AI-generated tasks
2. **Validate Estimates**: Cross-check AI time estimates with experience
3. **Preserve Context**: Keep original prompts in project notes for reference
4. **Iterate**: Regenerate with refined prompts if initial results inadequate
5. **Combine with Manual**: Use AI as starting point, then manually refine

## Integration with Other Features

### Perspectives

AI-generated tasks respect perspective filters:
- Available status calculated normally
- AI tasks inherit project type (sequential/parallel)
- Custom perspectives can filter AI-generated content via tags

### Repeating Tasks

AI can assist with repeat configuration:
- Suggest appropriate repeat intervals
- Recommend defer vs due anchoring
- Generate checklist items for recurring processes

### Review System

AI enhances project reviews:
- Suggest next steps for stalled projects
- Identify missing tasks in incomplete projects
- Recommend review interval adjustments

### Tags & Focus Mode

AI-generated tasks can:
- Auto-suggest relevant tags based on content
- Inherit focus context when generated during focus
- Respect tag-based blocking (`allows_next_action`)

### Sync

AI features don't sync directly, but results do:
- AI-generated tasks sync normally
- Plug-ins sync if using Omni Sync Server
- AI preferences don't sync (device-specific)

## Future Directions

Based on the 2025 roadmap and current capabilities:

### Planned Enhancements

- **Smarter Scheduling**: AI-suggested defer/due dates based on workload
- **Effort Optimization**: Recommend task ordering for efficiency
- **Context Awareness**: Use location, time, energy levels for suggestions
- **Learning from Patterns**: Recognize user habits (without data collection)

### Under Consideration

- **Multi-task Analysis**: Cross-project dependency detection
- **Resource Balancing**: Identify overcommitment or underutilization
- **Natural Language Queries**: Ask questions about database in plain language
- **Smart Templates**: Context-aware project templates

## Related Specifications

- **automation.md**: Omni Automation framework, plug-in system
- **task.md**: Task data model that AI generates/modifies
- **project.md**: Project structures that AI creates
- **quick-capture.md**: Integration with Quick Entry for AI prompts
- **perspectives.md**: How AI respects view filters
- **notes.md**: AI can populate rich text notes

## Out of Scope

This specification does NOT cover:

- Third-party AI services (e.g., ChatGPT, Claude via MCP servers)
- Cloud-based AI processing or APIs
- AI features in OmniGraffle, OmniPlan, or other Omni apps (though similar)
- Machine learning for task prediction (not implemented)
- Voice-based AI interaction (covered by Siri integration in quick-capture.md)
- AI-powered search or semantic search (uses keyword search from search.md)

## References

### Sources

- [OmniFocus 4.8 Apple Intelligence Support - 9to5Mac](https://9to5mac.com/2025/09/15/omnifocus-4-8-apple-intelligence-support/)
- [All Omni Apps Ready; Liquid Glass and Apple Intelligence - Omni Group Blog](https://www.omnigroup.com/blog/ready-for-os-26)
- [OmniFocus 4.8 Liquid Glass and Apple Intelligence - iGeeksBlog](https://www.igeeksblog.com/omnifocus-4-8-liquid-glass-apple-intelligence/)
- [Apple Foundation Models API - Omni Automation](https://omni-automation.com/shared/alm.html)
- [Apple Foundation Models Plug-Ins - Omni Automation](https://omni-automation.com/shared/alm-collection.html)
- [OmniFocus Enhanced MCP Server - Skywork AI](https://skywork.ai/skypage/en/omnifocus-ai-engineer-productivity/1981202512078929920)

### Additional Reading

- Apple Foundation Models Framework Documentation
- Omni Automation JavaScript API Reference
- OmniFocus Plug-in Development Guide
- Privacy and On-Device AI Whitepaper
