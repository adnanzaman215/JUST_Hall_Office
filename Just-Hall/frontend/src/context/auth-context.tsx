"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthState, clearAuthData, storeToken, storeUser, User } from '@/lib/auth';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const authState = getAuthState();
    setUser(authState.user);
    setToken(authState.token);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      
      // Combine user and student data from login response
      const combinedUser = {
        ...response.user,
        student: response.student || null
      };
      
      // Store token and combined user data
      storeToken(response.token);
      storeUser(combinedUser);
      
      setToken(response.token);
      setUser(combinedUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Clear auth data
    clearAuthData();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    storeUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!(user && token),
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}