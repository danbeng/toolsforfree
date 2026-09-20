# Phase 13: Islands without LED - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-20
**Phase:** 13-Islands without LED
**Areas discussed:** No-LED ToolShell chrome, Later-eight copy path, ToolIsland locale contract, Original-ten land vs rewrite

---

## No-LED ToolShell chrome

| Option | Description | Selected |
|--------|-------------|----------|
| HEAD layout + locale Copy/Copied | Clone HEAD (no LED); add required locale; localize Copy/Copied | ✓ |
| Keep dirty LED chrome | Commit tool-panel__chrome / led / chromeLocal | |
| chromeLocal without LED | Runs locally strip, no LED | |

**User's choice:** 所有的你做决定
**Notes:** Locked D-Shell — HEAD structure, no LED, required locale, copy.copy / copy.copied.

---

## Later-eight copy path

| Option | Description | Selected |
|--------|-------------|----------|
| ISLE-03 original ten only; later eight keep t(locale) | Equivalent allowed; every ToolShell must get locale | ✓ |
| Force useToolUi on all 18 | Rewrite later eight | |

**User's choice:** 所有的你做决定
**Notes:** WordCounter (and any later-eight) that omit ToolShell locale must add it because ToolShell locale becomes required.

---

## ToolIsland locale contract

| Option | Description | Selected |
|--------|-------------|----------|
| Required locale, pass to all 18 | Drop optional default en | ✓ |
| Keep optional locale default en | Original ten still omit the prop | |

**User's choice:** 所有的你做决定

---

## Original-ten land vs rewrite

| Option | Description | Selected |
|--------|-------------|----------|
| Land dirty useToolUi islands | Do not rewrite from HEAD English-only | ✓ |
| Rewrite from HEAD | Discard dirty locale wiring | |

**User's choice:** 所有的你做决定

---

## Claude's Discretion

All four gray areas — user said decide all of them.

## Deferred Ideas

- CI / overlay-free build — Phase 14
- chromeLocal strip — not this milestone
