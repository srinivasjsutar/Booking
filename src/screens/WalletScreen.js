// src/screens/WalletScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, FlatList } from 'react-native';

const CREAM = '#F7F3EE'; const DARK = '#1A1208'; const GOLD = '#C8963E'; const WHITE = '#FFFFFF'; const MUTED = '#8C7E6E'; const GREEN = '#16A34A';

const PLANS = [
  { id: '1', name: '5-Hour Pack',  hours: 5,  price: 999,  perHour: 200, popular: false },
  { id: '2', name: '10-Hour Pack', hours: 10, price: 1799, perHour: 180, popular: true  },
  { id: '3', name: '20-Hour Pack', hours: 20, price: 3199, perHour: 160, popular: false },
];

const TRANSACTIONS = [
  { id: '1', type: 'credit',  desc: 'Referral bonus',       amount: 200,  date: 'Apr 20' },
  { id: '2', type: 'debit',   desc: 'Grand Palace booking', amount: 4200, date: 'Apr 18' },
  { id: '3', type: 'credit',  desc: 'Refund - Cancelled',   amount: 1500, date: 'Apr 15' },
  { id: '4', type: 'debit',   desc: 'Taj Vivanta booking',  amount: 7200, date: 'Apr 12' },
];

export default function WalletScreen({ navigation }) {
  const [balance]      = useState(350);
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Wallet</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Credits</Text>
          <Text style={styles.balanceAmount}>₹{balance.toLocaleString()}</Text>
          <Text style={styles.balanceSub}>Use credits for your next booking</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* Hour Pack Plans */}
        <Text style={styles.sectionTitle}>Hour-Pack Plans</Text>
        <Text style={styles.sectionSub}>Buy hours in bulk and save more</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.plansRow}>
          {PLANS.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, selectedPlan === plan.id && styles.planCardActive, plan.popular && styles.planCardPopular]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.85}
            >
              {plan.popular && <View style={styles.popularBadge}><Text style={styles.popularText}>Most Popular</Text></View>}
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planHours}>{plan.hours} hrs</Text>
              <Text style={styles.planPrice}>₹{plan.price.toLocaleString()}</Text>
              <Text style={styles.planPerHour}>₹{plan.perHour}/hr</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedPlan && (
          <TouchableOpacity style={styles.buyBtn} activeOpacity={0.85}>
            <Text style={styles.buyBtnText}>Buy {PLANS.find(p => p.id === selectedPlan)?.name} →</Text>
          </TouchableOpacity>
        )}

        {/* Transaction History */}
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {TRANSACTIONS.map(tx => (
          <View key={tx.id} style={styles.txRow}>
            <View style={[styles.txIcon, tx.type === 'credit' ? styles.txIconCredit : styles.txIconDebit]}>
              <Text style={styles.txIconText}>{tx.type === 'credit' ? '↓' : '↑'}</Text>
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txDesc}>{tx.desc}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text style={[styles.txAmount, tx.type === 'credit' ? styles.txAmountCredit : styles.txAmountDebit]}>
              {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
            </Text>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: CREAM },
  header:        { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  backBtn:       { width: 40, height: 40, borderRadius: 12, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  backIcon:      { fontSize: 20, color: DARK },
  title:         { fontSize: 22, fontWeight: '900', color: DARK },
  balanceCard:   { marginHorizontal: 24, borderRadius: 24, backgroundColor: DARK, padding: 24, marginBottom: 28, alignItems: 'center' },
  balanceLabel:  { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8, letterSpacing: 0.5 },
  balanceAmount: { fontSize: 48, fontWeight: '900', color: WHITE, marginBottom: 6 },
  balanceSub:    { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 },
  addBtn:        { backgroundColor: GOLD, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12 },
  addBtnText:    { color: WHITE, fontWeight: '700', fontSize: 15 },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: DARK, paddingHorizontal: 24, marginBottom: 4 },
  sectionSub:    { fontSize: 13, color: MUTED, paddingHorizontal: 24, marginBottom: 16 },
  plansRow:      { paddingHorizontal: 24, gap: 12, marginBottom: 16 },
  planCard:      { width: 140, backgroundColor: WHITE, borderRadius: 20, padding: 18, borderWidth: 2, borderColor: '#E8E0D5', alignItems: 'center' },
  planCardActive:{ borderColor: DARK },
  planCardPopular: { borderColor: GOLD },
  popularBadge:  { backgroundColor: GOLD, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10 },
  popularText:   { fontSize: 10, color: WHITE, fontWeight: '800' },
  planName:      { fontSize: 14, fontWeight: '700', color: DARK, marginBottom: 6, textAlign: 'center' },
  planHours:     { fontSize: 28, fontWeight: '900', color: DARK, marginBottom: 4 },
  planPrice:     { fontSize: 18, fontWeight: '800', color: GOLD },
  planPerHour:   { fontSize: 11, color: MUTED, marginTop: 2 },
  buyBtn:        { marginHorizontal: 24, backgroundColor: DARK, borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginBottom: 28 },
  buyBtnText:    { color: WHITE, fontSize: 16, fontWeight: '800' },
  txRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, marginHorizontal: 24, borderRadius: 14, padding: 14, marginBottom: 8, gap: 12 },
  txIcon:        { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txIconCredit:  { backgroundColor: '#DCFCE7' },
  txIconDebit:   { backgroundColor: '#FEE2E2' },
  txIconText:    { fontSize: 18, fontWeight: '700' },
  txInfo:        { flex: 1 },
  txDesc:        { fontSize: 14, fontWeight: '600', color: DARK, marginBottom: 2 },
  txDate:        { fontSize: 12, color: MUTED },
  txAmount:      { fontSize: 15, fontWeight: '800' },
  txAmountCredit:{ color: GREEN },
  txAmountDebit: { color: DARK },
});