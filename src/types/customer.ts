// Customer data types for database integration
export interface Customer {
  id: string;
  customerId: string; // Unique customer ID (CUS001, CUS002, etc.)
  
  // Personal Information
  personalInfo: {
    fullName: string;
    fatherName: string;
    motherName: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
  };
  
  // Contact Information
  contactInfo: {
    primaryMobile: string;
    secondaryMobile?: string;
    email?: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      landmark?: string;
    };
  };
  
  // Document Information
  documents: {
    aadhar: {
      number: string;
      imageUrl?: string;
      verified: boolean;
      verifiedAt?: string;
    };
    pan: {
      number: string;
      imageUrl?: string;
      verified: boolean;
      verifiedAt?: string;
    };
    additionalDocs?: Array<{
      type: string;
      number?: string;
      imageUrl: string;
      uploadedAt: string;
    }>;
  };
  
  // Biometric Information
  biometrics: {
    fingerprint?: {
      data: string;
      capturedAt: string;
      deviceInfo?: string;
    };
    photo?: {
      imageUrl: string;
      capturedAt: string;
    };
  };
  
  // System Information
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Loan Information (computed fields)
  loanSummary: {
    activeLoans: number;
    totalDisbursed: number;
    totalOutstanding: number;
    paymentHistory: 'excellent' | 'good' | 'average' | 'poor';
  };
  
  // Additional Information
  metadata?: {
    source: 'manual' | 'api' | 'import';
    tags?: string[];
    notes?: string;
    riskLevel?: 'low' | 'medium' | 'high';
  };
}

export interface CustomerFormData {
  // Personal Information
  fullName: string;
  fatherName: string;
  motherName: string;
  primaryMobile: string;
  secondaryMobile?: string;
  email?: string;
  
  // Address
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  
  // Documents
  aadharNumber: string;
  panNumber: string;
  
  // Files (handled separately)
  aadharFile?: File;
  panFile?: File;
  photoFile?: File;
  
  // Biometric
  fingerprintData?: string;
}

export interface CustomerSearchFilters {
  search?: string;
  status?: string[];
  state?: string;
  hasActiveLoans?: boolean;
  createdDateFrom?: string;
  createdDateTo?: string;
  riskLevel?: string[];
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// API endpoints structure for backend
export const CustomerAPI = {
  // GET /api/customers - List customers with filters and pagination
  getCustomers: '/api/customers',
  
  // POST /api/customers - Create new customer
  createCustomer: '/api/customers',
  
  // GET /api/customers/:id - Get customer by ID
  getCustomer: '/api/customers/:id',
  
  // PUT /api/customers/:id - Update customer
  updateCustomer: '/api/customers/:id',
  
  // DELETE /api/customers/:id - Delete customer (soft delete)
  deleteCustomer: '/api/customers/:id',
  
  // POST /api/customers/:id/documents - Upload documents
  uploadDocuments: '/api/customers/:id/documents',
  
  // POST /api/customers/:id/biometrics - Store biometric data
  storeBiometrics: '/api/customers/:id/biometrics',
  
  // GET /api/customers/:id/loans - Get customer's loan history
  getCustomerLoans: '/api/customers/:id/loans',
  
  // GET /api/customers/export - Export customers data
  exportCustomers: '/api/customers/export',
  
  // POST /api/customers/import - Import customers data
  importCustomers: '/api/customers/import',
};