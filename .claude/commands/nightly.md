Run a full nightly maintenance pass on this repo:
1. Run lint (and tests if available) - report any failures but do not fix them unless trivial
2. Do a structured code review of ALL files in src/ - security, correctness, dead code, code smells
3. Check project status against SPRINT.md - what's done, what's next
4. Write a summary report to ./reports/nightly-\.md (create reports/ dir if needed)
5. Commit the report file with message: "chore: nightly report \"

Scope: entire codebase, not just recent changes.
