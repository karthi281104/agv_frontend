import { apiClient } from './apiClient';

// Payment types
export interface Payment {
  id: string;
  paymentNumber: string;
  loanId: string;
  amount: number;
  paymentType: 'LOAN_DISBURSEMENT' | 'EMI_PAYMENT' | 'PARTIAL_PAYMENT' | 'INTEREST_PAYMENT' | 'PENALTY_PAYMENT' | 'LOAN_CLOSURE';
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  transactionId?: string;
  remarks?: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
  // Related data
  loan?: {
    loanNumber: string;
    customer: {
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
}

export interface CreatePaymentData {
  loanId: string;
  amount: number;
  paymentType: 'EMI_PAYMENT' | 'PARTIAL_PAYMENT' | 'INTEREST_PAYMENT' | 'PENALTY_PAYMENT' | 'LOAN_CLOSURE';
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';
  transactionId?: string;
  remarks?: string;
}

export interface PaymentSearchFilters {
  search?: string;
  paymentType?: string[];
  paymentMethod?: string[];
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  loanId?: string;
}

export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Helper function to map backend payment to frontend format
const mapBackendPaymentToFrontend = (backendPayment: any): Payment => {
  return {
    id: backendPayment.id,
    paymentNumber: backendPayment.paymentNumber || `PAY${backendPayment.id.slice(-4)}`,
    loanId: backendPayment.loanId,
    amount: backendPayment.amount,
    paymentType: backendPayment.paymentType,
    paymentMethod: backendPayment.paymentMethod,
    status: backendPayment.status || 'COMPLETED',
    transactionId: backendPayment.transactionId,
    remarks: backendPayment.remarks,
    paidAt: backendPayment.paidAt || backendPayment.createdAt,
    createdAt: backendPayment.createdAt,
    updatedAt: backendPayment.updatedAt,
    loan: backendPayment.loan ? {
      loanNumber: backendPayment.loan.loanNumber || `LN${backendPayment.loan.id.slice(-4)}`,
      customer: {
        firstName: backendPayment.loan.customer?.firstName || 'Unknown',
        lastName: backendPayment.loan.customer?.lastName || '',
        phone: backendPayment.loan.customer?.phone || ''
      }
    } : undefined
  };
};

// Payment Service with Real API Calls
export const paymentService = {
  // Get payments with filtering and pagination
  async getPayments(
    filters: PaymentSearchFilters = {},
    page = 1,
    limit = 10
  ): Promise<PaymentListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.paymentType && filters.paymentType.length > 0) {
        params.append('paymentType', filters.paymentType.join(','));
      }
      
      if (filters.paymentMethod && filters.paymentMethod.length > 0) {
        params.append('paymentMethod', filters.paymentMethod.join(','));
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
      
      if (filters.loanId) {
        params.append('loanId', filters.loanId);
      }
      
      const response: any = await apiClient.get(`/payments?${params.toString()}`);
      
      // Map backend payments to frontend format
      const mappedPayments = response.payments.map(mapBackendPaymentToFrontend);
      
      return {
        payments: mappedPayments,
        total: response.total,
        page: response.page,
        limit: response.limit,
        hasMore: response.hasMore || ((page * limit) < response.total)
      };
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw new Error('Failed to fetch payments');
    }
  },

  // Get single payment
  async getPayment(id: string): Promise<Payment> {
    try {
      const response: any = await apiClient.get(`/payments/${id}`);
      return mapBackendPaymentToFrontend(response);
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw new Error('Failed to fetch payment');
    }
  },

  // Create new payment (record a repayment)
  async createPayment(paymentData: CreatePaymentData): Promise<Payment> {
    try {
      const response: any = await apiClient.post('/payments', paymentData);
      return mapBackendPaymentToFrontend(response);
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to record payment');
    }
  },

  // Get payments for a specific loan
  async getLoanPayments(loanId: string): Promise<Payment[]> {
    try {
      const response = await this.getPayments({ loanId }, 1, 100);
      return response.payments;
    } catch (error) {
      console.error('Error fetching loan payments:', error);
      throw new Error('Failed to fetch loan payments');
    }
  },

  // Get payment statistics
  async getPaymentStats(): Promise<{
    totalPayments: number;
    totalAmount: number;
    paymentsToday: number;
    paymentsThisMonth: number;
    averagePaymentAmount: number;
    paymentMethodBreakdown: Record<string, number>;
  }> {
    try {
      const response: any = await apiClient.get('/payments/stats');
      return response;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw new Error('Failed to fetch payment statistics');
    }
  }
};