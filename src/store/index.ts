import { configureStore } from '@reduxjs/toolkit';

import authReducer from '@/slice/authSlice';
import barangReducer from '@/slice/barangSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    barang: barangReducer,
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
