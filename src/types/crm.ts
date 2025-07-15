// CRM types for customer and sales management

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  notes?: string;
  created_at: string;
  is_active: boolean;
}

export interface Sale {
  id: string;
  user_id: string;
  customer_id: string;
  sale_date: string;
  dozen_count: number;
  individual_count: number;
  total_amount: number;
  notes?: string;
  created_at: string;
}

export interface SaleWithCustomer extends Sale {
  customer_name: string;
}

export interface CustomerWithStats extends Customer {
  total_purchases: number;
  total_eggs: number;
  last_purchase_date?: string;
}

// Form interfaces for creating/updating
export interface CustomerForm {
  name: string;
  phone?: string;
  notes?: string;
}

export interface SaleForm {
  customer_id: string;
  sale_date: string;
  dozen_count: number;
  individual_count: number;
  total_amount: number;
  notes?: string;
}

// Summary interfaces for reporting
export interface SalesSummary {
  total_sales: number;
  total_revenue: number;
  total_eggs_sold: number;
  free_eggs_given: number;
  customer_count: number;
  top_customer?: string;
}

export interface MonthlySales {
  month: string;
  total_sales: number;
  total_revenue: number;
  total_eggs: number;
}
