---
locale: en
title: Unix Timestamp Converter
description: Convert Unix time to UTC ISO 8601 and back in your browser. Nothing is uploaded.
intro: Convert a Unix timestamp to UTC ISO 8601, or an ISO string back to Unix seconds and milliseconds. Conversion runs locally; nothing is uploaded.
howTo:
  - Choose Unix → ISO or ISO → Unix.
  - For Unix input, pick seconds or milliseconds.
  - Paste a timestamp or ISO string and copy ISO, seconds, and milliseconds.
faq:
  - question: Is my data uploaded?
    answer: No. Conversion runs in your browser. Nothing is uploaded.
  - question: Is the ISO time UTC?
    answer: Yes. Output ISO is always UTC via toISOString() (a trailing Z).
  - question: Why do I see Invalid timestamp?
    answer: Non-numeric Unix input, or an ISO string Date cannot parse, produces Invalid timestamp. Empty input shows no error.
---
