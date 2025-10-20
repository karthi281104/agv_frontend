// Loan related types for the gold loan management system

export interface Loan {
  id: string;
  loanId: string; // Auto-generated loan ID (LN001, LN002, etc.)
  customerId: string;
  customerInfo: {
    fullName: string;
    fatherName: string;
    primaryMobile: string;
    address: string;
  };
  loanDetails: {
    amount: number;
    interestRate: number;
    tenure: number; // in months
    loanType: 'gold_loan' | 'personal_loan' | 'business_loan';
    disbursementDate: string;
    maturityDate: string;
  };
  documents: {
    bondPaper: {
      fileUrl?: string;
      fileName?: string;
      uploadedAt?: string;
    };
  };
  surety: {
    name: string;
    mobileNumber: string;
    aadharNumber: string;
    photo?: {
      fileUrl?: string;
      fileName?: string;
      uploadedAt?: string;
    };
  };
  biometrics: {
    fingerprint?: {
      data: string;
      capturedAt: string;
    };
  };
  calculations: {
    simpleInterest: number;
    totalAmount: number;
    monthlyEMI?: number;
    emiSchedule?: EMISchedule[];
  };
  status: 'pending' | 'approved' | 'disbursed' | 'active' | 'completed' | 'defaulted' | 'closed';
  approvalInfo?: {
    approvedBy: string;
    approvedAt: string;
    approvalNotes?: string;
  };
  disbursementInfo?: {
    disbursedBy: string;
    disbursedAt: string;
    disbursementMethod: 'cash' | 'bank_transfer' | 'cheque';
    bankDetails?: {
      accountNumber: string;
      ifscCode: string;
      bankName: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface EMISchedule {
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAmount?: number;
  paidDate?: string;
  lateFee?: number;
}

export interface LoanFormData {
  // Customer selection
  customerId: string;
  
  // Loan details
  amount: number;
  interestRate: number;
  tenure: number;
  loanType: 'gold_loan' | 'personal_loan' | 'business_loan';
  
  // Documents
  bondPaperFile?: File;
  
  // Surety information
  suretyName: string;
  suretyMobile: string;
  suretyAadhar: string;
  suretyPhotoFile?: File;
  
  // Biometrics
  fingerprintData?: string;
}

export interface LoanSearchFilters {
  search?: string; // Search by loan ID, customer name, mobile
  status?: string[];
  loanType?: string[];
  amountRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    from: string;
    to: string;
  };
  overdueOnly?: boolean;
}

export interface LoanListResponse {
  loans: Loan[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface LoanSummaryStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
  defaulted: number;
  totalDisbursed: number;
  totalOutstanding: number;
  totalInterestEarned: number;
  averageLoanAmount: number;
  byLoanType: Record<string, number>;
  recentLoans: Loan[];
  overdueCount: number;
  overdueAmount: number;
}

export interface CustomerSearchResult {
  id: string;
  customerId: string;
  fullName: string;
  fatherName: string;
  primaryMobile: string;
  address: string;
  status: string;
  activeLoans: number;
  totalOutstanding: number;
}

// API endpoints structure for loans
export const LoanAPI = {
  // Basic CRUD operations
  create: '/api/loans',
  getAll: '/api/loans',
  getById: (id: string) => `/api/loans/${id}`,
  update: (id: string) => `/api/loans/${id}`,
  delete: (id: string) => `/api/loans/${id}`,
  
  // Specialized endpoints
  searchCustomers: '/api/loans/customers/search',
  getCustomerLoans: (customerId: string) => `/api/loans/customer/${customerId}`,
  approve: (id: string) => `/api/loans/${id}/approve`,
  disburse: (id: string) => `/api/loans/${id}/disburse`,
  close: (id: string) => `/api/loans/${id}/close`,
  
  // Document operations
  uploadBondPaper: (id: string) => `/api/loans/${id}/documents/bond-paper`,
  uploadSuretyPhoto: (id: string) => `/api/loans/${id}/documents/surety-photo`,
  
  // Reports and analytics
  getStats: '/api/loans/stats',
  getEMISchedule: (id: string) => `/api/loans/${id}/emi-schedule`,
  getOverdueLoans: '/api/loans/overdue',
  
  // Bulk operations
  export: '/api/loans/export',
  bulkApprove: '/api/loans/bulk-approve',
} as const;

// Loan calculation utilities
export const LoanCalculations = {
  calculateSimpleInterest: (principal: number, rate: number, time: number) => {
    return (principal * rate * time) / 100;
  },
  
  calculateCompoundInterest: (principal: number, rate: number, time: number, frequency = 12) => {
    return principal * Math.pow(1 + rate / (100 * frequency), frequency * time) - principal;
  },
  
  calculateEMI: (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / (12 * 100);
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  },
  
  generateEMISchedule: (principal: number, rate: number, tenure: number, startDate: string): EMISchedule[] => {
    const monthlyRate = rate / (12 * 100);
    const emi = LoanCalculations.calculateEMI(principal, rate, tenure);
    const schedule: EMISchedule[] = [];
    let remainingPrincipal = principal;
    
    for (let i = 1; i <= tenure; i++) {
      const interestAmount = Math.round(remainingPrincipal * monthlyRate);
      const principalAmount = Math.round(emi - interestAmount);
      remainingPrincipal -= principalAmount;
      
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      schedule.push({
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principalAmount,
        interestAmount,
        totalAmount: emi,
        status: 'pending',
      });
    }
    
    return schedule;
  },
};