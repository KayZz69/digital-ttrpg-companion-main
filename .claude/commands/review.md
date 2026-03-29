Perform a full structured code review of ALL files in src/:
- Security: injection, auth gaps, data exposure
- Correctness: logic bugs, edge cases, wrong assumptions
- TypeScript: type safety, any abuse, missing types
- Code quality: duplication, dead code, naming, complexity
- Performance: N+1 queries, unnecessary re-renders, blocking ops

Output a prioritized findings table: Critical / High / Medium / Low.
For every Critical and High finding, include the exact file + line and a concrete fix suggestion.
Do NOT fix anything â€” review only.
