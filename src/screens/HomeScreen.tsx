import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  RefreshControl,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../store/themeStore';
import { useLibraryStore, ListType, LibraryItem } from '../store/libraryStore';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';
import { useMovies } from '../hooks/useMovies';
import HeroBanner from '../components/HeroBanner';
import CategoryRow, { CategoryItem } from '../components/CategoryRow';
import AddToListSheet from '../components/AddToListSheet';
import { SkeletonCategoryRow, SkeletonBox } from '../components/SkeletonCard';
import { RootStackParamList } from '../navigation/types';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { buildPosterUrl } from '../utils/imageHelper';
import { formatEpisodeLabel } from '../utils/formatters';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { colors } = useThemeStore();
  const navigation = useNavigation<Nav>();
  const { popularMovies, nowPlaying, topRated, popularTV, onTheAir, isLoading, error, refresh } =
    useMovies();
  const { addItem, addItemToCustomList, isInList } = useLibraryStore();
  const { progress } = useProgressStore();
  const { user } = useAuthStore();
  const continueWatching = Object.values(progress).sort((a, b) => b.lastUpdated - a.lastUpdated);

  const [sheetItem, setSheetItem] = useState<CategoryItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Ana banner için popüler filmden rastgele bir seçim
  const heroBanner = useMemo(() => {
    if (!popularMovies.length) return null;
    const idx = Math.floor(Math.random() * Math.min(5, popularMovies.length));
    return popularMovies[idx];
  }, [popularMovies]);

  const toItems = (
    arr: { id: number; title?: string; name?: string; poster_path: string | null; vote_average: number }[],
    mediaType: 'movie' | 'tv',
  ): CategoryItem[] =>
    arr.map((x) => ({
      id: x.id,
      title: (x.title ?? (x as { name?: string }).name) ?? '',
      posterPath: x.poster_path,
      rating: x.vote_average,
      mediaType,
    }));

  const categories = [
    { title: '🔥 Popüler Filmler', items: toItems(popularMovies, 'movie') },
    { title: '🎬 Vizyondakiler', items: toItems(nowPlaying, 'movie') },
    { title: '⭐ En Çok Oylananlar', items: toItems(topRated, 'movie') },
    { title: '📺 Popüler Diziler', items: toItems(popularTV, 'tv') },
    { title: '🆕 Yeni Bölümler', items: toItems(onTheAir, 'tv') },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const navigateToDetail = (id: number, mediaType: 'movie' | 'tv') => {
    navigation.navigate('Detail', { id, mediaType });
  };

  const handleAddToList = (listId: string, isCustom: boolean) => {
    if (!sheetItem) return;
    const item: LibraryItem = {
      tmdbId: sheetItem.id,
      title: sheetItem.title,
      posterPath: sheetItem.posterPath ?? '',
      mediaType: sheetItem.mediaType,
      addedAt: Date.now(),
      userRating: null,
      userNote: null,
    };
    
    if (isCustom) {
      addItemToCustomList(listId, item);
      if (user) {
        const cl = useLibraryStore.getState().customLists.find(c => c.id === listId);
        import('../services/FirestoreService').then(m => {
          if (cl) m.FirestoreService.saveCustomList(user.uid, { ...cl, items: [...cl.items, item] });
        });
      }
    } else {
      addItem(listId as ListType, item);
      import('../services/FirestoreService').then(m => {
        if (user) m.FirestoreService.addItem(user.uid, listId as ListType, item);
      });
    }
  };

  if (isLoading && !refreshing) {
    return (
      <ScrollView style={{ backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
        <SkeletonBox width={undefined} height={320} br={0} />
        {[0, 1, 2, 3, 4].map((i) => <SkeletonCategoryRow key={i} />)}
      </ScrollView>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        <Text
          style={[styles.retryText, { color: colors.primary }]}
          onPress={refresh}
        >
          Yeniden Dene
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {heroBanner && (
          <HeroBanner
            id={heroBanner.id}
            title={heroBanner.title}
            overview={heroBanner.overview}
            backdropPath={heroBanner.backdrop_path}
            mediaType="movie"
            onPlay={() => navigateToDetail(heroBanner.id, 'movie')}
            onAddToList={() =>
              setSheetItem({
                id: heroBanner.id,
                title: heroBanner.title,
                posterPath: heroBanner.poster_path,
                rating: heroBanner.vote_average,
                mediaType: 'movie',
              })
            }
          />
        )}

        <View style={styles.categories}>
          {/* T-74: Devam Et bölümü */}
          {continueWatching.length > 0 && (
            <View style={styles.continueSection}>
              <Text style={[styles.continueTitle, { color: colors.textPrimary }]}>
                ▶ Devam Et
              </Text>
              <FlatList
                data={continueWatching}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => `continue-${item.seriesId}`}
                contentContainerStyle={styles.continueList}
                renderItem={({ item }) => {
                  const imageUri = buildPosterUrl(item.posterPath);
                  const label = formatEpisodeLabel(item.currentSeason, item.currentEpisode);
                  return (
                    <TouchableOpacity
                      style={styles.continueCard}
                      onPress={() => navigateToDetail(item.seriesId, 'tv')}
                      activeOpacity={0.85}
                    >
                      {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.continuePoster} />
                      ) : (
                        <View style={[styles.continuePoster, { backgroundColor: colors.cardBackground }]} />
                      )}
                      <View style={[styles.continueBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.continueBadgeText}>{label}</Text>
                      </View>
                      <Text style={[styles.continueSeriesTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                        {item.seriesTitle}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}

          {categories.map((cat) => (
            <CategoryRow
              key={cat.title}
              title={cat.title}
              items={cat.items}
              onItemPress={navigateToDetail}
              onItemLongPress={(item) => setSheetItem(item)}
            />
          ))}
        </View>
      </ScrollView>

      <AddToListSheet
        visible={!!sheetItem}
        title={sheetItem?.title ?? ''}
        onClose={() => setSheetItem(null)}
        onSelect={handleAddToList}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categories: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  continueSection: { marginBottom: Spacing.lg },
  continueTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  continueList: { paddingHorizontal: Spacing.base },
  continueCard: { width: 120, marginRight: Spacing.md },
  continuePoster: { width: 120, height: 170, borderRadius: BorderRadius.md },
  continueBadge: {
    position: 'absolute',
    bottom: 24,
    left: 4,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  continueBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  continueSeriesTitle: {
    fontSize: Typography.fontSize.xs,
    marginTop: 4,
    fontWeight: Typography.fontWeight.medium,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  retryText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
