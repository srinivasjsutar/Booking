// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, getMe } from '../api/auth';
import { getKycStatus } from '../api/kycApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on app launch ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          const me = await getMe(storedToken);
          setUser(me.user ?? me);
          setToken(storedToken);
        }
      } catch {
        // Token expired or invalid — start fresh
        await AsyncStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── isAuthenticated: true only for real email/password users ──────────────
  const isAuthenticated = !!user && !user.isGuest;

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await loginUser(email, password);
    const { token: tok, user: u } = res;
    await AsyncStorage.setItem('token', tok);
    setToken(tok);
    setUser(u);
    return u;
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const res = await registerUser(name, email, password);
    const { token: tok, user: u } = res;
    await AsyncStorage.setItem('token', tok);
    setToken(tok);
    setUser(u);
    return u;
  };

  // ── Complete profile (after phone OTP signup) ──────────────────────────────
  const completeProfile = async (profileData) => {
    const updated = { ...(user || {}), ...profileData };
    setUser(updated);
  };

  // ── Refresh KYC status from server ────────────────────────────────────────
  const refreshKyc = async () => {
    if (!token) return;
    try {
      const res = await getKycStatus(token);
      setUser((prev) => ({
        ...prev,
        kyc: res.kyc ?? prev?.kyc,
      }));
    } catch {
      // Silently ignore — KYC status stays as-is
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        completeProfile,
        refreshKyc,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};