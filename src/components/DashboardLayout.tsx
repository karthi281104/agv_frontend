import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  FileText, 
  Settings, 
  LogOut,
  Shield,
  User,
  Calculator,
  Menu,
  X
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Customers", path: "/customers" },
    { icon: IndianRupee, label: "Loan Management", path: "/loans" },
    { icon: TrendingUp, label: "Repayments", path: "/repayments" },
    { icon: Calculator, label: "Calculators", path: "/calculators" },
    { icon: FileText, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white shadow-md"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-primary text-primary-foreground shadow-lg flex flex-col
        transition-transform duration-300 ease-in-out
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-primary-foreground/10 mt-12 lg:mt-0">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8" />
            <span className="text-xl font-bold">AGV Finance</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={handleNavClick}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-primary-foreground hover:bg-primary-foreground/10 ${
                  isActive(item.path) ? "bg-primary-foreground/20" : ""
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-primary-foreground/10">
          <div className="mb-3 px-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Employee"}</p>
              <p className="text-xs text-primary-foreground/70 truncate">{user?.email || "employee@agv.com"}</p>
              {user?.role && (
                <p className="text-xs text-primary-foreground/50 capitalize">{user.role}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-primary-foreground hover:bg-primary-foreground/10 hover:bg-destructive/20 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
