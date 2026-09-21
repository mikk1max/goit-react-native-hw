import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import type { Booking } from '@/store/bookingsSlice';

import { ApiError } from './client';
import { auth, db } from './firebase';

export const MAX_BOOKINGS_PER_DAY = 3;

type NewBooking = Omit<Booking, 'id'>;

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** How many of THIS user's bookings a given pro already holds on `dateKey`, excluding `excludeId`. */
async function countOnDate(
  userId: string,
  providerId: string,
  dateKey: string,
  excludeId?: string,
): Promise<number> {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    where('providerId', '==', providerId),
    where('dateKey', '==', dateKey),
  );
  const snap = await getDocs(q);
  if (!excludeId) {
    return snap.size;
  }
  return snap.docs.filter((d) => d.id !== excludeId).length;
}

export async function fetchBookings(
  _token: string,
): Promise<{ bookings: Booking[] }> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new ApiError(401, 'Not authenticated.');
  }

  const q = query(collection(db, 'bookings'), where('userId', '==', uid));
  const snap = await getDocs(q);

  const bookings: (Booking & { createdAt?: string })[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      providerId: data.providerId,
      name: data.name,
      role: data.role,
      imageUrl: data.imageUrl,
      dateKey: data.dateKey,
      createdAt: data.createdAt,
    };
  });

  bookings.sort((a, b) => {
    const cmp = a.dateKey.localeCompare(b.dateKey);
    if (cmp !== 0) return cmp;
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });

  return {
    bookings: bookings.map(
      ({ id, providerId, name, role, imageUrl, dateKey }) => ({
        id,
        providerId,
        name,
        role,
        imageUrl,
        dateKey,
      }),
    ),
  };
}

export async function createBooking(
  _token: string,
  booking: NewBooking,
): Promise<{ booking: Booking }> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new ApiError(401, 'Not authenticated.');
  }

  const { providerId, name, role, imageUrl, dateKey } = booking;
  if (
    !providerId ||
    !name ||
    !role ||
    !imageUrl ||
    !DATE_KEY_RE.test(dateKey ?? '')
  ) {
    throw new ApiError(400, 'Missing or invalid booking details.');
  }

  const bookedCount = await countOnDate(uid, providerId, dateKey);
  if (bookedCount >= MAX_BOOKINGS_PER_DAY) {
    throw new ApiError(
      409,
      'That pro is fully booked for this day — pick another day.',
    );
  }

  const docRef = await addDoc(collection(db, 'bookings'), {
    userId: uid,
    providerId,
    name,
    role,
    imageUrl,
    dateKey,
    createdAt: new Date().toISOString(),
  });

  return {
    booking: {
      id: docRef.id,
      providerId,
      name,
      role,
      imageUrl,
      dateKey,
    },
  };
}

export async function updateBookingDate(
  _token: string,
  id: string,
  dateKey: string,
): Promise<{ booking: Booking }> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new ApiError(401, 'Not authenticated.');
  }

  if (!DATE_KEY_RE.test(dateKey ?? '')) {
    throw new ApiError(400, 'Missing or invalid date.');
  }

  const bookingRef = doc(db, 'bookings', id);
  const snap = await getDoc(bookingRef);
  if (!snap.exists() || snap.data().userId !== uid) {
    throw new ApiError(404, 'Booking not found.');
  }

  const bookingData = snap.data();
  const bookedCount = await countOnDate(
    uid,
    bookingData.providerId,
    dateKey,
    id,
  );
  if (bookedCount >= MAX_BOOKINGS_PER_DAY) {
    throw new ApiError(
      409,
      'That pro is fully booked for this day — pick another day.',
    );
  }

  await updateDoc(bookingRef, { dateKey });

  return {
    booking: {
      id,
      providerId: bookingData.providerId,
      name: bookingData.name,
      role: bookingData.role,
      imageUrl: bookingData.imageUrl,
      dateKey,
    },
  };
}

export async function deleteBooking(
  _token: string,
  id: string,
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new ApiError(401, 'Not authenticated.');
  }

  const bookingRef = doc(db, 'bookings', id);
  const snap = await getDoc(bookingRef);
  if (!snap.exists() || snap.data().userId !== uid) {
    throw new ApiError(404, 'Booking not found.');
  }

  await deleteDoc(bookingRef);
}
