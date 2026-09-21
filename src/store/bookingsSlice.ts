import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import * as bookingsApi from '@/api/bookings';
import { addDays } from '@/data/mockData';

import type { RootState } from './store';

/** A given pro's day fills up once it holds this many of THEIR bookings — a customer can still book as many different pros that same day as they like. */
export const MAX_BOOKINGS_PER_DAY = bookingsApi.MAX_BOOKINGS_PER_DAY;
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

export type BookingsState = {
  items: Booking[];
  status: 'idle' | 'loading' | 'loaded' | 'error';
  error: string | null;
};

const initialState: BookingsState = {
  items: [],
  status: 'idle',
  error: null,
};

function requireToken(state: RootState): string {
  const token = state.auth.token;
  if (!token) {
    throw new Error('Not signed in.');
  }
  return token;
}

export const fetchBookings = createAsyncThunk<Booking[], void, { state: RootState }>(
  'bookings/fetch',
  async (_arg, { getState }) => {
    const { bookings } = await bookingsApi.fetchBookings(requireToken(getState()));
    return bookings;
  },
);

export const addBooking = createAsyncThunk<Booking, Omit<Booking, 'id'>, { state: RootState }>(
  'bookings/add',
  async (input, { getState }) => {
    const { booking } = await bookingsApi.createBooking(requireToken(getState()), input);
    return booking;
  },
);

export const removeBooking = createAsyncThunk<string, string, { state: RootState }>(
  'bookings/remove',
  async (id, { getState }) => {
    await bookingsApi.deleteBooking(requireToken(getState()), id);
    return id;
  },
);

export const updateBookingDate = createAsyncThunk<
  Booking,
  { id: string; dateKey: string },
  { state: RootState }
>('bookings/updateDate', async ({ id, dateKey }, { getState }) => {
  const { booking } = await bookingsApi.updateBookingDate(requireToken(getState()), id, dateKey);
  return booking;
});

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    /** Signing out clears this user's own bookings from memory — the next sign-in fetches fresh. */
    resetBookings: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.status = 'loaded';
        state.items = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Could not load your bookings.';
      })
      .addCase(addBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.items.push(action.payload);
      })
      .addCase(removeBooking.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((booking) => booking.id !== action.payload);
      })
      .addCase(updateBookingDate.fulfilled, (state, action: PayloadAction<Booking>) => {
        const index = state.items.findIndex((booking) => booking.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { resetBookings } = bookingsSlice.actions;
export default bookingsSlice.reducer;

/** How many of `bookings` a given pro already has on `dateKey` — the Availability picker disables that pro's full days at MAX_BOOKINGS_PER_DAY. */
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
