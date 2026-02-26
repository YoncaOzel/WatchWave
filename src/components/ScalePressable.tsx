import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface ScalePressableProps {
  onPress: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  scale?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Basınçta hafif küçülen Reanimated tabanlı buton sarmalayıcı.
 */
export default function ScalePressable({
  onPress,
  onLongPress,
  children,
  style,
  scale = 0.94,
}: ScalePressableProps) {
  const scaleVal = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleVal.value }],
  }));

  return (
    <AnimatedPressable
      style={[animStyle, style]}
      onPressIn={() => { scaleVal.value = withSpring(scale, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scaleVal.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {children}
    </AnimatedPressable>
  );
}
