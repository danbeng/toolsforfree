---
status: complete
phase: 08-mobile-hamburger-menu
source: [08-VERIFICATION.md]
started: 2026-09-16T08:05:00Z
updated: 2026-09-16T08:30:00Z
---

## Current Test

number: 10
name: First paint closed header
expected: |
  First paint is the closed header; no skeleton, spinner, or wrapping-header flash; desktop does not flash a hamburger
awaiting: none

## Tests

### 1. 640px vs 641px chrome
expected: At 640px one header row with collapsed links; at 641px full nav and #navToggle not in tab order
result: pass

### 2. Backstop one-row header
expected: Header does not wrap; overlay drops under header.site covering content rather than pushing it
result: pass

### 3. Open overlay
expected: Panel uses --panel fill and --border hairline; ARIA and label match open; ThemeToggle remains a header sibling
result: pass

### 4. Navigate from overlay
expected: Navigation occurs; the new page loads with the menu collapsed
result: pass

### 5. ThemeToggle while open
expected: Theme flips; menu stays open (target is inside header.site)
result: pass

### 6. Outside pointer close
expected: Menu closes; focus is not moved
result: pass

### 7. Escape close
expected: Menu closes; focus is on #navToggle
result: pass

### 8. Tab order closed then open
expected: Closed skip Tools/Blog/About; open hamburger → Tools → Blog → About → ThemeToggle → main (no trap)
result: pass

### 9. Widen force-close
expected: Overlay clears; leftover inert is gone; desktop links work
result: pass

### 10. First paint closed header
expected: First paint is the closed header; no skeleton, spinner, or wrapping-header flash; desktop does not flash a hamburger
result: pass

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
