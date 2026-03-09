---
name: feature-test-writer
description: Writes and updates Vitest and Testing Library tests for utilities, hooks, and React UI in the Digital TTRPG Companion. Use when the user asks to add coverage, create regression tests, or verify behavior changes.
---

# Feature Test Writer

This project uses Vitest with jsdom and Testing Library. Favor fast, focused tests over broad end-to-end simulations.

## Test locations

- Co-locate tests next to the source where practical.
- Use `*.test.ts` for utilities and `*.test.tsx` for React components.
- Shared setup lives in `src/test/setup.ts`.

## Priority targets

1. Pure utilities in `src/utils/`
2. Rules helpers in `src/lib/`
3. Hooks with meaningful branching behavior
4. UI components with important interaction or rendering logic

## Utility test pattern

```ts
import { describe, expect, it } from "vitest";
import { someHelper } from "@/utils/someHelper";

describe("someHelper", () => {
  it("handles the primary case", () => {
    expect(someHelper(input)).toEqual(expected);
  });
});
```

## Component test pattern

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders the expected state", async () => {
    render(<MyComponent />);

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });
});
```

## What to cover

- Happy path behavior
- Edge cases and invalid inputs
- Regression cases for fixed bugs
- Rules boundaries such as proficiency matching, ASI validation, spell limits, and concentration math
- Persistence-aware behavior when the code reads or writes localStorage

## LocalStorage testing

When testing persistence behavior:
- Seed only the keys needed for the test.
- Reset localStorage between tests.
- Assert both the in-memory behavior and the stored result when relevant.

## Good test design

- Prefer public behavior over implementation details.
- Use semantic queries from Testing Library where possible.
- Avoid snapshot-heavy tests for dynamic UI.
- Keep each test focused on one behavior.

## Verification

Run the narrowest useful command first, then broaden if needed:

```bash
npx vitest run src/utils/spellUtils.test.ts
npx vitest run src/utils/progressionUtils.test.ts
npm test
```
