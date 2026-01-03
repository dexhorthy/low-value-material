# How to Build AI That Works

> Distilled wisdom from 35+ episodes of live coding, Q&A, and production-ready AI engineering.

---

## Core Philosophy

<important if="you are building any AI system">
Context engineering is everything. All inputs—prompts, RAG, memory, agent history—are simply different ways of assembling tokens. Output quality is a direct function of input context quality.
</important>

<important if="you are starting a new AI project">
Start expensive, then optimize. Ship with big models first, collect ground-truth data, then optimize when it hurts. Use production data to build your golden dataset over time.
</important>

<important if="you are choosing an agent framework">
Don't use a framework. The nuances you build by choosing an architecture give your agent its identity. Own your own identity.
</important>

---

## Prompting & Structured Outputs

<important if="you think you need a bigger model">
Better prompts beat bigger models. Guided reasoning outperforms generic `<THINK>` tokens. You can make a cheap model reason well just by prompting it well.
</important>

<important if="you need confidence scores from an LLM">
Use rubrics, not numbers. Categorical labels ("slow" / "medium" / "fast") beat numeric confidence scores for evals.
</important>

<important if="you are building a classification system">
Include escape hatches. Add "Other" or "Unknown" categories to handle ambiguity.

```baml
// From 2025-03-31-large-scale-classification/baml_src/pick_best_category.baml
enum Category {
    @@dynamic  // Categories defined at runtime
}

function PickBestCategory(text: string) -> Category {
    client "openai/gpt-4o-mini"
    prompt #"
        Which category best describes the following text?
        {{ ctx.output_format }}
        {{ _.role('user') }}
        {{ text }}
    "#
}
```
</important>

<important if="your LLM outputs are inconsistent">
RTFP (Read The Prompt!) Carefully review prompts for potential ambiguities that might confuse the LLM.
</important>

<important if="you need to cite sources or URLs">
Use indexes for URLs & citations. Provide content with simple IDs (e.g., `[SOURCE_1]`) and have the LLM output these IDs. Map them back programmatically.

```python
sources = {"SOURCE_1": "https://example.com/article"}
# LLM outputs: "According to [SOURCE_1]..."
# You map SOURCE_1 -> actual URL in post-processing
```
</important>

<important if="you are doing speaker diarization or transcript labeling">
Use index-based diarization. Have the LLM output the index and speaker:

```json
{"dialogue_idx": 0, "speaker": "Nurse"}
```
</important>

<important if="you need to debug LLM reasoning">
Include reasoning via "busted" JSON. Add LLM reasoning as comments or non-standard fields in structured output for easier debugging.

```baml
// From 2025-04-22-twelve-factor-agents/final/baml_src/agent.baml
function DetermineNextStep(thread: string) -> HumanTools | CalculatorTools {
    client "openai/gpt-4o"
    prompt #"
        {{ _.role("system") }}
        You are a helpful assistant that can help with tasks.

        {{ _.role("user") }}
        You are working on the following thread:
        {{ thread }}

        What should the next step be?
        {{ ctx.output_format }}

        Always think about what to do next first, like:
        - ...
        - ...
        - ...

        {...} // schema
    "#
}
```
</important>

<important if="the LLM is generating code">
Generate code within Markdown-style backticks as a string field in JSON for higher quality output.
</important>

<important if="your AI-generated content sounds robotic or templated">
Use a two-step pipeline: Extract then Polish.

1. **Extract** - A dedicated LLM call extracts raw facts into a structured format
2. **Polish** - A second LLM call polishes those facts into the final output

This avoids "Mad Libs" output and yields much higher quality.
</important>

---

## Context Engineering

<important if="you are hitting context limits or getting degraded output">
Less context often yields better results. Stay under 40% context usage—restart before hitting limits.
</important>

<important if="you want faster inference and lower costs">
Optimize your cache. Keep system messages consistent, place dynamic variables at the end. This leverages KV cache for significant performance gains.
</important>

<important if="you have long-running agent conversations">
Reinforce context periodically. In long interactions, LLMs lose track of the original goal. Re-inject relevant information instead of relying on memory.
</important>

<important if="you are using few-shot prompting">
Be judicious with few-shot prompting. Use it only when needed and structure examples properly to avoid biasing output.
</important>

