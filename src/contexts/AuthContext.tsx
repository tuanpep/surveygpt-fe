import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { User, SignInInput, SignUpInput, ForgotPasswordInput } from '@/types/api';
import { signIn as apiSignIn, signUp as apiSignUp, forgotPassword as apiForgotPassword, getMe, signOut as apiSignOut, isAuthenticated as checkAuth } from '@/services/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  forgotPassword: (input: ForgotPasswordInput) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const fetchUser = async () => {
      if (!checkAuth()) {
        if (mountedRef.current) setIsLoading(false);
        return;
      }
      try {
        const me = await getMe();
        if (mountedRef.current) setUser(me);
      } catch {
        apiSignOut();
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    };
    fetchUser();

    const handleSignOut = () => { if (mountedRef.current) setUser(null); };
    window.addEventListener('auth:signout', handleSignOut);
    return () => {
      mountedRef.current = false;
      window.removeEventListener('auth:signout', handleSignOut);
    };
  }, []);

  const signIn = useCallback(async (input: SignInInput) => {
    await apiSignIn(input);
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      apiSignOut();
      throw new Error('Failed to complete sign in');
    }
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    await apiSignUp(input);
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      apiSignOut();
      throw new Error('Failed to complete sign up');
    }
  }, []);

  const forgotPassword = useCallback(async (input: ForgotPasswordInput) => {
    await apiForgotPassword(input);
  }, []);

  const signOut = useCallback(() => {
    apiSignOut();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    forgotPassword,
    signOut,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
