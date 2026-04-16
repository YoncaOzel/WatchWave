import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { buildPosterUrl } from '../utils/imageHelper';

type Props = {
  title: string;
  posterPath: string | null;
  rating: number;
};

export default function ShareCard({ title, posterPath, rating }: Props) {
  const imageUri = buildPosterUrl(posterPath);

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#1c1c1e', '#000000']}
        style={StyleSheet.absoluteFill}
      />
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.poster} contentFit="cover" />
      ) : (
        <View style={[styles.poster, { backgroundColor: '#333' }]} />
      )}
      <View style={styles.content}>
        <Text style={styles.badge}>Dizi/Film Önerisi</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.rating}>⭐ {rating.toFixed(1)} / 10</Text>
        
        <View style={styles.brandContainer}>
          <Text style={styles.brand}>WatchWave</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 1080 / 3, // Roughly scaled down for render
    height: 1920 / 3, // Instagram story aspect ratio 9:16
    backgroundColor: '#000',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poster: {
    width: '80%',
    height: '60%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4facfe',
    marginBottom: 20,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  badge: {
    color: '#4facfe',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  rating: {
    color: '#F5C518',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  brandContainer: {
    marginTop: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  brand: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  }
});
