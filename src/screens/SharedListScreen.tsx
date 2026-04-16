import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { RootStackParamList } from '../navigation/types';
import { useThemeStore } from '../store/themeStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CustomList, LibraryItem } from '../store/libraryStore';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import { buildPosterUrl } from '../utils/imageHelper';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'SharedList'>;

export default function SharedListScreen({ route, navigation }: Props) {
  const { uid, listId } = route.params;
  const { colors } = useThemeStore();
  
  const [listData, setListData] = useState<CustomList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setIsLoading(true);
        const listRef = doc(db, 'users', uid, 'customLists', listId);
        const snap = await getDoc(listRef);
        if (snap.exists()) {
          setListData(snap.data() as CustomList);
        } else {
          setError('Bu liste bulunamadı veya gizli.');
        }
      } catch (err) {
        setError('Liste yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchList();
  }, [uid, listId]);

  const renderItem = ({ item }: { item: LibraryItem }) => {
    const imageUri = buildPosterUrl(item.posterPath);

    return (
      <TouchableOpacity
        style={[styles.itemRow, { borderBottomColor: colors.border }]}
        onPress={() => navigation.navigate('Detail', { id: item.tmdbId, mediaType: item.mediaType })}
        activeOpacity={0.85}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, { backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 24 }}>🎬</Text>
          </View>
        )}
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
            {item.mediaType === 'movie' ? 'Film' : 'Dizi'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.textSecondary }]}>✕ Kapat</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error || !listData ? (
        <View style={styles.center}>
          <EmptyState
            icon="⚠️"
            title="Hata"
            description={error ?? 'Liste boş veya bulunamadı.'}
            actionLabel="Geri Dön"
            onAction={() => navigation.goBack()}
          />
        </View>
      ) : (
        <>
          <View style={styles.listHeader}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>📁 {listData.name}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {listData.items.length} İçerik
            </Text>
          </View>

          <FlatList
            data={listData.items}
            keyExtractor={(item) => `${item.tmdbId}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
  },
  backBtn: { paddingVertical: Spacing.xs },
  backText: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.medium },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listHeader: {
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, textAlign: 'center' },
  subtitle: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
  listContent: { paddingBottom: Spacing.xxxl },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  poster: { width: 56, height: 84, borderRadius: BorderRadius.sm, marginRight: Spacing.md },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium },
  itemMeta: { fontSize: Typography.fontSize.xs, marginTop: 4 },
});
