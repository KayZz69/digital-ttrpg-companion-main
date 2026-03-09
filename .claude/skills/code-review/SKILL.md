---
name: code-review
description: Reviews code for correctness, rules integrity, persistence safety, test coverage, and maintainability in the Digital TTRPG Companion. Use when the user asks for a review, PR audit, diff review, or code-quality assessment.
---

# Code Review

Review in this order:

1. Correctness
2. Persistence and data safety
3. Rules integrity
4. Test coverage
5. Maintainability
6. Style

## 1. Correctness

- Check whether the change actually does what it claims.
- Look for unhandled null and undefined paths.
- Verify route params, IDs, and list keys are used consistently.
- Confirm edits, deletes, and updates target the correct entity.

## 2. Persistence and data safety

- Treat localStorage keys and JSON shape as compatibility contracts.
- Flag any breaking storage change without migration notes.
- Check that state updates do not accidentally drop unrelated persisted fields.
- Watch for shallow copies where nested mutation could corrupt saved data.

## 3. Rules integrity

- Validate that rules logic still matches the architecture baseline.
- Check spell slots, prepared or known spells, ASI application, proficiencies, and combat math carefully.
- Verify static data changes in `src/data/` align with the helpers that consume them.
- Flag duplicated business rules in UI files when a shared module should own them.

## 4. Test coverage

- New mechanics or utility behavior should usually have Vitest coverage.
- Bug fixes should preferably include a regression test.
- Call out missing tests when a change affects persistence, combat math, progression, or form validation.

## 5. Maintainability

- Prefer focused functions over large multi-purpose blocks.
- Check whether shared logic should be extracted to `src/lib/`, `src/utils/`, or a hook.
- Flag dead code, misleading names, and duplicated logic.

## 6. Style

- Match local file conventions for indentation and quotes.
- Prefer `@/` imports for `src/*`.
- Keep comments short and only for non-obvious intent.

## Output format

Findings first, ordered by severity, with file references and concise rationale. After findings:
- Open questions or assumptions
- Brief change summary or residual risk if needed

If there are no findings, say so explicitly and mention any remaining testing gaps.
