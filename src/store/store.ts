// src/store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import globalReducer from './slices/globalSlice';
import coin100Reducer from './slices/coin100Slice';
import publicSaleReducer from './slices/publicSaleSlice';
import coin100ActivityReducer from './slices/coin100ActivitySlice';
import walletReducer from './slices/walletSlice';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    global: globalReducer,
    coin100: coin100Reducer,
    publicSale: publicSaleReducer,
    coin100Activity: coin100ActivityReducer,
    wallet: walletReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Initialize persistor
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
