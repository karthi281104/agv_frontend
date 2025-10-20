// API Response types that match the backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
    };
  };
}

// Customer types (matching backend)
export interface CustomerCreateRequest {
  personalInfo: {
    fullName: string;
    fatherName?: string;
    motherName?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    occupation?: string;
  };
  contactInfo: {
    primaryMobile: string;
    alternativeMobile?: string;
    email?: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  documents: {
    aadhar?: {
      number: string;
      frontImage?: string;
      backImage?: string;
    };
    pan?: {
      number: string;
      image?: string;
    };
    otherDocuments?: Array<{
      type: string;
      number?: string;
      image?: string;
    }>;
  };
  biometrics?: {
    fingerprint?: {
      data: string;
    };
    photo?: string;
  };
}

export interface CustomerResponse {
  id: string;
  customerId: string;
  personalInfo: {
    fullName: string;
    fatherName?: string;
    motherName?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    occupation?: string;
  };
  contactInfo: {
    primaryMobile: string;
    alternativeMobile?: string;
    email?: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  documents: {
    aadhar?: {
      number: string;
      verified?: boolean;
      verifiedAt?: string;
      frontImage?: string;
      backImage?: string;
    };
    pan?: {
      number: string;
      verified?: boolean;
      verifiedAt?: string;
      image?: string;
    };
    otherDocuments?: Array<{
      id: string;
      type: string;
      number?: string;
      image?: string;
    }>;
  };
  biometrics?: {
    fingerprint?: {
      data: string;
      capturedAt: string;
    };
    photo?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  loanSummary?: {
    activeLoans: number;
    totalDisbursed: number;
    totalOutstanding: number;
    totalRepaid: number;
  };
}

// Loan types (matching backend)
export interface LoanCreateRequest {
  customerId: string;
  loanAmount: number;
  interestRate: number;
  duration: number;
  purpose?: string;
  goldItems: Array<{
    itemType: string;
    purity: number;
    weight: number;
    description?: string;
    images?: string[];
  }>;
}

export interface LoanResponse {
  id: string;
  loanNumber: string;
  customer: {
    id: string;
    customerId: string;
    fullName: string;
    primaryMobile: string;
  };
  loanAmount: number;
  interestRate: number;
  duration: number;
  purpose?: string;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'CLOSED' | 'DEFAULTED';
  disbursedAt?: string;
  dueDate: string;
  totalOutstanding: number;
  overdue: boolean;
  overdueAmount: number;
  goldItems: Array<{
    id: string;
    itemType: string;
    purity: number;
    weight: number;
    description?: string;
    images?: string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

// Payment types (matching backend)
export interface PaymentCreateRequest {
  loanId: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';
  reference?: string;
  notes?: string;
}

export interface PaymentResponse {
  id: string;
  paymentNumber: string;
  loan: {
    id: string;
    loanNumber: string;
    customer: {
      fullName: string;
      customerId: string;
    };
  };
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';
  reference?: string;
  notes?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  processedBy: string;
}

// Dashboard/Analytics types
export interface DashboardStats {
  totalCustomers: number;
  activeLoans: number;
  totalDisbursed: number;
  totalOutstanding: number;
  overdueLoans: number;
  overdueAmount: number;
  paymentsToday: number;
  paymentsThisMonth: number;
  goldInVault: {
    totalWeight: number;
    totalValue: number;
  };
}

export interface GoldRate {
  id: string;
  purity: number;
  ratePerGram: number;
  updatedAt: string;
  updatedBy: string;
}

// Search and filter types
export interface CustomerSearchFilters {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  city?: string;
  page?: number;
  limit?: number;
}

export interface LoanSearchFilters {
  search?: string;
  status?: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'CLOSED' | 'DEFAULTED';
  customerId?: string;
  overdue?: boolean;
  page?: number;
  limit?: number;
}