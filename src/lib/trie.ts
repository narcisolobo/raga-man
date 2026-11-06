export interface TrieNode {
  end: boolean;
  children: Map<string, TrieNode>;
}

export interface PartialGroup {
  length: number;
  words: string[];
}

const newNode = (): TrieNode => ({ end: false, children: new Map() });

export function buildTrie(words: string[]): TrieNode {
  const root = newNode();
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      let next = node.children.get(ch);
      if (!next) {
        next = newNode();
        node.children.set(ch, next);
      }
      node = next;
    }
    node.end = true;
  }
  return root;
}

/** Per child, alphabetically: letter, '$' if a word ends here, '(' children ')' if any. */
export function encodeTrie(root: TrieNode): string {
  let out = '';
  for (const ch of [...root.children.keys()].sort()) {
    const child = root.children.get(ch)!;
    out += ch;
    if (child.end) out += '$';
    if (child.children.size > 0) out += `(${encodeTrie(child)})`;
  }
  return out;
}

export function decodeTrie(encoded: string): TrieNode {
  let i = 0;
  const parseChildren = (node: TrieNode): void => {
    while (i < encoded.length && encoded[i] !== ')') {
      const child = newNode();
      node.children.set(encoded[i++]!, child);
      if (encoded[i] === '$') {
        child.end = true;
        i++;
      }
      if (encoded[i] === '(') {
        i++;
        parseChildren(child);
        i++; // consume ')'
      }
    }
  };
  const root = newNode();
  parseChildren(root);
  return root;
}

/** Words buildable from a subset of `letters`, length >= minLength and < letters.length. */
export function searchPartials(root: TrieNode, letters: string, minLength = 4): PartialGroup[] {
  const counts = new Array<number>(26).fill(0);
  for (const ch of letters) counts[ch.charCodeAt(0) - 97]!++;
  const byLength = new Map<number, string[]>();

  const walk = (node: TrieNode, prefix: string): void => {
    if (node.end && prefix.length >= minLength && prefix.length < letters.length) {
      const list = byLength.get(prefix.length) ?? [];
      list.push(prefix);
      byLength.set(prefix.length, list);
    }
    for (const [ch, child] of node.children) {
      const slot = ch.charCodeAt(0) - 97;
      if (counts[slot]! > 0) {
        counts[slot]!--;
        walk(child, prefix + ch);
        counts[slot]!++;
      }
    }
  };
  walk(root, '');

  return [...byLength.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([length, words]) => ({ length, words: words.sort() }));
}
