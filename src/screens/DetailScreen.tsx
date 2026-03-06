import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useLibraryStore, LibraryItem, ListType } from '../store/libraryStore';
import { useProgressStore } from '../store/progressStore';
import { MovieService } from '../services/MovieService';
import { FirestoreService } from '../services/FirestoreService';
import { ProgressService } from '../services/ProgressService';
import CastScroll from '../components/CastScroll';
import TrailerButton from '../components/TrailerButton';
import RatingStars from '../components/RatingStars';
import AddToListSheet from '../components/AddToListSheet';
import { SkeletonDetailHeader } from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import { logError } from '../utils/errorHandler';
import { buildBackdropUrl, buildPosterUrl } from '../utils/imageHelper';
import { formatRuntime, formatYear, formatRating, formatEpisodeLabel } from '../utils/formatters';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import type { MovieDetail, TvDetail, Season } from '../types';

const { width, height } = Dimensions.get('window');
const BACKDROP_HEIGHT = height * 0.38;

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function DetailScreen({ route, navigation }: Props) {
  const { id, mediaType } = route.params;
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const { addItem, removeItem, isInList, updateItem, watched } = useLibraryStore();

  const [detail, setDetail] = useState<MovieDetail | TvDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonData, setSeasonData] = useState<Season | null>(null);
  const [showSeasonPicker, setShowSeasonPicker] = useState(false);

  const [userRating, setUserRating] = useState<number | null>(null);
  const [userNote, setUserNote] = useState('');
  const [showListSheet, setShowListSheet] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const isTV = mediaType === 'tv';

  // İlerleme durumu (diziler için)
  const { getProgress, setProgress } = useProgressStore();
  const savedProgress = isTV ? getProgress(id) : undefined;
  const [currentProgress, setCurrentProgress] = useState(savedProgress);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = isTV
          ? await MovieService.getTVDetail(id)
          : await MovieService.getMovieDetail(id);
        setDetail(data);

        if (isTV) {
          const tv = data as TvDetail;
          const firstSeason = tv.seasons.find((s) => s.season_number > 0) ?? tv.seasons[0];
          if (firstSeason) {
            setSelectedSeason(firstSeason.season_number);
            setSeasonData(firstSeason);
          }
        }

        const existingItem = watched.find((i) => i.tmdbId === id);
        if (existingItem) {
          setUserRating(existingItem.userRating);
          setUserNote(existingItem.userNote ?? '');
        }
        setIsFavorite(isInList('favorites', id));
      } catch (e) {
        logError('DetailScreen', e);
        setError(e instanceof Error ? e.message : 'Detay yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, mediaType]);

  const handleSeasonSelect = async (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setShowSeasonPicker(false);
    try {
      const data = await MovieService.getSeasonDetail(id, seasonNumber);
      setSeasonData(data);
    } catch {
      // hata sessizce geçilir
    }
  };

  const syncFirestore = async (list: ListType, item: LibraryItem) => {
    if (!user) return;
    try { await FirestoreService.addItem(user.uid, list, item); } catch { /* yapılandırılmamış */ }
  };

  const syncFirestoreUpdate = async (list: ListType, patch: Partial<LibraryItem>) => {
    if (!user) return;
    try { await FirestoreService.updateItem(user.uid, list, id, patch); } catch { /* yapılandırılmamış */ }
  };

  // T-71/72: "Burada Kaldım" — bölümü işaretle
  const handleMarkProgress = async (season: number, episode: number) => {
    if (!detail || !isTV) return;
    const tv = detail as TvDetail;
    await ProgressService.saveProgress(
      user?.uid ?? null,
      id,
      tv.name,
      tv.poster_path ?? '',
      season,
      episode,
    );
    const updated = { seriesId: id, seriesTitle: tv.name, posterPath: tv.poster_path ?? '', currentSeason: season, currentEpisode: episode, lastUpdated: Date.now() };
    setCurrentProgress(updated);
    Alert.alert('Kaydedildi', `S${String(season).padStart(2,'0')}E${String(episode).padStart(2,'0')} — ilerleme kaydedildi.`);
  };

  // T-73: "Sonraki Bölüme Geç"
  const handleNextEpisode = async () => {
    if (!detail || !isTV || !currentProgress) return;
    const tv = detail as TvDetail;
    const { season, episode } = await ProgressService.nextEpisode(
      user?.uid ?? null,
      tv,
      currentProgress.currentSeason,
      currentProgress.currentEpisode,
      tv.poster_path ?? '',
    );
    const updated = { ...currentProgress, currentSeason: season, currentEpisode: episode, lastUpdated: Date.now() };
    setCurrentProgress(updated);
    // Yeni sezona geçildiyse bölüm listesini güncelle
    if (season !== selectedSeason) handleSeasonSelect(season);
  };

  const handleToggleFavorite = () => {
    if (!detail) return;
    const title = isTV ? (detail as TvDetail).name : (detail as MovieDetail).title;
    if (isFavorite) {
      removeItem('favorites', id);
      if (user) FirestoreService.removeItem(user.uid, 'favorites', id).catch(() => {});
      setIsFavorite(false);
    } else {
      const item: LibraryItem = {
        tmdbId: id,
        title,
        posterPath: detail.poster_path ?? '',
        mediaType,
        addedAt: Date.now(),
        userRating: null,
        userNote: null,
      };
      addItem('favorites', item);
      syncFirestore('favorites', item);
      setIsFavorite(true);
    }
  };

  const handleSaveRating = () => {
    if (!detail) return;
    const title = isTV ? (detail as TvDetail).name : (detail as MovieDetail).title;
    const patch = { userRating, userNote: userNote || null };

    if (isInList('watched', id)) {
      updateItem('watched', id, patch);
      syncFirestoreUpdate('watched', patch);
    } else {
      const item: LibraryItem = {
        tmdbId: id,
        title,
        posterPath: detail.poster_path ?? '',
        mediaType,
        addedAt: Date.now(),
        ...patch,
      };
      addItem('watched', item);
      syncFirestore('watched', item);
    }
    Alert.alert('Kaydedildi', 'Puan ve notun kaydedildi.');
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SkeletonDetailHeader />
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="⚠️"
          title="İçerik yüklenemedi"
          description={error ?? 'Beklenmeyen bir hata oluştu.'}
          actionLabel="Geri Dön"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const title = isTV ? (detail as TvDetail).name : (detail as MovieDetail).title;
  const releaseDate = isTV ? (detail as TvDetail).first_air_date : (detail as MovieDetail).release_date;
  const runtime = isTV
    ? (detail as TvDetail).episode_run_time?.[0]
    : (detail as MovieDetail).runtime;
  const genres = detail.genres ?? [];
  const cast = detail.credits?.cast ?? [];
  const videos = detail.videos?.results ?? [];
  const backdropUri = buildBackdropUrl(detail.backdrop_path);
  const tv = isTV ? (detail as TvDetail) : null;

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Backdrop */}
        <View style={{ height: BACKDROP_HEIGHT }}>
          {backdropUri ? (
            <ImageBackground
              source={{ uri: backdropUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.cardBackground }]} />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(20,20,20,0.7)', '#141414']}
            locations={[0.3, 0.75, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Üst Butonlar */}
          <SafeAreaView style={styles.topBar} edges={['top']}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.iconBtnText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.topRight}>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={handleToggleFavorite}
              >
                <Text style={styles.iconBtnText}>{isFavorite ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={() => setShowListSheet(true)}
              >
                <Text style={styles.iconBtnText}>＋</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* İçerik Bilgileri */}
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {formatYear(releaseDate)}
            </Text>
            {runtime ? (
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                • {formatRuntime(runtime)}
              </Text>
            ) : null}
            <Text style={[styles.ratingText, { color: '#F5C518' }]}>
              ⭐ {formatRating(detail.vote_average)}
            </Text>
            {isTV && tv && (
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                • {tv.number_of_seasons} Sezon
              </Text>
            )}
          </View>

          {/* Tür Etiketleri */}
          <View style={styles.genreRow}>
            {genres.map((g) => (
              <View key={g.id} style={[styles.genreChip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Text style={[styles.genreText, { color: colors.textSecondary }]}>{g.name}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.overview, { color: colors.textSecondary }]}>
            {detail.overview}
          </Text>

          {/* Fragman Butonu */}
          {videos.length > 0 && (
            <View style={styles.trailerRow}>
              <TrailerButton videos={videos} />
            </View>
          )}
        </View>

        {/* Oyuncu Kadrosu */}
        {cast.length > 0 && <CastScroll cast={cast} />}

        {/* Dizi: Sezon & Bölüm Bölümü */}
        {isTV && tv && (
          <View style={styles.seasonSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Bölümler</Text>

            {/* Sezon Seçici */}
            <TouchableOpacity
              style={[styles.seasonPicker, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => setShowSeasonPicker((p) => !p)}
            >
              <Text style={[styles.seasonPickerText, { color: colors.textPrimary }]}>
                {tv.seasons.find((s) => s.season_number === selectedSeason)?.name ?? `Sezon ${selectedSeason}`}
              </Text>
              <Text style={{ color: colors.textSecondary }}>▾</Text>
            </TouchableOpacity>

            {showSeasonPicker && (
              <View style={[styles.seasonDropdown, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                {tv.seasons
                  .filter((s) => s.season_number > 0)
                  .map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.seasonOption,
                        { borderBottomColor: colors.border },
                        s.season_number === selectedSeason && { backgroundColor: colors.primary + '22' },
                      ]}
                      onPress={() => handleSeasonSelect(s.season_number)}
                    >
                      <Text style={[styles.seasonOptionText, { color: colors.textPrimary }]}>
                        {s.name}
                      </Text>
                      <Text style={[styles.seasonEpCount, { color: colors.textSecondary }]}>
                        {s.episode_count} Bölüm
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}

            {/* Devam Et Banner (T-74 önizleme) */}
            {currentProgress && (
              <View style={[styles.continueBanner, { backgroundColor: colors.primary + '22', borderColor: colors.primary }]}>
                <Text style={[styles.continueLabel, { color: colors.primary }]}>
                  📍 Kaldığın Yer: {formatEpisodeLabel(currentProgress.currentSeason, currentProgress.currentEpisode)}
                </Text>
                <TouchableOpacity
                  style={[styles.nextEpBtn, { backgroundColor: colors.primary }]}
                  onPress={handleNextEpisode}
                >
                  <Text style={styles.nextEpBtnText}>Sonraki Bölüme Geç ▶</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Bölüm Listesi */}
            {(seasonData?.episodes ?? []).map((ep) => {
              const isCurrentEp =
                currentProgress?.currentSeason === ep.season_number &&
                currentProgress?.currentEpisode === ep.episode_number;
              return (
                <View
                  key={ep.id}
                  style={[
                    styles.episodeItem,
                    { borderBottomColor: colors.border },
                    isCurrentEp && { backgroundColor: colors.primary + '15' },
                  ]}
                >
                  <View style={styles.episodeInfo}>
                    <Text style={[styles.episodeLabel, { color: isCurrentEp ? colors.primary : colors.textSecondary }]}>
                      {formatEpisodeLabel(ep.season_number, ep.episode_number)}
                      {isCurrentEp ? ' 📍' : ''}
                    </Text>
                    <Text style={[styles.episodeName, { color: colors.textPrimary }]}>
                      {ep.name}
                    </Text>
                    {ep.runtime && (
                      <Text style={[styles.episodeMeta, { color: colors.textSecondary }]}>
                        {formatRuntime(ep.runtime)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.episodeRight}>
                    <Text style={[styles.episodeRating, { color: '#F5C518' }]}>
                      ⭐ {ep.vote_average.toFixed(1)}
                    </Text>
                    <TouchableOpacity
                      style={[styles.markBtn, { borderColor: isCurrentEp ? colors.primary : colors.border }]}
                      onPress={() => handleMarkProgress(ep.season_number, ep.episode_number)}
                    >
                      <Text style={[styles.markBtnText, { color: isCurrentEp ? colors.primary : colors.textSecondary }]}>
                        {isCurrentEp ? '📍' : 'Kaldım'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Kişisel Puan Bölümü */}
        <View style={[styles.ratingSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Kişisel Değerlendirme</Text>
          <RatingStars rating={userRating} onRate={setUserRating} />

          <TextInput
            style={[
              styles.noteInput,
              {
                backgroundColor: colors.inputBackground,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            placeholder="Not ekle... (max 500 karakter)"
            placeholderTextColor={colors.textSecondary}
            value={userNote}
            onChangeText={(t) => setUserNote(t.slice(0, 500))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>
            {userNote.length}/500
          </Text>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSaveRating}
            activeOpacity={0.85}
          >
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AddToListSheet
        visible={showListSheet}
        title={title}
        onClose={() => setShowListSheet(false)}
        onSelect={(list) => {
          if (!detail) return;
          const item: LibraryItem = {
            tmdbId: id,
            title,
            posterPath: detail.poster_path ?? '',
            mediaType,
            addedAt: Date.now(),
            userRating: null,
            userNote: null,
          };
          addItem(list, item);
          syncFirestore(list, item);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { fontSize: Typography.fontSize.base, textAlign: 'center', paddingHorizontal: Spacing.xl },
  backLink: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semiBold },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  topRight: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 18, color: '#fff' },
  info: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  metaText: { fontSize: Typography.fontSize.sm },
  ratingText: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semiBold },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  genreChip: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  genreText: { fontSize: Typography.fontSize.xs },
  overview: { fontSize: Typography.fontSize.sm, lineHeight: 22 },
  trailerRow: { marginTop: Spacing.md },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  seasonSection: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  seasonPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  seasonPickerText: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium },
  seasonDropdown: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  seasonOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  seasonOptionText: { fontSize: Typography.fontSize.base },
  seasonEpCount: { fontSize: Typography.fontSize.sm },
  continueBanner: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  continueLabel: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semiBold },
  nextEpBtn: {
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
  },
  nextEpBtnText: { color: '#fff', fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semiBold },
  episodeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.sm,
    marginBottom: 2,
  },
  episodeInfo: { flex: 1, marginRight: Spacing.sm },
  episodeLabel: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold, marginBottom: 2 },
  episodeName: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
  episodeMeta: { fontSize: Typography.fontSize.xs, marginTop: 2 },
  episodeRight: { alignItems: 'flex-end', gap: Spacing.xs },
  episodeRating: { fontSize: Typography.fontSize.sm },
  markBtn: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markBtnText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.medium },
  ratingSection: {
    padding: Spacing.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    minHeight: 100,
    fontSize: Typography.fontSize.sm,
  },
  charCount: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'right',
    marginTop: 4,
  },
  saveButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
