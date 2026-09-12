---
locale: zh
title: SQL 格式化
description: 在浏览器里美化打印 SQL。不会上传任何内容。
intro: 粘贴 SQL 并选择方言。格式化在本地完成。这个工具不是执行器。
howTo:
  - 把 SQL 粘贴到输入框。
  - 选择方言（默认 Standard SQL）。输入或切换方言时输出会立即更新。
  - 用复制按钮拷贝格式化后的 SQL。
faq:
  - question: 这个 SQL 格式化工具会执行查询吗？
    answer: 不会。它只在浏览器里美化打印 SQL。没有数据库连接，也不会上传任何内容。这个工具不是执行器。
  - question: 工具会自动检测 SQL 方言吗？
    answer: 不会。方言不是自动检测。默认是 Standard SQL。请显式选择 PostgreSQL、MySQL、SQLite、T-SQL 或 BigQuery。切换方言会立即重新格式化。
  - question: 如果 SQL 无效会怎样？
    answer: 工具会显示错误，而不是半格式化的结果。不完整的语句仍可能被美化打印，因为这是格式化器，不是检查器。
---
