import { Icon } from '@iconify/react';
import useTheme from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2.5 bg-card border border-border rounded-full hover:bg-muted transition-all"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <Icon icon={theme === 'light' ? 'lucide:moon' : 'lucide:sun'} className="text-xl text-primary" />
    </button>
  );
}
