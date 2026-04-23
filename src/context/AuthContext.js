// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
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
  const [loading, setLoading] = useState(false); // ✅ false — no session restore on launch

  // ✅ FIX: Do NOT restore session on app launch.
  // Every QR scan / app restart begins fresh from the Welcome screen.
  // (Previously this useEffect called SecureStore.getItemAsync('token')
  //  which resumed the old session automatically.)

  const isAuthenticated = !!user && !user.isGuest;

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await loginUser(email, password);
    const { token: tok, user: u } = res;
    await SecureStore.setItemAsync('token', tok);
    setToken(tok);
    setUser(u);
    return u;
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const res = await registerUser(name, email, password);
    const { token: tok, user: u } = res;
    await SecureStore.setItemAsync('token', tok);
    setToken(tok);
    setUser(u);
    return u;
  };

  // ── Complete profile (phone OTP / guest flow) ──────────────────────────────
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
      // Silently ignore
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
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