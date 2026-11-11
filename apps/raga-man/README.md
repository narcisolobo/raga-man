# raga-man

[Live site](https://raga-man.narcisolobo.workers.dev/)

<p>
  <img src="../../docs/screenshot-home.png" width="280" alt="raga-man home page with an empty letter field and a Solve button">
  <img src="../../docs/screenshot.png" width="280" alt="raga-man results page for the letters ELPSTA, listing palest, pastel, petals, plates, pleats and staple as exact matches">
</p>

A mobile-friendly anagram solver for leftover puzzle letters. Exact matches appear first; partial matches are available on demand, grouped by length. Results can be shared through `/results?letters=...`.

The app is static and runs entirely in the browser. The home page downloads no word data, and the trie is fetched only when partial matches are requested.

## Development

From the repository root, run `pnpm dev` or `pnpm --filter raga-man <command>`. From this directory:

```sh
pnpm dev
pnpm test
pnpm build
pnpm test:e2e             # requires a production build
pnpm preview
pnpm deploy:cf
```

`dev` and `build` generate `public/data/exact.json` and `public/data/trie.txt` from [the source dictionary](../../data/wamerican/README.md). Deployment uses this directory's `wrangler.jsonc`, preserving the `raga-man` Worker name and existing routes.

## Documentation

- [Product brief](PRODUCT.md)
- [Behavior spec](SPEC.md)
- [Shared design system](../../docs/design-system.md), whose source paths are relative to this app
- [Suite plan](../../docs/solver-suite-plan.md)

## Credits

The Debian wamerican dictionary is derived from SCOWL; see its [license notice](../../data/wamerican/COPYRIGHT). Fonts are Old Standard TT and Libre Franklin, served locally through Fontsource.
