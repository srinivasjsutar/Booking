// src/screens/RateReviewScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';

const CREAM = '#F7F3EE'; const DARK = '#1A1208'; const GOLD = '#C8963E'; const WHITE = '#FFFFFF'; const MUTED = '#8C7E6E';

const TAGS = ['Clean', 'Safe', 'Quiet', 'Friendly staff', 'Great location', 'Good value', 'Comfortable bed', 'Nice view'];

export default function RateReviewScreen({ navigation, route }) {
  const { booking } = route.params || {};
  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [review,    setReview]    = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing!'];

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => navigation.replace('Home'), 2000);
    }, 1200);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successBox}>
          <Text style={styles.successEmoji}>🌟</Text>
          <Text style={styles.successTitle}>Thank you!</Text>
          <Text style={styles.successSub}>Your review helps other travelers</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.emoji}>⭐</Text>
        <Text style={styles.title}>Rate Your Stay</Text>
        <Text style={styles.subtitle}>{booking?.hotel?.name || 'The Grand Palace'}</Text>

        {/* Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} onPressIn={() => setHovered(star)} onPressOut={() => setHovered(0)} activeOpacity={0.8}>
              <Text style={[styles.star, (hovered || rating) >= star && styles.starFilled]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && <Text style={styles.ratingLabel}>{LABELS[rating]}</Text>}

        {/* Tags */}
        <Text style={styles.sectionLabel}>What did you like?</Text>
        <View style={styles.tagsWrap}>
          {TAGS.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Text Review */}
        <Text style={styles.sectionLabel}>Write a review <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={styles.reviewInput}
          placeholder="Share your experience with others..."
          placeholderTextColor="#C0B8B0"
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={4}
          maxLength={300}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{review.length}/300</Text>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || loading}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color={WHITE} /> : <Text style={styles.submitBtnText}>Submit Review</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Home')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: CREAM },
  container:   { paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40, alignItems: 'center' },
  emoji:       { fontSize: 52, marginBottom: 14 },
  title:       { fontSize: 26, fontWeight: '900', color: DARK, marginBottom: 4 },
  subtitle:    { fontSize: 14, color: MUTED, marginBottom: 28 },
  starsRow:    { flexDirection: 'row', gap: 8, marginBottom: 8 },
  star:        { fontSize: 44, color: '#D5CFC8' },
  starFilled:  { color: GOLD },
  ratingLabel: { fontSize: 18, fontWeight: '800', color: DARK, marginBottom: 28 },
  sectionLabel:{ alignSelf: 'flex-start', fontSize: 14, fontWeight: '700', color: DARK, marginBottom: 12 },
  optional:    { fontWeight: '400', color: MUTED },
  tagsWrap:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24, width: '100%' },
  tag:         { backgroundColor: WHITE, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#E8E0D5' },
  tagActive:   { backgroundColor: DARK, borderColor: DARK },
  tagText:     { fontSize: 13, color: DARK, fontWeight: '500' },
  tagTextActive: { color: WHITE },
  reviewInput: { width: '100%', backgroundColor: WHITE, borderRadius: 16, padding: 16, fontSize: 14, color: DARK, borderWidth: 1.5, borderColor: '#E8E0D5', minHeight: 110, marginBottom: 6 },
  charCount:   { alignSelf: 'flex-end', fontSize: 11, color: MUTED, marginBottom: 24 },
  submitBtn:   { backgroundColor: DARK, borderRadius: 18, paddingVertical: 18, alignItems: 'center', width: '100%', marginBottom: 16 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: WHITE, fontSize: 17, fontWeight: '800' },
  skipText:    { fontSize: 14, color: MUTED, textDecorationLine: 'underline' },
  successBox:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successEmoji:{ fontSize: 72, marginBottom: 20 },
  successTitle:{ fontSize: 28, fontWeight: '900', color: DARK, marginBottom: 8 },
  successSub:  { fontSize: 14, color: MUTED },
});