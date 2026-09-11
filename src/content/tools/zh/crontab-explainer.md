---
locale: zh
title: Crontab 说明
description: 在浏览器里用中文解释五段 cron 表达式。不会上传任何内容。
intro: 粘贴五段 cron 表达式，阅读每个字段的中文说明。解释在本地完成，不会上传。不支持 @daily 这类宏。
howTo:
  - 粘贴五段表达式（分钟 小时 日期 月份 星期）。
  - 阅读每个字段一行说明，或查看错误。
  - 用复制按钮拷贝说明。
faq:
  - question: 我的数据会被上传吗？
    answer: 不会。解释在浏览器里完成，不会上传。
  - question: 为什么 @daily 会被拒绝？
    answer: 仅支持五段 cron 表达式。不解释 @daily 这类宏。
  - question: 为什么六段表达式会被拒绝？
    answer: 不支持秒（或第六段）。请使用：分钟 小时 日期 月份 星期。
  - question: 「无效的 cron 字段」是什么意思？
    answer: 某段用了 * 以外的字母、超出该字段范围，或使用了其他不支持的写法。
---
