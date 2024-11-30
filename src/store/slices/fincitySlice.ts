// src/store/slices/fincitySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import axios from 'axios';

// Define the structure of a bank account
export interface BankAccount {
  id: string; // Changed from bigint to string
  fincityAccountId: string;
  accountName: string;
  accountType: string;
  connectionStatus: string;
  createdAt: string;
  updatedAt: string;
}

// Define the structure of a transaction
export interface Transaction {
  id: string; // Changed from bigint to string
  fincityTransactionId: string;
  amount: number;
  currency: string;
  description?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

// Define the initial state for Fincity
interface FincityState {
  accounts: BankAccount[];
  transactions: { [key: string]: Transaction[] }; // Keyed by accountId
  loading: boolean;
  error: string | null;
}

const initialState: FincityState = {
  accounts: [],
  transactions: {},
  loading: false,
  error: null,
};

// Async thunk to connect a bank account
export const connectBankAccount = createAsyncThunk<
  { redirectUrl: string; accountId: string },
  void,
  { rejectValue: string }
>('fincity/connectBankAccount', async (_, { rejectWithValue }) => {
  try {
    const response = await api.post('/fincity/connect');
    console.log('connectBankAccount response:', response.data);
    return {
      redirectUrl: response.data.redirectUrl,
      accountId: response.data.accountId,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      console.error('connectBankAccount error response:', err.response.data);
      return rejectWithValue(
        (err.response.data as { message: string }).message
      );
    }
    console.error('connectBankAccount unknown error:', err);
    return rejectWithValue('Failed to connect bank account');
  }
});

// Async thunk to fetch connected bank accounts
export const fetchFincityAccounts = createAsyncThunk<
  BankAccount[],
  void,
  { rejectValue: string }
>('fincity/fetchFincityAccounts', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/fincity/accounts');
    console.log('fetchFincityAccounts response:', response.data);
    return response.data.accounts;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      console.error('fetchFincityAccounts error response:', err.response.data);
      return rejectWithValue(
        (err.response.data as { message: string }).message
      );
    }
    console.error('fetchFincityAccounts unknown error:', err);
    return rejectWithValue('Failed to fetch bank accounts');
  }
});

// Async thunk to fetch transactions for a specific account
export const fetchFincityTransactions = createAsyncThunk<
  { accountId: string; transactions: Transaction[] },
  string, // accountId
  { rejectValue: string }
>(
  'fincity/fetchFincityTransactions',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/fincity/accounts/${accountId}/transactions`
      );
      console.log(`fetchFincityTransactions for ${accountId}:`, response.data);
      return {
        accountId,
        transactions: response.data.transactions,
      };
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        console.error(
          `fetchFincityTransactions error response for ${accountId}:`,
          err.response.data
        );
        return rejectWithValue(
          (err.response.data as { message: string }).message
        );
      }
      console.error(
        `fetchFincityTransactions unknown error for ${accountId}:`,
        err
      );
      return rejectWithValue('Failed to fetch transactions');
    }
  }
);

const fincitySlice = createSlice({
  name: 'fincity',
  initialState,
  reducers: {
    clearFincityError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Connect Bank Account
    builder.addCase(connectBankAccount.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(connectBankAccount.fulfilled, (state) => {
      state.loading = false;
      // No direct state update needed as we redirect the user
    });
    builder.addCase(connectBankAccount.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Unable to connect bank account';
    });

    // Fetch Fincity Accounts
    builder.addCase(fetchFincityAccounts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchFincityAccounts.fulfilled,
      (state, action: PayloadAction<BankAccount[]>) => {
        state.loading = false;
        state.accounts = action.payload;
      }
    );
    builder.addCase(fetchFincityAccounts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Unable to fetch bank accounts';
    });

    // Fetch Fincity Transactions
    builder.addCase(fetchFincityTransactions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchFincityTransactions.fulfilled,
      (
        state,
        action: PayloadAction<{
          accountId: string;
          transactions: Transaction[];
        }>
      ) => {
        state.loading = false;
        const { accountId, transactions } = action.payload;
        state.transactions[accountId] = transactions;
      }
    );
    builder.addCase(fetchFincityTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Unable to fetch transactions';
    });
  },
});

export const { clearFincityError } = fincitySlice.actions;
export default fincitySlice.reducer;
