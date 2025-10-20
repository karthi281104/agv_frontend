import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CreditCard,
  Users,
  IndianRupee,
  Coins,
  Calendar,
  Weight,
  FileText,
  Download,
  Phone,
  Mail,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  Banknote,
  Wallet,
  TrendingUp,
  Activity,
  Settings
} from 'lucide-react';
import { GoldItemManager } from './GoldItemManager';

interface LoanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
  payments: any[];
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  onDownload: () => void;
  onPrint: () => void;
}

export const LoanDetailsModal: React.FC<LoanDetailsModalProps> = ({
  isOpen,
  onClose,
  loan,
  payments = [],
  formatCurrency,
  formatDate,
  onDownload,
  onPrint
}) => {
  const [showGoldManager, setShowGoldManager] = useState(false);
  
  if (!loan) return null;

  // Calculate payment statistics
  const totalPaid = payments
    ?.filter((p: any) => p.status === 'COMPLETED')
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
  
  const outstandingBalance = Number(loan.principalAmount) - totalPaid;
  const paymentProgress = (totalPaid / Number(loan.principalAmount)) * 100;

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'upi': return <Receipt className="h-4 w-4" />;
      case 'bank_transfer': case 'bank transfer': return <Wallet className="h-4 w-4" />;
      default: return <IndianRupee className="h-4 w-4" />;
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CreditCard className="h-6 w-6 text-blue-600" />
            Loan Details - {loan.loanNumber}
          </DialogTitle>
          <DialogDescription>
            Complete loan information, payment history, and documentation
          </DialogDescription>
        </DialogHeader>

        {/* Status Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {loan.customerName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Created: {formatDate(loan.createdAt)}
                </p>
              </div>
              <Badge 
                className={`text-lg px-4 py-2 ${
                  loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  loan.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                  loan.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                  'bg-red-100 text-red-800'
                }`}
              >
                {loan.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="gold">Gold Items</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Payment Progress */}
            {loan.status === 'ACTIVE' && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-gray-700">Payment Progress</Label>
                      <span className="font-bold text-green-700">{paymentProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Paid</p>
                        <p className="font-bold text-green-700">{formatCurrency(totalPaid)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Outstanding</p>
                        <p className="font-bold text-orange-700">{formatCurrency(outstandingBalance)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Payments Made</p>
                        <p className="font-bold text-blue-700">{payments?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Information */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5 text-purple-600" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <Label className="text-gray-600">Name</Label>
                    <p className="font-semibold text-gray-900">{loan.customerName}</p>
                  </div>
                  {loan.customer?.phone && (
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {loan.customer.phone}
                      </p>
                    </div>
                  )}
                  {loan.customer?.email && (
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {loan.customer.email}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Loan Amount Details */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IndianRupee className="h-5 w-5 text-green-600" />
                    Loan Amount Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-600">Principal Amount</Label>
                    <p className="font-bold text-xl text-green-700">
                      {formatCurrency(loan.principalAmount)}
                    </p>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-600">Interest Rate</Label>
                    <p className="font-semibold text-gray-900">{loan.interestRate}% p.a.</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-600">Tenure</Label>
                    <p className="font-semibold text-gray-900">{loan.tenure} months</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-600">EMI Amount</Label>
                    <p className="font-semibold text-blue-700">
                      {formatCurrency(loan.emiAmount)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Gold Details */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Coins className="h-5 w-5 text-yellow-600" />
                    Gold Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-600">Total Weight</Label>
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      <Weight className="h-4 w-4" />
                      {loan.goldWeight?.toFixed(2) || 0} grams
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-600">Gold Value</Label>
                    <p className="font-semibold text-yellow-700">
                      {formatCurrency(loan.goldValue || 0)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-600">Number of Items</Label>
                    <p className="font-semibold text-gray-900">
                      {loan.goldItems?.length || 0} items
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Important Dates */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-600">Application Date</Label>
                    <p className="font-semibold text-gray-900">
                      {formatDate(loan.createdAt)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-600">Disbursement Date</Label>
                    <p className="font-semibold text-gray-900">
                      {loan.disbursedDate ? formatDate(loan.disbursedDate) : 'Not disbursed'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-600">Maturity Date</Label>
                    <p className="font-semibold text-gray-900">
                      {loan.dueDate ? formatDate(loan.dueDate) : 'Not set'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  Payment History ({payments?.length || 0} transactions)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!payments || payments.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No payments recorded yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Receipt</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment: any, index: number) => (
                          <TableRow key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                {formatDate(payment.paymentDate)}
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-green-700">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getPaymentMethodIcon(payment.paymentMethod)}
                                <span className="capitalize">{payment.paymentMethod?.replace('_', ' ')}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {payment.paymentType?.replace('_', ' ')}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                {payment.status === 'COMPLETED' ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-xs text-gray-600">
                                {payment.receiptNumber || 'N/A'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gold Items Tab */}
          <TabsContent value="gold" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-600" />
                    Gold Items Details ({loan.goldItems?.length || 0} items)
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowGoldManager(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Gold Items
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!loan.goldItems || loan.goldItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No gold items pledged</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loan.goldItems.map((item: any, index: number) => (
                      <Card key={item.id || index} className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-gray-900">{item.itemType}</h4>
                            <Badge variant="outline" className="bg-yellow-100">
                              Item #{index + 1}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Weight:</span>
                              <span className="font-semibold">{item.weight}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Purity:</span>
                              <span className="font-semibold">{item.purity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rate/gram:</span>
                              <span className="font-semibold">₹{item.currentRate}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Value:</span>
                              <span className="font-bold text-yellow-700">
                                ₹{(item.weight * item.currentRate).toLocaleString()}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-gray-600 mt-2 italic">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Loan Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Application */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="w-0.5 h-16 bg-blue-200"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Loan Application</h4>
                      <p className="text-sm text-gray-600">{formatDate(loan.createdAt)}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Loan application created for {formatCurrency(loan.principalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Approval */}
                  {loan.status !== 'PENDING' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        {loan.status !== 'APPROVED' && <div className="w-0.5 h-16 bg-green-200"></div>}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Loan Approved</h4>
                        <p className="text-sm text-gray-600">
                          {loan.approvalDate ? formatDate(loan.approvalDate) : 'Date not available'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Loan approved for processing
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Disbursement */}
                  {loan.status === 'ACTIVE' || loan.status === 'COMPLETED' ? (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        {loan.status !== 'COMPLETED' && <div className="w-0.5 h-16 bg-purple-200"></div>}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Loan Disbursed</h4>
                        <p className="text-sm text-gray-600">
                          {loan.disbursedDate ? formatDate(loan.disbursedDate) : 'Date not available'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Amount disbursed to customer
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Completion */}
                  {loan.status === 'COMPLETED' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Loan Completed</h4>
                        <p className="text-sm text-gray-600">{formatDate(loan.updatedAt)}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          All payments completed successfully
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Agreement
          </Button>
          <Button
            variant="outline"
            onClick={onPrint}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Print Details
          </Button>
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Gold Item Manager Dialog */}
    {isOpen && (
      <GoldItemManager 
        loanId={loan.id}
        loanStatus={loan.status}
        open={showGoldManager}
        onOpenChange={setShowGoldManager}
      />
    )}
    </>
  );
};
