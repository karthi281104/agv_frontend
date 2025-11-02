import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Fingerprint, 
  Calendar, 
  Edit, 
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  DollarSign,
  Eye,
  History
} from 'lucide-react';
import { Customer } from '@/types/customer';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (customer: Customer) => void;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!customer) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending_verification':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'pending_verification':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Verification</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVerificationStatus = (verified: boolean) => {
    return verified ? (
      <div className="flex items-center gap-1 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Verified</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-yellow-600">
        <Clock className="h-4 w-4" />
        <span className="text-sm">Pending</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto pr-14 sm:pr-16">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(customer.status)}
                <DialogTitle className="text-2xl font-bold">
                  {customer.personalInfo.fullName}
                </DialogTitle>
              </div>
              {getStatusBadge(customer.status)}
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
          <DialogDescription className="flex items-center gap-4 text-lg">
            <span className="font-medium">Customer ID: {customer.customerId}</span>
            <span className="text-gray-500">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {new Date(customer.createdAt).toLocaleDateString()}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Personal & Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="font-medium">{customer.personalInfo.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Father's Name</label>
                    <p className="font-medium">{customer.personalInfo.fatherName}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mother's Name</label>
                  <p className="font-medium">{customer.personalInfo.motherName}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Primary Mobile</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <p className="font-medium">{customer.contactInfo.primaryMobile}</p>
                    </div>
                  </div>
                  {customer.contactInfo.secondaryMobile && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Secondary Mobile</label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <p className="font-medium">{customer.contactInfo.secondaryMobile}</p>
                      </div>
                    </div>
                  )}
                </div>
                {customer.contactInfo.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email Address</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <p className="font-medium">{customer.contactInfo.email}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-red-500 mt-1" />
                    <div>
                      <p className="font-medium">{customer.contactInfo.address.street}</p>
                      <p className="text-sm text-gray-600">
                        {customer.contactInfo.address.city}, {customer.contactInfo.address.state} - {customer.contactInfo.address.pincode}
                      </p>
                      {customer.contactInfo.address.landmark && (
                        <p className="text-sm text-gray-500">Near: {customer.contactInfo.address.landmark}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Document Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aadhar Card */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-500">Aadhar Card</label>
                      {getVerificationStatus(customer.documents.aadhar.verified)}
                    </div>
                    <p className="font-medium font-mono">{customer.documents.aadhar.number}</p>
                    {customer.documents.aadhar.verified && customer.documents.aadhar.verifiedAt && (
                      <p className="text-xs text-gray-500">
                        Verified on {new Date(customer.documents.aadhar.verifiedAt).toLocaleDateString()}
                      </p>
                    )}
                    {customer.documents.aadhar.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={customer.documents.aadhar.imageUrl}
                          alt="Aadhar Card"
                          className="w-full max-w-xs rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  {/* PAN Card */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-500">PAN Card</label>
                      {getVerificationStatus(customer.documents.pan.verified)}
                    </div>
                    <p className="font-medium font-mono">{customer.documents.pan.number}</p>
                    {customer.documents.pan.verified && customer.documents.pan.verifiedAt && (
                      <p className="text-xs text-gray-500">
                        Verified on {new Date(customer.documents.pan.verifiedAt).toLocaleDateString()}
                      </p>
                    )}
                    {customer.documents.pan.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={customer.documents.pan.imageUrl}
                          alt="PAN Card"
                          className="w-full max-w-xs rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Biometric Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Biometric Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fingerprint */}
                  {customer.biometrics.fingerprint && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Fingerprint</label>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Captured</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Captured on {new Date(customer.biometrics.fingerprint.capturedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Photo */}
                  {customer.biometrics.photo && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Customer Photo</label>
                      <div className="mt-2">
                        <img
                          src={customer.biometrics.photo.imageUrl}
                          alt="Customer Photo"
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Taken on {new Date(customer.biometrics.photo.capturedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Loan Summary & Stats */}
          <div className="space-y-6">
            {/* Loan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Loan Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Active Loans</span>
                    <Badge variant="outline" className="font-bold">
                      {customer.loanSummary.activeLoans}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Disbursed</span>
                    <span className="font-bold text-green-600">
                      ₹{customer.loanSummary.totalDisbursed.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Outstanding</span>
                    <span className="font-bold text-orange-600">
                      ₹{customer.loanSummary.totalOutstanding.toLocaleString()}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Payment History</span>
                    <Badge 
                      className={
                        customer.loanSummary.paymentHistory === 'excellent' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : customer.loanSummary.paymentHistory === 'good'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                      }
                    >
                      {customer.loanSummary.paymentHistory}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Loan Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Create New Loan
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <History className="h-4 w-4 mr-2" />
                  Payment History
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created By</span>
                  <span className="font-medium">{customer.createdBy}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created On</span>
                  <span className="font-medium">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="font-medium">
                    {new Date(customer.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailModal;