# Anagram Solver Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static, mobile-friendly anagram solver (Astro + TypeScript) that shows exact matches and, on demand, length-grouped partial matches, deployed to Cloudflare Workers static assets.

**Architecture:** A build script filters the vendored `wamerican` list and emits two static data files: a sorted-letters→words index (the exact-match Map) and a compactly encoded trie (partial matches). Pure TypeScript functions in `src/lib/` do normalization, lookup and trie search and are unit-tested. Two Astro pages (home, results) are static; the results page runs a client script that reads `?letters=`, loads the Map, renders exact matches, and lazily loads the trie for partials.

**Tech Stack:** TypeScript 6, Astro, pnpm, Node 26, Vitest (unit), Playwright (one e2e flow), Wrangler (deploy).

**Spec:** [SPEC.md](../../../SPEC.md)

## Global Constraints

- TypeScript 6 (pin to the 6.x line); Astro; `pnpm` for all install, build and test commands; commit `pnpm-lock.yaml`.
- Target Node 26, recorded in `.nvmrc` and `engines` in `package.json`. If install, `astro check` or `astro build` fail on Node 26, fall back to Node 22 LTS and tell the user.
- Static site only, no adapter. Deploy to Cloudflare Workers static assets: `wrangler.jsonc` with `assets.directory` `./dist`; `pnpm run deploy:cf`.
- Word list: standard Debian `wamerican` (not `-large`/`-huge`/`-insane`). Keep only words that are entirely lowercase a-z and at least 4 letters.
- Partial matches: length >= 4 and shorter than the input; grouped by length, longest first; words alphabetical within a group; never repeat exact matches.
- Input: lowercase it, ignore non-letters, cap at 48 letters, duplicates count. Empty after normalizing does nothing.
- Query param `letters` and all result words are lowercase; text inputs and the results-page letters line display uppercase via CSS only.
- Each partial length group shows its first 50 words with a "Show more" control.
- Pencil icon is a real `<button>` with an accessible label ("Edit letters"); the edit input sits in a normal `<form>`.
- Home page downloads no word data; the trie is fetched only when partials are requested (button, or automatically when there are no exact matches).
- No visual design work: semantic, accessible, plain markup only.

## Review Focus

1. Repeated letters: input `aab` must never return a word needing three `a`s or two `b`s (pinned in Task 5).
2. Double-clicking "Show partial matches" (or the auto-open plus a click) must not duplicate the groups (pinned in Task 8).
3. Inputs of 1-3 letters: no crash, "no matches" messaging (pinned in Task 7).
4. `/results` with a missing, empty or letters-free param (`?letters=123 !!`): redirect to home, no blank page (pinned in Task 7).
5. Inputs over 48 letters, or with spaces and capitals (`T C A O R P E`): truncated and normalized, same results as the clean form (pinned in Tasks 2 and 7).

---

## Milestone map

M1 Word data pipeline: Tasks 1, 3, 4, 5 (encode/decode), 6. M2 Search core: Tasks 2, 4, 5. M3 Pages and exact matches: Task 7. M4 Partial matches: Task 8. M5 Deploy: Task 9.

### Task 1: Scaffold and toolchain check

**Files:**
- Create: `package.json`, `.nvmrc` (`26`), `tsconfig.json` (extends `astro/tsconfigs/strict`), `astro.config.mjs`, `.gitignore` (`node_modules/`, `dist/`, `.astro/`, `public/data/`, `.superpowers/`, `test-results/`), `vitest.config.ts`, `src/pages/index.astro` (placeholder `<h1>`), `tests/smoke.test.ts`

**Interfaces:**
- Produces: scripts `dev`, `build` (= `pnpm build:data && astro check && astro build`; `build:data` is defined in Task 6, so until then `build` is `astro check && astro build`), `test` (= `vitest run`), `preview`.

- [ ] **Step 1:** `git init`; scaffold with `pnpm create astro@latest` using the minimal template (TypeScript strict), then `pnpm add -D typescript@~6 vitest` and add `engines.node` `>=26`.
- [ ] **Step 2:** Write `tests/smoke.test.ts`: `it('runs', () => expect(1 + 1).toBe(2))`.
- [ ] **Step 3:** Run `node -v` (expect `v26.x`), `pnpm install`, `pnpm test`, `pnpm astro check`, `pnpm astro build`. Expected: all succeed. If TypeScript 6 or Node 26 fails anywhere, stop and ask the user before downgrading either.
- [ ] **Step 4:** Commit: `chore: scaffold astro + ts6 + vitest on node 26`.

### Task 2: Input normalization and sorted-letter key

