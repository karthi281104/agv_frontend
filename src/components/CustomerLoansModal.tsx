import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Edit, 
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  History,
  Coins,
  IndianRupee,
  Eye,
  Wallet,
  Receipt,
  Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';

interface CustomerLoansModalProps {
  customer: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (customer: any) => void;
  onViewLoan?: (loan: any) => void;
}

const CustomerLoansModal: React.FC<CustomerLoansModalProps> = ({
  customer,
  isOpen,
  onClose,
  onEdit,
  onViewLoan
}) => {
  // Fetch customer loans
  const { data: customerLoansData, isLoading } = useQuery({
    queryKey: ['customer-loans', customer?.id],
    queryFn: async () => {
      const response: any = await apiClient.get(`/api/customers/${customer?.id}/loans`);
      return response.data;
    },
    enabled: !!customer?.id && isOpen
  });

  if (!customer) return null;

  const loansData = customerLoansData?.data;
  const summary = loansData?.summary || {
    totalLoans: 0,
    activeLoans: 0,
    pendingLoans: 0,
    completedLoans: 0,
    rejectedLoans: 0,
    totalDisbursed: 0,
    totalOutstanding: 0,
    totalPaid: 0
  };
  const loans = loansData?.loans || [];

  const formatCurrency = (amount: number) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; label: string }> = {
      ACTIVE: { className: 'bg-green-100 text-green-800', label: 'Active' },
      PENDING: { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      APPROVED: { className: 'bg-blue-100 text-blue-800', label: 'Approved' },
      COMPLETED: { className: 'bg-purple-100 text-purple-800', label: 'Completed' },
      REJECTED: { className: 'bg-red-100 text-red-800', label: 'Rejected' },
      CLOSED: { className: 'bg-gray-100 text-gray-800', label: 'Closed' }
    };

    const config = statusConfig[status] || { className: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl font-bold">
                {customer.firstName} {customer.lastName}
              </DialogTitle>
              <Badge variant="outline" className="text-sm">
                ID: {customer.id.slice(0, 8)}...
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(customer)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogDescription className="flex items-center gap-4 text-base">
            <span className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {customer.phone}
            </span>
            {customer.email && (
              <>
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {customer.email}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Loan Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-700">Total Loans</p>
                  <p className="text-2xl font-bold text-blue-900">{summary.totalLoans}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-700">Active Loans</p>
                  <p className="text-2xl font-bold text-green-900">{summary.activeLoans}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-purple-700">Disbursed</p>
                  <p className="text-lg font-bold text-purple-900">
                    {formatCurrency(summary.totalDisbursed)}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-orange-700">Outstanding</p>
                  <p className="text-lg font-bold text-orange-900">
                    {formatCurrency(summary.totalOutstanding)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="loans" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="loans">Loans ({summary.totalLoans})</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Loans Tab */}
          <TabsContent value="loans" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 animate-spin" />
                    <span className="text-gray-600">Loading loans...</span>
                  </div>
                </CardContent>
              </Card>
            ) : loans.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No loans found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This customer hasn't applied for any loans yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Loan History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Loan Number</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.map((loan: any) => {
                        const outstandingBalance = loan.outstandingBalance || loan.principalAmount;
                        const totalPaid = loan.totalAmountPaid || 0;
                        const paymentProgress = loan.principalAmount > 0 
                          ? (totalPaid / loan.principalAmount) * 100 
                          : 0;

                        return (
                          <TableRow key={loan.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-mono font-semibold text-sm">
                                  {loan.loanNumber}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {loan.tenure} months @ {loan.interestRate}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(loan.principalAmount)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-semibold text-orange-700">
                                  {formatCurrency(outstandingBalance)}
                                </span>
                                {loan.status === 'ACTIVE' && (
                                  <div className="mt-1">
                                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-green-500 h-1.5 rounded-full transition-all"
                                        style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-green-700">
                                {formatCurrency(totalPaid)}
                              </span>
                            </TableCell>
                            <TableCell>{getStatusBadge(loan.status)}</TableCell>
                            <TableCell>
                              <div className="flex flex-col text-sm">
                                <span className="text-gray-600">
                                  {formatDate(loan.createdAt)}
                                </span>
                                {loan.disbursedDate && (
                                  <span className="text-xs text-gray-500">
                                    Disbursed: {formatDate(loan.disbursedDate)}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewLoan && onViewLoan(loan)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Payment Summary for Active Loans */}
            {summary.activeLoans > 0 && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Receipt className="h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-green-700 mb-1">Total Paid</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(summary.totalPaid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-orange-700 mb-1">Total Outstanding</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {formatCurrency(summary.totalOutstanding)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 mb-1">Overall Progress</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all"
                              style={{ 
                                width: `${summary.totalDisbursed > 0 
                                  ? Math.min((summary.totalPaid / summary.totalDisbursed) * 100, 100)
                                  : 0}%` 
                              }}
                            />
                          </div>
                        </div>
                        <span className="font-bold text-purple-900 text-sm">
                          {summary.totalDisbursed > 0 
                            ? ((summary.totalPaid / summary.totalDisbursed) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Contact Info Tab */}
          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Phone className="h-5 w-5" />
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Primary Phone</label>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      {customer.phone}
                    </p>
                  </div>
                  {customer.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        {customer.email}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-red-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">{customer.address}</p>
                      <p className="text-sm text-gray-600">
                        {customer.city}, {customer.state}
                      </p>
                      <p className="text-sm text-gray-600">PIN: {customer.pincode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Identity Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Aadhar Number</label>
                    <p className="font-mono font-semibold text-gray-900 mt-1">
                      {customer.aadharNumber || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">PAN Number</label>
                    <p className="font-mono font-semibold text-gray-900 mt-1">
                      {customer.panNumber || 'Not provided'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Account Status</label>
                    <p className="mt-1">
                      <Badge className={customer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">KYC Status</label>
                    <p className="mt-1">
                      <Badge className={customer.kycVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {customer.kycVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Member Since</label>
                    <p className="font-medium text-gray-900 mt-1">
                      {formatDate(customer.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="font-medium text-gray-900 mt-1">
                      {formatDate(customer.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerLoansModal;
