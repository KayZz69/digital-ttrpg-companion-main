# Digital TTRPG Companion

A React + TypeScript single-page app for tabletop RPG character management, combat tracking, dice rolling, and session journaling.

## Getting Started

Requirements:
- Node.js 18+
- npm

```sh
# 1) Install dependencies
npm install

# 2) Start development server
npm run dev
```

## Scripts

- `npm run dev`: start Vite dev server (port 8080)
- `npm run build`: production build to `dist/`
- `npm run build:dev`: development-mode build
- `npm run preview`: preview production build locally
- `npm run lint`: run ESLint
- `npm test`: run Vitest once
- `npm run test:watch`: run Vitest in watch mode

## Tech Stack

- Vite
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vitest + Testing Library

## Project Documentation

- `architecture.md`: canonical architecture, routes, storage keys, and module layout.
- `AGENTS.md`: contributor workflow, coding conventions, testing, and PR guidance.
- `CLAUDE.md`: concise agent-facing implementation notes and guardrails.
