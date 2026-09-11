---
locale: zh
title: Base64 编码 / 解码
description: 在浏览器里编码或解码 Base64。不会上传任何内容。
intro: 在本地把文本转成 Base64，或把 Base64 转回文本。请明确选择编码或解码；数据不会离开本页。
howTo:
  - 选择编码或解码。
  - 把文本或 Base64 粘贴到输入框。
  - 用复制按钮拷贝结果。
faq:
  - question: 我的数据会被上传吗？
    answer: 不会。编码和解码都在浏览器里完成，不会上传。
  - question: 编码和解码有什么区别？
    answer: 编码把 UTF-8 文本变成 Base64。解码把 Base64 变回文本。请用模式开关，工具不会猜测。
  - question: 为什么会提示「无效的 Base64」？
    answer: 解码只接受标准 Base64。字母表外的字符、错误的填充或截断的字符串都会产生这个错误。
---
