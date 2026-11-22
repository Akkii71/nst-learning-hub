import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import RatingStars from '../components/RatingStars';

function getTypeIcon(type) {
  switch (type) {
    case 'video':
      return 'play-circle';
    case 'notes':
      return 'document-text';
    case 'tutorial':
      return 'school';
    default:
      return 'link';
  }
}

export default function ResourceDetailsScreen({ route, navigation }) {
  const { resource } = route.params;
  const [userRating, setUserRating] = useState(0);
  const [rated, setRated] = useState(false);

  async function handleOpenLink() {
    if (!resource.url) {
      Alert.alert('Error', 'Resource URL is missing.');
      return;
    }
    const supported = await Linking.canOpenURL(resource.url);
    if (supported) {
      await Linking.openURL(resource.url);
    } else {
      Alert.alert('Cannot Open URL', `Unable to open: ${resource.url}`);
    }
  }

  function handleRate(stars) {
    setUserRating(stars);
    setRated(true);
    Alert.alert('Rating Submitted', `You rated this resource ${stars} star${stars > 1 ? 's' : ''}. Thank you!`);
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
          <Text style={styles.typeText}>{(resource.type || 'RESOURCE').toUpperCase()}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{resource.title}</Text>

        {/* Subject and Topic Tags */}
        <View style={styles.tagsRow}>
          {resource.subject ? (
            <View style={styles.tag}>
              <Ionicons name="book-outline" size={12} color={colors.primary} />
              <Text style={styles.tagText}>{resource.subject}</Text>
            </View>
          ) : null}
          {resource.topic ? (
            <View style={styles.tag}>
              <Ionicons name="pricetag-outline" size={12} color={colors.primary} />
              <Text style={styles.tagText}>{resource.topic}</Text>
            </View>
          ) : null}
        </View>

        {/* Rating Summary Card */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingLeft}>
            <Text style={styles.ratingBig}>{(resource.rating || 0).toFixed(1)}</Text>
            <View style={styles.starsRow}>
              <RatingStars rating={resource.rating || 0} size={14} />
            </View>
            <Text style={styles.ratingCount}>
              {resource.ratingCount || 0} rating{(resource.ratingCount || 0) === 1 ? '' : 's'}
            </Text>
          </View>
          <View style={styles.ratingDivider} />
          <View style={styles.ratingRight}>
            <Text style={styles.ratingRightLabel}>Submitted by</Text>
            <Text style={styles.ratingRightValue}>{resource.submittedBy || 'NST Student'}</Text>
            <Text style={styles.ratingRightLabel}>Added date</Text>
            <Text style={styles.ratingRightValue}>{resource.createdAt || 'Recent'}</Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>About this resource</Text>
          <Text style={styles.description}>
            {resource.description || 'No description provided for this resource.'}
          </Text>
        </View>

        {/* External Link Section */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Resource Link</Text>
          <Text style={styles.urlText} numberOfLines={1}>
            {resource.url}
          </Text>
        </View>

        {/* Open Resource Button */}
        <TouchableOpacity style={styles.openButton} onPress={handleOpenLink}>
          <Ionicons name="open-outline" size={18} color={colors.white} />
          <Text style={styles.openButtonText}>Open Learning Resource</Text>
        </TouchableOpacity>

        {/* Interactive Rating Component */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Rate this resource</Text>
          <Text style={styles.cardSubLabel}>
            {rated
              ? `You rated this ${userRating} star${userRating > 1 ? 's' : ''}`
              : 'Help fellow NST students discover quality materials:'}
          </Text>
          <View style={styles.ratingInteractive}>
            <RatingStars
              rating={userRating}
              size={32}
              onRate={handleRate}
            />
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingLeft: { flex: 1, alignItems: 'center' },
  ratingBig: { fontSize: 36, fontWeight: '700', color: colors.textPrimary },
  starsRow: { marginVertical: 4 },
  ratingCount: { fontSize: 11, color: colors.textSecondary },
  ratingDivider: { width: 1, height: 60, backgroundColor: colors.border, marginHorizontal: 16 },
  ratingRight: { flex: 1 },
  ratingRightLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 1 },
  ratingRightValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '600', marginBottom: 8 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  cardSubLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  urlText: { fontSize: 13, color: colors.primary },
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
  openButtonText: { fontSize: 16, fontWeight: '700', color: colors.white },
  ratingInteractive: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
