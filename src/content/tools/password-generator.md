---
locale: en
title: Password Generator
description: Generate a password locally with Web Crypto. Nothing is uploaded.
intro: Generate a copyable password in your browser. Length and character sets stay on this page; nothing is uploaded or stored.
howTo:
  - Set a length between 8 and 128 (default 16) and choose character sets.
  - Optionally exclude similar characters such as i, l, 1, O, and 0.
  - Generate, then copy the password with the Copy button.
faq:
  - question: Does this password generator upload or store my password?
    answer: No. Generation runs in your browser with Web Crypto. This is not a password manager and nothing is stored or uploaded.
  - question: What happens if I turn off every character set?
    answer: Generate shows an error instead of an empty success string. Select at least one character set.
  - question: How random are the passwords?
    answer: Indexes into the charset use crypto.getRandomValues with rejection sampling so the remainder is unbiased. Math.random is not used.
  - question: What length is allowed?
    answer: Length must be between 8 and 128. The default is 16.
---
