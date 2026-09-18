---
status: complete
phase: 10-interactive-chrome
source: [10-VERIFICATION.md]
started: 2026-09-18T12:30:00Z
updated: 2026-09-18T13:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Copy hover / active / disabled and header icons
expected: Idle Copy transparent with accent border/text; hover invert; press darker; empty Copy 0.45 no invert; hamburger/theme toggle do not fill accent
result: pass

### 2. Keyboard focus
expected: Tab to Copy and FAQ summary — 2px --accent outline, 2px offset; Enter/Space toggles that FAQ row
result: pass

### 3. FAQ first paint / triangle / independent collapse
expected: English h2 FAQ; all closed first paint; UA triangle visible; opening one row leaves others; FAQ text is --text not muted
result: pass

### 4. Contrast AA and reduced-motion (backstop)
expected: Idle/hover/active/FAQ eyeball 4.5:1 both themes; disabled Copy stays 0.45; light hover Copy readable; prefers-reduced-motion: reduce turns color transition off
result: pass

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
