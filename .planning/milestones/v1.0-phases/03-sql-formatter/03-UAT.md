---
status: complete
phase: 03-sql-formatter
source:
  - 03-VERIFICATION.md
started: 2026-09-13T03:40:00Z
updated: 2026-09-13T04:10:00Z
---

## Current Test

number: 2
name: CAT-04 JsonFormatter chunk isolation
expected: |
  存在至少一个 JsonFormatter*.js chunk，且其中不含 nearley / formatDialect
awaiting: none

## Tests

### 1. Live paste / dialect / Copy / invalid SQL
expected: 输出为 UPPERCASE 关键字与 2 空格缩进；切换方言立即重排；Copy 写入格式化后的 SQL；垃圾输入 EN 显示 Invalid SQL、ZH 显示 无效的 SQL；首页 featured 仍为 6
result: pass

### 2. CAT-04 JsonFormatter chunk isolation
expected: 存在至少一个 JsonFormatter*.js chunk，且其中不含 nearley / formatDialect
result: pass
notes: 执行工作区 dist/_astro/JsonFormatter.DGQoUZOb.js grep CLEAN；用户验收 All good。

## Summary

total: 2
passed: 2
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
