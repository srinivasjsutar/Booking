// src/screens/ProfileSetupScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, SafeAreaView, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const CREAM = '#F7F3EE'; const DARK = '#1A1208'; const GOLD = '#C8963E'; const WHITE = '#FFFFFF'; const MUTED = '#8C7E6E';

const GENDERS = [
  { id: 'male',   label: 'Male',   icon: '👨' },
  { id: 'female', label: 'Female', icon: '👩' },
  { id: 'other',  label: 'Other',  icon: '🧑' },
];

export default function ProfileSetupScreen({ navigation, route }) {
  const { email, phone } = route.params || {};
  const { completeProfile } = useAuth();

  const [name,      setName]      = useState('');
  const [gender,    setGender]    = useState('');
  const [showKyc,   setShowKyc]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  const isValid = name.trim().length >= 2 && gender !== '';

  const handleContinue = async () => {
    if (!isValid) return;
    try {
      setLoading(true);
      // Save profile to backend (optional — extend as needed)
      // await apiRequest('/user/profile', { method: 'PUT', body: { name, gender }, token });

      // Mark user as logged-in in AuthContext so RootNavigator switches to AppStack
      await completeProfile({ name: name.trim(), gender, email, phone });
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await completeProfile({ name: 'Guest', gender: 'other', email, phone });
    } catch {
      // fallback — just complete
    }
  };

  if (showKyc) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
        <View style={styles.kycScreen}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setShowKyc(false)}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.kycContent}>
            <Text style={styles.kycEmoji}>🪪</Text>
            <Text style={styles.kycHeading}>KYC Verification</Text>
            <Text style={styles.kycSubtext}>
              Verify your identity with Aadhaar for faster hotel check-in and increased booking limits.
            </Text>

            <View style={styles.kycStepsList}>
              {[
                { icon: '📷', title: 'Upload Aadhaar', desc: 'Front & back photo' },
                { icon: '🤳', title: 'Face Match',     desc: 'Quick selfie verification' },
                { icon: '✅', title: 'Instant Verify', desc: 'Done in under 2 minutes' },
              ].map((s, i) => (
                <View key={i} style={styles.kycStep}>
                  <View style={styles.kycStepIcon}><Text style={{ fontSize: 22 }}>{s.icon}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.kycStepTitle}>{s.title}</Text>
                    <Text style={styles.kycStepDesc}>{s.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.kycStartBtn} activeOpacity={0.85}>
              <Text style={styles.kycStartBtnText}>Start KYC →</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowKyc(false)} style={{ marginTop: 14 }}>
              <Text style={styles.skipText}>Do it later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarEmoji}>{gender === 'male' ? '👨' : gender === 'female' ? '👩' : '🧑'}</Text>
          </View>
          <TouchableOpacity style={styles.photoBtn}>
            <Text style={styles.photoBtnText}>📷  Add Photo</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>This is shown to hotel staff during check-in</Text>
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, name.length > 0 && styles.inputActive]}
            placeholder="Enter your full name"
            placeholderTextColor="#C0B8B0"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
          />
        </View>

        {/* Email or Phone (readonly) */}
        <View style={styles.field}>
          <Text style={styles.label}>{email ? 'Email Address' : 'Phone Number'}</Text>
          <View style={styles.readonlyInput}>
            <Text style={styles.readonlyText}>{email || `+91 ${phone}`}</Text>
            <Text style={styles.verifiedBadge}>✓ Verified</Text>
          </View>
        </View>

        {/* Gender */}
        <View style={styles.field}>
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderRow}>
            {GENDERS.map(g => (
              <TouchableOpacity
                key={g.id}
                style={[styles.genderChip, gender === g.id && styles.genderChipActive]}
                onPress={() => setGender(g.id)}
              >
                <Text style={styles.genderIcon}>{g.icon}</Text>
                <Text style={[styles.genderLabel, gender === g.id && styles.genderLabelActive]}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* KYC CTA — now navigates to KYC view */}
        <TouchableOpacity style={styles.kycBanner} onPress={() => setShowKyc(true)} activeOpacity={0.85}>
          <View style={styles.kycLeft}>
            <Text style={styles.kycTitle}>🪪  Complete KYC</Text>
            <Text style={styles.kycDesc}>Verify with Aadhaar for faster check-in</Text>
          </View>
          <Text style={styles.kycArrow}>→</Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueBtn, !isValid && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!isValid || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={WHITE} />
            : <Text style={styles.continueBtnText}>Continue →</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: CREAM },
  container:   { paddingHorizontal: 28, paddingTop: 32, paddingBottom: 40 },
  header:      { alignItems: 'center', marginBottom: 32 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  avatarEmoji: { fontSize: 44 },
  photoBtn:    { backgroundColor: WHITE, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 20, borderWidth: 1, borderColor: '#E8E0D5' },
  photoBtnText:{ fontSize: 13, color: DARK, fontWeight: '600' },
  title:       { fontSize: 24, fontWeight: '900', color: DARK, letterSpacing: -0.5, marginBottom: 6 },
  subtitle:    { fontSize: 14, color: MUTED, textAlign: 'center' },
  field:       { marginBottom: 22 },
  label:       { fontSize: 13, fontWeight: '600', color: MUTED, marginBottom: 10, letterSpacing: 0.3 },
  input:       { backgroundColor: WHITE, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: DARK, borderWidth: 1.5, borderColor: '#E8E0D5' },
  inputActive: { borderColor: GOLD },
  readonlyInput: { backgroundColor: '#F0EBE3', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readonlyText:{ fontSize: 16, color: DARK, fontWeight: '600' },
  verifiedBadge: { fontSize: 12, color: '#16A34A', fontWeight: '700', backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  genderRow:   { flexDirection: 'row', gap: 12 },
  genderChip:  { flex: 1, backgroundColor: WHITE, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#E8E0D5', gap: 4 },
  genderChipActive: { borderColor: GOLD, backgroundColor: '#FFF9F0' },
  genderIcon:  { fontSize: 22 },
  genderLabel: { fontSize: 13, fontWeight: '600', color: MUTED },
  genderLabelActive: { color: DARK },
  kycBanner:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1208', borderRadius: 16, padding: 16, marginBottom: 28 },
  kycLeft:     { flex: 1 },
  kycTitle:    { fontSize: 15, fontWeight: '700', color: WHITE, marginBottom: 3 },
  kycDesc:     { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  kycArrow:    { fontSize: 20, color: GOLD, fontWeight: '700' },
  continueBtn: { backgroundColor: DARK, borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginBottom: 14 },
  continueBtnDisabled: { opacity: 0.5 },
  continueBtnText: { color: WHITE, fontSize: 17, fontWeight: '800' },
  skipBtn:     { alignItems: 'center' },
  skipText:    { fontSize: 14, color: MUTED, textDecorationLine: 'underline' },

  // KYC screen styles
  kycScreen:   { flex: 1, backgroundColor: CREAM, paddingHorizontal: 28, paddingTop: 50 },
  backBtn:     { width: 40, height: 40, borderRadius: 12, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  backIcon:    { fontSize: 20, color: DARK },
  kycContent:  { alignItems: 'center', flex: 1 },
  kycEmoji:    { fontSize: 64, marginBottom: 16 },
  kycHeading:  { fontSize: 26, fontWeight: '900', color: DARK, marginBottom: 10 },
  kycSubtext:  { fontSize: 14, color: MUTED, textAlign: 'center', lineHeight: 21, marginBottom: 32, paddingHorizontal: 8 },
  kycStepsList:{ width: '100%', gap: 16, marginBottom: 36 },
  kycStep:     { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderRadius: 14, padding: 16, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  kycStepIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF4E0', alignItems: 'center', justifyContent: 'center' },
  kycStepTitle:{ fontSize: 14, fontWeight: '700', color: DARK, marginBottom: 2 },
  kycStepDesc: { fontSize: 12, color: MUTED },
  kycStartBtn: { backgroundColor: DARK, borderRadius: 18, paddingVertical: 18, alignItems: 'center', width: '100%' },
  kycStartBtnText: { color: WHITE, fontSize: 16, fontWeight: '800' },
});