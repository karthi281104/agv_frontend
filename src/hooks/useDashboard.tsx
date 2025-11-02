import { useState, useEffect } from 'react';
import { dashboardService, DashboardStats } from '@/services/dashboardService';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setError(null);
      const dashboardStats = await dashboardService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDashboard = async () => {
    try {
      // Client-side refresh by re-fetching stats (more reliable than a backend refresh endpoint)
      setIsRefreshing(true);
      setError(null);
      await fetchDashboardStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh dashboard');
      console.error('Dashboard refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportDashboard = async (format: 'csv' | 'pdf' | 'excel' = 'csv') => {
    try {
      // If CSV requested, build on the client for reliability
      if (format === 'csv' && stats) {
        const rows: string[] = [];
        const esc = (v: any) => {
          const s = (v ?? '').toString();
          return '"' + s.replace(/"/g, '""') + '"';
        };
        // Summary section
        rows.push('Metric,Value');
        rows.push(`Total Customers,${stats.totalCustomers}`);
        rows.push(`Active Customers,${stats.activeCustomers}`);
        rows.push(`Total Loans,${stats.totalLoans}`);
        rows.push(`Active Loans,${stats.activeLoans}`);
        rows.push(`Pending Loans,${stats.pendingLoans}`);
        rows.push(`Completed Loans,${stats.completedLoans}`);
        rows.push(`Total Disbursed,${stats.totalDisbursed}`);
        rows.push(`Total Collected,${stats.totalCollected}`);
        rows.push(`Monthly Disbursed,${stats.monthlyDisbursed}`);
        rows.push(`Monthly Collected,${stats.monthlyCollected}`);
        rows.push(`Outstanding Amount,${(stats as any).outstandingAmount ?? 0}`);
        rows.push(`Overdue Amount,${stats.overdueAmount}`);
        if ((stats as any).overdueLoansCount !== undefined) {
          rows.push(`Overdue Loans,${(stats as any).overdueLoansCount}`);
        }
        rows.push('');
        // Recent activities section
        rows.push('Recent Activities');
        rows.push('ID,Type,Description,Amount,Timestamp,Status');
        (stats.recentActivities || []).forEach(a => {
          rows.push([
            esc(a.id),
            esc(a.type),
            esc(a.description),
            esc(a.amount ?? ''),
            esc(a.timestamp),
            esc(a.status)
          ].join(','));
        });

        const csv = rows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dashboard-report.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return;
      }

      // Otherwise, attempt backend export (pdf/excel)
      const blob = await dashboardService.exportDashboardData(format === 'csv' ? 'excel' : format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-report.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export dashboard');
      console.error('Dashboard export error:', err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    stats,
    isLoading,
    isRefreshing,
    error,
    refreshDashboard,
    exportDashboard,
    refetch: fetchDashboardStats
  };
};