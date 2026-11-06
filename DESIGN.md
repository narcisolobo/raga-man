---
name: raga-man
description: A newspaper-puzzle anagram solver in graphite ink on cool grey newsprint, with one pencil-blue accent.
colors:
  paper: "#e3e5e2"
  cell: "#f2f3f1"
  ink: "#121413"
  muted: "#464b48"
  pencil: "#2748a8"
  mark: "#cfd8f0"
  paper-dark: "#16191a"
  cell-dark: "#1f2324"
  ink-dark: "#e6e9e5"
  muted-dark: "#a9afab"
  pencil-dark: "#9db3f2"
  mark-dark: "#2c3a63"
typography:
  masthead:
    fontFamily: "Old Standard TT, Times New Roman, serif"
    fontSize: "clamp(2.5rem, 13vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Old Standard TT, Times New Roman, serif"
    fontSize: "1.625rem"
    fontWeight: 700
    lineHeight: 1.2
  headline-wide:
    fontFamily: "Old Standard TT, Times New Roman, serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
  letter:
    fontFamily: "Libre Franklin Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.5rem, 7vw, 2.125rem)"
    fontWeight: 700
    lineHeight: 1
  letter-wide:
    fontFamily: "Libre Franklin Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
  word-exact:
    fontFamily: "Libre Franklin Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.5rem, 7vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Libre Franklin Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  note:
    fontFamily: "Libre Franklin Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Libre Franklin Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.12em"
  button:
    fontFamily: "Libre Franklin Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.14em"
  button-secondary:
    fontFamily: "Libre Franklin Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  none: "0"
  round: "50%"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1.25rem"
  xl: "2rem"
  xxl: "2.5rem"
components:
  letter-square:
    backgroundColor: "{colors.cell}"
    textColor: "{colors.ink}"
    typography: "{typography.letter}"
    rounded: "{rounded.none}"
  letter-square-active:
    backgroundColor: "{colors.mark}"
    textColor: "{colors.ink}"
  button-solve:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    height: "4rem"
  button-solve-hover:
    backgroundColor: "{colors.pencil}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button-secondary}"
    rounded: "{rounded.none}"
    height: "3.5rem"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  link-example:
    textColor: "{colors.pencil}"
    padding: "0.5rem 0.25rem"
  link-new-search:
    textColor: "{colors.pencil}"
    height: "2.75rem"
  theme-toggle:
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    size: "2.75rem"
  theme-toggle-hover:
    backgroundColor: "{colors.mark}"
  icon-button:
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    size: "2.75rem"
  icon-button-hover:
    backgroundColor: "{colors.mark}"
  exact-row:
    textColor: "{colors.ink}"
    typography: "{typography.word-exact}"
    padding: "0.625rem 0"
  partial-word:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "0.25rem 0"
---

# Design System: raga-man

Scope: the home page `/` and the results page `/results` share one system. Tokens, base, masthead, theme toggle, letter squares, field, Solve and the secondary button live in `src/styles/global.css`, loaded through the `src/layouts/Base.astro` layout (head, pre-paint theme script, masthead). Results-only rules (lists, groups, notes, the back link) live in `src/styles/results.css` and add no new tokens; they inherit every custom property from the global sheet.

## Overview

**Creative North Star: "The Puzzle Page"**

The surface reads as a newspaper puzzle column printed in graphite on cool grey newsprint. A serif masthead sits over a double rule, the input is a row of ruled boxes like a crossword answer grid, and the only colour is a single pencil blue that marks where you are and what you can act on. Results continue the page: the same squares show the letters you hold, and the words found are set as ruled rows and columns like an answer key. It is built phone-first, one column, and quiet enough to be read in one glance mid-puzzle.

Ink-on-paper contrast does the work. There are no shadows, no radii, no gradients and no imagery; structure comes from 2px ink borders, 2px section rules, 1px list rules, a 4px double masthead rule and a 1px footer rule. The dark theme is the same page printed in reverse: warm-white ink on near-black paper, with the pencil blue lifted to a pale tint.

