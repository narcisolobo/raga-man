export function isPlayableWord(word: string): boolean {
  return /^[a-z]{4,}$/.test(word);
}

/** Trim, keep playable words, dedupe, sort alphabetically. */
export function filterWords(lines: string[]): string[] {
  return [...new Set(lines.map((l) => l.trim()).filter(isPlayableWord))].sort();
}
