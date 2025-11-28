
import { apiClient, getApiBase } from './api';
import { User } from '../types';

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const tokenResp = await apiClient.request<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    apiClient.setToken(tokenResp.access_token);
    return this.me();
  },

  async signup(email: string, password: string, name: string): Promise<User> {
    const tokenResp = await apiClient.request<TokenResponse>('/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    apiClient.setToken(tokenResp.access_token);
    return this.me();
  },

  async me(): Promise<User> {
    return apiClient.request<User>('/api/v1/auth/me');
  },

  async loginWithGoogle(): Promise<never> {
    // Redirect flow
    window.location.href = `${getApiBase()}/api/v1/auth/google/login`;
    // This never resolves in SPA; handled by backend redirect.
    return new Promise(() => {
      /* noop */
    });
  },

  logout() {
    apiClient.clearToken();
  },

  restoreToken(): string | null {
    return apiClient.token || null;
  },
};
