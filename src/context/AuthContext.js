// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { loginUser, registerUser, getMe } from "../api/auth";
import { getKycStatus } from "../api/kycApi";

const AuthContext = createContext(null);
const TOKEN_KEY = "auth_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on app start ──────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored) {
          const data = await getMe(stored);
          setToken(stored);

          // Fetch fresh KYC status and merge into user object
          let kycData = { status: "not_started" };
          try {
            const kycRes = await getKycStatus(stored);
            if (kycRes.success) kycData = kycRes.kyc;
          } catch (_) {
            /* offline, use default */
          }

          setUser({ ...data.user, kyc: kycData });
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await loginUser(email, password);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setToken(data.token);

    let kycData = { status: "not_started" };
    try {
      const kycRes = await getKycStatus(data.token);
      if (kycRes.success) kycData = kycRes.kyc;
    } catch (_) {}

    setUser({ ...data.user, kyc: kycData });
    return data;
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const data = await registerUser(name, email, password);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser({ ...data.user, kyc: { status: "not_started" } });
    return data;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  // ── Refresh KYC (call after each KYC step completes) ─────────────────────
  const refreshKyc = async () => {
    if (!token) return;
    try {
      const kycRes = await getKycStatus(token);
      if (kycRes.success) {
        setUser((prev) => ({ ...prev, kyc: kycRes.kyc }));
      }
    } catch (err) {
      console.error("KYC refresh error:", err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, refreshKyc }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
