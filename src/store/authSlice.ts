import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

import type { AuthUser } from '@/api/auth';
import { fetchMe, login, logout, register, updateProfile } from '@/api/auth';

/**
 * The user auth token is stored in SecureStore (iOS Keychain / Android Keystore),
 * keeping the session securely encrypted at rest.
 */
const TOKEN_KEY = 'fixit-auth-token';

export type AuthStatus = 'bootstrapping' | 'guest' | 'authenticated';

export type AuthState = {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  /** Only for the sign-in/sign-up forms — cleared on the next attempt. */
  formError: string | null;
  formPending: boolean;
};

const initialState: AuthState = {
  status: 'bootstrapping',
  token: null,
  user: null,
  formError: null,
  formPending: false,
};

/** Runs once at app start — restores a saved session, or falls back to guest. */
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token) {
    return null;
  }
  try {
    const { user } = await fetchMe(token);
    return { token, user };
  } catch {
    // Saved token is stale/invalid — drop it and continue as a guest rather
    // than getting stuck retrying it on every launch.
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return null;
  }
});

export const loginUser = createAsyncThunk(
  'auth/login',
  async (input: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { token, user } = await login(input.email, input.password);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      return { token, user };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Could not sign in.');
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (input: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const { token, user } = await register(input.name, input.email, input.password);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      return { token, user };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Could not create your account.');
    }
  },
);

export const updateUserName = createAsyncThunk(
  'auth/updateName',
  async (name: string, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: AuthState };
    if (!auth.token) {
      return rejectWithValue('Not signed in.');
    }
    try {
      const { user } = await updateProfile(auth.token, name);
      return user;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Could not update your profile.');
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    input: { firstName?: string; surname?: string; name?: string; gender?: string },
    { getState, rejectWithValue },
  ) => {
    const { auth } = getState() as { auth: AuthState };
    if (!auth.token) {
      return rejectWithValue('Not signed in.');
    }
    try {
      const { user } = await updateProfile(auth.token, input);
      return user;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Could not update your profile.');
    }
  },
);

/** Clears the saved session. */
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await logout();
  await SecureStore.deleteItemAsync(TOKEN_KEY);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthFormError: (state) => {
      state.formError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = 'authenticated';
          state.token = action.payload.token;
          state.user = action.payload.user;
        } else {
          state.status = 'guest';
        }
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.status = 'guest';
      })
      .addCase(loginUser.pending, (state) => {
        state.formPending = true;
        state.formError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.formPending = false;
        state.status = 'authenticated';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.formPending = false;
        state.formError = (action.payload as string) ?? 'Could not sign in.';
      })
      .addCase(registerUser.pending, (state) => {
        state.formPending = true;
        state.formError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.formPending = false;
        state.status = 'authenticated';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.formPending = false;
        state.formError = (action.payload as string) ?? 'Could not create your account.';
      })
      .addCase(updateUserName.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'guest';
        state.token = null;
        state.user = null;
      });
  },
});

export const { clearAuthFormError } = authSlice.actions;
export default authSlice.reducer;
