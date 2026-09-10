---
title: Hash Generator
description: Generate SHA-256 and SHA-1 hashes in your browser with Web Crypto. Nothing is uploaded.
intro: Hash text locally with SHA-256 or SHA-1. Digests run in your browser via Web Crypto; nothing is uploaded. MD5 is not offered.
howTo:
  - Choose SHA-256 or SHA-1.
  - Type or paste text into the input. Empty input hashes the empty string.
  - Copy the lowercase hex digest with the Copy button.
faq:
  - question: Is my data uploaded?
    answer: No. Hashing runs in your browser with Web Crypto. Nothing is uploaded.
  - question: What is the difference between SHA-1 and SHA-256?
    answer: SHA-256 is a 256-bit digest and is the default. SHA-1 is a 160-bit digest kept for compatibility with older systems. Prefer SHA-256 for new work.
  - question: Why is there no MD5?
    answer: MD5 is not provided. This tool uses Web Crypto only, which supports SHA-1 and SHA-256, not MD5.
---
