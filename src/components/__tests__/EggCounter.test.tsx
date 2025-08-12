import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EggCounter } from '../EggCounter'
import { apiService } from '../../services/api'
import { AuthenticationError, NetworkError, ServerError, ApiServiceError } from '../../types/api'

// Mock API service
vi.mock('../../services/api', () => ({
  apiService: {
    production: {
      saveEggEntries: vi.fn(),
    },
  },
}))

// Mock contexts
vi.mock('../../contexts/DataContext', () => ({
  useEggEntries: () => ({
    eggEntries: [],
    isLoading: false,
    updateEggEntries: vi.fn(),
  }),
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
  }),
}))

// Mock other components
vi.mock('../LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

vi.mock('../testCom', () => ({
  StatCard: ({ title, value }: any) => (
    <div data-testid={`stat-card-${title}`}>{value}</div>
  ),
}))

vi.mock('../AnimatedEggCounterPNG', () => ({
  __esModule: true,
  default: () => <div data-testid="animated-egg-counter" />,
}))

describe('EggCounter Component - API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('successfully saves egg entries using consolidated API service', async () => {
    const mockSaveEggEntries = vi.mocked(apiService.production.saveEggEntries)
    mockSaveEggEntries.mockResolvedValueOnce({ success: true })

    render(<EggCounter />)

    // Fill form and submit
    const countInput = screen.getByPlaceholderText(/enter egg count/i)
    const submitButton = screen.getByText(/add entry/i)

    fireEvent.change(countInput, { target: { value: '12' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSaveEggEntries).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            count: 12,
            date: expect.any(String),
            id: expect.any(String),
          }),
        ])
      )
    })

    // Verify success state
    expect(screen.getByText(/entry added successfully/i)).toBeInTheDocument()
  })

  test('handles AuthenticationError with user-friendly message', async () => {
    const mockSaveEggEntries = vi.mocked(apiService.production.saveEggEntries)
    mockSaveEggEntries.mockRejectedValueOnce(
      new AuthenticationError('Authentication failed')
    )

    render(<EggCounter />)

    const countInput = screen.getByPlaceholderText(/enter egg count/i)
    const submitButton = screen.getByText(/add entry/i)

    fireEvent.change(countInput, { target: { value: '12' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/session expired/i)).toBeInTheDocument()
    })
  })

  test('handles NetworkError with connection message', async () => {
    const mockSaveEggEntries = vi.mocked(apiService.production.saveEggEntries)
    mockSaveEggEntries.mockRejectedValueOnce(
      new NetworkError('Network request failed')
    )

    render(<EggCounter />)

    const countInput = screen.getByPlaceholderText(/enter egg count/i)
    const submitButton = screen.getByText(/add entry/i)

    fireEvent.change(countInput, { target: { value: '12' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/network connection issue/i)).toBeInTheDocument()
    })
  })

  test('handles ServerError with server message', async () => {
    const mockSaveEggEntries = vi.mocked(apiService.production.saveEggEntries)
    mockSaveEggEntries.mockRejectedValueOnce(
      new ServerError('Internal server error')
    )

    render(<EggCounter />)

    const countInput = screen.getByPlaceholderText(/enter egg count/i)
    const submitButton = screen.getByText(/add entry/i)

    fireEvent.change(countInput, { target: { value: '12' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })
  })

  test('handles generic ApiServiceError with user-friendly message', async () => {
    const mockSaveEggEntries = vi.mocked(apiService.production.saveEggEntries)
    mockSaveEggEntries.mockRejectedValueOnce(
      new ApiServiceError('Custom API error', 'CUSTOM_ERROR', 400)
    )

    render(<EggCounter />)

    const countInput = screen.getByPlaceholderText(/enter egg count/i)
    const submitButton = screen.getByText(/add entry/i)

    fireEvent.change(countInput, { target: { value: '12' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/custom api error/i)).toBeInTheDocument()
    })
  })

  test('handles generic error with fallback message', async () => {
    const mockSaveEggEntries = vi.mocked(apiService.production.saveEggEntries)
    mockSaveEggEntries.mockRejectedValueOnce(new Error('Generic error'))

    render(<EggCounter />)

    const countInput = screen.getByPlaceholderText(/enter egg count/i)
    const submitButton = screen.getByText(/add entry/i)

    fireEvent.change(countInput, { target: { value: '12' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to save entry/i)).toBeInTheDocument()
    })
  })

  test('ensures all entries have IDs before saving', async () => {
    const mockSaveEggEntries = vi.mocked(apiService.production.saveEggEntries)
    mockSaveEggEntries.mockResolvedValueOnce({ success: true })

    render(<EggCounter />)

    const countInput = screen.getByPlaceholderText(/enter egg count/i)
    const submitButton = screen.getByText(/add entry/i)

    fireEvent.change(countInput, { target: { value: '12' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const savedEntries = mockSaveEggEntries.mock.calls[0][0]
      expect(savedEntries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.stringMatching(/^[\w-]+$/), // UUID pattern
          }),
        ])
      )
    })
  })

  test('preserves existing component behavior', async () => {
    const mockSaveEggEntries = vi.mocked(apiService.production.saveEggEntries)
    mockSaveEggEntries.mockResolvedValueOnce({ success: true })

    render(<EggCounter />)

    // Verify form elements are present (behavior preservation)
    expect(screen.getByPlaceholderText(/enter egg count/i)).toBeInTheDocument()
    expect(screen.getByText(/add entry/i)).toBeInTheDocument()

    // Verify animated component is rendered
    expect(screen.getByTestId('animated-egg-counter')).toBeInTheDocument()

    // Verify stats cards are displayed
    expect(screen.getByTestId(/stat-card/)).toBeInTheDocument()
  })
})

describe('EggCounter Component - Loading States', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('maintains identical loading states during submission', async () => {
    const mockSaveEggEntries = vi.mocked(apiService.production.saveEggEntries)
    // Mock a delay to test loading state
    mockSaveEggEntries.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<EggCounter />)

    const countInput = screen.getByPlaceholderText(/enter egg count/i)
    const submitButton = screen.getByText(/add entry/i)

    fireEvent.change(countInput, { target: { value: '12' } })
    
    // Click submit and verify form behavior
    fireEvent.click(submitButton)

    // The form should still be functional during API call
    expect(countInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()

    await waitFor(() => {
      expect(mockSaveEggEntries).toHaveBeenCalled()
    })
  })
})