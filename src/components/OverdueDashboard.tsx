import { useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw, Phone, Mail, IndianRupee, Calendar, Clock, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useOverdueLoans, useOverdueStatistics, useUpdateAllOverdue, useUpdateLoanOverdue, useCheckDefault } from '../hooks/useOverdue';
import { OverdueLoan } from '../services/overdueService';
import { useToast } from '../hooks/use-toast';

export function OverdueDashboard() {
  const [filter, setFilter] = useState<'all' | '0-30' | '30-60' | '60-90' | '90+'>('all');
  
  const getFilters = () => {
    switch (filter) {
      case '0-30':
        return { minDaysOverdue: 0, maxDaysOverdue: 29 };
      case '30-60':
        return { minDaysOverdue: 30, maxDaysOverdue: 59 };
      case '60-90':
        return { minDaysOverdue: 60, maxDaysOverdue: 89 };
      case '90+':
        return { minDaysOverdue: 90 };
      default:
        return undefined;
    }
  };

  const { data: loansResponse, isLoading: loansLoading, refetch: refetchLoans } = useOverdueLoans(getFilters());
  const { data: statsResponse, isLoading: statsLoading } = useOverdueStatistics();
  const updateAllMutation = useUpdateAllOverdue();
  const updateLoanMutation = useUpdateLoanOverdue();
  const checkDefaultMutation = useCheckDefault();
  const { toast } = useToast();

  const overdueLoans = loansResponse || [];
  const stats = statsResponse;

  const handleRefresh = async () => {
    await updateAllMutation.mutateAsync();
    refetchLoans();
  };

  const getDaysOverdueBadge = (days: number) => {
    if (days < 30) {
      return <Badge className="bg-yellow-100 text-yellow-800">{ days} days</Badge>;
    } else if (days < 60) {
      return <Badge className="bg-orange-100 text-orange-800">{days} days</Badge>;
    } else if (days < 90) {
      return <Badge className="bg-red-100 text-red-800">{days} days</Badge>;
    } else {
      return <Badge variant="destructive">{days} days</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleExportCSV = () => {
    if (!overdueLoans || overdueLoans.length === 0) {
      toast({ title: 'No data', description: 'There are no overdue loans to export.' });
      return;
    }
    const header = [
      'LoanNumber','Customer','Phone','Email','Outstanding','Penalty','DaysOverdue','NextDueDate','OverdueSince'
    ];
    const rows = overdueLoans.map((loan: OverdueLoan) => [
      loan.loanNumber,
      `${loan.customer.firstName} ${loan.customer.lastName}`.trim(),
      loan.customer.phone || '',
      loan.customer.email || '',
      String(loan.overdueAmount ?? 0),
      String(loan.penaltyAmount ?? 0),
      String(loan.daysOverdue ?? 0),
      loan.nextDueDate ? new Date(loan.nextDueDate).toISOString() : '',
      loan.overdueSince ? new Date(loan.overdueSince).toISOString() : ''
    ]);
    const csv = [header, ...rows]
      .map(cols => cols.map(v => {
        const val = String(v ?? '');
        return /[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `overdue_loans_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Overdue loans CSV has been downloaded.' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overdue Management</h1>
          <p className="text-muted-foreground">Monitor and manage overdue loans</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExportCSV}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            onClick={handleRefresh}
            disabled={updateAllMutation.isPending}
          >
            {updateAllMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Total Overdue Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalOverdueLoans}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Total Overdue Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(Number(stats.totalOverdueAmount))}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Total Penalties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{formatCurrency(Number(stats.totalPenalties))}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Average Days Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageDaysOverdue}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overdue Buckets */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Overdue Distribution</CardTitle>
            <CardDescription>Loans grouped by overdue period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-800">{stats.buckets.lessThan30Days}</div>
                <div className="text-sm text-yellow-600">0-30 Days</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-800">{stats.buckets.from30To60Days}</div>
                <div className="text-sm text-orange-600">30-60 Days</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-800">{stats.buckets.from60To90Days}</div>
                <div className="text-sm text-red-600">60-90 Days</div>
              </div>
              <div className="text-center p-4 bg-red-100 rounded-lg">
                <div className="text-2xl font-bold text-red-900">{stats.buckets.moreThan90Days}</div>
                <div className="text-sm text-red-700">90+ Days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Overdue Loans</CardTitle>
              <CardDescription>All loans with pending payments past due date</CardDescription>
            </div>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Overdue</SelectItem>
                <SelectItem value="0-30">0-30 Days</SelectItem>
                <SelectItem value="30-60">30-60 Days</SelectItem>
                <SelectItem value="60-90">60-90 Days</SelectItem>
                <SelectItem value="90+">90+ Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loansLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : overdueLoans.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No overdue loans found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-right">Penalty</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Next Due Date</TableHead>
                    <TableHead>Overdue Since</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueLoans.map((loan: OverdueLoan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.loanNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {loan.customer.firstName} {loan.customer.lastName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {loan.customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {loan.customer.phone}
                            </div>
                          )}
                          {loan.customer.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {loan.customer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(loan.overdueAmount))}
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {formatCurrency(Number(loan.penaltyAmount))}
                      </TableCell>
                      <TableCell>{getDaysOverdueBadge(loan.daysOverdue)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(loan.nextDueDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(loan.overdueSince)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateLoanMutation.isPending}
                            onClick={() => updateLoanMutation.mutate(loan.id)}
                          >
                            {updateLoanMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Update'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={checkDefaultMutation.isPending || (loan.daysOverdue ?? 0) < 90}
                            onClick={() => checkDefaultMutation.mutate({ loanId: loan.id, thresholdDays: 90 })}
                            title={(loan.daysOverdue ?? 0) < 90 ? 'Available for 90+ days overdue' : 'Check default'}
                          >
                            {checkDefaultMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Check Default'
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
