// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Input  from '../components/Input';
import Button from '../components/Button';

const LoginScreen = ({ navigation }) => {
  const { login, completeProfile } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim())                    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email';
    if (!password)                        e.password = 'Password is required';
    else if (password.length < 6)         e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Try real backend login
      await login(email.trim().toLowerCase(), password);
      // Pop back to wherever the user came from (e.g. ProfileScreen in AppStack).
      // If in AuthStack, RootNavigator auto-switches — popToTop() throws and is caught.
      try { navigation.popToTop(); } catch { /* AuthStack handles via RootNavigator */ }
    } catch (err) {
      // If backend is unreachable (HTML response / network error), offer demo login
      const isNetworkError = err.message?.includes('<') || err.message?.includes('network') || err.message?.includes('fetch');
      if (isNetworkError) {
        Alert.alert(
          'Server Unavailable',
          'Could not reach the server. Continue in demo mode?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Demo Login',
              onPress: () => completeProfile({
                name:  email.split('@')[0],
                email: email.trim().toLowerCase(),
                gender: 'other',
              }),
            },
          ]
        );
      } else {
        Alert.alert('Login Failed', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const clear = (field) => setErrors((p) => ({ ...p, [field]: '' }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🌿</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Input
            label="Email"
            value={email}
            onChangeText={(v) => { setEmail(v); clear('email'); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={(v) => { setPassword(v); clear('password'); }}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button title="Sign In" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header:    { alignItems: 'center', marginBottom: 36 },
  emoji:     { fontSize: 52, marginBottom: 12 },
  title:     { fontSize: 30, fontWeight: '800', color: '#14532D', marginBottom: 4 },
  subtitle:  { fontSize: 15, color: '#6B7280' },
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
  forgotBtn: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 4 },
  forgotText:{ fontSize: 13, color: '#16A34A', fontWeight: '600' },
  footer:    { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText:{ fontSize: 14, color: '#6B7280' },
  link:      { fontSize: 14, color: '#16A34A', fontWeight: '700' },
});

export default LoginScreen;