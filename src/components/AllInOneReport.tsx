import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { BarChart3, Calendar, Download, RefreshCw, Users, Activity, IndianRupee, AlertTriangle, ListOrdered } from 'lucide-react';
import { usePortfolioReport, useLoanPerformanceReport, useCollectionReport, useCustomerReport, useOverdueReport, useMonthlyTrends } from '@/hooks/useReports';
import { API_BASE_URL } from '@/services/apiClient';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(Math.round(amount || 0));
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
}

export default function AllInOneReport() {
  const { toast } = useToast();
  const todayISO = new Date().toISOString().split('T')[0];
  const firstOfMonthISO = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(firstOfMonthISO);
  const [endDate, setEndDate] = useState<string>(todayISO);
  const [months, setMonths] = useState<number>(12);

  // Queries
  const { data: portfolioData } = usePortfolioReport();
  const { data: loanPerfData } = useLoanPerformanceReport(startDate, endDate);
  const { data: collectionData } = useCollectionReport(startDate, endDate);
  const { data: customerData } = useCustomerReport();
  const { data: overdueData } = useOverdueReport();
  const { data: trendsData } = useMonthlyTrends(months);

  const downloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (months) params.append('months', String(months));
      const url = `${API_BASE_URL.replace(/\/$/, '')}/reports/all-in-one.pdf?${params.toString()}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Failed to generate report (${res.status})`);
      const blob = await res.blob();
      const filename = `all_in_one_report_${new Date().toISOString().split('T')[0]}.pdf`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      toast({ title: 'Download started', description: 'Combined PDF report is downloading.' });
    } catch (e: any) {
      toast({ title: 'PDF download failed', description: e.message, variant: 'destructive' });
    }
  };

  const exportCSV = () => {
    const lines: string[] = [];
    const push = (l: string = '') => lines.push(l);

    push('All-in-One Portfolio Report');
    push(`Period,${startDate},${endDate}`);
    push('');

    if (portfolioData) {
      push('Portfolio Overview');
      push('Metric,Value');
      push(`Total Loans,${portfolioData.totalLoans}`);
      push(`Active Loans,${portfolioData.activeLoans}`);
      push(`Completed Loans,${portfolioData.completedLoans}`);
      push(`Overdue Loans,${portfolioData.overdueLoans}`);
      push(`Defaulted Loans,${portfolioData.defaultedLoans}`);
      push(`Total Disbursed,${portfolioData.totalDisbursed}`);
      push(`Total Outstanding,${portfolioData.totalOutstanding}`);
      push(`Total Collected,${portfolioData.totalCollected}`);
      push(`Average Loan Size,${portfolioData.averageLoanSize}`);
      push(`Total Gold Value,${portfolioData.totalGoldValue}`);
      push(`Average LTV %,${Math.round(portfolioData.averageLTV)}`);
      push('');
    }

    if (loanPerfData) {
      push('Loan Performance');
      push('Period,New Loans,Disbursed,Collections,Closed,Outstanding End');
      push(`${loanPerfData.period},${loanPerfData.newLoans},${loanPerfData.disbursedAmount},${loanPerfData.collectionsAmount},${loanPerfData.closedLoans},${loanPerfData.outstandingAtEnd}`);
      push('');
    }

    if (collectionData) {
      push('Collections');
      push('Total,Principal,Interest,Penalty,Efficiency %,Overdue Recovered');
      push(`${collectionData.totalCollections},${collectionData.principalCollected},${collectionData.interestCollected},${collectionData.penaltyCollected},${Math.round(collectionData.collectionEfficiency)},${collectionData.overdueRecovered}`);
      push('');
    }

    if (customerData) {
      push('Customers');
      push('Total,Active,Repeat,Avg Loans Per Customer');
      push(`${customerData.totalCustomers},${customerData.activeCustomers},${customerData.repeatCustomers},${customerData.averageLoansPerCustomer}`);
      push('Top Customers (Top 10)');
      push('Rank,Name,Total Loans,Total Borrowed');
      customerData.topCustomers.slice(0, 10).forEach((c, i) => {
        push(`${i + 1},${c.name},${c.totalLoans},${c.totalBorrowed}`);
      });
      push('');
    }

    if (overdueData) {
      push('Overdue');
      push('Total Loans,Total Amount,Penalties,Recovery Rate %');
      push(`${overdueData.totalOverdueLoans},${overdueData.totalOverdueAmount},${overdueData.totalPenalties},${Math.round(overdueData.recoveryRate)}`);
      push('Bucket,Count,Amount');
      push(`0-30,${overdueData.bucket0to30.count},${overdueData.bucket0to30.amount}`);
      push(`30-60,${overdueData.bucket30to60.count},${overdueData.bucket30to60.amount}`);
      push(`60-90,${overdueData.bucket60to90.count},${overdueData.bucket60to90.amount}`);
      push(`90+,${overdueData.bucket90Plus.count},${overdueData.bucket90Plus.amount}`);
      push('');
    }

    if (trendsData?.length) {
      push('Monthly Trends');
      push('Month,Year,Created,Disbursed,Completed,Total Disbursed,Total Collected,Net Outflow');
      trendsData.forEach((t) => {
        push(`${t.month},${t.year},${t.loansCreated},${t.loansDisbursed},${t.loansCompleted},${t.totalDisbursed},${t.totalCollected},${t.netOutflow}`);
      });
    }

    const csv = '\ufeff' + lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_in_one_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported as CSV', description: 'All-in-One report CSV downloaded.' });
  };

  const trendChartData = useMemo(() => {
    return (trendsData || []).map(t => ({
      name: `${t.month} ${String(t.year).slice(-2)}`,
      disbursed: t.totalDisbursed,
      collected: t.totalCollected,
      net: t.netOutflow,
    }));
  }, [trendsData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">All-in-One Report</h1>
            <p className="text-gray-600 mt-2">Unified portfolio, performance, collections, customers, overdue, and trends.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <div>
                <label className="block text-xs text-gray-600">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Trend Months</label>
                <Select value={String(months)} onValueChange={(v) => setMonths(parseInt(v))}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">Last 6</SelectItem>
                    <SelectItem value="12">Last 12</SelectItem>
                    <SelectItem value="18">Last 18</SelectItem>
                    <SelectItem value="24">Last 24</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={exportCSV}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={downloadPDF}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Total Loans</CardTitle>
                <ListOrdered className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold mt-2">{formatNumber(portfolioData?.totalLoans || 0)}</div>
              <div className="text-xs text-gray-500 mt-1">Active: {formatNumber(portfolioData?.activeLoans || 0)} • Overdue: {formatNumber(portfolioData?.overdueLoans || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Total Disbursed</CardTitle>
                <IndianRupee className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold mt-2">{formatCurrency(portfolioData?.totalDisbursed || 0)}</div>
              <div className="text-xs text-gray-500 mt-1">Outstanding (current): {formatCurrency(portfolioData?.totalOutstanding || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Total Collected</CardTitle>
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold mt-2">{formatCurrency(portfolioData?.totalCollected || 0)}</div>
              <div className="text-xs text-gray-500 mt-1">Avg Loan Size (all-time): {formatCurrency(portfolioData?.averageLoanSize || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">LTV / Gold Value</CardTitle>
                <BarChart3 className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-3xl font-bold mt-2">{Math.round(portfolioData?.averageLTV || 0)}%</div>
              <div className="text-xs text-gray-500 mt-1">Total Gold Value: {formatCurrency(portfolioData?.totalGoldValue || 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance and Collections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-xs text-gray-600">New Loans</div>
                  <div className="text-xl font-bold">{formatNumber(loanPerfData?.newLoans || 0)}</div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-xs text-gray-600">Disbursed</div>
                  <div className="text-xl font-bold">{formatCurrency(loanPerfData?.disbursedAmount || 0)}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <div className="text-xs text-gray-600">Collections</div>
                  <div className="text-xl font-bold">{formatCurrency(loanPerfData?.collectionsAmount || 0)}</div>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <div className="text-xs text-gray-600">Closed Loans</div>
                  <div className="text-xl font-bold">{formatNumber(loanPerfData?.closedLoans || 0)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-700">Outstanding at Period End</div>
                <div className="font-semibold">{formatCurrency(loanPerfData?.outstandingAtEnd || 0)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-xs text-gray-600">Total</div>
                  <div className="text-xl font-bold">{formatCurrency(collectionData?.totalCollections || 0)}</div>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-xs text-gray-600">Principal</div>
                  <div className="text-xl font-bold">{formatCurrency(collectionData?.principalCollected || 0)}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <div className="text-xs text-gray-600">Interest</div>
                  <div className="text-xl font-bold">{formatCurrency(collectionData?.interestCollected || 0)}</div>
                </div>
                <div className="p-3 bg-amber-50 rounded">
                  <div className="text-xs text-gray-600">Penalty</div>
                  <div className="text-xl font-bold">{formatCurrency(collectionData?.penaltyCollected || 0)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-700">Collection Efficiency</div>
                <Badge variant="outline">{Math.round(collectionData?.collectionEfficiency || 0)}%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers and Overdue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 rounded text-center">
                  <div className="text-xs text-gray-600">Total</div>
                  <div className="text-xl font-bold">{formatNumber(customerData?.totalCustomers || 0)}</div>
                </div>
                <div className="p-3 bg-green-50 rounded text-center">
                  <div className="text-xs text-gray-600">Active</div>
                  <div className="text-xl font-bold">{formatNumber(customerData?.activeCustomers || 0)}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded text-center">
                  <div className="text-xs text-gray-600">Repeat</div>
                  <div className="text-xl font-bold">{formatNumber(customerData?.repeatCustomers || 0)}</div>
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium mb-2">Top Customers</div>
                <div className="space-y-2 max-h-56 overflow-auto">
                  {customerData?.topCustomers.slice(0, 10).map((c, i) => (
                    <div key={c.customerId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-5">#{i + 1}</span>
                        <span className="font-medium">{c.name}</span>
                      </div>
                      <div className="text-sm text-gray-700">{formatCurrency(c.totalBorrowed)} • {c.totalLoans} loans</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overdue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-red-50 rounded">
                  <div className="text-xs text-gray-600">Total Overdue Loans</div>
                  <div className="text-xl font-bold">{formatNumber(overdueData?.totalOverdueLoans || 0)}</div>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <div className="text-xs text-gray-600">Overdue Amount</div>
                  <div className="text-xl font-bold">{formatCurrency(overdueData?.totalOverdueAmount || 0)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-700">Recovery Rate</div>
                <Badge variant="outline">{Math.round(overdueData?.recoveryRate || 0)}%</Badge>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Buckets</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gray-50 rounded text-xs">0-30 • {formatNumber(overdueData?.bucket0to30.count || 0)} • {formatCurrency(overdueData?.bucket0to30.amount || 0)}</div>
                  <div className="p-2 bg-gray-50 rounded text-xs">30-60 • {formatNumber(overdueData?.bucket30to60.count || 0)} • {formatCurrency(overdueData?.bucket30to60.amount || 0)}</div>
                  <div className="p-2 bg-gray-50 rounded text-xs">60-90 • {formatNumber(overdueData?.bucket60to90.count || 0)} • {formatCurrency(overdueData?.bucket60to90.amount || 0)}</div>
                  <div className="p-2 bg-gray-50 rounded text-xs">90+ • {formatNumber(overdueData?.bucket90Plus.count || 0)} • {formatCurrency(overdueData?.bucket90Plus.amount || 0)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${Math.round(v/1000)}k`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                  <Area type="monotone" dataKey="disbursed" stroke="#60a5fa" fillOpacity={1} fill="url(#colorDisbursed)" />
                  <Area type="monotone" dataKey="collected" stroke="#34d399" fillOpacity={1} fill="url(#colorCollected)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
