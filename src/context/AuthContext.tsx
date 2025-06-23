// src/contexts/AuthContext.tsx
'use client';

import { BACKEND_API_URL } from '@/constants/apiConstants';
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect
} from 'react';

interface User {
  id: string;                // now a string (UUID)
  name: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  email: string;             // we'll keep email in our User object too
  countryCode: string;
  phoneNumber: string;
  address: string;
  profileImage: string;
  verificationDocument: string;
  isDocumentVerified: boolean;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  authFetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // On mount, load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      const { token: t, user: u } = JSON.parse(saved);
      // Only restore if user is an admin
      if (u.role === 'ADMIN') {
        setToken(t);
        setUser(u);
      } else {
        // Clear non-admin data
        localStorage.removeItem('auth');
      }
    }
  }, []);

  // Wrap fetch to include Bearer token
  const authFetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    return fetch(input, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: token ? `Bearer ${token}` : ''
      },
    });
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting admin login for:', email);
      
      const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-frontend-type': 'admin'  // Changed back to lowercase as Express lowercases all headers
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        // Only allow ADMIN role to login
        if (data.user.role !== 'ADMIN') {
          console.error('Non-admin user attempted to login to admin portal');
          return false;
        }

        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('auth', JSON.stringify({ 
          token: data.token, 
          user: data.user 
        }));
        return true;
      }

      // Show the actual error message from the backend
      console.error('Login failed:', data.error);
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth');
  };

  const value: AuthContextType = {
    user,
    setUser,
    token,
    login,
    logout,
    isAuthenticated: Boolean(user && token),
    authFetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be inside AuthProvider');
  }
  return ctx;
}
