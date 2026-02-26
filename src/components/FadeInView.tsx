import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  fromY?: number;
  style?: object;
}

/**
 * İçeriği yukarıdan aşağıya kaydırarak ve soluklaşarak gösterir.
 * Reanimated 2 ile GPU tabanlı animasyon.
 */
export default function FadeInView({
  children,
  delay = 0,
  duration = 350,
  fromY = 16,
  style,
}: FadeInViewProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(fromY);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.quad) }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}
