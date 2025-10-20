import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { LoanDetailsModal } from "@/components/LoanDetailsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, 
  Search, 
  Eye, 
  Pencil, 
  Upload, 
  FileText, 
  CreditCard, 
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Download,
  Filter,
  MoreHorizontal,
  Trash2,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Clock,
  Coins,
  Weight,
  Percent,
  Activity,
  Fingerprint,
  UserCheck,
  Phone,
  Shield,
  Check,
  XCircle,
  Send
} from "lucide-react";
// Import from .tsx file which has working database connection with fresh token
import { useLoans, useCustomerSearch, useCreateLoan, useApproveLoan, useRejectLoan, useDisburseLoan } from '@/hooks/useLoans.tsx';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import SimpleParticleBackground from "@/components/SimpleParticleBackground";

// Local types to match our API
interface Loan {
  id: string;
  loanNumber: string;
  customerId: string;
  customerName: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    email?: string;
  };
  principalAmount: number;
  loanAmount: number;
  interestRate: number;
  tenure: number;
  emiAmount: number;
  status: string;
  goldWeight: number;
  goldValue: number;
  disbursedDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  goldItems: any[];
}

// Form validation schema
const loanSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  principalAmount: z.string().min(1, "Loan amount is required"),
  interestRate: z.string().min(1, "Interest rate is required"),
  tenure: z.string().min(1, "Tenure is required"),
  loanType: z.string().min(1, "Loan type is required"),
  bondPaper: z.any().optional(),
  
  // Surety Information
  suretyName: z.string().min(2, "Surety name is required"),
  suretyMobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
  suretyAadhar: z.string().regex(/^\d{4}\s?\d{4}\s?\d{4}$/, "Enter valid Aadhar number"),
  suretyPhoto: z.any().optional(),
  
  // Fingerprint
  fingerprintData: z.string().optional(),
  
  // Gold items - only required for gold loans
  goldItems: z.array(z.object({
    itemType: z.string().min(1, "Item type is required"),
    weight: z.string().min(1, "Weight is required"),
    purity: z.string().min(1, "Purity is required"),
    description: z.string().optional(),
    currentRate: z.string().min(1, "Current rate (₹/g) is required")
  })).optional()
}).refine((data) => {
  // If loan type is gold, gold items are required
  if (data.loanType === 'gold') {
    return data.goldItems && data.goldItems.length > 0;
  }
  return true;
}, {
  message: "At least one gold item is required for gold loans",
  path: ["goldItems"]
});

type LoanFormData = z.infer<typeof loanSchema>;

