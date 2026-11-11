# letter-garden Implementation Plan

> **For agentic workers:** Implement this plan task-by-task. Track progress with the checkboxes. Read the listed source files before editing, run each task's checks, and keep unrelated changes out of its commit. This plan describes future work; writing it does not authorize deployment.

**Goal:** A static, mobile-friendly seven-letter word finder. Enter seven distinct letters, choose the required center letter, and find words that use only those letters, allowing repetition. Clearly identify words that use all seven letters.

**Architecture:** A second Astro app in `apps/letter-garden/`, independently built and deployed. Extract trie construction and serialization into `packages/word-data`, and the existing visual shell and theme behavior into `packages/ui`. Each app owns its dictionary policy, search rules, input interaction, result presentation, generated assets, and Worker configuration. letter-garden builds one encoded trie and loads it only on the results page. Search remains pure TypeScript over the trie.

**Tech Stack:** Existing workspace versions of Astro, TypeScript 6, Node 26, pnpm, tsx, Vitest, happy-dom, Playwright, and Wrangler. Use the existing lockfile; no framework migration or dependency upgrades are part of this work.

**References:** [Suite plan](../../solver-suite-plan.md), [shared design system](../../design-system.md), [letter-garden preparation notes](../../../apps/letter-garden/README.md), [raga-man spec](../../../apps/raga-man/SPEC.md).

**Product records:** Create `apps/letter-garden/PRODUCT.md` and `SPEC.md` in Task 1. The choices below are proposed v1 defaults; record any agreed changes in those files and update affected tasks before implementation proceeds.

## Global Constraints

- Static and client-side: no backend, accounts, history, daily puzzle feed, or external requests for answers.
- App name: `letter-garden`. Use American English and plain interface copy. Never use a game's own name in the product name, masthead, metadata, or domain configuration.
- Dictionary: reuse the vendored `data/wamerican/words.txt`, with its provenance and license. Keep trimmed entries matching `/^[a-z]{4,}$/`, deduplicate, and sort. Do not lowercase dictionary entries before filtering: that would admit proper nouns.
- Build a separate trie for this app. It may omit words with more than seven distinct letters because they cannot match any valid input. Preserve words longer than seven characters. Do not emit an exact-anagram index.
- Say on both pages: "Uses a general dictionary. Some words may be missing or rejected by your game." Link to a short source note naming wamerican/SCOWL. Do not claim game-list compatibility or complete answers to a particular puzzle.
- Input: seven distinct ASCII letters after lowercasing and stripping non-letters. Validate the normalized sequence before sorting: reject repeated letters, fewer or more than seven letters, and letters-free input. Do not silently deduplicate or truncate. Show a note when non-space characters are ignored.
- Required letter: exactly one ASCII letter after normalization, belonging to the seven-letter set. Make selection explicit; never choose a center letter silently.
- Canonical results URL: `/results?letters=acinort&required=c`. `letters` is sorted and lowercase; `required` is lowercase. Display letters uppercase through CSS. Preserve an already selected required letter when the set changes only if it still belongs to the new valid set.
- Results: words at least four letters long, containing the required letter, using only allowed letters. Letters may repeat without limit except for the finite dictionary word length. Include the input itself if it is a valid dictionary word; do not inherit raga-man's identical-input exclusion.
- Show a dedicated "All seven letters" list first, then "Other words" grouped by length descending, alphabetically within each group. A word appears once across these sections. Explain that all-seven words may repeat letters and may be longer than seven characters. Use visible text labels rather than color alone.
- Each list initially shows 50 words. "Show more" reveals the remaining words in that list and moves focus to its first added word. Summary counts include all matches, not just visible rows.
- Phone first, one column, shared fonts, tokens, masthead, theme toggle, and WCAG 2.2 AA. Respect reduced motion. No seven-cell input styled as a copy of another game's board is required; use a text input and an accessible required-letter selector.
- No scoring, hints, found-word tracking, frequency ranking, or cross-site theme synchronization in v1.
- Root `pnpm dev` continues to start raga-man. Each app has explicit development and deployment commands. Worker names, assets, and ports must not collide.

