import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import { ListType } from '../store/libraryStore';

interface AddToListSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSelect: (list: ListType) => void;
}

const LIST_OPTIONS: { list: ListType; label: string; icon: string }[] = [
  { list: 'watchlist', label: 'İzleneceklere Ekle', icon: '📋' },
  { list: 'watched', label: 'İzlediklerime Ekle', icon: '✅' },
  { list: 'favorites', label: 'Favorilere Ekle', icon: '❤️' },
];

export default function AddToListSheet({
  visible,
  title,
  onClose,
  onSelect,
}: AddToListSheetProps) {
  const { colors } = useThemeStore();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View
          style={[styles.sheet, { backgroundColor: colors.cardBackground }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.handle, { backgroundColor: colors.textSecondary }]} />

          <Text style={[styles.contentTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>

          {LIST_OPTIONS.map(({ list, label, icon }) => (
            <TouchableOpacity
              key={list}
              style={[styles.option, { borderBottomColor: colors.border }]}
              onPress={() => { onSelect(list); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>{icon}</Text>
              <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>{label}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>İptal</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xxxl,
    paddingTop: Spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  contentTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    opacity: 0.7,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionIcon: {
    fontSize: 22,
    marginRight: Spacing.md,
  },
  optionLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelText: {
    fontSize: Typography.fontSize.base,
  },
});
