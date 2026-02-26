import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.cardBackground,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? '#fff' : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});
