import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * RatingStars — reusable star rating display/input component.
 *
 * Props:
 *   rating     — number, the current rating value (0–5)
 *   maxStars   — number, default 5
 *   size       — icon size, default 20
 *   color      — star color, default amber
 *   onRate     — optional function(star) called when user taps a star (interactive mode)
 *                if not provided, component is display-only
 */
export default function RatingStars({
  rating = 0,
  maxStars = 5,
  size = 20,
  color = '#F59E0B',
  onRate,
}) {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <View style={styles.row}>
      {stars.map((star) => {
        const isFilled = star <= Math.round(rating);
        const icon = isFilled ? 'star' : 'star-outline';

        if (onRate) {
          return (
            <TouchableOpacity key={star} onPress={() => onRate(star)} activeOpacity={0.7}>
              <Ionicons name={icon} size={size} color={color} style={styles.star} />
            </TouchableOpacity>
          );
        }

        return (
          <Ionicons key={star} name={icon} size={size} color={color} style={styles.star} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 1,
  },
});
