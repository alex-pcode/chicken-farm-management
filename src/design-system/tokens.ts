// Design System Tokens for Chicken Manager
// Foundation for Epic 4 shared UI components
// Based on actual colors extracted from the existing codebase

export const designTokens = {
  // Color System - Based on actual Chicken Manager colors
  colors: {
    // Primary brand colors (extracted from existing CSS)
    primary: {
      DEFAULT: '#4B70E2',      // --primary from CSS
      dark: '#4F46E5',         // Used in gradients and buttons  
      purple: '#7C3AED',       // Used in gradients (purple accent)
      light: '#FAF6F2',        // --primary-light
    },
    
    // Neumorphic colors (from existing design)
    neumorphic: {
      base: '#ecf0f3',         // --neu-1
      shadow: '#d1d9e6',       // --neu-2, --shadow-color  
      highlight: '#ffffff',     // --highlight-color
    },
    
    // Brand gradient colors (warm tones)
    brand: {
      warm1: '#D4A373',        // Used in brand gradients
      warm2: '#E9D5C4',        // Used in brand gradients
      beige1: '#F3E5D7',       // Card backgrounds
      beige2: '#FAF6F2',       // Light backgrounds
    },
    
    // Shiny CTA button colors (existing system)
    cta: {
      bg: '#4f46e5',           // --shiny-cta-bg
      bgSubtle: '#4338ca',     // --shiny-cta-bg-subtle
      fg: '#ffffff',           // --shiny-cta-fg
      highlight: '#818cf8',    // --shiny-cta-highlight
      highlightSubtle: '#a5b4fc', // --shiny-cta-highlight-subtle
    },
    
    // Neutral colors (existing usage)
    neutral: {
      white: '#f9f9f9',        // --white
      gray: '#a0a5a8',         // --gray
      black: '#181818',        // --black
      50: '#fafafa',
      100: '#f5f5f5', 
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    
    // Categorical colors (existing system)
    categorical: {
      holiday: '#B5E6D0',      // --holiday
      wellness: '#FFE5B4',     // --wellness
      wedding: '#FFD1D1',      // --wedding
      divorce: '#B5D8FF',      // --divorce
    },
    
    // Semantic colors (standard system)
    semantic: {
      success: {
        light: '#dcfce7',
        DEFAULT: '#16a34a',
        dark: '#15803d',
      },
      warning: {
        light: '#fef3c7', 
        DEFAULT: '#d97706',
        dark: '#92400e',
      },
      error: {
        light: '#fee2e2',
        DEFAULT: '#dc2626',
        dark: '#991b1b',
      },
      info: {
        light: '#dbeafe',
        DEFAULT: '#2563eb',
        dark: '#1d4ed8',
      },
    },
  },

  // Typography Scale (using Fraunces font)
  typography: {
    fontFamilies: {
      primary: ['Fraunces', 'serif'],  // --font-fraunces
      sans: [
        'ui-sans-serif',
        'system-ui', 
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Arial',
        'sans-serif'
      ],
    },
    
    fontSizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px  
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeights: {
      tight: 1.2,      // Used in headings
      normal: 1.5,
      relaxed: 1.625,
    },
    
    letterSpacing: {
      tight: '-0.02em',  // Used in headings
      normal: '0',
      wide: '0.025em',   // Used in buttons
    },
  },

  // Spacing Scale (consistent with existing --spacing-lg: 2.5rem)
  spacing: {
    px: '1px',
    0: '0px',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px - matches --spacing-lg
    11: '2.75rem',   // 44px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
  },

  // Border Radius (based on existing usage)
  borderRadius: {
    none: '0px',
    sm: '0.125rem',    // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px - 8px used in calculator
    xl: '0.75rem',     // 12px - 12px used in nav-link  
    '2xl': '1rem',     // 16px - 1rem used in cards
    '3xl': '1.5rem',   // 24px - 1.5rem used in neu-form
    full: '9999px',    // Used in shiny-cta (360px)
    card: '20px',      // Specific card radius
  },

  // Shadows (based on existing patterns)
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    
    // Neumorphic shadows (from existing design)
    neuInset: 'inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff',
    neuRaised: '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff',
    
    // Brand shadows (from existing cards)
    card: '0 4px 20px rgba(243, 229, 215, 0.2)',
    cardHover: '0 8px 32px rgba(243, 229, 215, 0.3)',
    stat: '0 4px 20px rgba(79, 70, 229, 0.2)',
  },

  // Component-Specific Tokens (based on existing components)
  components: {
    // Button variants (based on existing styles)
    button: {
      padding: {
        sm: '0.375rem 1rem',     // Based on btn-tactile
        md: '0.5rem 1rem',       // Standard button
        lg: '1rem 2rem',         // Based on shiny-cta
      },
      height: {
        sm: '2.25rem',           // 36px
        md: '2.75rem',           // 44px - neu-button height
        lg: '3rem',              // 48px
      },
      fontSize: {
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',          // shiny-cta size
      },
      borderRadius: {
        sm: '0.5rem',            // 8px
        md: '0.75rem',           // 12px
        lg: '360px',             // Full rounded (shiny-cta)
        neu: '1.375rem',         // Neumorphic buttons
      },
    },
    
    // Input field styling (based on existing)
    input: {
      height: '3rem',            // neu-input height
      padding: '0 1.5rem',       // neu-input padding
      borderRadius: '1rem',       // neu-input radius
      fontSize: '1rem',
    },
    
    // Card component styling (based on existing)
    card: {
      padding: '1.5rem',         // Standard card padding
      paddingLarge: '2rem',      // form-card padding
      borderRadius: '20px',      // card border-radius
      shadow: '0 4px 20px rgba(243, 229, 215, 0.2)',
    },
  },

  // Animation/Motion tokens (based on existing transitions)
  motion: {
    durations: {
      fast: 150,       // Quick interactions
      normal: 250,     // Standard transitions
      slow: 400,       // Complex animations
      tactile: 250,    // btn-tactile transition
      shiny: 800,      // shiny-cta transition
      card: 300,       // card hover transition
      neu: 300,        // neumorphic transitions
    },
    
    easings: {
      ease: [0.25, 0.1, 0.25, 1],
      easeIn: [0.4, 0, 1, 1],
      easeOut: [0, 0, 0.2, 1], 
      easeInOut: [0.4, 0, 0.2, 1],
      tactile: [0.25, 1, 0.5, 1],  // btn-tactile cubic-bezier
    },
    
    // Common animation presets (Framer Motion compatible)
    presets: {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.25 },
      },
      slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      },
      scaleIn: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.25 },
      },
      cardEntrance: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5 },
      },
    },
  },

  // Breakpoints (standard responsive design)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',     // Used in existing media queries
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

