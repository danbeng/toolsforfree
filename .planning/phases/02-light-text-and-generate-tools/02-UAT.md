---
status: testing
phase: 02-light-text-and-generate-tools
source:
  - 02-VERIFICATION.md
started: 2026-09-12T03:20:00Z
updated: 2026-09-12T03:20:00Z
---

## Current Test

number: 1
name: 打开 /tools/word-counter/ 与 /zh/tools/word-counter/，输入英文和「你好世界」
expected: |
  六块磁贴随输入更新（词/含空格字符/不含空格字符/行/句/段）；CJK 不是 1 词；Copy 复制摘要；首页精选仍为 6
awaiting: user response

## Tests

### 1. 字数统计 EN/ZH 磁贴与 CJK
expected: 六块磁贴随输入更新（词/含空格字符/不含空格字符/行/句/段）；CJK 不是 1 词；Copy 复制摘要；首页精选仍为 6
result: pending

### 2. 大小写转换九行与汉字 slug
expected: 九行输出出现；单行 Copy 写入剪贴板；slug 行非空且含汉字；首页精选仍为 6
result: pending

### 3. Lorem 词/段/经典开头与中文 chrome
expected: 正文为拉丁文；中文页 chrome 为中文、正文仍为拉丁文；Copy 可用；精选仍为 6
result: pending

### 4. 密码挂载生成、Copy、空字符集错误
expected: 加载即生成；可复制；再生成会变；空字符集报错而非空白成功；中文页显示「请至少选择一种字符集」；首页精选 6、目录 14 个工具
result: pending

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