<important if="you are building tools for agents">
Every token counts. When you save 20 tokens per call and grep 30 times, that makes a huge difference.

```python
# From 2025-10-21-agentic-rag-context-engineering/main.py
def execute_read(tool: types.ReadTool, working_dir: str = ".") -> str:
    """Read a file with token-efficient formatting"""
    # Limit to 5000 lines per read
    max_lines = 5000
    if end - start > max_lines:
        end = start + max_lines

    result_lines = []
    for i, line in enumerate(lines[start:end], start=start + 1):
        # Truncate very long lines at 20k characters
        if len(line) > 20000:
            line = line[:20000] + "... [line truncated at 20k characters]\n"
        result_lines.append(f"{i:6d}|{line.rstrip()}")

    # Add truncation notice if we hit the limit
    if end < total_lines:
        remaining = total_lines - end
        truncation_notice = f"\n\n... [Output truncated: showing lines {start + 1}-{end} of {total_lines} total lines ({remaining} lines remaining)]\n"
        truncation_notice += f"To read more, use the Read tool with: offset={end}, limit={min(5000, remaining)}"
        result_lines.append(truncation_notice)

    return "\n".join(result_lines)
```
</important>

<important if="you are using AI coding agents on large codebases">
Use the three-phase workflow:

1. **Research** - Understanding the problem and how the system works today
2. **Planning** - Building a step-by-step outline of changes
3. **Implementation** - Executing the plan, testing as you go

Fresh context windows for each phase—don't carry unnecessary history.
</important>

<important if="you are prompting coding agents">
Leverage the hierarchy: `CLAUDE.md > prompts > research > plans > implementation`. Focus human effort on the highest-leverage parts.
</important>

---

## Building Agents

<important if="you are designing agent architecture">
Follow 12-Factor Agent principles:
- Own your context window
- Use state machines over chains
- Make tools simple and composable
- Design for human-in-the-loop
- Build for observability

```baml
// From 2025-04-22-twelve-factor-agents/final/baml_src/agent.baml
// Human tools are async requests to a human
type HumanTools = ClarificationRequest | DoneForNow

class ClarificationRequest {
  intent "request_more_information" @description("you can request more information from me")
  message string
}

class DoneForNow {
  intent "done_for_now"
  message string @description("message to send to the user about the work that was done")
}
```
</important>

<important if="you need to handle interrupts, approvals, or queued inputs">
Use event-driven architecture:
- Treat agent interactions as an event log, not mutable state
- Project state for UI, agent loop, and persistence independently
- Every interaction is append-only
- Testing becomes deterministic—replay event logs and assert

```typescript
// From 2025-11-05-event-driven-agents/demo/src/reducers/messages-reducer.ts
case 'user_message': {
  if (state.isStreaming || state.streamingMessageIndex !== null) {
    // QUEUE THE MESSAGE - don't add to main messages yet
    return {
      ...state,
      queuedUserMessages: [
        ...state.queuedUserMessages,
        { id: generateId(), content: event.content, timestamp: event.timestamp }
      ]
    }
  }
  // Add to messages normally
  return addMessage(state, {
    id: generateId(),
    role: 'user',
    type: 'text',
    content: event.content,
    timestamp: event.timestamp
  })
}
```
</important>

<important if="you are building voice agents or real-time conversational AI">
Use supervisor threading:
- Separate the "worker" (talks and listens) from the "supervisor" (guides conversation)
- Supervisor can be a state machine, sequence of operations, or other logic
- Enables robust interruption and course correction

```python
# From 2025-09-02-voice-agent-supervisor-threading/voice_agent.py
async def handle_turn(user_text: str) -> None:
    """Handle a single conversation turn with real-time supervisor monitoring."""
    # Create streaming task
    stream_task = asyncio.create_task(stream_assistant_response(convo_text))

    # Create supervisor task that runs in parallel
    convo_snapshot = conversation.copy()
    supervisor_task = asyncio.create_task(run_compliance_check(convo_snapshot))

    try:
        stream = await stream_task
        async for partial in stream:
            # Check if supervisor has detected an issue DURING streaming
            if supervisor_task.done():
                review = await supervisor_task
                if review.status == "NEEDS_ADJUSTMENT":
                    # INTERRUPT IMMEDIATELY
                    stop_tts()  # Stop any ongoing TTS
                    interrupted = True
                    correction = review.message or "Actually, let me correct that..."
                    await speak_text_async(correction)
                    break
```
</important>

