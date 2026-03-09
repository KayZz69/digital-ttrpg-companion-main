---
name: release-readiness-checker
description: Verifies that a Digital TTRPG Companion change is ready to merge or ship by checking required commands, test scope, build stability, documentation updates, regression risk, and roadmap milestone criteria. Use when the user asks for a release check, milestone verification, pre-merge validation, or a concise risk summary after feature work.
---

# Release Readiness Checker

Use this skill to turn "I think it is done" into a concrete verification pass.

## Baseline checks

- `npm run lint`
- `npm test` when logic or covered behavior changed
- `npm run build` when routes, shared exports, shared types, or app-wide flows changed
- manual regression checks for the touched feature path
- docs updates when architecture, storage, or contributor workflow changed

## Workflow

1. Identify the change surface and the commands required by `AGENTS.md`.
2. Run the narrowest relevant automated checks first, then broaden as needed.
3. Review changed files for doc, test, and persistence implications.
4. Summarize findings in order of severity, then note residual risk and gaps.
5. Call out anything not run or not validated.

## What to report

- commands run and whether they passed
- bugs or regressions found
- missing tests or missing docs
- persisted data or migration risk
- manual verification still recommended

## Roadmap-aware review

For roadmap milestone work, check:
- build passes
- tests pass
- lint passes
- manual feature flow was exercised
- adjacent existing flows still behave
- docs were updated if architectural boundaries changed

## Review mindset

- Prioritize correctness and regression risk over style commentary.
- Treat missing verification as a real risk, not a footnote.
- Be explicit about assumptions when full validation is not possible.

## Before finishing

- Provide a short merge-readiness verdict.
- Separate confirmed issues from residual risk.
- Mention unrun commands or blocked validation plainly.