// Type-safe token access
export type DesignTokens = typeof designTokens
export type ColorTokens = typeof designTokens.colors
export type SpacingTokens = typeof designTokens.spacing

// Utility functions for token access
export const getColor = (path: string): string => {
  const keys = path.split('.')
  let value: any = designTokens.colors
  
  for (const key of keys) {
    value = value?.[key]
  }
  
  return typeof value === 'string' ? value : ''
}

export const getSpacing = (key: keyof SpacingTokens): string => {
  return designTokens.spacing[key] || '0px'
}

export const getMotionPreset = (preset: keyof typeof designTokens.motion.presets) => {
  return designTokens.motion.presets[preset]
}

// CSS custom properties generator for design tokens
export const generateCSSCustomProperties = () => {
  return `
    :root {
      /* Primary Colors */
      --color-primary: ${designTokens.colors.primary.DEFAULT};
      --color-primary-dark: ${designTokens.colors.primary.dark};  
      --color-primary-purple: ${designTokens.colors.primary.purple};
      --color-primary-light: ${designTokens.colors.primary.light};
      
      /* Brand Colors */
      --color-brand-warm-1: ${designTokens.colors.brand.warm1};
      --color-brand-warm-2: ${designTokens.colors.brand.warm2};
      
      /* Neumorphic Colors */
      --color-neu-base: ${designTokens.colors.neumorphic.base};
      --color-neu-shadow: ${designTokens.colors.neumorphic.shadow};
      --color-neu-highlight: ${designTokens.colors.neumorphic.highlight};
      
      /* Spacing */
      --spacing-sm: ${designTokens.spacing[2]};
      --spacing-md: ${designTokens.spacing[4]};
      --spacing-lg: ${designTokens.spacing[10]};
      --spacing-xl: ${designTokens.spacing[12]};
      
      /* Typography */
      --font-primary: ${designTokens.typography.fontFamilies.primary.join(', ')};
      --font-size-sm: ${designTokens.typography.fontSizes.sm};
      --font-size-base: ${designTokens.typography.fontSizes.base};
      --font-size-lg: ${designTokens.typography.fontSizes.lg};
      
      /* Shadows */
      --shadow-card: ${designTokens.shadows.card};
      --shadow-neu-inset: ${designTokens.shadows.neuInset};
      --shadow-neu-raised: ${designTokens.shadows.neuRaised};
    }
  `
}