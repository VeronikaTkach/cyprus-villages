import { appConfig } from '@/app/config';

export async function httpGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${appConfig.apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
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
