// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, registerUser, getMe } from '../api/auth';

const AuthContext = createContext(null);

const TOKEN_KEY   = 'auth_token';
const PROFILE_KEY = 'user_profile';

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // ── On app start: restore session ────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored) {
          try {
            // Try to fetch fresh user from API
            const data = await getMe(stored);
            setToken(stored);
            setUser(data.user);
          } catch {
            // API unreachable — restore from local profile cache
            const cached = await SecureStore.getItemAsync(PROFILE_KEY);
            if (cached) {
              setToken(stored);
              setUser(JSON.parse(cached));
            } else {
              await SecureStore.deleteItemAsync(TOKEN_KEY);
            }
          }
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ── Login (email + password) ──────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await loginUser(email, password);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // ── Register ──────────────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const data = await registerUser(name, email, password);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // ── Complete profile after email OTP verify ───────────────────────────────────
  // Called from ProfileSetupScreen — sets user in context so RootNavigator
  // automatically switches from AuthStack → AppStack (no manual navigation.replace needed)
  const completeProfile = async (profileData) => {
    const guestUser = {
      id:    profileData.email || profileData.phone || 'guest',
      name:  profileData.name,
      email: profileData.email || `${profileData.phone}@phone.com`,
      gender: profileData.gender,
      isVerified: true,
    };

    // Persist locally so session survives app restart
    const guestToken = `local_${Date.now()}`;
    await SecureStore.setItemAsync(TOKEN_KEY,   guestToken);
    await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(guestUser));

    setToken(guestToken);
    setUser(guestUser);       // ← this triggers RootNavigator to show AppStack
  };

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(PROFILE_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, completeProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};