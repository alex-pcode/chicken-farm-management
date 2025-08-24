# Shared Components Library Guide

## Overview

The comprehensive shared component library eliminates code duplication and provides consistent UI patterns across the Chicken Manager application. This library includes forms, UI components, layouts, modals, navigation, and tables with full testing coverage.

**Status**: ✅ **COMPLETED** - Fully implemented with comprehensive test coverage and visual consistency testing framework

## Library Structure

### Component Categories

```
src/components/
├── forms/           # Form input components and layouts
├── ui/              # Shared UI component library
│   ├── cards/       # Data display cards
│   ├── layout/      # Layout and container components  
│   ├── modals/      # Dialog and modal components
│   ├── navigation/  # Pagination and navigation
│   └── tables/      # Data tables and lists
└── __tests__/       # Component test coverage
```

## Form Components

#### FormCard
```typescript
import { FormCard } from '../components/ui/forms';

<FormCard
  title="Add New Entry"
  subtitle="Enter your data below"
  onSubmit={handleSubmit}
  loading={isSubmitting}
>
  {/* Form fields */}
</FormCard>
```

#### FormField
```typescript
import { FormField } from '../components/ui/forms';

<FormField
  label="Email Address"
  required
  error={errors.email}
  help="We'll never share your email"
>
  <input type="email" className="neu-input" />
</FormField>
```

#### FormButton
```typescript
import { FormButton } from '../components/ui/forms';

<FormButton
  type="submit"
  variant="primary"
  size="lg"
  loading={isSubmitting}
  fullWidth
>
  Save Changes
</FormButton>
```

### Available Components

| Component | Purpose | Props | Testing |
|-----------|---------|-------|---------|
| `TextInput` | Text input with validation | `value`, `onChange`, `error`, `label` | ✅ |
| `NumberInput` | Numeric input with validation | `value`, `onChange`, `min`, `max` | ✅ |
| `DateInput` | Date picker component | `value`, `onChange`, `dateFormat` | ✅ |
| `TextareaInput` | Multi-line text input | `value`, `onChange`, `rows` | ✅ |
| `SelectInput` | Dropdown selection | `value`, `onChange`, `options` | ✅ |
| `FormCard` | Card wrapper for forms | `title`, `children` | ✅ |
| `FormGroup` | Form field grouping | `label`, `children`, `error` | ✅ |
| `FormRow` | Horizontal form layout | `children`, `spacing` | ✅ |
| `SubmitButton` | Form submission button | `loading`, `disabled`, `children` | ✅ |

### Usage Examples

#### Basic Form Structure
```typescript
import { FormCard, FormGroup, TextInput, NumberInput, SubmitButton } from '../components/forms';

const EggEntryForm = () => {
  const [formData, setFormData] = useState({
    date: '',
    count: 0
  });

  return (
    <FormCard title="Add Egg Entry">
      <FormGroup label="Date" error={errors.date}>
        <DateInput
          value={formData.date}
          onChange={(date) => setFormData(prev => ({ ...prev, date }))}
        />
      </FormGroup>
      
      <FormGroup label="Egg Count" error={errors.count}>
        <NumberInput
          value={formData.count}
          onChange={(count) => setFormData(prev => ({ ...prev, count }))}
          min={0}
          max={100}
        />
      </FormGroup>
      
      <SubmitButton loading={isSubmitting} onClick={handleSubmit}>
        Save Entry
      </SubmitButton>
    </FormCard>
  );
};
```

#### Form Validation Integration
```typescript
import { useFormValidation } from '../hooks/forms';

const useEggEntryForm = () => {
  const { formData, errors, isValid, updateField, validate } = useFormValidation({
    initialData: { date: '', count: 0 },
    validationRules: {
      date: { required: true, type: 'date' },
      count: { required: true, type: 'number', min: 0 }
    }
  });

  return { formData, errors, isValid, updateField, validate };
};
```

## UI Component Library

### Card Components

Located in `src/components/ui/cards/`:

#### MetricDisplay
```typescript
import { MetricDisplay } from '../components/ui/cards';

<MetricDisplay
  value={1247}
  label="Total Revenue"
  format="currency"
  variant="large"
  color="success"
  unit="USD"
  precision={2}
/>
```

**Props:**
- `value`: string | number - The metric value to display
- `label`: string - Label text for the metric
- `format`: 'number' | 'currency' | 'percentage' | 'decimal' - Value formatting
- `variant`: 'default' | 'large' | 'compact' - Size variant
- `color`: 'default' | 'success' | 'warning' | 'danger' | 'info' - Color scheme
- `unit`: string (optional) - Unit suffix to display
- `precision`: number (default: 2) - Decimal precision
- `loading`: boolean - Show loading skeleton

