# raga-man: SPEC

## Intent

A fast, clean, mobile-friendly anagram solver. The main use is the end of a NYT Strands puzzle: the player has a few leftover letters and can't see the last word (or last two words). They currently use anagram-solver.net, whose UI is dated and whose mobile view is poor. This replaces it.

Success: on a phone, a player types their leftover letters and sees the answer within a second or two, with no junk words.

## Goals

- Type letters, get every word that uses **all** of them (exact matches).
- On demand, show words that use **some** of the letters (partial matches), grouped by length, longest first.
- Work well on phones first, desktop second.
- No junk: no proper nouns, no possessives or punctuation entries.
- Fully client-side search over prebuilt data; no backend.

## Non-goals (v1)

- Scrabble features: blank tiles / wildcards, scoring, board or rack helpers (out of scope for raga-man).
- Visual design. Build with plain, functional, unstyled-ish markup. A separate design pass (the `impeccable` skill) happens after the app works. Do not invest in look and feel, but do keep markup semantic and accessible so the design pass has good bones.
- Multi-word solving. The user types the letters for all remaining words and scans the length-grouped partials themselves; the app does not search for word pairs that together use every letter.
- Accounts, history, saving, sharing.
- Words under 4 letters.

## Anti-goals

- Showing proper nouns or entries like `dog's`.
- Showing partial matches that are shorter than 4 letters.
- A slow first interaction (e.g. building the trie from a raw word list at page load).

## Stack

