import { apiClient } from './apiClient';

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalLoans: number;
  activeLoans: number;
  pendingLoans: number;
  completedLoans: number;
  totalDisbursed: number;
  totalCollected: number;
  monthlyDisbursed: number;
  monthlyCollected: number;
  overdueAmount: number;
  totalInterestEarned: number;
  averageLoanAmount: number;
  collectionEfficiency: number;
  goldInVault: {
    totalWeight: number;
    totalValue: number;
  };
  recentActivities: Array<{
    id: string;
    type: 'LOAN_CREATED' | 'PAYMENT_RECEIVED' | 'CUSTOMER_ADDED' | 'LOAN_APPROVED';
    description: string;
    amount?: number;
    timestamp: string;
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
  }>;
  monthlyTrends: {
    disbursements: Array<{ month: string; amount: number }>;
    collections: Array<{ month: string; amount: number }>;
    newCustomers: Array<{ month: string; count: number }>;
  };
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('Fetching dashboard stats from API...');
      // Refresh token from localStorage before making request
      apiClient.refreshToken();
      const response: any = await apiClient.get('/dashboard/stats');
      console.log('Dashboard API response:', response);
      
      const backendData = response.data; // Extract data from response
      
      if (!backendData) {
        console.warn('No data received from dashboard API');
        throw new Error('No data received from server');
      }
      
      // Map backend response to frontend interface
      const mappedData: DashboardStats = {
        totalCustomers: backendData.customers?.total || 0,
        activeCustomers: backendData.customers?.active || 0,
        totalLoans: backendData.loans?.total || 0,
        activeLoans: backendData.loans?.active || 0,
        pendingLoans: backendData.loans?.pending || 0,
        completedLoans: backendData.loans?.completed || 0,
        totalDisbursed: backendData.financial?.totalDisbursed || 0,
        totalCollected: backendData.financial?.totalCollected || 0,
        monthlyDisbursed: backendData.financial?.monthlyDisbursed || 0,
        monthlyCollected: backendData.financial?.monthlyCollected || 0,
        overdueAmount: backendData.financial?.outstandingAmount || 0,
        totalInterestEarned: Math.max(0, (backendData.financial?.totalCollected || 0) - (backendData.financial?.totalDisbursed || 0)),
        averageLoanAmount: backendData.loans?.total > 0 ? (backendData.financial?.totalDisbursed || 0) / backendData.loans.total : 0,
        collectionEfficiency: backendData.financial?.totalDisbursed > 0 ? 
          Math.min(100, ((backendData.financial?.totalCollected || 0) / (backendData.financial?.totalDisbursed || 0)) * 100) : 0,
        goldInVault: {
          totalWeight: 0, // This would need additional API call
          totalValue: 0   // This would need additional API call
        },
        recentActivities: (backendData.recentActivity?.recentPayments || []).map((payment: any) => ({
          id: payment.id || `activity-${Date.now()}`,
          type: 'PAYMENT_RECEIVED' as const,
          description: `Payment received from ${payment.customer || 'Customer'}: ₹${payment.amount?.toLocaleString() || 0}`,
          amount: payment.amount || 0,
          timestamp: payment.paymentDate || new Date().toISOString(),
          status: 'SUCCESS' as const
        })),
        monthlyTrends: {
          disbursements: [],
          collections: [],
          newCustomers: []
        }
      };
      
      console.log('Mapped dashboard data:', mappedData);
      return mappedData;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      
      // Return empty/default data instead of throwing to prevent NaN values
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        totalLoans: 0,
        activeLoans: 0,
        pendingLoans: 0,
        completedLoans: 0,
        totalDisbursed: 0,
        totalCollected: 0,
        monthlyDisbursed: 0,
        monthlyCollected: 0,
        overdueAmount: 0,
        totalInterestEarned: 0,
        averageLoanAmount: 0,
        collectionEfficiency: 0,
        goldInVault: {
          totalWeight: 0,
          totalValue: 0
        },
        recentActivities: [],
        monthlyTrends: {
          disbursements: [],
          collections: [],
          newCustomers: []
        }
      };
    }
  }

  async getRecentActivities(limit: number = 10): Promise<DashboardStats['recentActivities']> {
    try {
      const response: any = await apiClient.get(`/dashboard/activities?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      return [];
    }
  }

  async getMonthlyTrends(): Promise<DashboardStats['monthlyTrends']> {
    try {
      const response: any = await apiClient.get('/dashboard/trends');
      return response;
    } catch (error) {
      console.error('Failed to fetch monthly trends:', error);
      return {
        disbursements: [],
        collections: [],
        newCustomers: []
      };
    }
  }

  async refreshDashboard(): Promise<DashboardStats> {
    try {
      const response: any = await apiClient.post('/dashboard/refresh');
      return response;
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      throw error;
    }
  }

  async exportDashboardData(format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    try {
      const response = await fetch(`http://localhost:3001/api/dashboard/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Failed to export dashboard data:', error);
      throw error;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-IN').format(num);
  }

  calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  getQuickActions(): QuickAction[] {
    return [
      {
        id: 'add-customer',
        title: 'Add New Customer',
        description: 'Register a new customer',
        icon: 'Users',
        color: 'blue',
        action: () => window.location.href = '/customers?action=add'
      },
      {
        id: 'create-loan',
        title: 'Create Loan',
        description: 'Process a new loan',
        icon: 'CreditCard',
        color: 'green',
        action: () => window.location.href = '/loans?action=create'
      },
      {
        id: 'record-payment',
        title: 'Record Payment',
        description: 'Log a payment received',
        icon: 'Wallet',
        color: 'purple',
        action: () => window.location.href = '/repayments?action=record'
      },
      {
        id: 'view-reports',
        title: 'View Reports',
        description: 'Generate business reports',
        icon: 'BarChart3',
        color: 'orange',
        action: () => window.location.href = '/reports'
      }
    ];
  }
}

export const dashboardService = new DashboardService();