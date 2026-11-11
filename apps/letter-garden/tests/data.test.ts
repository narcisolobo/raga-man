import { afterEach, expect, it, vi } from 'vitest';

const decode = vi.hoisted(() => vi.fn());
vi.mock('@solver-suite/word-data/trie', () => ({ decodeTrie: decode }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  decode.mockReset();
});

it('shares the fetch in progress and reuses the decoded result', async () => {
  const root = { end: false, children: new Map() };
  decode.mockReturnValue(root);
  const fetch = vi.fn().mockResolvedValue(new Response('c(a(r(e$)))'));
  vi.stubGlobal('fetch', fetch);
  const { loadTrie } = await import('../src/lib/data');
  const first = loadTrie();
  expect(loadTrie()).toBe(first);
  expect(await first).toBe(root);
  expect(loadTrie()).toBe(first);
  expect(fetch).toHaveBeenCalledExactlyOnceWith('/data/trie.txt');
});

it('allows retry after HTTP, network, and decoder failures', async () => {
  const root = { end: false, children: new Map() };
  decode.mockImplementationOnce(() => { throw new Error('decode'); }).mockReturnValue(root);
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce(new Response('', { status: 503 }))
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(new Response('broken'))
    .mockResolvedValueOnce(new Response('c(a(r(e$)))')));
  const { loadTrie } = await import('../src/lib/data');
  await expect(loadTrie()).rejects.toThrow('503');
  await expect(loadTrie()).rejects.toThrow('offline');
  await expect(loadTrie()).rejects.toThrow('decode');
  await expect(loadTrie()).resolves.toBe(root);
});