<important if="you are designing agent tools">
Give semantically meaningful tools (e.g., `check_calendar`, `search_inbox`) instead of generic `retrieve_memory`. Sandbox tools to the current user for security.

```baml
// From 2025-10-21-agentic-rag-context-engineering/baml_src/agent-tools.baml
class GrepTool {
  action "Grep" @description(#"
    Fast content search tool that works with any codebase size
    - Searches file contents using regular expressions
    - Supports full regex syntax (eg. "log.*Error", "function\s+\w+")
    - Filter files by pattern with the include parameter
    - Returns file paths with at least one match sorted by modification time
  "#)
  pattern string @description("The regular expression pattern to search for")
  path string? @description("The directory to search in. Defaults to current directory.")
  include string? @description("File pattern to include (e.g. '*.js', '*.{ts,tsx}')")
}
```
</important>

<important if="the agent needs common information like today's date">
Fetch deterministic context yourself—don't rely on the agent to ask for it. Inject it into the prompt.
</important>

<important if="you are tempted to do math or timezone conversion in prompts">
Avoid solving deterministic problems in prompts—handle timezone conversions, math, etc. in code.
</important>

<important if="you are implementing tool handlers">
What actually matters:
- Using relative paths instead of absolute paths in grep results
- Tracking and injecting current working directory
- Adding clear truncation notices with line numbers
- Implementing proper timeouts for subprocess calls

```python
# From 2025-10-21-agentic-rag-context-engineering/main.py
def execute_grep(tool: types.GrepTool, working_dir: str = ".") -> str:
    """Search for pattern in files"""
    # Normalize paths to be relative to working_dir
    working_dir_path = Path(working_dir).resolve()
    normalized_files = []
    for file in files[:50]:  # Limit to first 50 matches
        try:
            file_path = Path(file).resolve()
            relative_path = file_path.relative_to(working_dir_path)
            normalized_files.append(str(relative_path))
        except ValueError:
            normalized_files.append(file)
    return "\n".join(normalized_files)
```
</important>

<important if="you are choosing between MCP and Bash for agent tools">
No one-size-fits-all solution. MCP tools simplify integration but come with token overhead. Bash is more token-efficient but requires more setup. Naming conventions matter more than you think—names directly impact how accurately the model uses tools.
</important>

---

## Evaluation & Testing

<important if="you are starting to build evals">
Start with vibe evals:
1. Run your prompt in playground, look at output
2. Write a few test cases that work
3. Write end-to-end tests (e.g., with pytest)

```baml
// From 2025-04-22-twelve-factor-agents/final/baml_src/agent.baml
test MathOperation {
  functions [DetermineNextStep]
  args {
    thread #"
      <user_input>
        can you multiply 3 and 4?
      </user_input>
    "#
  }
  @@assert(intent, {{this.intent == "multiply"}})
}

test LongMath {
  functions [DetermineNextStep]
  args {
    thread #"
      <user_input>
        can you multiply 3 and 4, then divide the result by 2?
      </user_input>
      <multiply>a: 3, b: 4</multiply>
      <tool_response>12</tool_response>
    "#
  }
  @@assert(intent, {{this.intent == "divide"}})
}
```
</important>

<important if="you are considering LLM-as-judge for evaluation">
Prefer runtime evals over LLM-as-judge. Deterministic checks that validate outputs without another LLM:

```python
# From 2025-12-02-multimodal-evals/src/receipt_evaluator.py
def evaluate_sum_validation(self, data: ReceiptData) -> EvaluationResult:
    """Check if sum of transactions equals grand_total."""
    transaction_sum = sum(t.total_price for t in data.transactions)
    calculated_total = transaction_sum

    if data.service_charge is not None:
        calculated_total += data.service_charge
    if data.tax is not None:
        calculated_total += data.tax
    if data.rounding is not None:
        calculated_total += data.rounding
    if data.discount_on_total is not None:
        calculated_total -= abs(data.discount_on_total)

    tolerance = 0.01
    difference = abs(calculated_total - data.grand_total)
    passed = difference <= tolerance

    return EvaluationResult(
        check_name="sum_validation",
        passed=passed,
        message=f"Calculated: {calculated_total:.2f}, Grand total: {data.grand_total:.2f}"
    )
```

