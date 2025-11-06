import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CustomerLoansModal from "@/components/CustomerLoansModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Fingerprint,
  User,
  Phone,
  MapPin,
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
  Clock
} from "lucide-react";
import { useCustomers, useCreateCustomer, useCustomerStats, useExportCustomers, useUploadCustomerDocuments, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomers';
import { CustomerFormData, CustomerSearchFilters, Customer } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';
import SimpleParticleBackground from "@/components/SimpleParticleBackground";
import CustomerDetailModal from "@/components/CustomerDetailModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Form validation schema
const customerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  fatherName: z.string().min(2, "Father's name must be at least 2 characters"),
  motherName: z.string().min(2, "Mother's name must be at least 2 characters"),
  primaryMobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
  secondaryMobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number").optional().or(z.literal("")),
  email: z.string().email("Enter valid email address").optional().or(z.literal("")),
  street: z.string().min(10, "Please enter complete address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit pincode"),
  landmark: z.string().optional(),
  aadharNumber: z.string().regex(/^\d{4}\s?\d{4}\s?\d{4}$/, "Enter valid 12-digit Aadhar number"),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Enter valid PAN number (ABCDE1234F format)"),
  fingerprintData: z.string().optional(),
  aadharFile: z.any().optional(),
  panFile: z.any().optional(),
  photoFile: z.any().optional(),
});

type FormData = z.infer<typeof customerSchema>;

