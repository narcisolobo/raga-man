/** Trim entries before applying the consumer's dictionary policy. */
export function prepareWords(lines: string[], accept: (word: string) => boolean): string[] {
  return [...new Set(lines.map((line) => line.trim()).filter(accept))].sort();
}
