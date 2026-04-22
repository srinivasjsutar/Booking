// src/screens/BookingScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Alert, ActivityIndicator, Modal,
  Dimensions, StatusBar, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../api/hotelApi';

const { width } = Dimensions.get('window');

const CREAM = '#F7F3EE';
const DARK  = '#1A1208';
const GOLD  = '#C8963E';
const MUTED = '#8C7E6E';
const WHITE = '#FFFFFF';
const GREEN = '#16A34A';
const RED   = '#DC2626';

// ── Mini Calendar ──────────────────────────────────────────────────────────────
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function CalendarPicker({ selectedDate, minDate, maxDate, onSelect, onClose, title }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear,  setViewYear]  = useState((selectedDate || minDate || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((selectedDate || minDate || today).getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isDisabled = (day) => {
    if (!day) return true;
    const date = new Date(viewYear, viewMonth, day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    return selectedDate.getFullYear() === viewYear &&
           selectedDate.getMonth() === viewMonth &&
           selectedDate.getDate() === day;
  };

  const isToday = (day) => {
    if (!day) return false;
    return today.getFullYear() === viewYear &&
           today.getMonth() === viewMonth &&
           today.getDate() === day;
  };

  return (
    <View style={cal.container}>
      <View style={cal.header}>
        <Text style={cal.title}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={cal.closeBtn}>
          <Text style={cal.closeX}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={cal.nav}>
        <TouchableOpacity onPress={prevMonth} style={cal.navBtn}>
          <Text style={cal.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={cal.monthYear}>{MONTHS[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={nextMonth} style={cal.navBtn}>
          <Text style={cal.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={cal.daysRow}>
        {DAYS.map(d => <Text key={d} style={cal.dayLabel}>{d}</Text>)}
      </View>

      <View style={cal.grid}>
        {cells.map((day, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              cal.cell,
              isSelected(day) && cal.cellSelected,
              isToday(day) && !isSelected(day) && cal.cellToday,
            ]}
            disabled={isDisabled(day)}
            onPress={() => {
              if (day) {
                onSelect(new Date(viewYear, viewMonth, day));
                onClose();
              }
            }}
          >
            <Text style={[
              cal.cellText,
              isDisabled(day) && cal.cellDisabled,
              isSelected(day) && cal.cellSelectedText,
              isToday(day) && !isSelected(day) && cal.cellTodayText,
            ]}>
              {day || ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Guest Selector ─────────────────────────────────────────────────────────────
function GuestSelector({ guests, rooms, onGuestsChange, onRoomsChange, onClose }) {
  return (
    <View style={gs.container}>
      <View style={gs.header}>
        <Text style={gs.title}>Guests & Rooms</Text>
        <TouchableOpacity onPress={onClose} style={gs.closeBtn}>
          <Text style={gs.closeX}>✕</Text>
        </TouchableOpacity>
      </View>

      {[
        { label: 'Guests', sublabel: 'Adults & children', value: guests, min: 1, max: 20, onChange: onGuestsChange },
        { label: 'Rooms',  sublabel: 'Number of rooms',   value: rooms,  min: 1, max: 10, onChange: onRoomsChange  },
      ].map(item => (
        <View key={item.label} style={gs.row}>
          <View>
            <Text style={gs.rowLabel}>{item.label}</Text>
            <Text style={gs.rowSub}>{item.sublabel}</Text>
          </View>
          <View style={gs.counter}>
            <TouchableOpacity
              style={[gs.counterBtn, item.value <= item.min && gs.counterBtnDisabled]}
              onPress={() => item.value > item.min && item.onChange(item.value - 1)}
            >
              <Text style={gs.counterBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={gs.counterValue}>{item.value}</Text>
            <TouchableOpacity
              style={[gs.counterBtn, item.value >= item.max && gs.counterBtnDisabled]}
              onPress={() => item.value < item.max && item.onChange(item.value + 1)}
            >
              <Text style={gs.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={gs.doneBtn} onPress={onClose}>
        <Text style={gs.doneBtnText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmt = (date) => date
  ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

const nightsBetween = (a, b) => {
  if (!a || !b) return 0;
  return Math.max(0, Math.ceil((b - a) / (1000 * 60 * 60 * 24)));
};

// ── Main Booking Screen ────────────────────────────────────────────────────────
export default function BookingScreen({ route, navigation }) {
  const { hotel } = route.params || {};
  const { user, token } = useAuth();

  const today    = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);

  const [checkIn,   setCheckIn]   = useState(tomorrow);
  const [checkOut,  setCheckOut]  = useState(dayAfter);
  const [guests,    setGuests]    = useState(2);
  const [rooms,     setRooms]     = useState(1);
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail,setGuestEmail]= useState(user?.email || '');
  const [guestPhone,setGuestPhone]= useState('');
  const [special,   setSpecial]   = useState('');
  const [loading,   setLoading]   = useState(false);

  const [showCheckIn,  setShowCheckIn]  = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [showGuests,   setShowGuests]   = useState(false);

  const nights      = nightsBetween(checkIn, checkOut);
  const subtotal    = (hotel?.pricePerNight || 0) * nights * rooms;
  const taxes       = Math.round(subtotal * 0.12);
  const total       = subtotal + taxes;

  const handleBook = async () => {
    if (!guestName.trim())  return Alert.alert('Missing Info', 'Please enter guest name');
    if (!guestEmail.trim()) return Alert.alert('Missing Info', 'Please enter guest email');
    if (nights < 1)         return Alert.alert('Invalid Dates', 'Check-out must be after check-in');

    setLoading(true);
    try {
      const result = await bookingApi.create(
        {
          hotelId: hotel._id,
          checkIn:  checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests,
          rooms,
          guestName:  guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
          specialRequests: special.trim(),
        },
        token
      );

      navigation.replace('BookingConfirmation', {
        booking: result.booking,
        hotel,
      });
    } catch (err) {
      Alert.alert('Booking Failed', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!hotel) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ color: DARK, padding: 24 }}>Hotel not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />

      {/* ── Modals ── */}
      <Modal visible={showCheckIn}  transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <CalendarPicker
            title="Check-in Date"
            selectedDate={checkIn}
            minDate={today}
            onSelect={(d) => {
              setCheckIn(d);
              // Auto-advance checkout if needed
              if (checkOut <= d) {
                const next = new Date(d); next.setDate(d.getDate() + 1);
                setCheckOut(next);
              }
            }}
            onClose={() => setShowCheckIn(false)}
          />
        </View>
      </Modal>

      <Modal visible={showCheckOut} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <CalendarPicker
            title="Check-out Date"
            selectedDate={checkOut}
            minDate={(() => { const d = new Date(checkIn); d.setDate(d.getDate() + 1); return d; })()}
            onSelect={setCheckOut}
            onClose={() => setShowCheckOut(false)}
          />
        </View>
      </Modal>

      <Modal visible={showGuests} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GuestSelector
            guests={guests}
            rooms={rooms}
            onGuestsChange={setGuests}
            onRoomsChange={setRooms}
            onClose={() => setShowGuests(false)}
          />
        </View>
      </Modal>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.topTitle}>Book Hotel</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* ── Hotel Summary ── */}
          <View style={styles.hotelCard}>
            <Image source={{ uri: hotel.image }} style={styles.hotelImg} resizeMode="cover" />
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName} numberOfLines={1}>{hotel.name}</Text>
              <Text style={styles.hotelLoc}>📍 {hotel.location}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.star}>★</Text>
                <Text style={styles.ratingVal}>{hotel.rating}</Text>
                <Text style={styles.ratingCount}>({hotel.reviews} reviews)</Text>
              </View>
              <Text style={styles.hotelPrice}>₹{hotel.pricePerNight?.toLocaleString()}<Text style={styles.perNight}>/night</Text></Text>
            </View>
          </View>

          {/* ── Date & Guest Selectors ── */}
          <Text style={styles.sectionLabel}>Stay Details</Text>
          <View style={styles.stayRow}>
            <TouchableOpacity style={[styles.stayBox, { flex: 1, marginRight: 8 }]} onPress={() => setShowCheckIn(true)}>
              <Text style={styles.stayBoxLabel}>CHECK-IN</Text>
              <Text style={styles.stayBoxVal}>{fmt(checkIn)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.stayBox, { flex: 1 }]} onPress={() => setShowCheckOut(true)}>
              <Text style={styles.stayBoxLabel}>CHECK-OUT</Text>
              <Text style={styles.stayBoxVal}>{fmt(checkOut)}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.guestBox} onPress={() => setShowGuests(true)}>
            <View>
              <Text style={styles.stayBoxLabel}>GUESTS & ROOMS</Text>
              <Text style={styles.stayBoxVal}>{guests} Guest{guests !== 1 ? 's' : ''} · {rooms} Room{rooms !== 1 ? 's' : ''}</Text>
            </View>
            <Text style={styles.editText}>Edit ›</Text>
          </TouchableOpacity>

          {/* ── Duration Badge ── */}
          {nights > 0 && (
            <View style={styles.nightsBadge}>
              <Text style={styles.nightsText}>🌙 {nights} Night{nights !== 1 ? 's' : ''} Stay</Text>
            </View>
          )}

          {/* ── Guest Details ── */}
          <Text style={styles.sectionLabel}>Guest Details</Text>
          <View style={styles.formCard}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={guestName}
                onChangeText={setGuestName}
                placeholder="Enter full name"
                placeholderTextColor="#B0A99A"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                value={guestEmail}
                onChangeText={setGuestEmail}
                placeholder="Enter email"
                placeholderTextColor="#B0A99A"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={guestPhone}
                onChangeText={setGuestPhone}
                placeholder="Enter phone number"
                placeholderTextColor="#B0A99A"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* ── Special Requests ── */}
          <Text style={styles.sectionLabel}>Special Requests <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={styles.textArea}
            value={special}
            onChangeText={setSpecial}
            placeholder="e.g. Early check-in, high floor, extra pillows..."
            placeholderTextColor="#B0A99A"
            multiline
            numberOfLines={3}
          />

          {/* ── Price Breakdown ── */}
          <Text style={styles.sectionLabel}>Price Summary</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>₹{hotel.pricePerNight?.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''} × {rooms} room{rooms !== 1 ? 's' : ''}</Text>
              <Text style={styles.priceVal}>₹{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Taxes & fees (12%)</Text>
              <Text style={styles.priceVal}>₹{taxes.toLocaleString()}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalVal}>₹{total.toLocaleString()}</Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom CTA ── */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotal}>₹{total.toLocaleString()}</Text>
          <Text style={styles.bottomSub}>{nights} night{nights !== 1 ? 's' : ''} · {guests} guest{guests !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
          onPress={handleBook}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={WHITE} />
            : <Text style={styles.confirmBtnText}>Confirm Booking</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },

  topBar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50 },
  backBtn:    { width: 40, height: 40, borderRadius: 12, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  backArrow:  { fontSize: 20, color: DARK },
  topTitle:   { fontSize: 18, fontWeight: '800', color: DARK },

  hotelCard:  { flexDirection: 'row', backgroundColor: WHITE, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', marginBottom: 20, elevation: 2 },
  hotelImg:   { width: 110, height: 120 },
  hotelInfo:  { flex: 1, padding: 12, justifyContent: 'space-between' },
  hotelName:  { fontSize: 15, fontWeight: '800', color: DARK },
  hotelLoc:   { fontSize: 12, color: MUTED },
  ratingRow:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  star:       { color: GOLD, fontSize: 13 },
  ratingVal:  { fontSize: 13, fontWeight: '700', color: DARK },
  ratingCount:{ fontSize: 11, color: MUTED },
  hotelPrice: { fontSize: 16, fontWeight: '800', color: GOLD },
  perNight:   { fontSize: 11, color: MUTED, fontWeight: '400' },

  sectionLabel: { fontSize: 14, fontWeight: '700', color: DARK, marginHorizontal: 16, marginBottom: 10, marginTop: 4 },
  optional:     { fontWeight: '400', color: MUTED },

  stayRow:   { flexDirection: 'row', marginHorizontal: 16, marginBottom: 10 },
  stayBox:   { backgroundColor: WHITE, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#E8E0D5' },
  stayBoxLabel:{ fontSize: 10, fontWeight: '700', color: MUTED, letterSpacing: 0.8, marginBottom: 4 },
  stayBoxVal:  { fontSize: 14, fontWeight: '700', color: DARK },

  guestBox:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: WHITE, borderRadius: 14, padding: 14, marginHorizontal: 16, borderWidth: 1.5, borderColor: '#E8E0D5', marginBottom: 10 },
  editText:  { fontSize: 13, color: GOLD, fontWeight: '600' },

  nightsBadge: { alignSelf: 'center', backgroundColor: DARK, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 7, marginBottom: 18, marginTop: 4 },
  nightsText:  { color: WHITE, fontSize: 13, fontWeight: '700' },

  formCard: { backgroundColor: WHITE, marginHorizontal: 16, borderRadius: 16, marginBottom: 14, overflow: 'hidden' },
  inputRow: { paddingHorizontal: 16, paddingVertical: 14 },
  inputLabel:{ fontSize: 11, color: MUTED, fontWeight: '600', marginBottom: 4 },
  input:    { fontSize: 15, color: DARK },
  divider:  { height: 1, backgroundColor: '#F0EAE2', marginHorizontal: 16 },

  textArea: { backgroundColor: WHITE, marginHorizontal: 16, borderRadius: 16, padding: 16, fontSize: 14, color: DARK, minHeight: 90, textAlignVertical: 'top', marginBottom: 16, borderWidth: 1, borderColor: '#E8E0D5' },

  priceCard:   { backgroundColor: WHITE, marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 16 },
  priceRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel:  { fontSize: 13, color: MUTED },
  priceVal:    { fontSize: 13, fontWeight: '600', color: DARK },
  priceDivider:{ height: 1, backgroundColor: '#F0EAE2', marginBottom: 10 },
  totalLabel:  { fontSize: 15, fontWeight: '800', color: DARK },
  totalVal:    { fontSize: 15, fontWeight: '800', color: GOLD },

  bottomBar:    { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: WHITE, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#E8E0D5', paddingBottom: Platform.OS === 'ios' ? 28 : 16 },
  bottomTotal:  { fontSize: 20, fontWeight: '800', color: DARK },
  bottomSub:    { fontSize: 12, color: MUTED, marginTop: 2 },
  confirmBtn:   { backgroundColor: DARK, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  confirmBtnText:{ color: WHITE, fontWeight: '800', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
});

// ── Calendar styles ────────────────────────────────────────────────────────────
const cal = StyleSheet.create({
  container: { backgroundColor: WHITE, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title:     { fontSize: 17, fontWeight: '800', color: DARK },
  closeBtn:  { width: 32, height: 32, borderRadius: 16, backgroundColor: CREAM, alignItems: 'center', justifyContent: 'center' },
  closeX:    { fontSize: 14, color: MUTED },
  nav:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  navBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: CREAM, alignItems: 'center', justifyContent: 'center' },
  navArrow:  { fontSize: 22, color: DARK, marginTop: -2 },
  monthYear: { fontSize: 16, fontWeight: '700', color: DARK },
  daysRow:   { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  dayLabel:  { width: (width - 40) / 7, textAlign: 'center', fontSize: 11, color: MUTED, fontWeight: '600' },
  grid:      { flexDirection: 'row', flexWrap: 'wrap' },
  cell:      { width: (width - 40) / 7, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  cellSelected:     { backgroundColor: DARK },
  cellToday:        { borderWidth: 1.5, borderColor: GOLD },
  cellText:         { fontSize: 15, color: DARK, fontWeight: '500' },
  cellDisabled:     { color: '#D5CFC8' },
  cellSelectedText: { color: WHITE, fontWeight: '700' },
  cellTodayText:    { color: GOLD, fontWeight: '700' },
});

// ── Guest Selector styles ──────────────────────────────────────────────────────
const gs = StyleSheet.create({
  container: { backgroundColor: WHITE, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title:     { fontSize: 17, fontWeight: '800', color: DARK },
  closeBtn:  { width: 32, height: 32, borderRadius: 16, backgroundColor: CREAM, alignItems: 'center', justifyContent: 'center' },
  closeX:    { fontSize: 14, color: MUTED },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  rowLabel:  { fontSize: 15, fontWeight: '700', color: DARK },
  rowSub:    { fontSize: 12, color: MUTED, marginTop: 2 },
  counter:   { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn:{ width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: DARK, alignItems: 'center', justifyContent: 'center' },
  counterBtnDisabled: { borderColor: '#D5CFC8' },
  counterBtnText:     { fontSize: 20, color: DARK, marginTop: -1 },
  counterValue:       { fontSize: 18, fontWeight: '700', color: DARK, minWidth: 28, textAlign: 'center' },
  doneBtn:   { backgroundColor: DARK, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  doneBtnText: { color: WHITE, fontWeight: '800', fontSize: 15 },
});