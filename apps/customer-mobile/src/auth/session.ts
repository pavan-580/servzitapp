import * as SecureStore from 'expo-secure-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const SESSION_KEY = 'servzit.session';
type TokenPair = { accessToken: string; refreshToken: string };

export type SignedInUser = { id: string; phoneE164: string; displayName: string | null; roles: string[] };

export async function storeSession(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ accessToken, refreshToken } satisfies TokenPair));
}

export async function restoreSession(): Promise<SignedInUser | null> {
  if (!API_BASE) return null;
  try {
    const stored = await SecureStore.getItemAsync(SESSION_KEY);
    if (!stored) return null;
    const pair = JSON.parse(stored) as Partial<TokenPair>;
    if (typeof pair.refreshToken !== 'string') throw new Error('Stored session is invalid');
    const response = await fetch(`${API_BASE}/auth/session/refresh`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: pair.refreshToken }),
    });
    if (!response.ok) throw new Error('Session expired');
    const tokens = await response.json() as { accessToken: string; refreshToken: string; user: SignedInUser };
    await storeSession(tokens.accessToken, tokens.refreshToken);
    return tokens.user;
  } catch {
    await clearSession().catch(() => undefined);
    return null;
  }
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function authenticatedFetch(path: string, init: RequestInit = {}) {
  if (!API_BASE) throw new Error('The marketplace API is not configured for this app build.');
  const send = async (token: string | null) => fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const readPair = async (): Promise<Partial<TokenPair>> => {
    const stored = await SecureStore.getItemAsync(SESSION_KEY);
    return stored ? JSON.parse(stored) as Partial<TokenPair> : {};
  };
  const first = await send((await readPair()).accessToken ?? null);
  if (first.status !== 401) return first;
  const user = await restoreSession();
  if (!user) return first;
  return send((await readPair()).accessToken ?? null);
}

export async function signOut() {
  try {
    const user = await restoreSession();
    const stored = await SecureStore.getItemAsync(SESSION_KEY);
    const access = stored ? (JSON.parse(stored) as Partial<TokenPair>).accessToken : null;
    if (user && access && API_BASE) {
      const response = await fetch(`${API_BASE}/auth/session/logout`, { method: 'POST', headers: { Authorization: `Bearer ${access}` } });
      if (!response.ok) throw new Error('Server could not revoke the session.');
    }
  } finally {
    await clearSession();
  }
}

export function apiBase() { return API_BASE; }
