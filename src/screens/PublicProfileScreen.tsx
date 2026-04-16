import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { FirestoreService } from '../services/FirestoreService';
import { buildPosterUrl } from '../utils/imageHelper';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'PublicProfile'>;

export default function PublicProfileScreen({ route, navigation }: Props) {
  const { uid } = route.params;
  const { colors } = useThemeStore();
  const { user: currentUser } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [watchedList, setWatchedList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = await FirestoreService.getUserProfile(uid);
        setProfile(userData);

        if (userData?.followers?.includes(currentUser?.uid)) {
          setIsFollowing(true);
        }

        const lists = await FirestoreService.loadAllLists(uid);
        const sorted = lists.watched.sort((a, b) => b.addedAt - a.addedAt);
        setWatchedList(sorted);

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [uid, currentUser?.uid]);

  const handleToggleFollow = async () => {
    if (!currentUser) return;
    setToggleLoading(true);
    try {
      if (isFollowing) {
        await FirestoreService.unfollowUser(currentUser.uid, uid);
        setProfile((prev: any) => ({
          ...prev,
          followers: prev.followers.filter((id: string) => id !== currentUser.uid)
        }));
      } else {
        await FirestoreService.followUser(currentUser.uid, uid);
        setProfile((prev: any) => ({
          ...prev,
          followers: [...(prev.followers || []), currentUser.uid]
        }));
      }
      setIsFollowing(!isFollowing);
    } catch (e) {
      console.error(e);
    } finally {
      setToggleLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { id: item.tmdbId, mediaType: item.mediaType })}
    >
      <Image
        source={{ uri: buildPosterUrl(item.posterPath) }}
        style={styles.poster}
        contentFit="cover"
      />
      {item.userRating && (
        <View style={[styles.ratingBadge, { backgroundColor: colors.cardBackground }]}>
          <Text style={{ fontSize: 10, color: '#F5C518' }}>⭐ {item.userRating}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textPrimary }}>Kullanıcı bulunamadı.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initial = profile.displayName ? profile.displayName[0].toUpperCase() : '?';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>‹ Geri</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{profile.displayName}</Text>
        <Text style={[styles.stats, { color: colors.textSecondary }]}>
          {(profile.followers || []).length} Takipçi • {(profile.following || []).length} Takip Edilen
        </Text>

        {currentUser?.uid !== uid && (
          <TouchableOpacity
            style={[
              styles.followBtn,
              { backgroundColor: isFollowing ? colors.cardBackground : colors.primary, borderColor: colors.primary }
            ]}
            onPress={handleToggleFollow}
            disabled={toggleLoading}
          >
            <Text style={[styles.followBtnText, { color: isFollowing ? colors.primary : '#fff' }]}>
              {toggleLoading ? '...' : isFollowing ? 'Takibi Bırak' : 'Takip Et'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary, paddingHorizontal: Spacing.base }]}>
        İzledikleri
      </Text>
      
      {watchedList.length === 0 ? (
        <View style={[styles.center, { flex: 0, paddingVertical: 40 }]}>
          <Text style={{ color: colors.textSecondary }}>Henüz hiçbir şey izlememiş.</Text>
        </View>
      ) : (
        <FlatList
          data={watchedList}
          keyExtractor={(item) => String(item.tmdbId)}
          numColumns={3}
          renderItem={renderItem}
          contentContainerStyle={{ padding: Spacing.base }}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: Spacing.md }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: Spacing.base, flexDirection: 'row' },
  backBtn: { paddingVertical: 4, paddingRight: 20 },
  backText: { fontSize: 16, fontWeight: '600' },
  profileInfo: { alignItems: 'center', marginVertical: Spacing.md },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: Typography.fontSize.xl, fontWeight: 'bold', marginBottom: 4 },
  stats: { fontSize: Typography.fontSize.sm, marginBottom: Spacing.md },
  followBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  followBtnText: { fontWeight: 'bold', fontSize: Typography.fontSize.sm },
  sectionTitle: { fontSize: Typography.fontSize.lg, fontWeight: 'bold', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  card: { width: '31%', aspectRatio: 2/3, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  poster: { width: '100%', height: '100%' },
  ratingBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  }
});
