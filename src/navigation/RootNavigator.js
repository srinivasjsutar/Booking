// src/navigation/RootNavigator.js
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';

// Auth screens
import LoginScreen          from '../screens/LoginScreen';
import RegisterScreen       from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// App screens
import HotelBookingHomeScreen      from '../Hotelbookinghomescreen';
import BookingScreen               from '../screens/BookingScreen';
import BookingConfirmationScreen   from '../screens/BookingConfirmationScreen';
import MyBookingsScreen            from '../screens/MyBookingsScreen';

const Stack = createNativeStackNavigator();

// ── Auth Stack ─────────────────────────────────────────────────────────────────
const AuthStack = () => (
  <Stack.Navigator
    initialRouteName="Login"
    screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
  >
    <Stack.Screen name="Login"          component={LoginScreen} />
    <Stack.Screen name="Register"       component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// ── App Stack ──────────────────────────────────────────────────────────────────
const AppStack = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
  >
    <Stack.Screen name="Home"                component={HotelBookingHomeScreen} />
    <Stack.Screen name="Booking"             component={BookingScreen} />
    <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
    <Stack.Screen name="MyBookings"          component={MyBookingsScreen} />
  </Stack.Navigator>
);

// ── Root Navigator ─────────────────────────────────────────────────────────────
const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C8963E" />
      </View>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F3EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RootNavigator;