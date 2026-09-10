---
title: Regex Tester
description: Test a regular expression against a sample string in your browser. Nothing is uploaded.
intro: Try a pattern against a test string locally. Matches, groups, and invalid patterns stay on this page.
howTo:
  - Enter a regular expression pattern and optional flags (default g).
  - Paste a test string.
  - Read the matches (index and text plus groups) or the error.
faq:
  - question: Does this regex tester upload my data?
    answer: No. Matching runs in your browser. Nothing is uploaded.
  - question: How do capturing groups work?
    answer: An email-like pattern such as ([^@]+)@(.+) against a@b.com captures groups a and b.com.
  - question: Can I find more than one match?
    answer: Yes. With the g flag, a pattern like a+ against aa-aaa finds multiple matches (aa and aaa). Without g the tester returns at most one match.
  - question: What happens if the pattern is invalid?
    answer: A dangling backslash or other invalid pattern returns Invalid regular expression.
  - question: Is this safe for untrusted input?
    answer: Use it for typical test strings, not untrusted production workloads.
---
