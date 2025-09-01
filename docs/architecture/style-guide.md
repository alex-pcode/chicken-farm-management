# BMad Farm Management - Brand Style Guide

*Complete design system for consistent marketing across all channels*

---

## 🎨 Core Brand Identity

### Primary Color Palette
- **Primary Purple**: `#4F39F6` (rgb(79, 57, 246))
- **Secondary Purple**: `#2A2580` (rgb(42, 37, 128)) 
- **Dark Purple**: `#191656` (rgb(25, 22, 86))
- **Light Purple**: `#6B5CE6` (rgb(107, 92, 230))
- **Accent Purple**: `#8833D7` (rgb(136, 51, 215))

### Supporting Colors
- **Success Green**: `#10B981` (rgb(16, 185, 129))
- **Warning Orange**: `#F59E0B` (rgb(245, 158, 11))
- **Error Red**: `#EF4444` (rgb(239, 68, 68))
- **Info Blue**: `#3B82F6` (rgb(59, 130, 246))

### Neutral Palette
- **Background Light**: `#F9FAFB` (rgb(249, 250, 251))
- **Background White**: `#FFFFFF` (rgb(255, 255, 255))
- **Text Primary**: `#111827` (rgb(17, 24, 39))
- **Text Secondary**: `#6B7280` (rgb(107, 114, 128))
- **Border**: `#E5E7EB` (rgb(229, 231, 235))

---

## 📝 Typography System

### Font Family
- **Primary**: Fraunces (serif) - Used for all text elements
- **Fallback**: serif system fonts

### Typography Hierarchy
- **Display Text**: 64px (80px desktop) / Font Weight 700 / Line Height 1.1
- **Page Title**: 32px (40px desktop) / Font Weight 600 / Line Height 1.25
- **Section Title**: 24px / Font Weight 600 / Line Height 1.3
- **Body Text**: 16px / Font Weight 400 / Line Height 1.6
- **Caption**: 12px / Font Weight 500 / Line Height 1.4

### Typography Usage
```css
/* Display - Hero headlines */
font-size: 4rem; font-weight: 700; letter-spacing: -0.025em;

/* Title - Page headers */
font-size: 2rem; font-weight: 600; letter-spacing: -0.02em;

/* Body - Regular content */
font-size: 1rem; font-weight: 400; line-height: 1.6;

/* Caption - Labels and meta */
font-size: 0.75rem; font-weight: 500; text-transform: uppercase;
```

---

## 🖼️ Visual Design Language

### Glass Morphism Cards
Primary design pattern featuring:
- **Background**: `rgba(255, 255, 255, 0.95)`
- **Backdrop Filter**: `blur(12px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.2)`
- **Border Radius**: `16px`
- **Shadow**: `0 8px 32px rgba(243, 229, 215, 0.1)`

### Gradient Overlays
- **Corner Gradient**: Radial blur effect in top-right
  - Position: `top: -25%, right: -15%`
  - Size: `width: 35%, height: 30%`
  - Colors: `#4F39F6 to #191656`
  - Filter: `blur(60px)`

### Dark Theme Cards
- **Background**: Linear gradient `135deg, #4F39F6, #7C3AED`
- **Text**: White with high contrast
- **Border**: `1px solid rgba(255, 255, 255, 0.1)`
- **Shadow**: `0 4px 20px rgba(79, 57, 246, 0.2)`

---

## 🔲 UI Component Library Reference

*This section maps design patterns to actual UI components in the codebase for consistent implementation.*

### 📊 Card Components (`src/components/ui/cards/`)

#### StatCard Component
**Usage**: Primary metrics display for dashboards
```typescript
<StatCard 
  title="Monthly Egg Production"
  total={145}
  label="eggs this month"
  variant="default | compact | gradient | corner-gradient | dark"
  change={12}
  changeType="increase | decrease"
  icon="🥚"
/>
```

**Design Specifications**:
- **Base Class**: `glass-card` with glassmorphism styling
- **Variants Available**:
  - `default`: Standard glass card with corner gradient overlay
  - `compact`: Reduced padding for dense layouts
  - `gradient`: Blue gradient background for highlights
  - `corner-gradient`: Radial purple gradient in top-right corner
  - `dark`: Dark theme with purple gradient background
- **Animation**: Hover scale 1.02 + enhanced shadow
- **Typography**: Bold title, large value, small label text

