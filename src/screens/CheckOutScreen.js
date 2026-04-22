// src/screens/CheckOutScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';

const CREAM = '#F7F3EE'; const DARK = '#1A1208'; const GOLD = '#C8963E'; const WHITE = '#FFFFFF'; const MUTED = '#8C7E6E'; const GREEN = '#16A34A';

export default function CheckOutScreen({ navigation, route }) {
  const { booking } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Mock session summary
  const checkIn  = booking?.checkIn  ? new Date(booking.checkIn)  : new Date(Date.now() - 2 * 3600000);
  const checkOut = new Date();
  const hoursUsed = ((checkOut - checkIn) / 3600000).toFixed(1);
  const ratePerHour = (booking?.pricePerNight || 4200) / 24;
  const totalCharge = Math.round(ratePerHour * parseFloat(hoursUsed));

  const handleConfirmCheckOut = async () => {
    Alert.alert(
      'Confirm Check-out',
      `You've used ${hoursUsed} hours. Final charge: ₹${totalCharge.toLocaleString()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setConfirmed(true);
              setTimeout(() => navigation.replace('RateReview', { booking }), 1500);
            }, 1500);
          },
        },
      ]
    );
  };

  if (confirmed) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successBox}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Checked Out!</Text>
          <Text style={styles.successSub}>Redirecting to review...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.emoji}>🚪</Text>
        <Text style={styles.title}>Check-out Summary</Text>
        <Text style={styles.subtitle}>Review your stay before confirming</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Time Used</Text>
          {[
            { label: 'Hotel',       value: booking?.hotel?.name || 'The Grand Palace' },
            { label: 'Room',        value: booking?.room || '204' },
            { label: 'Check-in',    value: checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
            { label: 'Check-out',   value: checkOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
            { label: 'Total Hours', value: `${hoursUsed} hrs` },
          ].map(r => (
            <View key={r.label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{r.label}</Text>
              <Text style={styles.summaryValue}>{r.value}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Final Charge</Text>
            <Text style={styles.totalValue}>₹{totalCharge.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmCheckOut} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color={WHITE} /> : <Text style={styles.confirmBtnText}>Confirm Check-out</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: CREAM },
  container:   { paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40, alignItems: 'center' },
  emoji:       { fontSize: 52, marginBottom: 16 },
  title:       { fontSize: 26, fontWeight: '900', color: DARK, marginBottom: 6 },
  subtitle:    { fontSize: 14, color: MUTED, marginBottom: 32 },
  summaryCard: { backgroundColor: WHITE, borderRadius: 20, padding: 20, width: '100%', marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle:   { fontSize: 13, fontWeight: '700', color: MUTED, marginBottom: 16, letterSpacing: 0.5 },
  summaryRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel:{ fontSize: 14, color: MUTED },
  summaryValue:{ fontSize: 14, fontWeight: '600', color: DARK },
  divider:     { height: 1, backgroundColor: '#F0EBE3', marginVertical: 12 },
  totalLabel:  { fontSize: 16, fontWeight: '800', color: DARK },
  totalValue:  { fontSize: 20, fontWeight: '900', color: GOLD },
  confirmBtn:  { backgroundColor: DARK, borderRadius: 18, paddingVertical: 18, alignItems: 'center', width: '100%' },
  confirmBtnText: { color: WHITE, fontSize: 17, fontWeight: '800' },
  successBox:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successEmoji:{ fontSize: 72, marginBottom: 20 },
  successTitle:{ fontSize: 28, fontWeight: '900', color: DARK, marginBottom: 8 },
  successSub:  { fontSize: 14, color: MUTED },
});