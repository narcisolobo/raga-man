import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildExactIndex } from '../src/lib/exact';
import { filterWords } from '../src/lib/filter';
import { buildTrie, encodeTrie } from '../src/lib/trie';

export function buildData(wordLines: string[]): { exact: string; trie: string } {
  const words = filterWords(wordLines);
  return {
    exact: JSON.stringify(buildExactIndex(words)),
    trie: encodeTrie(buildTrie(words)),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { exact, trie } = buildData(readFileSync('data/wamerican.txt', 'utf8').split('\n'));
  mkdirSync('public/data', { recursive: true });
  writeFileSync('public/data/exact.json', exact);
  writeFileSync('public/data/trie.txt', trie);
  console.log(`exact.json ${(exact.length / 1024).toFixed(0)} KB, trie.txt ${(trie.length / 1024).toFixed(0)} KB`);
}
