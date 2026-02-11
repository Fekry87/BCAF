import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authApi } from '@/services/auth';
import type { LoginCredentials, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Token refresh interval (every 6 days to stay fresh before 7-day expiry)
const TOKEN_REFRESH_INTERVAL = 6 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to get user - if cookie is valid, this will succeed
        const response = await authApi.getUser();
        setState({
          user: response.data,
          token: null, // Token is in HttpOnly cookie, not accessible
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    void initAuth();
  }, []);

  // Refresh token periodically
  const refreshToken = useCallback(async () => {
    if (!state.isAuthenticated) return;

    try {
      await authApi.refresh();
    } catch {
      // Token refresh failed, user needs to re-login
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [state.isAuthenticated]);

  // Set up periodic token refresh
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const intervalId = setInterval(() => {
      void refreshToken();
    }, TOKEN_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [state.isAuthenticated, refreshToken]);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    const { user } = response.data;

    setState({
      user,
      token: null, // Token is in HttpOnly cookie
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
