// src/screens/KycAadhaarScreen.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { generateAadhaarOtp, verifyAadhaarOtp } from "../api/kycApi";

const BRAND = "#C8963E";

export default function KycAadhaarScreen({ navigation }) {
  const { token, isAuthenticated } = useAuth();

  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [refId, setRefId] = useState(null);
  const [step, setStep] = useState("entry"); // 'entry' | 'otp'
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  const formatAadhaar = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 12);
    return d.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(" "),
    );
  };

  const startTimer = () => {
    setTimer(30);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // ✅ FIX: Guard all protected API calls — guest tokens are rejected by the server
  const checkAuth = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Login Required",
        "KYC verification requires a full account. Please log in with your email and password.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => navigation.navigate("Login") },
        ],
      );
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!checkAuth()) return; // ✅ block guest users

    const raw = aadhaar.replace(/\s/g, "");
    if (raw.length !== 12)
      return Alert.alert("Invalid", "Enter a valid 12-digit Aadhaar number.");
    setLoading(true);
    try {
      const res = await generateAadhaarOtp(raw, token);
      if (res.success) {
        setRefId(res.referenceId);
        setStep("otp");
        startTimer();
      } else {
        Alert.alert("Error", res.message || "Could not send OTP.");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Network error. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!checkAuth()) return; // ✅ block guest users

    if (otp.length !== 6)
      return Alert.alert("Invalid OTP", "Enter the 6-digit OTP.");
    setLoading(true);
    try {
      const res = await verifyAadhaarOtp(refId, otp, token);
      if (res.success) {
        navigation.replace("KycPan", {
          aadhaarName: res.name,
          aadhaarDob: res.dob,
        });
      } else {
        Alert.alert("Failed", res.message || "Incorrect OTP. Try again.");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Network error. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step bar */}
        <View style={styles.stepRow}>
          <View style={styles.stepActive}>
            <Text style={styles.stepTxt}>1</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepInactive}>
            <Text style={styles.stepTxtGray}>2</Text>
          </View>
        </View>

        <Text style={styles.tag}>Step 1 of 2</Text>
        <Text style={styles.title}>Aadhaar Verification</Text>
        <Text style={styles.sub}>
          OTP will be sent to your Aadhaar-linked mobile
        </Text>

        {/* ✅ Show a warning banner for guest users */}
        {!isAuthenticated && (
          <View style={styles.authWarning}>
            <Text style={styles.authWarningText}>
              ⚠️ KYC requires a full login. Please log in with email & password
              first.
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.authWarningLink}>Log In →</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          {step === "entry" ? (
            <>
              <Text style={styles.label}>Aadhaar Number</Text>
              <TextInput
                style={styles.input}
                value={aadhaar}
                onChangeText={(v) => setAadhaar(formatAadhaar(v))}
                placeholder="XXXX  XXXX  XXXX"
                keyboardType="number-pad"
                maxLength={14}
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.hint}>
                🔒 Encrypted & never stored in plain text
              </Text>
              <TouchableOpacity
                style={[styles.btn, loading && styles.btnOff]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnTxt}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Enter 6-digit OTP</Text>
              <Text style={styles.sub2}>
                Sent to mobile linked with Aadhaar ••
                {aadhaar.replace(/\s/g, "").slice(-2)}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { letterSpacing: 8, fontSize: 22, fontWeight: "700" },
                ]}
                value={otp}
                onChangeText={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                placeholderTextColor="#9CA3AF"
                placeholder="——————"
              />
              <TouchableOpacity onPress={timer === 0 ? handleSendOtp : null}>
                <Text
                  style={[styles.resend, timer > 0 && { color: "#9CA3AF" }]}
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, loading && styles.btnOff]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnTxt}>Verify OTP</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setStep("entry");
                  setOtp("");
                }}
                style={{ marginTop: 12 }}
              >
                <Text style={styles.back}>← Change Aadhaar number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.legal}>
          By proceeding you consent to Aadhaar-based KYC per UIDAI guidelines.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: "#F7F3EE",
    padding: 24,
    paddingTop: 60,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTxt: { color: "#fff", fontWeight: "700" },
  stepLine: {
    width: 48,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  stepInactive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepTxtGray: { color: "#9CA3AF", fontWeight: "700" },
  tag: {
    textAlign: "center",
    color: BRAND,
    fontWeight: "600",
    fontSize: 12,
    marginBottom: 6,
  },
  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "800",
    color: "#1C1917",
    marginBottom: 6,
  },
  sub: {
    textAlign: "center",
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 28,
  },
  sub2: { fontSize: 13, color: "#6B7280", marginBottom: 16 },
  // ✅ New: auth warning banner
  authWarning: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  authWarningText: { fontSize: 13, color: "#92400E", marginBottom: 6 },
  authWarningLink: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 18,
    color: "#111827",
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
  },
  hint: { fontSize: 11, color: "#9CA3AF", marginBottom: 20 },
  btn: {
    backgroundColor: BRAND,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  btnOff: { opacity: 0.6 },
  btnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resend: {
    color: BRAND,
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  back: { color: "#6B7280", fontSize: 13, textAlign: "center" },
  legal: {
    textAlign: "center",
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 24,
    lineHeight: 16,
  },
});
