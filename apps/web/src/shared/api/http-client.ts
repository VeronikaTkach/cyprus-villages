import { appConfig } from '@/shared/config';

export async function httpGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${appConfig.apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

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
