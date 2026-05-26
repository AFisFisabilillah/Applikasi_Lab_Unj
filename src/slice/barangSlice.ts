import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';

import api from '@/axiosInstance';
import type { Barang } from '@/types/Barang';

type FetchBarangParams = {
  search?: string;
  size?: number;
  page?: number;
};

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type BarangLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

type BarangMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
};

type BarangResponse = {
  data: Barang[];
  links: BarangLinks;
  meta: BarangMeta;
};

type BarangState = {
  items: Barang[];
  links: BarangLinks | null;
  meta: BarangMeta | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  search: string;
  pageSize: number;
};

const initialState: BarangState = {
  items: [],
  links: null,
  meta: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  search: '',
  pageSize: 10,
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

export const fetchBarang = createAsyncThunk<
  BarangResponse,
  FetchBarangParams | undefined,
  { rejectValue: string }
>('barang/fetchBarang', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get<BarangResponse>('/barang', {
      params: {
        search: params?.search ?? '',
        size: params?.size,
        page: params?.page,
      },
    });

    return response.data;
  } catch (error) {
    return rejectWithValue(
      extractApiErrorMessage(error, 'Gagal memuat data barang. Silakan coba lagi.')
    );
  }
});

const barangSlice = createSlice({
  name: 'barang',
  initialState,
  reducers: {
    clearBarangError(state) {
      state.error = null;
    },
    resetBarangState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBarang.pending, (state, action) => {
        const requestedPage = action.meta.arg?.page ?? 1;
        state.isLoading = requestedPage === 1;
        state.isLoadingMore = requestedPage > 1;
        state.error = null;
        state.search = action.meta.arg?.search ?? '';
        state.pageSize = action.meta.arg?.size ?? state.pageSize;
      })
      .addCase(fetchBarang.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        const currentPage = action.payload.meta.current_page;
        state.items =
          currentPage > 1 ? [...state.items, ...action.payload.data] : action.payload.data;
        state.links = action.payload.links;
        state.meta = action.payload.meta;
      })
      .addCase(fetchBarang.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Gagal memuat data barang. Silakan coba lagi.';
      });
  },
});

export const { clearBarangError, resetBarangState } = barangSlice.actions;

export default barangSlice.reducer;
