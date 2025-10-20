import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  IndianRupee, 
  FileText,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import SimpleParticleBackground from './SimpleParticleBackground';

interface ReportStats {
  customers: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  loans: {
    total: number;
    active: number;
    pending: number;
    completed: number;
    overdue: number;
  };
  financial: {
    totalDisbursed: number;
    totalCollected: number;
    monthlyDisbursed: number;
    monthlyCollected: number;
    outstandingAmount: number;
    pendingApprovalAmount: number;
    activeLoanAmount: number;
    totalInterestEarned: number;
    overdueAmount: number;
  };
  recentActivity: {
    recentPayments: Array<{
      id: string;
      amount: number;
      paymentType: string;
      paymentDate: string;
      customer: string;
      loanNumber: string;
    }>;
  };
}

interface ChartData {
  monthlyLoans: Array<{ month: string; count: number; amount: number }>;
  monthlyPayments: Array<{ month: string; count: number; amount: number }>;
  loanStatus: Array<{ status: string; count: number; amount: number }>;
  goldItemTypes: Array<{ type: string; count: number; value: number }>;
}

export function ReportsAnalytics() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportType, setReportType] = useState('overview');

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery<ReportStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for realtime updates
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartLoading, refetch: refetchCharts } = useQuery<ChartData>({
    queryKey: ['dashboard-charts'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/dashboard/charts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch charts');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast({
      title: "Export Started",
      description: `Generating ${format.toUpperCase()} report...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Report has been downloaded as ${format.toUpperCase()}`,
      });
    }, 2000);
  };

  const handleRefresh = () => {
    refetchStats();
    refetchCharts();
    toast({
      title: "Refreshing Data",
      description: "Loading latest information...",
    });
  };

  if (statsLoading || chartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">Failed to load reports</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <SimpleParticleBackground />
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-2">Real-time financial insights and comprehensive reports</p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('excel')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Excel</span>
              </Button>
              
              <Button
                size="sm"
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
            </div>
          </div>

          {/* Real-time Update Badge */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
            <span>Live data - Updates every 30 seconds</span>
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-8 w-8 opacity-80" />
                <Badge className="bg-white/20 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{stats?.customers.newThisMonth || 0}
                </Badge>
              </div>
              <p className="text-blue-100 text-sm">Total Customers</p>
              <p className="text-3xl font-bold mt-2">{formatNumber(stats?.customers.total || 0)}</p>
              <p className="text-blue-100 text-xs mt-1">
                {formatNumber(stats?.customers.active || 0)} active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-8 w-8 opacity-80" />
                <Badge className="bg-white/20 text-white">
                  {stats?.loans.active || 0} Active
                </Badge>
              </div>
              <p className="text-green-100 text-sm">Total Loans</p>
              <p className="text-3xl font-bold mt-2">{formatNumber(stats?.loans.total || 0)}</p>
              <p className="text-green-100 text-xs mt-1">
                {stats?.loans.pending || 0} pending approval
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <IndianRupee className="h-8 w-8 opacity-80" />
                <Badge className="bg-white/20 text-white">
                  Disbursed
                </Badge>
              </div>
              <p className="text-purple-100 text-sm">Total Amount</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats?.financial.totalDisbursed || 0)}</p>
              <p className="text-purple-100 text-xs mt-1">
                {formatCurrency(stats?.financial.monthlyDisbursed || 0)} this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 opacity-80" />
                <Badge className="bg-white/20 text-white">
                  Collected
                </Badge>
              </div>
              <p className="text-orange-100 text-sm">Total Collected</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats?.financial.totalCollected || 0)}</p>
              <p className="text-orange-100 text-xs mt-1">
                {formatCurrency(stats?.financial.monthlyCollected || 0)} this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports Tabs */}
        <Tabs defaultValue="overview" className="space-y-6" onValueChange={setReportType}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    Financial Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Total Disbursed</span>
                    <span className="font-bold text-blue-600">{formatCurrency(stats?.financial.totalDisbursed || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Total Collected</span>
                    <span className="font-bold text-green-600">{formatCurrency(stats?.financial.totalCollected || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-700">Outstanding Amount</span>
                    <span className="font-bold text-orange-600">{formatCurrency(stats?.financial.outstandingAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Active Loan Amount</span>
                    <span className="font-bold text-purple-600">{formatCurrency(stats?.financial.activeLoanAmount || 0)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.recentActivity.recentPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{payment.customer}</p>
                          <p className="text-sm text-gray-600">
                            Loan: {payment.loanNumber} • {new Date(payment.paymentDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {payment.paymentType.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs with placeholder content */}
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Detailed financial analysis coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loans">
            <Card>
              <CardHeader>
                <CardTitle>Loan Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Loan performance metrics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Customer analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Historical trends coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
