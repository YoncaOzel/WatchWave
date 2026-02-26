import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = '🎬',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useThemeStore();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onAction}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.md,
  },
  icon: { fontSize: 64 },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
