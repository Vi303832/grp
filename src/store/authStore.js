import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const useAuthStore = create((set, get) => ({
  user: null,
  userProfile: null,
  role: null,
  loading: true,

  // Firebase Auth'u dinler — App mount'ta çağrılır
  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const [profile, role] = await Promise.all([
          get()._fetchProfile(firebaseUser.uid),
          get()._fetchRole(firebaseUser, false),
        ]);
        set({ user: firebaseUser, userProfile: profile, role, loading: false });
      } else {
        set({ user: null, userProfile: null, role: null, loading: false });
      }
    });
    return unsubscribe;
  },

  _fetchProfile: async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? snap.data() : null;
    } catch {
      return null;
    }
  },

  // Custom claim'deki role bilgisini okur. forceRefresh=true → token yenilenir
  _fetchRole: async (firebaseUser, forceRefresh = false) => {
    try {
      const tokenResult = await firebaseUser.getIdTokenResult(forceRefresh);
      return tokenResult.claims.role ?? 'user';
    } catch {
      return 'user';
    }
  },

  register: async ({ displayName, email, password, phone }) => {
    const normalizedEmail = String(email ?? '').trim();
    const credential = await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      password,
    );
    const { user } = credential;

    // Token'daki email ile Firestore kuralı karşılaştırdığı için
    // Auth'un sakladığı email değerini kullanıyoruz (case-preserved).
    const canonicalEmail = user.email ?? normalizedEmail;

    const profile = {
      displayName: displayName.trim(),
      email: canonicalEmail,
      phone: phone?.trim() || '',
      cityId: 'bursa',
      role: 'user',
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid), profile);
      await updateProfile(user, { displayName: profile.displayName });
    } catch (err) {
      // Firestore yazımı başarısız olursa orphan Auth kaydı bırakma
      // (aksi halde kullanıcı tekrar denediğinde "email-already-in-use" alır)
      console.error('[auth.register] Firestore profil yazımı başarısız:', err);
      try {
        await deleteUser(user);
      } catch (cleanupErr) {
        console.error('[auth.register] Orphan auth temizlenemedi:', cleanupErr);
      }
      throw err;
    }

    set({ user, userProfile: profile, role: 'user' });
    return user;
  },

  login: async ({ email, password }) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const [profile, role] = await Promise.all([
      get()._fetchProfile(user.uid),
      get()._fetchRole(user, false),
    ]);
    set({ user, userProfile: profile, role });
    return user;
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, userProfile: null, role: null });
  },

  resetPassword: async (email) => {
    await sendPasswordResetEmail(auth, email);
  },

  updateUserProfile: async ({ displayName, phone, cityId }) => {
    const { user } = get();
    if (!user) throw new Error('Giriş gerekli');
    const payload = {
      displayName: displayName?.trim() || '',
      phone: phone?.trim() || '',
      cityId: cityId || 'bursa',
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(db, 'users', user.uid), payload);
    await updateProfile(user, { displayName: payload.displayName });
    const freshProfile = await get()._fetchProfile(user.uid);
    set({ userProfile: freshProfile });
    return freshProfile;
  },

  // Profil yenile (rol değişikliği sonrası kullanılır)
  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const profile = await get()._fetchProfile(user.uid);
    set({ userProfile: profile });
  },

  // Custom claim'leri yeniden yükler (admin rol atadıktan sonra client'ta çağrılır)
  refreshClaims: async () => {
    const { user } = get();
    if (!user) return null;
    const role = await get()._fetchRole(user, true);
    set({ role });
    return role;
  },
}));

export default useAuthStore;
