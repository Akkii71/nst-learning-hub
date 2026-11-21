import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import SearchBar from '../components/SearchBar';
import ResourceCard from '../components/ResourceCard';
import SubjectCard from '../components/SubjectCard';
import {
  subjects, resources, getPopularResources, getRecentResources,
} from '../data/sampleData';

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');

  const popularResources = getPopularResources(3);
  const recentResources = getRecentResources(3);

  // Filter all resources based on search query
  const searchResults = searchQuery.trim().length > 0
    ? resources.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.topic.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandName}>NST Learning Hub</Text>
          <Text style={styles.brandTagline}>Discover. Learn. Succeed.</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="school" size={28} color={colors.white} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search resources, subjects, topics..."
          />
        </View>

        {/* Search Results */}
        {searchQuery.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results ({searchResults.length})</Text>
            {searchResults.length === 0 ? (
              <Text style={styles.emptyText}>No resources found for "{searchQuery}"</Text>
            ) : (
              searchResults.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onPress={() => navigation.navigate('ResourceDetails', { resource })}
                />
              ))
            )}
          </View>
        )}

        {/* Show main content when not searching */}
        {searchQuery.trim().length === 0 && (
          <>
            {/* Subject Categories */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Subjects</Text>
                <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Explore')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.subjectsGrid}>
                {subjects.slice(0, 4).map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onPress={() => navigation.getParent()?.navigate('Explore')}
                  />
                ))}
              </View>
            </View>

            {/* Popular Resources */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⭐ Popular Resources</Text>
              </View>
              {popularResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onPress={() => navigation.navigate('ResourceDetails', { resource })}
                />
              ))}
            </View>

            {/* Recently Added */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🕐 Recently Added</Text>
              </View>
              {recentResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onPress={() => navigation.navigate('ResourceDetails', { resource })}
                />
              ))}
            </View>
          </>
        )}
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
  brandName: { fontSize: 20, fontWeight: '700', color: colors.white },
  brandTagline: { fontSize: 13, color: '#BBDEFB', marginTop: 2 },
  headerIcon: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    padding: 8,
  },
  scroll: { paddingBottom: 20 },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
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
  seeAll: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});
