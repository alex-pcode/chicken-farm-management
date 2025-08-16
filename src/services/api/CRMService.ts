import { BaseApiService } from './BaseApiService';
import { CrmService as ICrmService, ApiResponse } from './types';
import type { 
  Customer, 
  Sale, 
  SaleWithCustomer, 
  CustomerForm, 
  SaleForm, 
  SalesSummary 
} from '../../types/crm';

/**
 * CRM service handling customer and sales operations
 */
export class CRMService extends BaseApiService implements ICrmService {
  private static instance: CRMService;

  /**
   * Singleton pattern for consistent CRM data operations
   */
  public static getInstance(): CRMService {
    if (!CRMService.instance) {
      CRMService.instance = new CRMService();
    }
    return CRMService.instance;
  }

  /**
   * Get all customers for the authenticated user
   */
  public async getCustomers(): Promise<ApiResponse<Customer[]>> {
    return this.get<Customer[]>('/customers');
  }

  /**
   * Create a new customer
   */
  public async saveCustomer(customerData: CustomerForm): Promise<ApiResponse<Customer>> {
    return this.post<Customer>('/customers', customerData);
  }

  /**
   * Update an existing customer
   */
  public async updateCustomer(id: string, customerData: Partial<CustomerForm & { is_active: boolean }>): Promise<ApiResponse<Customer>> {
    return this.put<Customer>('/customers', { id, ...customerData });
  }

  /**
   * Delete a customer (soft delete by setting is_active to false)
   */
  public async deleteCustomer(customerId: string): Promise<ApiResponse<Customer>> {
    return this.updateCustomer(customerId, { is_active: false });
  }

  /**
   * Get all sales for the authenticated user
   */
  public async getSales(): Promise<ApiResponse<SaleWithCustomer[]>> {
    return this.get<SaleWithCustomer[]>('/sales');
  }

  /**
   * Create a new sale record
   */
  public async saveSale(saleData: SaleForm): Promise<ApiResponse<SaleWithCustomer>> {
    return this.post<SaleWithCustomer>('/sales', saleData);
  }

  /**
   * Update an existing sale record
   */
  public async updateSale(id: string, saleData: Partial<SaleForm>): Promise<ApiResponse<SaleWithCustomer>> {
    return this.put<SaleWithCustomer>('/sales', { id, ...saleData });
  }

  /**
   * Get CRM-specific data (customers, recent sales, sales summary)
   */
  public async getCRMData(): Promise<ApiResponse<{
    customers: Customer[];
    recentSales: Sale[];
    salesSummary: SalesSummary;
  }>> {
    return this.get('/crm-data');
  }

  /**
   * Get sales reports data
   */
  public async getSalesReports(options?: { 
    startDate?: string; 
    endDate?: string; 
    groupBy?: 'month' | 'week' | 'day';
  }): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.groupBy) params.append('groupBy', options.groupBy);
    
    const queryString = params.toString();
    const endpoint = `/salesReports${queryString ? `?${queryString}` : ''}`;
    
    return this.get(endpoint);
  }
}