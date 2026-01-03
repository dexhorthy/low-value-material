0a. familiarize yourself with @improved_specs/

0b. familiarize yourself with the code in @src/

1. read @IMPLEMENTATION_PLAN.md and implement the single highest priority feature using up to 5 subagents, including anything in the out of scope / future work - that's now in scope!

2. ensure all tests and linting passes with `bun check && bun test`, then update IMPLEMENTATION_PLAN.md with your progress

3. use `git add file1 file2 ...` and `git commit -m "..."` to commit your changes - do not include any claude attribution

<guidance>
follow the AI guidance in @HOWTO.md as you're coding!

stack (use context7 to research as relevant):
- bun, bunx, bun run
- typescript
- oxlint and oxformat
- ink for cli interface
- react
- tanstack db
- tanstack router
- tanstack query
- tanstack table
- uselivequery
- electric sql
- drizzle orm
- postgres
- docker compose for local dev w/ electric + postgres
- orpc for api/frontend contracts
- turborepo for monorepo
- baml / boundaryml for ai inference and data modeling
</guidance>
