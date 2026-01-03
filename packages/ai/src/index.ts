// AI package - BAML-powered task extraction and processing
// Re-exports generated BAML client from baml_client/

// Export BAML client and types
export { b as baml } from "../baml_client/baml_client/async_client";
export type {
  ConfidenceLevel,
  DuplicateCheckResult,
  ExtractedDate,
  ExtractedTask,
  ProjectSuggestion,
  TagSuggestion,
  TaskExtractionResult,
} from "../baml_client/baml_client/types";

export const AI_PACKAGE_VERSION = "0.0.1";
