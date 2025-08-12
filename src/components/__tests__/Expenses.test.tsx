import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Expenses } from '../Expenses'
import { apiService } from '../../services/api'
import { AuthenticationError, NetworkError, ServerError } from '../../types/api'

// Mock API service
vi.mock('../../services/api', () => ({
  apiService: {
    production: {
      saveExpenses: vi.fn(),
    },
  },
}))

// Mock contexts
vi.mock('../../contexts/DataContext', () => ({
  useExpenses: () => ({
    expenses: [],
    isLoading: false,
    updateExpenses: vi.fn(),
  }),
}))

// Mock components
vi.mock('../LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

vi.mock('../AnimatedCoinPNG', () => ({
  AnimatedCoinPNG: () => <div data-testid="animated-coin" />,
}))

// Mock Recharts
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}))

describe('Expenses Component - API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('successfully saves expenses using consolidated API service', async () => {
    const mockSaveExpenses = vi.mocked(apiService.production.saveExpenses)
    mockSaveExpenses.mockResolvedValueOnce({ success: true })

    render(<Expenses />)

    // Fill form and submit
    const descriptionInput = screen.getByPlaceholderText(/enter description/i)
    const amountInput = screen.getByPlaceholderText(/0.00/i)
    const submitButton = screen.getByRole('button', { name: /add expense/i })

    fireEvent.change(descriptionInput, { target: { value: 'Chicken feed' } })
    fireEvent.change(amountInput, { target: { value: '25.99' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSaveExpenses).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            description: 'Chicken feed',
            amount: 25.99,
            category: expect.any(String),
            date: expect.any(String),
            id: expect.any(String),
          }),
        ])
      )
    })

    // Verify success state
    expect(screen.getByText(/expense added successfully/i)).toBeInTheDocument()
  })

  test('handles AuthenticationError during expense submission', async () => {
    const mockSaveExpenses = vi.mocked(apiService.production.saveExpenses)
    mockSaveExpenses.mockRejectedValueOnce(
      new AuthenticationError('Authentication failed')
    )

    render(<Expenses />)

    const descriptionInput = screen.getByPlaceholderText(/enter description/i)
    const amountInput = screen.getByPlaceholderText(/0.00/i)
    const submitButton = screen.getByRole('button', { name: /add expense/i })

    fireEvent.change(descriptionInput, { target: { value: 'Test expense' } })
    fireEvent.change(amountInput, { target: { value: '10.00' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/session expired/i)).toBeInTheDocument()
    })
  })

  test('handles NetworkError during expense submission', async () => {
    const mockSaveExpenses = vi.mocked(apiService.production.saveExpenses)
    mockSaveExpenses.mockRejectedValueOnce(
      new NetworkError('Network request failed')
    )

    render(<Expenses />)

    const descriptionInput = screen.getByPlaceholderText(/enter description/i)
    const amountInput = screen.getByPlaceholderText(/0.00/i)
    const submitButton = screen.getByRole('button', { name: /add expense/i })

    fireEvent.change(descriptionInput, { target: { value: 'Test expense' } })
    fireEvent.change(amountInput, { target: { value: '10.00' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/network connection issue/i)).toBeInTheDocument()
    })
  })

  test('handles ServerError during expense submission', async () => {
    const mockSaveExpenses = vi.mocked(apiService.production.saveExpenses)
    mockSaveExpenses.mockRejectedValueOnce(
      new ServerError('Internal server error')
    )

    render(<Expenses />)

    const descriptionInput = screen.getByPlaceholderText(/enter description/i)
    const amountInput = screen.getByPlaceholderText(/0.00/i)
    const submitButton = screen.getByRole('button', { name: /add expense/i })

    fireEvent.change(descriptionInput, { target: { value: 'Test expense' } })
    fireEvent.change(amountInput, { target: { value: '10.00' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })
  })

  test('successfully deletes expenses using consolidated API service', async () => {
    const mockSaveExpenses = vi.mocked(apiService.production.saveExpenses)
    mockSaveExpenses.mockResolvedValue(undefined)

    // Mock useExpenses to return an existing expense
    vi.mocked(vi.importMock('../../contexts/DataContext')).useExpenses = () => ({
      expenses: [
        {
          id: 'test-expense-1',
          date: '2025-01-09',
          category: 'Feed',
          description: 'Chicken feed',
          amount: 25.99,
        },
      ],
      isLoading: false,
      updateExpenses: vi.fn(),
    })

    render(<Expenses />)

    // Find and click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    
    // First click to show confirm
    fireEvent.click(deleteButton)
    
    // Second click to confirm delete
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockSaveExpenses).toHaveBeenCalledWith([])
    })
  })

  test('handles delete error with user-friendly message', async () => {
    const mockSaveExpenses = vi.mocked(apiService.production.saveExpenses)
    mockSaveExpenses.mockRejectedValueOnce(
      new NetworkError('Network request failed')
    )

    // Mock useExpenses to return an existing expense
    vi.mocked(vi.importMock('../../contexts/DataContext')).useExpenses = () => ({
      expenses: [
        {
          id: 'test-expense-1',
          date: '2025-01-09',
          category: 'Feed',
          description: 'Chicken feed',
          amount: 25.99,
        },
      ],
      isLoading: false,
      updateExpenses: vi.fn(),
    })

    render(<Expenses />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    
    // First click to show confirm, second to delete
    fireEvent.click(deleteButton)
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText(/network connection issue/i)).toBeInTheDocument()
    })
  })

  test('preserves form validation and state management', async () => {
    render(<Expenses />)

    // Test form validation
    const submitButton = screen.getByRole('button', { name: /add expense/i })
    fireEvent.click(submitButton)

    // Should show validation errors
    expect(screen.getByText(/please enter a description/i)).toBeInTheDocument()
    expect(screen.getByText(/please enter an amount/i)).toBeInTheDocument()
  })

  test('maintains identical user experience', () => {
    render(<Expenses />)

    // Verify all form elements are present
    expect(screen.getByPlaceholderText(/enter description/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/0.00/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument()

    // Verify chart components are rendered
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()

    // Verify animated component
    expect(screen.getByTestId('animated-coin')).toBeInTheDocument()
  })
})

