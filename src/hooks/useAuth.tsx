import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/services/apiClient';
import { LoginResponse } from '@/types/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  loginTime: string;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithAuth0: () => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('auth_user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        // Set the token in API client
        apiClient.setAuthToken(token);
        setUser({
          ...parsedUser,
          loginTime: new Date().toISOString()
        });
      } else {
        apiClient.clearAuthToken();
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      apiClient.clearAuthToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { email, password: '***' });
      
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password
      });
      
      console.log('Login response received:', response);
      
      // Set token in API client
      apiClient.setAuthToken(response.data.token);
      
      const userData: User = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: `${response.data.user.firstName} ${response.data.user.lastName}`,
        role: response.data.user.role,
        loginTime: new Date().toISOString(),
      };
      
      console.log('Created user data:', userData);
      
      // Store in localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithAuth0 = async (): Promise<void> => {
    // Auth0 integration can be implemented later if needed
    throw new Error('Auth0 login not implemented yet');
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear everything regardless of API success
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      apiClient.clearAuthToken();
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        checkAuth();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithAuth0,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;