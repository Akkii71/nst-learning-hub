import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import api from '../services/api';

export default function ReviewerDashboardScreen({ navigation }) {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [rejectionTargetId, setRejectionTargetId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  async function loadPending() {
    try {
      setLoading(true);
      const data = await api.getPendingSubmissions();
      setPendingList(data);
    } catch (err) {
      console.error('Failed to load pending submissions:', err);
      Alert.alert('Error', err.message || 'Unable to fetch pending submissions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function handleApprove(submissionId, title) {
    Alert.alert(
      'Approve Resource',
      `Are you sure you want to approve "${title}"? It will become publicly visible to NST students.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              setActionInProgress(submissionId);
              await api.approveSubmission(submissionId, 'Approved for NST syllabus curriculum.');
              Alert.alert('Approved', 'Resource is now live and accessible.');
              loadPending();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to approve submission.');
            } finally {
              setActionInProgress(null);
            }
          },
        },
      ]
    );
  }

  async function confirmReject() {
    if (!rejectionTargetId) return;
    try {
      setActionInProgress(rejectionTargetId);
      await api.rejectSubmission(
        rejectionTargetId,
        rejectionReason.trim() || 'Does not meet syllabus guidelines.'
      );
      Alert.alert('Rejected', 'Submission has been marked as rejected.');
      setRejectionTargetId(null);
      setRejectionReason('');
      loadPending();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to reject submission.');
    } finally {
      setActionInProgress(null);
    }
  }

  async function openUrl(url) {
    if (!url) return;
    const can = await Linking.canOpenURL(url);
    if (can) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Cannot Open', url);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Reviewer Portal</Text>
          <Text style={styles.headerSubtitle}>Pending Submissions ({pendingList.length})</Text>
        </View>
        <TouchableOpacity onPress={loadPending} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching pending student submissions...</Text>
          </View>
        )}

        {!loading && pendingList.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.success} />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptySubtitle}>
              There are currently no pending learning resources awaiting review.
            </Text>
          </View>
        )}

        {/* Rejection Note Input Dialog (Inline) */}
        {rejectionTargetId && (
          <View style={styles.rejectDialog}>
            <Text style={styles.rejectDialogTitle}>Reason for Rejection</Text>
            <TextInput
              style={styles.rejectInput}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="e.g. Link is broken, duplicate, or irrelevant to syllabus"
              placeholderTextColor={colors.textLight}
              multiline
            />
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setRejectionTargetId(null);
                  setRejectionReason('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmRejectBtn} onPress={confirmReject}>
                <Text style={styles.confirmRejectText}>Confirm Rejection</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Pending Submissions List */}
        {!loading &&
          pendingList.map((item) => {
            const isProcessing = actionInProgress === item.id;
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.topRow}>
                  <View style={styles.typeTag}>
                    <Text style={styles.typeText}>{(item.resource.type || 'RESOURCE').toUpperCase()}</Text>
                  </View>
                  <Text style={styles.dateText}>{item.submittedAt}</Text>
                </View>

                <Text style={styles.title}>{item.resource.title}</Text>
                <Text style={styles.description}>{item.resource.description || 'No description provided.'}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Ionicons name="book-outline" size={12} color={colors.primary} />
                    <Text style={styles.metaText}>{item.resource.subject}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="pricetag-outline" size={12} color={colors.primary} />
                    <Text style={styles.metaText}>{item.resource.topic}</Text>
                  </View>
                </View>

                {/* Submitting Student Info */}
                <View style={styles.studentInfoBox}>
                  <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.studentText}>
                    Submitted by: <Text style={styles.bold}>{item.student?.name || 'Student'}</Text> ({item.student?.department || 'NST'})
                  </Text>
                </View>

                {/* View External URL Button */}
                <TouchableOpacity style={styles.linkButton} onPress={() => openUrl(item.resource.url)}>
                  <Ionicons name="open-outline" size={16} color={colors.primary} />
                  <Text style={styles.linkButtonText} numberOfLines={1}>
                    {item.resource.url}
                  </Text>
                </TouchableOpacity>

                {/* Action Buttons: Approve / Reject */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.rejectBtn, isProcessing && { opacity: 0.6 }]}
                    onPress={() => setRejectionTargetId(item.id)}
                    disabled={isProcessing}
                  >
                    <Ionicons name="close-circle-outline" size={16} color={colors.error} />
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.approveBtn, isProcessing && { opacity: 0.6 }]}
                    onPress={() => handleApprove(item.id, item.resource.title)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} />
                        <Text style={styles.approveBtnText}>Approve</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: '#7C3AED', // Distinct reviewer theme (purple)
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { padding: 4 },
  headerTitleWrap: { alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.white },
  headerSubtitle: { fontSize: 12, color: '#DDD6FE', marginTop: 1 },
  refreshBtn: { padding: 4 },
  scroll: { padding: 16, paddingBottom: 32 },
  centerBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 10, fontSize: 14, color: colors.textSecondary },
  emptyBox: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeTag: { backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  typeText: { fontSize: 10, fontWeight: '700', color: '#7C3AED' },
  dateText: { fontSize: 12, color: colors.textLight },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  description: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EBF4FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaText: { fontSize: 11, color: colors.primary, fontWeight: '500' },
  studentInfoBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  studentText: { fontSize: 12, color: colors.textSecondary },
  bold: { fontWeight: '600', color: colors.textPrimary },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F7FA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  linkButtonText: { flex: 1, fontSize: 12, color: colors.primary },
  actionsRow: { flexDirection: 'row', gap: 10 },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  rejectBtnText: { fontSize: 14, fontWeight: '600', color: colors.error },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.success,
  },
  approveBtnText: { fontSize: 14, fontWeight: '600', color: colors.white },
  rejectDialog: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.error,
  },
  rejectDialogTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  rejectInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    fontSize: 13,
    color: colors.textPrimary,
    minHeight: 60,
    marginBottom: 10,
  },
  dialogButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  cancelBtnText: { fontSize: 13, color: colors.textSecondary },
  confirmRejectBtn: { backgroundColor: colors.error, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  confirmRejectText: { fontSize: 13, fontWeight: '600', color: colors.white },
});
