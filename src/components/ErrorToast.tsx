import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface ErrorToastProps {
  message: string | null;
  onHide?: () => void;
  duration?: number;
  type?: 'error' | 'success';
}

export default function ErrorToast({
  message,
  onHide,
  duration = 3000,
  type = 'error',
}: ErrorToastProps) {
  const { colors } = useThemeStore();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(duration - 500),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => onHide?.());
  }, [message]);

  if (!message) return null;

  const bgColor = type === 'error' ? colors.error : colors.success;

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: bgColor }]}>
      <Text style={styles.icon}>{type === 'error' ? '⚠️' : '✅'}</Text>
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: { fontSize: 18 },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});
