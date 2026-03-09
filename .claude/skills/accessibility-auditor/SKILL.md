---
name: accessibility-auditor
description: Audits and remediates accessibility in the Digital TTRPG Companion across React UI, shadcn dialogs, keyboard flows, live regions, focus management, and color contrast. Use when the user asks for accessibility fixes, keyboard support, ARIA improvements, dialog focus handling, or roadmap accessibility audit work.
---

# Accessibility Auditor

Use this skill when correctness includes assistive technology and keyboard usability, not just visual behavior.

## Priority surfaces

- dialogs and popovers
- combat tracker turn announcements
- dice roller result output
- forms in character creation and editing
- navigation and tab interfaces

## Workflow

1. Identify the exact interaction flow and who must be able to use it with keyboard or screen reader only.
2. Audit semantics first: labels, roles, names, headings, button text.
3. Audit focus behavior next: initial focus, focus trap, close behavior, and return focus.
4. Add live regions only where dynamic updates matter to the user.
5. Verify contrast and non-color state signaling for status-heavy UI.
6. Add tests where practical for labeling and keyboard interaction.

## Rules

- Prefer native semantics and existing shadcn patterns before custom ARIA.
- Do not add ARIA that duplicates or conflicts with native behavior.
- Make dynamic combat and dice updates understandable without relying on color or animation.
- Treat focus management as part of feature correctness, not polish.

## Common fixes

- Add missing labels or accessible names.
- Ensure icon-only buttons have `aria-label`.
- Restore focus after dialogs close.
- Announce combat turn changes or dice results with a scoped live region.
- Fix tab order and keyboard activation for custom controls.

## Verification

Check at minimum:
- Can the flow be completed with keyboard only?
- Are interactive elements discoverable by role and name?
- Does focus move predictably?
- Are important state changes announced?

## Before finishing

- Run `npm run lint`.
- Run relevant component tests.
- Run `npm run build` if shared UI primitives or page composition changed.