Benefits: No additional API costs, deterministic results, no circular reasoning.
</important>

<important if="you need a test dataset">
Use production data to build your golden dataset over time. 30 test cases is often the magic number for basic coverage. Test distribution must span your actual user behavior.
</important>

<important if="a new model just dropped">
Evaluate new models based on performance, cost, and speed against YOUR use cases. UX often drives the decision—a slightly "less accurate" but faster model can provide better experience. Don't just look at benchmarks.
</important>

---

## Classification at Scale

<important if="you have 1000+ categories to classify into">
Use a two-stage approach:

1. **Narrowing Stage** - Vector embeddings quickly narrow to ~5-10 candidates
2. **Selection Stage** - LLM reasoning selects the best final category

```python
# From 2025-03-31-large-scale-classification/hello.py
def _narrow_down_categories(text: str, categories: list[Category]) -> list[Category]:
    """Use embeddings to narrow to top candidates"""
    embeddings = [(cat, embed(cat.embedding_text)) for cat in categories]
    text_embedding = embed(text)

    best_matches = []
    for category, embedding in embeddings:
        cosine_similarity = np.dot(text_embedding, embedding) / (
            np.linalg.norm(text_embedding) * np.linalg.norm(embedding)
        )
        best_matches.append((category, cosine_similarity))

    max_matches = 5
    matches = sorted(best_matches, key=lambda x: x[1], reverse=True)[:max_matches]
    return [match[0] for match in matches]

def _pick_best_category(text: str, categories: list[Category]) -> Category:
    """Use LLM to select from narrowed candidates"""
    tb = TypeBuilder()
    for i, category in enumerate(categories):
        val = tb.Category.add_value(category.name)
        val.alias(f"k{i}")
        val.description(category.llm_description)

    return b.PickBestCategory(text, {"tb": tb})
```
</important>

<important if="you are doing entity resolution (companies, skills, etc.)">
Separate extraction from resolution:

```python
# From 2025-06-17-entity-extraction/hello.py
def valid_company(company: Company) -> Company | None:
    valid_companies = load_companies()

    # First try exact match
    for legal_name, aliases in valid_companies.items():
        if legal_name == company.legal_name:
            return company

    # Then try alias matching (covers 80% of cases)
    potential_company = pick_potential_company(company.legal_name)
    if potential_company:
        company.legal_name = potential_company
        return company

    # Fallback: queue for human review
    return None

def main(content: str):
    resume = b.ExtractResume(content)
    for exp in resume.experience:
        match exp.company.company_type:
            case "startup":
                exp.company.legal_name = None
            case "well_known" | "well_known_subsidary":
                result = valid_company(exp.company)
                if result is None:
                    print("kick off JOB to find a better match:", exp.company.name)
```

Straight alias matching covers 80% of cases—save LLM calls for the hard 20%.
</important>

<important if="you need human review in classification pipelines">
Use database status columns (`proposed` / `ready` / `committed`) to enable human-in-loop and future automation.
</important>

---

## Memory & RAG

<important if="you are deciding between traditional RAG and agentic RAG">
Use agentic RAG when:
- Problem scope is unbounded
- User queries vary widely
- You need web search + code search + docs
- Flexibility matters more than speed

Avoid agentic RAG when:
- Problem scope is well-defined
- Speed is critical
- Most queries follow similar patterns
- You can predict needed context
</important>

<important if="you are building long-term memory for agents">
Use Decaying-Resolution Memory (DRM). Not all memories need the same resolution over time:
- Recent events stay detailed
- Older events compress into summaries
- Mirrors human memory—preserves what matters while forgetting details
</important>

<important if="you are designing a memory system">
- Treat RAG, memory, and prompts as a single, unified context engineering problem
- Define success criteria before building—what UX are you enabling?
- Offload memory to sandboxed, stateful tools (calendar, inbox, notepad)
- Normalize timestamps before memory writes; reuse the user's timezone everywhere
</important>

---

## Handling Dates & Times

<important if="your LLM is handling relative dates like 'next Friday'">
Always carry the clock. Pass "today" and the user's zone—relative strings drift otherwise.

