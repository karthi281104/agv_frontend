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
      setIsRefreshing(true);
      setError(null);
      const refreshedStats = await dashboardService.refreshDashboard();
      setStats(refreshedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh dashboard');
      console.error('Dashboard refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportDashboard = async (format: 'pdf' | 'excel' = 'pdf') => {
    try {
      const blob = await dashboardService.exportDashboardData(format);
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