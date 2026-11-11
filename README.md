# Solver suite

Small, static word-puzzle tools built with Astro and TypeScript. Each solver has its own input, search rules, word-data build, tests, and Cloudflare Worker deployment.

- **[raga-man](apps/raga-man/README.md)**: the anagram solver. [Live site](https://raga-man.narcisolobo.workers.dev/).
- **[letter-garden](apps/letter-garden/README.md)**: the seven-letter word finder.

## Development

Requires Node 26 or newer and pnpm. Run from the repository root:

```sh
pnpm install
pnpm dev                 # raga-man development server
pnpm build               # build all implemented apps
pnpm test                # unit tests across the workspace
pnpm test:e2e            # browser tests; run pnpm build first
pnpm preview             # preview raga-man's production build
pnpm dev:letter-garden   # letter-garden development server on port 4322
pnpm deploy:raga-man     # build and deploy only raga-man
pnpm deploy:letter-garden # build and deploy only letter-garden
```

Use `pnpm --filter raga-man <command>` to run an app command directly. There is no suite-wide deployment command. Each app owns its Wrangler configuration and output directory.

## Repository layout

- `apps/raga-man/`: the existing app and its product records.
- `apps/letter-garden/`: the seven-letter word finder and its product records.
- `data/`: source dictionaries with provenance and license notices. Generated assets belong in each app's `public/data/` and are ignored by Git.
- `docs/design-system.md`: the shared visual system and app-specific components.
- `docs/solver-suite-plan.md`: product direction and planned shared modules.

`packages/word-data` contains the shared trie codec and dictionary preparation. `packages/ui` contains the Astro shell, design tokens, fonts, and theme toggle. Each app owns its search rules, dictionary policy, and input and result views.

Names may be playful but should suggest the tool's job. Never use a game's own name for a tool. Use American English in documentation and interface copy.

## License

The code in this repository is released under the [MIT License](LICENSE). The word list and fonts are covered by their own licenses; see [data/wamerican/COPYRIGHT](data/wamerican/COPYRIGHT) and the credits in each app's README.
