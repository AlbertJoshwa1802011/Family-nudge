import { Platform } from 'react-native';

const DEFAULT_API_URL = Platform.select({
  ios: 'http://localhost:4000/api',
  android: 'http://10.0.2.2:4000/api',
  default: 'http://localhost:4000/api',
});

let API_URL = DEFAULT_API_URL;
let authToken: string | null = null;

export function setApiUrl(url: string) {
  API_URL = url;
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error ?? error.message ?? `Request failed (${response.status})`);
  }

  return response.json();
}
