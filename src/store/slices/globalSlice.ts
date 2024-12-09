import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

interface GlobalState {
  themeMode: 'light' | 'dark';
}

const initialState: GlobalState = {
  themeMode: 'light', // default theme
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.themeMode = action.payload;
    },
  },
});

const persistConfig = {
  key: 'global',
  storage,
  whitelist: ['themeMode'],
};

export const { setThemeMode } = globalSlice.actions;

export default persistReducer(persistConfig, globalSlice.reducer);
