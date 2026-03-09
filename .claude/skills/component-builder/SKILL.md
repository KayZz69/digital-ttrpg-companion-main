---
name: component-builder
description: Creates React components and pages for the Digital TTRPG Companion using TypeScript, Tailwind, and shadcn/ui while respecting route/page boundaries, local file style, and mobile-friendly layouts. Use when the user asks to build or update UI components, pages, forms, cards, dialogs, or navigation flows.
---

# Component Builder

Use this skill to create UI that matches the project's existing React, Tailwind, and shadcn patterns without leaking domain logic into page components.

## Creation checklist

1. Find the nearest comparable component or page and copy its local style.
2. Put route-level UI in `src/pages/`.
3. Put reusable feature UI in `src/components/`.
4. Keep domain logic in `src/hooks/`, `src/lib/`, or `src/utils/` when it is reusable or testable.
5. Use existing shadcn primitives from `src/components/ui/` before inventing a new primitive.
6. Make interactive elements accessible with labels, button text, or ARIA where needed.
7. Make the layout work on both desktop and mobile.

## File placement

| Use case | Path |
|----------|------|
| Route page | `src/pages/<Name>.tsx` |
| Reusable feature component | `src/components/<Name>.tsx` |
| Character creation step | `src/components/CharacterWizard/` |
| Shared hook | `src/hooks/` |
| Shared type | `src/types/` |

## Component patterns

### React and TypeScript
- Use function components.
- Match the file's existing export style.
- Type props explicitly.
- Prefer derived values over duplicated state.
- Keep side effects inside `useEffect`.

### Styling
- Use Tailwind utility classes and existing shadcn components.
- Preserve the repo's current visual language rather than importing a different one.
- Reuse spacing and card patterns from nearby pages like character, combat, and compendium views.
- Avoid inline styles unless dynamic values make them necessary.

### State boundaries
- Local presentation state can live in the component.
- Shared or reusable stateful logic should move to a hook.
- Rules computations and derived mechanics should come from shared helpers, not ad hoc JSX math.

## Preferred building blocks

Check `src/components/ui/` first for:
- `Button`
- `Card`
- `Dialog`
- `Input`
- `Label`
- `Select`
- `Tabs`
- `Textarea`

If one of those primitives fits, use it instead of a custom HTML implementation.

## Accessibility

- Buttons need visible text or `aria-label`.
- Inputs need labels.
- Dialogs and popovers should use the existing shadcn patterns.
- Do not rely on color alone for important state.

## Responsive expectations

- Verify the layout at narrow mobile widths.
- Avoid fixed-width panels unless the surrounding layout already uses them.
- Tables and dense stat blocks should degrade gracefully on smaller screens.
- For controls used in combat or dice workflows, keep tap targets practical.

## Before finishing

- Run `npm run lint`.
- Run `npm run build` if the change affects routing, page composition, or shared component exports.
- Add or update tests when the component contains non-trivial behavior.
