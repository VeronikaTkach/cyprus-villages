import { appConfig } from '@/shared/config';
import { useAuthStore } from '@/shared/lib/auth';

function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleUnauthorized(): void {
  useAuthStore.getState().clearToken();
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    window.location.replace('/admin/login');
  }
}

export async function httpGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${appConfig.apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // ignore — keep status text
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export async function httpPost<T>(path: string, body: unknown): Promise<T> {
  return httpGet<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function httpPatch<T>(path: string, body: unknown): Promise<T> {
  return httpGet<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
