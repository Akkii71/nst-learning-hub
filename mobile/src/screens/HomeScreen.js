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
import SubjectCard from '../components/SubjectCard';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch subjects and resources from the backend
  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [fetchedSubjects, fetchedResources] = await Promise.all([
        api.getSubjects(),
        api.getResources(),
      ]);
      setSubjects(fetchedSubjects);
      setResources(fetchedResources);
    } catch (err) {
      console.error('Failed to load home data:', err);
      setError('Unable to connect to server. Please check your network.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filter resources based on search query
  const searchResults = searchQuery.trim().length > 0
    ? resources.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.topic.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  // Popular resources (highest rating)
  const popularResources = [...resources]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  // Recently added resources
  const recentResources = [...resources]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandName}>NST Learning Hub</Text>
          <Text style={styles.brandTagline}>Discover. Learn. Succeed.</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="school" size={26} color={colors.white} />
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

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading learning resources...</Text>
          </View>
        )}

        {/* Error State with Retry Button */}
        {!loading && error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Results */}
        {!loading && !error && searchQuery.trim().length > 0 && (
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

        {/* Main Content when not searching */}
        {!loading && !error && searchQuery.trim().length === 0 && (
          <>
            {/* Subject Categories */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Academic Subjects</Text>
                <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Explore')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.subjectsGrid}>
                {subjects.slice(0, 4).map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onPress={() =>
                      navigation.getParent()?.navigate('Explore', {
                        screen: 'ExploreMain',
                        params: { selectedSubject: subject },
                      })
                    }
                  />
                ))}
              </View>
            </View>

            {/* Popular Resources */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⭐ Popular Resources</Text>
              </View>
              {popularResources.length === 0 ? (
                <Text style={styles.emptyText}>No resources available yet.</Text>
              ) : (
                popularResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onPress={() => navigation.navigate('ResourceDetails', { resource })}
                  />
                ))
              )}
            </View>

            {/* Recently Added */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🕐 Recently Added</Text>
              </View>
              {recentResources.length === 0 ? (
                <Text style={styles.emptyText}>No recent resources.</Text>
              ) : (
                recentResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onPress={() => navigation.navigate('ResourceDetails', { resource })}
                  />
                ))
              )}
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
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
