import React, { useState } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Trash2,
  Image as ImageIcon,
  File,
  AlertCircle,
  Fingerprint,
  CreditCard,
  User
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { useToast } from '@/hooks/use-toast';

interface DocumentViewerProps {
  customerId?: string;
  loanId?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  status: string;
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  description?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  customerId,
  loanId,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  // Fetch documents
  const { data: documentsData, isLoading } = useQuery({
    queryKey: customerId ? ['customer-documents', customerId] : ['loan-documents', loanId],
    queryFn: async () => {
      const endpoint = customerId 
        ? `/api/documents/customer/${customerId}`
        : `/api/documents/loan/${loanId}`;
      const response: any = await apiClient.get(endpoint);
      return response.data.data;
    },
    enabled: (!!customerId || !!loanId) && isOpen
  });

  // Verify document mutation
  const verifyDocMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const response: any = await apiClient.put(`/api/documents/${id}/verify`, {
        status,
        rejectionReason: reason
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerId ? ['customer-documents'] : ['loan-documents'] });
      toast({
        title: "Document Status Updated",
        description: "The document verification status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update document status",
        variant: "destructive"
      });
    }
  });

  // Delete document mutation
  const deleteDocMutation = useMutation({
    mutationFn: async (id: string) => {
      const response: any = await apiClient.delete(`/api/documents/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerId ? ['customer-documents'] : ['loan-documents'] });
      toast({
        title: "Document Deleted",
        description: "The document has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setDocToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || "Failed to delete document",
        variant: "destructive"
      });
    }
  });

  const documents = documentsData?.documents || [];
  const grouped = documentsData?.grouped || {};

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentIcon = (docType: string) => {
    switch (docType) {
      case 'CUSTOMER_PHOTO':
      case 'SURETY_PHOTO':
      case 'GOLD_PHOTO':
        return <User className="h-5 w-5 text-blue-600" />;
      case 'AADHAR_CARD':
      case 'SURETY_AADHAR':
        return <CreditCard className="h-5 w-5 text-orange-600" />;
      case 'PAN_CARD':
      case 'SURETY_PAN':
        return <CreditCard className="h-5 w-5 text-purple-600" />;
      case 'FINGERPRINT':
        return <Fingerprint className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; icon: any; label: string }> = {
      VERIFIED: { 
        className: 'bg-green-100 text-green-800', 
        icon: <CheckCircle className="h-3 w-3" />,
        label: 'Verified'
      },
      PENDING_VERIFICATION: { 
        className: 'bg-yellow-100 text-yellow-800', 
        icon: <Clock className="h-3 w-3" />,
        label: 'Pending'
      },
      REJECTED: { 
        className: 'bg-red-100 text-red-800', 
        icon: <XCircle className="h-3 w-3" />,
        label: 'Rejected'
      },
      EXPIRED: { 
        className: 'bg-gray-100 text-gray-800', 
        icon: <AlertCircle className="h-3 w-3" />,
        label: 'Expired'
      }
    };

    const { className, icon, label } = config[status] || config.PENDING_VERIFICATION;
    return (
      <Badge className={`${className} flex items-center gap-1`}>
        {icon}
        {label}
      </Badge>
    );
  };

  const handleDownload = (doc: Document) => {
    window.open(`${doc.fileUrl}?download=true`, '_blank');
  };

  const handleView = (doc: Document) => {
    if (doc.mimeType.startsWith('image/')) {
      setSelectedDoc(doc);
      setIsImageViewerOpen(true);
    } else {
      window.open(doc.fileUrl, '_blank');
    }
  };

  const handleVerify = (doc: Document) => {
    verifyDocMutation.mutate({ id: doc.id, status: 'VERIFIED' });
  };

  const handleReject = (doc: Document) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      verifyDocMutation.mutate({ id: doc.id, status: 'REJECTED', reason });
    }
  };

  const handleDelete = (doc: Document) => {
    setDocToDelete(doc);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (docToDelete) {
      deleteDocMutation.mutate(docToDelete.id);
    }
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-6 w-6 text-blue-600" />
              Document Management
            </DialogTitle>
            <DialogDescription>
              View, verify, and manage uploaded documents
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-5 w-5 animate-spin" />
                  <span className="text-gray-600">Loading documents...</span>
                </div>
              </CardContent>
            </Card>
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No documents found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Upload documents to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-700">Total Documents</p>
                        <p className="text-2xl font-bold text-blue-900">{documents.length}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-700">Verified</p>
                        <p className="text-2xl font-bold text-green-900">
                          {documents.filter((d: Document) => d.status === 'VERIFIED').length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-yellow-700">Pending</p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {documents.filter((d: Document) => d.status === 'PENDING_VERIFICATION').length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-red-700">Rejected</p>
                        <p className="text-2xl font-bold text-red-900">
                          {documents.filter((d: Document) => d.status === 'REJECTED').length}
                        </p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Documents Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Type</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc: Document) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getDocumentIcon(doc.documentType)}
                              <span className="text-sm font-medium">
                                {getDocumentTypeLabel(doc.documentType)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{doc.originalName}</span>
                              {doc.description && (
                                <span className="text-xs text-gray-500">{doc.description}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatFileSize(doc.fileSize)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(doc.status)}
                            {doc.status === 'REJECTED' && doc.rejectionReason && (
                              <p className="text-xs text-red-600 mt-1">{doc.rejectionReason}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(doc.uploadedAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(doc)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(doc)}
                                className="flex items-center gap-1"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {doc.status === 'PENDING_VERIFICATION' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleVerify(doc)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReject(doc)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(doc)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.originalName}</DialogTitle>
            <DialogDescription>
              {selectedDoc && getDocumentTypeLabel(selectedDoc.documentType)}
            </DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="flex justify-center p-4">
              <img 
                src={selectedDoc.fileUrl} 
                alt={selectedDoc.originalName}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{docToDelete?.originalName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentViewer;
