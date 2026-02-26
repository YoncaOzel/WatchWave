import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useLibraryStore } from '../store/libraryStore';
import { AuthService } from '../services/AuthService';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

function AvatarCircle({ name, size = 72 }: { name: string; size?: number }) {
  const { colors } = useThemeStore();
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  const { colors } = useThemeStore();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useThemeStore();
  const { user, setUser } = useAuthStore();
  const { watchlist, watched, favorites } = useLibraryStore();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const avgRating = (() => {
    const rated = watched.filter((i) => i.userRating !== null);
    if (!rated.length) return 0;
    return rated.reduce((acc, i) => acc + (i.userRating ?? 0), 0) / rated.length;
  })();

  const handleSignOut = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          setIsSigningOut(true);
          try {
            await AuthService.signOut();
            setUser(null);
          } catch {
            Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
          } finally {
            setIsSigningOut(false);
          }
        },
      },
    ]);
  };

  const displayName = user?.displayName ?? 'Kullanıcı';
  const email = user?.email ?? '';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Profil</Text>
        </View>

        {/* Kullanıcı Bilgileri */}
        <View style={styles.userSection}>
          <AvatarCircle name={displayName} />
          <View style={styles.userInfo}>
            <Text style={[styles.displayName, { color: colors.textPrimary }]}>
              {displayName}
            </Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{email}</Text>
          </View>
        </View>

        {/* İstatistik Kartları */}
        <View style={styles.statsRow}>
          <StatCard label="İzlendi" value={watched.length} />
          <StatCard label="İzlenecek" value={watchlist.length} />
          <StatCard label="Favori" value={favorites.length} />
        </View>

        {avgRating > 0 && (
          <View style={[styles.avgCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.avgLabel, { color: colors.textSecondary }]}>
              Ortalama Puanın
            </Text>
            <Text style={[styles.avgValue, { color: '#F5C518' }]}>
              ⭐ {avgRating.toFixed(1)} / 5
            </Text>
          </View>
        )}

        {/* Ayarlar */}
        <View style={[styles.settingsSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>AYARLAR</Text>

          {/* Karanlık Mod Toggle */}
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>{isDark ? '🌙' : '☀️'}</Text>
              <Text style={[styles.settingText, { color: colors.textPrimary }]}>
                {isDark ? 'Karanlık Mod' : 'Aydınlık Mod'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: isDark ? colors.primary : colors.border },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.toggleThumb,
                  { transform: [{ translateX: isDark ? 20 : 2 }] },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Çıkış Yap */}
        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: colors.error }]}
          onPress={handleSignOut}
          disabled={isSigningOut}
          activeOpacity={0.8}
        >
          <Text style={[styles.signOutText, { color: colors.error }]}>
            {isSigningOut ? 'Çıkış yapılıyor...' : '🚪  Çıkış Yap'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.base,
  },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: Typography.fontWeight.bold },
  userInfo: { flex: 1 },
  displayName: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold },
  email: { fontSize: Typography.fontSize.sm, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  statValue: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold },
  statLabel: { fontSize: Typography.fontSize.xs, marginTop: 2 },
  avgCard: {
    marginHorizontal: Spacing.base,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avgLabel: { fontSize: Typography.fontSize.sm },
  avgValue: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
  settingsSection: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.lg, marginTop: Spacing.sm },
  sectionLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  settingIcon: { fontSize: 20 },
  settingText: { fontSize: Typography.fontSize.base },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  signOutButton: {
    margin: Spacing.xl,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  signOutText: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semiBold },
});
