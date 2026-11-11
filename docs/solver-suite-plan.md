# A suite of solvers: a loose plan

Status: raga-man and letter-garden are implemented. The remaining candidates are ideas. Drafted 2026-11-06.

## Why a suite

raga-man works because it does one job well: someone is stuck on the last bit of a puzzle, on a phone, and wants the answer fast. The same players are stuck in the same way in other daily word games. Each of those moments is its own small tool.

The rule for splitting is **by job, not by feature**. Scrabble was taken out of raga-man's roadmap for exactly this reason: a rack, blank tiles and scoring is a different job, with a different dictionary and a different input, and bolting it on would blur a sharp product.

## Principles carried over from raga-man

- One job per tool, answered in a second or two.
- Phone first, one column, thumb-sized targets.
- No junk: every word shown should be one a player would plausibly accept.
- Plain voice, no jokes in the interface. Use American English.
- Static and client-side over prebuilt data: no accounts, no history, no backend.
- WCAG 2.2 AA, both color themes, keyboard and screen-reader support.
- Say plainly what the word list cannot know. Each game uses its own curated list, so a general dictionary will sometimes show words the game rejects, or miss words it accepts.
- Playful, descriptive names that suggest the tool's job, such as raga-man and letter-garden. Never use a game's own (trademarked) name for a tool.

## Candidate solvers

Ordered by how I would build them. "Reuse" means how much of raga-man's engine carries over.

| # | Solver | Question it answers | Input | Reuse |
|---|--------|---------------------|-------|-------|
| 1 | **letter-garden**, the letter-set helper (Spelling Bee style) | Which words use only these seven letters and include the center one? Which use all seven? | Seven letters, one marked required | High: the same trie search with one changed rule (letters may repeat) |
| 2 | **Five-letter helper** (Wordle style) | Given my guesses and their tile colors, what is left? | A guess grid with tappable green, yellow and gray tiles | Medium: a constraint filter over a five-letter list, with a new input |
| 3 | **Pattern helper** (crossword and hangman) | Which words fit `c_r_et`, minus these letters? | A pattern with blanks, plus excluded letters | High: a length-and-pattern lookup. Needs a list that includes proper nouns |
| 4 | **Multi-word anagram finder** | Which sets of words together use every letter? | Letters, as in raga-man | Medium: new search over the existing index. Names and phrases are the typical use |
| 5 | **Board solver** (Strands or Boggle style) | Which words can be traced through adjacent cells of this grid? | The full letter grid | Medium: grid search over the trie. More spoiler-heavy than raga-man, so a different product |
| 6 | **Chain solver** (Letter Boxed style) | Which two or three words, chained, use all twelve letters with no two consecutive letters on one side? | Twelve letters on four sides | Medium: the most interesting search problem of the set |
| 7 | **Rack solver** (Scrabble style) | What are the best plays for this rack, with blanks? | A rack with wildcards, later a board | Low: needs a different list (two- and three-letter words matter), blanks and scoring |

**Not recommended.** A connections-style helper depends on meaning, not spelling, so a word list will not get you there. Cipher and cryptogram solvers are a different engine entirely.

**Suggested first two: 1 and 2.** letter-garden is the smallest step and reaches the same audience. The five-letter helper has the biggest audience and is a good test of whether the shared design system holds up on a new kind of input.

## Shared code

- `packages/word-data` builds, encodes, and decodes tries and prepares dictionary entries according to the caller's policy.
- `packages/ui` provides the Astro shell, design tokens, typography, and theme toggle.
- Each app has its own search, data loader, input controls, and result presentation.

## Structure and hosting

**Repository structure.** The pnpm workspace contains both Astro apps. Each owns its tests, generated assets, and Worker configuration. Source dictionaries and license notices live in `data/`. Shared trie storage and word preparation live in `packages/word-data`. The layout, tokens, fonts, and theme toggle live in `packages/ui`.

**Where they live.** The suite's domain is `solversuite.app`, registered through Cloudflare so its DNS zone is on Cloudflare from the start. Worker custom domains need an active Cloudflare zone, which is why `narcisolobo.com` (DNS at GoDaddy, with many records) was not used. Each solver is its own Worker on its own subdomain (`raga-man.solversuite.app`, `letter-garden.solversuite.app`) via a `custom_domain: true` route in its `wrangler.jsonc`. The bare domain is reserved for a small index page linking to all of them. `.app` requires HTTPS, which Cloudflare provides.

**If DNS has to stay at GoDaddy.** Cloudflare Pages supports a subdomain CNAME with outside DNS, but it is the older path and would mean changing the deploy target. Not the plan; recorded so the option is not lost.

**raga-man's old address.** raga-man was first published at `raga-man.narcisolobo.workers.dev`. Its config keeps `workers_dev: true` so links to that address keep working; switch it to `false` once they no longer matter. Newer solvers set `workers_dev: false` from the start.

## Word lists

- raga-man uses Debian `wamerican` (SCOWL), stored in `data/wamerican/`: lowercase a to z, four letters or more.
- Each solver should name its list and say why. Puzzle-specific tools may want different length rules or a list that keeps proper nouns.
- A Scrabble-style rack solver would want a tournament dictionary. Those have licensing terms, so check them first. Free lists such as ENABLE exist; check their terms too.
- The five-letter helper may want results ranked by how common a word is. That needs a frequency source, which is not chosen yet.

## Rough sequencing

1. Workspace preparation complete: raga-man lives in `apps/raga-man/`. The domain is `solversuite.app`.
2. Shared word-data and UI modules and the letter-garden app are implemented. See `apps/letter-garden/README.md`.
3. Five-letter helper.
4. Pick the rest by what actually gets used. Add the index page at the bare domain once there are two or three to link to.

Each solver goes through the same loop: a short product brief, shape the page, build, review, then document what was built in the shared design system or the app's product records, as appropriate.

## Risks and open questions

- **Design drift.** Several sites on one design system will diverge unless it is shared and versioned. This is the main argument for extracting the shared code early.
- **Upkeep.** Every solver is a site to maintain. Keep each one small, static and boring.
- **Scope creep inside a tool.** Each solver should refuse the features that belong to a different job, the way raga-man now refuses Scrabble.
- **Product records.** Product briefs and behavior specs live alongside each app as `PRODUCT.md` and `SPEC.md`. The shared design system lives in `docs/design-system.md`.
- **Spoilers.** A full-board solver gives away the whole puzzle. Decide deliberately whether that is the kind of tool wanted.
- **Cost and ownership.** The domain registration and any renewal are the owner's to decide.
