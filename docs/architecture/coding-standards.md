# Coding Standards & Style Guide

## Overview

This document establishes coding standards for the Chicken Manager application to ensure consistency, maintainability, and quality across the codebase. These standards reflect the current architectural state and support the ongoing refactoring efforts.

**Status**: ✅ **Active Standards** - Applied to all new code and refactoring work

## File and Directory Naming

### Components
```typescript
// ✅ Good - PascalCase for components
Profile.tsx
EggCounter.tsx
FlockBatchManager.tsx
CustomerList.tsx

// ❌ Avoid
profile.tsx
egg-counter.tsx
flockbatchmanager.tsx
```

### Hooks
```typescript
// ✅ Good - camelCase with 'use' prefix
useEggEntries.ts
useFlockData.ts
useFormValidation.ts

// ❌ Avoid
EggEntries.ts
use-flock-data.ts
flockDataHook.ts
```

### Utilities and Services
```typescript
// ✅ Good - camelCase for utilities
apiUtils.ts
authApiUtils.ts
validationHelpers.ts

// ✅ Good - PascalCase for services
DataService.ts
ProductionService.ts
AuthService.ts
```

### Folders
```typescript
// ✅ Good - lowercase with hyphens for multi-word folders
src/components/
src/shared-components/
src/form-components/

// ✅ Good - camelCase for domain folders
src/contexts/
src/services/
src/utils/
```

## Component Structure Standards

### Standard Component Template
```typescript
// 1. Imports - Organized by source
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// 2. Third-party libraries
import { v4 as uuidv4 } from 'uuid';

// 3. Internal hooks and contexts
import { useAuth } from '../contexts/AuthContext';
import { useEggEntries } from '../contexts/OptimizedDataProvider';

// 4. Components
import { LoadingSpinner } from './LoadingSpinner';
import { StatCard } from './ui/cards/StatCard';

// 5. Services and utilities
import { apiService } from '../services/api';
import { validateEggEntry } from '../utils/validation';

// 6. Types (always last)
import type { EggEntry, ValidationError } from '../types';

// 7. Interface definition
interface ComponentProps {
  initialDate?: string;
  onSuccess?: (entry: EggEntry) => void;
  className?: string;
}

// 8. Component implementation
export const EggEntryForm: React.FC<ComponentProps> = ({
  initialDate = '',
  onSuccess,
  className
}) => {
  // 8.1 Hooks (state, context, custom hooks)
  const [formData, setFormData] = useState<EggEntry>({
    date: initialDate,
    count: 0,
    user_id: ''
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { refreshData } = useEggEntries();

  // 8.2 Event handlers
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setErrors([]);

      const validationErrors = validateEggEntry(formData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      const response = await apiService.production.saveEggEntries([{
        ...formData,
        user_id: user?.id || ''
      }]);

      if (response.success) {
        onSuccess?.(response.data[0]);
        setFormData({ date: '', count: 0, user_id: '' });
        await refreshData();
      } else {
        setErrors([{
          field: 'submit',
          message: response.error?.message || 'Failed to save entry'
        }]);
      }
    } catch (error) {
      setErrors([{
        field: 'submit',
        message: 'Network error - please try again'
      }]);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, onSuccess, refreshData]);

  const updateField = useCallback((field: keyof EggEntry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // 8.3 Effects
  useEffect(() => {
    if (initialDate && initialDate !== formData.date) {
      setFormData(prev => ({ ...prev, date: initialDate }));
    }
  }, [initialDate, formData.date]);

  // 8.4 Early returns (loading, error states)
  if (!user) {
    return <div>Please log in to add entries</div>;
  }

  // 8.5 Render
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-neumorphic p-6 ${className || ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Add Egg Entry
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form implementation */}
      </form>
    </motion.div>
  );
};
```

## Import Organization Standards

