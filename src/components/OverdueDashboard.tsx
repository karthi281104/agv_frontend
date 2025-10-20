import { useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw, Phone, Mail, IndianRupee, Calendar, Clock } from 'lucide-react';
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
import { useOverdueLoans, useOverdueStatistics, useUpdateAllOverdue } from '../hooks/useOverdue';
import { OverdueLoan } from '../services/overdueService';

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

  const overdueLoans = loansResponse?.data || [];
  const stats = statsResponse?.data;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overdue Management</h1>
          <p className="text-muted-foreground">Monitor and manage overdue loans</p>
        </div>
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
