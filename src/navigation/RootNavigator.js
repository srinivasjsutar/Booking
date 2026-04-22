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
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="PhoneEntry" component={PhoneEntryScreen} />
    <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
  </Stack.Navigator>
);

// Shown after login/register when KYC is not yet completed
const KycStack = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false, animation: "slide_from_right" }}
  >
    <Stack.Screen name="KycAadhaar" component={KycAadhaarScreen} />
    <Stack.Screen name="KycPan" component={KycPanScreen} />
    <Stack.Screen name="KycSuccess" component={KycSuccessScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false, animation: "slide_from_right" }}
  >
    <Stack.Screen name="Home" component={HotelBookingHomeScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
    <Stack.Screen
      name="BookingConfirmation"
      component={BookingConfirmationScreen}
    />
    <Stack.Screen name="ActiveSession" component={ActiveSessionScreen} />
    <Stack.Screen name="CheckOut" component={CheckOutScreen} />
    <Stack.Screen name="RateReview" component={RateReviewScreen} />
    <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Wallet" component={WalletScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
    <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
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

  if (!user) return <AuthStack />;
  if (user.kyc?.status !== "verified") return <KycStack />;
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
