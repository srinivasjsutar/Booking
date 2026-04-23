// src/screens/KycSuccessScreen.js
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useAuth } from "../context/AuthContext";

const BRAND = "#C8963E";

export default function KycSuccessScreen({ navigation }) {
  const { refreshKyc, isAuthenticated } = useAuth();
  const scale = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ✅ FIX: refreshKyc updates user.kyc.status to 'verified' in context.
    // RootNavigator watches `user` and will automatically switch to AppStack
    // once kyc.status === 'verified', so no manual navigation.replace('Home')
    // is needed (Home doesn't exist in KycStack anyway).
    refreshKyc();

    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 5,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ✅ FIX: "Start Booking" button — if KYC refresh updated the context,
  // RootNavigator will have already switched to AppStack automatically.
  // If the user is inside AppStack (came from Profile screen), navigate manually.
  const handleGoHome = () => {
    try {
      navigation.replace("Home");
    } catch {
      // Already handled by RootNavigator switching stacks — nothing to do
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
        <Text style={styles.check}>✓</Text>
      </Animated.View>

      <Animated.View style={{ opacity: fade, alignItems: "center" }}>
        <Text style={styles.title}>KYC Complete!</Text>
        <Text style={styles.sub}>
          Your identity has been verified.{"\n"}You can now make bookings.
        </Text>

        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text>🆔 Aadhaar ✓</Text>
          </View>
          <View style={styles.badge}>
            <Text>💳 PAN ✓</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleGoHome}>
          <Text style={styles.btnTxt}>Start Booking →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBF5",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  circle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#16A34A",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  check: { fontSize: 54, color: "#fff", fontWeight: "700" },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1C1917",
    marginBottom: 12,
  },
  sub: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  badges: { flexDirection: "row", gap: 12, marginBottom: 36 },
  badge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  btn: {
    backgroundColor: BRAND,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 48,
  },
  btnTxt: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
