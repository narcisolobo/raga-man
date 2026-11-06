export interface ExactView {
  /** Words to list: every exact match except the input itself. */
  words: string[];
  heading: string;
  /** True when partial matches should open without a button press. */
  openPartials: boolean;
}

/**
 * Presentation rule for exact matches: a result identical to the input is
 * redundant, so it is hidden. The heading says so when that happened, which
 * keeps a player who typed a real word from wondering where it went.
 */
export function presentExact(matches: string[], letters: string): ExactView {
  const inputWasWord = matches.includes(letters);
  const words = matches.filter((word) => word !== letters);
  const heading =
    words.length > 0
      ? inputWasWord
        ? 'Other exact matches'
        : 'Exact matches'
      : inputWasWord
        ? 'No other exact matches'
        : 'No exact matches';
  return { words, heading, openPartials: words.length === 0 };
}
