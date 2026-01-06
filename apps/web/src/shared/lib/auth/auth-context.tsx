'use client';

import { createContext, ReactNode, useContext } from 'react';
import { UserRole } from './permissions';

export interface User {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  initialState?: {
    user: any;
    isAuthenticated: boolean;
  };
}

export function AuthProvider({ children, initialState }: AuthProviderProps) {
  const value: AuthContextType = {
    user: initialState?.user ?? null,
    isAuthenticated: initialState?.isAuthenticated ?? false,
    isLoading: false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to get current user's role
export function useUserRole(): UserRole | null {
  const { user } = useAuth();
  return user?.role ?? null;
}
