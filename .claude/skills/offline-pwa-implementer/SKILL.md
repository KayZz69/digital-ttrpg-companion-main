---
name: offline-pwa-implementer
description: Adds and refines Progressive Web App behavior for the Digital TTRPG Companion, including service worker strategy, manifest setup, installability, offline UX, cache safety, and connectivity awareness. Use when implementing roadmap PWA and offline support or when requests involve manifest files, offline indicators, cached assets, or resilient table-side usage without network access.
---

# Offline PWA Implementer

Use this skill for offline-first client behavior that must remain safe with localStorage persistence and static asset caching.

## Focus areas

- web app manifest
- service worker registration and update behavior
- app shell and static asset caching
- offline or reconnect indicators
- install prompt UX

## Workflow

1. Identify which assets and routes must work offline.
2. Choose conservative caching behavior before aggressive caching behavior.
3. Keep mutable user data separate from static asset caching assumptions.
4. Add clear UX for offline state and service worker updates.
5. Verify app startup, navigation, and core workflows with no network.

## Guardrails

- Do not cache dynamic user data in a way that risks stale or conflicting writes.
- Prefer predictable app shell caching over broad runtime caching.
- Treat service worker updates as a user-visible lifecycle issue.
- Keep offline indicators informative but not noisy.

## Typical outputs

- manifest additions under `public/`
- service worker setup tied to the Vite app
- online or offline status hook or indicator component
- minimal installability UI

## Verification checklist

- App loads after first successful visit with network disabled.
- Core localStorage-backed flows still work offline.
- Updated builds do not strand the user on stale assets silently.
- Manifest metadata is coherent for installability.

## Before finishing

- Run `npm run lint`.
- Run relevant tests if utility or hook behavior was added.
- Run `npm run build` because PWA work affects production output directly.
