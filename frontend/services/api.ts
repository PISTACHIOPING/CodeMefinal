const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:9000';
const TOKEN_KEY = 'codeme_jwt';

const getCookie = (name: string): string | null => {
  const match = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
};

const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const clearCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

export const apiClient = {
  get token() {
    const local = localStorage.getItem(TOKEN_KEY);
    if (local) return local;
    const cookie = getCookie(TOKEN_KEY);
    return cookie || '';
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    setCookie(TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    clearCookie(TOKEN_KEY);
  },
  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(init.headers as Record<string, string> || {}),
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const resp = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`API ${resp.status}: ${text}`);
    }
    // 204 No Content
    if (resp.status === 204) return undefined as T;
    return resp.json() as Promise<T>;
  },
};

export const getApiBase = () => BASE_URL;
