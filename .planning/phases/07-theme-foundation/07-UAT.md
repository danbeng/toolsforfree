---
status: testing
phase: 07-theme-foundation
source: [07-VERIFICATION.md]
started: 2026-09-16T04:05:00Z
updated: 2026-09-16T04:05:00Z
---

## Current Test

number: 1
name: FOUC with stored preference
expected: |
  Hard-refresh with localStorage.theme=light, then with theme=dark — no flash of the opposite theme; stored value paints before first paint
awaiting: user response

## Tests

### 1. FOUC with stored preference
expected: Hard-refresh with localStorage.theme=light, then with theme=dark — no flash of the opposite theme; stored value paints before first paint
result: [pending]

### 2. First visit follows OS
expected: Clear storage, emulate prefers-color-scheme light, hard-refresh; repeat with dark — theme matches OS; storage key still absent
result: [pending]

### 3. Toggle click
expected: Click #themeToggle — data-theme and icon flip immediately; localStorage.theme is written to the same literal
result: [pending]

### 4. Two-click idempotency
expected: Click twice from a known start, then a third time — two clicks restore the start; third matches the one-click theme
result: [pending]

### 5. Last click wins
expected: Click rapidly several times — html data-theme and localStorage.theme are the same light or dark literal
result: [pending]

### 6. Persistence across routes
expected: After a click, navigate / to /tools/ to /about/ — the stored theme sticks on every BaseLayout page
result: [pending]

### 7. Light grid and native widgets
expected: In light theme, inspect body grid, textarea, and scrollbar — 47px/48px --grid-line is visible; native widgets follow color-scheme light
result: [pending]

### 8. Diff hunks
expected: Open the text-diff tool in both themes — add/del hunks stay readable; eq stays muted
result: [pending]

### 9. Desktop header one row
expected: Desktop viewport — one row; 44x44 toggle after About; no wrap, collapse, or hamburger
result: [pending]

## Summary

total: 9
passed: 0
issues: 0
pending: 9
skipped: 0
blocked: 0

## Gaps
