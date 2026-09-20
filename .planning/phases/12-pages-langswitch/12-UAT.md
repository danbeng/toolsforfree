---
status: complete
phase: 12-pages-langswitch
source: [12-VERIFICATION.md]
started: 2026-09-20T12:42:31Z
updated: 2026-09-20T13:10:00Z
---

## Current Test

number: 2
name: Header order and 640px cluster
expected: |
  Desktop order is logo, Tools/Blog/About, English/中文, ThemeToggle. At 640px LangSwitch + ThemeToggle sit on the right and LangSwitch stays visible with the hamburger closed.
awaiting: none

## Tests

### 1. LangSwitch contrast (UI-SPEC backstop)
expected: Idle and current links read as --text on --bg at >=4.5:1 in light and dark; hover is --accent on --bg at >=4.5:1; current locale is weight 600 with no accent fill, underline, or pill.
result: pass

### 2. Header order and 640px cluster
expected: Desktop order is logo, Tools/Blog/About, English/中文, ThemeToggle. At 640px LangSwitch + ThemeToggle sit on the right and LangSwitch stays visible with the hamburger closed.
result: pass

## Summary

total: 2
passed: 2
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