```baml
// From 2025-11-11-dates-and-times/baml_src/date-time.baml
function ExtractDates(text: string, source: string?) -> Date[] {
    client "openai/gpt-4o-mini"
    prompt #"
        Extract all dates from the following text (without computation)
        {{ ctx.output_format }}

        Reference date: {{ source }}

        {{ _.role('user') }}
        {{ text }}
    "#
}

test RelativeDates {
    functions [ExtractDates]
    args {
        source "Monday November 10th, 2025"
        text "Lets hang out next Friday."
    }
}
```
</important>

<important if="you are extracting dates from text">
Use intent-specific types:

```baml
// From 2025-11-11-dates-and-times/baml_src/date-time.baml
class AbsoluteDate {
    year int
    month int
    day int
    time string?
}

class RelativeDate {
    type "relative"
    relative_date string @description("use duration strings like P1D, etc")
}

class RecurringDate {
    type "recurring"
    recurrence string @description("use cron strings like '0 10 * * *' for every day at 10am")
    timezone string? @description("only if explicitly provided")
}

type Date = AbsoluteDate | RelativeDate | RecurringDate
```
</important>

<important if="you need to compute dates from LLM output">
Keep the model on labeling duty only. Cron math, timezone lookups, validation—all in pure code.

```python
# From 2025-11-11-dates-and-times/main.py
def next_day(date: RecurringDate, default_timezone: str) -> datetime.datetime:
    """Return the next datetime that satisfies the cron recurrence."""
    timezone_name = date.timezone or default_timezone
    if not timezone_name:
        raise ValueError("A timezone must be provided")

    timezone = pytz.timezone(timezone_name)
    now = datetime.datetime.now(timezone)
    cron_expression = date.recurrence

    iterator = croniter(cron_expression, now)
    next_occurrence = iterator.get_next(datetime.datetime)

    if next_occurrence.tzinfo is None:
        next_occurrence = timezone.localize(next_occurrence)

    return next_occurrence
```
</important>

---

## PDF & Multimodal Processing

<important if="you are processing PDFs with vision models">
Models don't read PDFs natively—they convert to images. Control this process yourself for better results.

- Convert PDFs to images with controlled resolution
- Use pixel-wise diffing to remove boilerplate headers/footers
- For page-spanning data, pass current page + bottom of previous page together
</important>

<important if="you are extracting structured data from documents">
Build validation into prompts. Extract summary figures, then validate parts add to whole:

```baml
// From 2025-12-02-multimodal-evals/baml_src/receipts.baml
class Transaction {
  item_name string
  quantity int
  unit_price float
  unit_discount float?
  total_price float
}

class ReceiptData {
  transactions Transaction[]
  subtotal float?
  service_charge float?
  tax float?
  rounding float?
  discount_on_total float?
  grand_total float
}

function ExtractReceiptTransactions(receipt_image: image) -> ReceiptData {
  client Gemini25Flash
  prompt #"
    You are an expert at extracting structured data from receipt images.

    For each item on the receipt, extract:
    - item_name, quantity, unit_price, unit_discount, total_price

    Also extract the receipt totals:
    - subtotal, service_charge, tax, rounding, grand_total, discount_on_total

    Be precise with numbers and make sure all extracted prices are accurate.
    {{ ctx.output_format }}
    {{ _.role('user') }}
    {{ receipt_image }}
  "#
}
```

Then validate in code:
```python
# LLM extracts transactions AND total
# You verify: sum(transactions) == total
# If not, retry or flag for review
```
</important>

<important if="you want reliable document processing">
Build hybrid systems combining:
- LLM generative power
- Deterministic code for pre-processing
- Runtime validation loops
</important>

---

## Streaming & Real-Time UX

<important if="you are streaming structured output to a UI">
Stop streaming broken JSON. Stream semantically valid, partial objects so every step gives usable data.

- Control streaming behavior declaratively with attributes like `@@stream.done`
- Get complete, validated objects as generated for immediate downstream work
</important>

<important if="users need to interrupt or redirect your agent">
Build interruptible agents. Most agents are fire-and-forget—interruptible agents let users jump in mid-task.

