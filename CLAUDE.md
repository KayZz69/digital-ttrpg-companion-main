# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Digital TTRPG Companion is a React SPA for D&D 5e character management, combat tracking, dice rolling, and session journaling. Data is persisted in browser localStorage (no backend).

For canonical architecture details (routing, storage keys, layer structure), see `architecture.md`.

## Commands

- `npm run dev` - start Vite dev server on port 8080
- `npm run build` - production build to `dist/`
- `npm run lint` - ESLint check
- `npm test` - run Vitest once
- `npm run test:watch` - Vitest in watch mode
- Single test: `npx vitest run src/utils/diceUtils.test.ts`

## Code Style

- React function components, PascalCase filenames for components/pages, camelCase for utilities.
- Most files use 2-space indent and double quotes; some test/legacy files use 4 spaces and single quotes. Match local file style.
- Use `@/` alias imports for `src/*` paths.
- `src/components/ui/` contains shadcn/ui generated primitives; edit intentionally.

## Agent Rules (from .agent/rules/)

- Only modify files the task requires.
- Before changing public APIs or data schemas, propose a plan first.
- Favor small, focused functions and components.
- New features go in their own file/module.
- Every non-trivial change needs tests; never delete tests without approval.
- After running tests, provide a short pass/fail summary.
- Update docs (`README.md`, `architecture.md`, `AGENTS.md`) when behavior or contributor workflow changes.
