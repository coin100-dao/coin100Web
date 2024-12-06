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
import web3Reducer from './slices/web3Slice';
import coingeckoReducer from './slices/coingeckoSlice';
import globalReducer from './slices/globalSlice';
import coin100Reducer from './slices/coin100Slice';

// Persist configuration for web3 slice
const persistConfig = {
  key: 'web3',
  storage,
  whitelist: ['walletAddress', 'connectedAt'], // Persist walletAddress and connectedAt
};

// Persisted web3 reducer
const persistedWeb3Reducer = persistReducer(persistConfig, web3Reducer);

// Configure the Redux store
export const store = configureStore({
  reducer: {
    web3: persistedWeb3Reducer,
    coingecko: coingeckoReducer,
    global: globalReducer,
    coin100: coin100Reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Initialize persistor
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