**Key Characteristics:**
- Cool grey paper, near-black ink, one blue accent used only for focus, hover and links.
- Hairline-to-2px ink rules and square corners throughout; no shadows.
- Serif (Old Standard TT) for the masthead and headline only; everything else is sans (Libre Franklin).
- Letters you hold are uppercase tiles in drawn squares; words found are lowercase text on ruled rows.
- Single centred column, 30rem maximum.

## Colors

A restrained two-tone palette (paper and ink) with one accent, defined as CSS custom properties and swapped wholesale for dark. Values live in the frontmatter; the dark set is suffixed `-dark` there and maps to the same custom property names in the build (`global.css`). The build also carries an `--on-ink` property (the text colour on inked plates), which equals paper in each theme.

### Primary
- **Pencil Blue** (`pencil`; dark `pencil-dark`): focus outlines, the active-square caret, the Solve hover fill, the example link and the "New search" link. Rendered as a deep ink blue on light and a pale periwinkle on dark.

### Neutral
- **Newsprint** (`paper`; dark `paper-dark`): page background, and the text colour on inked plates (Solve, hovered secondary button).
- **Cell White** (`cell`; dark `cell-dark`): the fill of each letter square, one step off the page.
- **Graphite Ink** (`ink`; dark `ink-dark`): text, every border and rule, the Solve fill, and the secondary button outline.
- **Faded Pencil** (`muted`; dark `muted-dark`): secondary copy (sub-line, counter, hint, example sentence, footer, group word counts, empty notes), the partial-column rule and the scrollbar.
- **Highlighter** (`mark`; dark `mark-dark`): the active square fill, the icon-button and theme-toggle hover, and text selection.

### Named Rules
**The One Pencil Rule.** Blue marks position and affordance only: where the caret is, what has focus, what is a link, what is about to fire. It is never a fill for decoration or a heading colour.

**The Theme Mirror Rule.** Light and dark share the same role names and the same contrast roles. Dark is selected by `prefers-color-scheme` unless the user has chosen a theme, and by `[data-theme='dark']` when they have; an explicit `light` choice wins over a dark OS setting. Never hard-code a colour outside the custom properties.

## Typography

**Display Font:** Old Standard TT (with Times New Roman, serif), 400 and 700 self-hosted via fontsource; only 700 is used.
**Body Font:** Libre Franklin Variable (with Helvetica Neue, Arial, sans-serif), self-hosted.

**Character:** A Didone-adjacent newspaper serif for the two lines that speak, and a sturdy grotesque for everything the thumb touches and every word found. The contrast is voice versus instrument.

### Hierarchy
- **Masthead** (700, `clamp(2.5rem, 13vw, 3.5rem)`, 1, -0.01em): the product name, centred.
- **Headline** (700, 1.625rem, 1.2, balanced wrap; `headline-wide` 2rem from 40rem): the home page `h1` sentence.
- **Letter** (700, `clamp(1.5rem, 7vw, 2.125rem)`, 1, uppercase, width axis 100; `letter-wide` 2.25rem from 40rem): characters in the squares, on both pages.
- **Exact word** (700, `clamp(1.5rem, 7vw, 2rem)`, 1.2, lowercase, wraps anywhere): each exact match on the results page.
- **Body** (400, 1rem, 1.5): base text, and each partial-match word.
- **Note** (400, 0.9375rem, 1.5): hint, status (600), example line, empty note (muted), error note (600).
- **Label** (700, 0.8125rem, 0.12em, uppercase): the field label, the "Your letters" label, the results section title and each partial group heading. The counter, footer and group word count use the same size at normal tracking and weight 400, muted, tabular numerals.
- **Button** (700, 1.125rem, 0.14em, uppercase): Solve.
- **Button secondary** (700, 0.9375rem, 0.14em, uppercase): Show partial matches, Show more, Cancel.

### Named Rules
**The Two Voices Rule.** Serif is reserved for the masthead and the home headline. Interface text, numerals, controls and found words stay in the sans. Counters and word counts use tabular numerals so they do not jitter.

