import * as SecureStore from 'expo-secure-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const SESSION_KEY = 'servzit.provider-session';
type TokenPair = { accessToken: string; refreshToken: string };
export type SignedInUser = { id: string; phoneE164: string; displayName: string | null; roles: string[] };

export async function storeSession(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ accessToken, refreshToken } satisfies TokenPair));
}

async function readPair(): Promise<Partial<TokenPair>> {
  const stored = await SecureStore.getItemAsync(SESSION_KEY);
  return stored ? JSON.parse(stored) as Partial<TokenPair> : {};
}

export async function restoreSession(): Promise<SignedInUser | null> {
  if (!API_BASE) return null;
  try {
    const { refreshToken } = await readPair();
    if (!refreshToken) return null;
    const response = await fetch(`${API_BASE}/auth/session/refresh`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) throw new Error('Session expired');
    const tokens = await response.json() as TokenPair & { user: SignedInUser };
    await storeSession(tokens.accessToken, tokens.refreshToken);
    return tokens.user;
  } catch {
    await clearSession().catch(() => undefined);
    return null;
  }
}

export async function authenticatedFetch(path: string, init: RequestInit = {}) {
  if (!API_BASE) throw new Error('The provider API is not configured for this app build.');
  const send = async (accessToken: string | null) => fetch(`${API_BASE}${path}`, {
    ...init, headers: { ...(init.headers ?? {}), ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
  });
  const first = await send((await readPair()).accessToken ?? null);
  if (first.status !== 401) return first;
  if (!(await restoreSession())) return first;
  return send((await readPair()).accessToken ?? null);
}

export async function signOut() {
  try {
    const user = await restoreSession();
    const { accessToken } = await readPair();
    if (user && accessToken && API_BASE) {
      const response = await fetch(`${API_BASE}/auth/session/logout`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
      if (!response.ok) throw new Error('Server could not revoke the session.');
    }
  } finally { await clearSession(); }
}

export async function clearSession() { await SecureStore.deleteItemAsync(SESSION_KEY); }
export function apiBase() { return API_BASE; }
