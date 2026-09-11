---
locale: zh
title: 密码生成器
description: 在本地用 Web Crypto 生成密码。不会上传任何内容。
intro: 在浏览器里生成可复制的密码。长度和字符集都留在本页，不会上传或保存。
howTo:
  - 设置 8 到 128 的长度（默认 16）并选择字符集。
  - 可选排除相似字符，例如 i、l、1、O 和 0。
  - 生成后用复制按钮拷贝密码。
faq:
  - question: 这个密码生成器会上传或保存密码吗？
    answer: 不会。生成在浏览器里用 Web Crypto 完成。这不是密码管理器，不会存储或上传任何内容。
  - question: 如果关掉所有字符集会怎样？
    answer: 生成会显示错误，而不是空白的成功结果。请至少选择一种字符集。
  - question: 密码有多随机？
    answer: 字符集下标使用 crypto.getRandomValues 并配合拒绝采样，余数无偏。不会使用 Math.random。
  - question: 允许多长？
    answer: 长度必须在 8 到 128 之间。默认是 16。
---
