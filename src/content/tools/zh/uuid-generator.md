---
locale: zh
title: UUID 生成
description: 用 crypto.randomUUID() 在浏览器里生成 UUID v4。不会上传任何内容。
intro: 在本地生成 UUID v4。打开页面时会生成一个；再点「生成」可得到下一个。不会上传。
howTo:
  - 打开页面，会自动生成一个 UUID v4。
  - 用复制按钮拷贝 UUID。
  - 再点「生成」得到下一个。
faq:
  - question: 这是哪个版本的 UUID？
    answer: 只生成 v4。值来自浏览器的 crypto.randomUUID()。
  - question: 我的数据会被上传吗？
    answer: 不会。生成在浏览器本地完成，不会上传。
  - question: 可以一次生成很多个吗？
    answer: 不可以。这不是批量生成器。每次需要新 UUID 时再点「生成」。
---
