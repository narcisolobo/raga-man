import { decodeTrie, type TrieNode } from './trie';

let exactPromise: Promise<Map<string, string[]>> | undefined;
let triePromise: Promise<TrieNode> | undefined;

async function fetchOk(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response;
}

/** Cache the promise, but forget it on failure so a later call can retry. */
function cached<T>(load: () => Promise<T>, get: () => Promise<T> | undefined, set: (p: Promise<T> | undefined) => void): Promise<T> {
  const existing = get();
  if (existing) return existing;
  const promise = load().catch((error: unknown) => {
    set(undefined);
    throw error;
  });
  set(promise);
  return promise;
}

export function loadExact(): Promise<Map<string, string[]>> {
  return cached(
    async () => new Map(Object.entries((await (await fetchOk('/data/exact.json')).json()) as Record<string, string[]>)),
    () => exactPromise,
    (p) => (exactPromise = p),
  );
}

export function loadTrie(): Promise<TrieNode> {
  return cached(
    async () => decodeTrie(await (await fetchOk('/data/trie.txt')).text()),
    () => triePromise,
    (p) => (triePromise = p),
  );
}
