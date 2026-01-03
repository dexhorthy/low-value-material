// Task extraction schema for AI-native capture
// Based on improved_specs/ai-capture.md and improved_specs/ai-processing-reference.md

// Confidence level for extracted fields
enum ConfidenceLevel {
  HIGH @description("0.9+ confidence - system is very sure, can auto-apply")
  MEDIUM @description("0.7-0.9 confidence - likely correct, user should confirm")
  LOW @description("Below 0.7 - uncertain, ask user to clarify")
}

// Extracted date with confidence
class ExtractedDate {
  value string @description("ISO 8601 date or datetime string")
  timeSpecified bool @description("Whether a specific time was mentioned")
  confidence ConfidenceLevel
  originalText string @description("The original text that was parsed")
}

// Project suggestion with confidence
class ProjectSuggestion {
  name string @description("Name of the suggested project")
  confidence ConfidenceLevel
  reason string? @description("Why this project was suggested")
}

// Tag suggestion with confidence
class TagSuggestion {
  name string @description("Tag name without @ prefix")
  confidence ConfidenceLevel
  reason string? @description("Why this tag was suggested")
}

// A single extracted task from user input
class ExtractedTask {
  title string @description("Clear, actionable task title")
  note string? @description("Additional context or details")
  dueDate ExtractedDate? @description("When task should be completed")
  deferDate ExtractedDate? @description("When task should become visible")
  estimatedMinutes int? @description("Estimated duration in minutes")
  isWaitingFor bool @description("Whether task is blocked waiting for someone")
  waitingForPerson string? @description("Name of person being waited on, if isWaitingFor is true")
  suggestedProjects ProjectSuggestion[] @description("Potential project matches")
  suggestedTags TagSuggestion[] @description("Relevant tag suggestions")
  isUrgent bool @description("Whether task appears time-sensitive")
}

// Result of task extraction - may contain multiple tasks
class TaskExtractionResult {
  tasks ExtractedTask[] @description("Extracted tasks from input")
  needsClarification bool @description("Whether input needs user clarification")
  clarificationQuestion string? @description("Question to ask user if clarification needed")
  alternativeInterpretations string[]? @description("Other ways to interpret the input")
}

// Main task extraction function
function ExtractTasks(
  input: string,
  currentDate: string,
  existingProjects: string[],
  existingTags: string[]
) -> TaskExtractionResult {
  client Default
  prompt #"
    You are an expert at parsing natural language into structured task data.
    Extract actionable tasks from the user's input.

    Current date/time: {{ currentDate }}

    Existing projects in the system (match to these when possible):
    {{ existingProjects }}

    Existing tags in the system (match to these when possible):
    {{ existingTags }}

    Guidelines:
    - Create clear, actionable task titles (verb-first when possible)
    - Extract dates relative to the current date
    - Match to existing projects/tags when confident, suggest new ones when appropriate
    - Detect if someone is being waited on ("waiting for John", "after Sarah sends...")
    - Multiple distinct tasks should be separate entries
    - If input is ambiguous, set needsClarification=true and provide a question

    {{ ctx.output_format }}

    {{ _.role("user") }}
    {{ input }}
  "#
}

// Duplicate detection - check if a task already exists
class DuplicateCheckResult {
  isDuplicate bool @description("Whether this appears to be a duplicate")
  matchType string? @description("exact, similar, or related")
  existingTaskTitle string? @description("Title of the existing task that matches")
  confidence ConfidenceLevel
  suggestion string? @description("Suggested action: update_existing, create_new, or skip")
}

function CheckDuplicate(
  newTaskTitle: string,
  newTaskNote: string?,
  existingTasks: string[]
) -> DuplicateCheckResult {
  client Default
  prompt #"
    Check if the new task appears to be a duplicate of any existing task.

    Match types:
    - exact: Same meaning, possibly different wording ("Call mom" vs "Phone mom")
    - similar: Related but distinct ("Call mom about party" vs "Call mom about gift")
    - related: Connected but clearly different ("Plan party" vs "Buy party supplies")

    New task:
    Title: {{ newTaskTitle }}
    Note: {{ newTaskNote }}

    Existing tasks:
    {{ existingTasks }}

    {{ ctx.output_format }}
  "#
}

// Simple test cases
test SingleTask {
  functions [ExtractTasks]
  args {
    input "Call mom tomorrow at 3pm about her birthday party"
    currentDate "2026-01-03T10:00:00Z"
    existingProjects ["Family Events", "Work", "Home"]
    existingTags ["calls", "family", "errands", "work"]
  }
}

test MultipleTasksInOneInput {
  functions [ExtractTasks]
  args {
    input "Need to buy groceries, call the dentist, and finish the report by Friday"
    currentDate "2026-01-03T10:00:00Z"
    existingProjects ["Health", "Work", "Home"]
    existingTags ["errands", "calls", "work", "shopping"]
  }
}

test WaitingForTask {
  functions [ExtractTasks]
  args {
    input "Waiting for John to send the contract before I can review it"
    currentDate "2026-01-03T10:00:00Z"
    existingProjects ["Acme Contract", "Legal"]
    existingTags ["waiting", "review", "contracts"]
  }
}
