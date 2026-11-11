/**
 * Shared DOM helpers for the square-letter field. The input stays the source
 * of truth (keyboard, IME, paste); the squares only mirror it.
 */

/** Make `squares` hold exactly `wanted` cells showing `letters`, with one active cell. */
export function syncSquares(
  squares: HTMLElement,
  letters: string,
  wanted: number,
  active: number,
  caret: number = active,
): void {
  while (squares.children.length > wanted) squares.lastElementChild?.remove();
  while (squares.children.length < wanted) {
    const square = document.createElement('span');
    square.className = 'sq';
    squares.append(square);
  }

  const activeIndex = Math.min(active, wanted - 1);
  Array.from(squares.children).forEach((square, index) => {
    const cell = square as HTMLElement;
    const letter = letters[index] ?? '';
    if (cell.dataset.letter !== letter) {
      cell.dataset.letter = letter;
      cell.textContent = letter;
      // Restart the pencil-in motion only for the square that changed.
      cell.classList.remove('is-new');
      if (letter) {
        void cell.offsetWidth;
        cell.classList.add('is-new');
      }
    }
    cell.classList.toggle('is-active', index === activeIndex);
    cell.classList.toggle('is-end', index === activeIndex && caret > activeIndex);
  });
}

/** Fill a container with read-only squares, one per letter and no empty cells. */
export function renderStaticSquares(container: HTMLElement, letters: string): void {
  container.replaceChildren(
    ...[...letters].map((letter) => {
      const square = document.createElement('span');
      square.className = 'sq';
      square.textContent = letter;
      return square;
    }),
  );
}
