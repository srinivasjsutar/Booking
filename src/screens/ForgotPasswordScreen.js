// src/screens/ForgotPasswordScreen.js
// NOTE: This screen sends a reset request to POST /api/auth/forgot-password
// Wire up email sending (nodemailer / SendGrid) on the backend when ready.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { apiRequest } from '../api/client';
import Input  from '../components/Input';
import Button from '../components/Button';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const validate = () => {
    if (!email.trim())                  { setError('Email is required'); return false; }
    if (!/\S+@\S+\.\S+/.test(email))   { setError('Enter a valid email'); return false; }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: { email: email.trim().toLowerCase() },
      });
      setSent(true);
    } catch (err) {
      // Show success even on 404 to avoid user enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you reset instructions.
          </Text>
        </View>

        {sent ? (
          <View style={styles.successCard}>
            <Text style={styles.successEmoji}>📬</Text>
            <Text style={styles.successTitle}>Check your inbox!</Text>
            <Text style={styles.successText}>
              If an account exists for <Text style={{ fontWeight: '700' }}>{email}</Text>,
              a password reset link has been sent.
            </Text>
            <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Input
              label="Email"
              value={email}
              onChangeText={(v) => { setEmail(v); setError(''); }}
              placeholder="you@example.com"
              keyboardType="email-address"
              error={error}
            />
            <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} style={{ marginTop: 8 }} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  back:     { marginBottom: 24 },
  backText: { fontSize: 15, color: '#16A34A', fontWeight: '600' },

  header:   { alignItems: 'center', marginBottom: 32 },
  emoji:    { fontSize: 52, marginBottom: 12 },
  title:    { fontSize: 28, fontWeight: '800', color: '#14532D', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },

  successCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  successEmoji: { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#14532D', marginBottom: 8 },
  successText:  { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  link: { color: '#16A34A', fontWeight: '700', fontSize: 15 },
});

export default ForgotPasswordScreen;