**The Tiles and Words Rule.** Letters you hold are uppercase tiles; words found are lowercase text. Case is applied in CSS (`text-transform`), never by rewriting the data.

## Layout

One centred column, `max-width: 30rem`, with 1.25rem side padding (raised to the device safe-area insets when larger), 1.25rem top on phones and 3rem from 40rem. Home order, top to bottom: masthead with double rule, headline, field, hint, status, Solve, example line, footer. Results order: masthead, "New search" link, "Your letters" row of read-only squares with the edit pencil, the exact-match section, the Show partial matches button, then partial groups. The 8-square grid divides the row equally and stays square via aspect-ratio. Vertical rhythm is hand-set in rem steps: 0.25, 0.5, 0.625, 0.75, 0.875, 1, 1.25, 1.75, 2, 2.5; sections on the results page are separated by 2rem.

Partial groups run longest words first, one group per word length. Each group's word list flows in columns of at least 9rem with a 1.25rem gap and a 1px muted column rule, so a phone shows about two columns. Tap targets are at least 2.75rem (toggle, icon button, New search link), 3rem (Show more), 3.5rem (secondary button) and 4rem (Solve). The single breakpoint is `40rem`; below it the page is the phone layout. Body uses `100dvh` minimum height. While the exact list loads the section reserves 5.5rem so nothing jumps on arrival.

## Elevation & Depth

Flat. No shadows, blurs or gradients. Depth is conveyed by ruling alone: a 4px double ink rule under the masthead, 2px ink square borders, 2px section rules, 1px list rules, a 1px ink rule over the footer. The active square lifts only by stacking order and a fill change. Do not add drop shadows to this system.

### Named Rules
**The Ruled Paper Rule.** Separation comes from ink rules and the one-step paper to cell tone change, never from shadow.

## Shapes

Square and ruled. All corners are 0 except the circular theme toggle and icon button (50%). Letter squares overlap by 2px (negative margins) so adjacent borders collapse to a single 2px line. The Solve button has no border in the default state; the secondary button carries a 2px ink border.

## Components

### Letter field (signature component)
A grid of squares serves both pages: home `#letters` and results edit mode `#edit-input`. It is drawn over a real, transparent text input that remains the source of truth for keyboard, IME and paste.
- **Rows:** a full first row of 8 squares, then whole rows of 8 as the letters grow (capacity is the letter count plus one rounded up to a multiple of 8, capped at 48).
- **Square:** Cell White fill, 2px ink border, bold uppercase sans letter, centred.
- **Active square:** Highlighter fill, 3px inset pencil outline, 2px pencil caret blinking in 1.1s steps; the caret moves to the right edge at the final position (the 48-letter cap). Shown only while the field has focus.
- **Entry motion:** a newly typed letter rises 6px and fades in over 160ms with `cubic-bezier(0.16, 1, 0.3, 1)`.
- **No-JS fallback:** squares are hidden and the input becomes a plain 4rem tall, 2px-bordered, Cell White field with 1.5rem text.
- **Header row:** uppercase label at left, tabular counter ("0 / 48") at right, muted.

### Read-only letter squares
On the results page the same squares, with no input, caret or active state, show the letters being solved under a "Your letters" label. They are decorative to assistive tech (`aria-hidden`); the page `h1` carries the letters in text.

### Buttons
- **Solve (primary):** full-width, 4rem tall, square, Graphite Ink fill with Newsprint text, bold uppercase tracked label. Hover (pointer devices only) fills Pencil Blue. Active nudges down 1px. Focus-visible: 3px pencil outline at 3px offset. It is the only reversed plate at rest.
- **Secondary (outlined):** full-width, 3.5rem tall, square, transparent with a 2px ink border and ink text, bold uppercase tracked 0.9375rem label. Used for Show partial matches, Show more (3rem tall inside a group) and Cancel. Hover (pointer devices only) inverts to an ink fill with Newsprint text. Active nudges down 1px. Same focus ring as Solve.
- **Theme toggle:** 2.75rem circular, transparent, ink-coloured half-filled circle icon (inline SVG, 22px), positioned at the right of the masthead row. Hover fills Highlighter; pressed state mirrors the icon horizontally. It is hidden until script runs, and the choice persists in localStorage under `raga-theme`.
- **Icon button:** the theme toggle's shape and rules (2.75rem circle, transparent, Highlighter hover, pencil focus ring) for any icon-only action. The one instance is the drawn pencil that opens edit mode beside "Your letters" (inline SVG outline, 22px, `aria-label="Edit letters"`), pulled 0.5rem right so its glyph aligns with the column edge.

