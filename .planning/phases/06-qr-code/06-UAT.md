---
status: testing
phase: 06-qr-code
source:
  - 06-VERIFICATION.md
started: 2026-09-14T10:40:00Z
updated: 2026-09-14T10:40:00Z
---

## Current Test

number: 1
name: Live QR generate / idle blank / PNG download / file decode / Copy / no camera
expected: |
  Generate 在上、Decode 在下；文本/纠错左或上、256×256 预览右或下；输入 URL 后即时黑白模块、无 Generate 按钮；清空后预览空白、Download 禁用、无示例码；Download 为 qr-code.png 不是 GIF；选刚生成的 PNG 后 Copy 写入解码文本；过大图片 ZH 显示 图片过大，无法在浏览器中处理。、EN 显示 Image is too large to process in the browser.；无摄像头提示；首页 featured 仍为 6
awaiting: user response

## Tests

### 1. Live QR generate / idle blank / PNG download / file decode / Copy / no camera
expected: Generate 在上、Decode 在下；文本/纠错左或上、256×256 预览右或下；输入 URL 后即时黑白模块、无 Generate 按钮；清空后预览空白、Download 禁用、无示例码；Download 为 qr-code.png 不是 GIF；选刚生成的 PNG 后 Copy 写入解码文本；过大图片 ZH 显示 图片过大，无法在浏览器中处理。、EN 显示 Image is too large to process in the browser.；无摄像头提示；首页 featured 仍为 6
result: [pending]

## Summary

total: 1
passed: 0
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps
