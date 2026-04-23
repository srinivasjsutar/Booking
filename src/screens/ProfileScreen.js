// src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const CREAM = '#F7F3EE'; const DARK = '#1A1208'; const GOLD = '#C8963E'; const WHITE = '#FFFFFF'; const MUTED = '#8C7E6E'; const RED = '#DC2626';

const MenuItem = ({ icon, label, sub, onPress, danger, arrow = true }) => (
  <TouchableOpacity style={[styles.menuItem, danger && styles.menuItemDanger]} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIconBox, danger && styles.menuIconBoxDanger]}>
      <Text style={styles.menuIcon}>{icon}</Text>
    </View>
    <View style={styles.menuText}>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {sub && <Text style={styles.menuSub}>{sub}</Text>}
    </View>
    {arrow && <Text style={[styles.menuArrow, danger && { color: RED }]}>›</Text>}
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Guest User'}</Text>
          <Text style={styles.email}>{user?.email || user?.phone || ''}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('ProfileSetup', {})}>
            <Text style={styles.editBtnText}>✏️  Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* KYC Status */}
        <TouchableOpacity
          style={styles.kycCard}
          activeOpacity={0.85}
          onPress={() => {
            if (!isAuthenticated) {
              Alert.alert(
                'Account Required',
                'KYC verification requires a registered account. Please log in or register with email and password.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Register', onPress: () => navigation.navigate('Register') },
                  { text: 'Log In', onPress: () => navigation.navigate('Login') },
                ]
              );
              return;
            }
            navigation.navigate('KycAadhaar');
          }}
        >
          <View style={styles.kycLeft}>
            <Text style={styles.kycIcon}>🪪</Text>
            <View>
              <Text style={styles.kycTitle}>KYC Status</Text>
              <Text style={styles.kycStatus}>Not verified — Tap to complete</Text>
            </View>
          </View>
          <View style={styles.kycBadge}><Text style={styles.kycBadgeText}>Pending</Text></View>
        </TouchableOpacity>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bookings</Text>
          <MenuItem icon="📋" label="My Bookings"       sub="View all past and upcoming stays"  onPress={() => navigation.navigate('MyBookings')} />
          <MenuItem icon="👛" label="Wallet & Credits"  sub="₹0 available credits"              onPress={() => navigation.navigate('Wallet')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem icon="🔔" label="Notifications"    sub="Manage push alerts"                 onPress={() => {}} />
          <MenuItem icon="🔒" label="Privacy & Security"                                         onPress={() => {}} />
          <MenuItem icon="🌐" label="Switch to Web"    sub="Use StayEasy in browser"            onPress={() => {}} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <MenuItem icon="❓" label="Help & FAQ"                                                 onPress={() => navigation.navigate('Support')} />
          <MenuItem icon="⚠️" label="Raise a Dispute"                                           onPress={() => navigation.navigate('Support')} />
          <MenuItem icon="📞" label="Contact Us"                                                 onPress={() => {}} />
        </View>

        <View style={styles.section}>
          <MenuItem icon="🚪" label="Sign Out" danger onPress={handleLogout} arrow={false} />
        </View>

        <Text style={styles.version}>StayEasy v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: CREAM },
  header:        { alignItems: 'center', paddingTop: 32, paddingBottom: 24, paddingHorizontal: 24 },
  avatar:        { width: 84, height: 84, borderRadius: 42, backgroundColor: DARK, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: DARK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  avatarText:    { fontSize: 30, fontWeight: '900', color: WHITE },
  name:          { fontSize: 22, fontWeight: '900', color: DARK, marginBottom: 4 },
  email:         { fontSize: 14, color: MUTED, marginBottom: 16 },
  editBtn:       { backgroundColor: WHITE, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 9, borderWidth: 1, borderColor: '#E8E0D5' },
  editBtnText:   { fontSize: 14, color: DARK, fontWeight: '600' },
  kycCard:       { marginHorizontal: 24, marginBottom: 20, backgroundColor: '#FFF9F0', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#F0D9A8' },
  kycLeft:       { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  kycIcon:       { fontSize: 28 },
  kycTitle:      { fontSize: 14, fontWeight: '700', color: DARK, marginBottom: 2 },
  kycStatus:     { fontSize: 12, color: MUTED },
  kycBadge:      { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  kycBadgeText:  { fontSize: 11, color: '#92400E', fontWeight: '700' },
  section:       { marginHorizontal: 24, marginBottom: 8 },
  sectionTitle:  { fontSize: 12, fontWeight: '700', color: MUTED, letterSpacing: 0.8, marginBottom: 8, marginLeft: 4, marginTop: 12 },
  menuItem:      { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderRadius: 14, padding: 14, marginBottom: 8, gap: 12 },
  menuItemDanger:{ backgroundColor: '#FFF5F5' },
  menuIconBox:   { width: 40, height: 40, borderRadius: 12, backgroundColor: CREAM, alignItems: 'center', justifyContent: 'center' },
  menuIconBoxDanger: { backgroundColor: '#FEE2E2' },
  menuIcon:      { fontSize: 18 },
  menuText:      { flex: 1 },
  menuLabel:     { fontSize: 15, fontWeight: '600', color: DARK },
  menuLabelDanger: { color: RED },
  menuSub:       { fontSize: 12, color: MUTED, marginTop: 1 },
  menuArrow:     { fontSize: 22, color: MUTED },
  version:       { textAlign: 'center', fontSize: 12, color: MUTED, paddingVertical: 24 },
});