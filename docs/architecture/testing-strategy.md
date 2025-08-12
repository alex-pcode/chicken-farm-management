# Testing Strategy

## Overview

This document defines the comprehensive testing strategy for the chicken farm management application. Our approach emphasizes type safety, maintainability, and thorough coverage across all layers of the application.

## Testing Philosophy

### Core Principles
- **Test Pyramid First**: Majority unit tests, fewer integration tests, minimal E2E
- **User-Centric Testing**: Test behavior, not implementation details
- **Type Safety**: Leverage TypeScript for compile-time error prevention
- **Fast Feedback**: Prioritize quick, reliable test execution
- **Maintainable Tests**: Clear, readable tests that evolve with the codebase

### Testing Goals
- Ensure critical user journeys work correctly
- Prevent regressions during refactoring
- Document expected behavior through tests
- Enable confident deployments
- Support rapid development cycles

## Tech Stack

### Core Testing Framework
- **Test Runner**: [Vitest](https://vitest.dev/) - Fast, modern alternative to Jest
- **Testing Library**: [@testing-library/react](https://testing-library.com/) - User-focused testing utilities
- **Assertion Library**: Built-in Vitest assertions with Jest-compatible matchers

### Additional Tools
- **DOM Testing**: `@testing-library/jest-dom` - Enhanced DOM matchers
- **User Interaction**: `@testing-library/user-event` - Realistic user interactions
- **Coverage**: `@vitest/coverage-v8` - Code coverage reporting
- **UI**: `@vitest/ui` - Visual test interface for development

### Mocking Strategy
- **API Services**: Mock service layer methods, not HTTP requests
- **External Libraries**: Mock complex UI libraries (Framer Motion, Recharts)
- **Context Providers**: Mock React contexts for isolated component testing
- **Browser APIs**: Mock DOM APIs (ResizeObserver, matchMedia)

## Test Organization

### Directory Structure
```
src/
├── components/
│   ├── __tests__/
│   │   ├── EggCounter.test.tsx
│   │   ├── Expenses.test.tsx
│   │   └── [Component].test.tsx
├── services/
│   └── api/
│       └── __tests__/
│           ├── FlockService.test.ts
│           ├── AuthService.test.ts
│           └── [Service].test.ts
├── contexts/
│   └── __tests__/
│       └── DataContext.test.tsx
├── utils/
│   └── __tests__/
│       └── [utility].test.ts
└── test/
    ├── setup.ts              # Global test configuration
    ├── utils.tsx             # Test utilities and helpers
    └── fixtures/             # Test data and mocks
```

### Naming Conventions
- **Test Files**: `[SourceFile].test.[tsx|ts]`
- **Test Suites**: Descriptive describe blocks matching functionality
- **Test Cases**: Behavior-focused test descriptions

## Testing Levels

### 1. Unit Tests (70% of tests)

**Scope**: Individual functions, components, and services in isolation

**Focus Areas**:
- Pure utility functions
- Service layer methods
- Custom hooks
- Component rendering and behavior
- Error handling logic

**Example Structure**:
```typescript
describe('EggCounter Component', () => {
  describe('Form Validation', () => {
    test('shows error for negative egg count', () => {
      // Test implementation
    })
    
    test('accepts valid egg count input', () => {
      // Test implementation
    })
  })
  
  describe('API Integration', () => {
    test('successfully saves egg entries using consolidated API service', () => {
      // Test implementation
    })
    
    test('handles authentication errors gracefully', () => {
      // Test implementation
    })
  })
})
```

### 2. Integration Tests (25% of tests)

**Scope**: Component interactions, service integration, data flow

**Focus Areas**:
- Component + Context interactions
- Service + API endpoint integration
- Multi-component workflows
- Data persistence flows

**Example Structure**:
```typescript
describe('Feed Tracking Integration', () => {
  test('updates inventory after successful feed entry', () => {
    // Test component + context + service integration
  })
  
  test('syncs flock profile changes across components', () => {
    // Test cross-component data consistency
  })
})
```

### 3. End-to-End Tests (5% of tests)

**Scope**: Complete user workflows across the entire application

**Focus Areas**:
- Critical user journeys
- Authentication flows
- Data persistence across page reloads
- Error recovery scenarios

**Tools**: 
- **Future Implementation**: Playwright or Cypress
- **Current Status**: Manual testing for E2E scenarios

## Component Testing Strategy

### Testing Approach
1. **Render Component**: With necessary providers and mocks
2. **User Interactions**: Simulate realistic user behavior
3. **Assert Outcomes**: Verify expected UI changes and API calls
4. **Error Scenarios**: Test error handling and recovery

### Component Test Template
```typescript
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from '../ComponentName'
import { apiService } from '../../services/api'

// Mock API service
vi.mock('../../services/api', () => ({
  apiService: {
    [domain]: {
      [method]: vi.fn(),
    },
  },
}))

// Mock contexts if needed
vi.mock('../../contexts/DataContext', () => ({
  useDataContext: () => ({
    data: [],
    isLoading: false,
    updateData: vi.fn(),
  }),
}))

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders initial state correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText(/expected text/i)).toBeInTheDocument()
  })

  test('handles user interaction successfully', async () => {
    const user = userEvent.setup()
    const mockApiCall = vi.mocked(apiService.domain.method)
    mockApiCall.mockResolvedValueOnce({ success: true })

    render(<ComponentName />)
    
    await user.type(screen.getByLabelText(/input label/i), 'test input')
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalledWith(/* expected parameters */)
    })
  })
})
```

## Service Layer Testing

### Testing Focus
- API method implementations
- Error handling and transformation
- Authentication integration
- Data validation and transformation

### Service Test Template
```typescript
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { FlockService } from '../FlockService'
import { AuthenticationError, NetworkError } from '../../types/api'

// Mock base service dependencies
vi.mock('../BaseApiService')

describe('FlockService', () => {
  let service: FlockService
  
  beforeEach(() => {
    service = FlockService.getInstance()
    vi.clearAllMocks()
  })

  describe('saveFlockProfile', () => {
    test('successfully saves valid flock profile', async () => {
      const mockProfile = { /* test data */ }
      
      const result = await service.saveFlockProfile(mockProfile)
      
      expect(result).toEqual(expect.objectContaining({
        success: true,
        data: expect.objectContaining(mockProfile)
      }))
    })

    test('handles authentication errors appropriately', async () => {
      // Mock authentication failure
      service.post = vi.fn().mockRejectedValueOnce(
        new AuthenticationError('Token expired')
      )
      
      await expect(service.saveFlockProfile({}))
        .rejects
        .toThrow(AuthenticationError)
    })
  })
})
```

## Mock Strategy

### Global Mocks (in `src/test/setup.ts`)
```typescript
// Complex UI libraries that don't need testing
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    // ... other elements
  },
  AnimatePresence: ({ children }) => children,
}))

// Chart libraries
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  BarChart: 'div',
  // ... other components
}))

// Browser APIs
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

### Test-Specific Mocks
```typescript
// API service mocking
vi.mock('../../services/api', () => ({
  apiService: {
    production: {
      saveEggEntries: vi.fn(),
    },
    flock: {
      saveFlockProfile: vi.fn(),
    },
  },
}))

// Context mocking
vi.mock('../../contexts/DataContext', () => ({
  useEggEntries: () => ({
    eggEntries: [],
    isLoading: false,
    updateEggEntries: vi.fn(),
  }),
}))
```

## Error Testing Strategy

### Error Types to Test
1. **Network Errors**: Connection failures, timeouts
2. **Authentication Errors**: Expired tokens, unauthorized access
3. **Server Errors**: 500 responses, service unavailable
4. **Validation Errors**: Invalid input, business rule violations
5. **Client Errors**: Runtime exceptions, state corruption

### Error Test Template
```typescript
describe('Error Handling', () => {
  test('displays user-friendly message for network errors', async () => {
    const mockApiCall = vi.mocked(apiService.method)
    mockApiCall.mockRejectedValueOnce(new NetworkError('Connection failed'))

    render(<Component />)
    
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/network connection issue/i)).toBeInTheDocument()
    })
  })
})
```

## Test Data Management

### Test Fixtures
```typescript
// src/test/fixtures/index.ts
export const mockFlockProfile = {
  id: 'test-flock-1',
  hens: 25,
  roosters: 3,
  chicks: 12,
  // ... other properties
}

