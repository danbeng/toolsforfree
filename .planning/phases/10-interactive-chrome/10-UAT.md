---
status: testing
phase: 10-interactive-chrome
source: [10-VERIFICATION.md]
started: 2026-09-18T12:30:00Z
updated: 2026-09-18T12:30:00Z
---

## Current Test

number: 1
name: Copy hover / active / disabled and header icons
expected: |
  On /tools/json-formatter/ (or uuid) in dark then light: idle Copy transparent with accent border/text; hover fills --accent with --bg text, ~120ms, no scale; press darker than hover, no scale; empty Copy opacity 0.45 does not invert; hamburger and theme toggle stay 44px icon chrome and do not fill accent
awaiting: user response

## Tests

### 1. Copy hover / active / disabled and header icons
expected: Idle Copy transparent with accent border/text; hover invert; press darker; empty Copy 0.45 no invert; hamburger/theme toggle do not fill accent
result: [pending]

### 2. Keyboard focus
expected: Tab to Copy and FAQ summary — 2px --accent outline, 2px offset; Enter/Space toggles that FAQ row
result: [pending]

### 3. FAQ first paint / triangle / independent collapse
expected: English h2 FAQ; all closed first paint; UA triangle visible; opening one row leaves others; FAQ text is --text not muted
result: [pending]

### 4. Contrast AA and reduced-motion (backstop)
expected: Idle/hover/active/FAQ eyeball 4.5:1 both themes; disabled Copy stays 0.45; light hover Copy readable; prefers-reduced-motion: reduce turns color transition off
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
