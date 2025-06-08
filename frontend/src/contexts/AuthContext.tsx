import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
      // In a real app, you'd validate the token with the server
      setUser({
        userId: parseInt(userId),
        username: localStorage.getItem('username') || '',
        email: localStorage.getItem('email') || '',
        createdAt: ''
      });
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response: AuthResponse = await apiService.login(credentials);
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userId', response.userId.toString());
      localStorage.setItem('email', credentials.email);
      
      setUser({
        userId: response.userId,
        username: '', // Would be returned from API in real implementation
        email: credentials.email,
        createdAt: ''
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      const response: AuthResponse = await apiService.register(credentials);
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userId', response.userId.toString());
      localStorage.setItem('username', credentials.username);
      localStorage.setItem('email', credentials.email);
      
      setUser({
        userId: response.userId,
        username: credentials.username,
        email: credentials.email,
        createdAt: ''
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};