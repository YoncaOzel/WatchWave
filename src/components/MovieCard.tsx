import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  GestureResponderEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { CardSize, BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useThemeStore } from '../store/themeStore';
import { buildPosterUrl } from '../utils/imageHelper';

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  rating?: number;
  onPress: () => void;
  onLongPress?: (e: GestureResponderEvent) => void;
}

export default function MovieCard({
  title,
  posterPath,
  rating,
  onPress,
  onLongPress,
}: MovieCardProps) {
  const { colors } = useThemeStore();
  const imageUri = buildPosterUrl(posterPath);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.8}
      style={styles.container}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.poster}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[styles.poster, styles.placeholder, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            🎬
          </Text>
        </View>
      )}

      {rating !== undefined && (
        <View style={[styles.ratingBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.ratingText}>⭐ {rating.toFixed(1)}</Text>
        </View>
      )}

      <Text
        style={[styles.title, { color: colors.textPrimary }]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CardSize.posterWidth,
    marginRight: Spacing.sm,
  },
  poster: {
    width: CardSize.posterWidth,
    height: CardSize.posterHeight,
    borderRadius: BorderRadius.md,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  ratingBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  ratingText: {
    color: '#fff',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  title: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 18,
  },
});
