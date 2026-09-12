---
locale: en
title: SQL Formatter
description: Pretty-print SQL in your browser. Nothing is uploaded.
intro: Paste SQL and choose a dialect. Formatting runs locally. This tool does not execute queries.
howTo:
  - Paste SQL into the input.
  - Choose a dialect (default Standard SQL). Output updates as you type or change dialect.
  - Copy the formatted SQL with the Copy button.
faq:
  - question: Does this SQL formatter execute my query?
    answer: No. It only pretty-prints SQL in your browser. There is no database connection and nothing is uploaded. This tool does not execute queries.
  - question: Does the tool autodetect my SQL dialect?
    answer: No. Dialect is not autodetection. The default is Standard SQL. Pick PostgreSQL, MySQL, SQLite, T-SQL, or BigQuery explicitly. Changing dialect reformats immediately.
  - question: What happens if my SQL is invalid?
    answer: The tool shows an error instead of a half-formatted result. Incomplete statements may still pretty-print because this is a formatter, not a linter.
---
