// src/screens/ActiveSessionScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, Alert, ScrollView, Animated } from 'react-native';

const CREAM = '#F7F3EE'; const DARK = '#1A1208'; const GOLD = '#C8963E'; const WHITE = '#FFFFFF'; const MUTED = '#8C7E6E'; const RED = '#DC2626'; const GREEN = '#16A34A';

export default function ActiveSessionScreen({ navigation, route }) {
  const { booking } = route.params || {};

  // Mock session data
  const hotelName    = booking?.hotel?.name  || 'The Grand Palace';
  const roomNumber   = booking?.room         || '204';
  const checkInTime  = booking?.checkIn      ? new Date(booking.checkIn)  : new Date();
  const checkOutTime = booking?.checkOut     ? new Date(booking.checkOut) : new Date(Date.now() + 2 * 60 * 60 * 1000);

  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor((checkOutTime - Date.now()) / 1000)));
  const [extended, setExtended] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── Countdown ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Pulse when < 10 min ─────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft < 600) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [timeLeft < 600]);

  const hours   = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const pad = n => String(n).padStart(2, '0');

  const isUrgent    = timeLeft < 600;  // < 10 min
  const isCritical  = timeLeft < 120;  // < 2 min

  const handleExtend = () => {
    Alert.alert(
      'Extend Stay',
      'Add 1 more hour to your session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Extend (+₹500)',
          onPress: () => {
            setTimeLeft(t => t + 3600);
            setExtended(true);
            Alert.alert('✅ Extended!', 'Your session has been extended by 1 hour.');
          },
        },
      ]
    );
  };

  const handleSOS = () => {
    Alert.alert(
      '🆘 Emergency SOS',
      'Do you need immediate assistance?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Front Desk', style: 'destructive', onPress: () => Alert.alert('Calling front desk...') },
      ]
    );
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to check out now?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Check Out', style: 'destructive', onPress: () => navigation.replace('CheckOut', { booking }) },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, isCritical && styles.safeCritical]}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Active Session</Text>
          </View>
          <Text style={styles.hotelName}>{hotelName}</Text>
          <Text style={styles.roomInfo}>Room {roomNumber}</Text>
        </View>

        {/* Timer */}
        <Animated.View style={[styles.timerBox, { transform: [{ scale: pulseAnim }] }, isUrgent && styles.timerBoxUrgent, isCritical && styles.timerBoxCritical]}>
          <Text style={styles.timerLabel}>{isCritical ? '⚠️ Time Almost Up!' : isUrgent ? '⏰ Ending Soon' : '⏱ Time Remaining'}</Text>
          <Text style={[styles.timerText, isUrgent && styles.timerTextUrgent]}>
            {pad(hours)}:{pad(minutes)}:{pad(seconds)}
          </Text>
          <Text style={styles.checkoutText}>
            Check-out at {checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Animated.View>

        {/* Room Info Cards */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🏨</Text>
            <Text style={styles.infoLabel}>Hotel</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{hotelName}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🚪</Text>
            <Text style={styles.infoLabel}>Room</Text>
            <Text style={styles.infoValue}>{roomNumber}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoLabel}>Check-in</Text>
            <Text style={styles.infoValue}>{checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>⏰</Text>
            <Text style={styles.infoLabel}>Check-out</Text>
            <Text style={styles.infoValue}>{checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.extendBtn} onPress={handleExtend} activeOpacity={0.85}>
            <Text style={styles.extendBtnText}>⏱  Extend Stay</Text>
            <Text style={styles.extendBtnSub}>+1 hour for ₹500</Text>
          </TouchableOpacity>
          {extended && (
            <View style={styles.extendedBadge}>
              <Text style={styles.extendedText}>✓ Session extended by 1 hr</Text>
            </View>
          )}
        </View>

        {/* SOS & End */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.sosBtn} onPress={handleSOS} activeOpacity={0.85}>
            <Text style={styles.sosBtnText}>🆘 SOS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.endBtn} onPress={handleEndSession} activeOpacity={0.85}>
            <Text style={styles.endBtnText}>End Session</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: DARK },
  safeCritical:  { backgroundColor: '#7F1D1D' },
  container:     { paddingHorizontal: 24, paddingTop: 50, paddingBottom: 40 },
  header:        { alignItems: 'center', marginBottom: 32 },
  activeBadge:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginBottom: 16 },
  activeDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  activeText:    { fontSize: 13, color: '#4ADE80', fontWeight: '700', letterSpacing: 0.5 },
  hotelName:     { fontSize: 24, fontWeight: '900', color: WHITE, textAlign: 'center', marginBottom: 6 },
  roomInfo:      { fontSize: 15, color: 'rgba(255,255,255,0.6)' },
  timerBox:      { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  timerBoxUrgent:{ borderColor: GOLD, backgroundColor: 'rgba(200,150,62,0.1)' },
  timerBoxCritical: { borderColor: RED, backgroundColor: 'rgba(220,38,38,0.15)' },
  timerLabel:    { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 0.5, marginBottom: 12 },
  timerText:     { fontSize: 56, fontWeight: '900', color: WHITE, letterSpacing: 2, fontVariant: ['tabular-nums'] },
  timerTextUrgent: { color: GOLD },
  checkoutText:  { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 10 },
  infoGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  infoCard:      { flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, alignItems: 'center', gap: 4 },
  infoIcon:      { fontSize: 22, marginBottom: 4 },
  infoLabel:     { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  infoValue:     { fontSize: 14, color: WHITE, fontWeight: '700', textAlign: 'center' },
  actions:       { marginBottom: 20 },
  extendBtn:     { backgroundColor: GOLD, borderRadius: 18, paddingVertical: 18, alignItems: 'center', gap: 2 },
  extendBtnText: { color: WHITE, fontSize: 17, fontWeight: '800' },
  extendBtnSub:  { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  extendedBadge: { backgroundColor: 'rgba(74,222,128,0.15)', borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 10 },
  extendedText:  { color: '#4ADE80', fontWeight: '600', fontSize: 13 },
  bottomActions: { flexDirection: 'row', gap: 12 },
  sosBtn:        { flex: 0, backgroundColor: RED, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  sosBtnText:    { color: WHITE, fontWeight: '800', fontSize: 15 },
  endBtn:        { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  endBtnText:    { color: WHITE, fontWeight: '700', fontSize: 15 },
});