---
title: JWT Decoder
description: Decode a JWT header and payload in your browser. Not signature verification.
intro: Paste a JWT to inspect its header and payload locally. This page does not verify signatures or call JWKS.
howTo:
  - Paste a JWT into the input.
  - Read the decoded header and payload.
  - Copy the JSON with the Copy button.
faq:
  - question: Does this JWT decoder verify signatures?
    answer: No. It only base64url-decodes the header and payload. Decoding is not verification.
  - question: Is my token uploaded?
    answer: No. Decoding runs in your browser. Nothing is uploaded.
  - question: Why do I see Not a JWT?
    answer: A JWT has three dot-separated parts. Invalid base64url or non-JSON header/payload also produces that error.
---
