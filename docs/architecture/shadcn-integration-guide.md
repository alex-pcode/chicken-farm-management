# shadcn/ui Integration Guide

## Overview

This guide outlines the integration of shadcn/ui with the Chicken Manager application to enhance accessibility and component functionality while preserving the existing neumorphic design language.

**Status**: ✅ **Foundation Ready** - Core dependencies installed, migration path established

## Foundation Status

### ✅ Completed Setup

#### Core Dependencies Installed
```json
{
  "@radix-ui/react-dialog": "^1.1.14",
  "@radix-ui/react-form": "^0.1.7", 
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-select": "^2.2.5",
  "@radix-ui/react-slot": "^1.2.3",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.539.0",
  "tailwind-merge": "^3.3.1"
}
```

#### Utility Functions
```typescript
// src/utils/shadcn/cn.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Integration Strategy

#### Hybrid Approach
- **shadcn/ui Core**: Accessibility-focused primitives from Radix UI
- **Custom Styling**: Existing neumorphic design language preserved
- **Enhanced Functionality**: Improved keyboard navigation and screen reader support

## Component Migration Plan

### Phase 1: Form Components

#### Install Core Form Components
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add form
```

#### Enhanced Form Components

##### Button Component
```typescript
// src/components/shadcn/enhanced-button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/shadcn/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Neumorphic primary button
        default: "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-neumorphic hover:shadow-neumorphic-pressed active:shadow-neumorphic-inset",
        // Neumorphic secondary button  
        secondary: "bg-gray-100 text-gray-900 shadow-neumorphic hover:shadow-neumorphic-pressed active:shadow-neumorphic-inset",
        // Danger variant with neumorphic styling
        destructive: "bg-gradient-to-br from-red-400 to-red-600 text-white shadow-neumorphic hover:shadow-neumorphic-pressed",
        // Ghost variant for minimal styling
        ghost: "hover:bg-gray-100 hover:text-gray-900",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

##### Enhanced Input Component
```typescript
// src/components/shadcn/enhanced-input.tsx
import * as React from "react"
import { cn } from "../../utils/shadcn/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <input
          type={type}
          className={cn(
            // Base neumorphic input styling
            "flex h-10 w-full rounded-md bg-gray-50 px-3 py-2 text-sm",
            "shadow-neumorphic-inset border border-gray-200",
            "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-gray-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Error state styling
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
```

##### Enhanced Card Component
```typescript
// src/components/shadcn/enhanced-card.tsx
import * as React from "react"
import { cn } from "../../utils/shadcn/cn"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Neumorphic card styling
      "rounded-lg bg-white p-6 shadow-neumorphic",
      "border border-gray-100",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
```

### Phase 2: Modal and Dialog Components

#### Install Dialog Components
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add sheet
```

#### Enhanced Dialog Component
```typescript
// src/components/shadcn/enhanced-dialog.tsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "../../utils/shadcn/cn"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Neumorphic modal styling
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4",
        "bg-white p-6 shadow-neumorphic rounded-lg border border-gray-200",
        "duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

export { Dialog, DialogTrigger, DialogContent }
```

### Phase 3: Data Display Components

#### Install Table and Display Components
```bash
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add pagination
```

#### Enhanced Table Component
```typescript
// src/components/shadcn/enhanced-table.tsx
import * as React from "react"
import { cn } from "../../utils/shadcn/cn"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      // Neumorphic table header
      "bg-gray-50 shadow-neumorphic-inset",
      "[&_tr]:border-b",
      className
    )}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-gray-50/50",
      "data-[state=selected]:bg-gray-100",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-gray-700",
      "[&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell }
```

## Migration Examples

### Before: Custom Components
```typescript
// Old: Custom form component
const EggEntryForm = () => {
  return (
    <div className="bg-white rounded-lg shadow-neumorphic p-6">
      <h3 className="text-lg font-semibold mb-4">Add Egg Entry</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="date"
            className="w-full px-3 py-2 bg-gray-50 rounded-md shadow-neumorphic-inset"
          />
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Save Entry
        </button>
      </div>
    </div>
  );
};
```

### After: Enhanced shadcn/ui Components
```typescript
// New: Enhanced shadcn/ui components with neumorphic styling
import { Card, CardHeader, CardTitle, CardContent } from '../shadcn/enhanced-card';
import { Input } from '../shadcn/enhanced-input';
import { Button } from '../shadcn/enhanced-button';
import { Label } from '../shadcn/enhanced-label';

const EggEntryForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Egg Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            error={errors.date}
          />
        </div>
        <Button type="submit">
          Save Entry
        </Button>
      </CardContent>
    </Card>
  );
};
```

## Accessibility Improvements

### Enhanced Keyboard Navigation
- **Tab Order**: Proper tab sequence through form elements
- **Arrow Key Navigation**: Enhanced table and list navigation
- **Escape Key Handling**: Modal dismissal and focus return
- **Enter Key Support**: Form submission and button activation

### Screen Reader Support
- **ARIA Labels**: Comprehensive labeling for all interactive elements
- **Live Regions**: Dynamic content updates announced
- **Role Attributes**: Proper semantic roles for custom components
- **State Announcements**: Focus and selection state changes

### Example: Accessible Form
```typescript
const AccessibleEggForm = () => {
  return (
    <Card role="form" aria-labelledby="form-title">
      <CardHeader>
        <CardTitle id="form-title">Add Egg Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="egg-date" className="required">
              Date <span aria-label="required">*</span>
            </Label>
            <Input
              id="egg-date"
              type="date"
              required
              aria-describedby="date-error"
              error={errors.date}
            />
            {errors.date && (
              <div id="date-error" role="alert" className="text-sm text-red-600">
                {errors.date}
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            aria-describedby="submit-help"
            disabled={!isValid}
          >
            Save Entry
          </Button>
          <div id="submit-help" className="sr-only">
            {isValid ? 'Ready to save entry' : 'Please fix form errors before submitting'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

## Testing Enhanced Components

### Accessibility Testing
```typescript
// src/components/shadcn/__tests__/enhanced-button.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '../enhanced-button';

describe('Enhanced Button Accessibility', () => {
  it('supports keyboard navigation', () => {
    render(<Button>Test Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('tabIndex', '0');
    button.focus();
    expect(button).toHaveFocus();
  });

  it('provides proper ARIA attributes', () => {
    render(<Button aria-label="Save entry">Save</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('aria-label', 'Save entry');
  });

  it('supports disabled state correctly', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
```

### Visual Regression Testing
```typescript
// Test neumorphic styling preservation
describe('Enhanced Components Visual', () => {
  it('maintains neumorphic styling', () => {
    render(<Button variant="default">Test</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('shadow-neumorphic');
    expect(button).toHaveClass('bg-gradient-to-br');
  });
});
```

## Integration Checklist

### Pre-Migration
- [ ] **Backup Current Components**: Ensure git commit of working state
- [ ] **Component Inventory**: Document all components to be migrated
- [ ] **Accessibility Audit**: Baseline current accessibility level

### Migration Process
- [ ] **Install shadcn Components**: Add components via CLI
- [ ] **Enhance with Neumorphic Styling**: Apply custom design tokens
- [ ] **Test Accessibility**: Verify keyboard navigation and screen reader support
- [ ] **Visual Validation**: Ensure design consistency maintained

### Post-Migration
- [ ] **Accessibility Testing**: Full accessibility audit with tools
- [ ] **Performance Validation**: Ensure no bundle size regression
- [ ] **User Testing**: Validate improved user experience
- [ ] **Documentation**: Update component documentation

## Development Tools

### Useful Commands
```bash
# Install specific shadcn components
npx shadcn-ui@latest add button card input

# Test component accessibility
npm run test:a11y

# Check bundle size impact
npm run build && npm run analyze

# Run development server
npx vercel dev
```

### Browser Extensions for Testing
- **axe DevTools**: Accessibility testing and validation
- **WAVE**: Web accessibility evaluation
- **React Developer Tools**: Component inspection and profiling

## Next Steps

### Immediate Implementation (Week 1)
1. **Button Component**: Enhance primary form buttons
2. **Input Components**: Improve form accessibility
3. **Card Components**: Upgrade content containers

### Progressive Enhancement (Week 2-3)
1. **Modal Components**: Enhanced dialog accessibility
2. **Table Components**: Improved data display
3. **Navigation Components**: Better pagination and menu systems

### Advanced Features (Week 4+)
1. **Complex Components**: Data tables with sorting and filtering
2. **Form Builder**: Reusable form construction patterns
3. **Component Documentation**: Interactive component library

## Related Files

- **Utility Functions**: `src/utils/shadcn/cn.ts`
- **Enhanced Components**: `src/components/shadcn/`
- **Existing Components**: `src/components/forms/`, `src/components/ui/`
- **Test Setup**: `src/test/setup.ts`

---

*This guide outlines the shadcn/ui integration strategy for the Chicken Manager application as of January 2025.*