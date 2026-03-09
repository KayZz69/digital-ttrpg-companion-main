---
trigger: always_on
---

# Tests and verification

## Always verify non-trivial changes
- For any bug fix or feature with logic, add or update tests when practical and then run the relevant verification commands.
- Never delete tests unless explicitly approved. Prefer fixing or replacing them.

## Choose the right checks
- Run `npm run lint` after code changes.
- Run `npm test` for utility, rules, hook, and behavior changes that have or should have coverage.
- Run `npm run build` when changes affect routing, shared types, app composition, or exported components.

## Report what you checked
- After verification, give a short summary of what you ran, what passed or failed, and any remaining risks.
