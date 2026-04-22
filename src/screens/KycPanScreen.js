// src/screens/KycPanScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, TextInput, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { verifyPan } from '../api/kycApi';

const BRAND = '#C8963E';

export default function KycPanScreen({ navigation, route }) {
  const { token } = useAuth();
  const aadhaarName = route.params?.aadhaarName || '';
  const aadhaarDob  = route.params?.aadhaarDob  || '';

  const [pan,     setPan]     = useState('');
  const [name,    setName]    = useState(aadhaarName.toUpperCase());
  const [dob,     setDob]     = useState(
    // convert YYYY-MM-DD or DD-MM-YYYY from Aadhaar to DD/MM/YYYY for PAN
    aadhaarDob ? aadhaarDob.replace(/-/g, '/') : ''
  );
  const [loading,  setLoading]  = useState(false);
  const [panError, setPanError] = useState('');
  const [dobError, setDobError] = useState('');

  const formatPan = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);

  const formatDob = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  };

  const validate = () => {
    let ok = true;
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) { setPanError('Enter valid PAN e.g. ABCDE1234F'); ok = false; }
    else setPanError('');
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dob))    { setDobError('Enter date as DD/MM/YYYY'); ok = false; }
    else setDobError('');
    return ok;
  };

  const handleVerify = async () => {
    if (!validate()) return;
    if (!name.trim() || name.trim().length < 2)
      return Alert.alert('Name required', 'Enter your full name as on PAN card.');
    setLoading(true);
    try {
      const res = await verifyPan(pan, name.trim(), dob, token);
      if (res.success) {
        navigation.replace('KycSuccess');
      } else {
        Alert.alert('Verification Failed', res.message || 'Check your PAN, name and DOB and retry.');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Network error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Step bar */}
        <View style={styles.stepRow}>
          <View style={styles.stepDone}><Text style={styles.stepTxt}>✓</Text></View>
          <View style={[styles.stepLine, { backgroundColor: BRAND }]} />
          <View style={styles.stepActive}><Text style={styles.stepTxt}>2</Text></View>
        </View>

        <Text style={styles.tag}>Step 2 of 2</Text>
        <Text style={styles.title}>PAN Verification</Text>
        <Text style={styles.sub}>Instant — no OTP required</Text>

        <View style={styles.card}>
          {/* Name */}
          <Text style={styles.label}>Full Name (as on PAN card)</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(v) => setName(v.toUpperCase())}
            placeholder="RAJESH KUMAR"
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
          />

          {/* DOB */}
          <Text style={[styles.label, { marginTop: 16 }]}>Date of Birth (as on PAN)</Text>
          <TextInput
            style={[styles.input, dobError && { borderColor: '#EF4444' }]}
            value={dob}
            onChangeText={(v) => { setDob(formatDob(v)); setDobError(''); }}
            placeholder="DD/MM/YYYY"
            keyboardType="number-pad"
            maxLength={10}
            placeholderTextColor="#9CA3AF"
          />
          {!!dobError && <Text style={styles.err}>{dobError}</Text>}

          {/* PAN */}
          <Text style={[styles.label, { marginTop: 16 }]}>PAN Number</Text>
          <View style={[styles.inputRow, panError && { borderColor: '#EF4444' }, panValid && { borderColor: '#16A34A' }]}>
            <TextInput
              style={styles.panInput}
              value={pan}
              onChangeText={(v) => { setPan(formatPan(v)); setPanError(''); }}
              placeholder="ABCDE1234F"
              autoCapitalize="characters"
              maxLength={10}
              placeholderTextColor="#9CA3AF"
            />
            {panValid && <Text style={{ color: '#16A34A', fontWeight: '700', fontSize: 18 }}>✓</Text>}
          </View>
          {!!panError && <Text style={styles.err}>{panError}</Text>}

          <Text style={styles.hint}>🔒 Verified against Income Tax database via Sandbox KYC</Text>

          <TouchableOpacity style={[styles.btn, loading && styles.btnOff]} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>Verify PAN</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>
          PAN verification is mandatory per RBI KYC norms.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: '#F7F3EE', padding: 24, paddingTop: 60 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  stepDone: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  stepActive: { width: 32, height: 32, borderRadius: 16, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { color: '#fff', fontWeight: '700' },
  stepLine: { width: 48, height: 2, marginHorizontal: 8 },
  tag:   { textAlign: 'center', color: BRAND, fontWeight: '600', fontSize: 12, marginBottom: 6 },
  title: { textAlign: 'center', fontSize: 26, fontWeight: '800', color: '#1C1917', marginBottom: 6 },
  sub:   { textAlign: 'center', fontSize: 13, color: '#6B7280', marginBottom: 28 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 2 } },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111827', backgroundColor: '#F9FAFB' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#F9FAFB' },
  panInput: { flex: 1, fontSize: 20, letterSpacing: 3, color: '#111827', fontWeight: '700', paddingVertical: 13 },
  err:  { color: '#EF4444', fontSize: 12, marginTop: 4 },
  hint: { fontSize: 11, color: '#9CA3AF', marginTop: 10, marginBottom: 20 },
  btn:  { backgroundColor: BRAND, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnOff: { opacity: 0.6 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  legal: { textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 24, lineHeight: 16 },
});