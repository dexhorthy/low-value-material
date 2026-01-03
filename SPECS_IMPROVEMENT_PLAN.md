# Specs Improvement Plan

Transform base OmniFocus-style specs into AI-native specifications for "low-value-material".

## Completed Research

### AI Libraries Researched (2026-01-03)

1. **BoundaryML/BAML** - Domain-specific language for structured LLM outputs
   - Type-safe schema definitions (classes, enums with descriptions)
   - Functions that embed prompts directly with output format injection
   - Multi-model support with client switching
   - Perfect for: Task extraction, inbox processing, organization suggestions

2. **Vercel AI SDK** - TypeScript toolkit for AI applications
   - Tool calling with Zod schema validation
   - Streaming support for real-time updates
   - Multi-step agent workflows with `streamText` chaining
   - Parallel processing patterns for independent operations
   - Perfect for: Task system tools, real-time AI interactions

3. **Claude Agent SDK** - SDK for building AI agents
   - Custom tool definitions via `@tool` decorator
   - MCP server integration for external tools
   - Session management and streaming input/output
   - Allowed tools configuration for security
   - Perfect for: Complex task execution, weekly reviews, task dispatch

## Improved Specs Created

### `improved_specs/ai-integration.md` (2026-01-03)
Comprehensive AI integration layer specification covering:
- BAML-inspired schema definitions for task extraction
- Vercel AI SDK-style tool definitions for task operations
- Claude Agent SDK patterns for agent dispatch
- MCP server connectivity for task execution
- AI-assisted workflows (capture, review, next actions)

## Remaining Work

### Priority 1: Core Data Model AI Extensions
- [ ] Extend `task.md` with AI fields (extraction confidence, suggested_by, etc.)
- [ ] Extend `project.md` with AI planning capabilities
- [ ] Extend `inbox.md` with AI processing queue

### Priority 2: AI-Specific Specifications
- [ ] `improved_specs/ai-config.md` - Model configuration, provider switching
- [ ] `improved_specs/ai-learning.md` - User pattern learning, personalization
- [ ] `improved_specs/nl-query.md` - Natural language task querying

### Priority 3: Execution Capabilities
- [ ] `improved_specs/mcp-registry.md` - Available MCP servers, tool discovery
- [ ] `improved_specs/agent-tasks.md` - Agent task queue, execution monitoring
- [ ] `improved_specs/automation.md` - Trigger-based task automation

### Priority 4: Integration Points
- [ ] `improved_specs/voice.md` - Voice capture and commands
- [ ] `improved_specs/email-integration.md` - Email-to-task with AI parsing
- [ ] `improved_specs/calendar-sync.md` - Calendar integration with AI scheduling