### Import Order Rules
```typescript
// 1. React and core libraries
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 2. Third-party libraries (alphabetical)
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// 3. Internal hooks and contexts
import { useAuth } from '../contexts/AuthContext';
import { useOptimizedData } from '../contexts/OptimizedDataProvider';

// 4. Components (grouped by category)
import { Button } from './forms/Button';
import { TextInput } from './forms/TextInput';
import { StatCard } from './ui/cards/StatCard';
import { LoadingSpinner } from './ui/LoadingSpinner';

// 5. Services and utilities
import { apiService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { validateRequired } from '../utils/validation';

// 6. Types (always last, prefixed with 'type')
import type { 
  EggEntry, 
  ValidationError, 
  FlockProfile 
} from '../types';
import type { ComponentProps } from './types';
```

### Import Grouping
- **Blank line** between each import group
- **Alphabetical ordering** within groups
- **Type imports** always use `import type`
- **Destructuring imports** kept concise (max 4-5 items per line)

## TypeScript Standards

### Interface and Type Definitions
```typescript
// ✅ Good - Clear, descriptive interface names
interface EggEntryFormProps {
  initialDate?: string;
  onSuccess?: (entry: EggEntry) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// ✅ Good - Union types for controlled values
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ❌ Avoid - Generic or unclear names
interface Props {
  data: any;
  callback: Function;
}
```

### Function Signatures
```typescript
// ✅ Good - Explicit return types for public functions
export const validateEggEntry = (entry: EggEntry): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!entry.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  }
  
  if (entry.count < 0) {
    errors.push({ field: 'count', message: 'Count must be positive' });
  }
  
  return errors;
};

// ✅ Good - Async functions with proper error handling
export const saveEggEntries = async (
  entries: EggEntry[]
): Promise<ApiResponse<EggEntry[]>> => {
  try {
    const response = await apiService.production.saveEggEntries(entries);
    return response;
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};
```

### Avoiding 'any' Types
```typescript
// ❌ Avoid
const processData = (data: any[]): any => {
  return data.map((item: any) => ({ ...item, processed: true }));
};

// ✅ Prefer - Specific types or generics
const processEggEntries = (entries: EggEntry[]): ProcessedEggEntry[] => {
  return entries.map(entry => ({ ...entry, processed: true }));
};

// ✅ Good - Generic functions when appropriate
const processItems = <T extends { id: string }>(
  items: T[]
): Array<T & { processed: boolean }> => {
  return items.map(item => ({ ...item, processed: true }));
};
```

## State Management Standards

### useState Patterns
```typescript
// ✅ Good - Specific state types
const [eggEntries, setEggEntries] = useState<EggEntry[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [errors, setErrors] = useState<ValidationError[]>([]);

// ✅ Good - Complex state with proper typing
interface FormState {
  data: EggEntry;
  errors: ValidationError[];
  isSubmitting: boolean;
}

const [formState, setFormState] = useState<FormState>({
  data: { date: '', count: 0, user_id: '' },
  errors: [],
  isSubmitting: false
});

// ❌ Avoid - Multiple related state updates
setCount(newCount);
setLoading(false);
setErrors([]);

// ✅ Prefer - Batched state updates
setFormState(prev => ({
  ...prev,
  data: { ...prev.data, count: newCount },
  isSubmitting: false,
  errors: []
}));
```

### useEffect Guidelines
```typescript
// ✅ Good - Specific dependencies
useEffect(() => {
  if (user?.id) {
    fetchEggEntries(user.id);
  }
}, [user?.id]); // Specific dependency

// ✅ Good - Cleanup functions
useEffect(() => {
  const interval = setInterval(() => {
    checkForUpdates();
  }, 30000);

  return () => clearInterval(interval);
}, []);

// ✅ Good - Error handling in effects
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiService.data.fetchAllData();
      setData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

## Error Handling Standards

### Consistent Error Patterns
```typescript
// ✅ Good - Structured error handling
try {
  const response = await apiService.production.saveEggEntries(entries);
  
  if (response.success) {
    setSuccess('Entries saved successfully');
    onSuccess?.(response.data);
  } else {
    setErrors([{
      field: 'submit',
      message: response.error?.message || 'Failed to save entries'
    }]);
  }
} catch (error) {
  console.error('Save entries error:', error);
  setErrors([{
    field: 'submit',
    message: 'Network error - please try again'
  }]);
}

