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
  const { exact, trie } = buildData(readFileSync(new URL('../../../data/wamerican/words.txt', import.meta.url), 'utf8').split('\n'));
  const output = new URL('../public/data/', import.meta.url);
  mkdirSync(output, { recursive: true });
  writeFileSync(new URL('exact.json', output), exact);
  writeFileSync(new URL('trie.txt', output), trie);
  console.log(`exact.json ${(exact.length / 1024).toFixed(0)} KB, trie.txt ${(trie.length / 1024).toFixed(0)} KB`);
}
