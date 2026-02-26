import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { buildBackdropUrl } from '../utils/imageHelper';

const { width, height } = Dimensions.get('window');
const BANNER_HEIGHT = height * 0.42;

interface HeroBannerProps {
  id: number;
  title: string;
  overview: string;
  backdropPath: string | null;
  mediaType: 'movie' | 'tv';
  onPlay: () => void;
  onAddToList: () => void;
}

export default function HeroBanner({
  title,
  overview,
  backdropPath,
  onPlay,
  onAddToList,
}: HeroBannerProps) {
  const { colors } = useThemeStore();
  const imageUri = buildBackdropUrl(backdropPath);

  return (
    <View style={[styles.container, { height: BANNER_HEIGHT }]}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={300}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.cardBackground }]} />
      )}

      <LinearGradient
        colors={['transparent', 'rgba(20,20,20,0.85)', '#141414']}
        locations={[0.2, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.overview, { color: colors.textSecondary }]} numberOfLines={3}>
          {overview}
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: colors.textPrimary }]}
            onPress={onPlay}
            activeOpacity={0.85}
          >
            <Text style={[styles.playButtonText, { color: colors.background }]}>
              ▶  İzle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.listButton, { backgroundColor: 'rgba(109,109,110,0.7)', borderColor: colors.textSecondary }]}
            onPress={onAddToList}
            activeOpacity={0.85}
          >
            <Text style={[styles.listButtonText, { color: colors.textPrimary }]}>
              + Listeye Ekle
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  overview: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  playButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  listButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});
