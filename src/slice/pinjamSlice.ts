import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';

import api from '@/axiosInstance';
import type { Pinjam } from '@/types/Pinjam';

type PinjamResponse = {
  success: boolean;
  message: string;
  data: Pinjam[];
};

type PinjamState = {
  items: Pinjam[];
  isLoading: boolean;
  message: string | null;
  error: string | null;
};

const initialState: PinjamState = {
  items: [],
  isLoading: false,
  message: null,
  error: null,
};

function extractApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;

    if (typeof responseData?.message === 'string' && responseData.message.trim()) {
      return responseData.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export const fetchPinjams = createAsyncThunk<
  PinjamResponse,
  void,
  { rejectValue: string }
>('pinjam/fetchPinjams', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<PinjamResponse>('/pinjams');

    return response.data;
  } catch (error) {
    return rejectWithValue(
      extractApiErrorMessage(error, 'Gagal memuat riwayat pinjam. Silakan coba lagi.')
    );
  }
});

const pinjamSlice = createSlice({
  name: 'pinjam',
  initialState,
  reducers: {
    clearPinjamError(state) {
      state.error = null;
    },
    clearPinjamMessage(state) {
      state.message = null;
    },
    resetPinjamState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPinjams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchPinjams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(fetchPinjams.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Gagal memuat riwayat pinjam. Silakan coba lagi.';
      });
  },
});

export const { clearPinjamError, clearPinjamMessage, resetPinjamState } =
  pinjamSlice.actions;

export default pinjamSlice.reducer;