**Files:**
- Create: `src/lib/letters.ts`
- Test: `tests/letters.test.ts`

**Interfaces:**
- Produces: `export const MAX_LETTERS = 48`; `normalizeLetters(raw: string): string` (lowercase, strip non a-z, truncate to `MAX_LETTERS`); `sortedKey(letters: string): string` (letters sorted alphabetically).

- [ ] **Step 1: Write failing tests** in `tests/letters.test.ts`:
  - `normalizeLetters('T C A O R P E')` → `'tcaorpe'`
  - `normalizeLetters('abc-123 déf')` → `'abcdf'`
  - `normalizeLetters('!!! 123')` → `''`
  - `normalizeLetters('a'.repeat(60))` → length 48
  - `sortedKey('carpet')` → `'aceprt'`; `sortedKey('')` → `''`
- [ ] **Step 2:** Run `pnpm vitest run tests/letters.test.ts`; expect FAIL (module missing).
- [ ] **Step 3:** Implement both functions and the constant in `src/lib/letters.ts`.
- [ ] **Step 4:** Run the test; expect PASS.
- [ ] **Step 5:** Commit: `feat: input normalization and sorted-letter key`.

### Task 3: Word-list filter and vendored wordlist

**Files:**
- Create: `data/wamerican.txt` (vendored), `data/README.md` (source, version, licence), `src/lib/filter.ts`
- Test: `tests/filter.test.ts`

**Interfaces:**
- Produces: `isPlayableWord(word: string): boolean` (matches `/^[a-z]{4,}$/`); `filterWords(lines: string[]): string[]` (trim, keep playable, dedupe, sorted alphabetically).

- [ ] **Step 1:** Vendor the list: download the current `wamerican` `.deb` from `deb.debian.org/debian/pool/main/s/scowl/`, extract `/usr/share/dict/american-english` into `data/wamerican.txt`, and record the package version and its public-domain/SCOWL licence in `data/README.md`.
- [ ] **Step 2: Write failing tests** in `tests/filter.test.ts`:
  - `filterWords(['care','Paris',"dog's",'re-do','résumé','cat','care'])` → `['care']`
  - `isPlayableWord('cat')` is `false` (3 letters); `isPlayableWord('cart')` is `true`; `isPlayableWord('Cart')` is `false`
  - Fixture check on the real file: reading `data/wamerican.txt` through `filterWords` yields no entry containing `'` or an uppercase letter, and includes `'carpet'`.
- [ ] **Step 3:** Run; expect FAIL. **Step 4:** Implement `src/lib/filter.ts`. **Step 5:** Run; expect PASS.
- [ ] **Step 6:** Commit: `feat: wamerican word filter`.

### Task 4: Exact-match index

**Files:**
- Create: `src/lib/exact.ts`
- Test: `tests/exact.test.ts`

**Interfaces:**
- Consumes: `sortedKey` from `src/lib/letters.ts`.
- Produces: `type ExactIndex = Record<string, string[]>`; `buildExactIndex(words: string[]): ExactIndex` (key = `sortedKey(word)`, values alphabetical); `findExact(index: Map<string, string[]>, letters: string): string[]` (`[]` when no key).

- [ ] **Step 1: Write failing tests** with fixture `['care','race','acre','cart','trac','cape']`:
  - `buildExactIndex(fixture)['acer']` equals `['acre','care','race']`
  - `findExact(new Map(Object.entries(index)), 'ecar')` returns the same three words
  - `findExact(map, 'zzzz')` returns `[]`
- [ ] **Step 2:** Run; FAIL. **Step 3:** Implement. **Step 4:** Run; PASS.
- [ ] **Step 5:** Commit: `feat: exact-match index`.

### Task 5: Trie build, encoding and subset search

**Files:**
- Create: `src/lib/trie.ts`
- Test: `tests/trie.test.ts`

**Interfaces:**
- Produces: `interface TrieNode { end: boolean; children: Map<string, TrieNode> }`; `buildTrie(words: string[]): TrieNode`; `encodeTrie(root: TrieNode): string`; `decodeTrie(encoded: string): TrieNode`; `interface PartialGroup { length: number; words: string[] }`; `searchPartials(root: TrieNode, letters: string, minLength?: number): PartialGroup[]` (default `minLength` 4).
- Encoding grammar: root is a sequence of child entries; each entry is `letter`, then `$` if a word ends there, then `(` entries `)` if it has children. Children in alphabetical order. Example: `['care','cart','cat']` encodes to `c(a(r(e$t$)t$))`.

