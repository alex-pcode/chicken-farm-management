import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FeedTracker } from '../FeedTracker'
import { apiService } from '../../services/api'
import { AuthenticationError, NetworkError, ServerError } from '../../types/api'

// Mock API service
vi.mock('../../services/api', () => ({
  apiService: {
    production: {
      saveFeedInventory: vi.fn(),
      saveExpenses: vi.fn(),
    },
  },
}))

// Mock contexts
vi.mock('../../contexts/OptimizedDataProvider', () => ({
  useOptimizedAppData: () => ({
    data: {
      expenses: [],
      eggEntries: [],
      feedInventory: [],
      flockProfile: { id: 'test-flock', flock_name: 'Test Flock' },
      flockEvents: [],
      customers: [],
      sales: [],
      summary: undefined
    },
    isLoading: false,
    error: null,
    refreshData: vi.fn(),
    lastFetched: null
  }),
  useFeedInventory: () => [],
  useFlockProfile: () => ({ id: 'test-flock', flock_name: 'Test Flock' }),
  useAppData: () => ({
    data: {},
    updateExpenses: vi.fn(),
  }),
}))

// Mock components
vi.mock('../AnimatedFeedPNG', () => ({
  __esModule: true,
  default: () => <div data-testid="animated-feed" />,
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-123',
}))