export const mockEggEntries = [
  { id: '1', date: '2024-01-01', count: 18 },
  { id: '2', date: '2024-01-02', count: 22 },
]

export const mockApiResponses = {
  success: { success: true, data: {} },
  authError: new AuthenticationError('Token expired'),
  networkError: new NetworkError('Connection failed'),
}
```

### Factory Functions
```typescript
// src/test/factories.ts
export const createMockFlockProfile = (overrides = {}) => ({
  id: 'default-id',
  hens: 10,
  roosters: 1,
  chicks: 5,
  ...overrides,
})
```

## Coverage Strategy

### Coverage Goals
- **Statements**: 85% minimum
- **Branches**: 80% minimum  
- **Functions**: 90% minimum
- **Lines**: 85% minimum

### Coverage Exclusions
```javascript
// vite.config.mjs coverage configuration
coverage: {
  exclude: [
    'src/test/**',
    'src/**/*.test.{ts,tsx}',
    'src/types/**',
    'src/**/*.d.ts',
  ],
  thresholds: {
    global: {
      statements: 85,
      branches: 80,
      functions: 90,
      lines: 85,
    },
  },
}
```

### Coverage Commands
```bash
# Run tests with coverage
npm run test:coverage

# Generate HTML coverage report
npm run test:coverage -- --reporter=html

