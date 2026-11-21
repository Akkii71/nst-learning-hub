import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import { subjects } from '../data/sampleData';

const RESOURCE_TYPES = [
  { label: 'Video', value: 'video', icon: 'play-circle-outline' },
  { label: 'Notes', value: 'notes', icon: 'document-text-outline' },
  { label: 'Tutorial', value: 'tutorial', icon: 'school-outline' },
  { label: 'Other', value: 'other', icon: 'link-outline' },
];

export default function SubmitScreen() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!title.trim() || !url.trim() || !selectedSubject || !selectedType) {
      Alert.alert('Missing Fields', 'Please fill in all required fields: title, URL, subject, and type.');
      return;
    }
    setSubmitted(true);
  }

  function handleReset() {
    setTitle('');
    setUrl('');
    setDescription('');
    setSelectedSubject(null);
    setSelectedType(null);
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
          <Text style={styles.successTitle}>Submitted!</Text>
          <Text style={styles.successSubtitle}>
            Your resource has been submitted for review. It will appear on the app once approved.
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Submit Another</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Submit Resource</Text>
        <Text style={styles.headerSubtitle}>Share a learning resource with NST students</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Resource Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. MIT OpenCourseWare — Calculus"
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
            placeholder="https://..."
            placeholderTextColor={colors.textLight}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {/* Subject */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Subject *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {subjects.map((subject) => {
              const isActive = selectedSubject?.id === subject.id;
              return (
                <TouchableOpacity
                  key={subject.id}
                  style={[styles.subjectChip, isActive && { backgroundColor: subject.color, borderColor: subject.color }]}
                  onPress={() => setSelectedSubject(isActive ? null : subject)}
                >
                  <Ionicons name={subject.icon} size={15} color={isActive ? colors.white : subject.color} />
                  <Text style={[styles.chipText, isActive && { color: colors.white }]}>{subject.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

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
                  onPress={() => setSelectedType(isActive ? null : type.value)}
                >
                  <Ionicons
                    name={type.icon}
                    size={22}
                    color={isActive ? colors.white : colors.primary}
                  />
                  <Text style={[styles.typeCardText, isActive && { color: colors.white }]}>{type.label}</Text>
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
            placeholder="Briefly describe what this resource covers..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Info Note */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>
            Submissions are reviewed before being published. Please ensure the link is working and the content is relevant to NST syllabus.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name="send-outline" size={18} color={colors.white} />
          <Text style={styles.submitButtonText}>Submit for Review</Text>
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
    gap: 10,
    backgroundColor: '#EBF4FF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.primary,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
