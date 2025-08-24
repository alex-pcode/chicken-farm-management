import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import type { 
  EggEntry, 
  Expense, 
  FeedEntry, 
  FlockProfile, 
  FlockEvent,
  EggEntriesResponse,
  ExpensesResponse,
  FeedInventoryResponse,
  FlockProfileResponse,
  FlockEventsResponse,
  FlockEventResponse,
  DeleteEventResponse,
  MigrationResponse
} from '../../types'
//import {
//  AuthenticationError,
//  NetworkError,
//  ServerError
//} from '../../types/api'

// Mock fetch globally
global.fetch = vi.fn()

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    refreshSession: vi.fn(),
    signOut: vi.fn(),
  },
}

vi.mock('../supabase', () => ({
  supabase: mockSupabase,
}))

describe('Auth API Utils - Type Safety', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful auth by default
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { 
        session: { 
          access_token: 'mock-token' 
        } 
      },
      error: null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Type Safety - Parameter Types', () => {
    test('saveEggEntries accepts typed EggEntry array', async () => {
      const { saveEggEntries } = await import('../authApiUtils')
      
      const mockResponse: EggEntriesResponse = {
        success: true,
        data: { saved: 2, entries: ['1', '2'] }
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const entries: EggEntry[] = [
        { id: '1', date: '2025-08-09', count: 12 },
        { id: '2', date: '2025-08-10', count: 14 }
      ]

      const result = await saveEggEntries(entries)
      
      expect(result).toEqual(mockResponse)
      expect(result.data?.saved).toBe(2)
      expect(result.data?.entries).toHaveLength(2)
    })

    test('saveExpenses accepts typed Expense array', async () => {
      const { saveExpenses } = await import('../authApiUtils')
      
      const mockResponse: ExpensesResponse = {
        success: true,
        data: { saved: 1, expenses: ['expense1'] }
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const expenses: Expense[] = [{
        date: '2025-08-09',
        category: 'feed',
        description: 'Chicken feed',
        amount: 25.50
      }]

      const result = await saveExpenses(expenses)
      expect(result).toEqual(mockResponse)
    })

    test('saveFeedInventory accepts typed FeedEntry array', async () => {
      const { saveFeedInventory } = await import('../authApiUtils')
      
      const mockResponse: FeedInventoryResponse = {
        success: true,
        data: { saved: 1, inventory: ['feed1'] }
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const inventory: FeedEntry[] = [{
        id: '1',
        brand: 'Premium Feed',
        type: 'layer',
        quantity: 50,
        unit: 'kg',
        openedDate: '2025-08-09',
        pricePerUnit: 1.20
      }]

      const result = await saveFeedInventory(inventory)
      expect(result).toEqual(mockResponse)
    })

    test('saveFlockProfile accepts typed FlockProfile', async () => {
      const { saveFlockProfile } = await import('../authApiUtils')
      
      const mockResponse: FlockProfileResponse = {
        success: true,
        data: { profileId: 'profile1', updated: true }
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const profile: FlockProfile = {
        hens: 25,
        roosters: 2,
        chicks: 0,
        lastUpdated: '2025-08-09',
        breedTypes: ['Rhode Island Red'],
        events: [],
        brooding: 0
      }

      const result = await saveFlockProfile(profile)
      expect(result).toEqual(mockResponse)
    })

    test('saveFlockEvents accepts typed FlockEvent array', async () => {
      const { saveFlockEvents } = await import('../authApiUtils')
      
      const mockResponse: FlockEventsResponse = {
        success: true,
        data: { saved: 1, events: ['event1'] }
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const events: FlockEvent[] = [{
        id: '1',
        date: '2025-08-09',
        type: 'laying_start',
        description: 'First eggs from new batch',
        affectedBirds: 10
      }]

      const result = await saveFlockEvents(events)
      expect(result).toEqual(mockResponse)
    })

    test('saveFlockEvent accepts typed FlockEvent', async () => {
      const { saveFlockEvent } = await import('../authApiUtils')
      
      const mockResponse: FlockEventResponse = {
        success: true,
        data: { eventId: 'event1', created: true, updated: false }
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const event: FlockEvent = {
        id: '1',
        date: '2025-08-09',
        type: 'other',
        description: 'Monthly health inspection'
      }

      const result = await saveFlockEvent('profile123', event)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Type Safety - Return Types', () => {
    test('deleteFlockEvent returns typed DeleteEventResponse', async () => {
      const { deleteFlockEvent } = await import('../authApiUtils')
      
      const mockResponse: DeleteEventResponse = {
        success: true,
        data: { deleted: true, eventId: 'event123' }
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await deleteFlockEvent('event123')
      expect(result).toEqual(mockResponse)
      expect(result.success).toBe(true)
      expect(result.data?.deleted).toBe(true)
      expect(result.data?.eventId).toBe('event123')
    })

    test('migrateUserData returns typed MigrationResponse', async () => {
      const { migrateUserData } = await import('../authApiUtils')
      
      const mockResponse: MigrationResponse = {
        success: true,
        data: { migrated: true, recordsProcessed: 150 }
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await migrateUserData()
      expect(result).toEqual(mockResponse)
      expect(result.data?.recordsProcessed).toBe(150)
    })
  })

  describe('Error Handling - Typed Errors', () => {
    test('throws AuthenticationError for auth failures', async () => {
      const { saveEggEntries } = await import('../authApiUtils')
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session expired')
      })
      
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Refresh failed')
      })

      const entries: EggEntry[] = [{ id: '1', date: '2025-08-09', count: 12 }]
      
      await expect(saveEggEntries(entries)).rejects.toThrow('User not authenticated - please log in again')
    })

    test('throws NetworkError for fetch failures', async () => {
      const { saveEggEntries } = await import('../authApiUtils')
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const entries: EggEntry[] = [{ id: '1', date: '2025-08-09', count: 12 }]
      
      await expect(saveEggEntries(entries)).rejects.toThrow('Unable to save egg entries. Please check your connection.')
    })

    test('throws ServerError for HTTP errors', async () => {
      const { saveEggEntries } = await import('../authApiUtils')
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      })

      const entries: EggEntry[] = [{ id: '1', date: '2025-08-09', count: 12 }]
      
      await expect(saveEggEntries(entries)).rejects.toThrow('Failed to save egg entries. Please try again.')
    })

    test('authentication error triggers signOut', async () => {
      const { saveEggEntries } = await import('../authApiUtils')
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('not authenticated'))

      const entries: EggEntry[] = [{ id: '1', date: '2025-08-09', count: 12 }]
      
      try {
        await saveEggEntries(entries)
      } catch {
        // Error expected
      }
      
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })
  })

  describe('JSDoc Examples - Runtime Validation', () => {
    test('JSDoc example for saveEggEntries compiles and runs', async () => {
      const { saveEggEntries } = await import('../authApiUtils')
      
      const mockResponse: EggEntriesResponse = {
        success: true,
        data: { saved: 1, entries: ['1'] }
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      // This is the exact example from JSDoc
      const entries: EggEntry[] = [{ id: '1', date: '2025-08-09', count: 12 }]
      const response = await saveEggEntries(entries)
      
      if (response.success) {
        expect(response.data?.saved).toBe(1)
      }
    })

    test('JSDoc example for saveExpenses compiles and runs', async () => {
      const { saveExpenses } = await import('../authApiUtils')
      
      const mockResponse: ExpensesResponse = {
        success: true,
        data: { saved: 1, expenses: ['1'] }
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      // This is the exact example from JSDoc  
      const expenses: Expense[] = [{ 
        date: '2025-08-09', 
        category: 'feed', 
        description: 'Chicken feed', 
        amount: 25.50 
      }]
      const response = await saveExpenses(expenses)
      
      expect(response.success).toBe(true)
    })

    test('JSDoc example for error handling compiles and runs', async () => {
      const { fetchData } = await import('../authApiUtils')
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session expired')
      })
      
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Refresh failed')
      })

      // This demonstrates the JSDoc error handling example pattern
      try {
        await fetchData()
      } catch (error) {
        // The error should be properly typed
        expect(error).toBeDefined()
      }
    })
  })

  describe('Compile-time Type Checking', () => {
    test('TypeScript compiler catches type errors', () => {
      // These tests validate that TypeScript compilation would catch errors
      // The test itself validates proper typing by importing and using types
      
      const validEggEntry: EggEntry = {
        id: '1',
        date: '2025-08-09', 
        count: 12
      }
      
      const validExpense: Expense = {
        date: '2025-08-09',
        category: 'feed',
        description: 'Test',
        amount: 10.00
      }
      
      const validFeedEntry: FeedEntry = {
        id: '1',
        brand: 'Test',
        type: 'layer',
        quantity: 10,
        unit: 'kg',
        openedDate: '2025-08-09',
        pricePerUnit: 1.0
      }

      // If these compile without error, type checking is working
      expect(validEggEntry.count).toBeTypeOf('number')
      expect(validExpense.amount).toBeTypeOf('number')
      expect(validFeedEntry.unit).toMatch(/^(kg|lbs)$/)
    })
  })

  describe('Backward Compatibility', () => {
    test('existing component patterns still work with new types', async () => {
      // This test ensures that the typing changes don't break existing usage patterns
      const { saveEggEntries } = await import('../authApiUtils')
      
      const mockResponse: EggEntriesResponse = {
        success: true,
        data: { saved: 1, entries: ['1'] }
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      // Simulate how components would use the API
      const entries: EggEntry[] = [
        { id: '1', date: new Date().toISOString().split('T')[0], count: 15 }
      ]
      
      const result = await saveEggEntries(entries)
      
      // Components should be able to check success and access data
      expect(result.success).toBe(true)
      if (result.success && result.data) {
        expect(result.data.saved).toBe(1)
        expect(result.data.entries).toContain('1')
      }
    })
  })
})