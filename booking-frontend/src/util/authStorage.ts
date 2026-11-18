import type { AuthUser } from "../context/AuthContext";

const TOKEN_KEY = "eventnest_token";
const USER_KEY = "eventnest_user";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function storeAuthSession(token: string, user: AuthUser, rememberMe: boolean): void {
  const target = rememberMe ? localStorage : sessionStorage;
  const other = rememberMe ? sessionStorage : localStorage;
  other.removeItem(TOKEN_KEY);
  other.removeItem(USER_KEY);
  target.setItem(TOKEN_KEY, token);
  target.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredAuthUser(): string | null {
  return localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
}

export function updateStoredAuthUser(user: AuthUser): void {
  const target = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
  target.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
