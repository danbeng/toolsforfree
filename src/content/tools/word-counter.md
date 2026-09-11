---
locale: en
title: Word Counter
description: Count words, characters, lines, sentences, and paragraphs in your browser. Nothing is uploaded.
intro: Paste text to count words, characters, lines, sentences, and paragraphs locally.
howTo:
  - Paste or type text into the input.
  - Read the live counts in the tiles.
  - Copy the summary with the Copy button.
faq:
  - question: Does this word counter upload my text?
    answer: No. Counting runs in your browser. Nothing is uploaded.
  - question: How are Chinese characters counted?
    answer: Words use Unicode segmentation, so each Chinese character counts as its own word instead of treating a whole paragraph as one word.
  - question: Do the counts update as I type?
    answer: Yes. Counts recompute as you type, up to the in-browser size limit.
  - question: How are sentences and paragraphs counted?
    answer: Sentences split on . ? ! and fullwidth 。？！. Paragraphs are non-empty blocks separated by a blank line.
---
