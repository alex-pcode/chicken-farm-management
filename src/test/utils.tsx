// Test utilities for Chicken Manager testing
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { DataProvider } from '../contexts/DataContext'

// Mock providers for testing
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="mock-auth-provider">{children}</div>
)

const MockDataProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="mock-data-provider">{children}</div>
)

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

// Mock data for testing
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

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render }