```python
# From 2025-08-19-interruptible-agents/runtime.py
class ConversationRuntime:
    def __init__(self, convo_id: str, max_events: int = 500) -> None:
        self.message_queue: Queue[Message] = Queue()
        self.events: Deque[ProgressEvent] = deque(maxlen=max_events)
        self.cancel_event = threading.Event()
        self.new_msg_event = threading.Event()

    def queue_message(self, msg: Message) -> None:
        if msg.kind == "cancel":
            self.cancel_event.set()
        else:
            self.message_queue.put(msg)
            self.new_msg_event.set()

class AgentThread(threading.Thread):
    def _boundary_check(self) -> bool:
        """Return True if should stop (cancelled)."""
        if self.runtime.cancel_event.is_set() or self._stopped.is_set():
            return True
        # Drain queue and apply messages at phase boundaries
        return False
```

Two architectures:
- Simple main loop (checks for input between steps)
- Multi-threaded (true concurrent operation)
</important>

---

## Production Operations

<important if="you are deploying AI to production">
- Deploy slowly—never push worldwide simultaneously
- Use feature flags for instant rollbacks
- Don't be a hero, roll back. When issues arise, rollback immediately, investigate later
- If rollback doesn't fix it, likely a model/infrastructure issue
</important>

<important if="you need to monitor AI quality in production">
- Monitor social signals (Twitter, forums) for "vibe checks" on model quality
- Build product metrics tied to AI quality (chat thread length, retention)
- Collect production data continuously, turn subsets into eval datasets
</important>

<important if="you are debugging AI failures">
- Calculate checksums, validate structured outputs programmatically
- Track tool sequences—focus on which tools are called in what order
- Phoenix, Arizona breaks many systems—you need diverse eval data
</important>

---

## Working with Coding Agents

<important if="you are using AI to implement features">
Use the Research-Plan-Implement workflow:

**Specification Phase (15 min):**
- Refine syntax and requirements
- Add critical details (error handling, edge cases)

**Research Phase (30 min):**
- AI explores codebase, identifies relevant files
- Produces compressed context for planning

**Planning Phase (45 min):**
- Interactive Q&A to resolve ambiguities
- Break into independently testable phases

**Implementation Phase:**
- Follow the plan, test as you go
- Commit after each successful phase

> "A bad line of code is a bad line of code. A bad part of a plan is a hundred bad lines of code."
</important>

<important if="you are prompting coding agents">
- Voice > typing for prompts—speak freely to provide richer context
- Always read the code—this isn't magic, you're still responsible
- Opus for research, Sonnet for implementation
- 40% context usage is the sweet spot—restart before limits
</important>

<important if="you want agents to work autonomously for longer">
Use the Ralph Wiggum technique. Short loops beat "please keep working" prompts:

- One-loop, one-step, exit, rerun
- Don't convince the model to work longer—bound the work instead
- Back pressure (tests, types, builds) is your governor
- Specs before code—one bad spec line wastes tens of thousands of tokens
- Code is disposable; ideas, specs, and harness design carry the value
</important>

<important if="you want to parallelize AI coding work">
Use git worktrees to run multiple agents on the same repo. tmux is a building block for collaborative agent workflows.
</important>

---

## Tools & Setup

<important if="you are setting up a new AI project">
Core stack:
- **Languages:** Python, TypeScript, Go
- **Prompting DSL:** BAML
- **Package Managers:** UV (Python), pnpm (TypeScript)
- **IDE:** Cursor, Claude Code

```bash
# Python
uv sync
uv run baml-cli generate
uv run python main.py

# TypeScript
pnpm install
pnpm run generate
pnpm run dev

# BAML tests
uv run baml-cli test
```
</important>

---

## The Bottom Line

<important if="you want to ship AI that works">
1. Build infrastructure before optimizing AI components
2. Avoid unnecessary frameworks—focus on simple, controllable code
3. Use real data for testing, not synthetic examples
4. Think carefully about type safety across the full stack
5. The answer is what solves your user's problem

> "The most important thing is to make it work quickly and iterate with real user data."
</important>

---

*Condensed from 35+ episodes of AI That Works. Watch full episodes at [YouTube](https://www.youtube.com/playlist?list=PLi60mUelRAbFqfgymVfZttlkIyt0XHZjt). Join the community on [Discord](https://boundaryml.com/discord).*
