import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { ApiError } from './client';
import { auth, db } from './firebase';

export type AuthUser = {
  id: string;
  name: string;
  firstName?: string;
  surname?: string;
  gender?: string;
  email: string;
  createdAt: string;
};

type AuthResponse = { token: string; user: AuthUser };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatAuthError(error: unknown): Error {
  if (error instanceof ApiError) return error;
  const code = (error as { code?: string })?.code;
  switch (code) {
    case 'auth/email-already-in-use':
      return new ApiError(409, 'An account with this email already exists.');
    case 'auth/invalid-email':
      return new ApiError(400, 'Enter a valid email address.');
    case 'auth/weak-password':
      return new ApiError(400, 'Password must be at least 6 characters.');
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return new ApiError(401, 'Incorrect email or password.');
    case 'auth/network-request-failed':
      return new ApiError(
        0,
        'Could not reach the server. Check your connection and try again.',
      );
    default:
      return error instanceof Error
        ? error
        : new ApiError(500, 'An unexpected authentication error occurred.');
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (trimmedName.length < 2) {
    throw new ApiError(400, 'Enter your name.');
  }
  if (!EMAIL_RE.test(trimmedEmail)) {
    throw new ApiError(400, 'Enter a valid email address.');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters.');
  }

  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      trimmedEmail,
      password,
    );
    await updateFirebaseProfile(cred.user, { displayName: trimmedName });

    const userData: AuthUser = {
      id: cred.user.uid,
      name: trimmedName,
      email: trimmedEmail,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', cred.user.uid), userData);
    const token = await cred.user.getIdToken();
    return { token, user: userData };
  } catch (error) {
    throw formatAuthError(error);
  }
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const trimmedEmail = email.trim().toLowerCase();

  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      trimmedEmail,
      password,
    );
    const userDocRef = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(userDocRef);

    let userData: AuthUser;
    if (snap.exists()) {
      const data = snap.data();
      userData = {
        id: cred.user.uid,
        name: data.name || cred.user.displayName || 'User',
        email: data.email || cred.user.email || trimmedEmail,
        createdAt: data.createdAt || new Date().toISOString(),
      };
    } else {
      userData = {
        id: cred.user.uid,
        name: cred.user.displayName || trimmedEmail.split('@')[0] || 'User',
        email: cred.user.email || trimmedEmail,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, userData, { merge: true });
    }

    const token = await cred.user.getIdToken();
    return { token, user: userData };
  } catch (error) {
    throw formatAuthError(error);
  }
}

export async function fetchMe(_token?: string): Promise<{ user: AuthUser }> {
  let currentUser = auth.currentUser;
  if (!currentUser) {
    currentUser = await new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        unsubscribe();
        resolve(u);
      });
      setTimeout(() => resolve(null), 3000);
    });
  }

  if (!currentUser) {
    throw new ApiError(401, 'Not authenticated.');
  }

  const userDocRef = doc(db, 'users', currentUser.uid);
  const snap = await getDoc(userDocRef);

  if (snap.exists()) {
    const data = snap.data();
    const fullName = data.name || currentUser.displayName || 'User';
    const parts = fullName.split(' ');
    return {
      user: {
        id: currentUser.uid,
        name: fullName,
        firstName: data.firstName ?? parts[0] ?? '',
        surname: data.surname ?? parts.slice(1).join(' ') ?? '',
        gender: data.gender ?? undefined,
        email: data.email || currentUser.email || '',
        createdAt: data.createdAt || new Date().toISOString(),
      },
    };
  }

  const fallbackUser: AuthUser = {
    id: currentUser.uid,
    name:
      currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
    email: currentUser.email || '',
    createdAt: new Date().toISOString(),
  };
  await setDoc(userDocRef, fallbackUser, { merge: true });
  return { user: fallbackUser };
}

export type UpdateProfileInput =
  | string
  | {
      name?: string;
      firstName?: string;
      surname?: string;
      gender?: string;
    };

export async function updateProfile(
  _token: string,
  input: UpdateProfileInput,
): Promise<{ user: AuthUser }> {
  let firstName = '';
  let surname = '';
  let gender: string | undefined;
  let fullName = '';

  if (typeof input === 'string') {
    fullName = input.trim();
    const parts = fullName.split(' ');
    firstName = parts[0] || '';
    surname = parts.slice(1).join(' ') || '';
  } else {
    firstName = input.firstName?.trim() ?? '';
    surname = input.surname?.trim() ?? '';
    gender = input.gender?.trim();
    fullName = [firstName, surname].filter(Boolean).join(' ') || input.name?.trim() || '';
  }

  if (fullName.length < 2) {
    throw new ApiError(400, 'Enter your name.');
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new ApiError(401, 'Not authenticated.');
  }

  await updateFirebaseProfile(currentUser, { displayName: fullName });
  const userDocRef = doc(db, 'users', currentUser.uid);
  const patch: Record<string, unknown> = {
    name: fullName,
    firstName,
    surname,
  };
  if (gender !== undefined) {
    patch.gender = gender;
  }
  await setDoc(userDocRef, patch, { merge: true });

  const snap = await getDoc(userDocRef);
  const data = snap.data();

  return {
    user: {
      id: currentUser.uid,
      name: fullName,
      firstName,
      surname,
      gender: data?.gender ?? gender,
      email: data?.email || currentUser.email || '',
      createdAt: data?.createdAt || new Date().toISOString(),
    },
  };
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
