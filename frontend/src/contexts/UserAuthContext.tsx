import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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

const USER_TOKEN_KEY = 'user_auth_token';

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(USER_TOKEN_KEY);

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setUser(data.data);
          } else {
            localStorage.removeItem(USER_TOKEN_KEY);
          }
        } else {
          localStorage.removeItem(USER_TOKEN_KEY);
        }
      } catch {
        // Keep token, might be network issue
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
        if (token) {
          localStorage.setItem(USER_TOKEN_KEY, token);
        }
        setUser(userData);
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

  const signUp = async (signUpData: SignUpData): Promise<{ success: boolean; error?: string }> => {
    try {
      const payload = {
        name: `${signUpData.firstName} ${signUpData.lastName}`,
        email: signUpData.email,
        password: signUpData.password,
        company: signUpData.company,
        phone: signUpData.phone,
      };

      const response = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (responseData.success && responseData.data) {
        const { user: userData, token } = responseData.data;
        if (token) {
          localStorage.setItem(USER_TOKEN_KEY, token);
        }
        setUser(userData);
        setIsAuthModalOpen(false);
        return { success: true };
      } else {
        if (responseData.errors?.email) {
          return { success: false, error: responseData.errors.email[0] };
        }
        if (responseData.errors?.name) {
          return { success: false, error: responseData.errors.name[0] };
        }
        if (responseData.errors?.password) {
          return { success: false, error: responseData.errors.password[0] };
        }
        return { success: false, error: responseData.message || 'Registration failed' };
      }
    } catch (err) {
      console.error('Sign up error:', err);
      return { success: false, error: 'Unable to connect to server. Please try again.' };
    }
  };

  const signOut = () => {
    localStorage.removeItem(USER_TOKEN_KEY);
    setUser(null);
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
