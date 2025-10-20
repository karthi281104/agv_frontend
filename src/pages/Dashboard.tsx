import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  IndianRupee, 
  Percent, 
  AlertTriangle, 
  CreditCard,
  Wallet,
  RefreshCw,
  Download,
  Plus,
  Eye,
  Activity,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { dashboardService } from "@/services/dashboardService";

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, isLoading, isRefreshing, error, refreshDashboard, exportDashboard } = useDashboard();

  const today = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load dashboard data</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const metrics = [
    {
      title: "Total Customers",
      value: stats ? dashboardService.formatNumber(stats.totalCustomers) : "0",
      change: "+12.5%",
      changeType: "increase",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Active customer base"
    },
    {
      title: "Total Disbursed",
      value: stats ? dashboardService.formatCurrency(stats.monthlyDisbursed) : "₹0",
      change: "+8.3%",
      changeType: "increase",
      icon: IndianRupee,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Amount disbursed this month"
    },
    {
      title: "Interest Earned",
      value: stats ? dashboardService.formatCurrency(stats.totalInterestEarned) : "₹0",
      change: "+15.7%",
      changeType: "increase",
      icon: Percent,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Total interest accrued"
    },
    {
      title: "Overdue Amount",
      value: stats ? dashboardService.formatCurrency(stats.overdueAmount) : "₹0",
      change: "-5.2%",
      changeType: "decrease",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Pending collections"
    },
    {
      title: "Active Loans",
      value: stats ? dashboardService.formatNumber(stats.activeLoans) : "0",
      change: "+6.8%",
      changeType: "increase",
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Currently active loans"
    },
    {
      title: "Monthly Collections",
      value: stats ? dashboardService.formatCurrency(stats.monthlyCollected) : "₹0",
      change: "+22.1%",
      changeType: "increase",
      icon: Wallet,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      description: "This month's collections"
    }
  ];

  const quickActions = [
    {
      title: "Add Customer",
      description: "Register new customer",
      icon: Users,
      color: "bg-blue-500",
      href: "/customers?action=add"
    },
    {
      title: "Create Loan",
      description: "Process new loan",
      icon: CreditCard,
      color: "bg-green-500",
      href: "/loans?action=create"
    },
    {
      title: "Record Payment",
      description: "Log payment received",
      icon: Wallet,
      color: "bg-purple-500",
      href: "/repayments?action=record"
    },
    {
      title: "View Reports",
      description: "Generate reports",
      icon: Activity,
      color: "bg-orange-500",
      href: "/reports"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Welcome back, <span className="font-semibold">{user?.name || 'User'}</span>! Here's what's happening today.
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                {today} • {currentTime}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshDashboard}
                disabled={isRefreshing}
                className="flex items-center gap-2 flex-1 sm:flex-initial"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportDashboard('pdf')}
                className="flex items-center gap-2 flex-1 sm:flex-initial"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <div className={`${metric.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{metric.value}</div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground mt-1">
                    <Badge variant={metric.changeType === 'increase' ? 'default' : 'destructive'} className="text-xs w-fit">
                      {metric.changeType === 'increase' ? 
                        <TrendingUp className="h-3 w-3 mr-1" /> : 
                        <TrendingDown className="h-3 w-3 mr-1" />
                      }
                      {metric.change}
                    </Badge>
                    <span className="text-xs">{metric.description}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2 hover:bg-gray-50 hover:shadow-md transition-all"
                    onClick={() => window.location.href = action.href}
                  >
                    <div className={`${action.color} p-2 sm:p-3 rounded-lg text-white`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm font-semibold">{action.title}</div>
                      <div className="text-xs text-gray-500 hidden sm:block">{action.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-base sm:text-lg">Recent Activities</CardTitle>
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {stats.recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 hidden sm:block">
                      <Activity className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 break-words">
                        {activity.description}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                      {activity.amount && (
                        <span className="text-sm font-medium text-green-600">
                          {dashboardService.formatCurrency(activity.amount)}
                        </span>
                      )}
                      <Badge variant={activity.status === 'SUCCESS' ? 'default' : 'secondary'} className="text-xs">
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activities</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;