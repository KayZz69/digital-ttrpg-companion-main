---
trigger: always_on
---

# Code style and structure

## Match existing code
- Follow the existing style in this project for naming, formatting, and file layout. If unsure, copy the style of nearby files.
- Preserve public APIs unless the task requires changing them.
- Favor small, focused functions and components with one clear responsibility.

## Keep layers separate
- Respect existing boundaries between pages, components, hooks, utils, lib modules, types, and static data.
- Put rules, progression, and combat logic in shared modules instead of embedding them in route components.
- Prefer extending an existing utility or lib module over duplicating logic in the UI.

## Modular changes
- New features should go into their own file or module when practical.
- Avoid large refactors unless the task explicitly calls for them.
- If a file is becoming multi-purpose, propose a split instead of continuing to grow it blindly.

## Stable contracts first
- Before changing route contracts, public props, persisted data shapes, or shared type definitions used broadly across the app, propose a short plan and get approval.
- If a change could break existing callers or stored user data, prefer a backward-compatible path where possible.
