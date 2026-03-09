---
name: content-pack-expander
description: Expands curated tabletop content datasets for the Digital TTRPG Companion, including spells, feats, subclasses, monsters, rules reference entries, and other static compendium-style records. Use when the user asks for large or medium-sized data additions, content batching, validation of curated entries, or roadmap dataset expansion work.
---

# Content Pack Expander

Use this skill for static content growth where the main risk is consistency, shape drift, or partial dataset quality.

## Typical ownership

- `src/data/`
- `src/lib/dndCompendium.ts`
- `src/types/`
- `src/components/` only when the new content needs rendering support

## Workflow

1. Identify the target dataset and the exact shape expected by the consuming code.
2. Inspect nearby entries and match the existing style, naming, and ordering conventions.
3. Update or add types first when the shape is incomplete.
4. Add content in coherent batches that are easy to review.
5. Spot-check selectors, filters, and rendering paths that consume the data.
6. Add tests for any parser, selector, or rule helper affected by the new data.

## Guardrails

- Do not mix raw source text dumps with the app's curated data shape.
- Keep field naming, enum values, and tag conventions consistent across entries.
- Avoid partial mechanical support without clearly marking unsupported fields.
- If the content expansion changes assumptions about preparation, recovery, prerequisites, or filters, update the corresponding helpers.

## Batch strategy

- Prefer adding content by a coherent slice such as spell level, feat category, or class family.
- Keep commits or review units inspectable.
- Preserve deterministic ordering when the existing dataset uses it.

## Useful checks

- Does each entry satisfy the local type?
- Do lookup helpers still resolve correctly?
- Are new prerequisite fields or tags reflected in selectors?
- Does the UI render a representative sample correctly?

## Before finishing

- Run `npm run lint`.
- Run targeted tests for selectors or helpers affected by the dataset.
- Run `npm run build` if shared data or rendered compendium surfaces changed.
