import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';

export interface PortfolioReport {
  totalLoans: number;
  totalDisbursed: number;
  totalOutstanding: number;
  totalCollected: number;
  activeLoans: number;
  completedLoans: number;
  overdueLoans: number;
  defaultedLoans: number;
  averageLoanSize: number;
  totalGoldValue: number;
  averageLTV: number;
}

export interface LoanPerformanceReport {
  period: string;
  newLoans: number;
  disbursedAmount: number;
  collectionsAmount: number;
  closedLoans: number;
  outstandingAtEnd: number;
}

export interface CollectionReport {
  totalCollections: number;
  principalCollected: number;
  interestCollected: number;
  penaltyCollected: number;
  collectionEfficiency: number;
  overdueRecovered: number;
}

export interface CustomerReport {
  totalCustomers: number;
  activeCustomers: number;
  repeatCustomers: number;
  averageLoansPerCustomer: number;
  topCustomers: Array<{
    customerId: string;
    name: string;
    totalLoans: number;
    totalBorrowed: number;
  }>;
}

export interface OverdueReport {
  totalOverdueLoans: number;
  totalOverdueAmount: number;
  totalPenalties: number;
  bucket0to30: { count: number; amount: number };
  bucket30to60: { count: number; amount: number };
  bucket60to90: { count: number; amount: number };
  bucket90Plus: { count: number; amount: number };
  recoveryRate: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  loansCreated: number;
  loansDisbursed: number;
  loansCompleted: number;
  totalDisbursed: number;
  totalCollected: number;
  netOutflow: number;
}

const reportsService = {
  // Get portfolio overview report
  getPortfolioReport: async () => {
    const response = await apiClient.get<ApiResponse<PortfolioReport>>('/reports/portfolio');
    return response.data;
  },

  // Get loan performance report
  getLoanPerformanceReport: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get<ApiResponse<LoanPerformanceReport>>(
      `/reports/loan-performance${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  // Get collection report
  getCollectionReport: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get<ApiResponse<CollectionReport>>(
      `/reports/collection${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  // Get customer report
  getCustomerReport: async () => {
    const response = await apiClient.get<ApiResponse<CustomerReport>>('/reports/customer');
    return response.data;
  },

  // Get overdue report
  getOverdueReport: async () => {
    const response = await apiClient.get<ApiResponse<OverdueReport>>('/reports/overdue');
    return response.data;
  },

  // Get monthly trends
  getMonthlyTrends: async (months?: number) => {
    const params = new URLSearchParams();
    if (months) params.append('months', months.toString());

    const response = await apiClient.get<ApiResponse<MonthlyTrend[]>>(
      `/reports/monthly-trends${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },
};

export default reportsService;