## Review Focus

1. Repeated letters are allowed in words: `cartoon` matches `acinort`, required `c` (Tasks 5 and 10).
2. All-seven coverage is distinct-letter coverage, not word length: `coronation` qualifies; seven-character `cartoon` does not (Tasks 5 and 9).
3. A word lacking the required letter is excluded even if all its letters are allowed: `ration` fails required `c` (Task 5).
4. Invalid form input and invalid shared URLs never search a truncated or silently repaired puzzle (Tasks 4, 7, and 8).
5. No data fetch on home; concurrent loads share a promise; failed loads are retryable; double actions never duplicate lists (Tasks 6, 8, and 9).
6. Shared extraction preserves raga-man's letter-count search, lazy loading, routes, icons, theme preference, and appearance (Tasks 2, 3, and 10).
7. Package browser exports contain no filesystem imports. Independent builds need neither another app's output nor a separate package compilation step (Tasks 2, 3, and 10).

---

## Milestone map

M1 Product contract and app skeleton: Task 1. M2 Shared modules: Tasks 2 and 3. M3 Validation, search, and data: Tasks 4-6. M4 Input and results experience: Tasks 7-9. M5 Regression checks and release readiness: Task 10.

All commands below run from the repository root unless a working directory is stated. File paths are repository-relative. Use focused unit tests before broad checks; run both apps' builds and browser suites after shared changes. Do not reinitialize the repository or scaffold over existing files.

### Task 1: Record the product contract and scaffold the app

**Files:**
- Create: `apps/letter-garden/PRODUCT.md`, `SPEC.md`, `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/pages/index.astro`
- Modify: root `package.json`, `pnpm-lock.yaml`, `apps/letter-garden/README.md`

**Interfaces:**
- Package name `letter-garden`; `engines.node` `>=26`; strict Astro TypeScript configuration.
- Scripts: `dev` (port 4322), `build` (`astro check && astro build` until Task 6), `preview` (port 4322), `test` (`vitest run --passWithNoTests` only during scaffolding).
- Root commands: `dev:letter-garden`, `build:letter-garden`, `preview:letter-garden`. Use `pnpm --filter letter-garden ...`; retain existing raga-man defaults.

- [ ] **Step 1:** Read the references. Write product records covering the defaults above, URL behavior, dictionary limitations, input errors, empty/loading/error states, pagination, accessibility, and v1 exclusions. Record a simple page layout using the shared visual system.
- [ ] **Step 2:** Add the minimal app with a real `letter-garden` heading, strict TypeScript configuration, and `build.format: 'file'` so `/results` follows raga-man's hosting convention. Reuse dependency versions from raga-man rather than scaffolding with `@latest`.
- [ ] **Step 3:** Add explicit root commands and run `pnpm install`. Check that the lockfile changes describe the new workspace package without unrelated upgrades.
- [ ] **Step 4:** Run `pnpm --filter letter-garden build` and `pnpm --filter raga-man build`. Expect both to pass independently. Record the current raga-man unit/browser baseline before extraction. The workspace preparation found 54 passing unit tests and one existing browser spacing failure at `apps/raga-man/e2e/results.spec.ts:128`; verify the current baseline rather than assuming it still applies. Do not weaken that assertion.
- [ ] **Step 5:** Commit: `chore: scaffold letter-garden in the solver workspace`.

### Task 2: Extract trie storage and dictionary-processing mechanics

**Files:**
- Create: `packages/word-data/package.json`, `tsconfig.json`, `vitest.config.ts`, `src/trie.ts`, `src/words.ts`, `tests/trie.test.ts`, `tests/words.test.ts`
- Modify: `apps/raga-man/src/lib/trie.ts`, `src/lib/filter.ts`, `src/lib/data.ts`, `scripts/build-data.ts`, `tests/trie.test.ts`, both apps' `package.json`, `pnpm-lock.yaml`

