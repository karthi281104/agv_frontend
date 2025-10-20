import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';

export interface OverdueLoan {
  id: string;
  loanNumber: string;
  customerId: string;
  principalAmount: number;
  outstandingBalance: number;
  isOverdue: boolean;
  overdueSince: Date | null;
  overdueAmount: number;
  penaltyAmount: number;
  daysOverdue: number;
  nextDueDate: Date | null;
  penaltyRate: number;
  penaltyType: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
}

export interface OverdueStatistics {
  totalOverdueLoans: number;
  totalOverdueAmount: number;
  totalPenalties: number;
  averageDaysOverdue: number;
  buckets: {
    lessThan30Days: number;
    from30To60Days: number;
    from60To90Days: number;
    moreThan90Days: number;
  };
}

export interface UpdateAllOverdueResult {
  totalProcessed: number;
  newOverdueCount: number;
  clearedOverdueCount: number;
}

const overdueService = {
  // Get all overdue loans with optional filters
  getOverdueLoans: async (filters?: {
    minDaysOverdue?: number;
    maxDaysOverdue?: number;
    minAmount?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.minDaysOverdue) params.append('minDaysOverdue', filters.minDaysOverdue.toString());
    if (filters?.maxDaysOverdue) params.append('maxDaysOverdue', filters.maxDaysOverdue.toString());
    if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());

    const response = await apiClient.get<ApiResponse<OverdueLoan[]>>(
      `/overdue/loans${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  // Get overdue statistics
  getStatistics: async () => {
    const response = await apiClient.get<ApiResponse<OverdueStatistics>>('/overdue/statistics');
    return response.data;
  },

  // Update overdue status for all active loans
  updateAllOverdue: async () => {
    const response = await apiClient.post<ApiResponse<UpdateAllOverdueResult>>('/overdue/update-all');
    return response.data;
  },

  // Update overdue status for specific loan
  updateLoanOverdue: async (loanId: string) => {
    const response = await apiClient.post<ApiResponse<OverdueLoan>>(`/overdue/update/${loanId}`);
    return response.data;
  },

  // Check if loan should be marked as defaulted
  checkDefault: async (loanId: string, thresholdDays?: number) => {
    const params = new URLSearchParams();
    if (thresholdDays) params.append('thresholdDays', thresholdDays.toString());

    const response = await apiClient.post<ApiResponse<{ wasMarkedDefaulted: boolean; thresholdDays: number }>>(
      `/overdue/check-default/${loanId}${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },
};

export default overdueService;
