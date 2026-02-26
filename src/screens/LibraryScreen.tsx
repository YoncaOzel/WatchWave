import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useLibraryStore, LibraryItem, ListType } from '../store/libraryStore';
import { FirestoreService } from '../services/FirestoreService';
import SwipeableListItem from '../components/SwipeableListItem';
import RatingStars from '../components/RatingStars';
import { RootStackParamList } from '../navigation/types';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import { buildPosterUrl } from '../utils/imageHelper';
import { formatYear } from '../utils/formatters';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS: { key: ListType; label: string; icon: string }[] = [
  { key: 'watchlist', label: 'İzlenecekler', icon: '📋' },
  { key: 'watched', label: 'İzlediklerim', icon: '✅' },
  { key: 'favorites', label: 'Favorilerim', icon: '❤️' },
];

interface EditModalState {
  item: LibraryItem;
  list: ListType;
}

export default function LibraryScreen() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const { watchlist, watched, favorites, removeItem, moveItem, updateItem, setList } =
    useLibraryStore();
  const navigation = useNavigation<Nav>();

  const [activeTab, setActiveTab] = useState<ListType>('watchlist');
  const [editModal, setEditModal] = useState<EditModalState | null>(null);
  const [editRating, setEditRating] = useState<number | null>(null);
  const [editNote, setEditNote] = useState('');

  const lists: Record<ListType, LibraryItem[]> = { watchlist, watched, favorites };
  const currentItems = lists[activeTab];

  const syncToFirestore = async (list: ListType, items: LibraryItem[]) => {
    if (!user) return;
    try {
      await FirestoreService.setList(user.uid, list, items);
    } catch {
      // Firestore yapılandırılmamışsa sessizce geç
    }
  };

  const handleDelete = (list: ListType, tmdbId: number) => {
    Alert.alert('Sil', 'Bu içeriği listeden çıkarmak istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          removeItem(list, tmdbId);
          const updated = lists[list].filter((i) => i.tmdbId !== tmdbId);
          syncToFirestore(list, updated);
        },
      },
    ]);
  };

  const handleMove = (from: ListType, item: LibraryItem) => {
    const targets = TABS.filter((t) => t.key !== from);
    Alert.alert(
      'Listeye Taşı',
      `"${item.title}" hangi listeye taşınsın?`,
      targets.map((t) => ({
        text: `${t.icon} ${t.label}`,
        onPress: () => {
          moveItem(from, t.key, item.tmdbId);
          const updatedFrom = lists[from].filter((i) => i.tmdbId !== item.tmdbId);
          const updatedTo = [...lists[t.key], { ...item, addedAt: Date.now() }];
          syncToFirestore(from, updatedFrom);
          syncToFirestore(t.key, updatedTo);
        },
      })),
    );
  };

  const openEditModal = (item: LibraryItem, list: ListType) => {
    setEditModal({ item, list });
    setEditRating(item.userRating);
    setEditNote(item.userNote ?? '');
  };

  const saveEdit = () => {
    if (!editModal) return;
    const { item, list } = editModal;
    updateItem(list, item.tmdbId, { userRating: editRating, userNote: editNote || null });
    if (user) {
      FirestoreService.updateItem(user.uid, list, item.tmdbId, {
        userRating: editRating,
        userNote: editNote || null,
      }).catch(() => {});
    }
    setEditModal(null);
  };

  const renderItem = ({ item }: { item: LibraryItem }) => {
    const imageUri = buildPosterUrl(item.posterPath);
    const canEdit = activeTab === 'watched';

    return (
      <SwipeableListItem
        onDelete={() => handleDelete(activeTab, item.tmdbId)}
        onMove={() => handleMove(activeTab, item)}
        moveLabel="Taşı"
      >
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
            {item.userRating !== null && (
              <Text style={[styles.itemRating, { color: '#F5C518' }]}>
                {'★'.repeat(item.userRating)}{'☆'.repeat(5 - item.userRating)}
              </Text>
            )}
            {item.userNote && (
              <Text style={[styles.itemNote, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.userNote}
              </Text>
            )}
          </View>
          {canEdit && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => openEditModal(item, activeTab)}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 18 }}>✏️</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </SwipeableListItem>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Kütüphanem</Text>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={{ fontSize: 16 }}>{tab.icon}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.primary : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
              <View style={[styles.badge, { backgroundColor: isActive ? colors.primary : colors.border }]}>
                <Text style={styles.badgeText}>{lists[tab.key].length}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* İçerik */}
      {currentItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>
            {TABS.find((t) => t.key === activeTab)?.icon}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {activeTab === 'watchlist' && 'İzlemek istediğin içerikleri buraya ekle'}
            {activeTab === 'watched' && 'İzlediğin içerikler burada görünür'}
            {activeTab === 'favorites' && 'Favori içeriklerini buraya ekle'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentItems}
          keyExtractor={(item) => `${item.tmdbId}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          getItemLayout={(_, index) => ({ length: 112, offset: 112 * index, index })}
        />
      )}

      {/* Düzenleme Modal'ı */}
      <Modal
        visible={!!editModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {editModal?.item.title}
            </Text>

            <RatingStars rating={editRating} onRate={setEditRating} />

            <TextInput
              style={[
                styles.noteInput,
                { backgroundColor: colors.inputBackground, color: colors.textPrimary, borderColor: colors.border },
              ]}
              placeholder="Notun... (max 500 karakter)"
              placeholderTextColor={colors.textSecondary}
              value={editNote}
              onChangeText={(t) => setEditNote(t.slice(0, 500))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: colors.textSecondary }]}>
              {editNote.length}/500
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setEditModal(null)}
              >
                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={saveEdit}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: { fontSize: 10, fontWeight: Typography.fontWeight.medium },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: Typography.fontWeight.bold },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  emptyText: { fontSize: Typography.fontSize.base, textAlign: 'center' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  poster: { width: 56, height: 84, borderRadius: BorderRadius.sm, marginRight: Spacing.md },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium },
  itemMeta: { fontSize: Typography.fontSize.xs, marginTop: 2 },
  itemRating: { fontSize: Typography.fontSize.sm, marginTop: 4 },
  itemNote: { fontSize: Typography.fontSize.xs, marginTop: 4, fontStyle: 'italic' },
  editBtn: { padding: Spacing.sm },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  modalTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.lg,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    minHeight: 90,
    fontSize: Typography.fontSize.sm,
  },
  charCount: { fontSize: Typography.fontSize.xs, textAlign: 'right', marginTop: 4 },
  modalButtons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semiBold },
});
