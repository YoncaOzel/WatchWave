import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'filled' | 'outline';
  style?: ViewStyle;
}

export default function PrimaryButton({
  label,
  onPress,
  isLoading,
  disabled,
  variant = 'filled',
  style,
}: PrimaryButtonProps) {
  const { colors } = useThemeStore();
  const filled = variant === 'filled';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: filled ? colors.primary : 'transparent',
          borderColor: colors.primary,
          borderWidth: filled ? 0 : 1.5,
          opacity: disabled || isLoading ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.85}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={filled ? '#fff' : colors.primary} />
      ) : (
        <Text style={[styles.label, { color: filled ? '#fff' : colors.primary }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    letterSpacing: 0.3,
  },
});