**Interfaces:**
- Private package `@solver-suite/word-data`, consumed with `workspace:*`.
- Explicit source exports `@solver-suite/word-data/trie` and `@solver-suite/word-data/words`. No package build is needed; Astro, tsx, and Vitest consume the TypeScript source.
- Trie export: existing `TrieNode`, `buildTrie`, `encodeTrie`, `decodeTrie`, preserving the encoding grammar exactly.
- Word export: `prepareWords(lines: string[], accept: (word: string) => boolean): string[]`, which trims, filters with the supplied predicate, deduplicates, and sorts. Each app supplies its own acceptance policy.
- Keep `PartialGroup` and `searchPartials` inside raga-man, importing `TrieNode` from the shared package. Keep `isPlayableWord` and the existing `filterWords` interface local; its implementation can call `prepareWords`.

- [ ] **Step 1:** Move the existing trie construction and round-trip tests to the package. Retain the repeated-letter subset-search tests in raga-man, updating their imports. Add a fixture that checks lowercase-only policy is supplied by the caller and that trimming occurs before acceptance.
- [ ] **Step 2:** Extract the existing codec without changing its format. Assert that `['care', 'cart']` still encodes to `c(a(r(e$t$)))`. Implement the small word-processing function and migrate raga-man's callers. Remove duplicate codec implementations.
- [ ] **Step 3:** Add package scripts for tests and TypeScript checking, install workspace links, and run `pnpm --filter @solver-suite/word-data test`, `pnpm --filter raga-man test`, and `pnpm --filter raga-man build`.
- [ ] **Step 4:** Compare raga-man's generated `exact.json` and `trie.txt` with the pre-extraction outputs; expect identical bytes. Confirm browser imports can reach the codec without importing Node filesystem code.
- [ ] **Step 5:** Commit: `refactor: share trie storage and word-list processing`.

### Task 3: Extract the shared visual shell and theme behavior

**Files:**
- Create: `packages/ui/package.json`, `src/layouts/Base.astro`, `src/styles/global.css`, `src/scripts/theme.ts`
- Modify: `apps/raga-man/src/layouts/Base.astro`, `src/styles/global.css`, `src/scripts/theme.ts`, both apps' `package.json`, `apps/letter-garden/src/pages/index.astro`, `docs/design-system.md`, `pnpm-lock.yaml`
- Test: existing raga-man browser tests; letter-garden theme tests in Task 10

**Interfaces:**
- Private package `@solver-suite/ui` with explicit layout and stylesheet exports. Declare Astro as a peer dependency satisfied by each app. Keep font dependencies with the package that imports them.
- Shared layout props: `title`, `description`, `name`, `subtitle`, `themeStorageKey`; default and named footer slots as in the existing layout. Keep the current app-local icon URLs; each app owns those files.
- Shared theme script reads the same app-supplied key used by the pre-paint script. Safely serialize the key with Astro's script variable support, avoiding interpolated script strings. The head script must run before paint.
- Raga-man's local layout remains a small wrapper supplying its existing defaults, including `raga-theme`; letter-garden supplies `letter-garden-theme`. localStorage is origin-specific; do not promise shared preferences across subdomains.
- Move only shared tokens, resets, typography, masthead, theme toggle, buttons, and page/footer structure. Keep anagram letter-grid and entry-field rules app-local. Avoid duplicate font loads and CSS definitions.

- [ ] **Step 1:** Record phone screenshots of raga-man home and results in both themes before moving styles. Include its letter field and footer. Use existing screenshots only if they match the current build.
- [ ] **Step 2:** Extract the shell and common styles; preserve stylesheet order in the raga-man wrapper. Move theme wiring to the shared package and supply the same key to both pre-paint and toggle code. Delete the unused old theme implementation once imports are migrated.
- [ ] **Step 3:** Render letter-garden's placeholder through the shared layout with its own name and subtitle. Verify names, descriptions, and theme keys do not leak between apps.
- [ ] **Step 4:** Run both production builds and raga-man's browser suite. Compare screenshots, saved-theme startup, blocked storage, system-theme changes, and focus styles. Expect no new raga-man failures relative to Task 1's recorded baseline.
- [ ] **Step 5:** Update the design document to distinguish shared package paths from app-specific paths. Commit: `refactor: share the solver layout and theme system`.