describe('Expenses Component - Form Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('clears form after successful submission', async () => {
    const mockSaveExpenses = vi.mocked(apiService.production.saveExpenses)
    mockSaveExpenses.mockResolvedValueOnce({ success: true })

    render(<Expenses />)

    const descriptionInput = screen.getByPlaceholderText(/enter description/i) as HTMLInputElement
    const amountInput = screen.getByPlaceholderText(/0.00/i) as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /add expense/i })

    fireEvent.change(descriptionInput, { target: { value: 'Test expense' } })
    fireEvent.change(amountInput, { target: { value: '15.50' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(descriptionInput.value).toBe('')
      expect(amountInput.value).toBe('')
    })
  })

  test('preserves continue mode functionality', async () => {
    const mockSaveExpenses = vi.mocked(apiService.production.saveExpenses)
    mockSaveExpenses.mockResolvedValue(undefined)

    render(<Expenses />)

    // Enable continue mode
    const continueCheckbox = screen.getByLabelText(/continue adding/i)
    fireEvent.click(continueCheckbox)

    const descriptionInput = screen.getByPlaceholderText(/enter description/i) as HTMLInputElement
    const amountInput = screen.getByPlaceholderText(/0.00/i) as HTMLInputElement
    const categorySelect = screen.getByDisplayValue(/Feed/i) as HTMLSelectElement
    const submitButton = screen.getByRole('button', { name: /add expense/i })

    fireEvent.change(descriptionInput, { target: { value: 'Test expense' } })
    fireEvent.change(amountInput, { target: { value: '15.50' } })
    fireEvent.change(categorySelect, { target: { value: 'Medication' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      // In continue mode, description and amount should clear but category should stay
      expect(descriptionInput.value).toBe('')
      expect(amountInput.value).toBe('')
      expect(categorySelect.value).toBe('Medication')
    })
  })
})