// src/navigation/RootNavigator.js
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// ── Auth Screens ──────────────────────────────────────────────────────────────
import WelcomeScreen       from '../screens/WelcomeScreen';
import PhoneEntryScreen    from '../screens/PhoneEntryScreen';
import OTPVerifyScreen     from '../screens/OTPVerifyScreen';
import LoginScreen         from '../screens/LoginScreen';
import RegisterScreen      from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProfileSetupScreen  from '../screens/ProfileSetupScreen';

// ── App Screens ───────────────────────────────────────────────────────────────
import HotelBookingHomeScreen    from '../Hotelbookinghomescreen';
import BookingScreen             from '../screens/BookingScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import MyBookingsScreen          from '../screens/MyBookingsScreen';
import ActiveSessionScreen       from '../screens/ActiveSessionScreen';
import CheckOutScreen            from '../screens/CheckOutScreen';
import RateReviewScreen          from '../screens/RateReviewScreen';
import ProfileScreen             from '../screens/ProfileScreen';
import WalletScreen              from '../screens/WalletScreen';
import SupportScreen             from '../screens/SupportScreen';

const Stack = createNativeStackNavigator();

// ── Auth Stack ─────────────────────────────────────────────────────────────────
const AuthStack = () => (
  <Stack.Navigator
    initialRouteName="Welcome"
    screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
  >
    <Stack.Screen name="Welcome"       component={WelcomeScreen} />
    <Stack.Screen name="PhoneEntry"    component={PhoneEntryScreen} />
    <Stack.Screen name="OTPVerify"     component={OTPVerifyScreen} />
    <Stack.Screen name="Login"         component={LoginScreen} />
    <Stack.Screen name="Register"      component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ProfileSetup"  component={ProfileSetupScreen} />
  </Stack.Navigator>
);

// ── App Stack ──────────────────────────────────────────────────────────────────
const AppStack = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
  >
    {/* Home */}
    <Stack.Screen name="Home"                component={HotelBookingHomeScreen} />

    {/* Booking Flow */}
    <Stack.Screen name="Booking"             component={BookingScreen} />
    <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />

    {/* Active Session Flow */}
    <Stack.Screen name="ActiveSession"       component={ActiveSessionScreen} />
    <Stack.Screen name="CheckOut"            component={CheckOutScreen} />
    <Stack.Screen name="RateReview"          component={RateReviewScreen} />

    {/* Profile & Utility */}
    <Stack.Screen name="MyBookings"          component={MyBookingsScreen} />
    <Stack.Screen name="Profile"             component={ProfileScreen} />
    <Stack.Screen name="Wallet"              component={WalletScreen} />
    <Stack.Screen name="Support"             component={SupportScreen} />
    <Stack.Screen name="ProfileSetup"        component={ProfileSetupScreen} />
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