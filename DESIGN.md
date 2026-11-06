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
  letter:
    fontFamily: "Libre Franklin Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.5rem, 7vw, 2.125rem)"
    fontWeight: 700
    lineHeight: 1
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
  link-example:
    textColor: "{colors.pencil}"
    padding: "0.5rem 0.25rem"
  theme-toggle:
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    size: "2.75rem"
  theme-toggle-hover:
    backgroundColor: "{colors.mark}"
---

# Design System: raga-man

Scope: only the home page `/` is built and styled. The results page (`src/pages/results.astro`) is deliberately unstyled and is not yet part of this system; nothing here describes it. All styling currently lives in one global `<style>` block in `src/pages/index.astro`, with tokens as custom properties on `:root`.

## Overview

**Creative North Star: "The Puzzle Page"**

The surface reads as a newspaper puzzle column printed in graphite on cool grey newsprint. A serif masthead sits over a double rule, the input is a row of ruled boxes like a crossword answer grid, and the only colour is a single pencil blue that marks where you are and what you can act on. It is built phone-first, one column, and quiet enough to be read in one glance mid-puzzle.

Ink-on-paper contrast does the work. There are no shadows, no radii, no gradients and no imagery; structure comes from 2px ink borders, a 4px double masthead rule and a 1px footer rule. The dark theme is the same page printed in reverse: warm-white ink on near-black paper, with the pencil blue lifted to a pale tint.

**Key Characteristics:**
- Cool grey paper, near-black ink, one blue accent used only for focus, hover and the example link.
- Hairline-to-2px ink rules and square corners throughout; no shadows.
- Serif (Old Standard TT) for the masthead and headline only; everything interactive is sans (Libre Franklin).
- Letters are typed into a drawn grid of squares over a real input.
- Single centred column, 30rem maximum.

## Colors

A restrained two-tone palette (paper and ink) with one accent, defined as CSS custom properties and swapped wholesale for dark. Values live in the frontmatter; the dark set is suffixed `-dark` there and maps to the same custom property names in the build.

### Primary
- **Pencil Blue** (`pencil`; dark `pencil-dark`): focus outlines, the active-square caret, the Solve hover fill, and the example link. Rendered as a deep ink blue on light and a pale periwinkle on dark.

### Neutral
- **Newsprint** (`paper`; dark `paper-dark`): page background, and the text colour on the inverted Solve button in light.
- **Cell White** (`cell`; dark `cell-dark`): the fill of each letter square, one step off the page.
- **Graphite Ink** (`ink`; dark `ink-dark`): text, every border and rule, and the Solve button fill.
- **Faded Pencil** (`muted`; dark `muted-dark`): secondary copy (sub-line, counter, hint, example sentence, footer) and the scrollbar.
- **Highlighter** (`mark`; dark `mark-dark`): the active square fill, the theme-toggle hover, and text selection.

### Named Rules
**The One Pencil Rule.** Blue marks position and affordance only: where the caret is, what has focus, what is a link, what is about to fire. It is never a fill for decoration or a heading colour.

**The Theme Mirror Rule.** Light and dark share the same role names and the same contrast roles. Dark is selected by `prefers-color-scheme` unless the user has chosen a theme, and by `[data-theme='dark']` when they have; an explicit `light` choice wins over a dark OS setting. Never hard-code a colour outside the custom properties.

## Typography

**Display Font:** Old Standard TT (with Times New Roman, serif), 400 and 700 self-hosted via fontsource; only 700 is used.
**Body Font:** Libre Franklin Variable (with Helvetica Neue, Arial, sans-serif), self-hosted.

**Character:** A Didone-adjacent newspaper serif for the two lines that speak, and a sturdy grotesque for everything the thumb touches. The contrast is voice versus instrument.

### Hierarchy
- **Masthead** (700, `clamp(2.5rem, 13vw, 3.5rem)`, 1, -0.01em): the product name, centred.
- **Headline** (700, 1.625rem rising to 2rem from 40rem, 1.2, balanced wrap): the single `h1` sentence.
- **Letter** (700, `clamp(1.5rem, 7vw, 2.125rem)` rising to 2.25rem from 40rem, 1, uppercase, width axis 100): characters in the squares.
- **Body** (400, 1rem, 1.5): base text.
- **Note** (400, 0.9375rem, 1.5): hint, status (600), example line.
- **Label** (700, 0.8125rem, 0.12em, uppercase): the field label. The counter and footer use the same size at normal tracking and weight 400, muted.
- **Button** (700, 1.125rem, 0.14em, uppercase): Solve.

### Named Rules
**The Two Voices Rule.** Serif is reserved for the masthead and the headline. Interface text, numerals and controls stay in the sans. The counter uses tabular numerals so it does not jitter while typing.

