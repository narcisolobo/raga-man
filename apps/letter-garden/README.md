# letter-garden

A static seven-letter word finder. Enter seven distinct letters, choose the required center letter, and find words that can be made from those letters. Results identify words that use all seven distinct letters and can be shared by URL.

From the repository root:

```sh
pnpm dev:letter-garden
pnpm build:letter-garden
pnpm preview:letter-garden
pnpm --filter letter-garden test
pnpm --filter letter-garden test:e2e
```

Build before running Playwright. The development and preview servers use port 4322; Playwright starts its own preview on port 4422. Development and production builds generate `public/data/trie.txt` from [Debian wamerican](../../data/wamerican/README.md), derived from SCOWL. The current trie contains 41,351 words and measures 248,058 bytes raw, 59,925 bytes gzip, and 51,904 bytes Brotli using Node's default compression settings. The home page loads no dictionary.

To check the Worker bundle locally after building:

```sh
pnpm --filter letter-garden exec wrangler deploy --dry-run
```

For release, `pnpm deploy:letter-garden` builds and publishes only this app.

See the [product brief](PRODUCT.md), [behavior spec](SPEC.md), and [shared design system](../../docs/design-system.md).
