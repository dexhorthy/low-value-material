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
