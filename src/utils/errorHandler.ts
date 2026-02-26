/**
 * Merkezi API hata işleyici.
 * Axios hataları, Firebase hataları ve genel JS hatalarını
 * kullanıcıya gösterilecek Türkçe mesajlara çevirir.
 */
export function parseError(err: unknown): string {
  if (!err) return 'Bilinmeyen bir hata oluştu.';

  // Firebase Auth hataları
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code: string }).code;
    if (code.startsWith('auth/')) {
      const authMessages: Record<string, string> = {
        'auth/network-request-failed': 'İnternet bağlantısını kontrol edin.',
        'auth/too-many-requests': 'Çok fazla deneme. Lütfen bekleyin.',
        'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
        'auth/invalid-credential': 'Geçersiz e-posta veya şifre.',
      };
      return authMessages[code] ?? 'Kimlik doğrulama hatası.';
    }
    if (code.startsWith('firestore/') || code.startsWith('storage/')) {
      return 'Veri kaydedilirken hata oluştu. Tekrar deneyin.';
    }
  }

  // Axios / network hataları
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 401) return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
    if (status === 403) return 'Bu içeriğe erişim izniniz yok.';
    if (status === 404) return 'İçerik bulunamadı.';
    if (status && status >= 500) return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
  }

  // message özelliği olan herhangi bir hata
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const msg = (err as { message: string }).message;
    if (msg.includes('Network') || msg.includes('network')) {
      return 'İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.';
    }
    if (msg.includes('timeout')) return 'İstek zaman aşımına uğradı.';
    return msg;
  }

  if (typeof err === 'string') return err;
  return 'Beklenmeyen bir hata oluştu.';
}

/** Hata loglamak için merkezi fonksiyon — production'da crash reporting eklenebilir */
export function logError(context: string, err: unknown): void {
  if (__DEV__) {
    console.error(`[${context}]`, err);
  }
  // TODO: Sentry.captureException(err) gibi bir servis eklenebilir
}
