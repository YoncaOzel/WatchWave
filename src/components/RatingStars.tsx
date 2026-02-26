import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface RatingStarsProps {
  rating: number | null;
  onRate: (value: number) => void;
  maxStars?: number;
}

export default function RatingStars({ rating, onRate, maxStars = 5 }: RatingStarsProps) {
  const { colors } = useThemeStore();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Puanın</Text>
      <View style={styles.stars}>
        {Array.from({ length: maxStars }).map((_, i) => {
          const value = i + 1;
          const filled = rating !== null && value <= rating;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => onRate(value)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text style={[styles.star, { color: filled ? '#F5C518' : colors.border }]}>
                ★
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {rating !== null && (
        <Text style={[styles.value, { color: colors.textSecondary }]}>
          {rating}/{maxStars}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
  stars: { flexDirection: 'row', gap: 4 },
  star: { fontSize: 28 },
  value: { fontSize: Typography.fontSize.sm },
});
