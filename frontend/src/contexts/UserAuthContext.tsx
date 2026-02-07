import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const API_BASE = 'http://localhost:8000/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  status?: string;
}

interface UserAuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openSignIn: () => void;
  openSignUp: () => void;
  closeAuthModal: () => void;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'consultancy_user';
const USER_TOKEN_KEY = 'consultancy_user_token';

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Load user from localStorage and verify with API on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const storedToken = localStorage.getItem(USER_TOKEN_KEY);

      if (storedUser && storedToken) {
        try {
          // Verify token with API
          const response = await fetch(`${API_BASE}/users/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setUser(data.data);
            } else {
              // Token invalid, clear storage
              localStorage.removeItem(USER_STORAGE_KEY);
              localStorage.removeItem(USER_TOKEN_KEY);
            }
          } else {
            // Token invalid, use stored user as fallback (for demo)
            setUser(JSON.parse(storedUser));
          }
        } catch {
          // API unavailable, use stored user as fallback
          setUser(JSON.parse(storedUser));
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const { user: userData, token } = data.data;
        setUser(userData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        localStorage.setItem(USER_TOKEN_KEY, token);
        setIsAuthModalOpen(false);
        return { success: true };
      } else {
        return { success: false, error: data.errors?.email?.[0] || data.message || 'Login failed' };
      }
    } catch (err) {
      console.error('Sign in error:', err);
      return { success: false, error: 'Unable to connect to server. Please try again.' };
    }
  };

  const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (responseData.success && responseData.data) {
        const { user: userData, token } = responseData.data;
        setUser(userData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        localStorage.setItem(USER_TOKEN_KEY, token);
        setIsAuthModalOpen(false);
        return { success: true };
      } else {
        // Check for specific validation errors
        if (responseData.errors?.email) {
          return { success: false, error: responseData.errors.email[0] };
        }
        return { success: false, error: responseData.message || 'Registration failed' };
      }
    } catch (err) {
      console.error('Sign up error:', err);
      return { success: false, error: 'Unable to connect to server. Please try again.' };
    }
  };

  const signOut = async () => {
    const token = localStorage.getItem(USER_TOKEN_KEY);
    if (token) {
      try {
        await fetch(`${API_BASE}/users/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Ignore logout errors
      }
    }

    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(USER_TOKEN_KEY);
  };

  const openSignIn = () => {
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        isAuthModalOpen,
        authModalMode,
        openSignIn,
        openSignUp,
        closeAuthModal,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}