#### MetricDisplay Component
**Usage**: Simple metric presentations
- **Styling**: Clean layout with emphasized numbers
- **Best For**: KPI displays, summary statistics

#### ComparisonCard Component  
**Usage**: Side-by-side metric comparisons
- **Layout**: Dual-column design with clear visual separation
- **Colors**: Uses success/warning colors for positive/negative changes

#### ProgressCard Component
**Usage**: Progress tracking with visual indicators
- **Progress Bar**: Purple gradient fill on light background
- **Labels**: Clear percentage and contextual text

#### SummaryCard Component
**Usage**: Multi-metric overview cards
- **Layout**: Grid-based metric arrangement
- **Styling**: Consistent with glass-card aesthetic

### 🎛️ Form Components (`src/components/ui/forms/`)

#### FormButton Component
**Usage**: All form interactions and CTAs
```typescript
<FormButton 
  variant="primary | secondary | danger"
  size="sm | md | lg"
  type="button | submit | reset"
  loading={isSubmitting}
  fullWidth={true}
>
  Save Changes
</FormButton>
```

**Design Specifications**:
- **Primary Variant**: `shiny-cta` class with animated gradient
  - **Background**: Purple gradient with animated shine effect
  - **Text**: White with high contrast
  - **Hover**: Gradient animation + subtle scale
- **Secondary Variant**: `neu-button-secondary` class
  - **Background**: Transparent with subtle border
  - **Text**: Gray with hover color shift to white
  - **Hover**: Purple background transition
- **Danger Variant**: Red background for destructive actions

#### FormCard Component
**Usage**: Form containers and sectioning
- **Base**: Glass-card styling with form-specific padding
- **Features**: Optional title, subtitle, loading states
- **Layout**: Consistent spacing for form elements

#### FormField Component
**Usage**: Input wrappers with labels and validation
- **Structure**: Label + input + error message layout
- **Styling**: Consistent spacing and typography
- **Validation**: Error state styling with red accents

### 📋 Table Components (`src/components/ui/tables/`)

#### DataTable Component
**Usage**: Complex data presentations with sorting/filtering
- **Header**: Bold typography with sort indicators
- **Rows**: Alternating background with hover states
- **Actions**: Inline buttons with consistent styling

#### PaginatedDataTable Component
**Usage**: Large datasets with pagination controls
- **Pagination**: Purple accent buttons with clear navigation
- **Page Size**: Dropdown selector with consistent styling

#### EmptyState Component
**Usage**: No-data scenarios with helpful guidance
- **Icon**: Large emoji or illustration
- **Text**: Encouraging message with clear next steps
- **CTA**: Primary button for main action

### 🖼️ Layout Components (`src/components/ui/layout/`)

#### PageContainer Component
**Usage**: Main page wrapper with consistent margins
- **Mobile**: Full width with 16px padding
- **Desktop**: Max 1200px centered with responsive padding

#### SectionContainer Component
**Usage**: Content section organization
- **Spacing**: Consistent vertical rhythm
- **Background**: Optional glass-card styling

#### GridContainer Component  
**Usage**: Responsive grid layouts
- **Breakpoints**: 1-4 columns based on screen size
- **Gaps**: Consistent spacing using design token scale

#### CardContainer Component
**Usage**: Card-based layout organization
- **Grid**: Auto-fit responsive card arrangement
- **Spacing**: Consistent gaps between cards

### 🗂️ Navigation Components (`src/components/ui/navigation/`)

#### Pagination Component
**Usage**: Multi-page data navigation
- **Active State**: Purple background with white text
- **Inactive**: Light background with gray text
- **Hover**: Subtle purple tint

#### SimplePagination Component
**Usage**: Basic previous/next navigation
- **Buttons**: Consistent with FormButton secondary style
- **Icons**: Clear directional indicators

### 🕐 Timeline Components (`src/components/ui/timeline/`)

#### Timeline Component
**Usage**: Chronological event display
```typescript
<Timeline items={[
  { date: "2024-01-15", title: "New Batch Added", description: "12 hens acquired", type: "acquisition" },
  { date: "2024-01-20", title: "First Eggs", description: "Started laying", type: "laying_start" }
]} />
```
- **Connector**: Vertical line with purple accent
- **Events**: Glass-card styling with consistent spacing
- **Icons**: Contextual emojis for different event types

