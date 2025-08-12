// Test setup file for Vitest + React Testing Library
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock Framer Motion for tests (reduces complexity)
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    form: 'form',
    input: 'input',
    span: 'span',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
}))

// Mock Recharts for tests (reduces complexity)
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  LineChart: 'div',
  Line: 'div',
  XAxis: 'div',
  YAxis: 'div',
  CartesianGrid: 'div',
  Tooltip: 'div',
  Legend: 'div',
  BarChart: 'div',
  Bar: 'div',
  PieChart: 'div',
  Pie: 'div',
  Cell: 'div',
}))

// Mock Supabase client
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

// Runs a cleanup after each test case
afterEach(() => {
  cleanup()
})

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})