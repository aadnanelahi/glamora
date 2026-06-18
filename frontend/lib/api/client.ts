const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error: string | null;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('glamora_access_token');
      this.refreshToken = localStorage.getItem('glamora_refresh_token');
    }
  }

  private setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('glamora_access_token', access);
      localStorage.setItem('glamora_refresh_token', refresh);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('glamora_access_token');
      localStorage.removeItem('glamora_refresh_token');
      localStorage.removeItem('glamora_user');
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) throw new Error('No refresh token');
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    });
    if (!res.ok) {
      this.clearTokens();
      throw new Error('Session expired');
    }
    const json: ApiResponse<{ access_token: string; refresh_token: string }> = await res.json();
    this.setTokens(json.data.access_token, json.data.refresh_token);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    tenantId?: string,
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.accessToken) headers['Authorization'] = `Bearer ${this.accessToken}`;
    if (tenantId) headers['X-Tenant-ID'] = tenantId;

    let res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && this.refreshToken) {
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshAccessToken().finally(() => {
          this.refreshPromise = null;
        });
      }
      await this.refreshPromise;
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    }

    return res.json();
  }

  get<T>(path: string, tenantId?: string) {
    return this.request<T>('GET', path, undefined, tenantId);
  }

  post<T>(path: string, body?: Record<string, unknown>, tenantId?: string) {
    return this.request<T>('POST', path, body, tenantId);
  }

  put<T>(path: string, body?: Record<string, unknown>, tenantId?: string) {
    return this.request<T>('PUT', path, body, tenantId);
  }

  delete<T>(path: string, tenantId?: string) {
    return this.request<T>('DELETE', path, undefined, tenantId);
  }

  async login(email: string, password: string, tenantSubdomain?: string) {
    const res = await this.post<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }>('/api/v1/auth/login', { email, password, tenant_subdomain: tenantSubdomain });
    if (res.success) {
      this.setTokens(res.data.access_token, res.data.refresh_token);
    }
    return res;
  }

  async register(data: {
    email: string;
    password: string;
    name_en: string;
    name_ar?: string;
    phone?: string;
    company_name_en: string;
    company_name_ar?: string;
    locale?: string;
  }) {
    return this.post<{
      id: string;
      email: string;
      name_en: string;
      name_ar?: string;
      role: string;
      tenant_id: string;
      locale: string;
      is_active: boolean;
    }>('/api/v1/auth/register', data);
  }

  async me() {
    return this.get<{
      id: string;
      email: string;
      name_en: string;
      name_ar?: string;
      role: string;
      tenant_id: string;
      locale: string;
      is_active: boolean;
    }>('/api/v1/auth/me');
  }
}

export const api = new ApiClient();
export type { ApiResponse };
