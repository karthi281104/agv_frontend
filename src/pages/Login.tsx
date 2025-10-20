import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Eye, EyeOff, Mail, KeyRound, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import SimpleParticleBackground from "@/components/SimpleParticleBackground";
import ForgotPasswordDialog from "@/components/ForgotPasswordDialog";
import { useAuth } from "@/hooks/useAuth";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithAuth0, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'auth0'>('credentials');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const watchedFields = watch();

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);

    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Login failed. Please try again.");
    }
  };

  // Handle Auth0 login
  const handleAuth0Login = async () => {
    setAuthError(null);

    try {
      await loginWithAuth0();
      navigate("/dashboard");
    } catch (error) {
      setAuthError("Auth0 login failed. Please try again.");
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <SimpleParticleBackground density="low" />
      
      <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md">
          <Card className="card-shadow border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-4 text-center pb-8">
              <div className="flex justify-center">
                <div className="bg-primary rounded-full p-4 shadow-lg">
                  <Shield className="h-12 w-12 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">
                  <span className="text-primary">AGV</span>{" "}
                  <span className="text-foreground">Loans</span>
                </CardTitle>
                <CardDescription className="text-lg mt-2 text-muted-foreground">
                  Secure Employee Portal Access
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Alert */}
              {authError && (
                <Alert variant="destructive" className="border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              {/* Login Method Toggle */}
              <div className="flex rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setLoginMethod('credentials')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    loginMethod === 'credentials'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Login
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('auth0')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    loginMethod === 'auth0'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  SSO Login
                </button>
              </div>

              {loginMethod === 'credentials' ? (
                /* Credentials Login Form */
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@agvgold.com"
                        className={`pl-10 h-12 ${errors.email ? 'border-destructive' : ''}`}
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={`pl-10 pr-10 h-12 ${errors.password ? 'border-destructive' : ''}`}
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
                    />
                    <Label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                      Remember me for 30 days
                    </Label>
                  </div>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    disabled={!isValid || authLoading}
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Sign In Securely
                      </>
                    )}
                  </Button>

                  {/* Demo Credentials */}
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Demo Credentials:</p>
                    <p className="text-xs font-mono">admin@agvgold.com / admin123</p>
                  </div>
                </form>
              ) : (
                /* Auth0 SSO Login */
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Single Sign-On</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Use your organization's secure identity provider
                    </p>
                  </div>

                  <Button
                    onClick={handleAuth0Login}
                    disabled={authLoading}
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Continue with SSO
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Support Links */}
              <div className="space-y-3 pt-4 border-t">
                <div className="text-center">
                  <ForgotPasswordDialog />
                </div>
                <div className="text-center">
                  <Link
                    to="/"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-smooth"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Home
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 This is a secure system. All activities are monitored and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