### Task 4: Validate puzzle input and canonical URLs

**Files:**
- Create: `apps/letter-garden/src/lib/puzzle.ts`, `tests/puzzle.test.ts`
- Modify: `apps/letter-garden/package.json` (remove temporary `--passWithNoTests`)

**Interfaces:**
- `type Puzzle = { letters: string; required: string }` with the validated, canonical invariants from Global Constraints.
- `validatePuzzle(rawLetters: string, rawRequired: string)` returns a discriminated success/error result. Success includes `puzzle` and any ignored-character note; failure identifies the offending field and a plain-language message. Callers never receive a partially valid `Puzzle`.
- `puzzleUrl(puzzle: Puzzle): string` uses `URLSearchParams` to produce the canonical relative results URL.
- Query readers reject duplicate `letters` or `required` parameters as ambiguous; unknown parameters are ignored and removed when canonicalizing.

- [ ] **Step 1: Write failing tests:**
  - `A C I N O R T`, required `C`, succeeds as `{ letters: 'acinort', required: 'c' }`; spaces alone need no ignored-character warning.
  - `TRO NICA!`, required `c`, yields the same puzzle plus an ignored-character note.
  - `aacnort`, `acnort`, `acinortx`, empty input, and letters-free input each fail clearly. Eight input letters with only seven distinct letters still fail; do not deduplicate them.
  - Missing required letter, `cc`, and a letter outside the set fail. An accented letter is not transliterated.
  - Different permutations serialize identically; query values round-trip. Duplicate query keys fail even when their values agree.
- [ ] **Step 2:** Run `pnpm --filter letter-garden exec vitest run tests/puzzle.test.ts`; expect FAIL. Implement the functions, then expect PASS.
- [ ] **Step 3:** Commit: `feat: validate letter-garden puzzles and result URLs`.

### Task 5: Search with repeated letters and all-seven coverage

**Files:**
- Create: `apps/letter-garden/src/lib/search.ts`, `tests/search.test.ts`

**Interfaces:**
- `findWords(root: TrieNode, puzzle: Puzzle): SearchResults`.
- `SearchResults = { allSeven: string[]; groups: WordGroup[]; total: number }`; `WordGroup = { length: number; words: string[] }`. Groups contain only other words; total counts both sections.
- Minimum length is a named app constant set to 4, shared by build policy, search, and copy. Search consumes a validated puzzle and never mutates it or the trie.

- [ ] **Step 1: Write failing tests** using `['cat', 'carton', 'cartoon', 'coronation', 'action', 'inaction', 'ration', 'nectar']` and puzzle `acinort`, required `c`:
  - `allSeven` is `['coronation']` even though it has ten characters and repeated letters.
  - Other groups are lengths `[8, 7, 6]`, holding `['inaction']`, `['cartoon']`, and `['action', 'carton']` respectively.
  - `cat` fails the minimum, `ration` lacks `c`, and `nectar` contains forbidden `e`.
  - No match appears twice; `total` is 5. An unmatched valid puzzle yields empty sections and total 0.
  - Use a second required letter on the same set to prove the filter changes. Repeated calls produce identical results without changing the trie.
- [ ] **Step 2:** Implement depth-first traversal following only allowed-letter children. Never decrement available-letter counts. Carry a seven-bit coverage mask and required-letter flag; accept terminal nodes meeting the minimum and required-letter rule. A full coverage mask identifies all-seven words. Dictionary depth bounds traversal.
- [ ] **Step 3:** Run the focused tests; expect PASS. Add a deterministic comparison against a simple array-filter oracle for several fixture puzzles to catch missing or extra matches.
- [ ] **Step 4:** Commit: `feat: search letter sets with a required center letter`.

### Task 6: Build and load this app's dictionary

**Files:**
- Create: `apps/letter-garden/scripts/build-data.ts`, `src/lib/dictionary.ts`, `src/lib/data.ts`, `tests/build-data.test.ts`, `tests/data.test.ts`
- Modify: `apps/letter-garden/package.json`, `README.md`, `apps/letter-garden/README.md`

