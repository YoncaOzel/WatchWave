import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useThemeStore } from '../store/themeStore';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { buildProfileUrl } from '../utils/imageHelper';
import type { CastMember } from '../types';

interface CastScrollProps {
  cast: CastMember[];
}

export default function CastScroll({ cast }: CastScrollProps) {
  const { colors } = useThemeStore();

  if (!cast.length) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Oyuncu Kadrosu</Text>
      <FlatList
        data={cast.slice(0, 15)}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `cast-${item.id}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const imageUri = buildProfileUrl(item.profile_path);
          return (
            <View style={styles.castItem}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.avatar} contentFit="cover" cachePolicy="memory-disk" transition={150} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.cardBackground }]}>
                  <Text style={styles.avatarEmoji}>👤</Text>
                </View>
              )}
              <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[styles.character, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.character}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  list: { paddingHorizontal: Spacing.base },
  castItem: { width: 80, marginRight: Spacing.md, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, marginBottom: Spacing.xs },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 28 },
  name: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  character: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    marginTop: 2,
  },
});
