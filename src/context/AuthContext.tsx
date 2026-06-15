import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser } from '../api/auth';
import { login as apiLogin, register as apiRegister, loginWithGoogle as apiLoginWithGoogle, getMe, updateMe } from '../api/auth';
import type { DistanceUnit } from '../types';
import { setToken, clearToken, getToken } from '../api/client';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateUser: (fields: { name?: string; distanceUnit?: DistanceUnit }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { token, user } = await apiLogin(email, password);
    setToken(token);
    setUser(user);
  }

  async function loginWithGoogle(idToken: string) {
    const { token, user } = await apiLoginWithGoogle(idToken);
    setToken(token);
    setUser(user);
  }

  async function register(email: string, password: string, name: string) {
    const { token, user } = await apiRegister(email, password, name);
    setToken(token);
    setUser(user);
  }

  async function updateUser(fields: { name?: string; distanceUnit?: DistanceUnit }) {
    const updated = await updateMe(fields);
    setUser(updated);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
