# Coding Standards & Style Guide

### Current State: Informal Standards ❌

Your codebase shows **inconsistent patterns** across components:
- Mixed naming conventions (camelCase vs PascalCase for variables)
- Inconsistent import ordering and grouping
- Variable TypeScript usage (some 'any' types, inconsistent interfaces)
- No documented code style guide

### Recommended Coding Standards (2025)

#### 1. **File and Directory Naming**
```typescript
// Components - PascalCase
EggCounter.tsx
FlockBatchManager.tsx

// Hooks - camelCase with 'use' prefix
useEggEntries.ts
useFlockData.ts

// Utilities - camelCase
apiUtils.ts
authApiUtils.ts

// Types - PascalCase for interfaces
interface EggEntry { }
type FlockSummary = { }
```

#### 2. **Component Structure Standard**
```typescript
// Recommended component structure
import React from 'react';
import { motion } from 'framer-motion';
import { useEggEntries } from '../contexts/DataContext';
import type { EggEntry, ValidationError } from '../types';
import './ComponentName.css'; // Only if component-specific styles needed

interface ComponentProps {
  // Props interface always defined
}

export const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. Hooks (state, context, custom hooks)
  const [localState, setLocalState] = useState('');
  const { data, loading } = useEggEntries();
  
  // 2. Event handlers
  const handleSubmit = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  // 3. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 4. Early returns (loading, error states)
  if (loading) return <LoadingSpinner />;
  
  // 5. Render
  return (
    <motion.div>
      {/* JSX */}
    </motion.div>
  );
};
```

#### 3. **Import Organization Standard**
```typescript
// 1. React and core libraries
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 2. Third-party libraries
import { v4 as uuidv4 } from 'uuid';

// 3. Internal hooks and contexts
import { useAuth } from '../contexts/AuthContext';
import { useEggEntries } from '../contexts/DataContext';

// 4. Components
import { LoadingSpinner } from './LoadingSpinner';
import { StatCard } from './StatCard';

// 5. Utils and helpers
import { saveToDatabase } from '../utils/apiUtils';

// 6. Types (always last)
import type { EggEntry, ValidationError } from '../types';
```

#### 4. **TypeScript Standards**
```typescript
// ❌ Avoid
const data: any[] = [];
function saveData(entries: any) { }

// ✅ Prefer
const data: EggEntry[] = [];
function saveData(entries: EggEntry[]): Promise<void> { }

// Interface naming
interface Props { } // Component props
interface EggEntry { } // Data types
interface ValidationError { } // Error types

// Consistent null/undefined handling
const profile: FlockProfile | null = null; // Use null for missing objects
const count?: number; // Use undefined for optional properties
```

#### 5. **State Management Standards**
```typescript
// ❌ Avoid - Multiple state updates
setCount(newCount);
setLoading(false);
setErrors([]);

// ✅ Prefer - Batch state updates or use reducer
setFormState({
  count: newCount,
  loading: false,
  errors: []
});
```

#### 6. **Error Handling Standards**
```typescript
// Consistent error handling pattern
try {
  await apiCall();
  setSuccess(true);
} catch (error) {
  console.error('Operation failed:', error);
  setErrors([{ 
    field: 'submit', 
    message: error instanceof Error ? error.message : 'Operation failed'
  }]);
}
```

#### 7. **CSS and Styling Standards**
```typescript
// Tailwind class organization
className={`
  // Layout
  flex items-center justify-between
  // Spacing
  p-4 m-2
  // Colors and theming
  bg-white text-gray-900
  // States
  hover:bg-gray-50 focus:ring-2
  // Responsive
  sm:p-6 lg:p-8
`}
```

### Enforcing Standards with Tooling

#### ESLint Configuration Enhancement
Your current ESLint config is basic. Add these rules to enforce standards:

```javascript
// eslint.config.js additions
export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      
      // TypeScript standards
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      
      // Import organization
      'sort-imports': ['error', {
        'ignoreCase': false,
        'ignoreDeclarationSort': true,
        'ignoreMemberSort': false,
        'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single']
      }],
      
      // React standards
      'react-hooks/exhaustive-deps': 'error',
      'react/jsx-no-leaked-render': 'error',
      'react/jsx-curly-brace-presence': ['error', 'never'],
      
      // Code organization
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
    },
  },
)
```

#### Prettier Configuration
Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

#### Import Sorting Plugin
```bash
npm install -D eslint-plugin-import
```

#### VS Code Settings (Optional)
Create `.vscode/settings.json`:
```json
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

### Code Review Standards

#### Pull Request Guidelines
- All components must follow the structure standard
- No 'any' types allowed without explicit justification
- Import organization must be consistent
- All new functions require proper TypeScript typing
- Error handling must follow established patterns

#### Component Size Limits (Epic 2 Alignment)
- **Maximum 200 lines per component** (your current Profile.tsx at 1039 lines violates this)
- **Single responsibility principle** enforced
- **Extract hooks** for complex state logic (>50 lines)
- **Extract utilities** for business logic (>30 lines)
