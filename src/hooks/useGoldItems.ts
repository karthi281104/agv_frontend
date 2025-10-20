import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import goldItemService, {
  GoldItem,
  CreateGoldItemData,
  UpdateGoldItemData,
  ReleaseGoldItemData
} from '../services/goldItemService';
import { useToast } from './use-toast';

// Query keys
export const goldItemKeys = {
  all: ['goldItems'] as const,
  lists: () => [...goldItemKeys.all, 'list'] as const,
  list: (filters: { loanId?: string; status?: string } = {}) => 
    [...goldItemKeys.lists(), filters] as const,
  details: () => [...goldItemKeys.all, 'detail'] as const,
  detail: (id: string) => [...goldItemKeys.details(), id] as const,
  byLoan: (loanId: string) => [...goldItemKeys.all, 'byLoan', loanId] as const,
  stats: () => [...goldItemKeys.all, 'stats'] as const,
};

// Get all gold items with filters
export function useGoldItems(filters?: { loanId?: string; status?: string }) {
  return useQuery({
    queryKey: goldItemKeys.list(filters),
    queryFn: () => goldItemService.getAll(filters),
  });
}

// Get single gold item
export function useGoldItem(id: string, enabled = true) {
  return useQuery({
    queryKey: goldItemKeys.detail(id),
    queryFn: () => goldItemService.getById(id),
    enabled: !!id && enabled,
  });
}

// Get gold items by loan
export function useGoldItemsByLoan(loanId: string, enabled = true) {
  return useQuery({
    queryKey: goldItemKeys.byLoan(loanId),
    queryFn: () => goldItemService.getByLoan(loanId),
    enabled: !!loanId && enabled,
  });
}

// Get gold item stats
export function useGoldItemStats() {
  return useQuery({
    queryKey: goldItemKeys.stats(),
    queryFn: () => goldItemService.getStats(),
  });
}

// Create gold item
export function useCreateGoldItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateGoldItemData) => goldItemService.create(data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: goldItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goldItemKeys.byLoan(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: goldItemKeys.stats() });
      
      toast({
        title: 'Success',
        description: response.message || 'Gold item created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create gold item',
      });
    },
  });
}

// Update gold item
export function useUpdateGoldItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoldItemData }) =>
      goldItemService.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: goldItemKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: goldItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goldItemKeys.stats() });
      
      // Get loanId from the response to invalidate loan-specific queries
      if (response.data && 'loanId' in response.data) {
        queryClient.invalidateQueries({ 
          queryKey: goldItemKeys.byLoan((response.data as GoldItem).loanId) 
        });
      }
      
      toast({
        title: 'Success',
        description: response.message || 'Gold item updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update gold item',
      });
    },
  });
}

// Release single gold item
export function useReleaseGoldItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReleaseGoldItemData }) =>
      goldItemService.release(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: goldItemKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: goldItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goldItemKeys.stats() });
      
      // Invalidate loan-specific queries
      if (response.data && 'loanId' in response.data) {
        queryClient.invalidateQueries({ 
          queryKey: goldItemKeys.byLoan((response.data as GoldItem).loanId) 
        });
      }
      
      toast({
        title: 'Success',
        description: response.message || 'Gold item released successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to release gold item',
      });
    },
  });
}

// Release all gold items for a loan
export function useReleaseAllGoldItems() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ loanId, data }: { loanId: string; data: ReleaseGoldItemData }) =>
      goldItemService.releaseAll(loanId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: goldItemKeys.byLoan(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: goldItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goldItemKeys.stats() });
      
      toast({
        title: 'Success',
        description: response.message || `${response.data?.releasedCount || 0} gold items released successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to release gold items',
      });
    },
  });
}

// Delete gold item
export function useDeleteGoldItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => goldItemService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: goldItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goldItemKeys.stats() });
      
      toast({
        title: 'Success',
        description: response.message || 'Gold item deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete gold item',
      });
    },
  });
}
