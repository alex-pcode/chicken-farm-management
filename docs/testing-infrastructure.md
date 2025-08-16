# Testing Infrastructure Documentation

## Overview

This document provides comprehensive documentation for the testing infrastructure implemented in the Chicken Manager application. The testing setup uses Vitest + React Testing Library, providing a modern, fast, and reliable testing environment that supports the refactoring efforts across all epics.

## Testing Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | Latest | Modern test runner with Vite integration |
| **React Testing Library** | Latest | Component testing utilities |
| **jsdom** | Latest | DOM environment for testing |
| **@testing-library/jest-dom** | Latest | Additional DOM matchers |
| **@vitest/coverage-v8** | Latest | Code coverage reporting |
| **@vitest/ui** | Latest | Visual test dashboard |

### Configuration Files

- **`vite.config.mjs`** - Test configuration and coverage setup
- **`src/test/setup.ts`** - Test environment setup and mocks
- **`src/test/utils.tsx`** - Custom testing utilities and mock data

## Test Configuration

### Vite Configuration

```javascript
// vite.config.mjs
export default defineConfig({
  test: {
    globals: true,              // Global test functions (describe, it, expect)
    environment: 'jsdom',       // DOM environment for React components
    setupFiles: './src/test/setup.ts', // Setup file with mocks
    css: true,                  // Enable CSS processing in tests
    coverage: {
      provider: 'v8',           // V8 coverage provider (faster than c8)
      reporter: ['text', 'json', 'html'], // Multiple coverage formats
      exclude: [                // Exclude patterns from coverage
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '*.config.*'
      ]
    }
  }
})
```

### Test Scripts

```json
// package.json scripts
{
  "test": "vitest",                    // Run tests in watch mode
  "test:ui": "vitest --ui",           // Visual test dashboard
  "test:coverage": "vitest --coverage", // Run with coverage report
  "test:run": "vitest run"            // Run tests once (CI mode)
}
```

## Test Setup and Mocks

### Global Setup (`src/test/setup.ts`)

The setup file configures the testing environment with essential mocks:

#### 1. Framework Mocks

```typescript
// Mock Framer Motion to prevent animation complexity in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    form: 'form',
    // ... other elements
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
}))
```

#### 2. Chart Library Mocks

```typescript
// Mock Recharts components to prevent rendering complexity
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  LineChart: 'div',
  Line: 'div',
  XAxis: 'div',
  YAxis: 'div',
  // ... other chart components
}))
```

#### 3. Database Mocks

```typescript
// Mock Supabase client for isolated testing
vi.mock('../utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
  },
}))
```

#### 4. Browser API Mocks

```typescript
// Mock ResizeObserver for components that observe element sizing
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

## Custom Testing Utilities

### Test Wrapper (`src/test/utils.tsx`)

Provides a custom render function with all necessary providers:

```typescript
// Custom render function with all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <MockAuthProvider>
        <MockDataProvider>
          {children}
        </MockDataProvider>
      </MockAuthProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Export custom render as default render
export { customRender as render }
```

### Mock Data

Pre-defined mock data for consistent testing:

```typescript
export const mockEggEntry = {
  id: 'test-1',
  date: '2025-01-09',
  eggs_collected: 12,
  user_id: 'test-user',
  created_at: '2025-01-09T10:00:00Z',
}

export const mockFlockProfile = {
  id: 'test-flock',
  user_id: 'test-user',
  flock_name: 'Test Flock',
  total_chickens: 25,
  breed: 'Rhode Island Red',
  created_at: '2024-01-01T00:00:00Z',
}

export const mockExpense = {
  id: 'test-expense',
  user_id: 'test-user',
  date: '2025-01-09',
  amount: 25.99,
  category: 'feed',
  description: 'Chicken feed',
  created_at: '2025-01-09T10:00:00Z',
}
```

## Testing Patterns and Examples

### Component Testing

#### Basic Component Test

```typescript
import { render, screen } from '../../../test/utils'
import { TextInput } from '../TextInput'

describe('TextInput', () => {
  it('renders with label', () => {
    render(
      <TextInput
        label="Test Input"
        value=""
        onChange={() => {}}
      />
    )
    
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument()
  })

  it('calls onChange when value changes', async () => {
    const handleChange = vi.fn()
    
    render(
      <TextInput
        label="Test Input"
        value=""
        onChange={handleChange}
      />
    )
    
    await fireEvent.change(screen.getByLabelText('Test Input'), {
      target: { value: 'new value' }
    })
    
    expect(handleChange).toHaveBeenCalledWith('new value')
  })
})
```

#### Testing with Validation Errors

```typescript
import { ValidationError } from '../../../types'

