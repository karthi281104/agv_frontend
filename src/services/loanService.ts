import { apiClient } from './apiClient';

// Simple types for loan service
export interface Loan {
  id: string;
  loanNumber: string;
  customerId: string;
  customerName: string;
  // Backend provides totals per loan
  goldWeight: number; // maps from totalGoldWeight
  goldPurity?: string; // not provided at loan level; may derive from items
  goldValue: number; // maps from totalGoldValue
  // Amounts
  principalAmount: number; // maps from principalAmount
  loanAmount: number; // kept for compatibility (same as principalAmount)
  interestRate: number;
  tenure: number;
  emiAmount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'OVERDUE';
  disbursedDate?: string; // maps from disbursementDate
  dueDate?: string; // maps from maturityDate
  outstandingAmount: number;
  totalInterest: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  aadharNumber: string;
}

export interface CreateLoanData {
  customerId: string;
  goldWeight: number;
  goldPurity: string;
  goldValue: number;
  loanAmount: number;
  interestRate: number;
  tenure: number;
}

export interface LoanSearchFilters {
  search?: string;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface LoanListResponse {
  loans: Loan[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Helper function to map backend loan to frontend format
const mapBackendLoanToFrontend = (backendLoan: any): Loan => {
  return {
    id: backendLoan.id,
    loanNumber: backendLoan.loanNumber || `LN${backendLoan.id.slice(-4)}`,
    customerId: backendLoan.customerId,
    customerName: backendLoan.customer ? `${backendLoan.customer.firstName} ${backendLoan.customer.lastName}` : 'Unknown',
    // Map fields from backend schema
    goldWeight: parseFloat(backendLoan.totalGoldWeight ?? backendLoan.goldWeight ?? 0),
    goldPurity: backendLoan.goldPurity, // not in list response; optional
    goldValue: parseFloat(backendLoan.totalGoldValue ?? backendLoan.goldValue ?? 0),
    principalAmount: parseFloat(backendLoan.principalAmount ?? backendLoan.loanAmount ?? 0),
    loanAmount: parseFloat(backendLoan.principalAmount ?? backendLoan.loanAmount ?? 0),
    interestRate: parseFloat(backendLoan.interestRate ?? 0),
    tenure: parseInt(backendLoan.tenure ?? 0),
    emiAmount: parseFloat(backendLoan.emiAmount ?? 0),
    status: backendLoan.status || 'PENDING',
    disbursedDate: backendLoan.disbursementDate ?? backendLoan.disbursedDate,
    dueDate: backendLoan.maturityDate ?? backendLoan.dueDate,
    outstandingAmount: parseFloat(
      backendLoan.outstandingAmount ?? backendLoan.principalAmount ?? backendLoan.loanAmount ?? 0
    ),
    totalInterest: backendLoan.totalInterest || 0,
    createdAt: backendLoan.createdAt,
    updatedAt: backendLoan.updatedAt
  };
};

// Loan Service with Real API Calls
export const loanService = {
  // Get loans with filtering and pagination
  async getLoans(
    filters: LoanSearchFilters = {},
    page = 1,
    limit = 10
  ): Promise<LoanListResponse> {
    try {
      // Ensure we have the latest token from localStorage (set by AuthProvider)
      apiClient.refreshToken();

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.status && filters.status.length > 0) {
        params.append('status', filters.status.join(','));
      }
      
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo);
      }
      
  const response: any = await apiClient.get(`/loans?${params.toString()}`);
  console.log('[loanService.getLoans] raw response:', response);
  // Backend: { success, message, data: { data: [...], pagination: {...} } }
  const envelope = response?.data ?? response; // in case someone passes already-unwrapped
  const loansData = envelope?.data ?? envelope?.loans ?? [];
  const pagination = envelope?.pagination ?? {};
  console.log('[loanService.getLoans] extracted loans length:', Array.isArray(loansData) ? loansData.length : 0);
      
      // Map backend loans to frontend format
  const mappedLoans = (Array.isArray(loansData) ? loansData : []).map(mapBackendLoanToFrontend);
      
      return {
        loans: mappedLoans,
        total: pagination.total || response.total || loansData.length,
        page: pagination.page || response.page || page,
        limit: pagination.limit || response.limit || limit,
        hasMore: response.hasMore || pagination.hasMore || ((page * limit) < (pagination.total || loansData.length))
      };
    } catch (error) {
      console.error('Error fetching loans:', error);
      throw new Error('Failed to fetch loans');
    }
  },

  // Get single loan
  async getLoan(id: string): Promise<Loan> {
    try {
  apiClient.refreshToken();
  const response: any = await apiClient.get(`/loans/${id}`);
      // Backend: { success, message, data: loan }
      const loanData = response?.data || response;
      return mapBackendLoanToFrontend(loanData);
    } catch (error) {
      console.error('Error fetching loan:', error);
      throw new Error('Failed to fetch loan');
    }
  },

  // Create new loan
  async createLoan(loanData: CreateLoanData): Promise<Loan> {
    try {
  apiClient.refreshToken();
  const response: any = await apiClient.post('/loans', loanData);
      // Backend: { success, message, data: loan }
      const createdLoan = response?.data || response;
      return mapBackendLoanToFrontend(createdLoan);
    } catch (error) {
      console.error('Error creating loan:', error);
      throw new Error('Failed to create loan');
    }
  },

  // Search customers for loan creation
  async searchCustomers(query: string): Promise<Customer[]> {
    try {
      if (!query.trim()) {
        return [];
      }
      
      const response: any = await apiClient.get(`/customers/search?q=${encodeURIComponent(query)}`);
      
      // Handle the backend response structure
      const customersData = response.data?.data || response.customers || [];
      
      return customersData.map((customer: any) => ({
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        email: customer.email,
        aadharNumber: customer.aadharNumber
      }));
    } catch (error) {
      console.error('Error searching customers:', error);
      return [];
    }
  },

  // Get loan statistics
  async getLoanStats(): Promise<{
    totalLoans: number;
    activeLoans: number;
    closedLoans: number;
    overdueLoans: number;
    totalDisbursed: number;
    totalOutstanding: number;
    averageLoanAmount: number;
  }> {
    try {
      const response: any = await apiClient.get('/dashboard/stats');
      // Handle the backend response structure and extract loan stats
      const stats = response.data || response;
      
      return {
        totalLoans: stats.loans?.total || 0,
        activeLoans: stats.loans?.active || 0,
        closedLoans: stats.loans?.closed || 0,
        overdueLoans: stats.loans?.overdue || 0,
        totalDisbursed: stats.financial?.totalDisbursed || 0,
        totalOutstanding: stats.financial?.totalOutstanding || 0,
        averageLoanAmount: stats.loans?.averageAmount || 0
      };
    } catch (error) {
      console.error('Error fetching loan stats:', error);
      throw new Error('Failed to fetch loan statistics');
    }
  }
};