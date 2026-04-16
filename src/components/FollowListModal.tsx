import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../store/themeStore';
import { FirestoreService } from '../services/FirestoreService';
import { RootStackParamList } from '../navigation/types';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  visible: boolean;
  title: string;           // 'Takipçiler' or 'Takip Edilenler'
  uids: string[];
  onClose: () => void;
};

export default function FollowListModal({ visible, title, uids, onClose }: Props) {
  const { colors } = useThemeStore();
  const navigation = useNavigation<Nav>();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!visible || uids.length === 0) {
      setProfiles([]);
      return;
    }
    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        const results = await Promise.all(
          uids.map((uid) =>
            FirestoreService.getUserProfile(uid).then((p) => p ? { uid, ...p } : null)
          )
        );
        setProfiles(results.filter(Boolean));
      } catch (e) {
        console.error('FollowListModal fetch error', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, [visible, uids]);

  const handleUserPress = (uid: string) => {
    onClose();
    setTimeout(() => {
      navigation.navigate('PublicProfile', { uid });
    }, 300);
  };

  const renderItem = ({ item }: { item: any }) => {
    const initial = item.displayName ? item.displayName[0].toUpperCase() : '?';
    return (
      <TouchableOpacity
        style={[styles.row, { borderBottomColor: colors.border }]}
        onPress={() => handleUserPress(item.uid)}
        activeOpacity={0.75}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {item.displayName ?? 'Kullanıcı'}
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {(item.followers ?? []).length} Takipçi
          </Text>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 18 }}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.primary }]}>Kapat</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : profiles.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ fontSize: 40 }}>👤</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {title === 'Takipçiler' ? 'Henüz takipçin yok.' : 'Henüz kimseyi takip etmiyorsun.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={profiles}
            keyExtractor={(item) => item.uid}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Spacing.xxxl }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  closeBtn: { padding: 4 },
  closeText: { fontSize: Typography.fontSize.base, fontWeight: '600' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: Typography.fontSize.base, fontWeight: '600' },
  sub: { fontSize: Typography.fontSize.sm, marginTop: 2 },
});
