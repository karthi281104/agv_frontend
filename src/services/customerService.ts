import { apiClient } from './apiClient';
import { Customer, CustomerFormData, CustomerSearchFilters, CustomerListResponse } from '@/types/customer';

// Customer Stats interface
export interface CustomerStats {
  total: number;
  active: number;
  pendingVerification: number;
  inactive: number;
  withActiveLoans: number;
  totalDisbursed: number;
  totalOutstanding: number;
  byState: Record<string, number>;
  recentCustomers: Customer[];
}

// Re-export types for convenience
export type { Customer, CustomerFormData, CustomerSearchFilters, CustomerListResponse } from '@/types/customer';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to map backend customer data to frontend format
const mapBackendCustomerToFrontend = (backendCustomer: any): Customer => {
  return {
    id: backendCustomer.id,
    customerId: backendCustomer.customerId || `CUS${backendCustomer.id.slice(-3)}`,
    personalInfo: {
      fullName: `${backendCustomer.firstName} ${backendCustomer.lastName}`,
      fatherName: backendCustomer.fatherName || '',
      motherName: backendCustomer.motherName || '',
      dateOfBirth: backendCustomer.dateOfBirth,
      gender: backendCustomer.gender || 'male'
    },
    contactInfo: {
      primaryMobile: backendCustomer.phone,
      secondaryMobile: backendCustomer.alternatePhone,
      email: backendCustomer.email,
      address: {
        street: backendCustomer.address || '',
        city: backendCustomer.city || '',
        state: backendCustomer.state || '',
        pincode: backendCustomer.pincode || '',
        landmark: backendCustomer.landmark || ''
      }
    },
    documents: {
      aadhar: {
        number: backendCustomer.aadharNumber || '',
        verified: backendCustomer.aadharVerified || false,
        verifiedAt: backendCustomer.aadharVerifiedAt
      },
      pan: {
        number: backendCustomer.panNumber || '',
        verified: backendCustomer.panVerified || false,
        verifiedAt: backendCustomer.panVerifiedAt
      }
    },
    biometrics: {
      fingerprint: backendCustomer.fingerprintData ? {
        data: backendCustomer.fingerprintData,
        capturedAt: backendCustomer.createdAt
      } : undefined
    },
    status: backendCustomer.status || 'active',
    createdAt: backendCustomer.createdAt,
    updatedAt: backendCustomer.updatedAt,
    createdBy: backendCustomer.createdBy || 'system',
    loanSummary: {
      activeLoans: backendCustomer._count?.loans || 0,
      totalDisbursed: backendCustomer.totalDisbursed || 0,
      totalOutstanding: backendCustomer.totalOutstanding || 0,
      paymentHistory: 'good'
    }
  };
};

