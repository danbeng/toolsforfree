---
locale: en
title: Crontab Explainer
description: Explain a five-field cron expression in English in your browser. Nothing is uploaded.
intro: Paste a five-field cron expression and read each field in English. Explanation runs locally; nothing is uploaded. Macros such as @daily are not supported.
howTo:
  - Paste a five-field expression (minute hour day-of-month month day-of-week).
  - Read one English line per field, or the error.
  - Copy the explanation with the Copy button.
faq:
  - question: Is my data uploaded?
    answer: No. Explanation runs in your browser. Nothing is uploaded.
  - question: Why is @daily rejected?
    answer: Only five-field cron expressions are supported. Macros such as @daily are not explained.
  - question: Why is a six-field expression rejected?
    answer: Seconds (or a sixth field) are not supported. Use minute hour day-of-month month day-of-week.
  - question: What does Invalid cron field mean?
    answer: A token used letters other than *, a value outside its field range, or another unsupported form.
---
