import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    authService.logout();
    setAdmin(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    const token = authService.getToken();

    if (!token) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    authService
      .me()
      .then((profile) => {
        if (mounted) setAdmin(profile);
      })
      .catch(() => {
        if (mounted) {
          authService.logout();
          setAdmin(null);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => clearAuth();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [clearAuth]);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setAdmin(data.admin);
    return data;
  }, []);

  const register = useCallback(async (details) => {
    const data = await authService.register(details);
    setAdmin(data.admin);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({ admin, loading, isAuthenticated: Boolean(admin), login, register, logout }),
    [admin, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
