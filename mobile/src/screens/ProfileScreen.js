import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import api from '../services/api';

const studentInfo = {
  name: 'Akash Kumar',
  email: 'student@nst.edu',
  year: '3rd Year',
  branch: 'Computer Science',
  studentId: 'NST2024001',
};

export default function ProfileScreen() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadSubmissions() {
    try {
      setLoading(true);
      const data = await api.getSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Text style={styles.headerSubtitle}>Student account & submission status</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar + Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {studentInfo.name.split(' ').map((n) => n[0]).join('')}
            </Text>
          </View>
          <Text style={styles.name}>{studentInfo.name}</Text>
          <Text style={styles.email}>{studentInfo.email}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="school-outline" size={13} color={colors.primary} />
              <Text style={styles.badgeText}>{studentInfo.year}</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="laptop-outline" size={13} color={colors.primary} />
              <Text style={styles.badgeText}>{studentInfo.branch}</Text>
            </View>
          </View>
        </View>

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

        {/* My Submissions */}
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

          {!loading && submissions.map((sub) => {
            const isApproved = sub.status === 'APPROVED';
            return (
              <View key={sub.id} style={styles.submissionCard}>
                <View style={styles.submissionTop}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: isApproved ? '#F0FDF4' : '#FFF7ED' },
                    ]}
                  >
                    <Ionicons
                      name={isApproved ? 'checkmark-circle' : 'time-outline'}
                      size={12}
                      color={isApproved ? colors.success : colors.warning}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: isApproved ? colors.success : colors.warning },
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
              </View>
            );
          })}
        </View>

        {/* Settings / Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Help</Text>
          <View style={styles.menuCard}>
            {[
              { icon: 'book-outline', label: 'NST Syllabus Guidelines' },
              { icon: 'help-circle-outline', label: 'Peer Review FAQs' },
              { icon: 'information-circle-outline', label: 'About NST Learning Hub' },
            ].map((item, index, arr) => (
              <View
                key={item.label}
                style={[styles.menuItem, index < arr.length - 1 && styles.menuItemBorder]}
              >
                <Ionicons name={item.icon} size={20} color={colors.primary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
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
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