#### StatCard
```typescript
import { StatCard } from '../components/ui/cards';

<StatCard
  title="Total Eggs This Month"
  value={156}
  change={+12}
  changeType="positive"
  icon="🥚"
/>
```

#### ProgressCard
```typescript
import { ProgressCard } from '../components/ui/cards';

<ProgressCard
  title="Monthly Goal Progress"
  current={156}
  target={200}
  unit="eggs"
  color="blue"
/>
```

#### ComparisonCard
```typescript
import { ComparisonCard } from '../components/ui/cards';

<ComparisonCard
  title="This Month vs Last Month"
  currentValue={156}
  previousValue={142}
  label="eggs collected"
/>
```

### Layout Components

Located in `src/components/ui/layout/`:

#### GridContainer
```typescript
import { GridContainer } from '../components/ui/layout';

<GridContainer columns={3} gap="md">
  <StatCard {...eggStats} />
  <StatCard {...feedStats} />
  <StatCard {...expenseStats} />
</GridContainer>
```

#### PageContainer
```typescript
import { PageContainer } from '../components/ui/layout';

<PageContainer title="Dashboard" subtitle="Chicken Management Overview">
  {/* Page content */}
</PageContainer>
```

### Modal Components

Located in `src/components/ui/modals/`:

#### AlertDialog
```typescript
import { AlertDialog } from '../components/ui/modals';

<AlertDialog
  isOpen={showAlert}
  onClose={() => setShowAlert(false)}
  title="Confirm Delete"
  message="Are you sure you want to delete this entry?"
  onConfirm={handleDelete}
  confirmText="Delete"
  confirmVariant="danger"
/>
```

#### FormModal
```typescript
import { FormModal } from '../components/ui/modals';

<FormModal
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  title="Add New Customer"
  onSubmit={handleCustomerSubmit}
  submitText="Create Customer"
  loading={isSubmitting}
  size="lg"
>
  <CustomerForm />
</FormModal>
```

**Props:**
- `isOpen`: boolean - Modal visibility state
- `onClose`: () => void - Close handler
- `title`: string - Modal title
- `onSubmit`: (event: FormEvent) => void - Form submission handler
- `submitText`: string (default: "Submit") - Submit button text
- `cancelText`: string (default: "Cancel") - Cancel button text
- `loading`: boolean - Loading state with spinner
- `size`: 'sm' | 'md' | 'lg' | 'xl' - Modal size
- `showFooter`: boolean (default: true) - Show form buttons
- `submitDisabled`: boolean - Disable submit button

### Navigation Components

Located in `src/components/ui/navigation/`:

#### Pagination
```typescript
import { Pagination } from '../components/ui/navigation';

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  showFirstLast={true}
  showPageNumbers={5}
/>
```

#### PaginationControls
```typescript
import { PaginationControls, PageSizeSelector } from '../components/ui/navigation';

<PaginationControls
  currentPage={currentPage}
  totalItems={totalItems}
  pageSize={pageSize}
  onPageChange={setCurrentPage}
>
  <PageSizeSelector
    pageSize={pageSize}
    onPageSizeChange={setPageSize}
    options={[10, 25, 50, 100]}
  />
</PaginationControls>
```

### Chart Components

Located in `src/components/ui/charts/`:

#### ChartCard
```typescript
import { ChartCard } from '../components/ui/charts';

<ChartCard
  title="Monthly Revenue"
  subtitle="Revenue trends over time"
  height={300}
  loading={isLoading}
>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={chartData}>
      {/* Chart components */}
    </LineChart>
  </ResponsiveContainer>
</ChartCard>
```

**Props:**
- `title`: string - Chart title
- `subtitle`: string (optional) - Chart subtitle
- `height`: number (default: 240) - Chart height in pixels
- `loading`: boolean - Show loading state with spinner

### Table Components

Located in `src/components/ui/tables/`:

#### DataTable
```typescript
import { DataTable } from '../components/ui/tables';

const columns = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'count', label: 'Eggs', sortable: true },
  { key: 'actions', label: 'Actions', render: (row) => <ActionButtons row={row} /> }
];

<DataTable
  data={eggEntries}
  columns={columns}
  onSort={handleSort}
  sortField={sortField}
  sortDirection={sortDirection}
  loading={isLoading}
/>
```

