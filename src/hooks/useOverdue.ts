import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import overdueService from '../services/overdueService';
import { useToast } from './use-toast';

// Query keys
export const overdueKeys = {
  all: ['overdue'] as const,
  loans: () => [...overdueKeys.all, 'loans'] as const,
  loanList: (filters: { minDaysOverdue?: number; maxDaysOverdue?: number; minAmount?: number } = {}) =>
    [...overdueKeys.loans(), filters] as const,
  statistics: () => [...overdueKeys.all, 'statistics'] as const,
};

// Get all overdue loans
export function useOverdueLoans(filters?: {
  minDaysOverdue?: number;
  maxDaysOverdue?: number;
  minAmount?: number;
}) {
  return useQuery({
    queryKey: overdueKeys.loanList(filters),
    queryFn: () => overdueService.getOverdueLoans(filters),
  });
}

// Get overdue statistics
export function useOverdueStatistics() {
  return useQuery({
    queryKey: overdueKeys.statistics(),
    queryFn: () => overdueService.getStatistics(),
    refetchInterval: 60000, // Refetch every minute
  });
}

// Update all overdue loans
export function useUpdateAllOverdue() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => overdueService.updateAllOverdue(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: overdueKeys.all });
      
      toast({
        title: 'Success',
        description: response.message || `Updated ${response.data?.totalProcessed || 0} loans`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update overdue status',
      });
    },
  });
}

// Update single loan overdue status
export function useUpdateLoanOverdue() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (loanId: string) => overdueService.updateLoanOverdue(loanId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: overdueKeys.all });
      
      toast({
        title: 'Success',
        description: response.message || 'Loan overdue status updated',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update loan',
      });
    },
  });
}

// Check if loan should be defaulted
export function useCheckDefault() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ loanId, thresholdDays }: { loanId: string; thresholdDays?: number }) =>
      overdueService.checkDefault(loanId, thresholdDays),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: overdueKeys.all });
      
      const wasDefaulted = response.data?.wasMarkedDefaulted;
      toast({
        title: wasDefaulted ? 'Warning' : 'Info',
        description: response.message,
        variant: wasDefaulted ? 'destructive' : 'default',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to check default status',
      });
    },
  });
}