describe('TextInput Validation', () => {
  it('displays validation errors', () => {
    const errors: ValidationError[] = [
      { field: 'test_input', message: 'This field is required' }
    ]
    
    render(
      <TextInput
        label="Test Input"
        value=""
        onChange={() => {}}
        errors={errors}
      />
    )
    
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByLabelText('Test Input')).toHaveAttribute('aria-invalid', 'true')
  })
})
```

### API Service Testing

#### Service Layer Tests

```typescript
import { apiService } from '../index'
import { mockEggEntry } from '../../../test/utils'

// Mock fetch globally for API tests
global.fetch = vi.fn()

describe('ProductionService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('saveEggEntries calls correct endpoint', async () => {
    const mockResponse = { success: true }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    await apiService.production.saveEggEntries([mockEggEntry])

    expect(fetch).toHaveBeenCalledWith('/api/saveEggEntries', {
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        'Authorization': expect.stringContaining('Bearer'),
      }),
      body: JSON.stringify([mockEggEntry]),
    })
  })

  it('handles API errors correctly', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    await expect(
      apiService.production.saveEggEntries([mockEggEntry])
    ).rejects.toThrow('Network error')
  })
})
```

### Hook Testing

#### Custom Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react'
import { useEggData } from '../useEggData'
import { mockEggEntry } from '../../../test/utils'

describe('useEggData', () => {
  it('provides egg data and loading state', () => {
    const { result } = renderHook(() => useEggData())

    expect(result.current.eggEntries).toEqual([])
    expect(result.current.loading).toBe(true)
  })

  it('updates data when addEntry is called', async () => {
    const { result } = renderHook(() => useEggData())

    await act(async () => {
      await result.current.addEntry(mockEggEntry)
    })

    expect(result.current.eggEntries).toContain(mockEggEntry)
  })
})
```

### Integration Testing

#### Component with Context

```typescript
import { render, screen } from '../../../test/utils'
import { EggCounter } from '../EggCounter'

describe('EggCounter Integration', () => {
  it('integrates with data context', () => {
    render(<EggCounter />)
    
    // Test component renders with mocked context data
    expect(screen.getByText('Egg Production')).toBeInTheDocument()
  })

  it('handles form submission', async () => {
    render(<EggCounter />)
    
    const input = screen.getByLabelText('Eggs Collected')
    const submitButton = screen.getByRole('button', { name: /save/i })
    
    await user.type(input, '12')
    await user.click(submitButton)
    
    // Verify form submission behavior
    expect(screen.getByText('Entry saved successfully')).toBeInTheDocument()
  })
})
```

## Coverage Configuration

### Coverage Settings

```javascript
// vite.config.mjs coverage settings
coverage: {
  provider: 'v8',                    // V8 coverage (faster than c8)
  reporter: ['text', 'json', 'html'], // Multiple output formats
  exclude: [                         // Exclude from coverage
    'node_modules/',                 // Third-party code
    'src/test/',                     // Test utilities
    '**/*.d.ts',                     // Type definitions
    '*.config.*'                     // Configuration files
  ]
}
```

### Coverage Targets

| Component Type | Target Coverage |
|----------------|----------------|
| Shared Components | 90%+ |
| API Services | 85%+ |
| Custom Hooks | 80%+ |
| Utility Functions | 95%+ |
| Integration Tests | 70%+ |

## Running Tests

### Available Commands

```bash
# Development (watch mode)
npm test                    # Interactive watch mode
npm run test:ui            # Visual dashboard interface

# Coverage reporting  
npm run test:coverage      # Generate coverage report
npm run test:coverage -- --reporter=html  # HTML coverage report

# CI/Production
npm run test:run          # Single test run (no watch)
npm run test:run -- --coverage  # CI with coverage

# Specific test patterns
npm test -- TextInput     # Run tests matching pattern
npm test -- src/components/forms/  # Run tests in directory
npm test -- --grep="validation"    # Run tests matching description
```

### Test Organization

Tests are organized alongside source code:

