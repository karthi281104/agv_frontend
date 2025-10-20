import { useState } from 'react';
import { Loader2, Plus, Edit, Trash2, CheckCircle, XCircle, Package, Scale } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  useGoldItemsByLoan, 
  useCreateGoldItem, 
  useUpdateGoldItem,
  useReleaseGoldItem,
  useReleaseAllGoldItems,
  useDeleteGoldItem 
} from '../hooks/useGoldItems';
import { GoldItem, CreateGoldItemData, UpdateGoldItemData } from '../services/goldItemService';

interface GoldItemManagerProps {
  loanId: string;
  loanStatus: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoldItemManager({ loanId, loanStatus, open, onOpenChange }: GoldItemManagerProps) {
  const { data: goldItemsResponse, isLoading } = useGoldItemsByLoan(loanId, open);
  const createMutation = useCreateGoldItem();
  const updateMutation = useUpdateGoldItem();
  const releaseMutation = useReleaseGoldItem();
  const releaseAllMutation = useReleaseAllGoldItems();
  const deleteMutation = useDeleteGoldItem();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [showReleaseAllDialog, setShowReleaseAllDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GoldItem | null>(null);

  const [formData, setFormData] = useState<CreateGoldItemData>({
    loanId,
    itemType: '',
    weight: 0,
    purity: '',
    currentRate: 0,
    description: '',
  });

  const [releaseData, setReleaseData] = useState({
    releasedToName: '',
    releasedToPhone: '',
    releaseNotes: '',
  });

  const goldItems = goldItemsResponse?.data?.items || [];
  const summary = goldItemsResponse?.data?.summary;

  const resetForm = () => {
    setFormData({
      loanId,
      itemType: '',
      weight: 0,
      purity: '',
      currentRate: 0,
      description: '',
    });
  };

  const resetReleaseForm = () => {
    setReleaseData({
      releasedToName: '',
      releasedToPhone: '',
      releaseNotes: '',
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (item: GoldItem) => {
    setSelectedItem(item);
    setFormData({
      loanId: item.loanId,
      itemType: item.itemType,
      weight: item.weight,
      purity: item.purity,
      currentRate: item.currentRate,
      description: item.description || '',
    });
    setShowEditDialog(true);
  };

  const handleRelease = (item: GoldItem) => {
    setSelectedItem(item);
    resetReleaseForm();
    setShowReleaseDialog(true);
  };

  const handleReleaseAll = () => {
    resetReleaseForm();
    setShowReleaseAllDialog(true);
  };

  const handleDelete = (item: GoldItem) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    setShowAddDialog(false);
    resetForm();
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const updateData: UpdateGoldItemData = {
      itemType: formData.itemType,
      weight: formData.weight,
      purity: formData.purity,
      currentRate: formData.currentRate,
      description: formData.description,
    };

    await updateMutation.mutateAsync({ id: selectedItem.id, data: updateData });
    setShowEditDialog(false);
    setSelectedItem(null);
  };

  const handleSubmitRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    await releaseMutation.mutateAsync({
      id: selectedItem.id,
      data: releaseData,
    });
    setShowReleaseDialog(false);
    setSelectedItem(null);
  };

  const handleSubmitReleaseAll = async (e: React.FormEvent) => {
    e.preventDefault();
    await releaseAllMutation.mutateAsync({
      loanId,
      data: releaseData,
    });
    setShowReleaseAllDialog(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    await deleteMutation.mutateAsync(selectedItem.id);
    setShowDeleteDialog(false);
    setSelectedItem(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PLEDGED: { variant: 'default' as const, label: 'Pledged', className: 'bg-blue-100 text-blue-800' },
      RELEASED: { variant: 'default' as const, label: 'Released', className: 'bg-green-100 text-green-800' },
      AUCTIONED: { variant: 'default' as const, label: 'Auctioned', className: 'bg-orange-100 text-orange-800' },
      LOST: { variant: 'destructive' as const, label: 'Lost', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PLEDGED;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const canRelease = loanStatus === 'COMPLETED';
  const canEdit = loanStatus === 'PENDING';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gold Items Management
            </DialogTitle>
            <DialogDescription>
              Manage gold items pledged for this loan
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary.totalItems}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Weight
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary.totalWeight.toFixed(2)}g</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Value
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{summary.totalValue.toLocaleString()}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{summary.releasedItems} Released</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <XCircle className="h-4 w-4 text-blue-600" />
                          <span>{summary.pledgedItems} Pledged</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={!canEdit}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Gold Item
                </Button>
                {canRelease && summary && summary.pledgedItems > 0 && (
                  <Button onClick={handleReleaseAll} variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Release All Items
                  </Button>
                )}
              </div>

              {/* Gold Items List */}
              {goldItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No gold items added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {goldItems.map((item) => (
                    <Card key={item.id} className="relative">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Scale className="h-5 w-5 text-yellow-600" />
                            <CardTitle className="text-base">{item.itemType}</CardTitle>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weight:</span>
                            <span className="font-medium">{item.weight.toFixed(2)}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Purity:</span>
                            <span className="font-medium">{item.purity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rate:</span>
                            <span className="font-medium">₹{item.currentRate.toLocaleString()}/g</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-muted-foreground">Value:</span>
                            <span className="font-bold text-lg">₹{item.totalValue.toLocaleString()}</span>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-xs text-muted-foreground border-t pt-2">
                            {item.description}
                          </p>
                        )}

                        {item.status === 'RELEASED' && item.releasedToName && (
                          <div className="text-xs text-green-700 bg-green-50 p-2 rounded border-t">
                            <div><strong>Released to:</strong> {item.releasedToName}</div>
                            {item.releasedToPhone && <div><strong>Phone:</strong> {item.releasedToPhone}</div>}
                            {item.releasedAt && (
                              <div><strong>Date:</strong> {new Date(item.releasedAt).toLocaleDateString()}</div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2 pt-2 border-t">
                          {item.status === 'PLEDGED' && (
                            <>
                              {canEdit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(item)}
                                  className="flex-1"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              )}
                              {canRelease && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleRelease(item)}
                                  className="flex-1"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Release
                                </Button>
                              )}
                              {canEdit && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(item)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Gold Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Gold Item</DialogTitle>
            <DialogDescription>Add a new gold item to this loan</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd} className="space-y-4">
            <div>
              <Label htmlFor="itemType">Item Type *</Label>
              <Input
                id="itemType"
                value={formData.itemType}
                onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                placeholder="e.g., Ring, Necklace, Bracelet"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (grams) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="purity">Purity *</Label>
                <Input
                  id="purity"
                  value={formData.purity}
                  onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                  placeholder="e.g., 22K, 24K, 916"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="currentRate">Rate per Gram (₹) *</Label>
              <Input
                id="currentRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.currentRate || ''}
                onChange={(e) => setFormData({ ...formData, currentRate: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about the item"
              />
            </div>
            {formData.weight > 0 && formData.currentRate > 0 && (
              <div className="bg-muted p-3 rounded">
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-xl font-bold">
                  ₹{(formData.weight * formData.currentRate).toLocaleString()}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Gold Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Gold Item</DialogTitle>
            <DialogDescription>Update gold item details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-itemType">Item Type *</Label>
              <Input
                id="edit-itemType"
                value={formData.itemType}
                onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-weight">Weight (grams) *</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-purity">Purity *</Label>
                <Input
                  id="edit-purity"
                  value={formData.purity}
                  onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-currentRate">Rate per Gram (₹) *</Label>
              <Input
                id="edit-currentRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.currentRate || ''}
                onChange={(e) => setFormData({ ...formData, currentRate: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            {formData.weight > 0 && formData.currentRate > 0 && (
              <div className="bg-muted p-3 rounded">
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-xl font-bold">
                  ₹{(formData.weight * formData.currentRate).toLocaleString()}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Release Single Item Dialog */}
      <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Gold Item</DialogTitle>
            <DialogDescription>
              Enter recipient details to release this gold item
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitRelease} className="space-y-4">
            <div>
              <Label htmlFor="releasedToName">Released To Name *</Label>
              <Input
                id="releasedToName"
                value={releaseData.releasedToName}
                onChange={(e) => setReleaseData({ ...releaseData, releasedToName: e.target.value })}
                placeholder="Name of person receiving the gold"
                required
              />
            </div>
            <div>
              <Label htmlFor="releasedToPhone">Phone Number</Label>
              <Input
                id="releasedToPhone"
                value={releaseData.releasedToPhone}
                onChange={(e) => setReleaseData({ ...releaseData, releasedToPhone: e.target.value })}
                placeholder="Contact number"
              />
            </div>
            <div>
              <Label htmlFor="releaseNotes">Release Notes</Label>
              <Textarea
                id="releaseNotes"
                value={releaseData.releaseNotes}
                onChange={(e) => setReleaseData({ ...releaseData, releaseNotes: e.target.value })}
                placeholder="Any additional notes about the release"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowReleaseDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={releaseMutation.isPending}>
                {releaseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Release Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Release All Items Dialog */}
      <Dialog open={showReleaseAllDialog} onOpenChange={setShowReleaseAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release All Gold Items</DialogTitle>
            <DialogDescription>
              This will release all pledged gold items for this loan
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitReleaseAll} className="space-y-4">
            <div>
              <Label htmlFor="releaseAll-releasedToName">Released To Name *</Label>
              <Input
                id="releaseAll-releasedToName"
                value={releaseData.releasedToName}
                onChange={(e) => setReleaseData({ ...releaseData, releasedToName: e.target.value })}
                placeholder="Name of person receiving the gold"
                required
              />
            </div>
            <div>
              <Label htmlFor="releaseAll-releasedToPhone">Phone Number</Label>
              <Input
                id="releaseAll-releasedToPhone"
                value={releaseData.releasedToPhone}
                onChange={(e) => setReleaseData({ ...releaseData, releasedToPhone: e.target.value })}
                placeholder="Contact number"
              />
            </div>
            <div>
              <Label htmlFor="releaseAll-releaseNotes">Release Notes</Label>
              <Textarea
                id="releaseAll-releaseNotes"
                value={releaseData.releaseNotes}
                onChange={(e) => setReleaseData({ ...releaseData, releaseNotes: e.target.value })}
                placeholder="Any additional notes about the release"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowReleaseAllDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={releaseAllMutation.isPending}>
                {releaseAllMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Release All Items
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gold Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this gold item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