// Customer Service with Real API Calls
export const customerService = {
  // Get customers with filtering and pagination
  async getCustomers(
    filters: CustomerSearchFilters = {},
    page = 1,
    limit = 10
  ): Promise<CustomerListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.status && filters.status.length > 0) {
        params.append('status', filters.status.join(','));
      }
      
      const response: any = await apiClient.get(`/customers?${params.toString()}`);
      
      // Handle the backend response structure: { success, message, data: { data: customers[], pagination: {...} } }
      const customersData = response.data?.data || response.customers || [];
      const pagination = response.data?.pagination || {};
      
      // Map backend customers to frontend format
      const mappedCustomers = customersData.map(mapBackendCustomerToFrontend);
      
      return {
        customers: mappedCustomers,
        total: pagination.total || response.total || customersData.length,
        page: pagination.page || response.page || page,
        limit: pagination.limit || response.limit || limit,
        hasMore: response.hasMore || pagination.hasMore || ((page * limit) < (pagination.total || customersData.length))
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new Error('Failed to fetch customers');
    }
  },

  // Get single customer
  async getCustomer(id: string): Promise<Customer> {
    try {
      const response: any = await apiClient.get(`/customers/${id}`);
      // Handle the backend response structure: { success, message, data: customer }
      const customerData = response.data || response;
      return mapBackendCustomerToFrontend(customerData);
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw new Error('Failed to fetch customer');
    }
  },

  // Create new customer
  async createCustomer(formData: CustomerFormData): Promise<Customer> {
    try {
      // Basic validation before sending to backend
      if (!formData.fullName || formData.fullName.length < 2) {
        throw new Error('Full name is required and must be at least 2 characters');
      }
      if (!formData.primaryMobile || !/^[6-9]\d{9}$/.test(formData.primaryMobile)) {
        throw new Error('Valid 10-digit mobile number starting with 6-9 is required');
      }
      if (!formData.street || formData.street.length < 10) {
        throw new Error('Complete address is required');
      }
      if (!formData.city || formData.city.length < 2) {
        throw new Error('City is required');
      }
      if (!formData.state || formData.state.length < 2) {
        throw new Error('State is required');
      }
      if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
        throw new Error('Valid 6-digit pincode is required');
      }
      if (!formData.aadharNumber || !/^\d{4}\s?\d{4}\s?\d{4}$/.test(formData.aadharNumber)) {
        throw new Error('Valid 12-digit Aadhar number is required');
      }
      if (!formData.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
        throw new Error('Valid PAN number is required (format: ABCDE1234F)');
      }

      // Only send fields that exist in the backend schema
      const backendData = {
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' ') || formData.fullName.split(' ')[0],
        phone: formData.primaryMobile,
        email: formData.email || undefined,
        address: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        aadharNumber: formData.aadharNumber.replace(/\s/g, ''), // Remove spaces from Aadhar
        panNumber: formData.panNumber
      };

      const response: any = await apiClient.post('/customers', backendData);
      // Handle the backend response structure: { success, message, data: customer }
      const customerData = response.data || response;
      return mapBackendCustomerToFrontend(customerData);
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  },

  // Update customer
  async updateCustomer(id: string, formData: Partial<CustomerFormData>): Promise<Customer> {
    try {
      const backendData: any = {};
      
      if (formData.fullName) {
        backendData.firstName = formData.fullName.split(' ')[0];
        backendData.lastName = formData.fullName.split(' ').slice(1).join(' ') || formData.fullName.split(' ')[0];
      }
      
      if (formData.fatherName) backendData.fatherName = formData.fatherName;
      if (formData.motherName) backendData.motherName = formData.motherName;
      if (formData.primaryMobile) backendData.phone = formData.primaryMobile;
      if (formData.secondaryMobile) backendData.alternatePhone = formData.secondaryMobile;
      if (formData.email) backendData.email = formData.email;
      if (formData.street) backendData.address = formData.street;
      if (formData.city) backendData.city = formData.city;
      if (formData.state) backendData.state = formData.state;
      if (formData.pincode) backendData.pincode = formData.pincode;
      if (formData.landmark) backendData.landmark = formData.landmark;
      if (formData.aadharNumber) backendData.aadharNumber = formData.aadharNumber;
      if (formData.panNumber) backendData.panNumber = formData.panNumber;

      const response: any = await apiClient.put(`/customers/${id}`, backendData);
      // Handle the backend response structure: { success, message, data: customer }
      const customerData = response.data || response;
      return mapBackendCustomerToFrontend(customerData);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw new Error('Failed to update customer');
    }
  },

  // Delete customer
  async deleteCustomer(id: string): Promise<void> {
    try {
      await apiClient.delete(`/customers/${id}`);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw new Error('Failed to delete customer');
    }
  },

  // Get customer statistics
  async getCustomerStats(): Promise<CustomerStats> {
    try {
      const response: any = await apiClient.get('/dashboard/stats');
      // Handle the backend response structure: { success, message, data: stats }
      const stats = response.data || response;
      
      // Map dashboard stats to customer stats format
      return {
        total: stats.customers?.total || 0,
        active: stats.customers?.active || 0,
        pendingVerification: stats.customers?.pendingVerification || 0,
        inactive: stats.customers?.inactive || 0,
        withActiveLoans: stats.customers?.withActiveLoans || 0,
        totalDisbursed: stats.financial?.totalDisbursed || 0,
        totalOutstanding: stats.financial?.totalOutstanding || 0,
        byState: stats.customers?.byState || {},
        recentCustomers: stats.recentCustomers ? 
          stats.recentCustomers.map(mapBackendCustomerToFrontend) : []
      };
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw new Error('Failed to fetch customer statistics');
    }
  },

  // Export customers
  async exportCustomers(format: 'pdf' | 'excel'): Promise<Blob> {
    try {
      // For export, we need to handle blob response differently
      const url = `${apiClient['baseURL']}/customers/export?format=${format}`;
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error exporting customers:', error);
      throw new Error('Failed to export customers');
    }
  },

  // Upload customer documents
  async uploadDocuments(customerId: string, files: { aadhar?: File; pan?: File; photo?: File } | File[]): Promise<void> {
    try {
      if (Array.isArray(files)) {
        // Handle array of files
        for (const file of files) {
          await apiClient.uploadFile(`/customers/${customerId}/documents`, file);
        }
      } else {
        // Handle object with specific file types
        for (const [key, file] of Object.entries(files)) {
          if (file) {
            await apiClient.uploadFile(`/customers/${customerId}/documents`, file, { type: key });
          }
        }
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw new Error('Failed to upload documents');
    }
  },

  // Utility methods
  formatCurrency,
  
  formatNumber: (num: number): string => {
    return new Intl.NumberFormat('en-IN').format(num);
  }
};