**Interfaces:**
- `buildData(lines: string[]): { trie: string; wordCount: number }` uses the shared word processor and codec with this app's lowercase/minimum/distinct-letter policy.
- CLI reads `data/wamerican/words.txt` and writes only `apps/letter-garden/public/data/trie.txt`. Resolve both paths from `import.meta.url`, not the caller's working directory. Keep filesystem imports in the build script.
- `loadTrie(): Promise<TrieNode>` fetches `/data/trie.txt`, checks HTTP status, caches the in-flight/resolved promise, and clears the cache on fetch or decode rejection so another call can retry. Keep the loader app-local.
- `build:data` runs `tsx scripts/build-data.ts`; `dev` and `build` generate data before Astro runs.

- [ ] **Step 1: Write failing pipeline tests:** trim, deduplicate, reject capitals/proper nouns, possessives, accents, hyphens, short words, and words using more than seven distinct letters. Preserve `coronation`. Decode the output and verify the Task 5 fixture behavior. Include a test over the real source file confirming known valid words and policy invariants.
- [ ] **Step 2: Write failing loader tests:** two simultaneous calls fetch once; successful later calls reuse the result; HTTP rejection and network rejection permit retry. Stub a decode rejection to verify cache reset without expanding the existing codec's parsing contract.
- [ ] **Step 3:** Implement and run the focused tests. Run `pnpm --filter letter-garden build:data`; record output word count, raw size, and compressed size using Node's `zlib` rather than introducing a command-line compression dependency.
- [ ] **Step 4:** Run the build script from the root and the app directory; compare output bytes. Run each app's build independently and confirm neither writes into the other's `public/data/`.
- [ ] **Step 5:** Commit: `feat: build and lazily load the letter-garden dictionary`.

### Task 7: Build the seven-letter entry and required-letter selector

**Files:**
- Create: `apps/letter-garden/src/scripts/puzzle-form.ts`, `src/scripts/home.ts`, `src/styles/letter-garden.css`, `tests/puzzle-form-dom.test.ts`
- Modify: `apps/letter-garden/src/pages/index.astro`, `docs/design-system.md`

**Interfaces:**
- `mountPuzzleForm(form: HTMLFormElement, initial?: Puzzle): void` owns normalization feedback and a native radio group for required-letter selection; the raw text input remains untouched during editing and IME composition.
- Form DOM: `puzzle-form`, `letters-input`, `letters-note`, `required-letters`, `form-error`. Seven native radios share `name="required"`; the fieldset legend is "Required center letter". Letters input uses `name="letters"`.
- Form uses `method="get" action="/results"`; the script validates then navigates with `puzzleUrl`. Errors stay in place with an associated message and focus on the invalid input or selector. A noscript message explains that solving needs JavaScript.

- [ ] **Step 1:** Test selector rendering from seven valid letters, accessible labels, one selection, retention of a valid selection after reordering, and clearing it when its letter disappears or the set becomes invalid. Re-rendering must not steal keyboard focus or reset an unchanged selection. Disabled/absent options cannot submit stale required values.
- [ ] **Step 2:** Implement the normal text input with uppercase CSS, autocorrect and spellcheck off, plus the seven radio options. Make labels thumb-sized (at least 44 by 44 CSS pixels). Use native arrow-key radio behavior and a visible selected-state indicator in addition to color.
- [ ] **Step 3:** Test that invalid input stays on home with a useful message, a missing required selection is announced, and valid submission produces a canonical URL. Include paste and composition events; do not rewrite input mid-composition.
- [ ] **Step 4:** Add the masthead, a short instruction, Solve button, example link `/results?letters=acinort&required=c`, source note, and dictionary limitation footer. Confirm no `/data/*` request occurs while entering or selecting letters.
- [ ] **Step 5:** Review the phone layout in both themes and with keyboard focus. Document the new selector in the design system. Commit: `feat: add letter-garden puzzle entry and center selection`.

### Task 8: Add shareable results with loading, errors, and editing

