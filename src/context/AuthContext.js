// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, registerUser, getMe } from '../api/auth';

const AuthContext = createContext(null);

const TOKEN_KEY   = 'auth_token';
const PROFILE_KEY = 'user_profile';

// Helper: guest/local tokens are NOT real JWTs — never send them to the server
const isLocalToken = (token) => typeof token === 'string' && token.startsWith('local_');

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

          // ✅ FIX: Guest/local token — skip the API call entirely.
          // Sending a "local_..." string to the server causes jwt.verify() to
          // throw, which returns 401 "Token invalid or expired" on every launch.
          if (isLocalToken(stored)) {
            const cached = await SecureStore.getItemAsync(PROFILE_KEY);
            if (cached) {
              setToken(stored);
              setUser(JSON.parse(cached));
            } else {
              // No cached profile either — clear and force re-login
              await SecureStore.deleteItemAsync(TOKEN_KEY);
            }

          } else {
            // Real JWT — validate with the server as before
            try {
              const data = await getMe(stored);
              setToken(stored);
              setUser(data.user);
            } catch {
              // Server unreachable or token truly expired — fall back to cache
              const cached = await SecureStore.getItemAsync(PROFILE_KEY);
              if (cached) {
                setToken(stored);
                setUser(JSON.parse(cached));
              } else {
                await SecureStore.deleteItemAsync(TOKEN_KEY);
              }
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
  const completeProfile = async (profileData) => {
    const guestUser = {
      id:         profileData.email || profileData.phone || 'guest',
      name:       profileData.name,
      email:      profileData.email || `${profileData.phone}@phone.com`,
      gender:     profileData.gender,
      isVerified: true,
      isGuest:    true,   // ✅ flag so UI can prompt full login for protected actions
    };

    const guestToken = `local_${Date.now()}`;
    await SecureStore.setItemAsync(TOKEN_KEY,   guestToken);
    await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(guestUser));

    setToken(guestToken);
    setUser(guestUser);
  };

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(PROFILE_KEY);
    setToken(null);
    setUser(null);
  };

  // ── Expose helper so screens can guard protected API calls ────────────────────
  const isAuthenticated = token && !isLocalToken(token);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAuthenticated,   // ✅ true only for real JWT users
      login, register, completeProfile, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};