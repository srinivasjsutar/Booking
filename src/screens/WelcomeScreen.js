// src/screens/WelcomeScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, SafeAreaView, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const CREAM = '#F7F3EE'; const DARK = '#1A1208'; const GOLD = '#C8963E'; const WHITE = '#FFFFFF'; const MUTED = '#8C7E6E';

const FEATURES = [
  { icon: '🏨', title: 'Thousands of Hotels', desc: 'From budget stays to luxury resorts' },
  { icon: '⚡', title: 'Instant Booking', desc: 'Confirm your stay in seconds' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Your data is always protected' },
];

export default function WelcomeScreen({ navigation }) {
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;
  const scaleAnim  = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

        {/* Logo */}
        <Animated.View style={[styles.logoBox, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.logoEmoji}>🏨</Text>
          <Text style={styles.logoText}>StayEasy</Text>
          <Text style={styles.logoSub}>Find. Book. Stay.</Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.features, { transform: [{ translateY: slideAnim }] }]}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconBox}><Text style={styles.featureIcon}>{f.icon}</Text></View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.ctaBox, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('PhoneEntry')} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Continue with Phone</Text>
          </TouchableOpacity>
          <Text style={styles.terms}>By continuing you agree to our{' '}
            <Text style={styles.link}>Terms</Text> and <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </Animated.View>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: CREAM },
  container:   { flex: 1, paddingHorizontal: 28, justifyContent: 'space-between', paddingTop: 50, paddingBottom: 32 },
  logoBox:     { alignItems: 'center', paddingTop: 20 },
  logoEmoji:   { fontSize: 64, marginBottom: 12 },
  logoText:    { fontSize: 36, fontWeight: '900', color: DARK, letterSpacing: -1 },
  logoSub:     { fontSize: 16, color: MUTED, fontWeight: '500', marginTop: 6 },
  features:    { gap: 20 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 16 },
  featureIconBox: { width: 52, height: 52, borderRadius: 16, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  featureIcon: { fontSize: 24 },
  featureText: { flex: 1 },
  featureTitle:{ fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 2 },
  featureDesc: { fontSize: 13, color: MUTED },
  ctaBox:      { gap: 14 },
  primaryBtn:  { backgroundColor: DARK, borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowColor: DARK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  primaryBtnText: { color: WHITE, fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
  terms:       { fontSize: 12, color: MUTED, textAlign: 'center', lineHeight: 18 },
  link:        { color: GOLD, fontWeight: '600' },
});