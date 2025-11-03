import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient, API_BASE_URL } from '@/services/apiClient';

// Get the actual auth token from localStorage (set by AuthProvider)
const getFreshToken = () => {
  if (typeof window !== 'undefined') {
    // Use auth_token which is set by the AuthProvider after login
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No auth token found in localStorage');
    }
    return token || '';
  }
  return '';
};

export interface Loan {
  id: string;
  loanNumber: string;
  customerId: string;
  customerName: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    email?: string;
  };
  principalAmount: number;
  loanAmount: number; // For backward compatibility
  interestRate: number;
  tenure: number;
  emiAmount: number;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'REJECTED';
  goldWeight: number;
  goldValue: number;
  disbursedDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  goldItems: Array<{
    id: string;
    itemType: string;
    weight: number;
    purity: number;
    description?: string;
    estimatedValue: number;
  }>;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  // Backend returns `phone`; keep `phoneNumber` optional for backward compatibility
  phone?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  panNumber?: string;
  aadharNumber?: string;
}

export interface CreateLoanData {
  customerId: string;
  principalAmount: number;
  interestRate: number;
  tenure: number;
  goldItems: Array<{
    itemType: string;
    weight: number;
    purity: string; // Backend accepts string like '22K' or '22'
    description?: string;
    currentRate: number; // ₹ per gram
  }>;
}

// API Service Functions
const loanService = {
  getLoans: async (): Promise<Loan[]> => {
    console.log('🌐 getLoans: Starting API call...');
    
    // Ensure apiClient has the latest token
    apiClient.refreshToken();
    const result: any = await apiClient.get('/loans');
    console.log('📋 getLoans: Raw result:', result);
    
    if (!result.success || !result.data) {
      console.warn('⚠️ getLoans: No data in response');
      return [];
    }
    
    // Fix: Extract loans from nested structure (result.data.data)
  const loans = result.data?.data || result.data || [];
    console.log('🔧 getLoans: Fixed data extraction, loans found:', loans.length);
    console.log('💼 getLoans: Found loans:', loans.length);
    
    const mappedLoans = loans.map((loan: any) => ({
      id: loan.id,
      loanNumber: loan.loanNumber,
      customerId: loan.customerId,
      customerName: loan.customer ? `${loan.customer.firstName} ${loan.customer.lastName}` : 'Unknown',
      customer: loan.customer,
      principalAmount: parseInt(loan.principalAmount || 0),
      loanAmount: parseInt(loan.principalAmount || 0), // For backward compatibility
      interestRate: parseFloat(loan.interestRate || 0),
      tenure: parseInt(loan.tenure || 0),
      emiAmount: parseFloat(loan.emiAmount || 0),
      status: loan.status || 'PENDING',
      goldWeight: parseFloat(loan.totalGoldWeight || 0),
      goldValue: parseFloat(loan.totalGoldValue || 0),
      disbursedDate: loan.disbursementDate,
      dueDate: loan.maturityDate,
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt,
      goldItems: loan.goldItems || []
    }));
    
    console.log('✅ getLoans: Returning mapped loans:', mappedLoans.length);
    return mappedLoans;
  },

  searchCustomers: async (searchTerm: string): Promise<Customer[]> => {
    console.log('🔍 searchCustomers: Searching for:', searchTerm);
    
    // Ensure apiClient has the latest token
    apiClient.refreshToken();
    const endpoint = searchTerm.trim()
      ? `/customers/search?q=${encodeURIComponent(searchTerm)}`
      : `/customers?limit=10`;
    console.log('🌐 Customer API call to:', `${API_BASE_URL}${endpoint}`);
    const result: any = await apiClient.get(endpoint);
    console.log('👥 searchCustomers: Raw result:', result);
    
    // Fix: Handle different response structures
    let customers = [];
    if (searchTerm.trim()) {
      // Search API returns: { success: true, data: [...] }
      customers = result.data || [];
    } else {
      // List API returns: { success: true, data: { data: [...], pagination: {...} } }
      customers = result.data?.data || result.data || [];
    }
    
    console.log('✅ searchCustomers: Found customers:', customers.length);
    return customers;
  },

  createLoan: async (loanData: CreateLoanData): Promise<Loan> => {
    console.log('📝 createLoan: Creating new loan...');
    
    // Ensure apiClient has the latest token
    apiClient.refreshToken();
    const result: any = await apiClient.post('/loans', loanData);
    console.log('✅ createLoan: Loan created successfully');
    return result?.data || result;
  }
};

// React Query Hooks
export const useLoans = () => {
  console.log('🎣 useLoans: Hook called, setting up query...');
  
  const query = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      console.log('🚀 useLoans: QueryFn executing...');
      try {
        const result = await loanService.getLoans();
        console.log('✅ useLoans: Query successful, returning:', result?.length, 'loans');
        return result;
      } catch (error) {
        console.error('❌ useLoans: Query failed:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 2
  });

  // Log query state for debugging
  console.log('📊 useLoans query state:', {
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data?.length,
    error: query.error?.message
  });

  return query;
};

export const useCustomerSearch = (searchTerm: string) => {
  return useQuery({
    queryKey: ['customers', 'search', searchTerm],
    queryFn: () => loanService.searchCustomers(searchTerm),
    // Allow 1+ char searches to improve UX on the Loans page
    enabled: searchTerm.length >= 1,
    staleTime: 60000, // 1 minute
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: loanService.createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Loan created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create loan: ${error.message}`);
    },
  });
};

// Approve Loan Hook
export const useApproveLoan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ loanId, remarks }: { loanId: string; remarks?: string }) => {
      apiClient.refreshToken();
      const result: any = await apiClient.put(`/loans/${loanId}/approve`, { remarks });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Loan approved successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve loan: ${error.message}`);
    },
  });
};

// Reject Loan Hook
export const useRejectLoan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ loanId, remarks }: { loanId: string; remarks: string }) => {
      apiClient.refreshToken();
      const result: any = await apiClient.put(`/loans/${loanId}/reject`, { remarks });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Loan rejected successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject loan: ${error.message}`);
    },
  });
};

// Disburse Loan Hook
export const useDisburseLoan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (loanId: string) => {
      apiClient.refreshToken();
      const result: any = await apiClient.put(`/loans/${loanId}/disburse`);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Loan disbursed successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to disburse loan: ${error.message}`);
    },
  });
};