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
