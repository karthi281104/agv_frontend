import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Customer, CustomerFormData, CustomerSearchFilters, customerService } from '@/services/customerService';

// Query keys for React Query
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: CustomerSearchFilters, page: number, limit: number) => 
    [...customerKeys.lists(), { filters, page, limit }] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

// Hook to fetch customers with filtering and pagination
export function useCustomers(
  filters: CustomerSearchFilters = {},
  page = 1,
  limit = 10
) {
  return useQuery({
    queryKey: customerKeys.list(filters, page, limit),
    queryFn: () => customerService.getCustomers(filters, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
}

// Hook to fetch single customer
export function useCustomer(id: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerService.getCustomer(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to create new customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: CustomerFormData) => customerService.createCustomer(formData),
    onSuccess: (newCustomer) => {
      // Invalidate customer list queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Add to cache for immediate access
      queryClient.setQueryData(customerKeys.detail(newCustomer.id), newCustomer);
    },
    onError: (error) => {
      console.error('Failed to create customer:', error);
    },
  });
}

// Hook to update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: Partial<CustomerFormData> }) =>
      customerService.updateCustomer(id, formData),
    onSuccess: (updatedCustomer) => {
      // Update the specific customer cache
      queryClient.setQueryData(customerKeys.detail(updatedCustomer.id), updatedCustomer);
      
      // Invalidate customer list queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update customer:', error);
    },
  });
}

// Hook to delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: (_, deletedId) => {
      // Remove from customer detail cache
      queryClient.removeQueries({ queryKey: customerKeys.detail(deletedId) });
      
      // Invalidate customer list queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete customer:', error);
    },
  });
}

// Hook to upload customer documents
export function useUploadCustomerDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, files }: { customerId: string; files: { aadhar?: File; pan?: File; photo?: File } }) =>
      customerService.uploadDocuments(customerId, files),
    onSuccess: (_, { customerId }) => {
      // Invalidate the specific customer to refetch updated data
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
      
      // Also invalidate customer lists
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to upload documents:', error);
    },
  });
}

// Hook to export customers
export function useExportCustomers() {
  return useMutation({
    mutationFn: (format: 'pdf' | 'excel' = 'excel') => customerService.exportCustomers(format),
    onSuccess: (blob, format) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Failed to export customers:', error);
    },
  });
}

// Hook to get customer statistics
export function useCustomerStats() {
  return useQuery({
    queryKey: [...customerKeys.all, 'stats'],
    queryFn: () => customerService.getCustomerStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}