#### EmptyState
```typescript
import { EmptyState } from '../components/ui/tables';

<EmptyState
  icon="📊"
  title="No Data Available"
  description="Start by adding your first entry"
  action={
    <button onClick={openForm}>Add Entry</button>
  }
/>
```

## Visual Consistency Testing Framework

### Comprehensive Testing Infrastructure

**Status**: ✅ **COMPLETED** - Full visual consistency testing framework operational

The shared component library includes a robust testing framework that ensures visual consistency and prevents regressions:

#### Test Coverage
- **43+ visual consistency tests** across all component categories
- **75+ component variant tests** covering all props and states
- **Responsive layout testing** at mobile, tablet, and desktop breakpoints
- **Design system validation** for OKLCH colors and glass-card effects
- **Animation consistency testing** for Framer Motion integration

#### Testing Structure
```
src/components/ui/__tests__/
├── cards/                          # Card component tests
│   ├── MetricDisplay.test.tsx     # 32 comprehensive test cases
│   ├── ProgressCard.test.tsx      # Progress variants and states
│   ├── ComparisonCard.test.tsx    # Change types and formatting
│   └── SummaryCard.test.tsx       # Item rendering and variants
├── modals/                        # Modal component tests
│   ├── Modal.test.tsx             # Size variants and glass styling
│   └── FormModal.test.tsx         # Form integration and loading
├── visual-consistency/            # Framework validation tests
│   ├── DesignSystem.test.tsx      # OKLCH colors and styling
│   ├── ResponsiveLayout.test.tsx  # Breakpoint testing
│   └── AnimationConsistency.test.tsx # Motion integration
└── utils/
    └── testUtils.tsx              # Reusable testing utilities
```

#### Visual Regression Protection
- **Snapshot testing** for all component variants
- **Design system enforcement** validates consistent styling
- **Cross-platform reliability** with locale-aware formatting
- **Automated visual consistency** checking in CI/CD

### Test Coverage

All shared components have comprehensive test coverage using Vitest and React Testing Library:

```typescript
// Example: TextInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TextInput } from '../TextInput';

describe('TextInput', () => {
  it('renders with label and value', () => {
    render(
      <TextInput
        label="Test Input"
        value="test value"
        onChange={vi.fn()}
      />
    );
    
    expect(screen.getByLabelText('Test Input')).toHaveValue('test value');
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(
      <TextInput
        label="Test Input"
        value=""
        onChange={onChange}
      />
    );
    
    fireEvent.change(screen.getByLabelText('Test Input'), {
      target: { value: 'new value' }
    });
    
    expect(onChange).toHaveBeenCalledWith('new value');
  });

  it('displays error message', () => {
    render(
      <TextInput
        label="Test Input"
        value=""
        onChange={vi.fn()}
        error="This field is required"
      />
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all component tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific component tests
npm test MetricDisplay

# Run visual consistency tests
npm test visual-consistency

# Update snapshots (when design changes are intentional)
npm test -- --update-snapshots
```

### Test Utilities

Comprehensive testing utilities in `src/components/ui/__tests__/utils/testUtils.tsx`:

```typescript
import { renderWithTestWrapper, testResponsiveLayout } from '../utils/testUtils';

// Render with proper context and mocking
const { getByTestId } = renderWithTestWrapper(<Component />);

// Test responsive behavior at different breakpoints
testResponsiveLayout(<Component />, [
  { width: 320, height: 568 },  // Mobile
  { width: 768, height: 1024 }, // Tablet
  { width: 1024, height: 768 }  // Desktop
]);
```

## Integration with Existing Components

### Migration Patterns

#### Before (Duplicate Code)
```typescript
// Multiple components had similar form patterns
const EggCounter = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Add Eggs</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Date</label>
        <input
          type="date"
          className="w-full px-3 py-2 border rounded-md"
          // ... duplicate styling and logic
        />
      </div>
      {/* More duplicate patterns */}
    </div>
  );
};
```

#### After (Shared Components)
```typescript
// Clean, reusable component usage
import { FormCard, FormGroup, DateInput } from '../components/forms';

const EggCounter = () => {
  return (
    <FormCard title="Add Eggs">
      <FormGroup label="Date">
        <DateInput
          value={date}
          onChange={setDate}
        />
      </FormGroup>
      {/* Clean, consistent patterns */}
    </FormCard>
  );
};
```

### Component Hook Integration

The shared components integrate seamlessly with custom hooks:

```typescript
// Hooks work perfectly with shared components
import { useEggEntryForm } from '../hooks/forms';
import { FormCard, FormGroup, DateInput, NumberInput, SubmitButton } from '../components/forms';

const EggEntryForm = () => {
  const {
    formData,
    errors,
    isValid,
    isSubmitting,
    updateField,
    handleSubmit
  } = useEggEntryForm();

  return (
    <FormCard title="Egg Entry">
      <FormGroup label="Date" error={errors.date}>
        <DateInput
          value={formData.date}
          onChange={(date) => updateField('date', date)}
        />
      </FormGroup>
      
      <FormGroup label="Count" error={errors.count}>
        <NumberInput
          value={formData.count}
          onChange={(count) => updateField('count', count)}
          min={0}
        />
      </FormGroup>
      
      <SubmitButton
        loading={isSubmitting}
        disabled={!isValid}
        onClick={handleSubmit}
      >
        Save Entry
      </SubmitButton>
    </FormCard>
  );
};
```

## Design System Integration

### Neumorphic Design Classes

The shared components utilize a comprehensive neumorphic design system:

#### Core Classes
- **`.neu-form`**: Neumorphic container with soft shadows and rounded corners
- **`.neu-input`**: Inset input fields with subtle depth
- **`.neu-button`**: Primary action buttons with 3D effect
- **`.neu-button-secondary`**: Secondary buttons with border and hover states
- **`.neu-title`**: Styled headings with proper typography
- **`.neu-checkbox`**: Custom checkbox with neumorphic styling

#### Glass Card Effects
- **`.glass-card`**: Glassmorphism effect with backdrop blur and transparency
- **`.chart-card`**: Specialized container for chart components

#### Enhanced Button Styles
- **`.shiny-cta`**: Premium call-to-action buttons with gradient animations
- Responsive hover states with scale and shadow transitions
- Built-in loading states with spinners

### OKLCH Color Integration

Custom OKLCH color scheme for consistent brand colors:
```css
/* Success state color */
color: oklch(0.44 0.11 162.79);

/* Gradient backgrounds */
background: linear-gradient(to right, indigo-700, violet-600);
```

### Framer Motion Animations

All components include smooth animations:
- **Entry animations**: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`
- **Hover effects**: Scale and shadow transitions
- **Loading states**: Skeleton animations and spinners

## Performance Optimization

### Memoization Patterns

Shared components use React.memo and useMemo for optimal performance:

```typescript
// Optimized component rendering
export const StatCard = React.memo(({ title, value, change, changeType }) => {
  const formattedValue = useMemo(() => {
    return typeof value === 'number' ? value.toLocaleString() : value;
  }, [value]);

  const changeColor = useMemo(() => {
    return changeType === 'positive' ? 'text-green-600' : 'text-red-600';
  }, [changeType]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-semibold text-gray-900">{formattedValue}</p>
      {change && (
        <p className={`text-sm ${changeColor}`}>
          {change > 0 ? '+' : ''}{change}
        </p>
      )}
    </div>
  );
});
```

## Development Guidelines

### Adding New Shared Components

1. **Create component file** in appropriate category folder
2. **Add prop types** with comprehensive TypeScript interfaces
3. **Write tests** covering all functionality and edge cases
4. **Add to index exports** for easy importing
5. **Update documentation** with usage examples

### Component Standards

- **TypeScript**: All components must have proper type definitions
- **Testing**: Minimum 90% test coverage required
- **Performance**: Use React.memo for pure components
- **Accessibility**: Follow WCAG AA guidelines
- **Styling**: Consistent Tailwind CSS patterns

## Next Steps

### Immediate Opportunities

1. **Profile.tsx Integration**: Use shared components for Profile.tsx breakdown
2. **Enhanced Accessibility**: Add ARIA labels and keyboard navigation
3. **Animation Integration**: Enhance components with Framer Motion
4. **Storybook Integration**: Consider adding Storybook for component documentation

### shadcn/ui Migration

The existing shared component library provides a perfect foundation for shadcn/ui enhancement:

```typescript
// Future: Enhanced components with shadcn/ui
import { Button } from '../components/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/shadcn/card';

// Hybrid approach: shadcn accessibility + custom styling
const EnhancedStatCard = ({ title, value, change }) => {
  return (
    <Card className="neumorphic-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
        {change && <p className="text-sm text-muted-foreground">{change}</p>}
      </CardContent>
    </Card>
  );
};
```

## Related Files

- **Form Components**: `src/components/forms/`
- **UI Components**: `src/components/ui/`
- **Form Hooks**: `src/hooks/forms/`
- **Test Setup**: `src/test/setup.ts`
- **Type Definitions**: `src/types/index.ts`

---

*This document reflects the completed shared UI components implementation (Epic 2 & 4 foundation) as of January 2025.*