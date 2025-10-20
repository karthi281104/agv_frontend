import { useState, useEffect } from 'react';

// Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  aadharNumber: string;
  panNumber?: string;
  fingerprint?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  totalLoans: number;
  totalAmount: number;
  outstandingAmount: number;
  lastLoanDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  averageLoanAmount: number;
  topCustomersByLoanAmount: Customer[];
}

export interface CreateCustomerData {
  name: string;
  phone: string;
  email?: string;
  address: string;
  aadharNumber: string;
  panNumber?: string;
  fingerprint?: string;
}

// Mock API functions
const mockCustomersApi = {
  getCustomers: async (): Promise<Customer[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data for now
    return [
      {
        id: '1',
        name: 'Rajesh Kumar',
        phone: '+91 9876543210',
        email: 'rajesh@example.com',
        address: '123 MG Road, Bangalore',
        aadharNumber: '1234-5678-9012',
        panNumber: 'ABCDE1234F',
        status: 'ACTIVE',
        totalLoans: 3,
        totalAmount: 500000,
        outstandingAmount: 150000,
        lastLoanDate: '2024-01-15',
        createdAt: '2023-06-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        name: 'Priya Sharma',
        phone: '+91 9876543211',
        email: 'priya@example.com',
        address: '456 Brigade Road, Bangalore',
        aadharNumber: '2345-6789-0123',
        panNumber: 'BCDEF2345G',
        status: 'ACTIVE',
        totalLoans: 2,
        totalAmount: 300000,
        outstandingAmount: 80000,
        lastLoanDate: '2024-01-10',
        createdAt: '2023-08-15T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z'
      }
    ];
  },

  getCustomerStats: async (): Promise<CustomerStats> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      totalCustomers: 1250,
      activeCustomers: 1180,
      newCustomersThisMonth: 45,
      averageLoanAmount: 185000,
      topCustomersByLoanAmount: []
    };
  },

  createCustomer: async (data: CreateCustomerData): Promise<Customer> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      id: Date.now().toString(),
      ...data,
      status: 'ACTIVE',
      totalLoans: 0,
      totalAmount: 0,
      outstandingAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  exportCustomers: async (format: 'pdf' | 'excel'): Promise<Blob> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock file creation
    const content = format === 'pdf' ? 'PDF content' : 'Excel content';
    return new Blob([content], { 
      type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  },

  uploadDocuments: async (customerId: string, files: File[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Uploaded ${files.length} documents for customer ${customerId}`);
  }
};

// Custom hooks
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await mockCustomersApi.getCustomers();
        setCustomers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return { data: customers, isLoading, error };
};

export const useCustomerStats = () => {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await mockCustomersApi.getCustomerStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch customer stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data: stats, isLoading, error };
};

export const useCreateCustomer = () => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (data: CreateCustomerData) => {
    try {
      setIsLoading(true);
      const result = await mockCustomersApi.createCustomer(data);
      return result;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
};

export const useExportCustomers = () => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (format: 'pdf' | 'excel') => {
    try {
      setIsLoading(true);
      const blob = await mockCustomersApi.exportCustomers(format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
};

export const useUploadCustomerDocuments = () => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (customerId: string, files: File[]) => {
    try {
      setIsLoading(true);
      await mockCustomersApi.uploadDocuments(customerId, files);
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
};