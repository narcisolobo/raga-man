import { describe, it, expect, vi } from 'vitest';
import { loadExact } from '../src/lib/data';

describe('loadExact', () => {
  it('fetches once, caches, and returns a Map', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ acer: ['acre', 'care', 'race'] })));
    vi.stubGlobal('fetch', fetchMock);
    const first = await loadExact();
    const second = await loadExact();
    expect(first.get('acer')).toEqual(['acre', 'care', 'race']);
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/data/exact.json');
  });
});

describe('loader failures', () => {
  it('rejects on a non-OK response and retries on the next call', async () => {
    vi.resetModules();
    const { loadTrie } = await import('../src/lib/data');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('<html>nope</html>', { status: 404 }))
      .mockResolvedValueOnce(new Response('c(a(r(e$t$)))'));
    vi.stubGlobal('fetch', fetchMock);
    await expect(loadTrie()).rejects.toThrow();
    const trie = await loadTrie();
    expect(trie.children.has('c')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
