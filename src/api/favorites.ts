import { doc, getDoc, setDoc } from 'firebase/firestore';

import { db } from './firebase';

/**
 * Fetch favorite pro IDs for a given user from Firestore.
 */
export async function fetchUserFavorites(userId: string): Promise<string[]> {
  if (!userId) return [];
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data.favorites) ? data.favorites : [];
}

/**
 * Persist favorite pro IDs for a user to Firestore.
 */
export async function saveUserFavorites(userId: string, favorites: string[]): Promise<void> {
  if (!userId) return;
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { favorites }, { merge: true });
}
