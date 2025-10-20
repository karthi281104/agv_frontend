import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DecorativeBackground from '@/components/DecorativeBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  DollarSign,
  Search,
  TrendingUp,
  AlertTriangle,
  Plus,
  Receipt,
  CreditCard,
  Download,
  Printer,
  Eye,
  Calendar,
  IndianRupee,
  Loader2,
  CheckCircle,
  Clock,
  X,
  Wallet,
  Banknote
} from 'lucide-react';

// Payment Form Schema
const paymentSchema = z.object({
  loanId: z.string().min(1, 'Loan selection is required'),
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number'
  }),
  paymentMethod: z.enum(['cash', 'upi', 'bank_transfer', 'cheque', 'card'], {
    required_error: 'Payment method is required'
  }),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  paymentDate: z.string().min(1, 'Payment date is required')
});

type PaymentFormData = z.infer<typeof paymentSchema>;

// Get token helper
const getToken = () => {
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
};

const Repayments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  // Fetch active loans
  const { data: loansData, isLoading: loansLoading } = useQuery({
    queryKey: ['active-loans'],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch('http://localhost:3001/api/loans?status=ACTIVE', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch loans');
      const result = await response.json();
      return result.data?.data || result.data || [];
    }
  });

  // Fetch payments
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch('http://localhost:3001/api/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      const result = await response.json();
      return result.data?.data || result.data || [];
    }
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const token = getToken();
      const response = await fetch('http://localhost:3001/api/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['active-loans'] });
      toast({
        title: 'Payment Recorded',
        description: 'Payment has been recorded successfully',
      });
      setIsPaymentDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0]
    }
  });

  const watchedPaymentMethod = watch('paymentMethod');

  // Filter loans
  const filteredLoans = useMemo(() => {
    if (!loansData) return [];
    let filtered = loansData;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter((loan: any) =>
        loan.loanNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.customer?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.customer?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [loansData, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    // FIXED: Filter out LOAN_DISBURSEMENT (money given out, not collected)
    const actualPayments = paymentsData?.filter((payment: any) => 
      payment.paymentType !== 'LOAN_DISBURSEMENT'
    ) || [];
    
    // FIXED: Total collected from completed REPAYMENTS only (not disbursements)
    const totalCollected = actualPayments.reduce((sum: number, payment: any) => 
      sum + (payment.status === 'COMPLETED' ? Number(payment.amount) : 0), 0);
    
    // FIXED: Use outstandingBalance instead of principalAmount
    const totalOutstanding = loansData?.reduce((sum: number, loan: any) => 
      sum + Number(loan.outstandingBalance || loan.principalAmount || 0), 0) || 0;
    
    // FIXED: Count REPAYMENTS today, not disbursements
    const paymentsToday = actualPayments.filter((payment: any) => {
      const today = new Date().toISOString().split('T')[0];
      const paymentDate = new Date(payment.paymentDate).toISOString().split('T')[0];
      return paymentDate === today && payment.status === 'COMPLETED';
    }).length;

    // FIXED: Check isOverdue flag instead of maturityDate
    const overdueLoans = loansData?.filter((loan: any) => 
      loan.isOverdue === true || (loan.daysOverdue && loan.daysOverdue > 0)
    ).length || 0;

    return {
      totalCollected,
      totalOutstanding,
      paymentsToday,
      overdueLoans
    };
  }, [loansData, paymentsData]);

  // FIXED: Filter out loan disbursements from recent payments display
  const recentPayments = useMemo(() => {
    if (!paymentsData) return [];
    // Only show actual repayments, not disbursements
    return paymentsData.filter((payment: any) => 
      payment.paymentType !== 'LOAN_DISBURSEMENT'
    ).slice(0, 10); // Show last 10 payments
  }, [paymentsData]);

  const handleRecordPayment = (loan: any) => {
    setSelectedLoan(loan);
    setValue('loanId', loan.id);
    setValue('amount', loan.emiAmount?.toString() || '');
    setIsPaymentDialogOpen(true);
  };

  const onSubmit = async (data: PaymentFormData) => {
    const paymentData = {
      loanId: data.loanId,
      amount: parseFloat(data.amount),
      paymentMethod: data.paymentMethod,
      paymentType: 'EMI_PAYMENT',
      transactionId: data.transactionId || undefined,
      notes: data.notes || undefined,
      paymentDate: new Date(data.paymentDate).toISOString(),
      status: 'COMPLETED'
    };

    await createPaymentMutation.mutateAsync(paymentData);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'upi': return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer': return <Wallet className="h-4 w-4" />;
      case 'cheque': return <Receipt className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      'COMPLETED': { variant: 'default', className: 'bg-green-500', icon: CheckCircle },
      'PENDING': { variant: 'secondary', className: 'bg-yellow-500', icon: Clock },
      'FAILED': { variant: 'destructive', className: 'bg-red-500', icon: X }
    };

    const config = statusConfig[status] || statusConfig['PENDING'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`${config.className} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  if (loansLoading || paymentsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        <DecorativeBackground />
        
        <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Payment Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2">Manage loan repayments and track collection history</p>
              </div>
              
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
                      <Receipt className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      Record Payment
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Selected Loan Info */}
                    {selectedLoan && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-3 md:p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-gray-600">Loan Number</p>
                              <p className="font-semibold">{selectedLoan.loanNumber}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Customer</p>
                              <p className="font-semibold">{selectedLoan.customerName || `${selectedLoan.customer?.firstName} ${selectedLoan.customer?.lastName}`}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Outstanding Amount</p>
                              <p className="font-semibold text-orange-600">₹{Number(selectedLoan.outstandingBalance || selectedLoan.principalAmount).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">EMI Amount</p>
                              <p className="font-semibold text-blue-600">₹{Number(selectedLoan.emiAmount).toLocaleString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Loan Selection */}
                    {!selectedLoan && (
                      <div>
                        <Label htmlFor="loanId" className="text-xs md:text-sm">Select Loan *</Label>
                        <Select onValueChange={(value) => {
                          setValue('loanId', value);
                          const loan = loansData?.find((l: any) => l.id === value);
                          setSelectedLoan(loan);
                          if (loan) {
                            setValue('amount', loan.emiAmount?.toString() || '');
                          }
                        }}>
                          <SelectTrigger className={errors.loanId ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select active loan" />
                          </SelectTrigger>
                          <SelectContent>
                            {loansData?.map((loan: any) => (
                              <SelectItem key={loan.id} value={loan.id}>
                                {loan.loanNumber} - {loan.customerName || `${loan.customer?.firstName} ${loan.customer?.lastName}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.loanId && (
                          <p className="text-xs text-red-500 mt-1">{errors.loanId.message}</p>
                        )}
                      </div>
                    )}

                    {/* Payment Amount */}
                    <div>
                      <Label htmlFor="amount" className="text-xs md:text-sm">Payment Amount (₹) *</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="Enter amount"
                          className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
                          {...register('amount')}
                        />
                      </div>
                      {errors.amount && (
                        <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method *</Label>
                      <Select onValueChange={(value) => setValue('paymentMethod', value as any)}>
                        <SelectTrigger className={errors.paymentMethod ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.paymentMethod && (
                        <p className="text-sm text-red-500 mt-1">{errors.paymentMethod.message}</p>
                      )}
                    </div>

                    {/* Transaction ID */}
                    {watchedPaymentMethod && watchedPaymentMethod !== 'cash' && (
                      <div>
                        <Label htmlFor="transactionId">Transaction ID / Reference Number</Label>
                        <Input
                          id="transactionId"
                          placeholder="Enter transaction ID"
                          {...register('transactionId')}
                        />
                      </div>
                    )}

                    {/* Payment Date */}
                    <div>
                      <Label htmlFor="paymentDate">Payment Date *</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        className={errors.paymentDate ? 'border-red-500' : ''}
                        {...register('paymentDate')}
                      />
                      {errors.paymentDate && (
                        <p className="text-sm text-red-500 mt-1">{errors.paymentDate.message}</p>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any additional notes..."
                        rows={3}
                        {...register('notes')}
                      />
                    </div>

                    {/* Form Actions */}
                    <DialogFooter className="gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsPaymentDialogOpen(false);
                          setSelectedLoan(null);
                          reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || createPaymentMutation.isPending}
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        {isSubmitting || createPaymentMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Recording...
                          </>
                        ) : (
                          <>
                            <Receipt className="h-4 w-4 mr-2" />
                            Record Payment
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-xs sm:text-sm font-medium">Total Collected</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900">₹{stats.totalCollected.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-200 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-xs sm:text-sm font-medium">Overdue Loans</p>
                    <p className="text-2xl sm:text-3xl font-bold text-red-900">{stats.overdueLoans}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-200 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-xs sm:text-sm font-medium">Outstanding</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-900">₹{stats.totalOutstanding.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-xs sm:text-sm font-medium">Today's Payments</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900">{stats.paymentsToday}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Loans Section */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-base sm:text-lg">Active Loans - Payment Due</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-4 mb-4 sm:mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by loan ID or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {filteredLoans.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No active loans found</h3>
                  <p className="text-gray-500">All loans are either completed or there are no active loans</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                          <TableHead>Loan Number</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>EMI Amount</TableHead>
                          <TableHead>Outstanding</TableHead>
                          <TableHead>Maturity Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLoans.map((loan: any, index: number) => {
                          // FIXED: Check isOverdue flag from backend, not maturityDate
                          const isOverdue = loan.isOverdue || (loan.daysOverdue && loan.daysOverdue > 0);
                          const isCompleted = loan.status === 'COMPLETED' || Number(loan.outstandingBalance || 0) <= 0;
                          return (
                            <TableRow key={loan.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <TableCell className="font-mono font-semibold">{loan.loanNumber}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{loan.customerName || `${loan.customer?.firstName} ${loan.customer?.lastName}`}</div>
                                  <div className="text-sm text-gray-500">{loan.customer?.phone}</div>
                                </div>
                              </TableCell>
                              <TableCell className="font-semibold text-green-600">₹{Number(loan.emiAmount || 0).toLocaleString()}</TableCell>
                              <TableCell className="font-semibold">₹{Number(loan.outstandingBalance || loan.principalAmount || 0).toLocaleString()}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(loan.maturityDate).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={isCompleted ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
                                  {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Active'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => handleRecordPayment(loan)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Receipt className="h-4 w-4 mr-1" />
                                  Pay
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {filteredLoans.map((loan: any) => {
                      // FIXED: Check isOverdue flag from backend, not maturityDate
                      const isOverdue = loan.isOverdue || (loan.daysOverdue && loan.daysOverdue > 0);
                      const isCompleted = loan.status === 'COMPLETED' || Number(loan.outstandingBalance || 0) <= 0;
                      return (
                        <Card key={loan.id} className={`border-l-4 ${isCompleted ? 'border-l-gray-500' : isOverdue ? 'border-l-red-500' : 'border-l-green-500'}`}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono font-semibold text-sm">{loan.loanNumber}</span>
                                    <Badge variant={isCompleted ? 'default' : isOverdue ? 'destructive' : 'secondary'} className="text-xs">
                                      {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Active'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {loan.customerName || `${loan.customer?.firstName} ${loan.customer?.lastName}`}
                                  </p>
                                  {loan.customer?.phone && (
                                    <p className="text-xs text-gray-500">{loan.customer.phone}</p>
                                  )}
                                </div>
                              </div>

                              <div className="h-px bg-gray-200" />

                              {/* Amounts */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-green-50 p-2 rounded">
                                  <p className="text-xs text-gray-600 mb-0.5">EMI Amount</p>
                                  <p className="text-base font-semibold text-green-600">
                                    ₹{Number(loan.emiAmount || 0).toLocaleString()}
                                  </p>
                                </div>
                                <div className="bg-blue-50 p-2 rounded">
                                  <p className="text-xs text-gray-600 mb-0.5">Outstanding</p>
                                  <p className="text-base font-semibold text-blue-600">
                                    ₹{Number(loan.outstandingBalance || loan.principalAmount || 0).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {/* Maturity Date */}
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>Maturity: {new Date(loan.maturityDate).toLocaleDateString()}</span>
                              </div>

                              <div className="h-px bg-gray-200" />

                              {/* Action */}
                              <Button
                                size="sm"
                                onClick={() => handleRecordPayment(loan)}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                              >
                                <Receipt className="h-4 w-4 mr-1" />
                                Record Payment
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-base sm:text-lg">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              {!recentPayments || recentPayments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No payments recorded yet</h3>
                  <p className="text-gray-500">Payment history will appear here once payments are recorded</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-green-50 to-blue-50">
                          <TableHead>Payment ID</TableHead>
                          <TableHead>Loan Number</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentPayments.map((payment: any, index: number) => (
                          <TableRow key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <TableCell className="font-mono text-sm">{payment.receiptNumber || payment.id.slice(0, 8)}</TableCell>
                            <TableCell className="font-mono font-semibold">{payment.loan?.loanNumber || 'N/A'}</TableCell>
                            <TableCell>
                              {payment.loan?.customer ? 
                                `${payment.loan.customer.firstName} ${payment.loan.customer.lastName}` : 
                                'N/A'}
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">₹{Number(payment.amount).toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3" />
                                {new Date(payment.paymentDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {getPaymentMethodIcon(payment.paymentMethod)}
                                <span className="text-sm capitalize">{payment.paymentMethod?.replace('_', ' ')}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(payment.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {recentPayments.map((payment: any) => (
                      <Card key={payment.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-xs text-gray-500">
                                    #{payment.receiptNumber || payment.id.slice(0, 8)}
                                  </span>
                                  {getStatusBadge(payment.status)}
                                </div>
                                <p className="font-mono font-semibold text-sm">{payment.loan?.loanNumber || 'N/A'}</p>
                                <p className="text-sm text-gray-600">
                                  {payment.loan?.customer ? 
                                    `${payment.loan.customer.firstName} ${payment.loan.customer.lastName}` : 
                                    'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="h-px bg-gray-200" />

                            {/* Amount */}
                            <div className="bg-green-50 p-3 rounded">
                              <p className="text-xs text-gray-600 mb-0.5">Payment Amount</p>
                              <p className="text-xl font-bold text-green-600">
                                ₹{Number(payment.amount).toLocaleString()}
                              </p>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Date</p>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span className="font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Method</p>
                                <div className="flex items-center gap-1">
                                  {getPaymentMethodIcon(payment.paymentMethod)}
                                  <span className="font-medium capitalize">{payment.paymentMethod?.replace('_', ' ')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Repayments;
