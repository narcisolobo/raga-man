# @solver-suite/icons

Generates every solver's app icons from the masthead typeface, Old Standard TT. The family rules are in [App icons](../../docs/design-system.md#app-icons).

```sh
pnpm icons
```

For each app in `src/apps.ts`, this writes three files to `apps/<app>/public/`:

- `favicon.svg`: ink tile, switching to the paper tile under `prefers-color-scheme: dark`
- `favicon.ico`: 16, 32 and 48px, each rendered at its own size
- `apple-touch-icon.png`: 180px on the ink tile, square (iOS rounds it)

The pages already link all three, so a new icon needs no markup changes. Rendering uses Playwright's Chromium, which the e2e tests already install.

## Adding a solver's icon

Add an entry to `ICONS` in `src/apps.ts`:

1. Start from the app's lowercase initial: `pathData(outline('x'))`. Coordinates are font units (1000 per em) with y pointing up. The baseline is y = 0 and the x-height is 474 (round letters overshoot to about 486).
2. Add one `accent` object that plays on the app's name. Reshape the letter where you can (`cut` removes part of an outline between two of its points), and keep the object readable at 32px.
3. Set `bounds` to the box around everything drawn; the script centres it on the tile.

Then run `pnpm icons` and check the result at 16, 32 and 180px in light and dark mode.
