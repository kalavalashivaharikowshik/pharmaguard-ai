import { Moon, Sun, Monitor } from 'lucide-react';

import { useTheme, type ThemeMode } from '../../theme/ThemeContext';

const ORDER: ThemeMode[] = ['light', 'dark', 'system'];

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor;

  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      title={`Theme: ${mode} (click for ${next})`}
      aria-label={`Switch theme, current ${mode}`}
      className="h-11 w-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
    >
      <Icon size={20} />
    </button>
  );
}
