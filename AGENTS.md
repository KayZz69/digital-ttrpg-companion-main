# Repository Guidelines

For system design details (routes, persistence keys, subsystem behavior), use `architecture.md` as the source of truth.

## Project Structure & Module Organization
- App code lives in `src/`.
- Route-level pages are in `src/pages/` (for example `CharacterList.tsx`, `CombatTracker.tsx`).
- Reusable UI is in `src/components/`, with shadcn primitives in `src/components/ui/` and wizard steps in `src/components/CharacterWizard/`.
- Shared logic is split across `src/hooks/`, `src/utils/`, `src/lib/`, and typed models in `src/types/`.
- Static game data is in `src/data/`; public assets are in `public/`.
- Tests currently live next to code (`src/utils/diceUtils.test.ts`) and use shared setup from `src/test/setup.ts`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start Vite dev server with hot reload.
- `npm run build`: create production build in `dist/`.
- `npm run build:dev`: build with development mode flags.
- `npm run preview`: serve the built app locally.
- `npm run lint`: run ESLint over TypeScript/React sources.
- `npm test`: run Vitest once.
- `npm run test:watch`: run Vitest in watch mode.

## Coding Style & Naming Conventions
- Language stack is TypeScript + React function components.
- Match existing style per file: many app files use 2-space indentation and double quotes; some legacy/test files use 4 spaces and single quotes. Keep local consistency when editing.
- Use PascalCase for components/pages (`CharacterView.tsx`), camelCase for functions/variables, and lowercase for utility modules (`diceUtils.ts`).
- Prefer path alias imports via `@/` for `src/*` paths.
- Run `npm run lint` before opening a PR.

## Testing Guidelines
- Framework: Vitest with `jsdom` and Testing Library (`@testing-library/jest-dom` in setup).
- Name tests `*.test.ts` or `*.test.tsx`, colocated with the source when practical.
- Cover behavior and edge cases (see `src/utils/diceUtils.test.ts` for style).
- Run `npm test` before submitting changes.

## Commit & Pull Request Guidelines
- Git history is minimal (`Initial commit`), so adopt clear imperative commits now (for example: `feat: add initiative sorting`, `fix: persist NPC edits`).
- Keep commits focused and scoped to one change.
- PRs should include: concise summary, testing notes (`npm run lint`, `npm test`), linked issue (if any), and screenshots/GIFs for UI changes.
- Call out data model or localStorage key changes explicitly (for example `soloquest_characters`).
