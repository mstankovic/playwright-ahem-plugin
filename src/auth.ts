import { config } from './config';

export async function authenticate(): Promise<void> {
  const response = await fetch(`${config.serverUrl}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Auth failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data?.token) {
    throw new Error('No token returned from authentication');
  }

  config.token = data.token;
}
