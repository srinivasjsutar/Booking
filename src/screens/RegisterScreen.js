// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Input  from '../components/Input';
import Button from '../components/Button';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();

  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim())              e.name     = 'Name is required';
    else if (name.trim().length < 2) e.name   = 'Name must be at least 2 characters';
    if (!email.trim())             e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password)                 e.password = 'Password is required';
    else if (password.length < 6)  e.password = 'Password must be at least 6 characters';
    if (!confirm)                  e.confirm  = 'Please confirm your password';
    else if (confirm !== password) e.confirm  = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      // Navigation handled automatically by auth state change in RootNavigator
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
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
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us today</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={(v) => { setName(v); clear('name'); }}
            placeholder="John Doe"
            autoCapitalize="words"
            error={errors.name}
          />
          <Input
            label="Email"
            value={email}
            onChangeText={(v) => { setEmail(v); clear('email'); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={(v) => { setPassword(v); clear('password'); }}
            placeholder="Min. 6 characters"
            secureTextEntry
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            value={confirm}
            onChangeText={(v) => { setConfirm(v); clear('confirm'); }}
            placeholder="Re-enter password"
            secureTextEntry
            error={errors.confirm}
          />

          {/* Password strength hint */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              {['Weak', 'Fair', 'Strong'].map((lvl, i) => {
                const score = password.length < 6 ? 0 : password.length < 10 ? 1 : 2;
                return (
                  <View
                    key={lvl}
                    style={[
                      styles.strengthBar,
                      i <= score && styles[`strength${lvl}`],
                    ]}
                  />
                );
              })}
              <Text style={styles.strengthLabel}>
                {password.length < 6 ? 'Weak' : password.length < 10 ? 'Fair' : 'Strong'}
              </Text>
            </View>
          )}

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By registering you agree to our{' '}
          <Text style={styles.link}>Terms of Service</Text> &{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Sign in</Text>
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
    paddingTop: 70,
    paddingBottom: 40,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  emoji:  { fontSize: 52, marginBottom: 12 },
  title:  { fontSize: 30, fontWeight: '800', color: '#14532D', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6B7280' },

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

  strengthRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  strengthBar:  { flex: 1, height: 4, borderRadius: 4, backgroundColor: '#E5E7EB' },
  strengthWeak:   { backgroundColor: '#EF4444' },
  strengthFair:   { backgroundColor: '#F59E0B' },
  strengthStrong: { backgroundColor: '#16A34A' },
  strengthLabel:  { fontSize: 11, color: '#6B7280', marginLeft: 4 },

  terms: { textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 20, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, color: '#6B7280' },
  link: { fontSize: 14, color: '#16A34A', fontWeight: '700' },
});

export default RegisterScreen;