import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchUserFavorites, saveUserFavorites } from '@/api/favorites';
import type { RootState } from './store';

export type FavoritesState = {
  favoriteIds: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
};

const initialState: FavoritesState = {
  favoriteIds: [],
  status: 'idle',
};

/** Load favorites for current user from Firestore */
export const loadFavorites = createAsyncThunk(
  'favorites/load',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    if (!userId) return [];
    return fetchUserFavorites(userId);
  },
);

/** Toggle favorite status for a pro, persisting to Firestore if user is authenticated */
export const toggleFavorite = createAsyncThunk(
  'favorites/toggle',
  async (providerId: string, { getState }) => {
    const state = getState() as RootState;
    const current = state.favorites.favoriteIds;
    const exists = current.includes(providerId);
    const next = exists
      ? current.filter((id) => id !== providerId)
      : [...current, providerId];

    const userId = state.auth.user?.id;
    if (userId) {
      // Background save to Firestore
      saveUserFavorites(userId, next).catch((err) => {
        if (__DEV__) console.warn('[favorites] save error:', err);
      });
    }

    return next;
  },
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.favoriteIds = [];
      state.status = 'idle';
    },
    setFavoriteIds: (state, action) => {
      state.favoriteIds = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFavorites.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.favoriteIds = action.payload;
      })
      .addCase(loadFavorites.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.favoriteIds = action.payload;
      });
  },
});

export const { clearFavorites, setFavoriteIds } = favoritesSlice.actions;
export default favoritesSlice.reducer;