- [ ] **Step 1: Write failing tests** in `tests/trie.test.ts` with fixture words `['care','cart','race','acre','cape','pace','carpet','crate','trace','react','acca']`:
  - `encodeTrie(buildTrie(['care','cart']))` equals `'c(a(r(e$t$)))'`
  - `decodeTrie(encodeTrie(t))` re-encodes to the same string (round trip) for the full fixture
  - `searchPartials(trie, 'carpet')`: groups come back as lengths `[5, 4]` (descending); the 5-letter group is `['crate','react','trace']`; the 4-letter group is `['acre','cape','care','cart','pace','race']` (`acca` is absent, needing two `c`s); `carpet` itself appears nowhere (length equals input)
  - **Repeated letters (Review Focus 1):** `searchPartials(trie, 'aabcd')` does not contain `acca` (needs two `c`s, input has one); `searchPartials(trie, 'aaccd')` does contain `acca` in its 4-letter group
  - `searchPartials(trie, 'abc')` returns `[]` (input shorter than 4)
- [ ] **Step 2:** Run; FAIL. **Step 3:** Implement. Search approach: depth-first walk carrying a 26-slot remaining-letter count array, descending only into children whose letter count is > 0, collecting nodes with `end` where `4 <= depth < letters.length`. **Step 4:** Run; PASS.
- [ ] **Step 5:** Commit: `feat: trie build, encode, decode, subset search`.

### Task 6: Build-time data pipeline

