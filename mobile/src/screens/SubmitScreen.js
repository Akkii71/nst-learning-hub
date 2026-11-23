import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const RESOURCE_TYPES = [
  { label: 'Video', value: 'video', icon: 'play-circle-outline' },
  { label: 'Notes', value: 'notes', icon: 'document-text-outline' },
  { label: 'Tutorial', value: 'tutorial', icon: 'school-outline' },
  { label: 'External Link', value: 'external', icon: 'link-outline' },
];

export default function SubmitScreen() {
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('notes');

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 1. Fetch available subjects from the backend
  useEffect(() => {
    async function fetchSubjects() {
      try {
        setLoadingSubjects(true);
        const data = await api.getSubjects();
        setSubjects(data);
      } catch (err) {
        console.error('Failed to load subjects for submit:', err);
      } finally {
        setLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, []);

  // 2. Fetch topics when subject selection changes
  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);
      setSelectedTopic(null);
      return;
    }

    async function fetchTopics() {
      try {
        setLoadingTopics(true);
        const data = await api.getTopics(selectedSubject.id);
        setTopics(data);
        setSelectedTopic(null);
      } catch (err) {
        console.error('Failed to load topics for subject:', err);
      } finally {
        setLoadingTopics(false);
      }
    }
    fetchTopics();
  }, [selectedSubject]);

  // Form submission handler
  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a resource title.');
      return;
    }

    if (!url.trim()) {
      Alert.alert('Validation Error', 'Please enter a resource URL.');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      Alert.alert('Validation Error', 'Resource URL must start with http:// or https://');
      return;
    }

    if (!selectedSubject) {
      Alert.alert('Validation Error', 'Please select an academic subject.');
      return;
    }

    if (!selectedTopic) {
      Alert.alert('Validation Error', 'Please select a syllabus topic for this subject.');
      return;
    }

    if (!selectedType) {
      Alert.alert('Validation Error', 'Please select a resource type.');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitResource({
        title: title.trim(),
        description: description.trim(),
        url: url.trim(),
        type: selectedType,
        subjectId: selectedSubject.id,
        topicId: selectedTopic.id,
        studentName: user?.name || 'NST Student',
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Submission failed:', err);
      Alert.alert('Submission Failed', err.message || 'Unable to submit resource to server.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setTitle('');
    setUrl('');
    setDescription('');
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSelectedType('notes');
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Submit Resource</Text>
          <Text style={styles.headerSubtitle}>Share a learning resource</Text>
        </View>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={72} color={colors.success} />
          <Text style={styles.successTitle}>Submitted Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Your learning resource has been recorded in the database with a pending review status. Once verified by an NST reviewer, it will be visible to all students.
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Submit Another Resource</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Submit Resource</Text>
        <Text style={styles.headerSubtitle}>Share a syllabus resource with fellow NST students</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Resource Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. MIT OpenCourseWare — Calculus Lectures"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* URL */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Resource URL *</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://youtube.com/... or https://..."
            placeholderTextColor={colors.textLight}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {/* Subject Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Subject *</Text>
          {loadingSubjects ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {subjects.map((subject) => {
                const isActive = selectedSubject?.id === subject.id;
                return (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.subjectChip,
                      isActive && {
                        backgroundColor: subject.color || colors.primary,
                        borderColor: subject.color || colors.primary,
                      },
                    ]}
                    onPress={() => setSelectedSubject(isActive ? null : subject)}
                  >
                    <Ionicons
                      name={subject.icon || 'book-outline'}
                      size={15}
                      color={isActive ? colors.white : subject.color || colors.primary}
                    />
                    <Text style={[styles.chipText, isActive && { color: colors.white }]}>
                      {subject.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Topic Selection */}
        {selectedSubject && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Syllabus Topic *</Text>
            {loadingTopics ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {topics.map((topic) => {
                  const isActive = selectedTopic?.id === topic.id;
                  return (
                    <TouchableOpacity
                      key={topic.id}
                      style={[styles.topicChip, isActive && styles.topicChipActive]}
                      onPress={() => setSelectedTopic(isActive ? null : topic)}
                    >
                      <Text style={[styles.topicChipText, isActive && styles.topicChipTextActive]}>
                        {topic.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}

        {/* Resource Type */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Resource Type *</Text>
          <View style={styles.typeGrid}>
            {RESOURCE_TYPES.map((type) => {
              const isActive = selectedType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.typeCard, isActive && styles.typeCardActive]}
                  onPress={() => setSelectedType(type.value)}
                >
                  <Ionicons
                    name={type.icon}
                    size={22}
                    color={isActive ? colors.white : colors.primary}
                  />
                  <Text style={[styles.typeCardText, isActive && { color: colors.white }]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Explain how this resource helps NST students understand the topic..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Information box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>
            Submissions are saved directly to the database and will be reviewed by NST faculty or peer reviewers before appearing publicly.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="send-outline" size={18} color={colors.white} />
              <Text style={styles.submitButtonText}>Submit Resource</Text>
            </>
          )}
        </TouchableOpacity>
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
  fieldGroup: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  chipScroll: { marginBottom: 4 },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  topicChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  topicChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  topicChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  topicChipTextActive: { color: colors.white },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  typeCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF4FF',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.primaryDark,
    lineHeight: 17,
  },
  submitButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: colors.white },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
