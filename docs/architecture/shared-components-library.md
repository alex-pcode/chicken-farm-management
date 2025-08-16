# Shared Components Library Guide

## Overview

The comprehensive shared component library eliminates code duplication and provides consistent UI patterns across the Chicken Manager application. This library includes forms, UI components, layouts, modals, navigation, and tables with full testing coverage.

**Status**: ✅ **COMPLETED** - Fully implemented with comprehensive test coverage

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
>
  <CustomerForm />
</FormModal>
```

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

## Testing Infrastructure

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
npm test TextInput
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