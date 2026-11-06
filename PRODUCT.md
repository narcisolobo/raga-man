# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Public. The main user is a NYT Strands player who has a few leftover letters at the end of a puzzle and can't see the last word (or last two words). They are usually on a phone, mid-puzzle, and want the answer within a second or two. They currently use anagram-solver.net, whose dated UI and poor mobile view are what this replaces.

## Product Purpose
A fast, clean, mobile-friendly anagram solver. The user types letters and sees every word that uses all of them, then can optionally expand to words that use only some of the letters. Success: on a phone, a player types their leftover letters and sees the answer quickly, with no junk words.

## Positioning
Built for the end-of-Strands moment: exact matches first, partial matches on demand and grouped by length (longest first) so a player can scan for the last two words themselves. Curated word list with no proper nouns, possessives or short words, so results are usable without filtering by eye. Entirely client-side over prebuilt data; no accounts, no backend.

## Operating Context
Phone first, desktop second. Used in short bursts, often one-handed, usually with another app (the puzzle) a swipe away. The results page works from the URL alone (shareable, refreshable); there is no client-side state beyond the DOM. Typical input is 4-12 letters, capped at 48 (a full Strands board).

## Capabilities and Constraints
- Home (`/`): one letters input and a Solve button. Results (`/results?letters=...`): normalized letters with a pencil button to edit, a link back to a fresh search, exact matches, a "Show partial matches" button.
- Partial matches: words built from a subset of the letters, length 4 or more and shorter than the input, grouped by length (longest first), alphabetical within a group, 50 words per group with "Show more". Opened automatically when there are no exact matches.
- Letters display as uppercase everywhere; underlying values and results are lowercase. Non-letters are ignored; duplicate letters are counted.
- Word list: Debian SCOWL `wamerican`, filtered to lowercase a-z, 4+ letters.
- Out of scope: Scrabble features (wildcards/blank tiles, scoring, racks), multi-word solving, words under 4 letters, accounts, history, sharing.
- Static site on Astro and TypeScript, deployed to Cloudflare Workers static assets. The home page downloads no word data; the trie loads only when partial matches are requested.

## Brand Commitments
The name is **raga-man** (an "anagram" pun) and is final. The voice is plain: short, functional interface copy with no jokes or personality in the UI text.

## Evidence on Hand
No testimonials, usage data, logos or brand assets exist. Do not fabricate any. The word data is in `data/` and built by `scripts/build-data.ts`.

## Product Principles
- Speed to the answer outranks everything: the first interaction is never slow and the exact answer appears first.
- Phone first: designed for thumbs and a small screen, then extended to desktop.
- No junk: every word shown should be one a player would plausibly accept.
- Plain and functional: the interface gets out of the way of the puzzle.
- Progressive disclosure: exact matches by default, partials on demand.

## Accessibility & Inclusion
WCAG 2.2 AA: sufficient contrast, full keyboard operation, screen reader support (live regions, labelled controls such as the "Edit letters" button), and touch targets sized for a phone.
