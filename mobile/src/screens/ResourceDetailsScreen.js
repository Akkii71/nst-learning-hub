import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

function getTypeIcon(type) {
  switch (type) {
    case 'video':     return 'play-circle';
    case 'notes':     return 'document-text';
    case 'tutorial':  return 'school';
    default:          return 'link';
  }
}

export default function ResourceDetailsScreen({ route, navigation }) {
  const { resource } = route.params;
  const [userRating, setUserRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  async function handleOpenLink() {
    const supported = await Linking.canOpenURL(resource.url);
    if (supported) {
      Linking.openURL(resource.url);
    } else {
      Alert.alert('Error', 'Cannot open this link.');
    }
  }

  function handleRating(star) {
    setUserRating(star);
    Alert.alert('Thank you!', `You rated this resource ${star} star${star > 1 ? 's' : ''}.`);
    setFeedbackSubmitted(true);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resource Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Type Badge */}
        <View style={styles.typeRow}>
          <Ionicons name={getTypeIcon(resource.type)} size={20} color={colors.primary} />
          <Text style={styles.typeText}>{resource.type.toUpperCase()}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{resource.title}</Text>

        {/* Subject and Topic Tags */}
        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Ionicons name="book-outline" size={12} color={colors.primary} />
            <Text style={styles.tagText}>{resource.subject}</Text>
          </View>
          <View style={styles.tag}>
            <Ionicons name="pricetag-outline" size={12} color={colors.primary} />
            <Text style={styles.tagText}>{resource.topic}</Text>
          </View>
        </View>

        {/* Rating Summary */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingLeft}>
            <Text style={styles.ratingBig}>{resource.rating.toFixed(1)}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(resource.rating) ? 'star' : 'star-outline'}
                  size={14}
                  color="#F59E0B"
                />
              ))}
            </View>
            <Text style={styles.ratingCount}>{resource.ratingCount} ratings</Text>
          </View>
          <View style={styles.ratingDivider} />
          <View style={styles.ratingRight}>
            <Text style={styles.ratingRightLabel}>Submitted by</Text>
            <Text style={styles.ratingRightValue}>{resource.submittedBy}</Text>
            <Text style={styles.ratingRightLabel}>Added on</Text>
            <Text style={styles.ratingRightValue}>{resource.createdAt}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>About this resource</Text>
          <Text style={styles.description}>{resource.description}</Text>
        </View>

        {/* Open Resource Button */}
        <TouchableOpacity style={styles.openButton} onPress={handleOpenLink}>
          <Ionicons name="open-outline" size={18} color={colors.white} />
          <Text style={styles.openButtonText}>Open Resource</Text>
        </TouchableOpacity>

        {/* Rate this Resource */}
        {!feedbackSubmitted && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Rate this resource</Text>
            <Text style={styles.cardSubLabel}>How helpful was this resource?</Text>
            <View style={styles.rateStarsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                  <Ionicons
                    name={star <= userRating ? 'star' : 'star-outline'}
                    size={36}
                    color="#F59E0B"
                    style={styles.rateStar}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {feedbackSubmitted && (
          <View style={[styles.card, styles.thankYouCard]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.thankYouText}>Thank you for your feedback!</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.white },
  scroll: { padding: 16, paddingBottom: 32 },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: 12,
  },
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  ratingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingLeft: { flex: 1, alignItems: 'center' },
  ratingBig: { fontSize: 36, fontWeight: '700', color: colors.textPrimary },
  starsRow: { flexDirection: 'row', gap: 2, marginVertical: 4 },
  ratingCount: { fontSize: 11, color: colors.textSecondary },
  ratingDivider: { width: 1, height: 60, backgroundColor: colors.border, marginHorizontal: 16 },
  ratingRight: { flex: 2 },
  ratingRightLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  ratingRightValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardSubLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  openButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  openButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  rateStarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  rateStar: { marginHorizontal: 2 },
  thankYouCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderColor: colors.success,
  },
  thankYouText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.success,
  },
});
