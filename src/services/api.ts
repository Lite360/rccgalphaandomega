import type { Parish } from '../types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Include stored token in Authorization header if present
    const token = localStorage.getItem('session_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        credentials: 'include', // Include HTTP-only cookies
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `Request failed with status ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data !== undefined ? data.data : data,
        message: data.message,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error occurred. Please check your connection.',
      };
    }
  }

  // Auth APIs
  async getParishes() {
    return this.request<{ parishes: Parish[] }>('/api/parishes');
  }

  async register(params: { fullName: string; parishId: string; phoneE164: string }) {
    return this.request<{ challengeId: string; phoneE164: string; devOtp?: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async login(params: { phoneE164: string }) {
    return this.request<{ challengeId: string; phoneE164: string; devOtp?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async verifyOtp(params: { phoneE164: string; otpCode: string; purpose: string }) {
    return this.request<{ user?: any; admin?: any; token: string; role: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async adminLogin(params: { username: string; password: string }) {
    return this.request<{ admin: any; token: string; role: 'admin' }>('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getMe() {
    return this.request<{ user?: any; admin?: any; role: 'user' | 'admin' | null }>('/api/me');
  }

  async logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  // Generic Request Handlers
  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
