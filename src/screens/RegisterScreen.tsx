import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { AuthService, firebaseErrorToMessage } from '../services/AuthService';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import ErrorToast from '../components/ErrorToast';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface FormErrors {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(
  displayName: string,
  email: string,
  password: string,
  confirmPassword: string,
): FormErrors {
  const errors: FormErrors = {};
  if (!displayName.trim()) errors.displayName = 'Ad Soyad zorunludur.';
  if (!email.trim()) errors.email = 'E-posta zorunludur.';
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Geçerli bir e-posta girin.';
  if (!password) errors.password = 'Şifre zorunludur.';
  else if (password.length < 6) errors.password = 'Şifre en az 6 karakter olmalı.';
  if (password !== confirmPassword) errors.confirmPassword = 'Şifreler eşleşmiyor.';
  return errors;
}

export default function RegisterScreen({ navigation }: Props) {
  const { colors } = useThemeStore();
  const { setUser } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    const validationErrors = validate(displayName, email, password, confirmPassword);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const user = await AuthService.register(displayName.trim(), email.trim(), password);
      setUser({ uid: user.uid, displayName: user.displayName, email: user.email });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setToastMsg(firebaseErrorToMessage(code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Başlık */}
          <View style={styles.header}>
            <Text style={[styles.logo, { color: colors.primary }]}>WatchWave</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Hesap oluşturun
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <InputField
              label="Ad Soyad"
              placeholder="Adınız ve soyadınız"
              value={displayName}
              onChangeText={setDisplayName}
              error={errors.displayName}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            <InputField
              ref={emailRef}
              label="E-posta"
              placeholder="ornek@email.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <InputField
              ref={passwordRef}
              label="Şifre"
              placeholder="En az 6 karakter"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              isPassword
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />

            <InputField
              ref={confirmRef}
              label="Şifre Tekrar"
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            <PrimaryButton
              label="Kayıt Ol"
              onPress={handleRegister}
              isLoading={isLoading}
              style={styles.registerButton}
            />
          </View>

          {/* Giriş Yap Linki */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Zaten hesabınız var mı?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.link, { color: colors.primary }]}>Giriş Yapın</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ErrorToast message={toastMsg} onHide={() => setToastMsg(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  header: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  logo: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: Typography.fontSize.base, marginTop: Spacing.xs },
  form: { flex: 1 },
  registerButton: { marginTop: Spacing.md },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  footerText: { fontSize: Typography.fontSize.sm },
  link: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semiBold },
});
