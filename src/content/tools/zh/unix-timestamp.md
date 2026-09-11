---
locale: zh
title: Unix 时间戳转换
description: 在浏览器里把 Unix 时间与 UTC ISO 8601 互转。不会上传任何内容。
intro: 把 Unix 时间戳转成 UTC ISO 8601，或把 ISO 字符串转回 Unix 秒和毫秒。转换在本地完成，不会上传。
howTo:
  - 选择 Unix → ISO 或 ISO → Unix。
  - Unix 输入时，选择秒或毫秒。
  - 粘贴时间戳或 ISO 字符串，复制 ISO、秒和毫秒。
faq:
  - question: 我的数据会被上传吗？
    answer: 不会。转换在浏览器里完成，不会上传。
  - question: ISO 时间是 UTC 吗？
    answer: 是。输出 ISO 始终通过 toISOString() 得到 UTC（带末尾 Z）。
  - question: 为什么会提示「无效的时间戳」？
    answer: 非数字的 Unix 输入，或 Date 无法解析的 ISO 字符串，会提示「无效的时间戳」。空输入不报错。
---
