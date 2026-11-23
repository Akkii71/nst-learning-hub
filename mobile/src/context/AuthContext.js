import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved session on app startup
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await AsyncStorage.getItem('@nst_token');
        const storedUser = await AsyncStorage.getItem('@nst_user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          api.setAuthToken(storedToken);
        }
      } catch (err) {
        console.error('Failed to load stored auth session:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  // Login handler
  async function login(email, password) {
    const res = await api.login({ email, password });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      api.setAuthToken(res.token);
      await AsyncStorage.setItem('@nst_token', res.token);
      await AsyncStorage.setItem('@nst_user', JSON.stringify(res.user));
    }
    return res;
  }

  // Register handler (students only)
  async function register(data) {
    const res = await api.register(data);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      api.setAuthToken(res.token);
      await AsyncStorage.setItem('@nst_token', res.token);
      await AsyncStorage.setItem('@nst_user', JSON.stringify(res.user));
    }
    return res;
  }

  // Logout handler
  async function logout() {
    setToken(null);
    setUser(null);
    api.setAuthToken(null);
    await AsyncStorage.removeItem('@nst_token');
    await AsyncStorage.removeItem('@nst_user');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isReviewer: user?.role === 'REVIEWER',
        login,
        register,
        logout,
      }}
    >
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
