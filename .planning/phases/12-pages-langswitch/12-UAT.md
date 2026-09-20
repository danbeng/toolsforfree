---
status: testing
phase: 12-pages-langswitch
source: [12-VERIFICATION.md]
started: 2026-09-20T12:42:31Z
updated: 2026-09-20T12:42:31Z
---

## Current Test

number: 1
name: LangSwitch contrast (UI-SPEC backstop)
expected: |
  Idle and current links read as --text on --bg at >=4.5:1 in light and dark; hover is --accent on --bg at >=4.5:1; current locale is weight 600 with no accent fill, underline, or pill.
awaiting: user response

## Tests

### 1. LangSwitch contrast (UI-SPEC backstop)
expected: Idle and current links read as --text on --bg at >=4.5:1 in light and dark; hover is --accent on --bg at >=4.5:1; current locale is weight 600 with no accent fill, underline, or pill.
result: [pending]

### 2. Header order and 640px cluster
expected: Desktop order is logo, Tools/Blog/About, English/中文, ThemeToggle. At 640px LangSwitch + ThemeToggle sit on the right and LangSwitch stays visible with the hamburger closed.
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
