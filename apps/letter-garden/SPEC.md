# letter-garden behavior

- Enter seven distinct ASCII letters. Lowercase input and strip other characters, noting ignored non-space characters. Reject repeated letters and any normalized length other than seven. Pick a required letter explicitly from the set.
- Submit to a shareable URL such as `/results?letters=acinort&required=c`. Canonical URLs sort and lowercase the letters. Valid noncanonical URLs are replaced in place. Invalid URLs show an editable form and fetch no word data.
- Find words of four or more letters using only the seven allowed letters and including the required one. Letters may repeat. Show words using all seven first, then the remaining words by length descending. Sort words alphabetically within each list. Show 50 at first and move focus to the first new word when showing the rest.
- Build a compact trie from the vendored wamerican list. Keep lowercase ASCII words with at most seven distinct letters. The home page fetches no word data. Results announce loading and completion, offer retry on failure, and explain when there are no matches.
- Use the shared masthead and theme toggle. Keep the form in one column with a native radio group. Show errors next to the relevant controls. Preserve a valid required selection across changes to the set and restore focus on edit cancellation.
- Both pages explain the dictionary's limits and link to the source. No scores, hints, or game-specific word-list claims.
