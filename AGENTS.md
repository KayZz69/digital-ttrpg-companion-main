# Repository Guidelines

For system design details such as routes, persistence keys, rules baselines, and subsystem boundaries, use `ARCHITECTURE.md` as the source of truth.

## Project Structure & Module Organization

```text
src/
|-- pages/                 Route-level pages
|-- components/            Feature components and reusable UI
|   |-- ui/                shadcn/ui primitives
|   `-- CharacterWizard/   Character creation flow steps
|-- hooks/                 Custom React hooks
|-- utils/                 Pure helpers and mechanics utilities
|-- lib/                   Shared rules and compendium helpers
|-- data/                  Static 5e data and curated rules content
|-- types/                 Domain interfaces and shared types
`-- test/                  Shared test setup
public/                    Static assets
.agent/rules/              Always-on agent guidance
.claude/skills/            Task-specific local skills
```

## Build, Test & Development Commands

```bash
npm run dev         # Vite dev server
npm run build       # Production build to dist/
npm run build:dev   # Development-mode build
npm run lint        # ESLint
npm test            # Vitest once
npm run test:watch  # Vitest watch mode
```

Use targeted Vitest runs for focused work:

```bash
npx vitest run src/utils/diceUtils.test.ts
npx vitest run src/utils/combatMathUtils.test.ts
```

## Coding Style & Naming Conventions

- TypeScript + React functional components only.
- Match local file style. Most app files use 2-space indentation and double quotes; some legacy or test files use 4 spaces and single quotes.
- Use PascalCase for components and pages, camelCase for functions and variables, and lowercase for utility module filenames.
- Prefer `@/` alias imports for `src/*`.
- Keep business logic out of JSX-heavy page files when it can live in a utility, hook, or lib module.
- Favor small, focused functions and avoid "god components".
- Add short comments only when the why is non-obvious.

## Testing Guidelines

- Framework: Vitest with jsdom and Testing Library setup from `src/test/setup.ts`.
- Co-locate tests with source where practical using `*.test.ts` or `*.test.tsx`.
- New feature work should add or update tests when behavior is non-trivial.
- Never delete tests without approval. Fix or replace them instead.
- After running tests, summarize what passed, what failed, and any remaining risk.

## Commit & Pull Request Guidelines

Use concise imperative conventional commits:
- `feat:` new functionality
- `fix:` bug fixes
- `refactor:` code restructuring without behavior change
- `docs:` documentation only
- `test:` test changes
- `style:` formatting-only changes
- `chore:` tooling or maintenance

Keep commits focused to one coherent change.

### Boundaries

**Always do:**
- Follow existing patterns before introducing a new one.
- Keep changes focused. Touch only the files required for the task.
- Run `npm run lint` after code changes.
- Run `npm test` when changing logic covered by Vitest.
- Run `npm run build` before committing changes that affect routes, shared types, component exports, or app-wide UI flows.
- Update docs in the same change when behavior, contributor workflow, storage keys, or data shape changes.

**Ask first:**
- Before installing, removing, or upgrading dependencies.
- Before changing localStorage keys or persisted JSON shapes.
- Before changing route structure or navigation semantics.
- Before modifying shared 5e rules baselines.
- Before editing config, CI, deployment, or generated shadcn primitives.

**Never do:**
- Commit secrets, API keys, or environment-specific values.
- Force push to `main`.
- Mix rules/data logic directly into route components.
- Make silent breaking changes to persisted data without migration notes.

## Security & Configuration

- The app is a client-side React SPA with browser localStorage persistence only. No backend assumptions.
- Current storage keys are canonical and changing them is a breaking change unless migration logic is introduced.
- Character creation rules are anchored to the 2024 PHB-oriented datasets in `src/data/`.
- Rules logic should stay centralized:
  - `src/lib/dndRules.ts`
  - `src/lib/characterCreationRules.ts`
  - `src/lib/dndCompendium.ts`
- Progression and combat math belong in utility modules, not page components.

## Documentation Ownership

| File | Owns |
|------|------|
| `README.md` | Setup, onboarding, user-facing overview |
| `ARCHITECTURE.md` | Routes, persistence keys, subsystems, rules boundaries |
| `AGENTS.md` | Shared contributor and agent rules (this file) |
| `CLAUDE.md` | Claude-specific implementation guidance |
| `ROADMAP.md` | High-level project roadmap |
| `SPRINT.md` | Active sprint tasks and nightly handoff |
| `.agent/rules/*` | Always-on execution constraints |
| `.claude/skills/*` | Task-specific local workflows |

## Skills

Task-specific local skills live in `.claude/skills/`. Use them when the task clearly matches:

- `component-builder` for new pages, widgets, or reusable UI
- `debug-assistant` for bugs, regressions, and stack traces
- `code-review` for audits and review requests
- `git-workflow` for branching, committing, pushing, and conflict handling
- `changelog-generator` for release notes
- `feature-test-writer` for Vitest and Testing Library coverage
- `rules-content-author` for 5e data, rules helpers, and compendium-style content work

## Nightly Handoff Protocol

Kay uses a background agent (Bulhkin) that runs overnight and continues work. Maintain the Nightly Handoff section in `SPRINT.md` so Bulhkin knows what to do.

### How it works
- Bulhkin picks up the **Tonight** section in [SPRINT.md](./SPRINT.md), implements tasks on a new branch, and opens a PR.
- The **Maintenance** checklist runs every night regardless of sprint tasks.
- When finishing a session, populate **Tonight** with the immediate next 1–3 tasks only — things clearly next from what was just built, each small enough for one overnight session.
- Do NOT copy the roadmap or dump future phases into Tonight.
- After completing a sprint, move items to **Completed** and populate the next sprint from [ROADMAP.md](./ROADMAP.md).