### 🔀 Modal Components (`src/components/ui/modals/`)

#### Modal Component
**Usage**: Primary modal dialogs
- **Backdrop**: Semi-transparent black overlay
- **Container**: Glass-card styling with enhanced shadow
- **Animation**: Fade in with scale effect

#### ConfirmDialog Component
**Usage**: Confirmation prompts
- **Layout**: Title + message + action buttons
- **Actions**: Danger button + cancel button

#### AlertDialog Component
**Usage**: Information alerts
- **Variants**: Success, warning, error, info color schemes
- **Icon**: Contextual status icon

---

## 🎨 Design System Classes

### Core Styling Classes

#### `.glass-card`
**Primary container pattern throughout the application**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(243, 229, 215, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Variants**:
- `.glass-card-compact`: Reduced padding for dense layouts
- `.glass-card-detailed`: Enhanced shadow for important content
- `.glass-card-elevated`: Extra shadow for floating elements

#### `.shiny-cta`
**Animated button pattern for primary actions**
- **Background**: Animated purple gradient with shine effect
- **Animation**: CSS-based gradient animation for premium feel
- **Accessibility**: Respects prefers-reduced-motion settings

#### `.neu-*` Classes
**Neumorphic design elements**
- `neu-input`: Form inputs with subtle depth
- `neu-button-secondary`: Secondary button styling
- `neu-stat`: Statistic display containers
- `neu-form`: Form container styling
- `neu-title`: Section heading styles

### Component-Specific CSS Classes

#### Status and State Classes
- `.loading-shimmer`: Skeleton loading animation
- `.error-state`: Error styling with red accents
- `.success-state`: Success styling with green accents
- `.warning-state`: Warning styling with orange accents

#### Layout Helper Classes
- `.container-responsive`: Responsive container widths
- `.grid-auto-fit`: Auto-fitting grid layouts
- `.flex-center`: Centered flex layouts
- `.space-y-*`: Consistent vertical spacing

---

## 🔧 Implementation Guidelines

### Using UI Components

#### ✅ Correct Usage
```tsx
// Use existing UI components for consistency
import { StatCard, FormButton, Modal } from '../ui';

// Follow established variant patterns
<StatCard variant="corner-gradient" />
<FormButton variant="primary" size="lg" />
```

#### ❌ Avoid These Patterns
```tsx
// Don't create one-off styled components
<div className="bg-white rounded-lg shadow-lg p-4"> // Use StatCard instead

// Don't override component styles arbitrarily  
<FormButton className="!bg-red-500"> // Use variant="danger" instead
```

### CSS Class Naming Convention
- **Component Base**: `.component-name` (e.g., `.stat-card`)
- **Variants**: `.component-variant` (e.g., `.glass-card-compact`)
- **States**: `.component--state` (e.g., `.button--loading`)
- **Modifiers**: `.component-modifier` (e.g., `.card-elevated`)

### Responsive Component Behavior
- **Mobile First**: All components designed for mobile, enhanced for desktop
- **Touch Targets**: Minimum 44px for interactive elements
- **Breakpoint Consistency**: Use established breakpoints (640px, 1024px, 1280px)
- **Spacing Scale**: Consistent spacing using 8px base unit

---

## 📐 Layout & Spacing

### Grid System
- **Mobile**: Single column, 16px gaps
- **Tablet**: 2-3 columns, 24px gaps  
- **Desktop**: 3-4 columns, 32px gaps
- **Large Desktop**: Up to 12-column complex grids

### Spacing Scale
- **XS**: 8px (0.5rem)
- **SM**: 12px (0.75rem)
- **MD**: 16px (1rem) 
- **LG**: 24px (1.5rem)
- **XL**: 32px (2rem)
- **2XL**: 48px (3rem)

### Container Constraints
- **Mobile**: Full width with 16px padding
- **Desktop**: Max 1200px centered
- **Large Screens**: Max 1600px with expanded padding

---

## ✨ Animation & Interactions

### Transition Timing
- **Fast**: 0.15s `cubic-bezier(0.4, 0, 0.2, 1)`
- **Normal**: 0.3s `cubic-bezier(0.4, 0, 0.2, 1)`
- **Slow**: 0.5s `cubic-bezier(0.4, 0, 0.2, 1)`

### Hover Effects
- **Cards**: `translateY(-2px)` + enhanced shadow
- **Buttons**: `scale(1.02)` + color shift
- **Interactive Elements**: Smooth color transitions

### Loading States
- **Skeleton**: Shimmer animation with purple accent
- **Spinner**: Purple with smooth rotation
- **Progressive**: Fade-in with scale effect

---

## 🎯 Marketing Application Guidelines

### Website Design
- **Hero Sections**: Display typography with corner gradients
- **Content Cards**: Glass morphism with subtle shadows
- **CTAs**: Primary purple gradient buttons with hover lift
- **Navigation**: Glass card style with purple active states

### Social Media Templates
- **Background**: Light gray `#F9FAFB` or glass cards
- **Accent**: Purple gradients for highlights
- **Text Hierarchy**: Bold Fraunces headings, readable body text
- **Icons**: Farm/agricultural emojis (🥚, 🐔, 🌾, 📊)

### Video Editing Style
- **Color Grading**: Warm, natural tones with purple accents
- **Typography**: Fraunces font for overlays and titles
- **Transitions**: Smooth fades and scale effects
- **Graphics**: Glass morphism cards for data overlays

### Print Materials
- **Primary Colors**: Use purple palette for headers and accents
- **Typography**: Fraunces for headlines, clean sans-serif for body
- **Layout**: Card-based design with generous white space
- **Data Viz**: Purple color scheme for charts and infographics
  - Use CHART_COLORS palette for consistency with application
  - Category-specific colors for expense breakdowns
  - Extended 8-color series for complex multi-data visualizations

---

## 📊 Data Visualization Style

### Chart Color Palette
Based on our purple-first brand identity, all charts use a cohesive color scheme:

#### Primary Chart Colors
- **Primary**: `#4F39F6` (rgb(79, 57, 246)) - Main data series
- **Secondary**: `#2A2580` (rgb(42, 37, 128)) - Secondary data series
- **Tertiary**: `#191656` (rgb(25, 22, 86)) - Third data series
- **Accent**: `#6B5CE6` (rgb(107, 92, 230)) - Highlighted values
- **Highlight**: `#8833D7` (rgb(136, 51, 215)) - Special emphasis

#### Extended Color Series
For multi-series charts and complex visualizations:
1. `#544CE6` - Primary variant
2. `#2A2580` - Secondary
3. `#191656` - Tertiary
4. `#6B5CE6` - Accent
5. `#4A3DC7` - Medium purple
6. `#8833D7` - Highlight
7. `#66319E` - Alternative purple
8. `#7C4CE6` - Light variant

#### Category-Specific Colors
Consistent colors for expense categories and data types:
- **Birds**: `#544CE6` - Primary operations
- **Feed**: `#2A2580` - Feeding operations  
- **Equipment**: `#191656` - Infrastructure costs
- **Veterinary**: `#6B5CE6` - Health management
- **Maintenance**: `#4A3DC7` - Upkeep activities
- **Supplies**: `#8833D7` - General supplies
- **Start-up**: `#66319E` - Initial investments
- **Other**: `#544CE6` - Miscellaneous expenses

#### Chart Type Defaults
- **Bar Charts**: `#544CE6` (Primary variant)
- **Line Charts**: `#2A2580` (Secondary)
- **Area Charts**: `#544CE6` (Primary variant)
- **Pie Charts**: `#544CE6` (Primary variant)

### Chart Layout Standards
- **Margins**: 
  - Default: `{ top: 5, right: 5, left: 0, bottom: 5 }`
  - Compact: `{ top: 5, right: 15, left: 10, bottom: 5 }`
  - Detailed: `{ top: 10, right: 10, left: 0, bottom: 10 }`
- **Y-Axis Width**: 25px for consistent spacing
- **Background**: White/light gray
- **Grid Lines**: Light gray with low opacity
- **Text**: Dark gray for readability

### Implementation Reference
All chart colors are defined in `src/constants/chartColors.ts`:

```typescript
import { CHART_COLORS } from '../constants/chartColors';

// Use predefined chart colors
const chartConfig = {
  data: CHART_COLORS.primary,
  secondary: CHART_COLORS.secondary,
  categories: CHART_COLORS.categories
};

// For specific expense categories
<BarChart fill={CHART_COLORS.categories.Feed} />

// For chart type defaults
<LineChart stroke={CHART_COLORS.line} />
```

### Status/Progress Colors
- **Positive/Success**: Green `#10B981`
- **Warning/Attention**: Orange `#F59E0B`
- **Error/Critical**: Red `#EF4444`
- **Neutral/Info**: Blue `#3B82F6`

---

## 🔍 Accessibility Standards

### Contrast Requirements
- **Text on Background**: Minimum 4.5:1 ratio
- **Interactive Elements**: Minimum 3:1 ratio
- **Status Indicators**: High contrast with clear symbols

### Motion Sensitivity
- **Reduced Motion**: Disable animations for users who prefer static content
- **Essential Motion**: Keep functional animations (loading, progress)
- **Timing**: Respect user preferences for animation speed

---

## 📱 Responsive Behavior

### Breakpoints
- **Mobile**: 0-640px (single column, larger touch targets)
- **Tablet**: 641-1023px (2-3 columns, medium spacing)
- **Desktop**: 1024-1279px (3-4 columns, comfortable spacing)
- **Large**: 1280px+ (complex grids, generous spacing)

### Mobile Optimizations
- **Touch Targets**: Minimum 44px for interactive elements
- **Font Scaling**: Smaller display text, maintained readability
- **Card Spacing**: Reduced padding, maintained visual hierarchy
- **Navigation**: Horizontal scroll for tabs, bottom dock for main nav

---

## 🛡️ Brand Consistency Checklist

### Every Marketing Piece Should Include:
✅ Purple color palette as primary brand colors
✅ Fraunces typography for headers and important text
✅ Glass morphism design language where applicable (use `.glass-card` components)
✅ Consistent spacing using 8px grid system
✅ Agricultural/farm imagery and iconography (🥚, 🐔, 🌾, 📊)
✅ High contrast for accessibility compliance (minimum 4.5:1 ratio)
✅ Smooth animations respecting motion preferences (`prefers-reduced-motion`)

### Development-Specific Checklist:
✅ Use existing UI components from `components/ui/` instead of creating new ones
✅ Follow established component variant patterns (`primary`, `secondary`, `danger`)
✅ Implement responsive behavior using established breakpoints
✅ Use design system CSS classes (`.glass-card`, `.shiny-cta`, `.neu-*`)
✅ Include proper TypeScript props for component variants
✅ Test components in both light and dark themes
✅ Ensure loading states and error handling are included

### Avoid These Elements:
❌ Competing color schemes (stick to purple palette)
❌ Multiple font families in single design
❌ Harsh shadows or stark contrasts (use glass morphism instead)
❌ Overcomplicated layouts (favor card-based design)
❌ Poor contrast ratios (test with accessibility tools)
❌ Essential content in animations only (provide static fallbacks)
❌ One-off styled components (use existing UI library)
❌ Arbitrary CSS overrides (extend component variants instead)

## 📋 Component Usage Quick Reference

### For Dashboard Metrics
```tsx
import { StatCard } from './ui/cards/StatCard';
<StatCard variant="corner-gradient" title="Eggs Today" total={24} />
```

### For Form Interactions
```tsx
import { FormButton, FormCard } from './ui/forms';
<FormCard title="Add New Bird">
  <FormButton variant="primary">Save Bird</FormButton>
</FormCard>
```

### For Data Tables
```tsx
import { PaginatedDataTable } from './ui/tables';
<PaginatedDataTable columns={columns} data={data} />
```

### For Modal Dialogs
```tsx
import { ConfirmDialog } from './ui/modals';
<ConfirmDialog 
  title="Delete Batch?" 
  message="This action cannot be undone."
  onConfirm={handleDelete}
/>
```

### For Layout Structure
```tsx
import { PageContainer, GridContainer } from './ui/layout';
<PageContainer>
  <GridContainer>
    {/* Content cards */}
  </GridContainer>
</PageContainer>
```

---

## 🔗 Related Documentation

- **Component API Documentation**: See individual component files in `src/components/ui/`
- **Design System Classes**: Full CSS definitions in `src/index.css`
- **TypeScript Types**: Component prop types in respective component files
- **Usage Examples**: See `src/components/examples/` for implementation patterns

---

*This comprehensive style guide ensures consistent brand experience across all applications, marketing materials, and development implementations. The UI component library provides the building blocks for maintaining design consistency at scale.*