- TypeScript 6 (pin to the 6.x line) and Astro, with `pnpm` as the package manager (commit `pnpm-lock.yaml`; use `pnpm` for all install, build and test commands). Deployed as a static site to Cloudflare **Workers static assets** (Astro's docs recommend Workers for new projects, and the current Cloudflare adapter dropped Pages support). A fully static site needs no adapter: only `wrangler` and a `wrangler.jsonc` pointing `assets.directory` at `./dist`. Deploy with `pnpm run deploy:cf` (which runs the full `pnpm build`, including the word-data step, then `wrangler deploy`). A bare `astro build` skips the data step and ships a site with no word data. Astro requires Node 22.23.4 or newer (even-numbered releases only), per its install docs. **Target Node 26**, and record it (`.nvmrc` and the `engines` field in `package.json`). Astro's docs don't name Node 26, so milestone 1 must confirm `pnpm install`, `astro check` and `astro build` all work on it. If they don't, fall back to Node 22 LTS and tell the user.
- Astro's docs don't state which TypeScript versions they support. Milestone 1 must confirm that the current Astro release type-checks cleanly (`astro check`) on TypeScript 6. If it doesn't, stop and ask before downgrading.
- Word list: Debian SCOWL, the standard `wamerican` package (not `-large`/`-huge`/`-insane`, which add obscure and archaic words). If a legitimate Strands word turns out to be missing, moving up a tier is a future decision.

## Screens

### Home (`/`)

- Title, one text input for letters, a Solve button.
- Submitting navigates (full page load is fine) to `/results?letters=<letters>`.
- Empty input: do nothing.

### Results (`/results?letters=...`)

- Shows the submitted letters as text (normalized form), with a **pencil icon button**. Clicking it replaces the text with an input (prefilled) and a submit control; submitting reloads the page with the new letters (full page load is fine). The input is hidden until the pencil is clicked.
- A link or control back to a fresh search.
- **Exact matches** section: every dictionary word that uses all the letters exactly once each. Shown first.
- A **"Show partial matches"** button. Clicking it appends the partial matches to the page in the DOM (no reload).
- **Partial matches**: words buildable from a subset of the letters, each letter used at most as many times as it appears in the input, with length >= 4 and shorter than the input length. Grouped by length, **longest first**, each group labeled with its length. Words within a group sorted alphabetically.
- **No exact matches:** show a "No exact matches" message and **open the partial matches automatically** (no button press needed).
- Zero partial matches: show a plain "No partial matches" message.
- Realistic inputs are 4-12 letters, but large inputs (up to the 48 cap) can return thousands of partials. Each length group renders its first 50 words with a "Show more" control that reveals the rest. *(Author's call; the 50 is adjustable.)*
- The pencil is a real `<button>` with an accessible label (e.g. "Edit letters"). The edit input sits in a normal `<form>`. *(Author's call.)*
- Partials are computed in the browser on demand, not on page load, when the button is pressed (or automatically per the rule above).

## Input handling

- Letters **display as uppercase** in every text input (home and the results-page edit input) and in the results-page letters display. Use CSS `text-transform: uppercase` (or equivalent); the underlying value stays lowercase.
- Lowercase the input for processing. The `letters` query param and all result words (exact and partial) are lowercase.
- Ignore anything that is not a letter a-z (spaces, digits, punctuation).
- After normalizing, an empty result does nothing (stay on or return to the home page; builder's call on exact behavior).
- Cap at **48 letters** (a full Strands board). Longer input is truncated or rejected with a short message (builder's call; mark which in the code).
- Duplicate letters are legal and counted (e.g. `lettter` needs three t's).
- Inputs of 1-3 letters have no results of length >= 4; show the "no matches" messaging rather than erroring.

## Data design

All derived at **build time** from the SCOWL list, and shipped as static data.

**Word list filtering:** keep only words that are entirely lowercase a-z, length >= 4. This drops proper nouns (capitalized), possessives, hyphenated words, and anything with apostrophes or accents.

**Exact matches: a `Map`.** Key = the word's letters sorted alphabetically (e.g. `carpet` -> `aceprt`), value = array of words sharing that key. Lookup: sort the normalized input, `map.get(key)`.

**Partial matches: a trie.** Built from the same filtered list. Search: depth-first walk, tracking remaining letter counts from the input; only descend into a child if that letter is still available. Collect words where length >= 4 and length < input length (exact matches are not repeated in partials). Group by length, sort lengths descending.

**Shipping the data:** the builder chooses the serialization and loading strategy (e.g. a prebuilt JSON file for the Map, a compact serialized trie for the partial search). Constraint: the Map data is needed on the results page load; the trie data should only be fetched/initialized when partial matches are requested (or when there are no exact matches). The home page should not download either.

**Size budget** *(author's call)*: serve the data pre-compressed (brotli/gzip; Cloudflare does this for static assets). Aim for the Map data to be well under 1 MB transferred, and keep the trie compactly encoded rather than as nested JSON objects. The home page downloads no word data.

## Behavior notes

- The results page works from the URL alone (shareable, refreshable); there is no client-side state beyond the DOM.
- Partial-match results do not include the exact matches again.
- The same word never appears twice.

## Testing expectations

- Unit tests for: input normalization, the sorted-letter key, the Map lookup, the trie subset search (including repeated letters and the length bounds), and the word-list filter (proper nouns and possessives excluded).
- A small end-to-end check of the flow: home -> results -> show partials -> edit letters via the pencil.

## Milestones

Each milestone ends in something checkable. *(Author's proposal; the implementation plan may split them further.)*

1. **Word data pipeline.** Astro + TypeScript project scaffolded. A build step reads `wamerican`, filters it (lowercase a-z, 4+ letters), and emits the Map data and the trie data. The toolchain is confirmed working: TypeScript 6 and Node 26 (see Stack). Done when unit tests confirm proper nouns and possessives are gone and that `carpet`-style lookups return the right words.
2. **Search core.** Pure TypeScript functions: input normalization, exact lookup, and trie subset search grouped by length, longest first. Done when unit tests pass, including repeated letters and the length bounds.
3. **Home and results pages (exact matches).** Home form, `/results?letters=...`, uppercase display, the pencil edit, and the exact-matches section. Done when the flow works in a browser on a phone-sized viewport.
4. **Partial matches.** The "Show partial matches" button, auto-open when there are no exact matches, length groups, and "Show more". The trie data loads only when needed. Done when the full flow works and the home page downloads no word data.
5. **Deploy.** Static build deployed to Cloudflare Workers static assets. Done when the live URL works on a real phone.

Design polish (the `impeccable` pass) comes after milestone 5 and is a separate project.

## Left to the builder

- Project structure, Astro rendering mode for the results page (it must work as a static deploy, so likely a client-side script reading the query string).
- Data serialization format and trie encoding.
- Exact empty / over-limit input behavior (within the rules above).
- Test tooling.
- Worker name, compatibility date, and the rest of the Cloudflare account setup.
