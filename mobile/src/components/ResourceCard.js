import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

// Maps resource type to an icon name
function getTypeIcon(type) {
  switch (type) {
    case 'video':     return 'play-circle-outline';
    case 'notes':     return 'document-text-outline';
    case 'tutorial':  return 'school-outline';
    default:          return 'link-outline';
  }
}

// Maps resource type to a background color
function getTypeColor(type) {
  switch (type) {
    case 'video':     return '#E3F2FD';
    case 'notes':     return '#E8F5E9';
    case 'tutorial':  return '#FFF3E0';
    default:          return '#F3E5F5';
  }
}

export default function ResourceCard({ resource, onPress }) {
  const typeIcon = getTypeIcon(resource.type);
  const typeBg = getTypeColor(resource.type);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <View style={[styles.typeBadge, { backgroundColor: typeBg }]}>
          <Ionicons name={typeIcon} size={14} color={colors.primary} />
          <Text style={styles.typeText}>{resource.type.toUpperCase()}</Text>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={styles.ratingText}>{resource.rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>{resource.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{resource.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.footerTag}>{resource.subject}</Text>
        <Text style={styles.footerTag}>{resource.topic}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 5,
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 6,
  },
  footerTag: {
    fontSize: 11,
    color: colors.primary,
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontWeight: '500',
  },
});
