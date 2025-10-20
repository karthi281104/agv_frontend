import { useQuery } from '@tanstack/react-query';
import reportsService from '../services/reportsService';

// Query keys
export const reportsKeys = {
  all: ['reports'] as const,
  portfolio: () => [...reportsKeys.all, 'portfolio'] as const,
  loanPerformance: (startDate?: string, endDate?: string) =>
    [...reportsKeys.all, 'loanPerformance', { startDate, endDate }] as const,
  collection: (startDate?: string, endDate?: string) =>
    [...reportsKeys.all, 'collection', { startDate, endDate }] as const,
  customer: () => [...reportsKeys.all, 'customer'] as const,
  overdue: () => [...reportsKeys.all, 'overdue'] as const,
  monthlyTrends: (months?: number) =>
    [...reportsKeys.all, 'monthlyTrends', { months }] as const,
};

// Get portfolio report
export function usePortfolioReport() {
  return useQuery({
    queryKey: reportsKeys.portfolio(),
    queryFn: () => reportsService.getPortfolioReport(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get loan performance report
export function useLoanPerformanceReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: reportsKeys.loanPerformance(startDate, endDate),
    queryFn: () => reportsService.getLoanPerformanceReport(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

// Get collection report
export function useCollectionReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: reportsKeys.collection(startDate, endDate),
    queryFn: () => reportsService.getCollectionReport(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

// Get customer report
export function useCustomerReport() {
  return useQuery({
    queryKey: reportsKeys.customer(),
    queryFn: () => reportsService.getCustomerReport(),
    staleTime: 5 * 60 * 1000,
  });
}

// Get overdue report
export function useOverdueReport() {
  return useQuery({
    queryKey: reportsKeys.overdue(),
    queryFn: () => reportsService.getOverdueReport(),
    staleTime: 60 * 1000, // 1 minute
  });
}

// Get monthly trends
export function useMonthlyTrends(months?: number) {
  return useQuery({
    queryKey: reportsKeys.monthlyTrends(months),
    queryFn: () => reportsService.getMonthlyTrends(months),
    staleTime: 5 * 60 * 1000,
  });
}