```
src/
├── components/
│   ├── forms/
│   │   ├── TextInput.tsx
│   │   ├── __tests__/
│   │   │   ├── TextInput.test.tsx
│   │   │   └── useFormValidation.test.ts
│   │   └── index.ts
│   └── ui/
│       ├── cards/
│       │   ├── StatCard.tsx
│       │   └── __tests__/
│       │       └── StatCard.test.tsx
├── services/api/
│   ├── ProductionService.ts
│   └── __tests__/
│       └── ProductionService.test.ts
└── test/
    ├── setup.ts         # Global test setup
    └── utils.tsx        # Testing utilities
```

## Best Practices

### Test Writing Guidelines

1. **Test Structure**:
   ```typescript
   describe('ComponentName', () => {
     // Group related tests
     describe('when loading', () => {
       it('shows loading spinner', () => {
         // Test implementation
       })
     })
     
     describe('when data is available', () => {
       it('displays data correctly', () => {
         // Test implementation
       })
     })
   })
   ```

2. **Mock Management**:
   ```typescript
   describe('API Service', () => {
     beforeEach(() => {
       vi.resetAllMocks()  // Reset mocks between tests
     })
   })
   ```

3. **Async Testing**:
   ```typescript
   it('handles async operations', async () => {
     render(<AsyncComponent />)
     
     // Wait for async operations
     await waitFor(() => {
       expect(screen.getByText('Data loaded')).toBeInTheDocument()
     })
   })
   ```

### Testing Refactored Components

When breaking down large components (Epic 2):

1. **Test Before Refactoring**:
   ```bash
   npm test -- Profile.test.tsx  # Ensure existing tests pass
   ```

2. **Maintain Test Coverage**:
   ```typescript
   // Test extracted components individually
   describe('FlockEventManager', () => {
     it('maintains original functionality', () => {
       // Test extracted component
     })
   })
   ```

3. **Integration Testing**:
   ```typescript
   // Ensure components work together
   describe('Profile Integration', () => {
     it('coordinates between extracted components', () => {
       // Test component interaction
     })
   })
   ```

## Performance and Optimization

### Test Performance

- **Parallel Execution**: Vitest runs tests in parallel by default
- **Selective Testing**: Use patterns to run subset of tests during development
- **Mock Optimization**: Lightweight mocks reduce test execution time

### Memory Management

```typescript
// Cleanup after tests
afterEach(() => {
  cleanup()        // React Testing Library cleanup
  vi.clearAllMocks()  // Clear mock state
})
```

## Integration with Development Workflow

### VS Code Integration

```json
// .vscode/settings.json
{
  "vitest.enable": true,
  "vitest.commandLine": "npm test",
  "testing.automaticallyOpenPeekView": "never"
}
```

### Pre-commit Hooks

```bash
# Install husky and lint-staged
npm install -D husky lint-staged

# Package.json configuration
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest run --passWithNoTests"
    ]
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## Troubleshooting

### Common Issues

1. **Mock Import Errors**:
   ```typescript
   // Ensure mocks are properly typed
   vi.mock('../utils/supabase', () => ({
     supabase: {
       // Provide complete mock implementation
     }
   }))
   ```

2. **Async Test Failures**:
   ```typescript
   // Use proper async utilities
   await waitFor(() => {
     expect(screen.getByText('Expected text')).toBeInTheDocument()
   })
   ```

3. **Component Not Updating**:
   ```typescript
   // Use act for state updates
   await act(async () => {
     fireEvent.click(button)
   })
   ```

### Debug Tools

```bash
# Debug mode
npm test -- --inspect-brk

# UI dashboard for visual debugging
npm run test:ui

# Verbose output
npm test -- --reporter=verbose
```

## Related Documentation

- [API Service Implementation](./api-service-implementation.md) - Service layer testing patterns
- [Shared Components Library](./shared-components-library.md) - Component testing examples
- [Main Architecture](./architecture.md) - Overall testing strategy

## Implementation Status

✅ **COMPLETED**: Testing Infrastructure
- Vitest + React Testing Library setup
- Comprehensive mock system for external dependencies
- Custom testing utilities and mock data
- Coverage reporting with v8 provider
- Visual test dashboard
- Complete test setup for all shared components and services
- Integration with development workflow

The testing infrastructure provides a robust foundation for safe refactoring across all epics, ensuring code quality and preventing regressions during the structural improvements.