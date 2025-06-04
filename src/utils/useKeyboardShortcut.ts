import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  callback: () => void;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
}

type ShortcutInput = ShortcutConfig | ShortcutConfig[];

export const useKeyboardShortcut = (config: ShortcutInput): void => {
  useEffect(() => {
    const shortcuts = Array.isArray(config) ? config : [config];

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !shortcut.ctrlKey || event.ctrlKey;
        const altMatch = !shortcut.altKey || event.altKey;
        const shiftMatch = !shortcut.shiftKey || event.shiftKey;
        const metaMatch = !shortcut.metaKey || event.metaKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config]);
};