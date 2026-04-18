import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';
import { useLibraryStore } from '../store/libraryStore';
import { MovieService } from '../services/MovieService';
import { Movie } from '../types';
import { buildPosterUrl } from '../utils/imageHelper';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

export default function DiscoveryScreen() {
  const { colors } = useThemeStore();
  const { addItem, watchlist } = useLibraryStore();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const position = useRef(new Animated.ValueXY()).current;
  const currentIndexRef = useRef(currentIndex);
  const moviesRef = useRef(movies);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    moviesRef.current = movies;
  }, [currentIndex, movies]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const res = await MovieService.getPopularMovies();
      setMovies(res.results.slice(0, 20)); // Sadece 20 film
    } catch {
      Alert.alert('Hata', 'Filmler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    const swipedMovie = moviesRef.current[currentIndexRef.current];
    if (!swipedMovie) return;
    
    // Sağa kaydırdıysa listeye ekle
    if (direction === 'right') {
      const alreadyAdded = watchlist.some((i) => i.tmdbId === swipedMovie.id);
      if (!alreadyAdded) {
        addItem('watchlist', {
          tmdbId: swipedMovie.id,
          title: swipedMovie.title || swipedMovie.name || '',
          posterPath: swipedMovie.poster_path,
          mediaType: 'movie',
          addedAt: Date.now(),
          userRating: null,
          userNote: null,
        });
      }
    }

    // Bir sonraki karta geç (kartı ekrandan fırlatma animasyonunu bitir)
    Animated.timing(position, {
      toValue: { x: 0, y: 0 },
      duration: 0,
      useNativeDriver: false,
    }).start(() => setCurrentIndex(prev => prev + 1));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Sağa Fırlatarak Bitir
          Animated.spring(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
            useNativeDriver: false,
          }).start(() => handleSwipeComplete('right'));
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Sola Fırlatarak Bitir
          Animated.spring(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
            useNativeDriver: false,
          }).start(() => handleSwipeComplete('left'));
        } else {
          // Yeterince kaydırılmadı, geri yaylan
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const tilt = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 1],
    extrapolate: 'clamp',
  });
  
  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.9, 1],
    extrapolate: 'clamp',
  });

  const renderCards = () => {
    if (currentIndex >= movies.length && !isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🍿</Text>
          <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Şimdilik bu kadar!</Text>
          <TouchableOpacity style={[styles.reloadBtn, { backgroundColor: colors.primary }]} onPress={() => { setCurrentIndex(0); fetchMovies(); }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tekrar Yükle</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return movies.map((movie, index) => {
      // Geçmiş kartlar
      if (index < currentIndex) return null;

      // Sıradaki Kart (Arkada Duran)
      if (index === currentIndex + 1) {
        return (
          <Animated.View
            key={movie.id}
            style={[
              styles.cardStyle,
              { backgroundColor: colors.cardBackground, opacity: nextCardOpacity, transform: [{ scale: nextCardScale }] }
            ]}
          >
            <Image source={{ uri: buildPosterUrl(movie.poster_path) }} style={styles.poster} contentFit="cover" />
            <View style={styles.cardInfo}>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
                {movie.title || movie.name}
              </Text>
              <Text style={[styles.rating, { color: '#F5C518' }]}>★ {movie.vote_average?.toFixed(1)}</Text>
            </View>
          </Animated.View>
        );
      }

      // Aktif Kart (En Üstteki)
      if (index === currentIndex) {
        return (
          <Animated.View
            key={movie.id}
            {...panResponder.panHandlers}
            style={[
              styles.cardStyle,
              { backgroundColor: colors.cardBackground, transform: [{ translateX: position.x }, { translateY: position.y }, { rotate: tilt }] }
            ]}
          >
            <Image source={{ uri: buildPosterUrl(movie.poster_path) }} style={styles.poster} contentFit="cover" />
            <View style={styles.cardInfo}>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
                {movie.title || movie.name}
              </Text>
              <Text style={[styles.rating, { color: '#F5C518' }]}>★ {movie.vote_average?.toFixed(1)}</Text>
            </View>
            
            {/* LIKE KISMI */}
            <Animated.View style={[styles.likeLabel, { opacity: position.x.interpolate({ inputRange: [0, 100], outputRange: [0, 1] }) }]}>
              <Text style={styles.likeText}>LİSTEYE EKLE</Text>
            </Animated.View>

            {/* NOPE KISMI */}
            <Animated.View style={[styles.nopeLabel, { opacity: position.x.interpolate({ inputRange: [-100, 0], outputRange: [1, 0] }) }]}>
              <Text style={styles.nopeText}>GEÇ</Text>
            </Animated.View>
          </Animated.View>
        );
      }

      // Çok arkadaki kartlar
      return null;
    }).reverse(); // Stack order için ters çevir
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>🔥 Keşfet</Text>
      </View>
      <View style={styles.deckContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          renderCards()
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { padding: Spacing.base, alignItems: 'center' },
  headerTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold },
  deckContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.85,
    height: Dimensions.get('window').height * 0.60,
    borderRadius: BorderRadius.xl,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  poster: { flex: 1, width: '100%' },
  cardInfo: {
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, flex: 1 },
  rating: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, marginLeft: Spacing.sm },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.medium },
  reloadBtn: { marginTop: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.full },
  likeLabel: {
    position: 'absolute',
    top: 50,
    left: 20,
    transform: [{ rotate: '-15deg' }],
    borderColor: '#4CAF50',
    borderWidth: 4,
    borderRadius: 8,
    padding: 8,
    zIndex: 99,
  },
  likeText: { color: '#4CAF50', fontSize: 28, fontWeight: '900' },
  nopeLabel: {
    position: 'absolute',
    top: 50,
    right: 20,
    transform: [{ rotate: '15deg' }],
    borderColor: '#F44336',
    borderWidth: 4,
    borderRadius: 8,
    padding: 8,
    zIndex: 99,
  },
  nopeText: { color: '#F44336', fontSize: 28, fontWeight: '900' },
});
