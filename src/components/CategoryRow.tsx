import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import MovieCard from './MovieCard';
import { CardSize } from '../theme/spacing';

export interface CategoryItem {
  id: number;
  title: string;
  posterPath: string | null;
  rating?: number;
  mediaType: 'movie' | 'tv';
}

interface CategoryRowProps {
  title: string;
  items: CategoryItem[];
  onItemPress: (id: number, mediaType: 'movie' | 'tv') => void;
  onItemLongPress?: (item: CategoryItem) => void;
}

export default function CategoryRow({
  title,
  items,
  onItemPress,
  onItemLongPress,
}: CategoryRowProps) {
  const { colors } = useThemeStore();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `${item.mediaType}-${item.id}`}
        contentContainerStyle={styles.list}
        removeClippedSubviews
        initialNumToRender={5}
        maxToRenderPerBatch={8}
        windowSize={5}
        getItemLayout={(_, index) => ({
          length: CardSize.posterWidth + Spacing.sm,
          offset: (CardSize.posterWidth + Spacing.sm) * index,
          index,
        })}
        renderItem={({ item }) => (
          <MovieCard
            id={item.id}
            title={item.title}
            posterPath={item.posterPath}
            rating={item.rating}
            onPress={() => onItemPress(item.id, item.mediaType)}
            onLongPress={() => onItemLongPress?.(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  list: {
    paddingHorizontal: Spacing.base,
  },
});
