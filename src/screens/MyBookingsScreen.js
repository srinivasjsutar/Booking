// src/screens/MyBookingsScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { bookingApi } from "../api/hotelApi";

const CREAM = "#F7F3EE";
const DARK = "#1A1208";
const GOLD = "#C8963E";
const MUTED = "#8C7E6E";
const WHITE = "#FFFFFF";
const GREEN = "#16A34A";
const RED = "#DC2626";
const ORANGE = "#EA580C";

const STATUS_CONFIG = {
  confirmed: { color: GREEN, bg: "#F0FDF4", label: "Confirmed" },
  pending: { color: ORANGE, bg: "#FFF7ED", label: "Pending" },
  cancelled: { color: RED, bg: "#FEF2F2", label: "Cancelled" },
  completed: { color: MUTED, bg: "#F5F5F5", label: "Completed" },
};

const fmt = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function BookingCard({ booking, onCancel, onPress }) {
  const hotel = booking.hotel || {};
  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPress(booking)}
    >
      <View style={styles.cardTop}>
        <Image
          source={{
            uri:
              hotel.image ||
              "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400",
          }}
          style={styles.hotelImg}
          resizeMode="cover"
        />
        <View style={styles.cardInfo}>
          <Text style={styles.hotelName} numberOfLines={1}>
            {hotel.name || "Hotel"}
          </Text>
          <Text style={styles.hotelLoc} numberOfLines={1}>
            📍 {hotel.location || ""}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.statusText, { color: config.color }]}>
              ● {config.label}
            </Text>
          </View>
        </View>
        <Text style={styles.bookingIdSmall}>
          #{booking._id?.slice(-6).toUpperCase()}
        </Text>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.datesRow}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>CHECK-IN</Text>
          <Text style={styles.dateVal}>{fmt(booking.checkIn)}</Text>
        </View>
        <View style={styles.nightsChip}>
          <Text style={styles.nightsNum}>{booking.totalNights}</Text>
          <Text style={styles.nightsLabel}>nights</Text>
        </View>
        <View style={[styles.dateBlock, { alignItems: "flex-end" }]}>
          <Text style={styles.dateLabel}>CHECK-OUT</Text>
          <Text style={styles.dateVal}>{fmt(booking.checkOut)}</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardBottom}>
        <View>
          <Text style={styles.guestsText}>
            {booking.guests} Guest{booking.guests !== 1 ? "s" : ""} ·{" "}
            {booking.rooms} Room{booking.rooms !== 1 ? "s" : ""}
          </Text>
          <Text style={styles.totalText}>
            ₹{booking.totalAmount?.toLocaleString()}
          </Text>
        </View>
        {booking.status === "confirmed" && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => onCancel(booking._id)}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function MyBookingsScreen({ navigation }) {
  const { token, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchBookings = useCallback(async () => {
    // ✅ FIX: Guest tokens are rejected by the server with 401.
    // Show an empty state with a login prompt instead of hitting the API.
    if (!isAuthenticated) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await bookingApi.getMyBookings(token);
      setBookings(data.bookings || []);
    } catch (err) {
      console.log("Bookings fetch error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = (id) => {
    // ✅ Guard cancel too
    if (!isAuthenticated) {
      Alert.alert("Login Required", "Please log in to manage bookings.");
      return;
    }
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: async () => {
            try {
              await bookingApi.cancel(id, token);
              setBookings((prev) =>
                prev.map((b) =>
                  b._id === id ? { ...b, status: "cancelled" } : b,
                ),
              );
            } catch (err) {
              Alert.alert("Error", err.message || "Could not cancel booking");
            }
          },
        },
      ],
    );
  };

  const FILTERS = ["all", "confirmed", "cancelled", "completed"];

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  // ✅ Guest users see a login prompt instead of an empty or error state
  const GuestPrompt = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔐</Text>
      <Text style={styles.emptyTitle}>Login to see bookings</Text>
      <Text style={styles.emptyText}>
        Your bookings are tied to your account. Please log in to view them.
      </Text>
      <TouchableOpacity
        style={styles.browseBtn}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.browseBtnText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === f && styles.filterTabTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={GOLD} />
        </View>
      ) : !isAuthenticated ? (
        // ✅ Guest prompt replaces the list entirely
        <GuestPrompt />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(b) => b._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBookings();
              }}
              tintColor={GOLD}
              colors={[GOLD]}
            />
          }
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onCancel={handleCancel}
              onPress={(b) =>
                navigation.navigate("BookingDetail", {
                  bookingId: b._id,
                  booking: b,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏨</Text>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyText}>
                Your confirmed bookings will appear here.
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => navigation.navigate("Home")}
              >
                <Text style={styles.browseBtnText}>Browse Hotels</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 50,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { fontSize: 20, color: DARK },
  headerTitle: { fontSize: 18, fontWeight: "800", color: DARK },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: "#E8E0D5",
  },
  filterTabActive: { backgroundColor: DARK, borderColor: DARK },
  filterTabText: { fontSize: 13, color: MUTED, fontWeight: "600" },
  filterTabTextActive: { color: WHITE },

  list: { paddingHorizontal: 16, paddingBottom: 32 },

  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  cardTop: { flexDirection: "row", padding: 14, gap: 12 },
  hotelImg: { width: 80, height: 80, borderRadius: 12 },
  cardInfo: { flex: 1, justifyContent: "space-between" },
  hotelName: { fontSize: 15, fontWeight: "800", color: DARK },
  hotelLoc: { fontSize: 12, color: MUTED },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  bookingIdSmall: { fontSize: 11, color: MUTED, fontWeight: "600" },

  cardDivider: { height: 1, backgroundColor: "#F0EAE2", marginHorizontal: 14 },

  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  dateBlock: {},
  dateLabel: {
    fontSize: 10,
    color: MUTED,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  dateVal: { fontSize: 13, fontWeight: "700", color: DARK },
  nightsChip: {
    alignItems: "center",
    backgroundColor: CREAM,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  nightsNum: { fontSize: 17, fontWeight: "800", color: DARK },
  nightsLabel: { fontSize: 10, color: MUTED },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  guestsText: { fontSize: 12, color: MUTED, marginBottom: 4 },
  totalText: { fontSize: 17, fontWeight: "800", color: DARK },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  cancelBtnText: { color: RED, fontWeight: "700", fontSize: 13 },

  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyState: { alignItems: "center", paddingTop: 80, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: DARK, marginBottom: 8 },
  emptyText: {
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  browseBtn: {
    backgroundColor: DARK,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  browseBtnText: { color: WHITE, fontWeight: "700", fontSize: 14 },
});
