import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import RatingStars from '../components/RatingStars';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const initialResource = route.params.resource;
  const { isAuthenticated } = useAuth();

  const [resource, setResource] = useState(initialResource);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(initialResource.userRating || 0);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Feedback state
  const [feedbackList, setFeedbackList] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Fetch full details from database
  async function loadDetails() {
    try {
      setLoading(true);
      const data = await api.getResourceById(initialResource.id);
      setResource(data);
      if (data.userRating) setUserRating(data.userRating);
      if (data.feedbacks) setFeedbackList(data.feedbacks);
    } catch (err) {
      console.error('Error loading resource details:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetails();
  }, [initialResource.id]);

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

  // Handle rating submission to database
  async function handleRate(stars) {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to rate this resource.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }

    try {
      setRatingLoading(true);
      const res = await api.rateResource(resource.id, stars);
      setUserRating(stars);
      setResource((prev) => ({
        ...prev,
        rating: res.averageRating,
        ratingCount: res.ratingCount,
      }));
      Alert.alert('Rating Submitted', `You rated this resource ${stars} star${stars > 1 ? 's' : ''}. Thank you!`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit rating.');
    } finally {
      setRatingLoading(false);
    }
  }

  // Handle feedback submission to database
  async function handleAddFeedback() {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to leave feedback on learning resources.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }

    if (!newComment.trim()) {
      Alert.alert('Validation Error', 'Please write a comment before posting.');
      return;
    }

    try {
      setFeedbackLoading(true);
      const res = await api.submitFeedback(resource.id, newComment.trim());
      setFeedbackList((prev) => [res.feedback, ...prev]);
      setNewComment('');
      Alert.alert('Thank You!', 'Your feedback has been posted for NST students.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to post feedback.');
    } finally {
      setFeedbackLoading(false);
    }
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

        {/* Interactive Database Rating Component */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Rate this resource (1–5 Stars)</Text>
          <Text style={styles.cardSubLabel}>
            {userRating > 0
              ? `Your rating: ${userRating} star${userRating > 1 ? 's' : ''} (tap to change)`
              : 'Tap a star to submit your rating:'}
          </Text>
          <View style={styles.ratingInteractive}>
            {ratingLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <RatingStars
                rating={userRating}
                size={34}
                onRate={handleRate}
              />
            )}
          </View>
        </View>

        {/* Feedback & Comments Section */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Student Feedback & Reviews ({feedbackList.length})</Text>

          {/* Feedback Input */}
          <View style={styles.feedbackInputBox}>
            <TextInput
              style={styles.feedbackInput}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Leave a review or tip for fellow NST students..."
              placeholderTextColor={colors.textLight}
              multiline
            />
            <TouchableOpacity
              style={[styles.postButton, feedbackLoading && { opacity: 0.6 }]}
              onPress={handleAddFeedback}
              disabled={feedbackLoading}
            >
              {feedbackLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.postButtonText}>Post Review</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Feedback List */}
          {feedbackList.length === 0 ? (
            <Text style={styles.noFeedbackText}>No reviews yet. Be the first to leave feedback!</Text>
          ) : (
            feedbackList.map((item) => (
              <View key={item.id} style={styles.feedbackItem}>
                <View style={styles.feedbackHeader}>
                  <Text style={styles.feedbackUser}>{item.user}</Text>
                  <Text style={styles.feedbackDate}>{item.createdAt}</Text>
                </View>
                <Text style={styles.feedbackComment}>{item.comment}</Text>
              </View>
            ))
          )}
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
  feedbackInputBox: {
    marginTop: 8,
    marginBottom: 16,
  },
  feedbackInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    fontSize: 13,
    color: colors.textPrimary,
    minHeight: 60,
    marginBottom: 8,
  },
  postButton: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  noFeedbackText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  feedbackItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  feedbackUser: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  feedbackDate: {
    fontSize: 11,
    color: colors.textLight,
  },
  feedbackComment: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
