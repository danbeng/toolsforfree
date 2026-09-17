---
status: testing
phase: 09-grid-spacing
source: [09-VERIFICATION.md]
started: 2026-09-18T04:00:00Z
updated: 2026-09-18T04:00:00Z
---

## Current Test

number: 1
name: One column below 720px
expected: |
  Home featured and each /tools/ category .card-grid are one column at 719px
awaiting: user response

## Tests

### 1. One column below 720px
expected: DevTools width 719px on / and /tools/ — home featured and each /tools/ category .card-grid are one column
result: [pending]

### 2. Two columns at 720px and 1079px; in-tool split stays two
expected: Catalog .card-grid is two columns; open /tools/markdown-preview/ (or text-diff) and confirm .tool-grid.split is still two columns, not three
result: [pending]

### 3. Three columns at 1080px (backstop)
expected: Catalog .card-grid is three columns inside --content 52rem; no card overlap; no horizontal page scroll from the grid
result: [pending]

### 4. Auth one-track at 1080px
expected: /tools/#category-auth — the single Auth card occupies the first track only and does not stretch to full wrap width
result: [pending]

### 5. Hover in both themes
expected: Title and description turn --accent; border and fill stay idle
result: [pending]

### 6. Keyboard focus
expected: Tab onto a catalog card shows the existing 2px accent outline
result: [pending]

### 7. Theme toggle on catalog
expected: Cards use that theme's --panel / --border / --text
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0
blocked: 0

## Gaps
