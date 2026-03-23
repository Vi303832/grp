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
  loading: true,

  // Firebase Auth'u dinler — App mount'ta çağrılır
  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await get()._fetchProfile(firebaseUser.uid);
        set({ user: firebaseUser, userProfile: profile, loading: false });
      } else {
        set({ user: null, userProfile: null, loading: false });
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
    set({ user, userProfile: profile });
    return user;
  },

  login: async ({ email, password }) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const profile = await get()._fetchProfile(user.uid);
    set({ user, userProfile: profile });
    return user;
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, userProfile: null });
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
}));

export default useAuthStore;
