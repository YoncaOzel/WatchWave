import React, { useRef } from 'react';
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { Spacing, BorderRadius } from '../theme/spacing';

const SWIPE_THRESHOLD = -80;
const ACTION_WIDTH = 80;

interface SwipeableListItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  onMove?: () => void;
  moveLabel?: string;
}

export default function SwipeableListItem({
  children,
  onDelete,
  onMove,
  moveLabel = 'Taşı',
}: SwipeableListItemProps) {
  const { colors } = useThemeStore();
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const maxOffset = onMove ? -(ACTION_WIDTH * 2 + Spacing.xs) : -ACTION_WIDTH;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dy) < Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        const val = isOpen.current ? g.dx + maxOffset : g.dx;
        if (val <= 0 && val >= maxOffset * 1.2) {
          translateX.setValue(val);
        }
      },
      onPanResponderRelease: (_, g) => {
        const target = isOpen.current ? g.dx : g.dx;
        if (!isOpen.current && g.dx < SWIPE_THRESHOLD) {
          open();
        } else if (isOpen.current && g.dx > 40) {
          close();
        } else if (!isOpen.current) {
          close();
        } else {
          open();
        }
      },
    }),
  ).current;

  const open = () => {
    isOpen.current = true;
    Animated.spring(translateX, { toValue: maxOffset, useNativeDriver: true, bounciness: 4 }).start();
  };

  const close = () => {
    isOpen.current = false;
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
  };

  const handleDelete = () => { close(); onDelete(); };
  const handleMove = () => { close(); onMove?.(); };

  return (
    <View style={styles.wrapper}>
      {/* Arka plan aksiyonlar */}
      <View style={styles.actions}>
        {onMove && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary, width: ACTION_WIDTH }]}
            onPress={handleMove}
          >
            <Text style={styles.actionIcon}>↗</Text>
            <Text style={styles.actionLabel}>{moveLabel}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.error, width: ACTION_WIDTH }]}
          onPress={handleDelete}
        >
          <Text style={styles.actionIcon}>🗑</Text>
          <Text style={styles.actionLabel}>Sil</Text>
        </TouchableOpacity>
      </View>

      {/* İçerik */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.content, { transform: [{ translateX }] }]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { overflow: 'hidden' },
  actions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  actionIcon: { fontSize: 18, color: '#fff' },
  actionLabel: { fontSize: 11, color: '#fff', fontWeight: '600' },
  content: { backgroundColor: 'transparent' },
});
