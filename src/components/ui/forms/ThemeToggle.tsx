import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

interface ThemeOption {
  value: 'light' | 'dark' | 'system';
  label: string;
  icon: string;
  description: string;
}

// Full options for Profile settings (includes System)
const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: '☀️', description: 'Use light mode' },
  { value: 'system', label: 'System', icon: '💻', description: 'Follow system preference' },
  { value: 'dark', label: 'Dark', icon: '🌙', description: 'Use dark mode' },
];

// Compact options for menu toggle (Light/Dark only, uses resolvedTheme)
const compactThemeOptions: Array<{ value: 'light' | 'dark'; label: string; icon: string }> = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
];

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'default'
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (variant === 'compact') {
    // Compact uses resolvedTheme (light/dark) and only shows those two options
    // Selecting either option sets that theme directly (overriding system)
    return (
      <div
        className={`inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 ${className}`}
        role="radiogroup"
        aria-label="Theme selection"
      >
        {compactThemeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={resolvedTheme === option.value}
            aria-label={`${option.label} theme`}
            onClick={() => setTheme(option.value)}
            className={`
              relative px-3 py-1.5 text-sm font-medium rounded-md
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-[#524AE6] focus:ring-offset-2
              dark:focus:ring-offset-gray-800
              ${resolvedTheme === option.value
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            {resolvedTheme === option.value && (
              <motion.div
                layoutId="theme-toggle-indicator"
                className="absolute inset-0 bg-white dark:bg-gray-700 rounded-md shadow-sm"
                initial={false}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Default variant uses theme (includes system) and shows all three options
  return (
    <div
      className={`space-y-3 ${className}`}
      role="radiogroup"
      aria-label="Theme selection"
    >
      {themeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          onClick={() => setTheme(option.value)}
          className={`
            w-full flex items-center gap-4 p-4 rounded-lg border-2
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#524AE6] focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            ${theme === option.value
              ? 'border-[#524AE6] bg-[#524AE6]/5 dark:bg-[#524AE6]/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
            }
          `}
        >
          <span className="text-2xl">{option.icon}</span>
          <div className="flex-1 text-left">
            <div className="font-medium text-gray-900 dark:text-white">
              {option.label}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {option.description}
            </div>
          </div>
          {theme === option.value && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 rounded-full bg-[#524AE6] flex items-center justify-center"
            >
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
          )}
        </button>
      ))}
    </div>
  );
};
