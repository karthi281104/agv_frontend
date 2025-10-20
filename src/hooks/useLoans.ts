import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loan, LoanFormData, LoanSearchFilters, LoanListResponse, LoanSummaryStats, CustomerSearchResult } from '@/types/loan';
import { loanService } from '@/services/loanService';

// Query keys for React Query
export const loanKeys = {
  all: ['loans'] as const,
  lists: () => [...loanKeys.all, 'list'] as const,
  list: (filters: LoanSearchFilters, page: number, limit: number) => 
    [...loanKeys.lists(), { filters, page, limit }] as const,
  details: () => [...loanKeys.all, 'detail'] as const,
  detail: (id: string) => [...loanKeys.details(), id] as const,
  stats: () => [...loanKeys.all, 'stats'] as const,
  customers: () => [...loanKeys.all, 'customers'] as const,
  customerSearch: (query: string) => [...loanKeys.customers(), 'search', query] as const,
  recentCustomers: () => [...loanKeys.customers(), 'recent'] as const,
};

// Hook to fetch loans with filtering and pagination
export function useLoans(
  filters: LoanSearchFilters = {},
  page = 1,
  limit = 10
) {
  return useQuery({
    queryKey: loanKeys.list(filters, page, limit),
    queryFn: () => loanService.getLoans(filters, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
}

// Hook to fetch single loan
export function useLoan(id: string, enabled = true) {
  return useQuery({
    queryKey: loanKeys.detail(id),
    queryFn: () => loanService.getLoan(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to get loan statistics
export function useLoanStats() {
  return useQuery({
    queryKey: loanKeys.stats(),
    queryFn: () => loanService.getLoanStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to search customers for loan creation
export function useCustomerSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: loanKeys.customerSearch(query),
    queryFn: () => loanService.searchCustomers(query),
    enabled: enabled && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook to get recent customers
export function useRecentCustomers() {
  return useQuery({
    queryKey: loanKeys.recentCustomers(),
    queryFn: () => loanService.getRecentCustomers(),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to get customer by ID
export function useCustomerById(customerId: string, enabled = true) {
  return useQuery({
    queryKey: [...loanKeys.customers(), 'detail', customerId],
    queryFn: () => loanService.getCustomerById(customerId),
    enabled: enabled && !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to create new loan
export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: LoanFormData) => loanService.createLoan(formData),
    onSuccess: (newLoan) => {
      // Invalidate loan list queries
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: loanKeys.stats() });
      
      // Add to cache for immediate access
      queryClient.setQueryData(loanKeys.detail(newLoan.id), newLoan);
    },
    onError: (error) => {
      console.error('Failed to create loan:', error);
    },
  });
}

// Hook to upload loan documents
export function useUploadLoanDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, files }: { loanId: string; files: { bondPaper?: File; suretyPhoto?: File } }) =>
      loanService.uploadDocuments(loanId, files),
    onSuccess: (_, { loanId }) => {
      // Invalidate the specific loan to refetch updated data
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(loanId) });
      
      // Also invalidate loan lists
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to upload documents:', error);
    },
  });
}

// Hook to approve loan
export function useApproveLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, approvalNotes }: { loanId: string; approvalNotes?: string }) =>
      loanService.approveLoan(loanId, approvalNotes),
    onSuccess: (updatedLoan) => {
      // Update the specific loan cache
      queryClient.setQueryData(loanKeys.detail(updatedLoan.id), updatedLoan);
      
      // Invalidate loan list queries and stats
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.stats() });
    },
    onError: (error) => {
      console.error('Failed to approve loan:', error);
    },
  });
}

// Hook to disburse loan
export function useDisburseLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      loanId, 
      disbursementMethod, 
      bankDetails 
    }: { 
      loanId: string; 
      disbursementMethod: 'cash' | 'bank_transfer' | 'cheque';
      bankDetails?: any;
    }) => loanService.disburseLoan(loanId, disbursementMethod, bankDetails),
    onSuccess: (updatedLoan) => {
      // Update the specific loan cache
      queryClient.setQueryData(loanKeys.detail(updatedLoan.id), updatedLoan);
      
      // Invalidate loan list queries and stats
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.stats() });
    },
    onError: (error) => {
      console.error('Failed to disburse loan:', error);
    },
  });
}

// Custom hooks for loan calculations
export function useLoanCalculation(amount: number, interestRate: number, tenure: number) {
  const simpleInterest = (amount * interestRate * (tenure / 12)) / 100;
  const totalAmount = amount + simpleInterest;
  const monthlyEMI = tenure > 0 ? totalAmount / tenure : 0;

  return {
    simpleInterest: Math.round(simpleInterest),
    totalAmount: Math.round(totalAmount),
    monthlyEMI: Math.round(monthlyEMI),
  };
}