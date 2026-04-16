import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useThemeStore } from '../store/themeStore';
import { FirestoreService } from '../services/FirestoreService';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

type Props = {
  tmdbId: number;
  refreshTrigger: number;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CommunityReviews({ tmdbId, refreshTrigger }: Props) {
  const { colors } = useThemeStore();
  const navigation = useNavigation<Nav>();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const fetched = await FirestoreService.getReviews(tmdbId);
        setReviews(fetched);
      } catch (err) {
        console.error('Reviews load error', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [tmdbId, refreshTrigger]);

  const renderReview = ({ item }: { item: any }) => {
    const initial = item.username ? item.username[0].toUpperCase() : '?';
    return (
      <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => navigation.navigate('PublicProfile', { uid: item.uid })}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{item.username}</Text>
            {item.rating && (
              <Text style={{ fontSize: 12, color: '#F5C518' }}>⭐ {item.rating}</Text>
            )}
          </View>
        </TouchableOpacity>
        {item.comment ? (
          <Text style={[styles.comment, { color: colors.textSecondary }]} numberOfLines={4}>
            {item.comment}
          </Text>
        ) : (
          <Text style={[styles.comment, { color: colors.textSecondary, fontStyle: 'italic' }]}>
            Puan verdi ama yorum yapmadı.
          </Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={{ padding: Spacing.base, alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={{ padding: Spacing.base }}>
        <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>
          Henüz yorum yapılmamış. İlk değerlendiren sen ol!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reviews}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm }}
      renderItem={renderReview}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: 250,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  name: { fontWeight: 'bold', fontSize: Typography.fontSize.sm },
  comment: { fontSize: Typography.fontSize.sm, lineHeight: 20 },
});
