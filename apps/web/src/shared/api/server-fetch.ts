import { appConfig } from '@/shared/config';

/**
 * Thin fetch wrapper for use in React Server Components.
 * Does not handle auth — only for public, unauthenticated API endpoints.
 */
export async function serverGet<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${appConfig.apiUrl}${path}`, {
    next: { revalidate },
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}
