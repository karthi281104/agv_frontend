import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';

export interface GoldItem {
  id: string;
  loanId: string;
  itemType: string;
  weight: number;
  purity: string;
  currentRate: number;
  totalValue: number;
  description?: string;
  images?: string[];
  status: 'PLEDGED' | 'RELEASED' | 'AUCTIONED' | 'LOST';
  releasedAt?: Date;
  releasedById?: string;
  releasedToName?: string;
  releasedToPhone?: string;
  releaseNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  loan?: {
    id: string;
    loanNumber: string;
    status: string;
    customer: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
}

export interface GoldItemSummary {
  totalItems: number;
  totalWeight: number;
  totalValue: number;
  pledgedItems: number;
  releasedItems: number;
}

export interface LoanGoldItemsResponse {
  summary: GoldItemSummary;
  items: GoldItem[];
}

export interface GoldItemStats {
  totalItems: number;
  pledgedItems: number;
  releasedItems: number;
  totalWeight: number;
  totalValue: number;
}

export interface CreateGoldItemData {
  loanId: string;
  itemType: string;
  weight: number;
  purity: string;
  currentRate: number;
  description?: string;
  images?: string[];
}

export interface UpdateGoldItemData {
  itemType?: string;
  weight?: number;
  purity?: string;
  currentRate?: number;
  description?: string;
  images?: string[];
}

export interface ReleaseGoldItemData {
  releasedToName: string;
  releasedToPhone?: string;
  releaseNotes?: string;
}

const goldItemService = {
  // Get all gold items with optional filters
  getAll: async (filters?: { loanId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.loanId) params.append('loanId', filters.loanId);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await apiClient.get<ApiResponse<GoldItem[]>>(
      `/gold-items${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  // Get single gold item by ID
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<GoldItem>>(`/gold-items/${id}`);
    return response.data;
  },

  // Get all gold items for a specific loan
  getByLoan: async (loanId: string) => {
    const response = await apiClient.get<ApiResponse<LoanGoldItemsResponse>>(
      `/gold-items/loan/${loanId}`
    );
    return response.data;
  },

  // Create a new gold item
  create: async (data: CreateGoldItemData) => {
    const response = await apiClient.post<ApiResponse<GoldItem>>('/gold-items', data);
    return response.data;
  },

  // Update an existing gold item
  update: async (id: string, data: UpdateGoldItemData) => {
    const response = await apiClient.put<ApiResponse<GoldItem>>(`/gold-items/${id}`, data);
    return response.data;
  },

  // Release a single gold item
  release: async (id: string, data: ReleaseGoldItemData) => {
    const response = await apiClient.put<ApiResponse<GoldItem>>(
      `/gold-items/${id}/release`,
      data
    );
    return response.data;
  },

  // Release all gold items for a loan
  releaseAll: async (loanId: string, data: ReleaseGoldItemData) => {
    const response = await apiClient.put<ApiResponse<{ releasedCount: number; totalItems: number }>>(
      `/gold-items/loan/${loanId}/release-all`,
      data
    );
    return response.data;
  },

  // Delete a gold item
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/gold-items/${id}`);
    return response.data;
  },

  // Get gold item statistics
  getStats: async () => {
    const response = await apiClient.get<ApiResponse<GoldItemStats>>('/gold-items/stats/summary');
    return response.data;
  }
};

export default goldItemService;
