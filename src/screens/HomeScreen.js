// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const HomeScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👋</Text>
      <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}!</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>You're logged in ✅</Text>
        <Text style={styles.cardText}>
          Your JWT token is securely stored on device using Expo SecureStore.
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji:     { fontSize: 60, marginBottom: 16 },
  greeting:  { fontSize: 28, fontWeight: '800', color: '#14532D', marginBottom: 4 },
  email:     { fontSize: 14, color: '#6B7280', marginBottom: 32 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 32,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#15803D', marginBottom: 8 },
  cardText:  { fontSize: 13, color: '#6B7280', lineHeight: 20 },

  logoutBtn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
});

export default HomeScreen;