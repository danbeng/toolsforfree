---
status: testing
phase: 08-mobile-hamburger-menu
source: [08-VERIFICATION.md]
started: 2026-09-16T08:05:00Z
updated: 2026-09-16T08:05:00Z
---

## Current Test

number: 1
name: 640px vs 641px chrome
expected: |
  At 640px one header row with collapsed links; at 641px full nav and #navToggle not in tab order
awaiting: user response

## Tests

### 1. 640px vs 641px chrome
expected: At 640px one header row with collapsed links; at 641px full nav and #navToggle not in tab order
result: [pending]

### 2. Backstop one-row header
expected: Header does not wrap; overlay drops under header.site covering content rather than pushing it
result: [pending]

### 3. Open overlay
expected: Panel uses --panel fill and --border hairline; ARIA and label match open; ThemeToggle remains a header sibling
result: [pending]

### 4. Navigate from overlay
expected: Navigation occurs; the new page loads with the menu collapsed
result: [pending]

### 5. ThemeToggle while open
expected: Theme flips; menu stays open (target is inside header.site)
result: [pending]

### 6. Outside pointer close
expected: Menu closes; focus is not moved
result: [pending]

### 7. Escape close
expected: Menu closes; focus is on #navToggle
result: [pending]

### 8. Tab order closed then open
expected: Closed skip Tools/Blog/About; open hamburger → Tools → Blog → About → ThemeToggle → main (no trap)
result: [pending]

### 9. Widen force-close
expected: Overlay clears; leftover inert is gone; desktop links work
result: [pending]

### 10. First paint closed header
expected: First paint is the closed header; no skeleton, spinner, or wrapping-header flash; desktop does not flash a hamburger
result: [pending]

## Summary

total: 10
passed: 0
issues: 0
pending: 10
skipped: 0
blocked: 0

## Gaps
