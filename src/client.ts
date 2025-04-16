import { config } from './config';

export async function request<T = any>(
  path: string,
  method: string = 'GET',
  body?: any
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.token}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(`${config.serverUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  }

  return await res.json();
}
