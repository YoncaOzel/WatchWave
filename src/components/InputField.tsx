import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

const InputField = forwardRef<TextInput, InputFieldProps>(
  ({ label, error, isPassword, style, ...props }, ref) => {
    const { colors } = useThemeStore();
    const [secure, setSecure] = useState(isPassword ?? false);

    return (
      <View style={styles.wrapper}>
        {label && (
          <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        )}
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.inputBackground,
              borderColor: error ? colors.error : colors.border,
            },
          ]}
        >
          <TextInput
            ref={ref}
            {...props}
            secureTextEntry={secure}
            style={[styles.input, { color: colors.textPrimary }, style]}
            placeholderTextColor={colors.textSecondary}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setSecure((p) => !p)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.eye, { color: colors.textSecondary }]}>
                {secure ? '👁' : '🙈'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        )}
      </View>
    );
  },
);

InputField.displayName = 'InputField';
export default InputField;

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    height: '100%',
  },
  eye: { fontSize: 18, paddingLeft: Spacing.sm },
  error: {
    fontSize: Typography.fontSize.xs,
    marginTop: 4,
  },
});
