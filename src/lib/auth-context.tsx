import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiClient } from './api-client';
import type { AuthUser, LoginPayload } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  initializing: boolean;
  authenticating: boolean;
  authError?: string;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_STORAGE_KEY = 'phishlab-auth-token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setInitializing(false);
      return;
    }

    apiClient.setAuthToken(storedToken);
    setToken(storedToken);

    void apiClient
      .getCurrentUser()
      .then((profile) => {
        setUser(profile);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        apiClient.setAuthToken(null);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setInitializing(false);
      });
  }, []);

  const login = useCallback(async ({ email, password }: LoginPayload) => {
    setAuthenticating(true);
    setAuthError(undefined);
    try {
      const response = await apiClient.login({ email, password });
      setUser(response.user);
      setToken(response.token);
      apiClient.setAuthToken(response.token);
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in';
      setAuthError(message);
      throw error;
    } finally {
      setAuthenticating(false);
      setInitializing(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthError(undefined);
    apiClient.setAuthToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initializing,
      authenticating,
      authError,
      login,
      logout,
    }),
    [authError, authenticating, initializing, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