const Customers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [fingerprintData, setFingerprintData] = useState<string | null>(null);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [fingerprintStatus, setFingerprintStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [hasActiveLoans, setHasActiveLoans] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<'createdDesc'|'createdAsc'|'nameAsc'|'nameDesc'|'outstandingDesc'>('createdDesc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { toast } = useToast();

  // Build search filters
  const filters: CustomerSearchFilters = {
    search: debouncedSearch || undefined,
    status: selectedStatus === 'all' ? undefined : [selectedStatus as any],
    hasActiveLoans: hasActiveLoans || undefined,
  };

  // React Query hooks
  const { data: customersData, isLoading, error, refetch: refetchCustomers } = useCustomers(filters, currentPage, pageSize) as any;
  const { data: stats, refetch: refetchStats } = useCustomerStats() as any;
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();
  const exportCustomersMutation = useExportCustomers();
  const uploadDocumentsMutation = useUploadCustomerDocuments();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(customerSchema),
    mode: "onChange",
  });

  // Debounce search term
  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([refetchCustomers(), refetchStats?.()]);
      toast({ title: 'Refreshed', description: 'Customers and stats updated.' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setHasActiveLoans(false);
    setCurrentPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const bulkUpdate = async (updates: Partial<FormData> & { kycVerified?: boolean; isActive?: boolean }) => {
    if (!customersData) return;
    const targets = customersData.customers.filter((c: any) => selectedIds.has(c.id));
    if (targets.length === 0) return;
    try {
      setIsRefreshing(true);
      await Promise.allSettled(targets.map((c: any) => updateCustomerMutation.mutateAsync({ id: c.id, formData: updates as any })));
      toast({ title: 'Bulk action completed', description: `${targets.length} customer(s) updated.` });
      clearSelection();
      await refetchCustomers();
      await refetchStats?.();
    } finally {
      setIsRefreshing(false);
    }
  };

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
    setValue("aadharNumber", formatted);
  };

  const scanFingerprint = async () => {
    setFingerprintStatus('scanning');
    
    try {
      if (!('usb' in navigator)) {
        throw new Error('WebUSB is not supported in this browser');
      }

      const device = await (navigator as any).usb.requestDevice({
        filters: [
          { vendorId: 0x1234 }, // Replace with actual fingerprint scanner vendor ID
        ]
      });

      await device.open();
      
      // Simulate fingerprint capture
      setTimeout(() => {
        const mockFingerprintData = `FP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setFingerprintData(mockFingerprintData);
        setValue("fingerprintData", mockFingerprintData);
        setFingerprintStatus('success');
        toast({
          title: "Fingerprint Captured",
          description: "Fingerprint has been successfully captured and stored.",
        });
      }, 3000);

    } catch (error) {
      console.error('Fingerprint scan failed:', error);
      setFingerprintStatus('error');
      toast({
        title: "Fingerprint Scan Failed",
        description: "Could not connect to fingerprint scanner. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (file: File, type: 'aadhar' | 'pan' | 'photo') => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    switch (type) {
      case 'aadhar':
        setAadharFile(file);
        break;
      case 'pan':
        setPanFile(file);
        break;
      case 'photo':
        setPhotoFile(file);
        break;
    }

    toast({
      title: "File Selected",
      description: `${file.name} has been selected for upload.`,
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      const customerData = {
        ...data,
        fingerprintData: fingerprintData || undefined,
      } as CustomerFormData;

      const newCustomer = await createCustomerMutation.mutateAsync(customerData);

      // Upload documents if files are selected
      if (aadharFile || panFile || photoFile) {
        await uploadDocumentsMutation.mutateAsync({
          customerId: newCustomer.id,
          files: {
            aadhar: aadharFile || undefined,
            pan: panFile || undefined,
            photo: photoFile || undefined,
          },
        });
      }

      toast({
        title: "Customer Added Successfully",
        description: `${data.fullName} has been added to the system with ID: ${newCustomer.customerId}`,
      });

      // Reset form and close dialog
      reset();
      setFingerprintData(null);
      setAadharFile(null);
      setPanFile(null);
      setPhotoFile(null);
      setFingerprintStatus('idle');
      setIsAddDialogOpen(false);

    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error Adding Customer",
        description: "There was an error adding the customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    exportCustomersMutation.mutate({ format: 'csv', filters }, {
      onSuccess: () => {
        toast({
          title: "Export Successful",
          description: "Customer data has been exported to a CSV file.",
        });
      },
      onError: (err: any) => {
        toast({
          title: "Export Failed",
          description: (err?.message as string) || "There was an error exporting customer data.",
          variant: "destructive",
        });
      },
    });
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    // Pre-fill the form with customer data
    setValue("fullName", customer.personalInfo.fullName);
    setValue("fatherName", customer.personalInfo.fatherName);
    setValue("motherName", customer.personalInfo.motherName);
    setValue("primaryMobile", customer.contactInfo.primaryMobile);
    setValue("secondaryMobile", customer.contactInfo.secondaryMobile || "");
    setValue("email", customer.contactInfo.email || "");
    setValue("street", customer.contactInfo.address.street);
    setValue("city", customer.contactInfo.address.city);
    setValue("state", customer.contactInfo.address.state);
    setValue("pincode", customer.contactInfo.address.pincode);
    setValue("landmark", customer.contactInfo.address.landmark || "");
    setValue("aadharNumber", customer.documents.aadhar?.number || "");
    setValue("panNumber", customer.documents.pan?.number || "");
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;

    try {
      await deleteCustomerMutation.mutateAsync(selectedCustomer.id);
      toast({
        title: "Customer Deleted",
        description: `${selectedCustomer.personalInfo.fullName} has been removed from the system.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Could not delete customer. They may have active loans.",
        variant: "destructive",
      });
    }
  };

  const onUpdate = async (data: FormData) => {
    if (!selectedCustomer) return;

    try {
      const customerData = {
        ...data,
        fingerprintData: fingerprintData || undefined,
      } as CustomerFormData;

      await updateCustomerMutation.mutateAsync({
        id: selectedCustomer.id,
        formData: customerData,
      });

      // Upload documents if files are selected
      if (aadharFile || panFile || photoFile) {
        await uploadDocumentsMutation.mutateAsync({
          customerId: selectedCustomer.id,
          files: {
            aadhar: aadharFile || undefined,
            pan: panFile || undefined,
            photo: photoFile || undefined,
          },
        });
      }

      toast({
        title: "Customer Updated Successfully",
        description: `${data.fullName}'s information has been updated.`,
      });

      // Reset form and close dialog
      reset();
      setFingerprintData(null);
      setAadharFile(null);
      setPanFile(null);
      setPhotoFile(null);
      setFingerprintStatus('idle');
      setIsEditDialogOpen(false);
      setSelectedCustomer(null);

    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Error Updating Customer",
        description: "There was an error updating the customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'pending_verification':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading customers. Please try again later.
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
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Customer Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2">Manage your customer database with advanced features</p>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button
                  onClick={handleExport}
                  disabled={exportCustomersMutation.isPending}
                  variant="outline"
                  className="flex items-center gap-2 flex-1 sm:flex-initial"
                >
                  {exportCustomersMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="flex items-center gap-2 flex-1 sm:flex-initial"
                  disabled={isRefreshing}
                >
                  {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Loader2 className="h-4 w-4" />}
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1 sm:flex-initial">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add Customer</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
                        <User className="h-4 w-4 md:h-5 md:w-5" />
                        Add New Customer
                      </DialogTitle>
                      <DialogDescription className="text-xs md:text-sm">
                        Fill in the customer details below. All fields marked with * are required.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Personal Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                            <User className="h-4 w-4" />
                            Personal Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="fullName" className="text-xs md:text-sm">Full Name *</Label>
                              <Input
                                id="fullName"
                                placeholder="Enter full name"
                                className={errors.fullName ? "border-red-500" : ""}
                                {...register("fullName")}
                              />
                              {errors.fullName && (
                                <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="fatherName" className="text-xs md:text-sm">Father's Name *</Label>
                              <Input
                                id="fatherName"
                                placeholder="Enter father's name"
                                className={errors.fatherName ? "border-red-500" : ""}
                                {...register("fatherName")}
                              />
                              {errors.fatherName && (
                                <p className="text-xs text-red-500 mt-1">{errors.fatherName.message}</p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="motherName" className="text-xs md:text-sm">Mother's Name *</Label>
                            <Input
                              id="motherName"
                              placeholder="Enter mother's name"
                              className={errors.motherName ? "border-red-500" : ""}
                              {...register("motherName")}
                            />
                            {errors.motherName && (
                              <p className="text-xs text-red-500 mt-1">{errors.motherName.message}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Contact Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                            <Phone className="h-4 w-4" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="primaryMobile">Primary Mobile *</Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                  id="primaryMobile"
                                  placeholder="9876543210"
                                  className={`pl-10 ${errors.primaryMobile ? "border-red-500" : ""}`}
                                  {...register("primaryMobile")}
                                />
                              </div>
                              {errors.primaryMobile && (
                                <p className="text-sm text-red-500 mt-1">{errors.primaryMobile.message}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="secondaryMobile">Secondary Mobile</Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                  id="secondaryMobile"
                                  placeholder="9876543210 (Optional)"
                                  className={`pl-10 ${errors.secondaryMobile ? "border-red-500" : ""}`}
                                  {...register("secondaryMobile")}
                                />
                              </div>
                              {errors.secondaryMobile && (
                                <p className="text-sm text-red-500 mt-1">{errors.secondaryMobile.message}</p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="customer@example.com (Optional)"
                                className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                                {...register("email")}
                              />
                            </div>
                            {errors.email && (
                              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Address Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <MapPin className="h-4 w-4" />
                            Address Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="street">Street Address *</Label>
                            <Textarea
                              id="street"
                              placeholder="Enter complete street address"
                              className={`min-h-[80px] ${errors.street ? "border-red-500" : ""}`}
                              {...register("street")}
                            />
                            {errors.street && (
                              <p className="text-sm text-red-500 mt-1">{errors.street.message}</p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="city" className="text-xs md:text-sm">City *</Label>
                              <Input
                                id="city"
                                placeholder="Enter city"
                                className={errors.city ? "border-red-500" : ""}
                                {...register("city")}
                              />
                              {errors.city && (
                                <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="state" className="text-xs md:text-sm">State *</Label>
                              <Input
                                id="state"
                                placeholder="Enter state"
                                className={errors.state ? "border-red-500" : ""}
                                {...register("state")}
                              />
                              {errors.state && (
                                <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="pincode" className="text-xs md:text-sm">Pincode *</Label>
                              <Input
                                id="pincode"
                                placeholder="123456"
                                className={errors.pincode ? "border-red-500" : ""}
                                {...register("pincode")}
                              />
                              {errors.pincode && (
                                <p className="text-xs text-red-500 mt-1">{errors.pincode.message}</p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="landmark">Landmark</Label>
                            <Input
                              id="landmark"
                              placeholder="Enter nearby landmark (Optional)"
                              {...register("landmark")}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Document Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <CreditCard className="h-4 w-4" />
                            Document Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="aadharNumber">Aadhar Number *</Label>
                              <Input
                                id="aadharNumber"
                                placeholder="1234 5678 9012"
                                className={errors.aadharNumber ? "border-red-500" : ""}
                                {...register("aadharNumber")}
                                onChange={handleAadharChange}
                              />
                              {errors.aadharNumber && (
                                <p className="text-sm text-red-500 mt-1">{errors.aadharNumber.message}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="panNumber">PAN Number *</Label>
                              <Input
                                id="panNumber"
                                placeholder="ABCDE1234F"
                                className={`uppercase ${errors.panNumber ? "border-red-500" : ""}`}
                                {...register("panNumber")}
                                onChange={(e) => {
                                  e.target.value = e.target.value.toUpperCase();
                                  setValue("panNumber", e.target.value);
                                }}
                              />
                              {errors.panNumber && (
                                <p className="text-sm text-red-500 mt-1">{errors.panNumber.message}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Document Upload */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Upload className="h-4 w-4" />
                            Document Upload
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Aadhar Upload */}
                            <div>
                              <Label className="text-xs md:text-sm">Aadhar Photo</Label>
                              <div className="mt-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, 'aadhar');
                                  }}
                                  className="hidden"
                                  id="aadhar-upload"
                                />
                                <label
                                  htmlFor="aadhar-upload"
                                  className="flex flex-col items-center justify-center w-full h-28 md:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                >
                                  {aadharFile ? (
                                    <div className="flex flex-col items-center px-2">
                                      <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-500 mb-2" />
                                      <span className="text-xs md:text-sm font-medium text-green-700 text-center truncate w-full">
                                        {aadharFile.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <FileText className="h-6 w-6 md:h-8 md:w-8 text-gray-400 mb-2" />
                                      <span className="text-xs md:text-sm text-gray-500">Click to upload Aadhar</span>
                                    </div>
                                  )}
                                </label>
                              </div>
                            </div>

                            {/* PAN Upload */}
                            <div>
                              <Label>PAN Photo</Label>
                              <div className="mt-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, 'pan');
                                  }}
                                  className="hidden"
                                  id="pan-upload"
                                />
                                <label
                                  htmlFor="pan-upload"
                                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                >
                                  {panFile ? (
                                    <div className="flex flex-col items-center">
                                      <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                                      <span className="text-sm font-medium text-green-700">
                                        {panFile.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <FileText className="h-8 w-8 text-gray-400 mb-2" />
                                      <span className="text-sm text-gray-500">Click to upload PAN</span>
                                    </div>
                                  )}
                                </label>
                              </div>
                            </div>

                            {/* Photo Upload */}
                            <div>
                              <Label>Customer Photo</Label>
                              <div className="mt-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, 'photo');
                                  }}
                                  className="hidden"
                                  id="photo-upload"
                                />
                                <label
                                  htmlFor="photo-upload"
                                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                >
                                  {photoFile ? (
                                    <div className="flex flex-col items-center">
                                      <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                                      <span className="text-sm font-medium text-green-700">
                                        {photoFile.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <User className="h-8 w-8 text-gray-400 mb-2" />
                                      <span className="text-sm text-gray-500">Click to upload Photo</span>
                                    </div>
                                  )}
                                </label>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Biometric Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Fingerprint className="h-4 w-4" />
                            Biometric Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Fingerprint className="h-8 w-8 text-blue-500" />
                                <div>
                                  <h4 className="font-medium">Fingerprint Scanner</h4>
                                  <p className="text-sm text-gray-600">
                                    {fingerprintStatus === 'idle' && 'Click to scan fingerprint'}
                                    {fingerprintStatus === 'scanning' && 'Scanning... Please place finger on scanner'}
                                    {fingerprintStatus === 'success' && 'Fingerprint captured successfully'}
                                    {fingerprintStatus === 'error' && 'Scan failed. Please try again'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {fingerprintStatus === 'success' ? (
                                  <CheckCircle className="h-6 w-6 text-green-500" />
                                ) : fingerprintStatus === 'error' ? (
                                  <X className="h-6 w-6 text-red-500" />
                                ) : (
                                  <Button
                                    type="button"
                                    onClick={scanFingerprint}
                                    disabled={fingerprintStatus === 'scanning'}
                                    variant="outline"
                                    size="sm"
                                  >
                                    {fingerprintStatus === 'scanning' ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Fingerprint className="h-4 w-4" />
                                    )}
                                    {fingerprintStatus === 'scanning' ? 'Scanning...' : 'Scan'}
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {fingerprintStatus === 'error' && (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  Unable to connect to fingerprint scanner. Please ensure the device is connected and try again.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Form Actions */}
                      <div className="flex items-center justify-end gap-4 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || createCustomerMutation.isPending}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {isSubmitting || createCustomerMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Adding Customer...
                            </>
                          ) : (
                            'Add Customer'
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-xs md:text-sm">Total Customers</p>
                        <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats.total}</p>
                      </div>
                      <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-xs md:text-sm">Active Customers</p>
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
                        <p className="text-yellow-100 text-xs md:text-sm">Pending Verification</p>
                        <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats.pendingVerification}</p>
                      </div>
                      <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-xs md:text-sm">With Active Loans</p>
                        <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats.withActiveLoans}</p>
                      </div>
                      <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Search and Filter Section */}
          <Card className="mb-4 md:mb-6">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col gap-3">
                {/* Search Bar - Full Width */}
                <div className="w-full relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                
                {/* Filters Row - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending_verification">Pending Verification</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={(v:any)=>setSortBy(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdDesc">Newest First</SelectItem>
                      <SelectItem value="createdAsc">Oldest First</SelectItem>
                      <SelectItem value="nameAsc">Name A→Z</SelectItem>
                      <SelectItem value="nameDesc">Name Z→A</SelectItem>
                      <SelectItem value="outstandingDesc">Outstanding High→Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={String(pageSize)} onValueChange={(v:any)=>{ setPageSize(Number(v)); setCurrentPage(1); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant={hasActiveLoans ? 'default' : 'outline'}
                    onClick={() => setHasActiveLoans(v => !v)}
                    className="w-full text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">With Active Loans</span>
                    <span className="sm:hidden">Active Loans</span>
                  </Button>
                  
                  <Button onClick={handleResetFilters} variant="ghost" className="w-full">
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-lg md:text-xl">Customer List</span>
                {customersData && (
                  <span className="text-xs sm:text-sm font-normal text-gray-500">
                    Showing {customersData.customers.length} of {customersData.total} customers
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Loading customers...</span>
                </div>
              ) : customersData?.customers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No customers found</h3>
                  <p className="text-gray-500">
                    {searchTerm || selectedStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Start by adding your first customer'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  {selectedIds.size > 0 && (
                    <div className="mb-3 flex flex-wrap items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-600 font-medium">Selected: {selectedIds.size}</span>
                      <Button variant="outline" size="sm" onClick={() => bulkUpdate({ kycVerified: true } as any)} className="text-xs">
                        Verify KYC
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => bulkUpdate({ isActive: true } as any)} className="text-xs">
                        Activate
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => bulkUpdate({ isActive: false } as any)} className="text-xs">
                        Deactivate
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs">Clear</Button>
                    </div>
                  )}
                  <div className="hidden lg:block overflow-x-auto -mx-4 sm:-mx-6">
                    <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">
                              <input
                                type="checkbox"
                                onChange={(e)=>{
                                  const all = new Set<string>();
                                  customersData?.customers.forEach((c:any)=>all.add(c.id));
                                  setSelectedIds(e.target.checked ? all : new Set());
                                }}
                                checked={customersData?.customers?.length>0 && customersData?.customers?.every((c:any)=>selectedIds.has(c.id))}
                                aria-label="Select all"
                                className="rounded border-gray-300"
                              />
                            </TableHead>
                            <TableHead className="whitespace-nowrap">Customer ID</TableHead>
                            <TableHead className="whitespace-nowrap">Name</TableHead>
                            <TableHead className="whitespace-nowrap">Contact</TableHead>
                            <TableHead className="whitespace-nowrap">Location</TableHead>
                            <TableHead className="whitespace-nowrap">Status</TableHead>
                            <TableHead className="whitespace-nowrap">Active Loans</TableHead>
                            <TableHead className="whitespace-nowrap">Total Outstanding</TableHead>
                            <TableHead className="whitespace-nowrap">Created</TableHead>
                            <TableHead className="whitespace-nowrap">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {(customersData?.customers || []).slice().sort((a:any,b:any)=>{
                          if (sortBy === 'createdDesc') return new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime();
                          if (sortBy === 'createdAsc') return new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime();
                          if (sortBy === 'nameAsc') return a.personalInfo.fullName.localeCompare(b.personalInfo.fullName);
                          if (sortBy === 'nameDesc') return b.personalInfo.fullName.localeCompare(a.personalInfo.fullName);
                          if (sortBy === 'outstandingDesc') return (b.loanSummary.totalOutstanding||0)-(a.loanSummary.totalOutstanding||0);
                          return 0;
                        }).map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <input type="checkbox" checked={selectedIds.has(customer.id)} onChange={()=>toggleSelect(customer.id)} aria-label="Select row" />
                            </TableCell>
                            <TableCell className="font-medium">{customer.customerId}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{customer.personalInfo.fullName}</div>
                                {/* Removed unsupported father name from schema */}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {customer.contactInfo.primaryMobile}
                                </div>
                                {customer.contactInfo.email && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Mail className="h-3 w-3" />
                                    {customer.contactInfo.email}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-3 w-3" />
                                {customer.contactInfo.address.city}, {customer.contactInfo.address.state}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(customer.status)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className="cursor-pointer"
                                onClick={() => handleViewCustomer(customer)}
                                title="View active loans"
                              >
                                {customer.loanSummary.activeLoans}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              ₹{customer.loanSummary.totalOutstanding.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {new Date(customer.createdAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewCustomer(customer)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditCustomer(customer)}
                                  title="Edit Customer"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" title="More Options">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    {customer.status === 'pending_verification' && (
                                      <DropdownMenuItem
                                        onClick={async () => {
                                          try {
                                            await updateCustomerMutation.mutateAsync({ id: customer.id, formData: { kycVerified: true } as any });
                                            toast({ title: 'KYC Verified', description: `${customer.personalInfo.fullName} is now verified.` });
                                          } catch (e) {
                                            toast({ title: 'Verification failed', description: 'Could not verify KYC.', variant: 'destructive' });
                                          }
                                        }}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Verify KYC
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit Customer
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={async ()=>{
                                      try {
                                        const makeActive = customer.status === 'inactive';
                                        await updateCustomerMutation.mutateAsync({ id: customer.id, formData: { isActive: makeActive } as any });
                                        toast({ title: makeActive ? 'Activated' : 'Deactivated', description: customer.personalInfo.fullName });
                                      } catch {
                                        toast({ title: 'Update failed', description: 'Could not update status.', variant: 'destructive' });
                                      }
                                    }}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      {customer.status === 'inactive' ? 'Activate' : 'Deactivate'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        navigator.clipboard.writeText(customer.customerId);
                                        toast({
                                          title: "Copied!",
                                          description: "Customer ID copied to clipboard",
                                        });
                                      }}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      Copy Customer ID
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteClick(customer)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Customer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {customersData?.customers.map((customer) => (
                      <Card key={customer.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-base">{customer.personalInfo.fullName}</span>
                                  {getStatusBadge(customer.status)}
                                </div>
                                <p className="text-xs text-gray-500">ID: {customer.customerId}</p>
                                {/* Father name not stored; omit line */}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                    {customer.status === 'pending_verification' && (
                                      <DropdownMenuItem
                                        onClick={async () => {
                                          try {
                                            await updateCustomerMutation.mutateAsync({ id: customer.id, formData: { kycVerified: true } as any });
                                            toast({ title: 'KYC Verified', description: `${customer.personalInfo.fullName} is now verified.` });
                                          } catch (e) {
                                            toast({ title: 'Verification failed', description: 'Could not verify KYC.', variant: 'destructive' });
                                          }
                                        }}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Verify KYC
                                      </DropdownMenuItem>
                                    )}
                                  <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Customer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      navigator.clipboard.writeText(customer.customerId);
                                      toast({
                                        title: "Copied!",
                                        description: "Customer ID copied to clipboard",
                                      });
                                    }}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Copy Customer ID
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClick(customer)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Customer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <Separator />

                            {/* Contact Info */}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                <span>{customer.contactInfo.primaryMobile}</span>
                              </div>
                              {customer.contactInfo.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                                  <span className="truncate">{customer.contactInfo.email}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                <span>{customer.contactInfo.address.city}, {customer.contactInfo.address.state}</span>
                              </div>
                            </div>

                            <Separator />

                            {/* Loan Summary */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-blue-50 p-2 rounded">
                                <p className="text-xs text-gray-600 mb-0.5">Active Loans</p>
                                <p className="text-lg font-semibold text-blue-600">{customer.loanSummary.activeLoans}</p>
                              </div>
                              <div className="bg-green-50 p-2 rounded">
                                <p className="text-xs text-gray-600 mb-0.5">Outstanding</p>
                                <p className="text-lg font-semibold text-green-600">
                                  ₹{(customer.loanSummary.totalOutstanding / 1000).toFixed(0)}k
                                </p>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {new Date(customer.createdAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewCustomer(customer)}
                                  className="text-xs h-8"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditCustomer(customer)}
                                  className="text-xs h-8"
                                >
                                  <Pencil className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {/* Pagination */}
              {customersData && customersData.total > pageSize && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t">
                  <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                    Page {currentPage} of {Math.ceil(customersData.total / pageSize)}
                  </div>
                  <div className="flex items-center gap-2 order-1 sm:order-2 flex-wrap justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="text-xs"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="text-xs"
                    >
                      Previous
                    </Button>
                    <span className="text-xs sm:text-sm px-2">
                      {currentPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(customersData.total / pageSize), p + 1))}
                      disabled={currentPage >= Math.ceil(customersData.total / pageSize)}
                      className="text-xs"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.ceil(customersData.total / pageSize))}
                      disabled={currentPage >= Math.ceil(customersData.total / pageSize)}
                      className="text-xs"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customer Detail Modal with Loans */}
        <CustomerLoansModal
          customer={selectedCustomer}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedCustomer(null);
          }}
          onEdit={(customer) => {
            setIsViewModalOpen(false);
            handleEditCustomer(customer);
          }}
          onViewLoan={(loan) => {
            // Navigate to loans page or open loan modal
            toast({
              title: "Opening Loan Details",
              description: `Viewing loan ${loan.loanNumber}`,
            });
          }}
        />

        {/* Edit Customer Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
                <Pencil className="h-4 w-4 md:h-5 md:w-5" />
                Edit Customer - {selectedCustomer?.customerId}
              </DialogTitle>
              <DialogDescription className="text-xs md:text-sm">
                Update customer details below. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onUpdate)} className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-fullName" className="text-xs md:text-sm">Full Name *</Label>
                      <Input
                        id="edit-fullName"
                        placeholder="Enter full name"
                        className={errors.fullName ? "border-red-500" : ""}
                        {...register("fullName")}
                      />
                      {errors.fullName && (
                        <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-fatherName" className="text-xs md:text-sm">Father's Name *</Label>
                      <Input
                        id="edit-fatherName"
                        placeholder="Enter father's name"
                        className={errors.fatherName ? "border-red-500" : ""}
                        {...register("fatherName")}
                      />
                      {errors.fatherName && (
                        <p className="text-xs text-red-500 mt-1">{errors.fatherName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-motherName" className="text-xs md:text-sm">Mother's Name *</Label>
                    <Input
                      id="edit-motherName"
                      placeholder="Enter mother's name"
                      className={errors.motherName ? "border-red-500" : ""}
                      {...register("motherName")}
                    />
                    {errors.motherName && (
                      <p className="text-xs text-red-500 mt-1">{errors.motherName.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Phone className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-primaryMobile">Primary Mobile *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="edit-primaryMobile"
                          placeholder="9876543210"
                          className={`pl-10 ${errors.primaryMobile ? "border-red-500" : ""}`}
                          {...register("primaryMobile")}
                        />
                      </div>
                      {errors.primaryMobile && (
                        <p className="text-sm text-red-500 mt-1">{errors.primaryMobile.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-secondaryMobile">Secondary Mobile</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="edit-secondaryMobile"
                          placeholder="9876543210 (Optional)"
                          className={`pl-10 ${errors.secondaryMobile ? "border-red-500" : ""}`}
                          {...register("secondaryMobile")}
                        />
                      </div>
                      {errors.secondaryMobile && (
                        <p className="text-sm text-red-500 mt-1">{errors.secondaryMobile.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="edit-email"
                        type="email"
                        placeholder="customer@example.com (Optional)"
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-4 w-4" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="edit-street">Street Address *</Label>
                    <Textarea
                      id="edit-street"
                      placeholder="Enter complete street address"
                      className={`min-h-[80px] ${errors.street ? "border-red-500" : ""}`}
                      {...register("street")}
                    />
                    {errors.street && (
                      <p className="text-sm text-red-500 mt-1">{errors.street.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-city">City *</Label>
                      <Input
                        id="edit-city"
                        placeholder="Enter city"
                        className={errors.city ? "border-red-500" : ""}
                        {...register("city")}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-state">State *</Label>
                      <Input
                        id="edit-state"
                        placeholder="Enter state"
                        className={errors.state ? "border-red-500" : ""}
                        {...register("state")}
                      />
                      {errors.state && (
                        <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-pincode">Pincode *</Label>
                      <Input
                        id="edit-pincode"
                        placeholder="123456"
                        className={errors.pincode ? "border-red-500" : ""}
                        {...register("pincode")}
                      />
                      {errors.pincode && (
                        <p className="text-sm text-red-500 mt-1">{errors.pincode.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-landmark">Landmark</Label>
                    <Input
                      id="edit-landmark"
                      placeholder="Enter nearby landmark (Optional)"
                      {...register("landmark")}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Document Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-4 w-4" />
                    Document Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-aadharNumber">Aadhar Number *</Label>
                      <Input
                        id="edit-aadharNumber"
                        placeholder="1234 5678 9012"
                        className={errors.aadharNumber ? "border-red-500" : ""}
                        {...register("aadharNumber")}
                        onChange={handleAadharChange}
                      />
                      {errors.aadharNumber && (
                        <p className="text-sm text-red-500 mt-1">{errors.aadharNumber.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-panNumber">PAN Number *</Label>
                      <Input
                        id="edit-panNumber"
                        placeholder="ABCDE1234F"
                        className={`uppercase ${errors.panNumber ? "border-red-500" : ""}`}
                        {...register("panNumber")}
                        onChange={(e) => {
                          e.target.value = e.target.value.toUpperCase();
                          setValue("panNumber", e.target.value);
                        }}
                      />
                      {errors.panNumber && (
                        <p className="text-sm text-red-500 mt-1">{errors.panNumber.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedCustomer(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || updateCustomerMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting || updateCustomerMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating Customer...
                    </>
                  ) : (
                    'Update Customer'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete{" "}
                <span className="font-semibold">{selectedCustomer?.personalInfo.fullName}</span>{" "}
                (Customer ID: {selectedCustomer?.customerId}) and all associated data from the system.
                {selectedCustomer?.loanSummary.activeLoans && selectedCustomer.loanSummary.activeLoans > 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <strong className="text-red-700">Warning:</strong> This customer has{" "}
                    {selectedCustomer.loanSummary.activeLoans} active loan(s). Deleting may not be possible.
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedCustomer(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteCustomerMutation.isPending}
              >
                {deleteCustomerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Customer'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Customers;