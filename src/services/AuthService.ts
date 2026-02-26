import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const AuthService = {
  register: async (
    displayName: string,
    email: string,
    password: string,
  ): Promise<User> => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    return credential.user;
  },

  login: async (email: string, password: string): Promise<User> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  },

  signOut: () => firebaseSignOut(auth),

  onAuthChanged: (callback: (user: User | null) => void) =>
    onAuthStateChanged(auth, callback),

  getCurrentUser: () => auth.currentUser,
};

export function firebaseErrorToMessage(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanılıyor.',
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
    'auth/user-not-found': 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.',
    'auth/wrong-password': 'Şifre hatalı. Lütfen tekrar deneyin.',
    'auth/too-many-requests': 'Çok fazla deneme yapıldı. Lütfen bekleyin.',
    'auth/network-request-failed': 'İnternet bağlantısını kontrol edin.',
  };
  return map[code] ?? 'Bir hata oluştu. Lütfen tekrar deneyin.';
}
