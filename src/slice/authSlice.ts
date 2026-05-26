import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';

import api from '@/axiosInstance';
import { clearAuthSession, getStoredAuthSession, saveAuthSession } from '@/store/authStorage';
import type { User } from '@/types/User';

export type RegisterPayload = {
  nama: string;
  email: string;
  nim_nip: string;
  fakultas: string;
  prodi: string;
  password: string;
};

export type LoginPayload = {
  nim_nip: string;
  password: string;
  device_name: string;
};

type AuthSuccessResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    token_type: string;
    user: User;
  };
};

type LogoutResponse = {
  status: boolean;
  message: string;
  data: null;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  currentAction: 'login' | 'register' | 'logout' | 'hydrate' | null;
  message: string | null;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoading: false,
  currentAction: null,
  message: null,
  error: null,
};

function extractApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;
    console.log(error)
    if (typeof responseData?.message === 'string' && responseData.message.trim()) {
      return responseData.message;
    }

    if (responseData?.errors && typeof responseData.errors === 'object') {
      const firstError = Object.values(responseData.errors)[0];
      if (Array.isArray(firstError) && typeof firstError[0] === 'string') {
        return firstError[0];
      }
      if (typeof firstError === 'string') {
        return firstError;
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export const hydrateAuth = createAsyncThunk(
  'auth/hydrate',
  async (_, { rejectWithValue }) => {
    try {
      return await getStoredAuthSession();
    } catch {
      return rejectWithValue('Gagal memuat sesi login.');
    }
  }
);

export const registerUser = createAsyncThunk<
  AuthSuccessResponse,
  RegisterPayload,
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthSuccessResponse>('/register', payload);
    const result = response.data;

    await saveAuthSession(result.data.token, result.data.user);

    return result;
  } catch (error) {
    return rejectWithValue(
      extractApiErrorMessage(error, 'Registrasi gagal. Silakan coba lagi.')
    );
  }
});

export const loginUser = createAsyncThunk<
  AuthSuccessResponse,
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthSuccessResponse>('/login', payload);
    const result = response.data;

    await saveAuthSession(result.data.token, result.data.user);

    return result;
  } catch (error) {
    return rejectWithValue(
      extractApiErrorMessage(error, 'Login gagal. Periksa kembali kredensial Anda.')
    );
  }
});

export const logoutUser = createAsyncThunk<
  LogoutResponse,
  void,
  { rejectValue: string }
>('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const response = await api.post<LogoutResponse>('/logout');

    await clearAuthSession();

    return response.data;
  } catch (error) {
    return rejectWithValue(
      extractApiErrorMessage(error, 'Logout gagal. Silakan coba lagi.')
    );
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    clearAuthMessage(state) {
      state.message = null;
    },
    resetAuthState(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.currentAction = null;
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.pending, (state) => {
        state.isLoading = true;
        state.currentAction = 'hydrate';
        state.error = null;
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAction = null;
        state.isHydrated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = Boolean(action.payload.token && action.payload.user);
      })
      .addCase(hydrateAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.currentAction = null;
        state.isHydrated = true;
        state.error =
          typeof action.payload === 'string' ? action.payload : 'Gagal memuat sesi login.';
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.currentAction = 'register';
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAction = null;
        state.token = action.payload.data.token;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.message = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.currentAction = null;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Registrasi gagal. Silakan coba lagi.';
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.currentAction = 'login';
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAction = null;
        state.token = action.payload.data.token;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.message = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.currentAction = null;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Login gagal. Periksa kembali kredensial Anda.';
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.currentAction = 'logout';
        state.error = null;
        state.message = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAction = null;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.message = action.payload.message;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.currentAction = null;
        state.error =
          typeof action.payload === 'string' ? action.payload : 'Logout gagal. Silakan coba lagi.';
      });
  },
});

export const { clearAuthError, clearAuthMessage, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