describe('FeedTracker Component - API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('successfully saves feed inventory using consolidated API service', async () => {
    const mockSaveFeedInventory = vi.mocked(apiService.production.saveFeedInventory)
    const mockSaveExpenses = vi.mocked(apiService.production.saveExpenses)
    mockSaveFeedInventory.mockResolvedValueOnce({ success: true })
    mockSaveExpenses.mockResolvedValueOnce({ success: true })

    render(<FeedTracker />)

    // Fill form and submit
    const brandInput = screen.getByPlaceholderText(/enter feed brand/i)
    const quantityInput = screen.getByPlaceholderText(/quantity/i)
    const priceInput = screen.getByPlaceholderText(/price per unit/i)
    const submitButton = screen.getByRole('button', { name: /add feed/i })

    fireEvent.change(brandInput, { target: { value: 'Premium Feed Co.' } })
    fireEvent.change(quantityInput, { target: { value: '50' } })
    fireEvent.change(priceInput, { target: { value: '25.99' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSaveFeedInventory).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'test-uuid-123',
            brand: 'Premium Feed Co.',
            quantity: 50,
            pricePerUnit: 25.99,
            type: 'Baby chicks', // default
            unit: 'kg', // default
            openedDate: expect.any(String),
          }),
        ])
      )
    })

    // Should also create expense entry
    expect(mockSaveExpenses).toHaveBeenCalled()
  })

  test('handles AuthenticationError during feed inventory save', async () => {
    const mockSaveFeedInventory = vi.mocked(apiService.production.saveFeedInventory)
    mockSaveFeedInventory.mockRejectedValueOnce(
      new AuthenticationError('Authentication failed')
    )

    render(<FeedTracker />)

    const brandInput = screen.getByPlaceholderText(/enter feed brand/i)
    const quantityInput = screen.getByPlaceholderText(/quantity/i)
    const priceInput = screen.getByPlaceholderText(/price per unit/i)
    const submitButton = screen.getByRole('button', { name: /add feed/i })

    fireEvent.change(brandInput, { target: { value: 'Test Feed' } })
    fireEvent.change(quantityInput, { target: { value: '25' } })
    fireEvent.change(priceInput, { target: { value: '15.00' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/session expired/i)).toBeInTheDocument()
    })
  })

  test('handles NetworkError during feed inventory save', async () => {
    const mockSaveFeedInventory = vi.mocked(apiService.production.saveFeedInventory)
    mockSaveFeedInventory.mockRejectedValueOnce(
      new NetworkError('Network request failed')
    )

    render(<FeedTracker />)

    const brandInput = screen.getByPlaceholderText(/enter feed brand/i)
    const quantityInput = screen.getByPlaceholderText(/quantity/i)
    const priceInput = screen.getByPlaceholderText(/price per unit/i)
    const submitButton = screen.getByRole('button', { name: /add feed/i })

    fireEvent.change(brandInput, { target: { value: 'Test Feed' } })
    fireEvent.change(quantityInput, { target: { value: '25' } })
    fireEvent.change(priceInput, { target: { value: '15.00' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/network connection issue/i)).toBeInTheDocument()
    })
  })

  test('handles ServerError during feed inventory save', async () => {
    const mockSaveFeedInventory = vi.mocked(apiService.production.saveFeedInventory)
    mockSaveFeedInventory.mockRejectedValueOnce(
      new ServerError('Internal server error')
    )

    render(<FeedTracker />)

    const brandInput = screen.getByPlaceholderText(/enter feed brand/i)
    const quantityInput = screen.getByPlaceholderText(/quantity/i)
    const priceInput = screen.getByPlaceholderText(/price per unit/i)
    const submitButton = screen.getByRole('button', { name: /add feed/i })

    fireEvent.change(brandInput, { target: { value: 'Test Feed' } })
    fireEvent.change(quantityInput, { target: { value: '25' } })
    fireEvent.change(priceInput, { target: { value: '15.00' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })
  })

  test('successfully marks feed as depleted using consolidated API service', async () => {
    const mockSaveFeedInventory = vi.mocked(apiService.production.saveFeedInventory)
    mockSaveFeedInventory.mockResolvedValueOnce({ success: true })

    // Mock useFeedInventory to return existing feed
    vi.mocked(vi.importMock('../../contexts/OptimizedDataProvider')).useFeedInventory = () => ({
      feedInventory: [
        {
          id: 'feed-1',
          brand: 'Test Feed',
          type: 'Big chicks',
          quantity: 25,
          unit: 'kg',
          pricePerUnit: 20.99,
          openedDate: '2025-01-01',
        },
      ],
      isLoading: false,
      updateFeedInventory: vi.fn(),
    })

    render(<FeedTracker />)

    const depleteButton = screen.getByRole('button', { name: /mark as depleted/i })
    fireEvent.click(depleteButton)

    await waitFor(() => {
      expect(mockSaveFeedInventory).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'feed-1',
            depletedDate: expect.any(String),
          }),
        ])
      )
    })
  })

  test('handles error during feed depletion', async () => {
    const mockSaveFeedInventory = vi.mocked(apiService.production.saveFeedInventory)
    mockSaveFeedInventory.mockRejectedValueOnce(
      new NetworkError('Network request failed')
    )

    // Mock useFeedInventory to return existing feed
    vi.mocked(vi.importMock('../../contexts/OptimizedDataProvider')).useFeedInventory = () => ({
      feedInventory: [
        {
          id: 'feed-1',
          brand: 'Test Feed',
          type: 'Big chicks',
          quantity: 25,
          unit: 'kg',
          pricePerUnit: 20.99,
          openedDate: '2025-01-01',
        },
      ],
      isLoading: false,
      updateFeedInventory: vi.fn(),
    })

    render(<FeedTracker />)

    const depleteButton = screen.getByRole('button', { name: /mark as depleted/i })
    fireEvent.click(depleteButton)

    await waitFor(() => {
      expect(screen.getByText(/network connection issue/i)).toBeInTheDocument()
    })
  })

  test('successfully deletes feed using consolidated API service', async () => {
    const mockSaveFeedInventory = vi.mocked(apiService.production.saveFeedInventory)
    mockSaveFeedInventory.mockResolvedValueOnce({ success: true })

    // Mock useFeedInventory to return existing feed
    vi.mocked(vi.importMock('../../contexts/OptimizedDataProvider')).useFeedInventory = () => ({
      feedInventory: [
        {
          id: 'feed-1',
          brand: 'Test Feed',
          type: 'Big chicks',
          quantity: 25,
          unit: 'kg',
          pricePerUnit: 20.99,
          openedDate: '2025-01-01',
        },
      ],
      isLoading: false,
      updateFeedInventory: vi.fn(),
    })

    render(<FeedTracker />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    
    // First click to show confirm
    fireEvent.click(deleteButton)
    
    // Second click to confirm delete
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockSaveFeedInventory).toHaveBeenCalledWith([])
    })
  })

  test('handles error during feed deletion', async () => {
    const mockSaveFeedInventory = vi.mocked(apiService.production.saveFeedInventory)
    mockSaveFeedInventory.mockRejectedValueOnce(
      new AuthenticationError('Authentication failed')
    )

    // Mock useFeedInventory to return existing feed
    vi.mocked(vi.importMock('../../contexts/OptimizedDataProvider')).useFeedInventory = () => ({
      feedInventory: [
        {
          id: 'feed-1',
          brand: 'Test Feed',
          type: 'Big chicks',
          quantity: 25,
          unit: 'kg',
          pricePerUnit: 20.99,
          openedDate: '2025-01-01',
        },
      ],
      isLoading: false,
      updateFeedInventory: vi.fn(),
    })

    render(<FeedTracker />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    
    // First click to show confirm, second to delete
    fireEvent.click(deleteButton)
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText(/session expired/i)).toBeInTheDocument()
    })
  })

  test('maintains existing inventory tracking behavior', () => {
    render(<FeedTracker />)

    // Verify all form elements are present
    expect(screen.getByPlaceholderText(/enter feed brand/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/quantity/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/price per unit/i)).toBeInTheDocument()

    // Verify feed type selector
    expect(screen.getByDisplayValue(/baby chicks/i)).toBeInTheDocument()

    // Verify animated component
    expect(screen.getByTestId('animated-feed')).toBeInTheDocument()

    // Verify submit button
    expect(screen.getByRole('button', { name: /add feed/i })).toBeInTheDocument()
  })
})

