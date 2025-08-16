import { BaseApiService } from './BaseApiService';
import { ProductionService as IProductionService, ApiResponse } from './types';
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
   * Get egg entries from database
   */
  public async getEggEntries(): Promise<ApiResponse> {
    // Use the production data endpoint which returns { eggEntries: [...] }
    const response = await this.get('/data?type=production');
    if (response.data && typeof response.data === 'object' && 'eggEntries' in response.data) {
      const responseData = response.data as { eggEntries: EggEntry[] };
      return {
        success: true,
        data: responseData.eggEntries,
        message: 'Egg entries fetched successfully'
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
   * Save egg entries to database
   */
  public async saveEggEntries(entries: EggEntry[]): Promise<ApiResponse> {
    return this.post('/crud?operation=eggs', entries);
  }

  /**
   * Save feed inventory to database
   */
  public async saveFeedInventory(inventory: FeedEntry[]): Promise<ApiResponse> {
    return this.post('/crud?operation=feed', inventory);
  }

  /**
   * Get expenses from database
   */
  public async getExpenses(): Promise<ApiResponse> {
    // Use the expenses data endpoint which returns { expenses: [...] }
    const response = await this.get('/data?type=expenses');
    if (response.data && typeof response.data === 'object' && 'expenses' in response.data) {
      const responseData = response.data as { expenses: Expense[] };
      return {
        success: true,
        data: responseData.expenses,
        message: 'Expenses fetched successfully'
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
   * Save expenses to database
   */
  public async saveExpenses(expenses: Expense[]): Promise<ApiResponse> {
    return this.post('/crud?operation=expenses', expenses);
  }

  /**
   * Delete expense by ID
   */
  public async deleteExpense(expenseId: string): Promise<ApiResponse> {
    return this.delete('/crud?operation=expenses', { id: expenseId });
  }

  /**
   * Delete feed inventory item
   */
  public async deleteFeedInventory(feedId: string): Promise<ApiResponse> {
    return this.delete('/crud?operation=feed', { id: feedId });
  }

  /**
   * Get production analytics and insights
   */
  public async getProductionAnalytics(dateRange?: { start: string; end: string }): Promise<ApiResponse> {
    const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
    return this.get(`/productionAnalytics${params}`);
  }
}