**Files:**
- Create: `apps/letter-garden/src/pages/results.astro`, `src/scripts/results.ts`, `tests/results-dom.test.ts`
- Modify: `apps/letter-garden/src/styles/letter-garden.css`

**Interfaces:**
- Results DOM: `puzzle-summary`, `edit-puzzle`, `edit-form`, `results-status`, `results-content`, `retry-load`, `invalid-puzzle`. Retain one h1 in display and edit states.
- On direct navigation, validate the URL before fetching data. Missing or invalid values show "Check your letters" with a repair form and specific error; preserve raw values in that form, keep result content empty, and fetch nothing. Do not redirect invalid URLs silently.
- Valid noncanonical URLs use `history.replaceState` to canonicalize without another page load. Read URL values into text nodes or input values, never HTML strings.
- Valid results initially show "Finding words…" in a polite status region. Success announces the total and all-seven count once. Failure shows a plain error and Retry; Retry uses the loader's cache-reset behavior.

- [ ] **Step 1:** Test URL validation, no-fetch invalid states, canonical replacement, loading/success/error transitions, and Retry. Repeated Retry actions during a load must share one operation and never append duplicate results.
- [ ] **Step 2:** Implement the static results shell and controller using `validatePuzzle`, `loadTrie`, and `findWords`. Disable Retry while loading; ensure rejected promises are handled and stale result content is cleared.
- [ ] **Step 3:** Show all seven letters and explicitly label the required letter in the summary. Edit opens a prefilled instance of the Task 7 form; Escape and Cancel restore focus to Edit. Valid submission navigates to the new canonical URL. Give editing and repair forms unique IDs where they coexist.
- [ ] **Step 4:** Keep auto-loaded results from stealing focus. Move focus intentionally after edit/cancel and user-triggered recovery when its originating control disappears. Keep lists outside live regions. Include New search and the source/limitations footer.
- [ ] **Step 5:** Commit: `feat: add shareable letter-garden results and recovery states`.

### Task 9: Render all-seven words and paged length groups

**Files:**
- Create: `apps/letter-garden/src/scripts/word-groups.ts`, `tests/word-groups-dom.test.ts`
- Modify: `apps/letter-garden/src/scripts/results.ts`, `src/styles/letter-garden.css`

**Interfaces:**
- `renderResults(container: HTMLElement, results: SearchResults, pageSize?: number): void`; default page size 50. Clear previous output before rendering. Use h2 section headings and h3 length headings, with counts beside headings.
- Always show the all-seven heading with its count. If there are other matches but no all-seven words, say "No words use all seven letters." If total is 0, show one overall empty-state explanation rather than several repeated no-match messages.
- Render all-seven words once, alphabetically, before other length groups. Keep this renderer local: raga-man's partial renderer and copy are not a reusable result contract yet.

- [ ] **Step 1: Write failing DOM tests:** all-seven section comes first; other groups preserve descending lengths and alphabetical words; all-seven words are absent from other groups; full counts remain correct when lists are paged.
- [ ] **Step 2:** Test a 120-word list: 50 initial rows; Show more reveals the other 70, removes itself, and focuses the first new word. Test both all-seven and ordinary groups. Two render calls leave one set of sections.
- [ ] **Step 3:** Implement empty states, safe text rendering, and paging. Explain "Uses all seven letters; letters may repeat" beside the dedicated list. Do not add scores or game-specific claims.
- [ ] **Step 4:** Connect the renderer and verify loading and retry never leave stale counts or duplicate headings. Run letter-garden unit tests and build.
- [ ] **Step 5:** Commit: `feat: group letter-garden words and highlight all-seven matches`.

### Task 10: Verify both solvers and prepare independent deployment

**Files:**
- Create: `apps/letter-garden/playwright.config.ts`, `e2e/flow.spec.ts`, `e2e/input.spec.ts`, `e2e/results.spec.ts`, `wrangler.jsonc`, app-owned icons under `public/`
- Modify: `apps/letter-garden/package.json`, root `package.json`, `README.md`, `apps/letter-garden/README.md`, `docs/solver-suite-plan.md`, `docs/design-system.md`

