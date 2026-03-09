---
name: changelog-generator
description: Converts recent Git history into concise user-facing release notes for the Digital TTRPG Companion. Use when the user asks for a changelog, release notes, or a summary of recent changes.
---

# Changelog Generator

Turn technical history into plain-language release notes.

## Process

### 1. Gather history

Use one of:

```bash
git log --oneline -20
git log --oneline --since="2 weeks ago"
git log --oneline <old-ref>..<new-ref>
```

### 2. Group changes

Suggested sections:
- New features
- Improvements
- Bug fixes
- Rules/data updates
- Documentation

Skip purely internal changes unless the user wants a full engineering log.

### 3. Translate into user language

- Lead with the user-visible effect.
- Avoid implementation jargon when writing release notes.
- Mention changed game behavior explicitly when mechanics, progression, or compendium data changed.

Example:

- Technical: `fix(progression): reject split ASI selections with duplicate abilities`
- User-facing: `Fixed level-up ASI handling so invalid split selections no longer apply incorrect ability increases.`

### 4. Format

Default format:

```markdown
# Changelog - <version or date range>

## New features
- ...

## Improvements
- ...

## Bug fixes
- ...
```

Keep the tone direct and concise.