## Layout

One centred column, `max-width: 30rem`, with 1.25rem side padding (raised to the device safe-area insets when larger), 1.25rem top on phones and 3rem from 40rem. Order, top to bottom: masthead with double rule, headline, field, hint, status, Solve, example line, footer. The input is full width; the 8-square grid divides the row equally and stays square via aspect-ratio. Vertical rhythm is hand-set in rem steps: 0.25, 0.5, 0.75, 0.875, 1.25, 1.75, 2, 2.5. Tap targets are at least 2.75rem (toggle) and 4rem (Solve). The single breakpoint is `40rem`; below it the page is the phone layout. Body uses `100dvh` minimum height.

## Elevation & Depth

Flat. No shadows, blurs or gradients. Depth is conveyed by ruling alone: a 4px double ink rule under the masthead, 2px ink square borders, a 1px ink rule over the footer. The active square lifts only by stacking order and a fill change. Do not add drop shadows to this system.

### Named Rules
**The Ruled Paper Rule.** Separation comes from ink rules and the one-step paper to cell tone change, never from shadow.

## Shapes

Square and ruled. All corners are 0 except the circular theme toggle (50%). Letter squares overlap by 2px (negative margins) so adjacent borders collapse to a single 2px line. The Solve button has no border in the default state.

## Components

### Letter field (signature component)
A grid of 8 squares drawn over a real, transparent text input that remains the source of truth for keyboard, IME and paste.
- **Square:** Cell White fill, 2px ink border, bold uppercase sans letter, centred.
- **Active square:** Highlighter fill, 3px inset pencil outline, 2px pencil caret blinking in 1.1s steps; the caret moves to the right edge at the final position (the 48-letter cap). Shown only while the field has focus.
- **Entry motion:** a newly typed letter rises 6px and fades in over 160ms with `cubic-bezier(0.16, 1, 0.3, 1)`.
- **No-JS fallback:** squares are hidden and the input becomes a plain 4rem tall, 2px-bordered, Cell White field with 1.5rem text.
- **Header row:** uppercase label at left, tabular counter ("0 / 48") at right, muted.

### Buttons
- **Solve (primary):** full-width, 4rem tall, square, Graphite Ink fill with Newsprint text, bold uppercase tracked label. Hover (pointer devices only) fills Pencil Blue. Active nudges down 1px. Focus-visible: 3px pencil outline at 3px offset.
- **Theme toggle:** 2.75rem circular, transparent, ink-coloured half-filled circle icon (inline SVG, 22px), positioned at the right of the masthead row. Hover fills Highlighter; pressed state mirrors the icon horizontally. It is hidden until script runs, and the choice persists in localStorage under `raga-theme`.

### Links
- **Example link:** bold uppercase-looking sample word in Pencil Blue, tracked 0.08em, 2px underline offset 4px, with 0.5rem vertical padding for tap size; same focus ring as buttons.

### Masthead
Centred serif name, a small tracked uppercase muted descriptor under it, and a 4px double ink rule closing the block.

### Status and hint
Hint is muted note text under the field; status is a live region (`role=status`) reserving 1.5rem height so the layout does not jump.

### Accessibility and motion handling
- **Reduced motion:** the entry animation and the caret blink are both disabled under `prefers-reduced-motion: reduce`.
- **Forced colors:** the transparent real input is kept invisible over the squares, square borders become `CanvasText`, Solve gains a 2px `ButtonText` border, and the active outline becomes `Highlight`.
- **Focus:** visible 3px pencil outlines on every interactive element; the input's own outline is suppressed because the active square shows focus instead.

## Do's and Don'ts

### Do:
- **Do** take every colour from the custom properties so light and dark swap together.
- **Do** keep corners square and separate with 2px (or 4px double / 1px) ink rules.
- **Do** keep serif to the masthead and headline and use Libre Franklin for everything interactive.
- **Do** give any new animation a `prefers-reduced-motion` off switch and use the `--ease-out` curve.
- **Do** give new interactive elements the 3px pencil focus-visible outline and a 2.75rem minimum target.
- **Do** gate hover fills behind `@media (hover: hover)`.

### Don't:
- **Don't** add shadows, radii or gradients; the system is flat and square.
- **Don't** use the pencil blue as decoration, heading colour or large fill other than the Solve hover.
- **Don't** reach for pure black or pure white; ink and paper are tinted.
- **Don't** style the results page from this document until it has been designed and built; it is not yet part of the system.

## Not canonized

The small tracked uppercase line under the masthead ("The anagram solver") is recorded only as that one masthead descriptor; it is not a pattern for section kickers or eyebrows on future surfaces.
