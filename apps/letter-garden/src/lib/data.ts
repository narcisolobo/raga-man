import { decodeTrie, type TrieNode } from '@solver-suite/word-data/trie';

let pending: Promise<TrieNode> | undefined;

async function fetchTrie(): Promise<TrieNode> {
  const response = await fetch('/data/trie.txt');
  if (!response.ok) throw new Error(`Word list request failed: ${response.status}`);
  return decodeTrie(await response.text());
}

export function loadTrie(): Promise<TrieNode> {
  pending ??= fetchTrie().catch((error: unknown) => {
    pending = undefined;
    throw error;
  });
  return pending;
}
