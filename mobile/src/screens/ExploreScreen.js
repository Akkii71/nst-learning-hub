import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import SearchBar from '../components/SearchBar';
import ResourceCard from '../components/ResourceCard';
import {
  subjects, getTopicsBySubject, getResourcesBySubject,
} from '../data/sampleData';

const RESOURCE_TYPES = ['All', 'video', 'notes', 'tutorial'];

export default function ExploreScreen({ navigation }) {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const topics = selectedSubject ? getTopicsBySubject(selectedSubject.id) : [];
  let displayedResources = selectedSubject ? getResourcesBySubject(selectedSubject.id) : [];

  // Filter by topic
  if (selectedTopic) {
    displayedResources = displayedResources.filter((r) => r.topicId === selectedTopic.id);
  }

  // Filter by type
  if (selectedType !== 'All') {
    displayedResources = displayedResources.filter((r) => r.type === selectedType);
  }

  // Filter by search
  if (searchQuery.trim()) {
    displayedResources = displayedResources.filter(
      (r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.topic.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Browse by subject and topic</Text>
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

        {/* Subject Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECT SUBJECT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {subjects.map((subject) => {
              const isActive = selectedSubject?.id === subject.id;
              return (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectChip,
                    isActive && { backgroundColor: subject.color },
                  ]}
                  onPress={() => {
                    setSelectedSubject(isActive ? null : subject);
                    setSelectedTopic(null);
                    setSelectedType('All');
                  }}
                >
                  <Ionicons
                    name={subject.icon}
                    size={16}
                    color={isActive ? colors.white : subject.color}
                  />
                  <Text style={[styles.chipText, isActive && { color: colors.white }]}>
                    {subject.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Topics (shown when subject is selected) */}
        {selectedSubject && topics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TOPIC</Text>
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

        {/* Type Filter (shown when subject is selected) */}
        {selectedSubject && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TYPE</Text>
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

        {/* Resources */}
        <View style={styles.section}>
          {!selectedSubject && (
            <View style={styles.promptContainer}>
              <Ionicons name="compass-outline" size={48} color={colors.border} />
              <Text style={styles.promptText}>Select a subject above to browse resources</Text>
            </View>
          )}
          {selectedSubject && displayedResources.length === 0 && (
            <Text style={styles.emptyText}>No resources found with these filters.</Text>
          )}
          {displayedResources.map((resource) => (
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
