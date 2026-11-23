import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadSubmissions() {
    if (!isAuthenticated || !user) return;
    try {
      setLoading(true);
      const data = await api.getSubmissions(user.id);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadSubmissions();
    } else {
      setSubmissions([]);
    }
  }, [isAuthenticated, user?.id]);

  function handleLogout() {
    Alert.alert('Confirm Logout', 'Are you sure you want to sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }

  // If user is not logged in: display Login / Register prompt
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>Student account & submissions</Text>
        </View>

        <View style={styles.unauthContainer}>
          <View style={styles.unauthIconCircle}>
            <Ionicons name="person-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.unauthTitle}>Sign In to NST Learning Hub</Text>
          <Text style={styles.unauthSubtitle}>
            Log in with your NST student account to track your submissions, bookmark syllabus resources, and rate materials.
          </Text>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Ionicons name="log-in-outline" size={20} color={colors.white} />
            <Text style={styles.signInButtonText}>Sign In or Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Authenticated Profile
  const initials = (user.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const isReviewer = user.role === 'REVIEWER';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>
            {isReviewer ? 'Reviewer & Faculty Portal' : 'Student Account & Submissions'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutHeaderBtn}>
          <Ionicons name="log-out-outline" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, isReviewer && { backgroundColor: '#7C3AED' }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>

          {/* Role & Academic Badges */}
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: isReviewer ? '#F5F3FF' : '#EBF4FF' },
              ]}
            >
              <Ionicons
                name={isReviewer ? 'shield-checkmark' : 'school-outline'}
                size={13}
                color={isReviewer ? '#7C3AED' : colors.primary}
              />
              <Text
                style={[
                  styles.badgeText,
                  { color: isReviewer ? '#7C3AED' : colors.primary },
                ]}
              >
                {user.role}
              </Text>
            </View>

            {user.studentId && (
              <View style={styles.badge}>
                <Ionicons name="id-card-outline" size={13} color={colors.primary} />
                <Text style={styles.badgeText}>{user.studentId}</Text>
              </View>
            )}

            {user.department && (
              <View style={styles.badge}>
                <Ionicons name="laptop-outline" size={13} color={colors.primary} />
                <Text style={styles.badgeText}>{user.department}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Reviewer Portal Access (Reviewers only) */}
        {isReviewer && (
          <TouchableOpacity
            style={styles.reviewerPortalCard}
            onPress={() => navigation.navigate('ReviewerDashboard')}
          >
            <View style={styles.reviewerPortalIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#7C3AED" />
            </View>
            <View style={styles.reviewerPortalTextWrap}>
              <Text style={styles.reviewerPortalTitle}>Reviewer Management Portal</Text>
              <Text style={styles.reviewerPortalSubtitle}>
                Review, approve, or reject student submissions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#7C3AED" />
          </TouchableOpacity>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{submissions.length}</Text>
            <Text style={styles.statLabel}>Submissions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {submissions.filter((s) => s.status === 'APPROVED').length}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {submissions.filter((s) => s.status === 'PENDING').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* My Submissions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Submissions</Text>
            <TouchableOpacity onPress={loadSubmissions}>
              <Ionicons name="refresh-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {loading && (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
          )}

          {!loading && submissions.length === 0 && (
            <Text style={styles.emptyText}>You haven't submitted any resources yet.</Text>
          )}

          {!loading &&
            submissions.map((sub) => {
              const isApproved = sub.status === 'APPROVED';
              const isRejected = sub.status === 'REJECTED';
              return (
                <View key={sub.id} style={styles.submissionCard}>
                  <View style={styles.submissionTop}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isApproved
                            ? '#F0FDF4'
                            : isRejected
                            ? '#FEF2F2'
                            : '#FFF7ED',
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          isApproved
                            ? 'checkmark-circle'
                            : isRejected
                            ? 'close-circle'
                            : 'time-outline'
                        }
                        size={12}
                        color={
                          isApproved
                            ? colors.success
                            : isRejected
                            ? colors.error
                            : colors.warning
                        }
                      />
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: isApproved
                              ? colors.success
                              : isRejected
                              ? colors.error
                              : colors.warning,
                          },
                        ]}
                      >
                        {sub.status}
                      </Text>
                    </View>
                    <Text style={styles.submissionDate}>{sub.submittedAt}</Text>
                  </View>
                  <Text style={styles.submissionTitle} numberOfLines={2}>
                    {sub.resource?.title}
                  </Text>
                  <Text style={styles.submissionMeta}>
                    {sub.resource?.subject} · {sub.resource?.topic} · {(sub.resource?.type || '').toUpperCase()}
                  </Text>
                  {sub.note && (
                    <View style={styles.noteBox}>
                      <Ionicons name="chatbubble-ellipses-outline" size={12} color={colors.textSecondary} />
                      <Text style={styles.noteText}>Note: {sub.note}</Text>
                    </View>
                  )}
                </View>
              );
            })}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.white },
  headerSubtitle: { fontSize: 13, color: '#BBDEFB', marginTop: 2 },
  logoutHeaderBtn: { padding: 4 },
  scroll: { padding: 16, paddingBottom: 32 },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.white },
  name: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  email: { fontSize: 13, color: colors.textSecondary, marginTop: 2, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statCard: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  submissionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submissionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  submissionDate: { fontSize: 11, color: colors.textLight },
  submissionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  submissionMeta: { fontSize: 12, color: colors.textSecondary },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  noteText: { fontSize: 11, color: '#92400E' },
  reviewerPortalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    gap: 12,
  },
  reviewerPortalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerPortalTextWrap: { flex: 1 },
  reviewerPortalTitle: { fontSize: 15, fontWeight: '700', color: '#6D28D9' },
  reviewerPortalSubtitle: { fontSize: 12, color: '#7C3AED', marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.error,
  },
  unauthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  unauthIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  unauthTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  unauthSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
  },
  signInButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
