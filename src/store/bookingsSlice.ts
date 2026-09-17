import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { addDays } from '@/data/mockData';

/** A given pro's day fills up once it holds this many of THEIR bookings — a customer can still book as many different pros that same day as they like. */
export const MAX_BOOKINGS_PER_DAY = 3;
const AVAILABILITY_SEARCH_DAYS = 21;

export type Booking = {
  id: string;
  providerId: string;
  name: string;
  role: string;
  imageUrl: string;
  /** YYYY-MM-DD, local — see mockData.ts's dateKey helpers. */
  dateKey: string;
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: [] as Booking[],
  reducers: {
    addBooking: {
      reducer: (state, action: PayloadAction<Booking>) => {
        state.push(action.payload);
      },
      // Booking `id` is generated here, not by callers — Date.now() is an
      // impure call, and createSlice's `prepare` is the one place Redux
      // Toolkit expects that kind of side effect, keeping components pure.
      prepare: (booking: Omit<Booking, 'id'>) => ({
        payload: { ...booking, id: `${booking.providerId}-${Date.now()}` },
      }),
    },
    removeBooking: (state, action: PayloadAction<string>) => {
      return state.filter((booking) => booking.id !== action.payload);
    },
    updateBookingDate: (state, action: PayloadAction<{ id: string; dateKey: string }>) => {
      const booking = state.find((candidate) => candidate.id === action.payload.id);
      if (booking) {
        booking.dateKey = action.payload.dateKey;
      }
    },
  },
});

export const { addBooking, removeBooking, updateBookingDate } = bookingsSlice.actions;
export default bookingsSlice.reducer;

/** How many bookings `providerId` already has on `dateKey` — the Availability picker disables that pro's full days at MAX_BOOKINGS_PER_DAY. */
export function countBookingsOnDate(
  bookings: Booking[],
  providerId: string,
  dateKey: string,
): number {
  return bookings.filter(
    (booking) => booking.providerId === providerId && booking.dateKey === dateKey,
  ).length;
}

/** `fromDateKey` itself if `providerId` still has room on it, otherwise the soonest day after it that does — null if every day in the search window is full for them. */
export function findAvailableDate(
  bookings: Booking[],
  providerId: string,
  fromDateKey: string,
): string | null {
  for (let offset = 0; offset <= AVAILABILITY_SEARCH_DAYS; offset += 1) {
    const candidate = offset === 0 ? fromDateKey : addDays(fromDateKey, offset);
    if (countBookingsOnDate(bookings, providerId, candidate) < MAX_BOOKINGS_PER_DAY) {
      return candidate;
    }
  }
  return null;
}
