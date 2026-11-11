import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { buildTrie, encodeTrie } from '@solver-suite/word-data/trie';
import { prepareWords } from '@solver-suite/word-data/words';
import { isPlayableWord } from '../src/lib/dictionary';

export function buildData(lines: string[]): { trie: string; wordCount: number } {
  const words = prepareWords(lines, isPlayableWord);
  return { trie: encodeTrie(buildTrie(words)), wordCount: words.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = new URL('../../../data/wamerican/words.txt', import.meta.url);
  const { trie, wordCount } = buildData(readFileSync(source, 'utf8').split('\n'));
  const output = new URL('../public/data/', import.meta.url);
  mkdirSync(output, { recursive: true });
  writeFileSync(new URL('trie.txt', output), trie);
  console.log(`trie.txt: ${wordCount} words, ${trie.length} bytes raw, ${gzipSync(trie).length} gzip, ${brotliCompressSync(trie).length} Brotli`);
}
