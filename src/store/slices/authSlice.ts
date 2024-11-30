// src/store/slices/authSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface ErrorResponse {
  message: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Async thunks for signup and login
export const signup = createAsyncThunk<
  AuthResponse,
  { email: string; password: string; name: string },
  { rejectValue: string }
>('auth/signup', async ({ email, password, name }, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>('/auth/signup', {
      email,
      password,
      name,
    });
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      return rejectWithValue((err.response.data as ErrorResponse).message);
    }
    return rejectWithValue('Signup failed');
  }
});

export const login = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      return rejectWithValue((err.response.data as ErrorResponse).message);
    }
    return rejectWithValue('Login failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
    },
    // Optionally, add more reducers
  },
  extraReducers: (builder) => {
    // Signup
    builder.addCase(signup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      signup.fulfilled,
      (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      }
    );
    builder.addCase(signup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      login.fulfilled,
      (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      }
    );
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
