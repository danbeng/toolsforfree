---
locale: zh
title: JWT 解码
description: 在浏览器里解码 JWT 的 header 与 payload。不是验签。
intro: 粘贴 JWT，在本地查看 header 与 payload。本页不验证签名，也不会请求 JWKS。
howTo:
  - 把 JWT 粘贴到输入框。
  - 阅读解码后的 header 与 payload。
  - 用复制按钮拷贝 JSON。
faq:
  - question: 这个 JWT 解码器会验签吗？
    answer: 不会。它只对 header 和 payload 做 base64url 解码。解码不等于验签。
  - question: 我的 token 会被上传吗？
    answer: 不会。解码在浏览器里完成，不会上传。
  - question: 为什么会提示「不是有效的 JWT」？
    answer: JWT 有三段、用点分隔。无效的 base64url，或 header/payload 不是 JSON，也会出现这个错误。
---
