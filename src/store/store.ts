import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import bookingsReducer from './bookingsSlice';
import chatsReducer from './chatsSlice';
import favoritesReducer from './favoritesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bookings: bookingsReducer,
    chats: chatsReducer,
    favorites: favoritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
