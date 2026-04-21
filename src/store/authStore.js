import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = credential;

    await updateProfile(user, { displayName });

    const profile = {
      displayName,
      email,
      phone: phone ?? '',
      cityId: 'bursa',
      role: 'user',
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), profile);
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
