// Chart Color Palette
// Primary purple-based color scheme for all chart components

export const CHART_COLORS = {
  // Primary palette
  primary: '#4F39F6',
  secondary: '#2A2580', 
  tertiary: '#191656',
  accent: '#6B5CE6',
  highlight: '#8833D7',
  
  // Extended palette for multi-series charts
  extended: [
    '#544CE6', // Primary
    '#2A2580', // Secondary
    '#191656', // Tertiary
    '#6B5CE6', // Accent
    '#4A3DC7', // Medium
    '#8833D7', // Highlight
    '#66319E', // Alternative
    '#7C4CE6'  // Light variant
  ],
  
  // Category-specific mappings
  categories: {
    Birds: '#544CE6',
    Feed: '#2A2580',
    Equipment: '#191656', 
    Veterinary: '#6B5CE6',
    Maintenance: '#4A3DC7',
    Supplies: '#8833D7',
    'Start-up': '#66319E',
    Other: '#544CE6'
  },
  
  // Chart type defaults
  bar: '#544CE6',
  line: '#2A2580',
  area: '#544CE6',
  pie: '#544CE6'
} as const;

// Chart margin defaults for consistent spacing
export const CHART_MARGINS = {
  default: { top: 5, right: 5, left: 0, bottom: 5 },
  compact: { top: 5, right: 15, left: 10, bottom: 5 },
  detailed: { top: 10, right: 10, left: 0, bottom: 10 }
} as const;

// Y-axis width for consistent spacing
export const Y_AXIS_WIDTH = 25;