// ✅ Good - Error boundary pattern
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-md bg-red-50">
          <h3 className="text-lg font-medium text-red-800">
            Something went wrong
          </h3>
          <p className="text-red-600 mt-2">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## CSS and Styling Standards

### Tailwind Class Organization
```typescript
// ✅ Good - Organized class names
const className = `
  // Layout and positioning
  flex items-center justify-between
  // Sizing
  w-full h-12
  // Spacing
  px-4 py-2 mb-4
  // Colors and theming
  bg-white text-gray-900
  border border-gray-200
  // Effects and shadows
  shadow-neumorphic rounded-lg
  // States and interactions
  hover:shadow-neumorphic-pressed
  focus:ring-2 focus:ring-blue-500
  // Responsive design
  sm:px-6 lg:px-8
  sm:h-14 lg:h-16
`;

// ❌ Avoid - Unorganized classes
const messyClassName = "text-gray-900 hover:shadow-neumorphic-pressed w-full bg-white px-4 flex rounded-lg shadow-neumorphic border-gray-200 h-12 items-center";
```

### Component-Specific Styling
```typescript
// ✅ Good - Tailwind utility classes with design system consistency
const StatCard: React.FC<StatCardProps> = ({ title, value, change, className }) => {
  return (
    <div className={`
      // Base neumorphic card
      bg-white rounded-lg shadow-neumorphic
      border border-gray-100
      p-6
      // Hover effects
      hover:shadow-neumorphic-hover
      transition-shadow duration-200
      // Custom additions
      ${className || ''}
    `}>
      <h3 className="text-sm font-medium text-gray-500 mb-2">
        {title}
      </h3>
      <p className="text-2xl font-semibold text-gray-900">
        {value}
      </p>
      {change && (
        <p className={`text-sm mt-2 ${
          change > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change > 0 ? '+' : ''}{change}
        </p>
      )}
    </div>
  );
};
```

## API and Service Standards

### Service Method Patterns
```typescript
// ✅ Good - Consistent service method structure
export class ProductionService extends BaseApiService {
  async saveEggEntries(entries: EggEntry[]): Promise<ApiResponse<EggEntry[]>> {
    try {
      // Validation
      const validationErrors = this.validateEggEntries(entries);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: { message: 'Validation failed', details: validationErrors }
        };
      }

      // API call
      const response = await this.makeRequest<EggEntry[]>('/api/saveEggEntries', {
        method: 'POST',
        body: JSON.stringify({ entries }),
        headers: {
          'Content-Type': 'application/json',
          ...await this.getAuthHeaders()
        }
      });

      return response;
    } catch (error) {
      return this.handleError(error, 'Failed to save egg entries');
    }
  }

  private validateEggEntries(entries: EggEntry[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    entries.forEach((entry, index) => {
      if (!entry.date) {
        errors.push({
          field: `entries[${index}].date`,
          message: 'Date is required'
        });
      }
      
      if (entry.count < 0) {
        errors.push({
          field: `entries[${index}].count`,
          message: 'Count must be non-negative'
        });
      }
    });
    
    return errors;
  }
}
```

### API Response Handling
```typescript
// ✅ Good - Consistent response format
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

// ✅ Good - Response handling pattern
const handleApiResponse = async <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  onSuccess: (data: T) => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    const response = await apiCall();
    
    if (response.success && response.data) {
      onSuccess(response.data);
    } else {
      onError(response.error?.message || 'Operation failed');
    }
  } catch (error) {
    console.error('API call failed:', error);
    onError('Network error - please try again');
  }
};
```

## Testing Standards

### Component Test Structure
```typescript
// src/components/__tests__/EggEntryForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EggEntryForm } from '../EggEntryForm';
import { TestWrapper } from '../../test/utils';

// Mock API service
vi.mock('../../services/api', () => ({
  apiService: {
    production: {
      saveEggEntries: vi.fn()
    }
  }
}));

