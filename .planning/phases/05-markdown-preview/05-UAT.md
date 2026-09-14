---
status: testing
phase: 05-markdown-preview
source:
  - 05-VERIFICATION.md
started: 2026-09-14T05:35:00Z
updated: 2026-09-14T05:35:00Z
---

## Current Test

number: 1
name: Live GFM preview / blank idle / XSS-img / Copy / too-large
expected: |
  分栏源码在左/上、预览在右/下（720px 并排）；粘贴标题/列表/表格/任务/代码块后 .md-preview 即时渲染，无 Generate 按钮；空源码预览空白且无 Start typing；粘贴 script 与远程图片无弹窗、无网络拉图、无裂图图标；Copy 写入净化后的 HTML 而非源 Markdown；过长输入 EN 显示 Input too large to process in the browser.、ZH 显示 输入过长，无法在浏览器中处理。；首页 featured 仍为 6
awaiting: user response

## Tests

### 1. Live GFM preview / blank idle / XSS-img / Copy / too-large
expected: 分栏源码在左/上、预览在右/下（720px 并排）；粘贴标题/列表/表格/任务/代码块后 .md-preview 即时渲染，无 Generate 按钮；空源码预览空白且无 Start typing；粘贴 script 与远程图片无弹窗、无网络拉图、无裂图图标；Copy 写入净化后的 HTML 而非源 Markdown；过长输入 EN 显示 Input too large to process in the browser.、ZH 显示 输入过长，无法在浏览器中处理。；首页 featured 仍为 6
result: [pending]

## Summary

total: 1
passed: 0
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps
