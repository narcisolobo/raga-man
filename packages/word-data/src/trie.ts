export interface TrieNode {
  end: boolean;
  children: Map<string, TrieNode>;
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
