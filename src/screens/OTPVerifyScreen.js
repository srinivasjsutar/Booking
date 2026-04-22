// src/screens/OTPVerifyScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const CREAM = '#F7F3EE'; const DARK = '#1A1208'; const GOLD = '#C8963E'; const WHITE = '#FFFFFF'; const MUTED = '#8C7E6E'; const RED = '#DC2626'; const GREEN = '#16A34A';

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 30;

export default function OTPVerifyScreen({ navigation, route }) {
  const { phone } = route.params || {};
  const { login } = useAuth();

  const [otp,       setOtp]       = useState(Array(OTP_LENGTH).fill(''));
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [timer,     setTimer]     = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const timerRef  = useRef(null);

  // ── Countdown timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // ── Auto-submit when all 6 digits filled ───────────────────────────────────
  useEffect(() => {
    const code = otp.join('');
    if (code.length === OTP_LENGTH && !loading) {
      handleVerify(code);
    }
  }, [otp]);

  // ── Handle digit input ─────────────────────────────────────────────────────
  const handleChange = (text, index) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const handleVerify = async (code) => {
    try {
      setLoading(true);
      setError('');
      // Try real API, fallback to demo login
      try {
        await login(phone ? `${phone}@phone.com` : 'demo@email.com', code);
      } catch {
        // For demo: accept any 6-digit OTP
        if (code.length === OTP_LENGTH) {
          // Mock successful auth — navigate to profile setup if new user
          navigation.replace('ProfileSetup', { phone, isNew: true });
          return;
        }
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResend = () => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setTimer(RESEND_TIMEOUT);
    setCanResend(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; }
        return t - 1;
      });
    }, 1000);
    Alert.alert('OTP Sent', `A new OTP has been sent to +91 ${phone}`);
    inputRefs.current[0]?.focus();
  };

  const filledCount = otp.filter(d => d !== '').length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <View style={styles.container}>

        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phoneHighlight}>+91 {phone}</Text>
          </Text>
        </View>

        {/* OTP Boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={ref => inputRefs.current[i] = ref}
              style={[
                styles.otpBox,
                digit && styles.otpBoxFilled,
                error && styles.otpBoxError,
                i === filledCount && styles.otpBoxActive,
              ]}
              value={digit}
              onChangeText={text => handleChange(text, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              autoFocus={i === 0}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        ) : null}

        {/* Timer / Resend */}
        <View style={styles.resendRow}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendActive}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              Resend OTP in <Text style={styles.timerHighlight}>{timer}s</Text>
            </Text>
          )}
        </View>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.verifyingBox}>
            <ActivityIndicator color={GOLD} size="small" />
            <Text style={styles.verifyingText}>Verifying...</Text>
          </View>
        )}

        {/* Progress indicator */}
        <View style={styles.progressRow}>
          {Array(OTP_LENGTH).fill(0).map((_, i) => (
            <View
              key={i}
              style={[styles.progressDot, i < filledCount && styles.progressDotFilled]}
            />
          ))}
        </View>

        <Text style={styles.demoHint}>💡 Demo: Enter any 6 digits to continue</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: CREAM },
  container:   { flex: 1, paddingHorizontal: 28, paddingTop: 50, alignItems: 'center' },
  backBtn:     { alignSelf: 'flex-start', width: 40, height: 40, borderRadius: 12, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  backIcon:    { fontSize: 20, color: DARK },
  header:      { alignItems: 'center', marginBottom: 40 },
  emoji:       { fontSize: 48, marginBottom: 16 },
  title:       { fontSize: 28, fontWeight: '900', color: DARK, letterSpacing: -0.5, marginBottom: 10 },
  subtitle:    { fontSize: 15, color: MUTED, textAlign: 'center', lineHeight: 22 },
  phoneHighlight: { color: DARK, fontWeight: '700' },
  otpRow:      { flexDirection: 'row', gap: 10, marginBottom: 20 },
  otpBox:      { width: 48, height: 58, borderRadius: 14, backgroundColor: WHITE, fontSize: 24, fontWeight: '800', color: DARK, borderWidth: 1.5, borderColor: '#E8E0D5', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  otpBoxFilled:{ borderColor: GOLD, backgroundColor: '#FFF9F0' },
  otpBoxActive:{ borderColor: DARK },
  otpBoxError: { borderColor: RED, backgroundColor: '#FFF5F5' },
  errorBox:    { marginBottom: 16 },
  errorText:   { color: RED, fontSize: 13, fontWeight: '600' },
  resendRow:   { marginBottom: 28 },
  resendTimer: { fontSize: 14, color: MUTED },
  timerHighlight: { color: GOLD, fontWeight: '700' },
  resendActive:{ fontSize: 14, color: GOLD, fontWeight: '700', textDecorationLine: 'underline' },
  verifyingBox:{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  verifyingText: { fontSize: 14, color: MUTED, fontWeight: '500' },
  progressRow: { flexDirection: 'row', gap: 8, marginTop: 'auto', marginBottom: 16 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D5CFC8' },
  progressDotFilled: { backgroundColor: GOLD },
  demoHint:    { fontSize: 12, color: MUTED, marginBottom: 32, textAlign: 'center' },
});