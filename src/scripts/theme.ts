// Wires the theme toggle. The saved choice is applied before first paint by the
// inline script in the page head; this only handles the button.
const KEY = 'raga-theme';
const root = document.documentElement;
const button = document.getElementById('theme-toggle') as HTMLButtonElement | null;
const system = window.matchMedia('(prefers-color-scheme: dark)');

function isDark(): boolean {
  const chosen = root.getAttribute('data-theme');
  return chosen ? chosen === 'dark' : system.matches;
}

function sync(): void {
  button?.setAttribute('aria-pressed', String(isDark()));
}

if (button) {
  button.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage can be blocked; the choice then lasts for this page view only.
    }
    sync();
  });
  // Until the visitor chooses, the page follows the system setting.
  system.addEventListener('change', sync);
  sync();
  button.hidden = false;
}
