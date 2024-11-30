// src/store/slices/plaidSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import axios from 'axios';

// Define the structure of a Plaid bank account
interface PlaidBankAccount {
  account_id: string;
  balances: {
    available: number | null;
    current: number | null;
    iso_currency_code: string | null;
    limit: number | null;
  };
  mask: string;
  name: string;
  official_name: string;
  type: string;
  subtype: string;
}

// Define the initial state for Plaid
interface PlaidState {
  linkToken: string | null;
  accounts: PlaidBankAccount[];
  connecting: boolean;
  fetching: boolean;
  error: string | null;
}

const initialState: PlaidState = {
  linkToken: null,
  accounts: [],
  connecting: false,
  fetching: false,
  error: null,
};

// Async thunk to create a Link token
export const createLinkToken = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>('plaid/createLinkToken', async (_, { rejectWithValue }) => {
  try {
    const response = await api.post('/plaid/create_link_token');
    return response.data.link_token;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      return rejectWithValue(
        (err.response.data as { message: string }).message
      );
    }
    return rejectWithValue('Failed to create Link token');
  }
});

// Async thunk to exchange public token for access token
export const exchangePublicToken = createAsyncThunk<
  void,
  { publicToken: string },
  { rejectValue: string }
>('plaid/exchangePublicToken', async ({ publicToken }, { rejectWithValue }) => {
  try {
    await api.post('/plaid/exchange_public_token', { publicToken });
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      return rejectWithValue(
        (err.response.data as { message: string }).message
      );
    }
    return rejectWithValue('Failed to exchange public token');
  }
});

// Async thunk to fetch Plaid accounts
export const fetchPlaidAccounts = createAsyncThunk<
  PlaidBankAccount[],
  void,
  { rejectValue: string }
>('plaid/fetchPlaidAccounts', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/plaid/accounts');
    return response.data.accounts;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      return rejectWithValue(
        (err.response.data as { message: string }).message
      );
    }
    return rejectWithValue('Failed to fetch bank accounts');
  }
});

const plaidSlice = createSlice({
  name: 'plaid',
  initialState,
  reducers: {
    clearPlaidError(state) {
      state.error = null;
    },
    clearPlaidAccounts(state) {
      state.accounts = [];
    },
  },
  extraReducers: (builder) => {
    // Create Link Token
    builder.addCase(createLinkToken.pending, (state) => {
      state.connecting = true;
      state.error = null;
    });
    builder.addCase(
      createLinkToken.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.connecting = false;
        state.linkToken = action.payload;
      }
    );
    builder.addCase(createLinkToken.rejected, (state, action) => {
      state.connecting = false;
      state.error = action.payload || 'Unable to create Link token';
    });

    // Exchange Public Token
    builder.addCase(exchangePublicToken.pending, (state) => {
      state.connecting = true;
      state.error = null;
    });
    builder.addCase(exchangePublicToken.fulfilled, (state) => {
      state.connecting = false;
    });
    builder.addCase(exchangePublicToken.rejected, (state, action) => {
      state.connecting = false;
      state.error = action.payload || 'Unable to exchange public token';
    });

    // Fetch Plaid Accounts
    builder.addCase(fetchPlaidAccounts.pending, (state) => {
      state.fetching = true;
      state.error = null;
    });
    builder.addCase(
      fetchPlaidAccounts.fulfilled,
      (state, action: PayloadAction<PlaidBankAccount[]>) => {
        state.fetching = false;
        state.accounts = action.payload;
      }
    );
    builder.addCase(fetchPlaidAccounts.rejected, (state, action) => {
      state.fetching = false;
      state.error = action.payload || 'Unable to fetch bank accounts';
    });
  },
});

export const { clearPlaidError, clearPlaidAccounts } = plaidSlice.actions;
export default plaidSlice.reducer;