describe('EggEntryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with correct initial state', () => {
    render(
      <TestWrapper>
        <EggEntryForm />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/count/i)).toHaveValue(0);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('handles form submission successfully', async () => {
    const mockSave = vi.fn().mockResolvedValue({
      success: true,
      data: [{ id: '1', date: '2025-01-14', count: 12 }]
    });
    
    vi.mocked(apiService.production.saveEggEntries).mockImplementation(mockSave);

    const onSuccess = vi.fn();

    render(
      <TestWrapper>
        <EggEntryForm onSuccess={onSuccess} />
      </TestWrapper>
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2025-01-14' }
    });
    fireEvent.change(screen.getByLabelText(/count/i), {
      target: { value: '12' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith([{
        date: '2025-01-14',
        count: 12,
        user_id: expect.any(String)
      }]);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('displays validation errors', async () => {
    render(
      <TestWrapper>
        <EggEntryForm />
      </TestWrapper>
    );

    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/date is required/i)).toBeInTheDocument();
    });
  });
});
```

## Documentation Standards

### JSDoc Comments
```typescript
/**
 * Validates egg entry data before submission
 * 
 * @param entry - The egg entry to validate
 * @returns Array of validation errors, empty if valid
 * 
 * @example
 * ```typescript
 * const errors = validateEggEntry({
 *   date: '2025-01-14',
 *   count: 12,
 *   user_id: 'user-123'
 * });
 * 
 * if (errors.length === 0) {
 *   // Entry is valid
 * }
 * ```
 */
export const validateEggEntry = (entry: EggEntry): ValidationError[] => {
  // Implementation
};

/**
 * Reusable form component for egg entry data
 * 
 * Features:
 * - Real-time validation
 * - Optimistic UI updates
 * - Error boundary integration
 * 
 * @param props - Component properties
 * @param props.initialDate - Pre-populate date field
 * @param props.onSuccess - Callback when entry is saved successfully  
 * @param props.onError - Callback when save fails
 */
export const EggEntryForm: React.FC<EggEntryFormProps> = (props) => {
  // Implementation
};
```

## Code Review Standards

### Pull Request Guidelines
- **Component Size**: New components must be under 300 lines
- **Type Safety**: No 'any' types without explicit justification  
- **Import Organization**: Must follow established import order
- **Error Handling**: All async operations must have proper error handling
- **Testing**: New components require 90%+ test coverage
- **Documentation**: Public APIs require JSDoc documentation

### Review Checklist
- [ ] **Follows naming conventions**
- [ ] **Import organization is correct**
- [ ] **TypeScript types are specific and accurate**
- [ ] **Error handling follows established patterns**
- [ ] **State management is optimized**
- [ ] **CSS classes are organized logically**
- [ ] **Tests cover happy path and error cases**
- [ ] **JSDoc documentation for public APIs**

## Development Tools Integration

### ESLint Configuration
```javascript
// eslint.config.js
export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    rules: {
      // TypeScript standards
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      
      // Import organization
      'sort-imports': ['error', {
        'ignoreDeclarationSort': true,
        'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single']
      }],
      
      // React standards
      'react-hooks/exhaustive-deps': 'error',
      
      // Code organization
      'prefer-const': 'error',
      'no-var': 'error'
    }
  }
)
```

### Prettier Configuration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### VS Code Settings
```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Enforcement

### Pre-commit Hooks
```bash
# Install husky for pre-commit hooks
npm install -D husky lint-staged
npx husky-init

# Configure lint-staged in package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --quiet --fix",
      "prettier --write"
    ]
  }
}
```

### CI/CD Integration
```yaml
# .github/workflows/quality.yml
name: Code Quality
on: [push, pull_request]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type checking
        run: npm run type-check
      
      - name: Lint code
        run: npm run lint
      
      - name: Run tests
        run: npm run test:run
```

## Related Files

- **ESLint Config**: `eslint.config.js`
- **Prettier Config**: `.prettierrc`
- **TypeScript Config**: `tsconfig.json`
- **VS Code Settings**: `.vscode/settings.json`
- **Test Setup**: `src/test/setup.ts`

---

*This document establishes the coding standards for the Chicken Manager application as of January 2025, reflecting the current architectural state and supporting ongoing development.*