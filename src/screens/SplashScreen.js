// src/screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const SplashScreen = () => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5,   useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <Text style={styles.logo}>🌿</Text>
        <Text style={styles.appName}>Android Demo</Text>
        <Text style={styles.tagline}>Loading your experience…</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo:    { fontSize: 72, textAlign: 'center', marginBottom: 12 },
  appName: { fontSize: 32, fontWeight: '800', color: '#14532D', textAlign: 'center' },
  tagline: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
});

export default SplashScreen;