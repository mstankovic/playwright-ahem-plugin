// src/api/auth.ts
import { ahemConfig } from '../config';

let cachedToken: string | null = null;

export const getToken = async (): Promise<string> => {
  if (cachedToken) return cachedToken;

  const response = await fetch(`${ahemConfig.baseUrl}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Failed to authenticate with AHEM: ${response.status}`);
  }

  const { accessToken } = await response.json();
  cachedToken = accessToken;
  return accessToken;
};

// Optional: call this after each test if you want to invalidate cache
export const clearToken = () => {
  cachedToken = null;
};
