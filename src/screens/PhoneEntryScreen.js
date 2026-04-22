// src/screens/PhoneEntryScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { apiRequest } from '../api/client';

const CREAM = '#F7F3EE'; const DARK = '#1A1208'; const GOLD = '#C8963E'; const WHITE = '#FFFFFF'; const MUTED = '#8C7E6E'; const RED = '#DC2626';

export default function PhoneEntryScreen({ navigation }) {
  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const inputRef = useRef(null);

  const isValid = phone.length === 10 && /^[6-9]\d{9}$/.test(phone);

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    setError('');
  };

  const handleSendOTP = async () => {
    if (!isValid) { setError('Enter a valid 10-digit mobile number'); return; }
    try {
      setLoading(true);
      setError('');
      // Try real API first, fallback to mock
      try {
        await apiRequest('/auth/send-otp', { method: 'POST', body: { phone: `+91${phone}` } });
      } catch {
        // API not ready — proceed anyway for demo
      }
      navigation.navigate('OTPVerify', { phone });
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>

          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>📱</Text>
            <Text style={styles.title}>Enter your phone number</Text>
            <Text style={styles.subtitle}>We'll send you a 6-digit OTP to verify your number</Text>
          </View>

          {/* Phone Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={[styles.phoneBox, error ? styles.phoneBoxError : phone.length > 0 ? styles.phoneBoxActive : {}]}>
              <View style={styles.prefix}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.prefixText}>+91</Text>
              </View>
              <View style={styles.divider} />
              <TextInput
                ref={inputRef}
                style={styles.phoneInput}
                placeholder="98765 43210"
                placeholderTextColor="#C0B8B0"
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="numeric"
                maxLength={10}
                autoFocus
              />
              {phone.length === 10 && isValid && (
                <Text style={styles.validIcon}>✓</Text>
              )}
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.hint}>
              {phone.length}/10 digits{phone.length === 10 && !isValid ? ' — must start with 6-9' : ''}
            </Text>
          </View>

          {/* Popular operators note */}
          <View style={styles.opsRow}>
            {['Jio', 'Airtel', 'Vi', 'BSNL'].map(op => (
              <View key={op} style={styles.opChip}><Text style={styles.opText}>{op}</Text></View>
            ))}
          </View>

          {/* Button */}
          <View style={styles.btnSection}>
            <TouchableOpacity
              style={[styles.sendBtn, (!isValid || loading) && styles.sendBtnDisabled]}
              onPress={handleSendOTP}
              disabled={!isValid || loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={WHITE} />
                : <Text style={styles.sendBtnText}>Send OTP →</Text>
              }
            </TouchableOpacity>
            <Text style={styles.terms}>Standard SMS charges may apply</Text>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: CREAM },
  container:   { flex: 1, paddingHorizontal: 28, paddingTop: 50 },
  backBtn:     { width: 40, height: 40, borderRadius: 12, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  backIcon:    { fontSize: 20, color: DARK },
  header:      { marginBottom: 36 },
  emoji:       { fontSize: 40, marginBottom: 14 },
  title:       { fontSize: 30, fontWeight: '900', color: DARK, lineHeight: 36, letterSpacing: -0.5, marginBottom: 10 },
  subtitle:    { fontSize: 15, color: MUTED, lineHeight: 22 },
  label:       { fontSize: 13, fontWeight: '600', color: MUTED, marginBottom: 10, letterSpacing: 0.3 },
  inputSection:{ marginBottom: 20 },
  phoneBox:    { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderRadius: 16, borderWidth: 1.5, borderColor: '#E8E0D5', paddingRight: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  phoneBoxActive: { borderColor: GOLD },
  phoneBoxError:  { borderColor: RED },
  prefix:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 18, gap: 6 },
  flag:        { fontSize: 18 },
  prefixText:  { fontSize: 16, fontWeight: '700', color: DARK },
  divider:     { width: 1, height: 24, backgroundColor: '#E8E0D5' },
  phoneInput:  { flex: 1, fontSize: 18, fontWeight: '600', color: DARK, paddingHorizontal: 14, paddingVertical: 18, letterSpacing: 1 },
  validIcon:   { fontSize: 18, color: '#16A34A', fontWeight: '700' },
  errorText:   { fontSize: 12, color: RED, marginTop: 8, fontWeight: '500' },
  hint:        { fontSize: 12, color: MUTED, marginTop: 6 },
  opsRow:      { flexDirection: 'row', gap: 10, marginBottom: 32 },
  opChip:      { backgroundColor: WHITE, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#E8E0D5' },
  opText:      { fontSize: 12, color: MUTED, fontWeight: '500' },
  btnSection:  { marginTop: 'auto', paddingBottom: 20, gap: 12 },
  sendBtn:     { backgroundColor: DARK, borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#C8C0B8', opacity: 0.7 },
  sendBtnText: { color: WHITE, fontSize: 17, fontWeight: '800' },
  terms:       { fontSize: 12, color: MUTED, textAlign: 'center' },
});