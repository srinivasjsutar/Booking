// src/navigation/RootNavigator.js
import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

// ── Auth Screens ──────────────────────────────────────────────────────────────
import WelcomeScreen from "../screens/WelcomeScreen";
import PhoneEntryScreen from "../screens/PhoneEntryScreen";
import OTPVerifyScreen from "../screens/OTPVerifyScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ProfileSetupScreen from "../screens/ProfileSetupScreen";

// ── KYC Screens ───────────────────────────────────────────────────────────────
import KycAadhaarScreen from "../screens/KycAadhaarScreen";
import KycPanScreen from "../screens/KycPanScreen";
import KycSuccessScreen from "../screens/KycSuccessScreen";

// ── App Screens ───────────────────────────────────────────────────────────────
import HotelBookingHomeScreen from "../Hotelbookinghomescreen";
import BookingScreen from "../screens/BookingScreen";
import BookingConfirmationScreen from "../screens/BookingConfirmationScreen";
import MyBookingsScreen from "../screens/MyBookingsScreen";
import ActiveSessionScreen from "../screens/ActiveSessionScreen";
import CheckOutScreen from "../screens/CheckOutScreen";
import RateReviewScreen from "../screens/RateReviewScreen";
import ProfileScreen from "../screens/ProfileScreen";
import WalletScreen from "../screens/WalletScreen";
import SupportScreen from "../screens/SupportScreen";

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    initialRouteName="Welcome"
    screenOptions={{ headerShown: false, animation: "slide_from_right" }}
  >
    <Stack.Screen name="Welcome"        component={WelcomeScreen} />
    <Stack.Screen name="PhoneEntry"     component={PhoneEntryScreen} />
    <Stack.Screen name="OTPVerify"      component={OTPVerifyScreen} />
    <Stack.Screen name="Login"          component={LoginScreen} />
    <Stack.Screen name="Register"       component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ProfileSetup"   component={ProfileSetupScreen} />
  </Stack.Navigator>
);

// Shown only when user is logged in AND kyc.status is explicitly 'not_started'
// or 'aadhaar_done' — i.e. KYC is in progress but not complete.
const KycStack = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false, animation: "slide_from_right" }}
  >
    <Stack.Screen name="KycAadhaar" component={KycAadhaarScreen} />
    <Stack.Screen name="KycPan"     component={KycPanScreen} />
    <Stack.Screen name="KycSuccess" component={KycSuccessScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false, animation: "slide_from_right" }}
  >
    <Stack.Screen name="Home"                component={HotelBookingHomeScreen} />
    <Stack.Screen name="Booking"             component={BookingScreen} />
    <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
    <Stack.Screen name="ActiveSession"       component={ActiveSessionScreen} />
    <Stack.Screen name="CheckOut"            component={CheckOutScreen} />
    <Stack.Screen name="RateReview"          component={RateReviewScreen} />
    <Stack.Screen name="MyBookings"          component={MyBookingsScreen} />
    <Stack.Screen name="Profile"             component={ProfileScreen} />
    <Stack.Screen name="Wallet"              component={WalletScreen} />
    <Stack.Screen name="Support"             component={SupportScreen} />
    <Stack.Screen name="ProfileSetup"        component={ProfileSetupScreen} />
    {/* ✅ KYC screens also available inside AppStack so users can complete
        KYC optionally from the Profile screen without being force-routed */}
    <Stack.Screen name="KycAadhaar"          component={KycAadhaarScreen} />
    <Stack.Screen name="KycPan"              component={KycPanScreen} />
    <Stack.Screen name="KycSuccess"          component={KycSuccessScreen} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#C8963E" />
      </View>
    );
  }

  // Not logged in at all → show auth flow
  if (!user) return <AuthStack />;

  // ✅ FIX: The old check was `user.kyc?.status !== "verified"` which is TRUE
  // even when kyc is undefined (guest users, or login response missing kyc).
  // This trapped ALL users in KycStack forever.
  //
  // Correct logic:
  //  - Guest users (isGuest: true) → skip KYC, go straight to app
  //  - Real users with kyc.status explicitly 'not_started' → show KYC flow
  //  - Real users with kyc.status 'aadhaar_done' → resume KYC from step 2
  //  - Everyone else (verified, undefined, missing) → go to app
  if (
    !user.isGuest &&
    (user.kyc?.status === 'not_started' || user.kyc?.status === 'aadhaar_done')
  ) {
    return <KycStack />;
  }

  return <AppStack />;
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: "#F7F3EE",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default RootNavigator;