# Check coverage thresholds
npm run test:coverage -- --coverage.thresholds.autoUpdate=true
```

## Performance Testing

### Test Performance Guidelines
- **Fast Execution**: Individual tests < 100ms
- **Suite Performance**: Full test suite < 30 seconds
- **Parallel Execution**: Leverage Vitest's parallel capabilities
- **Mock Heavy Dependencies**: Keep tests focused and fast

### Performance Monitoring
```typescript
// Performance-sensitive test example
test('handles large dataset efficiently', async () => {
  const startTime = performance.now()
  const largeDataset = Array.from({ length: 1000 }, createMockData)
  
  render(<DataTable data={largeDataset} />)
  
  const endTime = performance.now()
  expect(endTime - startTime).toBeLessThan(100) // 100ms threshold
})
```

## CI/CD Integration

### GitHub Actions Configuration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:run
      - run: npm run test:coverage
```

### Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run test:run",
      "pre-push": "npm run type-check && npm run test:coverage"
    }
  }
}
```

## Development Workflow

### TDD Approach (Recommended)
1. **Write Failing Test**: Define expected behavior
2. **Implement Minimum Code**: Make test pass
3. **Refactor**: Improve implementation while keeping tests green
4. **Repeat**: Iterate for each new feature or fix

### Test-First Features
```typescript
// 1. Write the test first
test('calculates feed consumption rate correctly', () => {
  const result = calculateFeedConsumption(feedData, timespan)
  expect(result.dailyRate).toBe(2.5)
})

// 2. Implement the function
export const calculateFeedConsumption = (data, timespan) => {
  // Implementation that makes test pass
}
```

### Running Tests During Development
```bash
# Watch mode for active development
npm test

# UI mode for visual feedback
npm run test:ui

# Run specific test file
npm test EggCounter

# Run tests matching pattern
npm test -- --grep "error handling"
```

## Best Practices

### Do's ✅
- **Test Behavior**: Focus on what users experience
- **Use Real User Events**: Prefer `userEvent` over `fireEvent`
- **Meaningful Assertions**: Assert on visible outcomes
- **Isolate Tests**: Each test should be independent
- **Clear Test Names**: Describe the scenario and expectation
- **Mock at Boundaries**: Mock external dependencies, not internals

### Don'ts ❌
- **Test Implementation Details**: Don't test internal state or methods
- **Share Test State**: Avoid dependencies between tests
- **Over-Mock**: Don't mock everything, test real interactions where possible
- **Ignore Accessibility**: Include accessibility in your test assertions
- **Skip Error Cases**: Always test error scenarios
- **Test Library Code**: Don't test third-party library behavior

### Code Quality in Tests
```typescript
// Good: Descriptive and focused
test('displays validation error when egg count is negative', async () => {
  const user = userEvent.setup()
  render(<EggCounter />)
  
  await user.type(screen.getByLabelText(/egg count/i), '-5')
  await user.click(screen.getByRole('button', { name: /add entry/i }))
  
  expect(screen.getByText(/count must be positive/i)).toBeInTheDocument()
})

// Bad: Vague and testing multiple concerns
test('form validation works', () => {
  // Tests too many things at once
})
```

## Debugging Tests

### Common Debugging Techniques
```typescript
// Visual debugging in tests
import { screen } from '@testing-library/react'

test('debug test', () => {
  render(<Component />)
  
  // Print current DOM structure
  screen.debug()
  
  // Print specific element
  screen.debug(screen.getByRole('button'))
  
  // Use data-testid for complex queries
  expect(screen.getByTestId('complex-component')).toBeInTheDocument()
})
```

### VS Code Integration
- Install Vitest extension for IDE integration
- Use breakpoints in test files
- Leverage Jest Test Explorer for visual test management

## Maintenance and Evolution

### Test Maintenance Guidelines
- **Refactor Tests with Code**: Update tests when refactoring components
- **Remove Obsolete Tests**: Delete tests for removed features
- **Update Mocks**: Keep mocks in sync with API changes
- **Review Test Coverage**: Regular coverage reviews to identify gaps

### Adding New Test Categories
1. **Identify Testing Needs**: New features or integration points
2. **Define Test Strategy**: Unit, integration, or E2E approach
3. **Create Test Templates**: Standardized patterns for consistency
4. **Update Documentation**: Keep this strategy document current

---

This testing strategy ensures comprehensive coverage while maintaining fast, reliable tests that support confident development and deployment of the chicken farm management application.