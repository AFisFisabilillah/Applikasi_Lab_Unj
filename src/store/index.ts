import { configureStore } from '@reduxjs/toolkit';

import authReducer from '@/slice/authSlice';
import barangReducer from '@/slice/barangSlice';
import dashboardReducer from '@/slice/dashboardSlice';
import pinjamReducer from '@/slice/pinjamSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    barang: barangReducer,
    dashboard: dashboardReducer,
    pinjam: pinjamReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: {
        warnAfter: 64,
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
