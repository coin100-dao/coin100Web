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
import coingeckoReducer from './slices/coingeckoSlice';
import globalReducer from './slices/globalSlice';
import coin100Reducer from './slices/coin100Slice';
import web3Reducer from './slices/web3Slice';
import publicSaleReducer from './slices/publicSaleSlice';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    coingecko: coingeckoReducer,
    global: globalReducer,
    coin100: coin100Reducer,
    web3: web3Reducer,
    publicSale: publicSaleReducer,
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
