import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../store/themeStore';
import { MovieService } from '../services/MovieService';
import { FirestoreService } from '../services/FirestoreService';
import SearchBar from '../components/SearchBar';
import FilterChip from '../components/FilterChip';
import { RootStackParamList } from '../navigation/types';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius, CardSize } from '../theme/spacing';
import { buildPosterUrl } from '../utils/imageHelper';
import { formatYear, formatRating } from '../utils/formatters';
import type { Movie, TvShow } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SearchResult = (Movie | TvShow) & { media_type?: string };

const GENRES = [
  { id: 28, name: 'Aksiyon' },
  { id: 35, name: 'Komedi' },
  { id: 27, name: 'Korku' },
  { id: 878, name: 'Bilim Kurgu' },
  { id: 10749, name: 'Romantik' },
  { id: 99, name: 'Belgesel' },
  { id: 16, name: 'Animasyon' },
  { id: 18, name: 'Drama' },
  { id: 53, name: 'Gerilim' },
  { id: 80, name: 'Suç' },
];

const MEDIA_TYPES = [
  { value: 'all', label: 'Tümü' },
  { value: 'movie', label: 'Film' },
  { value: 'tv', label: 'Dizi' },
];

function isMovie(item: SearchResult): item is Movie {
  return 'title' in item;
}

