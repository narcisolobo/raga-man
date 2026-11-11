# letter-garden

Planned seven-letter word finder: enter seven distinct letters and choose the required center letter. Results use only those letters, may repeat letters, and must include the required letter. Identify words that use all seven letters.

This directory reserves the app's place in the workspace. It has no package manifest, build, or deployment yet.

Before implementation, write this app's `PRODUCT.md` and `SPEC.md`, choose and document its dictionary and minimum word length, then add its own Astro app, tests, data build, and Wrangler configuration.

## Shared modules to extract during implementation

- `packages/word-data`: trie construction, encoding, decoding, and dictionary-processing mechanics. Keep dictionary selection and filtering policy explicit per app. Keep Node-only build code separate from browser exports.
- `packages/ui`: design tokens, fonts, theme behavior, and an Astro layout with app-supplied name, subtitle, and description.

Keep anagram indexing, partial-search rules, the 48-letter entry limit, and anagram presentation in raga-man. Implement letter-garden's search separately over the shared trie. Its required-letter input should follow the shared visual system without inheriting raga-man's eight-column input assumptions.

Generate only the word assets this app needs into its own `public/data/`. Preserve dictionary license notices. Test and deploy each app independently; add an explicit root deployment command when this app is ready.

See the [suite plan](../../docs/solver-suite-plan.md) and [design system](../../docs/design-system.md).
