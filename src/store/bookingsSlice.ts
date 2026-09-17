import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { addDays } from '@/data/mockData';

/** A day fills up once it holds this many bookings, across every provider. */
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

/** How many bookings (any provider) already sit on `dateKey` — the Availability picker disables full days at MAX_BOOKINGS_PER_DAY. */
export function countBookingsOnDate(bookings: Booking[], dateKey: string): number {
  return bookings.filter((booking) => booking.dateKey === dateKey).length;
}

/** `fromDateKey` itself if it still has room, otherwise the soonest day after it that does — null if every day in the search window is full. */
export function findAvailableDate(bookings: Booking[], fromDateKey: string): string | null {
  for (let offset = 0; offset <= AVAILABILITY_SEARCH_DAYS; offset += 1) {
    const candidate = offset === 0 ? fromDateKey : addDays(fromDateKey, offset);
    if (countBookingsOnDate(bookings, candidate) < MAX_BOOKINGS_PER_DAY) {
      return candidate;
    }
  }
  return null;
}