export default function SearchScreen() {
  const { colors } = useThemeStore();
  const navigation = useNavigation<Nav>();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGrid, setIsGrid] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
  const [minRating, setMinRating] = useState(0);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchIdRef = useRef(0);

  const [searchMode, setSearchMode] = useState<'content' | 'users'>('content');
  const [userResults, setUserResults] = useState<any[]>([]);

  const search = useCallback(async (q: string, mode: 'content' | 'users') => {
    if (!q.trim()) { 
      setResults([]);
      setUserResults([]); 
      return; 
    }
    
    const currentSearchId = ++searchIdRef.current;
    setIsLoading(true);

    try {
      if (mode === 'users') {
        const res = await FirestoreService.searchUsers(q);
        if (currentSearchId !== searchIdRef.current) return;
        setUserResults(res);
      } else {
        const res = await MovieService.search(q);
        if (currentSearchId !== searchIdRef.current) return;
        
        let filtered = (res.results as any[]).filter((r) => r.media_type !== 'person');

        if (mediaType !== 'all') {
          filtered = filtered.filter((r) =>
            mediaType === 'movie' ? isMovie(r) : !isMovie(r),
          );
        }
        if (minRating > 0) {
          filtered = filtered.filter((r) => (r.vote_average ?? 0) >= minRating);
        }
        setResults(filtered as SearchResult[]);
      }
    } catch (e) {
      console.error('Search error', e);
      if (currentSearchId === searchIdRef.current) {
        setResults([]);
        setUserResults([]);
      }
    } finally {
      if (currentSearchId === searchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [mediaType, minRating]);

  // Debounced search on query change
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => search(query, searchMode), 300);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query, search]);

  // Immediate re-search when mode switches (so existing text takes effect)
  useEffect(() => {
    setResults([]);
    setUserResults([]);
    if (query.trim()) {
      search(query, searchMode);
    }
  }, [searchMode]);

  const navigateToDetail = (item: SearchResult) => {
    const id = item.id;
    const type = isMovie(item) ? 'movie' : 'tv';
    navigation.navigate('Detail', { id, mediaType: type });
  };

  const renderGridItem = ({ item }: { item: SearchResult }) => {
    const title = isMovie(item) ? item.title : (item as TvShow).name;
    const year = formatYear(isMovie(item) ? item.release_date : (item as TvShow).first_air_date);
    const imageUri = buildPosterUrl(item.poster_path);

    return (
      <TouchableOpacity
        style={[styles.gridItem, { backgroundColor: colors.cardBackground }]}
        onPress={() => navigateToDetail(item)}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.gridPoster} />
        ) : (
          <View style={[styles.gridPoster, { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 28 }}>🎬</Text>
          </View>
        )}
        <View style={styles.gridInfo}>
          <Text style={[styles.gridTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            {title}
          </Text>
          <Text style={[styles.gridMeta, { color: colors.textSecondary }]}>
            {year}  ⭐ {formatRating(item.vote_average)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item }: { item: SearchResult }) => {
    const title = isMovie(item) ? item.title : (item as TvShow).name;
    const year = formatYear(isMovie(item) ? item.release_date : (item as TvShow).first_air_date);
    const imageUri = buildPosterUrl(item.poster_path);

    return (
      <TouchableOpacity
        style={[styles.listItem, { borderBottomColor: colors.border }]}
        onPress={() => navigateToDetail(item)}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.listPoster} />
        ) : (
          <View style={[styles.listPoster, { backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 24 }}>🎬</Text>
          </View>
        )}
        <View style={styles.listInfo}>
          <Text style={[styles.listTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            {title}
          </Text>
          <Text style={[styles.listMeta, { color: colors.textSecondary }]}>
            {isMovie(item) ? 'Film' : 'Dizi'}  •  {year}
          </Text>
          <Text style={[styles.listRating, { color: colors.warning }]}>
            ⭐ {formatRating(item.vote_average)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }: { item: any }) => {
    const initial = item.displayName ? item.displayName[0].toUpperCase() : '?';
    return (
      <TouchableOpacity
        style={[styles.listItem, { borderBottomColor: colors.border }]}
        onPress={() => navigation.navigate('PublicProfile', { uid: item.uid })}
      >
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{initial}</Text>
        </View>
        <View style={styles.listInfo}>
          <Text style={[styles.listTitle, { color: colors.textPrimary }]}>{item.displayName}</Text>
          <Text style={[styles.listMeta, { color: colors.textSecondary }]}>
            {(item.followers || []).length} Takipçi
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Ara</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setSearchMode(searchMode === 'content' ? 'users' : 'content')} style={styles.headerBtn}>
            <Text style={{ color: searchMode === 'users' ? colors.primary : colors.textSecondary, fontSize: 13, marginRight: 8 }}>
              {searchMode === 'users' ? 'Dizi/Film Ara' : 'Kullanıcı Ara'}
            </Text>
          </TouchableOpacity>
          {searchMode === 'content' && (
            <TouchableOpacity onPress={() => setShowFilters((p) => !p)} style={styles.headerBtn}>
              <Text style={{ color: showFilters ? colors.primary : colors.textSecondary, fontSize: 13 }}>
                {showFilters ? '▲ Filtrele' : '▼ Filtrele'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setIsGrid((p) => !p)} style={styles.headerBtn}>
            <Text style={{ color: colors.textSecondary, fontSize: 18 }}>
              {isGrid ? '☰' : '⊞'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Arama Çubuğu */}
      <SearchBar value={query} onChangeText={setQuery} />

      {/* Filtre Paneli */}
      {showFilters && (
        <View style={[styles.filterPanel, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>İçerik Tipi</Text>
          <View style={styles.filterRow}>
            {MEDIA_TYPES.map((t) => (
              <FilterChip
                key={t.value}
                label={t.label}
                selected={mediaType === t.value}
                onPress={() => setMediaType(t.value as typeof mediaType)}
              />
            ))}
          </View>

          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Tür</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              <FilterChip
                label="Tümü"
                selected={selectedGenre === null}
                onPress={() => setSelectedGenre(null)}
              />
              {GENRES.map((g) => (
                <FilterChip
                  key={g.id}
                  label={g.name}
                  selected={selectedGenre === g.id}
                  onPress={() => setSelectedGenre(selectedGenre === g.id ? null : g.id)}
                />
              ))}
            </View>
          </ScrollView>

          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
            Min. Puan: {minRating > 0 ? minRating.toFixed(1) : 'Tümü'}
          </Text>
          <View style={styles.ratingRow}>
            {[0, 5, 6, 7, 8, 9].map((r) => (
              <FilterChip
                key={r}
                label={r === 0 ? 'Tümü' : `${r}+`}
                selected={minRating === r}
                onPress={() => setMinRating(r)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Sonuçlar */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : searchMode === 'users' ? (
        <FlatList
          data={userResults}
          keyExtractor={(item) => item.uid}
          renderItem={renderUserItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            query.trim() ? (
              <View style={styles.center}>
                <Text style={{ fontSize: 48 }}>👤</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Kullanıcı bulunamadı</Text>
              </View>
            ) : null
          }
        />
      ) : results.length === 0 && query.trim() ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>🔍</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            "{query}" için sonuç bulunamadı
          </Text>
          <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
            Farklı bir kelime deneyin
          </Text>
        </View>
      ) : query.trim() === '' ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>🎬</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Film veya dizi arayın
          </Text>
        </View>
      ) : isGrid ? (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={(item) => `${item.id}`}
          renderItem={renderGridItem}
          contentContainerStyle={styles.gridList}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.id}`}
          renderItem={renderListItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const GRID_ITEM_WIDTH = (CardSize.posterWidth * 1.4);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  headerActions: { flexDirection: 'row', gap: Spacing.md },
  headerBtn: { padding: 4 },
  filterPanel: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  filterLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap' },
  ratingRow: { flexDirection: 'row', flexWrap: 'wrap' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyText: { fontSize: Typography.fontSize.base, textAlign: 'center', paddingHorizontal: Spacing.xl },
  emptyHint: { fontSize: Typography.fontSize.sm },
  gridList: { padding: Spacing.base },
  gridRow: { justifyContent: 'space-between', marginBottom: Spacing.md },
  gridItem: {
    width: '48%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  gridPoster: { width: '100%', height: 200 },
  gridInfo: { padding: Spacing.sm },
  gridTitle: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
  gridMeta: { fontSize: Typography.fontSize.xs, marginTop: 2 },
  listItem: {
    flexDirection: 'row',
    padding: Spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listPoster: {
    width: 60,
    height: 90,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  listInfo: { flex: 1, justifyContent: 'center' },
  listTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium },
  listMeta: { fontSize: Typography.fontSize.sm, marginTop: 4 },
  listRating: { fontSize: Typography.fontSize.sm, marginTop: 2 },
  warning: { color: '#F5C518' },
});