const Loans = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // New state for additional fields
  const [bondPaperFile, setBondPaperFile] = useState<File | null>(null);
  const [suretyPhotoFile, setSuretyPhotoFile] = useState<File | null>(null);
  const [fingerprintData, setFingerprintData] = useState<string | null>(null);
  const [fingerprintStatus, setFingerprintStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

  // New state for loan actions
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDisburseDialogOpen, setIsDisburseDialogOpen] = useState(false);
  const [actionLoan, setActionLoan] = useState<Loan | null>(null);
  const [actionRemarks, setActionRemarks] = useState('');

  const { toast } = useToast();

  // React Query hooks
  const { data: loansData, isLoading, error, refetch } = useLoans();
  // Search customers when term is 1+ characters for names, or 2+ for other fields
  const shouldSearch = customerSearchTerm.length >= 1;
  const { data: customers = [] } = useCustomerSearch(shouldSearch ? customerSearchTerm : "");
  const createLoanMutation = useCreateLoan();
  
  // Loan action mutations
  const approveLoanMutation = useApproveLoan();
  const rejectLoanMutation = useRejectLoan();
  const disburseLoanMutation = useDisburseLoan();

  // Fetch payments for selected loan
  const { data: loanPayments } = useQuery({
    queryKey: ['loan-payments', selectedLoan?.id],
    queryFn: async () => {
      if (!selectedLoan?.id) return [];
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const response = await fetch(`http://localhost:3001/api/payments?loanId=${selectedLoan.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.data?.data || result.data || [];
    },
    enabled: !!selectedLoan?.id && isViewModalOpen
  });

  // Ensure loans is always an array (supports both array and {loans,total} response)
  const loans: Loan[] = Array.isArray(loansData)
    ? (loansData as unknown as Loan[])
    : ((loansData as any)?.loans ?? []);
  const loansTotal: number = (loansData as any)?.total ?? loans.length ?? 0;

  // Calculate loan statistics
  const stats = {
    total: loans.length,
    active: loans.filter(loan => loan.status === 'ACTIVE').length,
    pending: loans.filter(loan => loan.status === 'PENDING').length,
    completed: loans.filter(loan => loan.status === 'COMPLETED').length,
    overdue: loans.filter(loan => loan.status === 'OVERDUE').length,
    totalDisbursed: loans.reduce((sum, loan) => sum + loan.principalAmount, 0),
    totalGoldWeight: loans.reduce((sum, loan) => sum + loan.goldWeight, 0),
    averageLoanAmount: loans.length > 0 ? loans.reduce((sum, loan) => sum + loan.principalAmount, 0) / loans.length : 0
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    mode: "onChange",
    defaultValues: {
      loanType: "gold",
      suretyName: "",
      suretyMobile: "",
      suretyAadhar: "",
      goldItems: []
    }
  });

  const watchedGoldItems = watch("goldItems") || [];
  const watchedPrincipalAmount = watch("principalAmount") || "0";
  const watchedInterestRate = watch("interestRate") || "0";
  const watchedTenure = watch("tenure") || "0";
  const watchedLoanType = watch("loanType") || "gold";

  // Calculate estimated interest and total
  const calculateEstimates = () => {
    const principal = parseFloat(watchedPrincipalAmount) || 0;
    const rate = parseFloat(watchedInterestRate) || 0;
    const tenure = parseInt(watchedTenure) || 0;
    
    // Simple interest calculation
    const estimatedInterest = (principal * rate * tenure) / (12 * 100);
    const estimatedTotal = principal + estimatedInterest;
    
    return {
      estimatedInterest,
      estimatedTotal
    };
  };

  const { estimatedInterest, estimatedTotal } = calculateEstimates();

  // Handle file upload for bond paper
  const handleBondPaperUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Bond paper file must be less than 10MB",
        variant: "destructive",
      });
      return;
    }
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Bond paper must be a PDF file",
        variant: "destructive",
      });
      return;
    }
    setBondPaperFile(file);
    setValue("bondPaper", file);
    toast({
      title: "File Selected",
      description: file.name,
    });
  };

  // Handle file upload for surety photo
  const handleSuretyPhotoUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Photo must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Surety photo must be an image file",
        variant: "destructive",
      });
      return;
    }
    setSuretyPhotoFile(file);
    setValue("suretyPhoto", file);
    toast({
      title: "File Selected",
      description: file.name,
    });
  };

  // Handle fingerprint scanning
  const scanFingerprint = async () => {
    setFingerprintStatus('scanning');
    
    try {
      // Simulate fingerprint capture (replace with actual USB device logic)
      setTimeout(() => {
        const mockFingerprintData = `FP_LOAN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setFingerprintData(mockFingerprintData);
        setValue("fingerprintData", mockFingerprintData);
        setFingerprintStatus('success');
        toast({
          title: "Fingerprint Captured",
          description: "Fingerprint verification successful",
        });
      }, 2000);

    } catch (error) {
      console.error('Fingerprint scan failed:', error);
      setFingerprintStatus('error');
      toast({
        title: "Fingerprint Scan Failed",
        description: "Could not connect to fingerprint scanner",
        variant: "destructive",
      });
    }
  };

  // Format Aadhar number with spaces
  const formatAadharNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/^(\d{4})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return value;
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadharNumber(e.target.value);
    setValue("suretyAadhar", formatted);
  };

  // Filter loans based on search and status
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = searchTerm === "" || 
      loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || 
      loan.status.toLowerCase() === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const onSubmit = async (data: LoanFormData) => {
    try {
      // Build payload as backend expects (see backend/src/routes/loans.ts)
      const loanData: any = {
        customerId: selectedCustomerId,
        principalAmount: parseFloat(data.principalAmount),
        interestRate: parseFloat(data.interestRate),
        tenure: parseInt(data.tenure),
      };

      // Only include goldItems if loan type is gold
      if (data.loanType === 'gold' && data.goldItems && data.goldItems.length > 0) {
        loanData.goldItems = data.goldItems.map((gi) => ({
          itemType: gi.itemType,
          weight: parseFloat(gi.weight),
          purity: gi.purity,
          description: gi.description || undefined,
          currentRate: parseFloat(gi.currentRate)
        }));
      }

      await createLoanMutation.mutateAsync(loanData);

      toast({
        title: "Loan Created Successfully",
        description: `New loan has been created successfully.`,
      });

      // Reset form and close dialog
      reset();
      setSelectedCustomerId("");
      setSelectedCustomer(null);
      setCustomerSearchTerm("");
      setBondPaperFile(null);
      setSuretyPhotoFile(null);
      setFingerprintData(null);
      setFingerprintStatus('idle');
      setIsAddDialogOpen(false);

    } catch (error) {
      console.error('Error creating loan:', error);
      toast({
        title: "Error Creating Loan",
        description: "There was an error creating the loan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    // Export functionality placeholder
    toast({
      title: "Export Started",
      description: "Loan data is being exported...",
    });
  };

  const addGoldItem = () => {
    const currentItems = watch("goldItems") || [];
    setValue("goldItems", [...currentItems, {
      itemType: "ring",
      weight: "",
      purity: "",
      description: "",
      currentRate: ""
    }]);
  };

  const removeGoldItem = (index: number) => {
    const currentItems = watch("goldItems") || [];
    if (currentItems.length > 1) {
      setValue("goldItems", currentItems.filter((_, i) => i !== index));
    }
  };

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loan Action Handlers
  const handleApproveLoan = (loan: Loan) => {
    setActionLoan(loan);
    setActionRemarks('');
    setIsApproveDialogOpen(true);
  };

  const handleRejectLoan = (loan: Loan) => {
    setActionLoan(loan);
    setActionRemarks('');
    setIsRejectDialogOpen(true);
  };

  const handleDisburseLoan = (loan: Loan) => {
    setActionLoan(loan);
    setIsDisburseDialogOpen(true);
  };

  const confirmApproveLoan = async () => {
    if (!actionLoan) return;
    
    await approveLoanMutation.mutateAsync({
      loanId: actionLoan.id,
      remarks: actionRemarks || undefined
    });
    
    setIsApproveDialogOpen(false);
    setActionLoan(null);
    setActionRemarks('');
  };

  const confirmRejectLoan = async () => {
    if (!actionLoan || !actionRemarks.trim()) {
      toast({
        title: 'Rejection reason required',
        description: 'Please provide a reason for rejecting this loan',
        variant: 'destructive'
      });
      return;
    }
    
    await rejectLoanMutation.mutateAsync({
      loanId: actionLoan.id,
      remarks: actionRemarks
    });
    
    setIsRejectDialogOpen(false);
    setActionLoan(null);
    setActionRemarks('');
  };

  const confirmDisburseLoan = async () => {
    if (!actionLoan) return;
    
    await disburseLoanMutation.mutateAsync(actionLoan.id);
    
    setIsDisburseDialogOpen(false);
    setActionLoan(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading loans data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading loans. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        <SimpleParticleBackground />
        
        <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Loan Management
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage your gold loans with advanced features</p>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="flex items-center gap-2 flex-1 sm:flex-initial text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
                
                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) {
                    // Reset form when dialog is closed
                    reset();
                    setSelectedCustomerId("");
                    setSelectedCustomer(null);
                    setCustomerSearchTerm("");
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1 sm:flex-initial text-sm">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Create Loan</span>
                      <span className="sm:hidden">Create</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
                        <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                        Create New Loan
                      </DialogTitle>
                      <DialogDescription className="text-xs md:text-sm">
                        Fill in the loan details below. All fields marked with * are required.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Customer Selection */}
                      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            <Users className="h-5 w-5 text-blue-600" />
                            Customer Selection
                          </CardTitle>
                          <p className="text-sm text-gray-600">Search and select a customer for the loan</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="relative">
                            <Label htmlFor="customer-search" className="text-sm font-medium">Search Customer *</Label>
                            <div className="relative mt-1">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="customer-search"
                                placeholder="Type name (min 2 chars), phone, or email to search..."
                                value={customerSearchTerm}
                                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                              {customerSearchTerm && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                                  onClick={() => {
                                    setCustomerSearchTerm("");
                                    setSelectedCustomerId("");
                                    setSelectedCustomer(null);
                                    setValue("customerId", "");
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            
                            {/* Search Results Dropdown */}
                            {customers.length > 0 && customerSearchTerm.length >= 1 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                <div className="p-2 bg-gray-50 border-b text-xs text-gray-600 font-medium">
                                  {customers.length} customer(s) found
                                </div>
                                {customers.map((customer: any) => (
                                  <div
                                    key={customer.id}
                                    className={`p-3 cursor-pointer hover:bg-blue-50 border-b last:border-b-0 transition-colors ${
                                      selectedCustomerId === customer.id ? 'bg-blue-100 border-blue-200' : ''
                                    }`}
                                    onClick={() => {
                                      setSelectedCustomerId(customer.id);
                                      setSelectedCustomer(customer);
                                      setCustomerSearchTerm(`${customer.firstName} ${customer.lastName}`);
                                      setValue("customerId", customer.id);
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-medium text-gray-900">
                                          {customer.firstName} {customer.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center gap-3">
                                          <span className="flex items-center gap-1">
                                            📱 {customer.phone}
                                          </span>
                                          {customer.email && (
                                            <span className="flex items-center gap-1">
                                              📧 {customer.email}
                                            </span>
                                          )}
                                        </div>
                                        {customer.aadharNumber && (
                                          <div className="text-xs text-gray-400">
                                            Aadhar: {customer.aadharNumber}
                                          </div>
                                        )}
                                      </div>
                                      {selectedCustomerId === customer.id && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Selected Customer Display */}
                            {selectedCustomerId && (
                              <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                                  <CheckCircle className="h-4 w-4" />
                                  Selected Customer
                                </div>
                                {customers.find(c => c.id === selectedCustomerId) && (
                                  <div className="text-sm text-green-600">
                                    {customers.find(c => c.id === selectedCustomerId)?.firstName} {customers.find(c => c.id === selectedCustomerId)?.lastName}
                                    <span className="ml-2">• {customers.find(c => c.id === selectedCustomerId)?.phone}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* No results message */}
                            {customerSearchTerm.length >= 1 && customers.length === 0 && shouldSearch && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No customers found matching "{customerSearchTerm}"</p>
                                <p className="text-xs text-gray-400 mt-1">Try searching with different keywords</p>
                              </div>
                            )}

                            {/* Loading indicator */}
                            {customerSearchTerm.length >= 1 && !customers.length && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2 text-blue-500" />
                                <p className="text-xs text-gray-500">Searching customers...</p>
                              </div>
                            )}
                            
                            {errors.customerId && (
                              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.customerId.message}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Customer Details Display - Only shown when customer is selected */}
                      {selectedCustomer && (
                        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              Customer Information
                            </CardTitle>
                            <p className="text-sm text-gray-600">Loan will be created for this customer</p>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <div className="text-sm text-gray-500">Full Name</div>
                                <div className="font-medium text-gray-900">
                                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="text-sm text-gray-500">Phone Number</div>
                                <div className="font-medium text-gray-900 flex items-center gap-1">
                                  📱 {selectedCustomer.phone}
                                </div>
                              </div>
                              
                              {selectedCustomer.email && (
                                <div className="space-y-2">
                                  <div className="text-sm text-gray-500">Email Address</div>
                                  <div className="font-medium text-gray-900 flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {selectedCustomer.email}
                                  </div>
                                </div>
                              )}
                              
                              {selectedCustomer.aadharNumber && (
                                <div className="space-y-2">
                                  <div className="text-sm text-gray-500">Aadhar Number</div>
                                  <div className="font-medium text-gray-900">
                                    {selectedCustomer.aadharNumber}
                                  </div>
                                </div>
                              )}
                              
                              {selectedCustomer.city && (
                                <div className="space-y-2">
                                  <div className="text-sm text-gray-500">City</div>
                                  <div className="font-medium text-gray-900">
                                    {selectedCustomer.city}
                                  </div>
                                </div>
                              )}
                              
                              {selectedCustomer.state && (
                                <div className="space-y-2">
                                  <div className="text-sm text-gray-500">State</div>
                                  <div className="font-medium text-gray-900">
                                    {selectedCustomer.state}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Change Customer Button */}
                            <div className="mt-4 pt-4 border-t border-green-200">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCustomer(null);
                                  setSelectedCustomerId("");
                                  setCustomerSearchTerm("");
                                  setValue("customerId", "");
                                }}
                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                              >
                                <Search className="h-3 w-3 mr-1" />
                                Change Customer
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Loan Details */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                            <IndianRupee className="h-4 w-4" />
                            Loan Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="principalAmount" className="text-xs md:text-sm">Loan Amount (₹) *</Label>
                            <div className="relative">
                              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="principalAmount"
                                type="number"
                                placeholder="150000"
                                className="pl-10"
                                {...register("principalAmount")}
                              />
                            </div>
                            {errors.principalAmount && (
                              <p className="text-sm text-red-600 mt-1">{errors.principalAmount.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="interestRate">Interest Rate (%) *</Label>
                            <div className="relative">
                              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="interestRate"
                                type="number"
                                step="0.1"
                                placeholder="12.5"
                                className="pl-10"
                                {...register("interestRate")}
                              />
                            </div>
                            {errors.interestRate && (
                              <p className="text-sm text-red-600 mt-1">{errors.interestRate.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="tenure">Tenure (Months) *</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="tenure"
                                type="number"
                                placeholder="12"
                                className="pl-10"
                                {...register("tenure")}
                              />
                            </div>
                            {errors.tenure && (
                              <p className="text-sm text-red-600 mt-1">{errors.tenure.message}</p>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <Label htmlFor="loanType">Loan Type *</Label>
                            <Select
                              value={watchedLoanType}
                              onValueChange={(value) => setValue("loanType", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select loan type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gold">Gold Loan</SelectItem>
                                <SelectItem value="bond">Bond Loan</SelectItem>
                                <SelectItem value="personal">Personal Loan</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.loanType && (
                              <p className="text-sm text-red-600 mt-1">{errors.loanType.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="bondPaper">Bond Paper (PDF) *</Label>
                            <div className="mt-1">
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleBondPaperUpload(file);
                                }}
                                className="hidden"
                                id="bondPaper-upload"
                              />
                              <label
                                htmlFor="bondPaper-upload"
                                className="flex items-center justify-center w-full h-10 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                {bondPaperFile ? (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-700 truncate max-w-[150px]">
                                      {bondPaperFile.name}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">No file chosen</span>
                                  </div>
                                )}
                              </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Upload signed bond paper document (Max size: 10MB)
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Surety Information */}
                      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base md:text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                            Surety Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="suretyName" className="text-xs md:text-sm">Surety Name *</Label>
                              <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  id="suretyName"
                                  placeholder="Enter surety full name"
                                  className="pl-10 bg-white"
                                  {...register("suretyName")}
                                />
                              </div>
                              {errors.suretyName && (
                                <p className="text-sm text-red-600 mt-1">{errors.suretyName.message}</p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="suretyMobile">Surety Mobile Number *</Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  id="suretyMobile"
                                  placeholder="Enter 10-digit mobile number"
                                  className="pl-10 bg-white"
                                  {...register("suretyMobile")}
                                />
                              </div>
                              {errors.suretyMobile && (
                                <p className="text-xs text-red-600 mt-1">{errors.suretyMobile.message}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="suretyAadhar" className="text-xs md:text-sm">Surety Aadhar Number *</Label>
                              <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  id="suretyAadhar"
                                  placeholder="Format: XXXX XXXX XXXX"
                                  className="pl-10 bg-white"
                                  {...register("suretyAadhar")}
                                  onChange={handleAadharChange}
                                />
                              </div>
                              {errors.suretyAadhar && (
                                <p className="text-sm text-red-600 mt-1">{errors.suretyAadhar.message}</p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="suretyPhoto">Surety Photo *</Label>
                              <div className="mt-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleSuretyPhotoUpload(file);
                                  }}
                                  className="hidden"
                                  id="suretyPhoto-upload"
                                />
                                <label
                                  htmlFor="suretyPhoto-upload"
                                  className="flex items-center justify-center w-full h-10 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                                >
                                  {suretyPhotoFile ? (
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      <span className="text-sm text-green-700 truncate max-w-[150px]">
                                        {suretyPhotoFile.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <Upload className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm text-gray-500">No file chosen</span>
                                    </div>
                                  )}
                                </label>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Fingerprint Verification */}
                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            <Fingerprint className="h-5 w-5 text-blue-600" />
                            Fingerprint Verification
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between p-4 border-2 border-dashed border-blue-300 rounded-lg bg-white">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-blue-100 rounded-full">
                                <Fingerprint className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Capture Fingerprint</h4>
                                <p className="text-sm text-gray-600">
                                  {fingerprintStatus === 'idle' && 'Not captured'}
                                  {fingerprintStatus === 'scanning' && 'Scanning... Please place finger'}
                                  {fingerprintStatus === 'success' && 'Fingerprint captured successfully'}
                                  {fingerprintStatus === 'error' && 'Scan failed. Please try again'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {fingerprintStatus === 'success' ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-6 w-6 text-green-500" />
                                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                                </div>
                              ) : fingerprintStatus === 'error' ? (
                                <Button
                                  type="button"
                                  onClick={scanFingerprint}
                                  variant="outline"
                                  size="sm"
                                  className="border-red-300 hover:bg-red-50"
                                >
                                  <Fingerprint className="h-4 w-4 mr-2" />
                                  Retry
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  onClick={scanFingerprint}
                                  disabled={fingerprintStatus === 'scanning'}
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-300 hover:bg-blue-50"
                                >
                                  {fingerprintStatus === 'scanning' ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Scanning...
                                    </>
                                  ) : (
                                    <>
                                      <Fingerprint className="h-4 w-4 mr-2" />
                                      Capture Fingerprint
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                          <Alert className="mt-3 bg-blue-50 border-blue-200">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                              Connect USB fingerprint device and click "Capture Fingerprint" to scan.
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>

                      {/* Loan Summary */}
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            <Activity className="h-5 w-5 text-green-600" />
                            Loan Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-white rounded-lg border border-green-200">
                              <p className="text-xs text-gray-600 mb-1">Customer</p>
                              <p className="font-semibold text-gray-900">
                                {selectedCustomer 
                                  ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` 
                                  : '—'}
                              </p>
                            </div>
                            
                            <div className="p-3 bg-white rounded-lg border border-green-200">
                              <p className="text-xs text-gray-600 mb-1">Loan Amount</p>
                              <p className="font-semibold text-gray-900">
                                ₹{parseFloat(watchedPrincipalAmount || '0').toLocaleString('en-IN')}
                              </p>
                            </div>
                            
                            <div className="p-3 bg-white rounded-lg border border-green-200">
                              <p className="text-xs text-gray-600 mb-1">Interest Rate</p>
                              <p className="font-semibold text-gray-900">
                                {watchedInterestRate || '0'}%
                              </p>
                            </div>
                            
                            <div className="p-3 bg-white rounded-lg border border-green-200">
                              <p className="text-xs text-gray-600 mb-1">Tenure</p>
                              <p className="font-semibold text-gray-900">
                                {watchedTenure || '0'} mo
                              </p>
                            </div>
                            
                            <div className="p-3 bg-white rounded-lg border border-green-200">
                              <p className="text-xs text-gray-600 mb-1">Loan Type</p>
                              <p className="font-semibold text-gray-900">
                                {watchedLoanType === 'gold' ? 'Gold Loan' : 
                                 watchedLoanType === 'bond' ? 'Bond Loan' : 
                                 watchedLoanType === 'personal' ? 'Personal Loan' : 'Gold Loan'}
                              </p>
                            </div>
                            
                            <div className="p-3 bg-white rounded-lg border border-green-200">
                              <p className="text-xs text-gray-600 mb-1">Estimated Interest</p>
                              <p className="font-semibold text-green-700">
                                ₹{estimatedInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </p>
                            </div>
                            
                            <div className="md:col-span-3 p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm opacity-90 mb-1">Estimated Total</p>
                                  <p className="text-2xl font-bold">
                                    ₹{estimatedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                  </p>
                                </div>
                                <TrendingUp className="h-8 w-8 opacity-80" />
                              </div>
                            </div>
                          </div>
                          
                          <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800 text-xs">
                              Estimates are simple interest previews. Final schedule may vary.
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>

                      {/* Gold Items */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Coins className="h-4 w-4" />
                            Gold Items
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {watchedGoldItems.map((item, index) => (
                            <Card key={index} className="p-3 md:p-4 bg-gray-50">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                                <div>
                                  <Label className="text-xs md:text-sm">Item Type *</Label>
                                  <Select
                                    value={item.itemType}
                                    onValueChange={(value) => {
                                      const items = [...watchedGoldItems];
                                      items[index].itemType = value;
                                      setValue("goldItems", items);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ring">Ring</SelectItem>
                                      <SelectItem value="necklace">Necklace</SelectItem>
                                      <SelectItem value="earrings">Earrings</SelectItem>
                                      <SelectItem value="bracelet">Bracelet</SelectItem>
                                      <SelectItem value="chain">Chain</SelectItem>
                                      <SelectItem value="coin">Coin</SelectItem>
                                      <SelectItem value="biscuit">Biscuit</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label>Weight (grams) *</Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="10.5"
                                    {...register(`goldItems.${index}.weight`)}
                                  />
                                </div>
                                
                                <div>
                                  <Label>Purity (karat) *</Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="22"
                                    {...register(`goldItems.${index}.purity`)}
                                  />
                                </div>
                                
                                <div>
                                  <Label>Current Rate (₹/g) *</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="6500"
                                    {...register(`goldItems.${index}.currentRate`)}
                                  />
                                </div>
                                
                                <div className="flex items-end">
                                  {watchedGoldItems.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeGoldItem(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <Label>Description</Label>
                                <Textarea
                                  placeholder="Additional details about the gold item..."
                                  {...register(`goldItems.${index}.description`)}
                                />
                              </div>
                            </Card>
                          ))}
                          
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addGoldItem}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Gold Item
                          </Button>
                        </CardContent>
                      </Card>

                      <div className="flex justify-end gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || !selectedCustomerId}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Create Loan
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs md:text-sm">Total Loans</p>
                      <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats.total}</p>
                    </div>
                    <CreditCard className="h-6 w-6 md:h-8 md:w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs md:text-sm">Active Loans</p>
                      <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats.active}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-xs md:text-sm">Pending Loans</p>
                      <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats.pending}</p>
                    </div>
                    <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-xs md:text-sm">Total Disbursed</p>
                      <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{formatCurrency(stats.totalDisbursed)}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filter Section */}
          <Card className="mb-4 md:mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search loans by loan number or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Showing {filteredLoans.length} of {loansTotal} loans
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loans Table - Advanced Display */}
          <Card className="shadow-lg">
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <TableHead className="font-bold text-gray-700">Loan Number</TableHead>
                      <TableHead className="font-bold text-gray-700">Customer Name</TableHead>
                      <TableHead className="font-bold text-gray-700">Amount</TableHead>
                      <TableHead className="font-bold text-gray-700">Loan Type</TableHead>
                      <TableHead className="font-bold text-gray-700">Disbursed Date</TableHead>
                      <TableHead className="font-bold text-gray-700">Status</TableHead>
                      <TableHead className="font-bold text-gray-700 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoans.map((loan, index) => (
                      <TableRow 
                        key={loan.id}
                        className={`
                          ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          hover:bg-blue-50 transition-colors duration-150 border-b border-gray-200
                        `}
                      >
                        {/* Loan Number */}
                        <TableCell className="font-semibold text-gray-900">
                          {loan.loanNumber}
                        </TableCell>
                        
                        {/* Customer Name */}
                        <TableCell>
                          <div className="font-medium text-gray-900">{loan.customerName}</div>
                        </TableCell>
                        
                        {/* Amount */}
                        <TableCell>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(loan.principalAmount)}
                          </div>
                        </TableCell>
                        
                        {/* Loan Type */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {loan.loanNumber?.startsWith('GL') ? (
                              <>
                                <Coins className="h-4 w-4 text-yellow-600" />
                                <span className="text-gray-900">Gold</span>
                              </>
                            ) : loan.loanNumber?.startsWith('PL') ? (
                              <>
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="text-gray-900">Personal</span>
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 text-green-600" />
                                <span className="text-gray-900">Bond</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Disbursed Date */}
                        <TableCell className="text-gray-900">
                          {loan.disbursedDate 
                            ? new Date(loan.disbursedDate).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            : loan.createdAt 
                              ? new Date(loan.createdAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : 'N/A'
                          }
                        </TableCell>
                        
                        {/* Status */}
                        <TableCell>
                          <Badge 
                            className={`
                              ${loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                              ${loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                              ${loan.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                              ${loan.status === 'OVERDUE' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                              font-medium px-3 py-1
                            `}
                          >
                            {loan.status === 'ACTIVE' ? 'Active' : 
                             loan.status === 'PENDING' ? 'Pending' :
                             loan.status === 'COMPLETED' ? 'Completed' :
                             loan.status === 'OVERDUE' ? 'Overdue' : loan.status}
                          </Badge>
                        </TableCell>
                        
                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            {/* Conditional Action Buttons based on Loan Status */}
                            {loan.status === 'PENDING' && (
                              <>
                                {/* Approve Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 rounded-full hover:bg-green-100 text-green-600 hover:text-green-700"
                                  onClick={() => handleApproveLoan(loan)}
                                  title="Approve Loan"
                                >
                                  <Check className="h-5 w-5" />
                                </Button>

                                {/* Reject Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 rounded-full hover:bg-red-100 text-red-600 hover:text-red-700"
                                  onClick={() => handleRejectLoan(loan)}
                                  title="Reject Loan"
                                >
                                  <XCircle className="h-5 w-5" />
                                </Button>
                              </>
                            )}

                            {loan.status === 'APPROVED' && (
                              <>
                                {/* Disburse Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 px-3 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800"
                                  onClick={() => handleDisburseLoan(loan)}
                                  title="Disburse Loan"
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Disburse
                                </Button>
                              </>
                            )}
                            
                            {/* View Details Button - Always visible */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                              onClick={() => {
                                setSelectedLoan(loan);
                                setIsViewModalOpen(true);
                              }}
                              title="View Loan Details"
                            >
                              <Eye className="h-5 w-5" />
                            </Button>

                            {/* Download/Generate Documents Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 rounded-full hover:bg-green-100 text-green-600 hover:text-green-700"
                              onClick={() => {
                                toast({
                                  title: "Generating Documents",
                                  description: `Preparing loan agreement for ${loan.loanNumber}`,
                                });
                                // Simulate document generation
                                setTimeout(() => {
                                  toast({
                                    title: "Document Ready",
                                    description: "Loan agreement downloaded successfully",
                                  });
                                }, 1500);
                              }}
                              title="Generate Loan Agreement"
                            >
                              <Download className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredLoans.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No loans found matching your criteria.</p>
                  </div>
                )}
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden p-4 space-y-4">
                {filteredLoans.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No loans found matching your criteria.</p>
                  </div>
                ) : (
                  filteredLoans.map((loan) => (
                    <Card key={loan.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-base">{loan.loanNumber}</span>
                                <Badge 
                                  className={`
                                    ${loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                                    ${loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                                    ${loan.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                                    ${loan.status === 'OVERDUE' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                                    text-xs px-2 py-0.5
                                  `}
                                >
                                  {loan.status === 'ACTIVE' ? 'Active' : 
                                   loan.status === 'PENDING' ? 'Pending' :
                                   loan.status === 'COMPLETED' ? 'Completed' :
                                   loan.status === 'OVERDUE' ? 'Overdue' : loan.status}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-gray-900">{loan.customerName}</p>
                            </div>
                          </div>

                          <Separator />

                          {/* Loan Details */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 p-2 rounded">
                              <p className="text-xs text-gray-600 mb-0.5">Amount</p>
                              <p className="text-base font-semibold text-blue-600">
                                {formatCurrency(loan.principalAmount)}
                              </p>
                            </div>
                            <div className="bg-purple-50 p-2 rounded">
                              <p className="text-xs text-gray-600 mb-0.5">Type</p>
                              <div className="flex items-center gap-1">
                                {loan.loanNumber?.startsWith('GL') ? (
                                  <>
                                    <Coins className="h-3.5 w-3.5 text-yellow-600" />
                                    <span className="text-sm font-semibold text-gray-900">Gold</span>
                                  </>
                                ) : loan.loanNumber?.startsWith('PL') ? (
                                  <>
                                    <Users className="h-3.5 w-3.5 text-blue-600" />
                                    <span className="text-sm font-semibold text-gray-900">Personal</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-3.5 w-3.5 text-green-600" />
                                    <span className="text-sm font-semibold text-gray-900">Bond</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {loan.disbursedDate 
                                ? new Date(loan.disbursedDate).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })
                                : loan.createdAt 
                                  ? new Date(loan.createdAt).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'N/A'
                              }
                            </span>
                          </div>

                          <Separator />

                          {/* Actions */}
                          <div className="flex items-center justify-between gap-2">
                            {loan.status === 'PENDING' && (
                              <div className="flex items-center gap-2 flex-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
                                  onClick={() => handleApproveLoan(loan)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                                  onClick={() => handleRejectLoan(loan)}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}

                            {loan.status === 'APPROVED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                                onClick={() => handleDisburseLoan(loan)}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Disburse Loan
                              </Button>
                            )}

                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedLoan(loan);
                                  setIsViewModalOpen(true);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Generating Documents",
                                    description: `Preparing loan agreement for ${loan.loanNumber}`,
                                  });
                                  setTimeout(() => {
                                    toast({
                                      title: "Document Ready",
                                      description: "Loan agreement downloaded successfully",
                                    });
                                  }, 1500);
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loan Details Modal - Enhanced with Tabs */}
        <LoanDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          loan={selectedLoan}
          payments={loanPayments?.data || []}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onDownload={() => {
            toast({
              title: "Generating Loan Agreement",
              description: "Your document will download shortly",
            });
          }}
          onPrint={() => {
            toast({
              title: "Printing Loan Details",
              description: "Opening print dialog...",
            });
          }}
        />

        {/* Approve Loan Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Approve Loan
              </DialogTitle>
              <DialogDescription>
                Approve this loan application for {actionLoan?.customerName}
              </DialogDescription>
            </DialogHeader>

            {actionLoan && (
              <div className="space-y-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Loan Number</p>
                        <p className="font-semibold">{actionLoan.loanNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Customer</p>
                        <p className="font-semibold">{actionLoan.customerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Loan Amount</p>
                        <p className="font-semibold text-green-600">{formatCurrency(actionLoan.principalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tenure</p>
                        <p className="font-semibold">{actionLoan.tenure} months</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="approve-remarks">Remarks (Optional)</Label>
                  <Textarea
                    id="approve-remarks"
                    placeholder="Add any approval notes..."
                    value={actionRemarks}
                    onChange={(e) => setActionRemarks(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsApproveDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmApproveLoan}
                    disabled={approveLoanMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {approveLoanMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Approve Loan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Loan Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-600" />
                Reject Loan
              </DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this loan application
              </DialogDescription>
            </DialogHeader>

            {actionLoan && (
              <div className="space-y-4">
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Loan Number</p>
                        <p className="font-semibold">{actionLoan.loanNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Customer</p>
                        <p className="font-semibold">{actionLoan.customerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Loan Amount</p>
                        <p className="font-semibold">{formatCurrency(actionLoan.principalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className="font-semibold text-yellow-600">PENDING</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="reject-remarks">Rejection Reason *</Label>
                  <Textarea
                    id="reject-remarks"
                    placeholder="Please provide a detailed reason for rejection..."
                    value={actionRemarks}
                    onChange={(e) => setActionRemarks(e.target.value)}
                    rows={4}
                    className={!actionRemarks.trim() ? 'border-red-500' : ''}
                  />
                  {!actionRemarks.trim() && (
                    <p className="text-sm text-red-500 mt-1">Rejection reason is required</p>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsRejectDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmRejectLoan}
                    disabled={rejectLoanMutation.isPending || !actionRemarks.trim()}
                    variant="destructive"
                  >
                    {rejectLoanMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Loan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Disburse Loan Dialog */}
        <Dialog open={isDisburseDialogOpen} onOpenChange={setIsDisburseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-6 w-6 text-blue-600" />
                Disburse Loan
              </DialogTitle>
              <DialogDescription>
                Confirm loan disbursement to customer
              </DialogDescription>
            </DialogHeader>

            {actionLoan && (
              <div className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    <strong>Important:</strong> Once disbursed, the loan amount will be marked as distributed and a payment record will be created.
                  </AlertDescription>
                </Alert>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Loan Number</p>
                        <p className="font-semibold">{actionLoan.loanNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Customer</p>
                        <p className="font-semibold">{actionLoan.customerName}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600">Disbursement Amount</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(actionLoan.principalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Interest Rate</p>
                        <p className="font-semibold">{actionLoan.interestRate}% per month</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tenure</p>
                        <p className="font-semibold">{actionLoan.tenure} months</p>
                      </div>
                      <div>
                        <p className="text-gray-600">EMI Amount</p>
                        <p className="font-semibold text-blue-600">{formatCurrency(actionLoan.emiAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className="font-semibold text-green-600">APPROVED</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDisburseDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDisburseLoan}
                    disabled={disburseLoanMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {disburseLoanMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Disbursing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Confirm Disbursement
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Loans;