describe('FeedTracker Component - Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('validates required fields before submission', () => {
    render(<FeedTracker />)

    const submitButton = screen.getByRole('button', { name: /add feed/i })
    fireEvent.click(submitButton)

    // Should show validation error
    expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument()
  })

  test('clears form after successful submission', async () => {
    const mockSaveFeedInventory = vi.mocked(apiService.production.saveFeedInventory)
    const mockSaveExpenses = vi.mocked(apiService.production.saveExpenses)
    mockSaveFeedInventory.mockResolvedValueOnce({ success: true })
    mockSaveExpenses.mockResolvedValueOnce({ success: true })

    render(<FeedTracker />)

    const brandInput = screen.getByPlaceholderText(/enter feed brand/i) as HTMLInputElement
    const quantityInput = screen.getByPlaceholderText(/quantity/i) as HTMLInputElement
    const priceInput = screen.getByPlaceholderText(/price per unit/i) as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /add feed/i })

    fireEvent.change(brandInput, { target: { value: 'Test Feed' } })
    fireEvent.change(quantityInput, { target: { value: '25' } })
    fireEvent.change(priceInput, { target: { value: '15.00' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(brandInput.value).toBe('')
      expect(quantityInput.value).toBe('')
      expect(priceInput.value).toBe('')
    })
  })

  test('handles expense creation failure gracefully', async () => {
    const mockSaveFeedInventory = vi.mocked(apiService.production.saveFeedInventory)
    const mockSaveExpenses = vi.mocked(apiService.production.saveExpenses)
    mockSaveFeedInventory.mockResolvedValueOnce({ success: true })
    mockSaveExpenses.mockRejectedValueOnce(new Error('Expense save failed'))

    render(<FeedTracker />)

    const brandInput = screen.getByPlaceholderText(/enter feed brand/i)
    const quantityInput = screen.getByPlaceholderText(/quantity/i)
    const priceInput = screen.getByPlaceholderText(/price per unit/i)
    const submitButton = screen.getByRole('button', { name: /add feed/i })

    fireEvent.change(brandInput, { target: { value: 'Test Feed' } })
    fireEvent.change(quantityInput, { target: { value: '25' } })
    fireEvent.change(priceInput, { target: { value: '15.00' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/feed saved but failed to record expense/i)).toBeInTheDocument()
    })
  })
})