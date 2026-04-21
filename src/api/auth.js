// src/api/auth.js
import { apiRequest } from './client';

export const registerUser = (name, email, password) =>
  apiRequest('/auth/register', { method: 'POST', body: { name, email, password } });

export const loginUser = (email, password) =>
  apiRequest('/auth/login', { method: 'POST', body: { email, password } });

export const getMe = (token) =>
  apiRequest('/user/me', { token });