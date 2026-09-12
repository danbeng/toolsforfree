---
status: testing
phase: 03-sql-formatter
source:
  - 03-VERIFICATION.md
started: 2026-09-13T03:40:00Z
updated: 2026-09-13T03:40:00Z
---

## Current Test

number: 1
name: 打开 /tools/sql-formatter/ 与 /zh/tools/sql-formatter/，粘贴 select * from t; 再切换方言；点 Copy；再粘贴垃圾输入
expected: |
  输出为 UPPERCASE 关键字与 2 空格缩进；切换方言立即重排；Copy 写入格式化后的 SQL；垃圾输入 EN 显示 Invalid SQL、ZH 显示 无效的 SQL；首页 featured 仍为 6
awaiting: user response

## Tests

### 1. Live paste / dialect / Copy / invalid SQL
expected: 输出为 UPPERCASE 关键字与 2 空格缩进；切换方言立即重排；Copy 写入格式化后的 SQL；垃圾输入 EN 显示 Invalid SQL、ZH 显示 无效的 SQL；首页 featured 仍为 6
result: pending

### 2. CAT-04 JsonFormatter chunk isolation
expected: 存在至少一个 JsonFormatter*.js chunk，且其中不含 nearley / formatDialect
result: pending
notes: 执行工作区 dist/_astro/JsonFormatter.DGQoUZOb.js 已 grep 为 CLEAN。主树 astro build 会被无关脏文件挡住；验收时可确认工作区证据或在干净树上重建。

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
