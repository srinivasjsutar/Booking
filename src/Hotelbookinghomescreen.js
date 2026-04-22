// src/screens/HotelBookingHomeScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, FlatList, Dimensions, StatusBar,
  SafeAreaView, ActivityIndicator, RefreshControl, Animated,
  Alert,
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { hotelApi } from './api/hotelApi';

const { width } = Dimensions.get('window');

// ── Theme ──────────────────────────────────────────────────────────────────
const CREAM  = '#F7F3EE';
const DARK   = '#1A1208';
const GOLD   = '#C8963E';
const MUTED  = '#8C7E6E';
const WHITE  = '#FFFFFF';
const CARD   = '#FFFFFF';
const SHIMMER= '#EDE8E1';

// ── Categories ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',      label: 'All',      icon: '🏨' },
  { id: 'beach',    label: 'Beach',    icon: '🏖️' },
  { id: 'city',     label: 'City',     icon: '🏙️' },
  { id: 'mountain', label: 'Mountain', icon: '🏔️' },
  { id: 'luxury',   label: 'Luxury',   icon: '💎' },
  { id: 'budget',   label: 'Budget',   icon: '🎒' },
  { id: 'resort',   label: 'Resort',   icon: '🌴' },
];

// ── Mock fallback data ─────────────────────────────────────────────────────
const MOCK_FEATURED = [
  { _id: '1', name: 'The Grand Palace', location: 'Bengaluru, Karnataka', pricePerNight: 4200, rating: 4.9, reviews: 312, tag: 'Best Seller', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600', amenities: ['WiFi','Pool','Spa'] },
  { _id: '2', name: 'Serenity Resort',  location: 'Goa, India',           pricePerNight: 6800, rating: 4.8, reviews: 198, tag: 'Luxury',      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600', amenities: ['WiFi','Beach','Bar'] },
  { _id: '3', name: 'Mountain Retreat', location: 'Manali, HP',           pricePerNight: 3100, rating: 4.7, reviews: 245, tag: 'Nature',      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', amenities: ['WiFi','Trekking'] },
];
const MOCK_POPULAR = [
  { _id: '4', name: 'Hotel Leela',  location: 'Mumbai',    pricePerNight: 5500, rating: 4.6, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', amenities: ['WiFi','Pool','Gym'] },
  { _id: '5', name: 'Taj Vivanta',  location: 'Delhi',     pricePerNight: 7200, rating: 4.8, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',   amenities: ['WiFi','Spa','Restaurant'] },
  { _id: '6', name: 'ITC Windsor',  location: 'Bengaluru', pricePerNight: 4900, rating: 4.7, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400',  amenities: ['WiFi','Gym','Restaurant'] },
];

// ── Skeleton ───────────────────────────────────────────────────────────────
const SkeletonBox = ({ width: w, height: h, borderRadius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);
  return <Animated.View style={[{ width: w, height: h, borderRadius, backgroundColor: SHIMMER, opacity }, style]} />;
};

const FeaturedSkeleton = () => (
  <View style={[styles.featuredCard, { backgroundColor: SHIMMER, marginRight: 12 }]}>
    <SkeletonBox width="100%" height="100%" borderRadius={20} />
  </View>
);

const PopularSkeleton = () => (
  <View style={styles.popularCard}>
    <SkeletonBox width={110} height={130} borderRadius={0} />
    <View style={{ flex: 1, padding: 14, gap: 10 }}>
      <SkeletonBox width="70%" height={16} />
      <SkeletonBox width="50%" height={12} />
      <SkeletonBox width="40%" height={12} />
      <SkeletonBox width="100%" height={34} borderRadius={10} />
    </View>
  </View>
);

// ── Sub-components ─────────────────────────────────────────────────────────
const StarRating = ({ rating, dark = false }) => (
  <View style={styles.starRow}>
    <Text style={styles.starIcon}>★</Text>
    <Text style={[styles.ratingText, dark && { color: DARK }]}>{rating}</Text>
  </View>
);

const TagBadge = ({ label }) => (
  <View style={styles.tagBadge}>
    <Text style={styles.tagText}>{label}</Text>
  </View>
);

const FeaturedCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.featuredCard} activeOpacity={0.92} onPress={() => onPress(item)}>
    <Image source={{ uri: item.image }} style={styles.featuredImage} resizeMode="cover" />
    <View style={styles.featuredOverlay} />
    {item.tag && <TagBadge label={item.tag} />}
    <View style={styles.featuredInfo}>
      <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.featuredLocation}>📍 {item.location}</Text>
      <View style={styles.featuredBottom}>
        <StarRating rating={item.rating} />
        <Text style={styles.featuredPrice}>
          <Text style={styles.priceAmount}>₹{item.pricePerNight?.toLocaleString()}</Text>
          <Text style={styles.perNight}> /night</Text>
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const PopularCard = ({ item, onPress, onBook }) => (
  <TouchableOpacity style={styles.popularCard} activeOpacity={0.9} onPress={() => onPress(item)}>
    <Image source={{ uri: item.image }} style={styles.popularImage} resizeMode="cover" />
    <View style={styles.popularInfo}>
      <Text style={styles.popularName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.popularLocation}>📍 {item.location}</Text>
      <View style={styles.popularBottom}>
        <StarRating rating={item.rating} dark />
        <Text style={styles.popularPrice}>
          ₹{item.pricePerNight?.toLocaleString()}
          <Text style={styles.perNightSmall}>/night</Text>
        </Text>
      </View>
      <TouchableOpacity style={styles.bookBtn} onPress={() => onBook(item)}>
        <Text style={styles.bookBtnText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const EmptyState = ({ message, onRetry }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>🏨</Text>
    <Text style={styles.emptyText}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── Date quick selector ────────────────────────────────────────────────────
function getDefaultDates() {
  const today    = new Date(); today.setHours(0,0,0,0);
  const checkIn  = new Date(today); checkIn.setDate(today.getDate() + 1);
  const checkOut = new Date(today); checkOut.setDate(today.getDate() + 2);
  return { checkIn, checkOut };
}

const fmtShort = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

// ── Main Screen ────────────────────────────────────────────────────────────
export default function HotelBookingHomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  const [featured,        setFeatured]        = useState([]);
  const [popular,         setPopular]         = useState([]);
  const [searchResults,   setSearchResults]   = useState([]);
  const [activeCategory,  setActiveCategory]  = useState('all');
  const [searchText,      setSearchText]      = useState('');
  const [activeDot,       setActiveDot]       = useState(0);

  // Quick date/guest state (passed to BookingScreen)
  const defaults = getDefaultDates();
  const [checkIn,  setCheckIn]  = useState(defaults.checkIn);
  const [checkOut, setCheckOut] = useState(defaults.checkOut);
  const [guests,   setGuests]   = useState(2);

  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingPopular,  setLoadingPopular]  = useState(true);
  const [loadingSearch,   setLoadingSearch]   = useState(false);
  const [refreshing,      setRefreshing]      = useState(false);
  const [errorFeatured,   setErrorFeatured]   = useState(null);
  const [errorPopular,    setErrorPopular]    = useState(null);

  const searchTimeout = useRef(null);

  // ── Fetching ───────────────────────────────────────────────────────────
  const fetchFeatured = useCallback(async () => {
    try {
      setLoadingFeatured(true); setErrorFeatured(null);
      const data = await hotelApi.getFeatured();
      setFeatured(data?.hotels?.length ? data.hotels : MOCK_FEATURED);
    } catch {
      setFeatured(MOCK_FEATURED);
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  const fetchPopular = useCallback(async (category = 'all') => {
    try {
      setLoadingPopular(true); setErrorPopular(null);
      const data = category === 'all'
        ? await hotelApi.getPopular()
        : await hotelApi.getByCategory(category);
      setPopular(data?.hotels?.length ? data.hotels : MOCK_POPULAR);
    } catch {
      setPopular(MOCK_POPULAR);
    } finally {
      setLoadingPopular(false);
    }
  }, []);

  const handleSearch = useCallback(async (text) => {
    setSearchText(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!text.trim()) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const data = await hotelApi.search(text);
        setSearchResults(data?.hotels || []);
      } catch {
        const all = [...MOCK_FEATURED, ...MOCK_POPULAR];
        setSearchResults(all.filter(h =>
          h.name.toLowerCase().includes(text.toLowerCase()) ||
          h.location.toLowerCase().includes(text.toLowerCase())
        ));
      } finally {
        setLoadingSearch(false);
      }
    }, 500);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchFeatured(), fetchPopular(activeCategory)]);
    setRefreshing(false);
  }, [fetchFeatured, fetchPopular, activeCategory]);

  useEffect(() => {
    fetchFeatured();
    fetchPopular();
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, []);

  // ── Navigation ─────────────────────────────────────────────────────────
  const handleHotelPress = (hotel) => {
    // Navigate to booking with pre-filled dates/guests from home screen selectors
    navigation.navigate('Booking', { hotel, preCheckIn: checkIn, preCheckOut: checkOut, preGuests: guests });
  };

  const handleBookNow = (hotel) => {
    navigation.navigate('Booking', { hotel, preCheckIn: checkIn, preCheckOut: checkOut, preGuests: guests });
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning ☀️';
    if (h < 17) return 'Good Afternoon 👋';
    return 'Good Evening 🌙';
  };

  const userName     = user?.name?.split(' ')[0] || 'User';
  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} colors={[GOLD]} />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.headerTitle}>Hello, {userName}! 👋</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.myBookingsIcon}
              onPress={() => navigation.navigate('MyBookings')}
            >
              <Text style={styles.myBookingsIconText}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIconTxt}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search hotels, cities..."
            placeholderTextColor="#B0A99A"
            value={searchText}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {loadingSearch
            ? <ActivityIndicator size="small" color={GOLD} style={{ marginRight: 4 }} />
            : searchText
              ? <TouchableOpacity onPress={() => { setSearchText(''); setSearchResults([]); }}>
                  <Text style={styles.clearBtn}>✕</Text>
                </TouchableOpacity>
              : null
          }
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* ── Search Results ── */}
        {searchText.trim() !== '' && (
          <View style={styles.searchResultsBox}>
            <Text style={styles.searchResultsLabel}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchText}"
            </Text>
            {searchResults.length === 0 && !loadingSearch
              ? <EmptyState message="No hotels found. Try a different search." />
              : searchResults.map(item => (
                  <PopularCard key={item._id} item={item} onPress={handleHotelPress} onBook={handleBookNow} />
                ))
            }
          </View>
        )}

        {searchText.trim() === '' && (
          <>
            {/* ── Date & Guest Quick Selector ── */}
            <View style={styles.selectors}>
              <TouchableOpacity style={styles.selectorItem} onPress={() => navigation.navigate('Booking', { hotel: MOCK_FEATURED[0] })}>
                <Text style={styles.selectorLabel}>Check-in</Text>
                <Text style={styles.selectorValue}>📅 {fmtShort(checkIn)}</Text>
              </TouchableOpacity>
              <View style={styles.selectorDivider} />
              <TouchableOpacity style={styles.selectorItem} onPress={() => navigation.navigate('Booking', { hotel: MOCK_FEATURED[0] })}>
                <Text style={styles.selectorLabel}>Check-out</Text>
                <Text style={styles.selectorValue}>📅 {fmtShort(checkOut)}</Text>
              </TouchableOpacity>
              <View style={styles.selectorDivider} />
              <TouchableOpacity style={styles.selectorItem} onPress={() => navigation.navigate('Booking', { hotel: MOCK_FEATURED[0] })}>
                <Text style={styles.selectorLabel}>Guests</Text>
                <Text style={styles.selectorValue}>👤 {guests}</Text>
              </TouchableOpacity>
            </View>

            {/* ── Offer Banner ── */}
            <TouchableOpacity style={styles.offerBanner} activeOpacity={0.9}>
              <View style={styles.offerLeft}>
                <Text style={styles.offerTag}>LIMITED OFFER</Text>
                <Text style={styles.offerTitle}>Up to 30% off{'\n'}Weekend Stays</Text>
                <View style={styles.offerBtn}>
                  <Text style={styles.offerBtnText}>Grab Deal →</Text>
                </View>
              </View>
              <Text style={styles.offerEmoji}>🏨</Text>
            </TouchableOpacity>

            {/* ── Categories ── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Browse by Type</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, activeCategory === cat.id && styles.categoryChipActive]}
                  onPress={() => { setActiveCategory(cat.id); fetchPopular(cat.id); }}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryLabel, activeCategory === cat.id && styles.categoryLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ── Featured Hotels ── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Hotels</Text>
              <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
            </View>

            {loadingFeatured ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
                <FeaturedSkeleton /><FeaturedSkeleton />
              </ScrollView>
            ) : errorFeatured ? (
              <EmptyState message="Couldn't load featured hotels." onRetry={fetchFeatured} />
            ) : (
              <>
                <FlatList
                  data={featured}
                  keyExtractor={i => i._id}
                  horizontal
                  pagingEnabled
                  snapToInterval={width - 48}
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredList}
                  onScroll={e => setActiveDot(Math.round(e.nativeEvent.contentOffset.x / (width - 48)))}
                  scrollEventThrottle={16}
                  renderItem={({ item }) => <FeaturedCard item={item} onPress={handleHotelPress} />}
                  ListEmptyComponent={<EmptyState message="No featured hotels available." />}
                />
                <View style={styles.dots}>
                  {featured.map((_, i) => (
                    <View key={i} style={[styles.dot, activeDot === i && styles.dotActive]} />
                  ))}
                </View>
              </>
            )}

            {/* ── Popular ── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Near You</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyBookings')}>
                <Text style={styles.seeAll}>My Bookings</Text>
              </TouchableOpacity>
            </View>

            {loadingPopular ? (
              <><PopularSkeleton /><PopularSkeleton /><PopularSkeleton /></>
            ) : errorPopular ? (
              <EmptyState message="Couldn't load hotels." onRetry={() => fetchPopular(activeCategory)} />
            ) : popular.length === 0 ? (
              <EmptyState message="No hotels in this category yet." />
            ) : (
              popular.map(item => (
                <PopularCard key={item._id} item={item} onPress={handleHotelPress} onBook={handleBookNow} />
              ))
            )}

            <View style={{ height: 32 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: CREAM },
  scroll: { flex: 1, backgroundColor: CREAM },

  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  greeting:    { fontSize: 13, color: MUTED, fontWeight: '500', marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: DARK, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  myBookingsIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  myBookingsIconText: { fontSize: 18 },
  avatarBtn:   { width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { color: WHITE, fontWeight: '700', fontSize: 15 },

  searchBox:     { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, marginHorizontal: 24, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  searchIconTxt: { fontSize: 16, marginRight: 10 },
  searchInput:   { flex: 1, fontSize: 15, color: DARK },
  clearBtn:      { fontSize: 14, color: MUTED, paddingHorizontal: 6 },
  filterBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  filterIcon:    { fontSize: 16 },

  searchResultsBox:   { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  searchResultsLabel: { fontSize: 13, color: MUTED, marginBottom: 14, fontWeight: '500' },

  selectors:       { flexDirection: 'row', backgroundColor: WHITE, marginHorizontal: 24, borderRadius: 16, paddingVertical: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  selectorItem:    { flex: 1, alignItems: 'center' },
  selectorLabel:   { fontSize: 11, color: MUTED, marginBottom: 4, fontWeight: '500' },
  selectorValue:   { fontSize: 13, color: DARK, fontWeight: '700' },
  selectorDivider: { width: 1, backgroundColor: '#E8E0D5', marginVertical: 4 },

  offerBanner: { marginHorizontal: 24, borderRadius: 20, backgroundColor: DARK, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  offerLeft:   { flex: 1 },
  offerTag:    { fontSize: 10, color: GOLD, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  offerTitle:  { fontSize: 18, color: WHITE, fontWeight: '800', lineHeight: 24, marginBottom: 14 },
  offerBtn:    { backgroundColor: GOLD, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start' },
  offerBtnText:{ color: WHITE, fontWeight: '700', fontSize: 13 },
  offerEmoji:  { fontSize: 60 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 14 },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: DARK },
  seeAll:        { fontSize: 13, color: GOLD, fontWeight: '600' },

  categories:         { paddingHorizontal: 24, paddingBottom: 4, gap: 10, marginBottom: 20 },
  categoryChip:       { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderRadius: 30, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: '#E8E0D5', gap: 6 },
  categoryChipActive: { backgroundColor: DARK, borderColor: DARK },
  categoryIcon:       { fontSize: 16 },
  categoryLabel:      { fontSize: 13, fontWeight: '600', color: DARK },
  categoryLabelActive:{ color: WHITE },

  featuredList:    { paddingHorizontal: 24, gap: 12 },
  featuredCard:    { width: width - 48, height: 240, borderRadius: 20, overflow: 'hidden', marginRight: 12 },
  featuredImage:   { width: '100%', height: '100%' },
  featuredOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  tagBadge:        { position: 'absolute', top: 14, left: 14, backgroundColor: GOLD, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText:         { color: WHITE, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  featuredInfo:    { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  featuredName:    { fontSize: 20, fontWeight: '800', color: WHITE, marginBottom: 4 },
  featuredLocation:{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 10 },
  featuredBottom:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceAmount:     { fontSize: 18, fontWeight: '800', color: WHITE },
  perNight:        { fontSize: 12, color: 'rgba(255,255,255,0.75)' },

  starRow:    { flexDirection: 'row', alignItems: 'center', gap: 3 },
  starIcon:   { color: GOLD, fontSize: 14 },
  ratingText: { fontSize: 13, fontWeight: '700', color: WHITE },

  dots:     { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12, marginBottom: 24 },
  dot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D5CFC8' },
  dotActive:{ width: 20, backgroundColor: GOLD },

  popularCard:    { flexDirection: 'row', backgroundColor: CARD, marginHorizontal: 24, borderRadius: 16, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  popularImage:   { width: 110, height: 130 },
  popularInfo:    { flex: 1, padding: 14, justifyContent: 'space-between' },
  popularName:    { fontSize: 16, fontWeight: '800', color: DARK, marginBottom: 3 },
  popularLocation:{ fontSize: 12, color: MUTED, marginBottom: 6 },
  popularBottom:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  popularPrice:   { fontSize: 16, fontWeight: '800', color: DARK },
  perNightSmall:  { fontSize: 11, color: MUTED, fontWeight: '400' },
  bookBtn:        { backgroundColor: DARK, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  bookBtnText:    { color: WHITE, fontWeight: '700', fontSize: 13 },

  emptyState: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  emptyIcon:  { fontSize: 40, marginBottom: 12 },
  emptyText:  { fontSize: 14, color: MUTED, textAlign: 'center', lineHeight: 20 },
  retryBtn:   { marginTop: 14, backgroundColor: GOLD, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  retryText:  { color: WHITE, fontWeight: '700', fontSize: 14 },
});