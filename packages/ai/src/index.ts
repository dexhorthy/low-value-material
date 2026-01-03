// AI package - BAML-powered task extraction and processing
// Re-export generated BAML client once generated
// Run `bun run generate` to create baml_client/

// Export types for task extraction results
export interface ExtractedDate {
  value: string;
  timeSpecified: boolean;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  originalText: string;
}

export interface ProjectSuggestion {
  name: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reason?: string;
}

export interface TagSuggestion {
  name: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reason?: string;
}

export interface ExtractedTask {
  title: string;
  note?: string;
  dueDate?: ExtractedDate;
  deferDate?: ExtractedDate;
  estimatedMinutes?: number;
  isWaitingFor: boolean;
  waitingForPerson?: string;
  suggestedProjects: ProjectSuggestion[];
  suggestedTags: TagSuggestion[];
  isUrgent: boolean;
}

export interface TaskExtractionResult {
  tasks: ExtractedTask[];
  needsClarification: boolean;
  clarificationQuestion?: string;
  alternativeInterpretations?: string[];
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchType?: "exact" | "similar" | "related";
  existingTaskTitle?: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  suggestion?: "update_existing" | "create_new" | "skip";
}

// Placeholder export until baml_client is generated
// After running `bun run generate`, this file should re-export from baml_client
export const AI_PACKAGE_VERSION = "0.0.1";
