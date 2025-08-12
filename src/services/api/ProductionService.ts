import { BaseApiService } from './BaseApiService';
import { ProductionService as IProductionService, ApiResponse } from './types';
import { isLocalStorageMode } from '../../utils/supabase';
import type { EggEntry, FeedEntry, Expense } from '../../types';

/**
 * Production service handling egg tracking, feed inventory, and expenses
 */
export class ProductionService extends BaseApiService implements IProductionService {
  private static instance: ProductionService;

  /**
   * Singleton pattern for consistent production data operations
   */
  public static getInstance(): ProductionService {
    if (!ProductionService.instance) {
      ProductionService.instance = new ProductionService();
    }
    return ProductionService.instance;
  }

  /**
   * Get egg entries from database or localStorage
   */
  public async getEggEntries(): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      const eggEntries = JSON.parse(localStorage.getItem('eggEntries') || '[]');
      return {
        success: true,
        data: eggEntries,
        message: 'Egg entries loaded from localStorage'
      };
    }

    // Use the existing getData endpoint and extract eggEntries
    const response = await this.get('/getData');
    if (response.data && typeof response.data === 'object' && 'eggEntries' in response.data) {
      const responseData = response.data as { eggEntries: EggEntry[] };
      return {
        success: true,
        data: responseData.eggEntries,
        message: 'Egg entries extracted from full data response'
      };
    }

    // Fallback for unexpected response structure
    return {
      success: true,
      data: [],
      message: 'No egg entries found in response'
    };
  }

  /**
   * Save egg entries to database or localStorage
   */
  public async saveEggEntries(entries: EggEntry[]): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      localStorage.setItem('eggEntries', JSON.stringify(entries));
      return {
        success: true,
        message: 'Egg entries saved locally',
        data: { eggEntries: entries }
      };
    }

    return this.post('/saveEggEntries', entries);
  }

  /**
   * Save feed inventory to database or localStorage
   */
  public async saveFeedInventory(inventory: FeedEntry[]): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      localStorage.setItem('feedInventory', JSON.stringify(inventory));
      return {
        success: true,
        message: 'Feed inventory saved locally',
        data: { feedInventory: inventory }
      };
    }

    return this.post('/saveFeedInventory', inventory);
  }

  /**
   * Get expenses from database or localStorage
   */
  public async getExpenses(): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      return {
        success: true,
        data: expenses,
        message: 'Expenses loaded from localStorage'
      };
    }

    // Use the existing getData endpoint and extract expenses
    const response = await this.get('/getData');
    if (response.data && typeof response.data === 'object' && 'expenses' in response.data) {
      const responseData = response.data as { expenses: Expense[] };
      return {
        success: true,
        data: responseData.expenses,
        message: 'Expenses extracted from full data response'
      };
    }

    // Fallback for unexpected response structure
    return {
      success: true,
      data: [],
      message: 'No expenses found in response'
    };
  }

  /**
   * Save expenses to database or localStorage
   */
  public async saveExpenses(expenses: Expense[]): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
      return {
        success: true,
        message: 'Expenses saved locally',
        data: { expenses }
      };
    }

    return this.post('/saveExpenses', expenses);
  }

  /**
   * Get production analytics and insights
   */
  public async getProductionAnalytics(dateRange?: { start: string; end: string }): Promise<ApiResponse> {
    const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
    
    if (isLocalStorageMode()) {
      // Calculate basic analytics from localStorage data
      const eggEntries = JSON.parse(localStorage.getItem('eggEntries') || '[]');
      const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      
      const analytics = this.calculateLocalAnalytics(eggEntries, expenses, dateRange);
      return {
        success: true,
        data: analytics,
        message: 'Analytics calculated from local data'
      };
    }

    return this.get(`/productionAnalytics${params}`);
  }

  /**
   * Calculate basic analytics from local data
   */
  private calculateLocalAnalytics(
    eggEntries: EggEntry[], 
    expenses: Expense[], 
    dateRange?: { start: string; end: string }
  ) {
    let filteredEggs = eggEntries;
    let filteredExpenses = expenses;

    if (dateRange) {
      filteredEggs = eggEntries.filter(entry => 
        entry.date >= dateRange.start && entry.date <= dateRange.end
      );
      filteredExpenses = expenses.filter(expense => 
        expense.date >= dateRange.start && expense.date <= dateRange.end
      );
    }

    const totalEggs = filteredEggs.reduce((sum, entry) => sum + entry.count, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const avgEggsPerDay = filteredEggs.length > 0 ? totalEggs / filteredEggs.length : 0;

    return {
      totalEggs,
      totalExpenses,
      avgEggsPerDay,
      totalDays: filteredEggs.length,
      expenseCategories: this.groupExpensesByCategory(filteredExpenses)
    };
  }

  /**
   * Group expenses by category for analytics
   */
  private groupExpensesByCategory(expenses: Expense[]) {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }
}