**Files:**
- Create: `scripts/build-data.ts`
- Modify: `package.json` (add `"build:data": "node scripts/build-data.ts"` and make `build` = `pnpm build:data && astro check && astro build`; use a TS runner such as `tsx` if Node 26's built-in type stripping cannot import the `src/lib` files; record which)
- Test: `tests/build-data.test.ts`

**Interfaces:**
- Consumes: `filterWords`, `buildExactIndex`, `buildTrie`, `encodeTrie`.
- Produces: `public/data/exact.json` (`ExactIndex` as JSON) and `public/data/trie.txt` (encoded trie). Export `buildData(wordLines: string[]): { exact: string; trie: string }` from the script module so it is testable.

- [ ] **Step 1: Write failing test:** `buildData(['care','race','acre','Paris',"dog's",'cart'])`: parsed `exact` has key `'acer'` with 3 words and no key for `Paris`; decoding `trie` and calling `searchPartials` finds `cart`; neither output contains `'` or an uppercase letter.
- [ ] **Step 2:** Run; FAIL. **Step 3:** Implement `buildData` and the main entry that reads `data/wamerican.txt` and writes both files. **Step 4:** Run test; PASS. Run `pnpm build:data`; expected: both files exist and print their sizes in KB.
- [ ] **Step 5:** Check sizes: `exact.json` well under 1 MB transferred when brotli'd (`brotli -c public/data/exact.json | wc -c`); note both numbers in the commit message.
- [ ] **Step 6:** Commit: `feat: build-time data pipeline`.

### Task 7: Home and results pages with exact matches

**Files:**
- Create: `src/pages/results.astro`, `src/scripts/results.ts`, `src/lib/data.ts`
- Modify: `src/pages/index.astro`
- Test: `tests/data.test.ts` (loader with mocked `fetch`), e2e covered in Task 9

**Interfaces:**
- Consumes: `normalizeLetters`, `findExact`.
- Produces: `loadExact(): Promise<Map<string, string[]>>` and `loadTrie(): Promise<TrieNode>` in `src/lib/data.ts` (each fetches its file once and caches the promise); results-page DOM ids: `letters-display`, `edit-letters` (pencil button), `edit-form`, `edit-input`, `exact-section`, `partials-button`, `partials-section`.

- [ ] **Step 1: Write failing test** `tests/data.test.ts`: with `fetch` mocked, calling `loadExact()` twice triggers one fetch and returns a `Map` whose `get('acer')` matches the mocked JSON.
- [ ] **Step 2:** Run; FAIL. **Step 3:** Implement `src/lib/data.ts`. **Step 4:** Run; PASS.
- [ ] **Step 5: Home page.** `index.astro`: `<form method="get" action="/results">`, one `<input name="letters">` with `text-transform: uppercase` and autocapitalize/autocorrect off, Solve button. A small inline script prevents submit when `normalizeLetters(value)` is empty and submits the normalized value otherwise. The page loads no data files.
- [ ] **Step 6: Results page.** `results.astro` renders the static shell (ids above, letters line uppercase via CSS, link back to `/`). `src/scripts/results.ts` on load: read `letters` from the URL and normalize it; if empty, `location.replace('/')`; show letters; `loadExact()` and render the exact section with the label "Exact matches" (words as a list); pencil button toggles the hidden form (prefilled, focused) which submits `GET /results` with the normalized letters; inputs under 4 letters render "No exact matches" and never throw.
- [ ] **Step 7:** Verify manually with `pnpm dev`: `/results?letters=TCAORPE` and `/results?letters=tcaorpe` show identical results; `/results?letters=123` redirects home; `/results?letters=ab` shows "No exact matches" with no console errors. Record the outcome.
- [ ] **Step 8:** Commit: `feat: home and results pages with exact matches`.

### Task 8: Partial matches UI

**Files:**
- Modify: `src/pages/results.astro`, `src/scripts/results.ts`
- Create: `src/scripts/partials.ts`
- Test: `tests/partials-dom.test.ts` (DOM rendering with `happy-dom` as a Vitest dev dependency)

**Interfaces:**
- Consumes: `loadTrie`, `searchPartials`, `PartialGroup`.
- Produces: `renderPartialGroups(container: HTMLElement, groups: PartialGroup[], pageSize?: number): void` in `src/scripts/partials.ts` (default `pageSize` 50): clears the container first, then renders one labeled section per group (label "N letters"), the first `pageSize` words, and a "Show more" `<button>` revealing the rest when more exist; renders "No partial matches" when `groups` is empty.

- [ ] **Step 1: Write failing tests** in `tests/partials-dom.test.ts` (happy-dom):
  - 3 groups render in the given order with labels "6 letters", "5 letters", "4 letters"
  - a group of 120 words renders 50 `li`s plus a "Show more" button; clicking it shows all 120 and removes the button
  - **Idempotent (Review Focus 2):** calling `renderPartialGroups` twice on the same container with the same groups leaves exactly one set of groups
  - empty `groups` renders text containing "No partial matches"
- [ ] **Step 2:** Run; FAIL. **Step 3:** Implement `renderPartialGroups`. **Step 4:** Run; PASS.
- [ ] **Step 5:** Wire it in `results.ts`: the "Show partial matches" button calls one `showPartials()` function that loads the trie, runs `searchPartials`, renders into `partials-section`, and disables/hides the button; if there are no exact matches, call `showPartials()` automatically on load. A second call while one is in flight or done must do nothing. Verify in `pnpm dev` with `/results?letters=tcaorpe` (button loads partials, longest first, none below 4 letters) and a letters string with no exact match (partials open automatically, button absent), and check the network tab: the home page fetches no `/data/*`, and `trie.txt` is requested only after the partials trigger.
- [ ] **Step 6:** Commit: `feat: partial matches with lazy trie load`.

### Task 9: End-to-end flow and deploy

**Files:**
- Create: `playwright.config.ts` (webServer: `pnpm astro preview`, mobile viewport project), `e2e/flow.spec.ts`, `wrangler.jsonc`
- Modify: `package.json` (add `test:e2e`, add `wrangler` as a dev dependency)

**Interfaces:**
- Consumes: the built site and the DOM ids from Task 7.

- [ ] **Step 1: Write the e2e test** `e2e/flow.spec.ts`, phone-sized viewport, after `pnpm build`:
  - home → type `T C A O R P E` → Solve → URL is `/results?letters=tcaorpe`, letters line reads uppercase, exact section lists `carpet`'s anagrams (assert on a word known to be in the list after you check the data, e.g. via `findExact` in the test setup)
  - click "Show partial matches" → a "5 letters" group appears before a "4 letters" group; click the button area again (or double-click) → still exactly one "5 letters" heading
  - click the pencil → input visible and prefilled uppercase; change to `RACE`, submit → URL is `/results?letters=race`
  - `/results?letters=%21%21` lands on `/`
  - `/results?letters=ab` shows "No exact matches" and no page error
  - 60 `a`s in the home input → results URL carries exactly 48 letters
- [ ] **Step 2:** Run `pnpm build && pnpm test:e2e`; expect PASS. Fix failures in the owning task's files.
- [ ] **Step 3:** Create `wrangler.jsonc` with a name, today's `compatibility_date`, and `assets.directory` `./dist` (add `not_found_handling` `404-page` only if a 404 page exists). Run `pnpm astro build && pnpm wrangler dev` and open the local URL on a phone-sized viewport; expect the full flow to work.
- [ ] **Step 4:** Ask the user before running `pnpm wrangler deploy` (it publishes to their Cloudflare account). After they confirm, deploy, then load the live URL on a real phone.
- [ ] **Step 5:** Commit: `feat: e2e flow and cloudflare workers config`.
