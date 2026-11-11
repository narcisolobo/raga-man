/** Every solver the index lists, in the order shown. Icons come from `pnpm icons`. */
export interface Solver {
  /** Folder under apps/, and the icon's file name in src/icons/. */
  app: string;
  name: string;
  /** The solver's own home headline, so the index promises what the app says. */
  pitch: string;
  url: string;
}

export const SOLVERS: Solver[] = [
  {
    app: 'raga-man',
    name: 'raga-man',
    pitch: 'Find every word hiding in your leftover letters.',
    url: 'https://raga-man.solversuite.app/',
  },
  {
    app: 'letter-garden',
    name: 'letter-garden',
    pitch: 'Find every word hiding in your seven letters.',
    url: 'https://letter-garden.solversuite.app/',
  },
];
