import { decodeTrie, type TrieNode } from './trie';

let exactPromise: Promise<Map<string, string[]>> | undefined;
let triePromise: Promise<TrieNode> | undefined;

export function loadExact(): Promise<Map<string, string[]>> {
  exactPromise ??= fetch('/data/exact.json')
    .then((r) => r.json() as Promise<Record<string, string[]>>)
    .then((obj) => new Map(Object.entries(obj)));
  return exactPromise;
}

export function loadTrie(): Promise<TrieNode> {
  triePromise ??= fetch('/data/trie.txt')
    .then((r) => r.text())
    .then(decodeTrie);
  return triePromise;
}
