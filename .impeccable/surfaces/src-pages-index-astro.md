---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

# Surface brief: home page (`/`)

## Scope and visitor mode
Operate. The home page is the tool itself, not a marketing page. Only `/` is in scope; the results page keeps its structure and gets the same world in a later pass. Build path: code-led.

## Audience, job, task
A public Strands player on a phone with a few leftover letters. Type them and reach `/results` in seconds with no extra taps.

## Content and behaviour
- Masthead (`raga-man` plus a short descriptor) with a theme toggle.
- One line: "Find every word hiding in your leftover letters."
- A row of letter squares as the input, over a real labelled `<input>`; autofocus on load.
- Input-rules hint (spaces, digits and punctuation ignored; up to 48 letters), a full-width Solve button, and a tappable example (`PLEATS`) that fills the input and submits.
- Letters show uppercase; repeats count; non-letters are shown as ignored; empty input does nothing; the cap at 48 is stated in text as well as colour.
- 4-12 letters fit one row; longer input wraps, and squares never drop below a thumb-sized target.

## Theme
Follows `prefers-color-scheme` by default. A masthead toggle (accessible name, `aria-pressed`, at least 44px target) flips it; the choice is remembered per browser, with storage wrapped in try/catch, and applied before first paint so there is no flash. Until the visitor chooses, the page follows system changes. Both themes meet WCAG 2.2 AA. Dark is a deliberate inverse, not a colour flip.

## Direction contract

THESIS: The input is a row of crossword-style letter squares, the way a puzzle page asks to be filled in. It refuses the category default of a plain white page with one rounded box and a blue button.

OWN-WORLD: Grey newsprint ground, near-black ink, double-rule masthead, pencil-blue for the example link and the active square. Not warm cream, not Arial or Georgia as shipped faces. Dark mode inverts to a dark newsprint ground with the same ink-on-paper hierarchy. Recognisable with all content removed.

STORY: The visitor sees a puzzle page, understands at once what to type, types, and presses Solve. Nothing competes with the squares.

FIRST VIEWPORT: At 390 wide, top to bottom: masthead with the toggle at the right; the one-line statement; the letter squares (the largest element); the rules hint; a full-width Solve plate (the only reversed element); the example link. Solve sits within thumb reach of the open keyboard.

FORM: Newsprint Puzzle Page, position 1 on the ordered list, the pick card. Chosen sketch: `.impeccable/mocks/decision/model-pick.html`. seed:32139088a1e3ce4b

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved decisions
- Whether the squares mirror a hidden input or are the input itself, so long as native input behaviour and accessibility hold.
- How the row wraps beyond 12 letters.
- The final type pairing: it must avoid the flagged defaults.
