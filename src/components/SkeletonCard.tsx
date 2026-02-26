import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { CardSize, BorderRadius, Spacing } from '../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonBoxProps {
  width?: number;
  height?: number;
  br?: number;
  style?: object;
}

export function SkeletonBox({ width = CardSize.posterWidth, height = CardSize.posterHeight, br = BorderRadius.md, style }: SkeletonBoxProps) {
  const { colors } = useThemeStore();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: br, backgroundColor: colors.border, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonCategoryRow() {
  return (
    <View style={styles.row}>
      <SkeletonBox width={120} height={16} br={4} style={{ marginBottom: Spacing.sm, marginLeft: Spacing.base }} />
      <View style={styles.cards}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ marginRight: Spacing.sm }}>
            <SkeletonBox />
            <SkeletonBox width={CardSize.posterWidth} height={12} br={4} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonDetailHeader() {
  return (
    <View>
      <SkeletonBox width={SCREEN_WIDTH} height={280} br={0} />
      <View style={{ padding: Spacing.base, gap: Spacing.sm }}>
        <SkeletonBox width={SCREEN_WIDTH * 0.65} height={28} br={6} />
        <SkeletonBox width={SCREEN_WIDTH * 0.45} height={16} br={4} />
        <SkeletonBox width={SCREEN_WIDTH - Spacing.base * 2} height={80} br={6} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: Spacing.lg },
  cards: { flexDirection: 'row', paddingLeft: Spacing.base },
});
