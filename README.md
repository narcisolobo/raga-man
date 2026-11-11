# Solver suite

Small, static word-puzzle tools built with Astro and TypeScript. Each solver has its own input, search rules, word-data build, tests, and Cloudflare Worker deployment.

- **[raga-man](apps/raga-man/README.md)**: the anagram solver. [Live site](https://raga-man.narcisolobo.workers.dev/).
- **[letter-garden](apps/letter-garden/README.md)**: the planned seven-letter word finder.

## Development

Requires Node 26 or newer and pnpm. Run from the repository root:

```sh
pnpm install
pnpm dev                 # raga-man development server
pnpm build               # build all implemented apps
pnpm test                # unit tests across the workspace
pnpm test:e2e            # browser tests; run pnpm build first
pnpm preview             # preview raga-man's production build
pnpm deploy:raga-man     # build and deploy only raga-man
```

Use `pnpm --filter raga-man <command>` to run an app command directly. There is no suite-wide deployment command. Each app owns its Wrangler configuration and output directory.

## Repository layout

- `apps/raga-man/`: the existing app and its product records.
- `apps/letter-garden/`: preparation notes for the next solver; no app implementation yet.
- `data/`: source dictionaries with provenance and license notices. Generated assets belong in each app's `public/data/` and are ignored by Git.
- `docs/design-system.md`: the visual system, currently documented through raga-man.
- `docs/solver-suite-plan.md`: product direction and planned shared modules.

The workspace includes `packages/*` for future shared modules. Extract `word-data` and `ui` when letter-garden is implemented, using its actual requirements. Until then, raga-man's code stays together.

Names may be playful but should suggest the tool's job. Never use a game's own name for a tool. Use American English in documentation and interface copy.
