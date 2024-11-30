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
import { setTokenGetter } from '../services/api';
import authReducer from './slices/authSlice';
import plaidReducer from './slices/plaidSlice';
import fincityReducer from './slices/fincitySlice';

// Persist configuration for auth slice
const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user'], // Persist token and user data
};

// Persisted auth reducer
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    plaid: plaidReducer,
    fincity: fincityReducer,
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

// **Set the token getter for Axios**
setTokenGetter(() => store.getState().auth.token);

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
