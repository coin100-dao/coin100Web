// src/store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import coingeckoReducer from './slices/coingeckoSlice';
import globalReducer from './slices/globalSlice';
import coin100Reducer from './slices/coin100Slice';
import icoReducer from './slices/icoSlice';
import web3Reducer from './slices/web3Slice';

// Persist configuration for ico slice
const persistConfig = {
  key: 'ico',
  storage,
  whitelist: ['walletAddress'], // Only persist wallet address
};

// Persisted ico reducer
const persistedIcoReducer = persistReducer(persistConfig, icoReducer);

// Configure the Redux store
export const store = configureStore({
  reducer: {
    ico: persistedIcoReducer,
    coingecko: coingeckoReducer,
    global: globalReducer,
    coin100: coin100Reducer,
    web3: web3Reducer,
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
