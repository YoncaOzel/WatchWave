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
  Switch,
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
import { Spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { colors } = useThemeStore();
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);

  const validate = (): boolean => {
    let valid = true;
    if (!email.trim()) { setEmailError('E-posta zorunludur.'); valid = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Geçerli bir e-posta girin.'); valid = false; }
    else setEmailError('');

    if (!password) { setPasswordError('Şifre zorunludur.'); valid = false; }
    else setPasswordError('');

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const user = await AuthService.login(email.trim(), password);
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
          {/* Logo */}
          <View style={styles.header}>
            <Text style={[styles.logo, { color: colors.primary }]}>WatchWave</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Hesabınıza giriş yapın
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <InputField
              label="E-posta"
              placeholder="ornek@email.com"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <InputField
              ref={passwordRef}
              label="Şifre"
              placeholder="Şifreniz"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            {/* Beni Hatırla */}
            <View style={styles.rememberRow}>
              <Text style={[styles.rememberText, { color: colors.textSecondary }]}>
                Beni Hatırla
              </Text>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <PrimaryButton
              label="Giriş Yap"
              onPress={handleLogin}
              isLoading={isLoading}
              style={styles.loginButton}
            />
          </View>

          {/* Kayıt Ol Linki */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Hesabınız yok mu?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.link, { color: colors.primary }]}>Kayıt Olun</Text>
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
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  rememberText: { fontSize: Typography.fontSize.sm },
  loginButton: { marginTop: Spacing.xs },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  footerText: { fontSize: Typography.fontSize.sm },
  link: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semiBold },
});
