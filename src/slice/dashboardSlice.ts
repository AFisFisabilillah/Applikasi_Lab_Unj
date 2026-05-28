import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';

import api from '@/axiosInstance';
import type { DashboardData } from '@/types/Dashboard';

type DashboardResponse = {
  status: string;
  data: DashboardData;
};

type DashboardState = {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: DashboardState = {
  data: null,
  isLoading: false,
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

export const fetchDashboard = createAsyncThunk<
  DashboardResponse,
  void,
  { rejectValue: string }
>('dashboard/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<DashboardResponse>('/dashboard');

    return response.data;
  } catch (error) {
    return rejectWithValue(
      extractApiErrorMessage(error, 'Gagal memuat data dashboard. Silakan coba lagi.')
    );
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError(state) {
      state.error = null;
    },
    resetDashboardState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Gagal memuat data dashboard. Silakan coba lagi.';
      });
  },
});

export const { clearDashboardError, resetDashboardState } = dashboardSlice.actions;

export default dashboardSlice.reducer;