### Links
- **Example link:** bold uppercase-looking sample word in Pencil Blue, tracked 0.08em, 2px underline offset 4px, with 0.5rem vertical padding for tap size; same focus ring as buttons.
- **New search:** bold Pencil Blue text link at the top of the results page, underlined 2px at 4px offset, 2.75rem minimum height; same focus ring.

### Masthead
Centred serif name, a small tracked uppercase muted descriptor under it, and a 4px double ink rule closing the block. Shared by both pages through the layout.

### Status and hint
Hint is muted note text under the field; status is a live region (`role=status`) reserving 1.5rem height so the layout does not jump.

### Exact-match list
A section title (label style) over a 2px ink rule, then rows of large bold lowercase words, each on a 1px ink rule with 0.625rem vertical padding. When the input is itself a word it is hidden from this list and the heading says so: Exact matches, Other exact matches, No other exact matches, or No exact matches. The section is `aria-live="polite"`. Loading shows a plain note ("Looking up words…"); an empty result shows a muted Note; a failed lookup shows a 600-weight error note.

### Partial groups
One group per word length, longest first. Each group has a label-style heading ("N letters") on the left, a muted tabular word count on the right, and a 2px ink rule beneath. Words are 1rem body in a multi-column list with a 1px muted column rule; items never split across columns. "Show more" is a secondary button at the group's foot. The lists are not live regions: a separate screen-reader-only `role=status` announces counts, and focus moves programmatically to the group heading, a newly added word, or the empty note.

### Accessibility and motion handling
- **Page title:** one persistent screen-reader-only `h1` on results ("Results for LETTERS"); visible section titles are not headings of the page.
- **Reduced motion:** the entry animation and the caret blink are both disabled under `prefers-reduced-motion: reduce`.
- **Forced colors:** the transparent real input is kept invisible over the squares, square borders become `CanvasText`, Solve and the secondary button gain a `ButtonText` border, and the active outline becomes `Highlight`.
- **Focus:** visible 3px pencil outlines at 3px offset on every interactive element and on programmatic focus targets (group heading, partial word, empty note); the input's own outline is suppressed because the active square shows focus instead.

## Do's and Don'ts

### Do:
- **Do** take every colour from the custom properties so light and dark swap together.
- **Do** keep corners square and separate with 2px (or 4px double / 1px) ink rules.
- **Do** keep serif to the masthead and home headline and use Libre Franklin for everything else.
- **Do** keep Solve the only reversed plate at rest; further actions use the outlined secondary button.
- **Do** show found words lowercase and held letters as uppercase tiles.
- **Do** give any new animation a `prefers-reduced-motion` off switch and use the `--ease-out` curve.
- **Do** give new interactive elements and programmatic focus targets the 3px pencil focus-visible outline, and a 2.75rem minimum target for controls.
- **Do** gate hover fills behind `@media (hover: hover)`.
- **Do** put new shared rules in `global.css` and page-only rules in that page's sheet, reusing the existing custom properties.

### Don't:
- **Don't** add shadows, radii or gradients; the system is flat and square.
- **Don't** use the pencil blue as decoration, heading colour or large fill other than the Solve hover.
- **Don't** reach for pure black or pure white; ink and paper are tinted.
- **Don't** make the partial lists a live region; announce counts through the separate status.

## Not canonized

The small tracked uppercase line under the masthead ("The anagram solver") is recorded only as that one masthead descriptor; it is not a pattern for section kickers or eyebrows on future surfaces. The uppercase tracked label style is recorded for field labels, section titles and group headings as functional labels, not as a kicker pattern.
