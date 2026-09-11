---
locale: zh
title: 哈希生成
description: 用 Web Crypto 在浏览器里生成 SHA-256 与 SHA-1。不会上传任何内容。
intro: 在本地用 SHA-256 或 SHA-1 对文本做哈希。摘要通过 Web Crypto 在浏览器里计算，不会上传。不提供 MD5。
howTo:
  - 选择 SHA-256 或 SHA-1。
  - 在输入框输入或粘贴文本。空输入会对空字符串做哈希。
  - 用复制按钮拷贝小写十六进制摘要。
faq:
  - question: 我的数据会被上传吗？
    answer: 不会。哈希在浏览器里用 Web Crypto 完成，不会上传。
  - question: SHA-1 和 SHA-256 有什么区别？
    answer: SHA-256 是 256 位摘要，也是默认选项。SHA-1 是 160 位，留给需要兼容旧系统的场景。新项目请优先用 SHA-256。
  - question: 为什么没有 MD5？
    answer: 不提供 MD5。本工具只用 Web Crypto，它支持 SHA-1 和 SHA-256，不支持 MD5。
---
