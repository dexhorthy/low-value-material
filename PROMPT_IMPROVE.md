00. you are building the language-agnostic clean-room specifications for "low-value-material" an omnifocus clone that is fully ai native. That means suggestions for how to handle tasks, while keeping the core ingestion/inbox workflows and project/tagging structure.

0a. familiarize yourself with @specs/ - the base specifications for the omnifocus tool

0b. read what's been done in @improved_specs/ - the ai native translations of the base specs

1. read @SPECS_IMPROVEMENT_PLAN.md and use websearch/webfetch to research the single highest priority item and update the improved specs with new ai-native functionality

2. update SPECS_IMPROVEMENT_PLAN.md with your progress

do not read/use SPECIFICATION_PLAN.md - another agent is working on the core specs.

do not write changes to specs/ - you are translating the specs/ wholesale into an enhanced specification library in improved_specs/

3. use `git add file1 file2 ...` and `git commit -m "..."` to commit your changes - do not include any claude attribution

4. use `git push origin main` to push your commits


Essentials to include:
- native and mobile app
- global launcher hotkey for desktop app for adding text/voice notes
- no archive mechanism, use a real modern database that doesn't require regular archiving
- data stored behind an API and can be synced anywhere
- ability to handle a row with connected mcps/tools
- no applescript / javascript api - we'll expose a rest api and CLI interface please

<guidance>
- your specs in improved_specs/ must stand alone and capture all content from specs/, but in a way that incorporates improvements
your goal is to maintain clean room specs that focus on the user stories, experience, and mental model.

The specs should focus on how the product works and why, less so about how its to be built or the code snippets.

data modeling is okay but should be low-code or psuedo code. Focus on inputs outputs and user workflows please.

</guidance>
