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
import SearchBar from '../components/SearchBar';
import ResourceCard from '../components/ResourceCard';
import api from '../services/api';

const RESOURCE_TYPES = ['All', 'video', 'notes', 'tutorial'];

export default function ExploreScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingResources, setLoadingResources] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch available subjects on mount
  useEffect(() => {
    async function fetchSubjects() {
      try {
        setLoadingSubjects(true);
        const data = await api.getSubjects();
        setSubjects(data);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects from backend.');
      } finally {
        setLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, []);

  // 2. Fetch topics when subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);
      setSelectedTopic(null);
      setResources([]);
      return;
    }

    async function fetchTopicsAndResources() {
      try {
        setLoadingResources(true);
        const [fetchedTopics, fetchedResources] = await Promise.all([
          api.getTopics(selectedSubject.id),
          api.getResources({ subjectId: selectedSubject.id }),
        ]);
        setTopics(fetchedTopics);
        setSelectedTopic(null);
        setResources(fetchedResources);
      } catch (err) {
        console.error('Error fetching topics/resources:', err);
      } finally {
        setLoadingResources(false);
      }
    }

    fetchTopicsAndResources();
  }, [selectedSubject]);

  // 3. Fetch resources when topic or type changes
  useEffect(() => {
    if (!selectedSubject) return;

    async function filterResources() {
      try {
        setLoadingResources(true);
        const data = await api.getResources({
          subjectId: selectedSubject.id,
          topicId: selectedTopic ? selectedTopic.id : undefined,
          type: selectedType !== 'All' ? selectedType : undefined,
          search: searchQuery.trim() || undefined,
        });
        setResources(data);
      } catch (err) {
        console.error('Error filtering resources:', err);
      } finally {
        setLoadingResources(false);
      }
    }

    filterResources();
  }, [selectedTopic, selectedType, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Syllabus</Text>
        <Text style={styles.headerSubtitle}>Discover resources by subject and topic</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search within selected subject..."
          />
        </View>

        {/* Subjects selection chips */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECT SUBJECT</Text>
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
                      isActive && { backgroundColor: subject.color || colors.primary },
                    ]}
                    onPress={() => {
                      setSelectedSubject(isActive ? null : subject);
                      setSelectedType('All');
                    }}
                  >
                    <Ionicons
                      name={subject.icon || 'book-outline'}
                      size={16}
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

        {/* Topic selection chips (when subject is selected) */}
        {selectedSubject && topics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SYLLABUS TOPIC</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity
                style={[styles.topicChip, !selectedTopic && styles.topicChipActive]}
                onPress={() => setSelectedTopic(null)}
              >
                <Text style={[styles.topicChipText, !selectedTopic && styles.topicChipTextActive]}>
                  All Topics
                </Text>
              </TouchableOpacity>
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
          </View>
        )}

        {/* Type Filter chips */}
        {selectedSubject && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RESOURCE TYPE</Text>
            <View style={styles.typeFilters}>
              {RESOURCE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, selectedType === type && styles.typeChipActive]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[styles.typeChipText, selectedType === type && styles.typeChipTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Resource List / State displays */}
        <View style={styles.section}>
          {!selectedSubject && (
            <View style={styles.promptContainer}>
              <Ionicons name="compass-outline" size={48} color={colors.border} />
              <Text style={styles.promptText}>Select a subject above to explore syllabus resources</Text>
            </View>
          )}

          {selectedSubject && loadingResources && (
            <View style={styles.promptContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.promptText}>Fetching resources...</Text>
            </View>
          )}

          {selectedSubject && !loadingResources && resources.length === 0 && (
            <Text style={styles.emptyText}>No learning resources match the selected criteria.</Text>
          )}

          {selectedSubject && !loadingResources && resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onPress={() => navigation.navigate('ResourceDetails', { resource })}
            />
          ))}
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
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  chipScroll: { marginBottom: 4 },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
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
  typeFilters: { flexDirection: 'row', gap: 8 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  typeChipTextActive: { color: colors.white },
  promptContainer: { alignItems: 'center', paddingVertical: 40 },
  promptText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
