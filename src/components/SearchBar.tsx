import React, { useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Film, dizi ara...',
  autoFocus = true,
}: SearchBarProps) {
  const { colors } = useThemeStore();
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBackground }]}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, { color: colors.textPrimary }]}
        autoFocus={autoFocus}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.clear, { color: colors.textSecondary }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 46,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    height: '100%',
  },
  clear: {
    fontSize: 14,
    paddingLeft: Spacing.sm,
  },
});
