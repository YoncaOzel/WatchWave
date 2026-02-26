import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Linking, Alert } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import type { Video } from '../types';

interface TrailerButtonProps {
  videos: Video[];
}

export default function TrailerButton({ videos }: TrailerButtonProps) {
  const { colors } = useThemeStore();

  const trailer = videos.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser') && v.official,
  ) ?? videos.find((v) => v.site === 'YouTube');

  if (!trailer) return null;

  const openTrailer = async () => {
    const url = `https://www.youtube.com/watch?v=${trailer.key}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('Hata', 'YouTube açılamadı.');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: colors.textPrimary }]}
      onPress={openTrailer}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>▶</Text>
      <Text style={[styles.label, { color: colors.textPrimary }]}>Fragmanı İzle</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
    gap: Spacing.xs,
  },
  icon: { color: '#fff', fontSize: 14 },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});
