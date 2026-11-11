import { MIN_WORD_LENGTH } from './search';

export function isPlayableWord(word: string): boolean {
  return word.length >= MIN_WORD_LENGTH && /^[a-z]+$/.test(word) && new Set(word).size <= 7;
}
