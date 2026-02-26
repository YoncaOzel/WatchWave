import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useThemeStore } from '../store/themeStore';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';

/**
 * T-82: Ağ bağlantısı kesildiğinde ekranın üstünde bir banner gösterir.
 * @react-native-community/netinfo paketi gerektirir.
 */
export default function NetworkBanner() {
  const { colors } = useThemeStore();
  const [isConnected, setIsConnected] = React.useState<boolean | null>(true);
  const slideY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    Animated.timing(slideY, {
      toValue: isConnected === false ? 0 : -60,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [isConnected]);

  return (
    <Animated.View
      style={[styles.banner, { backgroundColor: colors.error, transform: [{ translateY: slideY }] }]}
    >
      <Text style={styles.text}>📡  İnternet bağlantısı yok</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
