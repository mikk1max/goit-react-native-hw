import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  type Auth,
  browserLocalPersistence,
  getAuth,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyD3AWzhT_w7W8jPnUQgTxQ1UiPgC-AVaRE',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'fixit-app-m.firebaseapp.com',
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'fixit-app-m',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'fixit-app-m.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '350674108658',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    '1:350674108658:web:117663fb817cbe123a106b',
  measurementId:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-2Q7NYGSB0N',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// SecureStore only allows alphanumeric characters, '.', '-', and '_'.
// Firebase Auth uses keys like 'firebase:authUser:<apiKey>:[DEFAULT]',
// which contains colons and brackets. We escape disallowed characters to hex.
function encodeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, (char) => `_${char.charCodeAt(0).toString(16)}_`);
}

const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(encodeKey(key));
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(encodeKey(key), value);
    } catch (err) {
      console.warn('SecureStore setItem failed:', err);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(encodeKey(key));
    } catch (err) {
      console.warn('SecureStore removeItem failed:', err);
    }
  },
};

let auth: Auth;

try {
  if (Platform.OS === 'web') {
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const authModule = require('firebase/auth');
    const getReactNativePersistence = authModule.getReactNativePersistence;
    const persistence = getReactNativePersistence
      ? getReactNativePersistence(secureStorage)
      : undefined;
    auth = initializeAuth(app, {
      persistence,
    });
  }
} catch {
  auth = getAuth(app);
}

export const db = getFirestore(app);
export { app, auth };