**Interfaces:**
- Phone browser project uses port 4322 with `pnpm exec astro preview --port 4322 --ignore-lock`. Use a desktop project for layout/focus smoke checks. Set `reuseExistingServer: !process.env.CI`; keep raga-man on port 4321.
- App script `test:e2e` runs Playwright; `deploy:cf` builds then invokes Wrangler. Root `deploy:letter-garden` targets only this app. No suite-wide deployment command.
- Worker name `letter-garden`, compatibility date set to implementation date, assets directory `./dist`. Leave custom domains and DNS for separately authorized release work. Use app-specific favicon/touch icons; do not ship raga-man's `r` tile as letter-garden's identity. Existing typography and CSS/vector tools are sufficient for a letter tile.

- [ ] **Step 1: Write end-to-end tests** over the real generated dictionary:
  - Home has no word-data requests. Enter `T R O N I C A`, choose `C`, Solve; URL canonicalizes to `letters=acinort&required=c`.
  - `coronation` appears under All seven letters; `cartoon` appears only in the seven-letter other group; `ration` and `nectar` do not appear. Results survive refresh and direct URL navigation.
  - Invalid lengths, duplicates, required letter outside the set, missing params, and duplicate query keys show repairable errors without a trie request.
  - Edit changes the required letter and yields the correct new URL/results; Escape and Cancel restore focus. Spaces, punctuation notes, uppercase input, paste, and keyboard radio selection work.
  - A failed trie fetch shows Retry; after the failure is removed, Retry succeeds without duplicate sections. Double actions do not duplicate groups.
  - A fixture trie supplied by request interception exercises no matches, no all-seven matches, and more than 50 words deterministically; do not rely on dictionary counts for paging tests.
  - System theme, saved override, blocked storage, reduced motion, keyboard focus, and readable selection labels work on both pages. No horizontal overflow on a narrow phone or at 200% zoom; controls remain usable on desktop.
- [ ] **Step 2:** Run `pnpm test`, `pnpm build`, and `pnpm test:e2e`. Run package TypeScript checks as well. Both app builds must work independently from regenerated assets; verify a frozen-lockfile install. Investigate every new failure. If the recorded raga-man spacing failure remains, report it explicitly with the baseline evidence rather than weakening the check or calling the full suite green.
- [ ] **Step 3:** Measure decode-plus-search time with the actual generated trie and several valid inputs, including a high-match set. Use a phone viewport and browser CPU throttling, record the settings and timings, and inspect for long tasks. Target visible results within two seconds under the recorded conditions; viewport size alone is not a mobile performance measurement. Add a worker only if measurements justify it, updating the plan before that expansion.
- [ ] **Step 4:** Check heading order, form labels, radio keyboard behavior, error associations, status announcements, focus recovery, contrast, light/dark layouts, footer placement, and touch targets. Include a screen-reader walkthrough where available and document any unverified checks.
- [ ] **Step 5:** Add the app's icons and Worker configuration. Run `pnpm --filter letter-garden exec wrangler deploy --dry-run` from the app context via the workspace command and inspect its static asset output. Do not publish during this implementation task. Ensure raga-man's Worker configuration is unchanged.
- [ ] **Step 6:** Update READMEs with commands, dictionary provenance, measured asset sizes, and release instructions. Update the suite plan and design documentation to describe the implemented shared modules and app. Record validation results and known failures.
- [ ] **Step 7:** Commit: `feat: verify letter-garden and add its worker configuration`.

## Completion Criteria

- Both apps build and run independently using the shared packages, with solver rules kept local.
- Valid input produces reproducible results from its URL; invalid input can be repaired without fetching word data.
- Repeated-letter words and all-seven classification pass pure-function tests and the real-data browser flow.
- Home loads no dictionary; result loading, failure, retry, editing, and pagination have tested behavior.
- Product records name the dictionary and its limits. The interface and metadata use letter-garden's identity and American English.
- Shared extraction adds no raga-man regression. All new checks pass; any pre-existing failure is reported with evidence.
- Deployment is configured and locally validated. Publishing and custom-domain setup remain separate release actions.
