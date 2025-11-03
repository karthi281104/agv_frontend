// API Configuration and Base Setup
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API Client with authentication support
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Safely get token from localStorage if available
    try {
      if (typeof window !== 'undefined') {
        this.token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      } else {
        this.token = null;
      }
    } catch {
      this.token = null;
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    if (import.meta.env.DEV) {
      console.log('API Request:', {
        url,
        method: config.method || 'GET',
        headers: config.headers,
        body: config.body
      });
    }

    try {
      const response = await fetch(url, config);
      
      if (import.meta.env.DEV) {
        console.log('API Response Status:', response.status);
      }
      
      if (!response.ok) {
        const responseText = await response.text();
        if (import.meta.env.DEV) {
          console.log('Error response body:', responseText);
        }
        
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          this.token = null;
          window.location.href = '/login';
          throw new Error('Authentication required');
        }
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: 'Network error' };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if (import.meta.env.DEV) {
        console.log('API Response Data:', responseData);
      }
      return responseData;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  setAuthToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearAuthToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  refreshToken() {
    // Update token from localStorage in case it was refreshed elsewhere
    try {
      if (typeof window !== 'undefined') {
        this.token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      } else {
        this.token = null;
      }
    } catch {
      this.token = null;
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload method
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>, options?: { fieldName?: string }): Promise<T> {
    const formData = new FormData();
    const fieldName = options?.fieldName || 'file';
    formData.append(fieldName, file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export API base URL for direct use if needed
export { API_BASE_URL };