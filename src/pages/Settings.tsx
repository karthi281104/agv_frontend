import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Lock, 
  Bell, 
  Settings as SettingsIcon, 
  Shield, 
  Database, 
  Users, 
  Building, 
  CreditCard, 
  FileText, 
  Smartphone, 
  Mail, 
  Globe, 
  Palette, 
  Clock, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Info,
  Save,
  Upload,
  Download,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Loader2,
  Key
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import userService from "@/services/userService";
import settingsService from "@/services/settingsService";

// Get token helper
const getToken = () => {
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
};

const Settings = () => {
  const { toast } = useToast();
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || 'John',
    lastName: user?.name?.split(' ')[1] || 'Doe',
    email: user?.email || 'john.doe@agv.com',
    phone: '+91 98765 43210',
    department: 'lending',
    address: '123 Gold Street, Mumbai',
    language: 'en',
    timezone: 'ist',
    dateFormat: 'dd/mm/yyyy',
    currency: 'inr',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    language: 'en',
    currency: 'inr',
    dateFormat: 'dd/mm/yyyy',
    numberFormat: 'indian',
    interestRate: '12',
    maxLoanAmount: '1000000',
    minLoanAmount: '5000',
    goldRateSource: 'live',
  });

  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const payload = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        profile: {
          phone: profileData.phone,
          department: profileData.department,
          address: profileData.address,
          language: profileData.language,
          timezone: profileData.timezone,
          dateFormat: profileData.dateFormat,
          currency: profileData.currency,
        },
      };
      const resp = await userService.updateMe(payload);

      // Update local auth_user cache
      const updatedUser = resp.data.user;
      const authUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        role: updatedUser.role,
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem('auth_user', JSON.stringify(authUser));
      checkAuth();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({ currentPassword: passwordData.current, newPassword: passwordData.new });
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      
      setPasswordData({
        current: '',
        new: '',
        confirm: '',
      });
      setPasswordStrength(0);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSystemBackup = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Backup Started",
        description: "System backup has been initiated successfully. You'll be notified when complete.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to initiate system backup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDataExport = async (type: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Export Started",
        description: `${type} export has been initiated. You'll receive an email when the file is ready.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    setLoading(true);
    try {
      await settingsService.updateSystem(systemSettings);
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error?.message || "Failed to save system settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await settingsService.updatePreferences({
        emailNotifications,
        smsNotifications,
        overdueAlerts,
        darkMode,
        timezone: profileData.timezone,
        dateFormat: profileData.dateFormat,
        currency: profileData.currency,
        language: profileData.language,
      });
      toast({
        title: "Preferences Saved",
        description: "Notification preferences have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error?.message || "Failed to save notification preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load: profile, preferences, and system settings
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [me, prefs, sys] = await Promise.all([
          userService.getMe(),
          settingsService.getPreferences(),
          settingsService.getSystem(),
        ]);

        if (!mounted) return;

        // User core + profile extras
        const u = me.data.user;
        const extras = me.data.profile || {};
        setProfileData(prev => ({
          ...prev,
          firstName: u.firstName || prev.firstName,
          lastName: u.lastName || prev.lastName,
          email: u.email || prev.email,
          phone: extras.phone || prev.phone,
          department: extras.department || prev.department,
          address: extras.address || prev.address,
          language: extras.language || prev.language,
          timezone: extras.timezone || prev.timezone,
          dateFormat: extras.dateFormat || prev.dateFormat,
          currency: extras.currency || prev.currency,
        }));

        // Preferences
        const p = prefs.data || {};
        setEmailNotifications(p.emailNotifications ?? true);
        setSmsNotifications(p.smsNotifications ?? true);
        setOverdueAlerts(p.overdueAlerts ?? true);
        setDarkMode(p.darkMode ?? false);

        // System
        const s = sys.data || {};
        setSystemSettings(prev => ({
          ...prev,
          language: s.language || prev.language,
          currency: s.currency || prev.currency,
          dateFormat: s.dateFormat || prev.dateFormat,
          numberFormat: s.numberFormat || prev.numberFormat,
          interestRate: s.interestRate || prev.interestRate,
          maxLoanAmount: s.maxLoanAmount || prev.maxLoanAmount,
          minLoanAmount: s.minLoanAmount || prev.minLoanAmount,
          goldRateSource: s.goldRateSource || prev.goldRateSource,
        }));
      } catch (e) {
        // Non-blocking
        console.error('Failed to load settings', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Settings & Configuration</h1>
          <Badge variant="outline" className="flex items-center gap-2 w-fit">
            <Activity className="h-4 w-4" />
            <span className="text-xs sm:text-sm">System Status: Online</span>
          </Badge>
        </div>

        <div className="max-w-6xl">
          <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
              <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Security</span>
                <span className="sm:hidden">Security</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <SettingsIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">System</span>
                <span className="sm:hidden">System</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Users</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Backup</span>
                <span className="sm:hidden">Backup</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-4 sm:space-y-6">
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="text-base sm:text-lg">
                          {profileData.firstName[0]}{profileData.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                          <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Upload Photo
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or GIF (max. 2MB)
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-xs sm:text-sm">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-xs sm:text-sm">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs sm:text-sm">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs sm:text-sm">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-xs sm:text-sm">Department</Label>
                        <Select 
                          value={profileData.department}
                          onValueChange={(value) => setProfileData({...profileData, department: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lending">Lending</SelectItem>
                            <SelectItem value="admin">Administration</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-xs sm:text-sm">Address</Label>
                      <Input 
                        id="address" 
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={handleSaveProfile} 
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-xs sm:text-sm">Language</Label>
                      <Select 
                        value={profileData.language}
                        onValueChange={(value) => setProfileData({...profileData, language: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                          <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-xs sm:text-sm">Timezone</Label>
                      <Select 
                        value={profileData.timezone}
                        onValueChange={(value) => setProfileData({...profileData, timezone: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                          <SelectItem value="gmt">GMT (UTC+0)</SelectItem>
                          <SelectItem value="est">EST (UTC-5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat" className="text-xs sm:text-sm">Date Format</Label>
                      <Select 
                        value={profileData.dateFormat}
                        onValueChange={(value) => setProfileData({...profileData, dateFormat: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-xs sm:text-sm">Currency</Label>
                      <Select 
                        value={profileData.currency}
                        onValueChange={(value) => setProfileData({...profileData, currency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inr">INR (₹)</SelectItem>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Building className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      Organization Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-xs sm:text-sm">Role</Label>
                      <Select defaultValue="manager">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="officer">Loan Officer</SelectItem>
                          <SelectItem value="cashier">Cashier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="branch" className="text-xs sm:text-sm">Branch</Label>
                      <Select defaultValue="mumbai">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mumbai">Mumbai Central</SelectItem>
                          <SelectItem value="delhi">Delhi North</SelectItem>
                          <SelectItem value="bangalore">Bangalore South</SelectItem>
                          <SelectItem value="chennai">Chennai East</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="employeeId" className="text-xs sm:text-sm">Employee ID</Label>
                      <Input id="employeeId" defaultValue="AGV001" disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="joinDate" className="text-xs sm:text-sm">Join Date</Label>
                      <Input id="joinDate" defaultValue="2023-01-15" disabled />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label className="text-xs sm:text-sm">Permissions</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm">Create Loans</span>
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Granted
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm">Approve Loans</span>
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Granted
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm">View Reports</span>
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Granted
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm">System Administration</span>
                          <Badge variant="outline" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Restricted
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-4 sm:space-y-6">
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-xs sm:text-sm">Current Password</Label>
                      <div className="relative">
                        <Input 
                          id="currentPassword" 
                          type={showPassword.current ? "text" : "password"}
                          value={passwordData.current}
                          onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                        >
                          {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-xs sm:text-sm">New Password</Label>
                      <div className="relative">
                        <Input 
                          id="newPassword" 
                          type={showPassword.new ? "text" : "password"}
                          value={passwordData.new}
                          onChange={(e) => {
                            setPasswordData({...passwordData, new: e.target.value});
                            setPasswordStrength(calculatePasswordStrength(e.target.value));
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                        >
                          {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {passwordData.new && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${
                                  level <= passwordStrength
                                    ? passwordStrength === 1
                                      ? 'bg-red-500'
                                      : passwordStrength === 2
                                      ? 'bg-orange-500'
                                      : passwordStrength === 3
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Password strength: {
                              passwordStrength === 1 ? 'Weak' :
                              passwordStrength === 2 ? 'Fair' :
                              passwordStrength === 3 ? 'Good' :
                              passwordStrength === 4 ? 'Strong' : ''
                            }
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm New Password</Label>
                      <div className="relative">
                        <Input 
                          id="confirmPassword" 
                          type={showPassword.confirm ? "text" : "password"}
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                        >
                          {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {passwordData.confirm && passwordData.new !== passwordData.confirm && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={handleChangePassword} 
                        className="w-full"
                        disabled={loading || !passwordData.current || !passwordData.new || passwordData.new !== passwordData.confirm}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Key className="h-4 w-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      Two-Factor Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs sm:text-sm">Enable 2FA</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Add an extra layer of security
                        </p>
                      </div>
                      <Switch 
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                      />
                    </div>
                    
                    {twoFactorEnabled && (
                      <div className="space-y-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm">Authentication Method</Label>
                          <Select defaultValue="app">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="app">Authenticator App</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button variant="outline" className="w-full text-xs sm:text-sm">
                          <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Setup Authenticator
                        </Button>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label className="text-xs sm:text-sm">Login History</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span>Today, 9:30 AM</span>
                          <Badge variant="outline" className="text-xs">Current Session</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span>Yesterday, 6:45 PM</span>
                          <Badge variant="secondary" className="text-xs">Mumbai, India</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span>Dec 15, 10:20 AM</span>
                          <Badge variant="secondary" className="text-xs">Mumbai, India</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      Communication Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs sm:text-sm">Email Notifications</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Receive updates via email
                        </p>
                      </div>
                      <Switch 
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs sm:text-sm">SMS Notifications</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Receive alerts via SMS
                        </p>
                      </div>
                      <Switch 
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Browser notifications
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label>Notification Types</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Loan Applications</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Payment Due Dates</span>
                          <Switch 
                            checked={overdueAlerts}
                            onCheckedChange={setOverdueAlerts}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Overdue Payments</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">System Updates</span>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Notification Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Business Hours</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="time" defaultValue="09:00" />
                        <Input type="time" defaultValue="18:00" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Notifications will be sent during these hours
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Time Zone</Label>
                      <Select defaultValue="asia/kolkata">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asia/kolkata">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="us/eastern">US/Eastern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label>Frequency Settings</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Daily Digest</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Weekly Reports</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Monthly Summary</span>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SettingsIcon className="h-5 w-5 text-primary" />
                      Application Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select value={systemSettings.language} onValueChange={(v) => setSystemSettings({ ...systemSettings, language: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="mr">Marathi</SelectItem>
                          <SelectItem value="ta">Tamil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select value={systemSettings.currency} onValueChange={(v) => setSystemSettings({ ...systemSettings, currency: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                          <SelectItem value="usd">US Dollar ($)</SelectItem>
                          <SelectItem value="eur">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Toggle system theme
                        </p>
                      </div>
                      <Switch 
                        checked={darkMode}
                        onCheckedChange={setDarkMode}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select value={systemSettings.dateFormat} onValueChange={(v) => setSystemSettings({ ...systemSettings, dateFormat: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Number Format</Label>
                      <Select value={systemSettings.numberFormat} onValueChange={(v) => setSystemSettings({ ...systemSettings, numberFormat: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indian">Indian (1,00,000)</SelectItem>
                          <SelectItem value="international">International (100,000)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Business Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="interestRate">Default Interest Rate (%)</Label>
                      <Input id="interestRate" type="number" value={systemSettings.interestRate} onChange={(e) => setSystemSettings({ ...systemSettings, interestRate: e.target.value })} step="0.1" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxLoanAmount">Maximum Loan Amount</Label>
                      <Input id="maxLoanAmount" type="number" value={systemSettings.maxLoanAmount} onChange={(e) => setSystemSettings({ ...systemSettings, maxLoanAmount: e.target.value })} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="minLoanAmount">Minimum Loan Amount</Label>
                      <Input id="minLoanAmount" type="number" value={systemSettings.minLoanAmount} onChange={(e) => setSystemSettings({ ...systemSettings, minLoanAmount: e.target.value })} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Gold Rate Source</Label>
                      <Select value={systemSettings.goldRateSource} onValueChange={(v) => setSystemSettings({ ...systemSettings, goldRateSource: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="live">Live Market Rate</SelectItem>
                          <SelectItem value="manual">Manual Entry</SelectItem>
                          <SelectItem value="api">External API</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label>Loan Terms</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Short Term (3-6 months)</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Medium Term (6-12 months)</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Long Term (12+ months)</span>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* User Management */}
            <TabsContent value="users" className="space-y-6">
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      User Management
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="newUserName">Full Name</Label>
                              <Input id="newUserName" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newUserEmail">Email</Label>
                              <Input id="newUserEmail" type="email" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newUserRole">Role</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="officer">Loan Officer</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="cashier">Cashier</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button className="w-full">Create User</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* User List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">John Doe</p>
                            <p className="text-sm text-muted-foreground">john.doe@agv.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>Manager</Badge>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>SM</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Sarah Miller</p>
                            <p className="text-sm text-muted-foreground">sarah.miller@agv.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Loan Officer</Badge>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>RK</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Raj Kumar</p>
                            <p className="text-sm text-muted-foreground">raj.kumar@agv.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Cashier</Badge>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Backup & Data */}
            <TabsContent value="backup" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      System Backup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Backup Schedule</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Last Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        December 16, 2024 at 2:00 AM
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Storage Location</Label>
                      <Select defaultValue="cloud">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cloud">Cloud Storage</SelectItem>
                          <SelectItem value="local">Local Server</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Button onClick={handleSystemBackup} className="w-full">
                        <Database className="h-4 w-4 mr-2" />
                        Backup Now
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Backup
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Data Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label>Data Export</Label>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" onClick={() => handleDataExport('customers')}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Customer Data
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => handleDataExport('loans')}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Loan Records
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => handleDataExport('all')}>
                          <Download className="h-4 w-4 mr-2" />
                          Export All Data
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label>Database Statistics</Label>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Customers:</span>
                          <span className="font-medium">1,247</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Loans:</span>
                          <span className="font-medium">892</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Transactions:</span>
                          <span className="font-medium">5,634</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Database Size:</span>
                          <span className="font-medium">2.4 GB</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label className="text-destructive">Danger Zone</Label>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Reset All Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
