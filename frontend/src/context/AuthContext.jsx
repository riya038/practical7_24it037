import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, fetchCurrentUser } from '../api/authApi';
import { setUnauthorizedHandler } from '../api/taskApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_jwt_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('taskflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Logout handler
  const logout = useCallback((reason = null) => {
    localStorage.removeItem('taskflow_jwt_token');
    localStorage.removeItem('taskflow_user');
    setToken(null);
    setUser(null);
    if (reason) {
      setAuthError(reason);
    }
  }, []);

  // Set 401 interceptor handler
  useEffect(() => {
    setUnauthorizedHandler((msg) => {
      logout(msg || 'Your session expired. Please log in again.');
    });
  }, [logout]);

  // Load user profile on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await fetchCurrentUser(token);
        setUser(profile);
        localStorage.setItem('taskflow_user', JSON.stringify(profile));
      } catch (err) {
        console.warn('Invalid token during startup profile fetch, logging out:', err.message);
        logout('Session expired. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token, logout]);

  // Login action
  const login = async ({ email, password }) => {
    setAuthError(null);
    const data = await loginUser({ email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('taskflow_jwt_token', data.token);
    localStorage.setItem('taskflow_user', JSON.stringify(data.user));
    return data;
  };

  // Register action
  const register = async ({ name, email, password }) => {
    setAuthError(null);
    const data = await registerUser({ name, email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('taskflow_jwt_token', data.token);
    localStorage.setItem('taskflow_user', JSON.stringify(data.user));
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        loading,
        authError,
        setAuthError,
        login,
        register,
        logout,
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
