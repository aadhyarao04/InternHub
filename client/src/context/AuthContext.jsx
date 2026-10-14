import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('internhub_token') || null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.success && res.data.user) {
        setUser(res.data.user);
        if (res.data.company) {
          setCompany(res.data.company);
        }
      }
    } catch (err) {
      console.warn('Failed to verify token:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data.token) {
      localStorage.setItem('internhub_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.company) {
        setCompany(res.data.company);
      }
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.success && res.data.token) {
      localStorage.setItem('internhub_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.company) {
        setCompany(res.data.company);
      }
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('internhub_token');
    setToken(null);
    setUser(null);
    setCompany(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data.user) {
        setUser(res.data.user);
        if (res.data.company) {
          setCompany(res.data.company);
        }
      }
    } catch (err) {
      console.error('Failed to refresh user:', err.message);
    }
  };

  const updateLocalUser = (partial) => {
    setUser(prev => ({ ...prev, ...partial }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateLocalUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
