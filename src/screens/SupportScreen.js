// src/screens/SupportScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Linking, Alert } from 'react-native';

const CREAM = '#F7F3EE'; const DARK = '#1A1208'; const GOLD = '#C8963E'; const WHITE = '#FFFFFF'; const MUTED = '#8C7E6E';

const FAQS = [
  { q: 'How do I cancel a booking?',         a: 'Go to My Bookings → Select booking → Tap Cancel. Cancellation 24h before check-in is free.' },
  { q: 'When will I get my refund?',          a: 'Refunds are processed within 5-7 business days to the original payment method.' },
  { q: 'How does check-in work?',             a: 'You\'ll receive an OTP after booking. Show it to the front desk staff to start your session.' },
  { q: 'Can I extend my stay?',               a: 'Yes! Tap "Extend Stay" in the Active Session screen to add more hours.' },
  { q: 'What if I face an issue at the hotel?', a: 'Use the SOS button during an active session, or contact our support team directly.' },
];

export default function SupportScreen({ navigation }) {
  const [openFaq, setOpenFaq] = useState(null);

  const handleCall = () => Linking.openURL('tel:+918001234567');
  const handleChat = () => Alert.alert('Chat Support', 'Opening chat support...');
  const handleDispute = () => Alert.alert('Raise Dispute', 'Please describe your issue. Our team will respond within 24 hours.');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
        </View>

        {/* Contact Options */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={handleChat} activeOpacity={0.85}>
            <Text style={styles.contactIcon}>💬</Text>
            <Text style={styles.contactLabel}>Live Chat</Text>
            <Text style={styles.contactSub}>Avg. 2 min response</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactCard} onPress={handleCall} activeOpacity={0.85}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactLabel}>Call Us</Text>
            <Text style={styles.contactSub}>Mon–Sat 9am–9pm</Text>
          </TouchableOpacity>
        </View>

        {/* Dispute */}
        <TouchableOpacity style={styles.disputeCard} onPress={handleDispute} activeOpacity={0.85}>
          <View style={styles.disputeLeft}>
            <Text style={styles.disputeTitle}>⚠️  Raise a Dispute</Text>
            <Text style={styles.disputeDesc}>Issue with a booking or hotel? We'll help resolve it within 24 hours.</Text>
          </View>
          <Text style={styles.disputeArrow}>›</Text>
        </TouchableOpacity>

        {/* FAQs */}
        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        {FAQS.map((faq, i) => (
          <TouchableOpacity
            key={i}
            style={styles.faqItem}
            onPress={() => setOpenFaq(openFaq === i ? null : i)}
            activeOpacity={0.85}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqToggle}>{openFaq === i ? '▲' : '▼'}</Text>
            </View>
            {openFaq === i && <Text style={styles.faqAnswer}>{faq.a}</Text>}
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: CREAM },
  header:        { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
  backBtn:       { width: 40, height: 40, borderRadius: 12, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  backIcon:      { fontSize: 20, color: DARK },
  title:         { fontSize: 22, fontWeight: '900', color: DARK },
  contactRow:    { flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginBottom: 16 },
  contactCard:   { flex: 1, backgroundColor: WHITE, borderRadius: 18, padding: 20, alignItems: 'center', gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  contactIcon:   { fontSize: 28, marginBottom: 4 },
  contactLabel:  { fontSize: 15, fontWeight: '700', color: DARK },
  contactSub:    { fontSize: 11, color: MUTED },
  disputeCard:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, backgroundColor: '#FFF9F0', borderRadius: 16, padding: 16, marginBottom: 28, borderWidth: 1, borderColor: '#F0D9A8' },
  disputeLeft:   { flex: 1 },
  disputeTitle:  { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 4 },
  disputeDesc:   { fontSize: 12, color: MUTED, lineHeight: 18 },
  disputeArrow:  { fontSize: 24, color: GOLD },
  faqTitle:      { fontSize: 18, fontWeight: '800', color: DARK, paddingHorizontal: 24, marginBottom: 14 },
  faqItem:       { backgroundColor: WHITE, marginHorizontal: 24, borderRadius: 14, padding: 16, marginBottom: 8 },
  faqHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion:   { fontSize: 14, fontWeight: '700', color: DARK, flex: 1, marginRight: 8 },
  faqToggle:     { fontSize: 12, color: MUTED },
  faqAnswer:     { fontSize: 13, color: MUTED, lineHeight: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0EBE3' },
});