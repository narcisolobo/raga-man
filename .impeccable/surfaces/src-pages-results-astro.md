---
version: 1
slug: "src-pages-results-astro"
primary_target: "src/pages/results.astro"
related_targets: []
---

# Surface brief: results page (`/results?letters=...`)

## Scope and visitor mode
Operate. Inherits the Puzzle Page world in DESIGN.md; no new world and no structure roll was run (the structure is fixed by the spec and the content). Only `results.astro` is in scope, plus a shared layout and stylesheet extracted from `index.astro` so both pages use one source. Home must look and behave exactly as it does now. Build path: code-led.

## Audience, job, task
A Strands player who just pressed Solve and wants the answer in seconds; sometimes they then scan hundreds of partial words for the last two words. On a phone the submitted letters and the exact matches are visible without scrolling.

## Decisions confirmed with the user
- Words are plain text: no per-word actions (no tap-to-cross-out, no copy).
- Submitted letters appear as the home page's letter squares, read-only, filled cells only, with a pencil button; editing swaps in the same typing field and Solve plate as home.
- Partial groups are just scrolled, labelled groups: no jump links, no collapsing.
- Words display lowercase everywhere; the letters you hold are uppercase tiles.
- Edit mode gets a way out: Escape or a visible Cancel, returning focus to the pencil.
- Exact-load failure keeps today's behaviour (message, no retry).
- Each partial group shows its total word count ("212 words", "1 word") as a muted tabular label beside the heading, never inside the h3 (which stays exactly "N letters").
- A result identical to the input is hidden. Heading is "Other exact matches" when the input itself was removed and others remain; "No other exact matches" when only the input itself matched (partials then open automatically); "Exact matches" / "No exact matches" otherwise.

## Structure (top to bottom)
Shared masthead (name, theme toggle, double rule); "New search" link in pencil blue; letters row (label, pencil, read-only squares); exact section; "Show partial matches" secondary button; partial groups.

## States
Loading: a short plain line in the exact section so nothing jumps. Exact: 0 to about 10 typical. Partials: 0 shows "No partial matches"; a group can reach thousands, shown 50 at a time with "Show more". Failure: "Couldn't load the word list..." (partials keeps its retry button). 48 letters take about six rows of squares and push results down; accepted. Empty or invalid letters redirect home (unchanged).

## Direction contract

THESIS: The results are the answer key printed on the same puzzle page: your tiles on top, then ruled rows of words. It refuses the category default of a plain bullet list under a heading.

OWN-WORLD: The recorded Puzzle Page system unchanged: cool grey newsprint, graphite ink, ruled borders, square corners, one pencil blue for affordance only, Old Standard TT for the masthead and Libre Franklin for everything else. Adds one component: the outlined secondary button.

STORY: The visitor sees their letters, finds the exact words at once, and opens partials only if needed.

FIRST VIEWPORT: At 390 wide: masthead; "New search"; the label row with the pencil; the read-only squares; then the exact heading and its words as large bold lowercase rows separated by 1px ink rules; the outlined partials button follows within reach of the thumb.

FORM: Inherited Puzzle Page world; no structure roll run. seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved decisions
- Column width for partial lists and how very long words wrap.
- Exact-section loading copy.
