import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';
import { useLibraryStore } from '../store/libraryStore';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

export default function AiCoachScreen() {
  const { colors } = useThemeStore();
  const { watched, favorites } = useLibraryStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const fetchAiRecommendation = async () => {
    // Toparla ve isimlerini al
    const combinedItems = [...favorites, ...watched];
    const uniqueItemsMap = new Map();
    combinedItems.forEach(item => {
      uniqueItemsMap.set(item.tmdbId, item);
    });
    
    const uniqueItems = Array.from(uniqueItemsMap.values());
    
    if (uniqueItems.length === 0) {
      Alert.alert('Bilgi Bulunamadı', 'Sana iyi bir öneri yapabilmem için Kütüphanene ("İzlediklerim" veya "Favorilerim") birkaç film/dizi eklemelisin!');
      return;
    }

    // İlk 20 içeriği gönderiyoruz ki yapay zeka boğulmasın
    const historyText = uniqueItems
      .slice(0, 20)
      .map(i => {
        let info = `- ${i.title}`;
        if (i.userRating) info += ` (${i.userRating}/5 Yıldız)`;
        if (i.userNote) info += ` - Yorumum: "${i.userNote}"`;
        return info;
      })
      .join('\n');

    setIsLoading(true);
    setSuggestion(null);

    const prompt = `Şu an kütüphanemde bulunan bazı film/diziler, verdiğim puanlar ve eğer eklediysem onlarla ilgili kişisel yorumlarım şunlar:\n${historyText}\n\nSen "WatchWave" uygulamasının profesyonel ve çok yetenekli Yapay Zeka Sinema Asistanısın. Bana bu geçmişime dayanarak kesinlikle izlemem gereken 3 tane yepyeni (listede olmayan) film veya dizi öner. \nEğer bir içeriğe düşük puan vermişsem veya olumsuz bir yorum yapmışsam o tarzlardan kaçın. Yüksek puan verdiğim içeriklerin temasına ve yorumlarımdaki sevdiğim noktalara odaklan. \nLütfen kısa, samimi ve akıcı bir Türkçe kullan. Film/dizi isimlerini metin içerisinde **Kalın (Bold)** formatında yaz. Önerdiğin içeriği neden beğeneceğimi geçmişimdeki detaylarla (verdiğim puan veya yorumlara atıfta bulunarak) açıkla.`;

    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API Key bulunamadı! Lütfen .env dosyanı kontrol et.');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        })
      });

      if (!response.ok) {
        throw new Error(`API Hatası: ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (textResponse) {
        setSuggestion(textResponse);
      } else {
        throw new Error('Yapay zekadan geçersiz yanıt döndü.');
      }
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'Öneri alınırken bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Basit markdown parser (Bold destekli)
  const renderTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={{ fontWeight: 'bold', color: colors.textPrimary }}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index} style={{ color: colors.textSecondary }}>{part}</Text>;
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>✨ AI Asistan</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Sana tam zevkine uygun içerikler bulmak için buradayım.
          </Text>
        </View>

        <LinearGradient
          colors={['#8E2DE2', '#4A00E0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={styles.cardIcon}>🤖</Text>
          <Text style={styles.cardTitle}>Senin İçin Film/Dizi Bulalım</Text>
          <Text style={styles.cardDesc}>
            Favorilerini ve izlediklerini analiz ederek, tam "Bunu izlemeliyim" diyeceğin içerikleri saniyeler içinde senin için bulacağım.
          </Text>
          
          <TouchableOpacity 
            style={[styles.actionBtn, isLoading && { opacity: 0.7 }]} 
            onPress={fetchAiRecommendation}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#4A00E0" />
            ) : (
              <Text style={styles.actionBtnText}>Yeni Öneriler Getir</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {suggestion && (
          <View style={[styles.resultContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.resultHeader}>
              <Text style={{ fontSize: 24 }}>💡</Text>
              <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>Sana Özel Tavsiyelerim</Text>
            </View>
            <View style={styles.separator} />
            <Text style={[styles.resultText, { color: colors.textSecondary }]}>
              {renderTextWithBold(suggestion)}
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  header: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    elevation: 8,
    shadowColor: '#4A00E0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  actionBtn: {
    backgroundColor: '#FFF',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    width: '100%',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#4A00E0',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  resultContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(150,150,150,0.2)',
    marginBottom: Spacing.md,
  },
  resultText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },
});
