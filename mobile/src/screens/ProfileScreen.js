import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import { resources } from '../data/sampleData';

// Mock user data
const mockUser = {
  name: 'NST Student',
  email: 'student@nst.edu',
  year: '2nd Year',
  branch: 'Computer Science',
  submissionsCount: 3,
  savedCount: 8,
};

const userSubmissions = resources.slice(0, 2).map((r) => ({ ...r, submittedBy: mockUser.name }));

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Text style={styles.headerSubtitle}>Your account and submissions</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Avatar + Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {mockUser.name.split(' ').map((n) => n[0]).join('')}
            </Text>
          </View>
          <Text style={styles.name}>{mockUser.name}</Text>
          <Text style={styles.email}>{mockUser.email}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="school-outline" size={13} color={colors.primary} />
              <Text style={styles.badgeText}>{mockUser.year}</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="laptop-outline" size={13} color={colors.primary} />
              <Text style={styles.badgeText}>{mockUser.branch}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockUser.submissionsCount}</Text>
            <Text style={styles.statLabel}>Submissions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockUser.savedCount}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.6</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* My Submissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Submissions</Text>
          {userSubmissions.map((resource) => (
            <View key={resource.id} style={styles.submissionCard}>
              <View style={styles.submissionTop}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: resource.status === 'approved' ? '#F0FDF4' : '#FFF7ED' },
                ]}>
                  <Ionicons
                    name={resource.status === 'approved' ? 'checkmark-circle' : 'time-outline'}
                    size={12}
                    color={resource.status === 'approved' ? colors.success : colors.warning}
                  />
                  <Text style={[
                    styles.statusText,
                    { color: resource.status === 'approved' ? colors.success : colors.warning },
                  ]}>
                    {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                  </Text>
                </View>
                <Text style={styles.submissionDate}>{resource.createdAt}</Text>
              </View>
              <Text style={styles.submissionTitle} numberOfLines={2}>{resource.title}</Text>
              <Text style={styles.submissionMeta}>{resource.subject} · {resource.topic}</Text>
            </View>
          ))}
        </View>

        {/* Settings / Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            {[
              { icon: 'notifications-outline', label: 'Notifications' },
              { icon: 'bookmark-outline', label: 'Saved Resources' },
              { icon: 'help-circle-outline', label: 'Help & Support' },
              { icon: 'information-circle-outline', label: 'About NST Learning Hub' },
            ].map((item, index, arr) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, index < arr.length - 1 && styles.menuItemBorder]}
              >
                <Ionicons name={item.icon} size={20} color={colors.primary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textLight} style={styles.menuChevron} />
              </TouchableOpacity>
            ))}
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
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.white },
  headerSubtitle: { fontSize: 13, color: '#BBDEFB', marginTop: 2 },
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
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  statsRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: 8 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
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
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  submissionDate: { fontSize: 11, color: colors.textSecondary },
  submissionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  submissionMeta: { fontSize: 12, color: colors.textSecondary },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  menuChevron: { marginLeft: 'auto' },
});
