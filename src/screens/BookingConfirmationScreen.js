// src/screens/BookingConfirmationScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, SafeAreaView, StatusBar, Platform,
} from 'react-native';

const CREAM = '#F7F3EE';
const DARK  = '#1A1208';
const GOLD  = '#C8963E';
const MUTED = '#8C7E6E';
const WHITE = '#FFFFFF';
const GREEN = '#16A34A';

const fmt = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric',
});

const InfoRow = ({ label, value, bold }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoVal, bold && { fontWeight: '800', color: DARK }]}>{value}</Text>
  </View>
);

export default function BookingConfirmationScreen({ route, navigation }) {
  const { booking, hotel } = route.params || {};

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ padding: 24, color: DARK }}>No booking data found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Success Banner ── */}
        <View style={styles.successBanner}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSub}>Your reservation is successfully placed.</Text>
          <View style={styles.bookingIdBadge}>
            <Text style={styles.bookingIdLabel}>Booking ID</Text>
            <Text style={styles.bookingId}>#{booking._id?.slice(-8).toUpperCase()}</Text>
          </View>
        </View>

        {/* ── Hotel Card ── */}
        <View style={styles.hotelCard}>
          <Image source={{ uri: hotel?.image }} style={styles.hotelImg} resizeMode="cover" />
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>{hotel?.name || booking.hotel?.name}</Text>
            <Text style={styles.hotelLoc}>📍 {hotel?.location || booking.hotel?.location}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingVal}>{hotel?.rating}</Text>
            </View>
          </View>
        </View>

        {/* ── Stay Details ── */}
        <Text style={styles.sectionLabel}>Stay Details</Text>
        <View style={styles.card}>
          <View style={styles.datesRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateBoxLabel}>CHECK-IN</Text>
              <Text style={styles.dateBoxVal}>{fmt(booking.checkIn)}</Text>
              <Text style={styles.dateBoxSub}>From 2:00 PM</Text>
            </View>
            <View style={styles.nightsBox}>
              <Text style={styles.nightsNum}>{booking.totalNights}</Text>
              <Text style={styles.nightsLbl}>night{booking.totalNights !== 1 ? 's' : ''}</Text>
            </View>
            <View style={[styles.dateBox, { alignItems: 'flex-end' }]}>
              <Text style={styles.dateBoxLabel}>CHECK-OUT</Text>
              <Text style={styles.dateBoxVal}>{fmt(booking.checkOut)}</Text>
              <Text style={styles.dateBoxSub}>Until 12:00 PM</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <InfoRow label="Guests" value={`${booking.guests} Guest${booking.guests !== 1 ? 's' : ''}`} />
          <InfoRow label="Rooms"  value={`${booking.rooms} Room${booking.rooms !== 1 ? 's' : ''}`} />
        </View>

        {/* ── Guest Details ── */}
        <Text style={styles.sectionLabel}>Guest Details</Text>
        <View style={styles.card}>
          <InfoRow label="Name"  value={booking.guestName} />
          <View style={styles.divider} />
          <InfoRow label="Email" value={booking.guestEmail} />
          {booking.guestPhone ? (
            <>
              <View style={styles.divider} />
              <InfoRow label="Phone" value={booking.guestPhone} />
            </>
          ) : null}
          {booking.specialRequests ? (
            <>
              <View style={styles.divider} />
              <InfoRow label="Special Requests" value={booking.specialRequests} />
            </>
          ) : null}
        </View>

        {/* ── Price Summary ── */}
        <Text style={styles.sectionLabel}>Payment Summary</Text>
        <View style={styles.card}>
          <InfoRow
            label={`₹${booking.pricePerNight?.toLocaleString()} × ${booking.totalNights} nights × ${booking.rooms} room${booking.rooms !== 1 ? 's' : ''}`}
            value={`₹${(booking.pricePerNight * booking.totalNights * booking.rooms).toLocaleString()}`}
          />
          <View style={styles.divider} />
          <InfoRow
            label="Taxes & fees (12%)"
            value={`₹${Math.round(booking.pricePerNight * booking.totalNights * booking.rooms * 0.12).toLocaleString()}`}
          />
          <View style={styles.divider} />
          <InfoRow
            label="Total Charged"
            value={`₹${booking.totalAmount?.toLocaleString()}`}
            bold
          />
          <View style={styles.paidBadge}>
            <Text style={styles.paidText}>✓ Payment Confirmed</Text>
          </View>
        </View>

        {/* ── Status ── */}
        <View style={styles.statusCard}>
          <Text style={styles.statusDot}>●</Text>
          <View>
            <Text style={styles.statusTitle}>
              Status: {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
            </Text>
            <Text style={styles.statusSub}>You'll receive a confirmation email shortly.</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom Actions ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.myBookingsBtn}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.myBookingsBtnText}>My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: CREAM },

  successBanner: { backgroundColor: DARK, margin: 16, borderRadius: 24, padding: 24, alignItems: 'center' },
  checkCircle:   { width: 64, height: 64, borderRadius: 32, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  checkMark:     { color: WHITE, fontSize: 30, fontWeight: '800' },
  successTitle:  { fontSize: 22, fontWeight: '800', color: WHITE, marginBottom: 6 },
  successSub:    { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 18 },
  bookingIdBadge:{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' },
  bookingIdLabel:{ fontSize: 10, color: GOLD, fontWeight: '700', letterSpacing: 1, marginBottom: 3 },
  bookingId:     { fontSize: 18, fontWeight: '800', color: WHITE, letterSpacing: 2 },

  hotelCard: { flexDirection: 'row', backgroundColor: WHITE, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', marginBottom: 16, elevation: 2 },
  hotelImg:  { width: 100, height: 110 },
  hotelInfo: { flex: 1, padding: 14, justifyContent: 'space-around' },
  hotelName: { fontSize: 15, fontWeight: '800', color: DARK },
  hotelLoc:  { fontSize: 12, color: MUTED },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  star:      { color: GOLD, fontSize: 13 },
  ratingVal: { fontSize: 13, fontWeight: '700', color: DARK },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: MUTED, marginHorizontal: 16, marginBottom: 8, letterSpacing: 0.5 },

  card:    { backgroundColor: WHITE, marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 14, elevation: 1 },
  divider: { height: 1, backgroundColor: '#F0EAE2', marginVertical: 10 },

  datesRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  dateBox:     {},
  dateBoxLabel:{ fontSize: 10, color: MUTED, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  dateBoxVal:  { fontSize: 15, fontWeight: '800', color: DARK },
  dateBoxSub:  { fontSize: 11, color: MUTED, marginTop: 2 },
  nightsBox:   { alignItems: 'center', backgroundColor: CREAM, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  nightsNum:   { fontSize: 20, fontWeight: '800', color: DARK },
  nightsLbl:   { fontSize: 11, color: MUTED },

  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoLabel: { fontSize: 13, color: MUTED, flex: 1 },
  infoVal:   { fontSize: 13, fontWeight: '600', color: DARK, flex: 1, textAlign: 'right' },

  paidBadge:{ backgroundColor: '#F0FDF4', borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 12 },
  paidText: { color: GREEN, fontWeight: '700', fontSize: 13 },

  statusCard:  { flexDirection: 'row', backgroundColor: WHITE, marginHorizontal: 16, borderRadius: 16, padding: 16, alignItems: 'center', gap: 12, elevation: 1 },
  statusDot:   { fontSize: 18, color: GREEN },
  statusTitle: { fontSize: 14, fontWeight: '700', color: DARK },
  statusSub:   { fontSize: 12, color: MUTED, marginTop: 2 },

  bottomBar:       { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: WHITE, padding: 16, flexDirection: 'row', gap: 10, borderTopWidth: 1, borderColor: '#E8E0D5', paddingBottom: Platform.OS === 'ios' ? 28 : 16 },
  myBookingsBtn:   { flex: 1, borderWidth: 1.5, borderColor: DARK, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  myBookingsBtnText: { color: DARK, fontWeight: '700', fontSize: 14 },
  homeBtn:         { flex: 1, backgroundColor: DARK, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  homeBtnText:     { color: WHITE, fontWeight: '700', fontSize: 14 },
});