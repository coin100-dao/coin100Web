// src/store/slices/coin100Slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { coinApi, CoinData } from '../../services/api';

// Types
interface CoinHistory {
  prices: number[];
  timestamps: number[];
  period: string;
  lastUpdated: number;
}

interface CoinHistoryMap {
  [key: string]: CoinHistory;
}

interface Coin100State {
  allCoins: CoinData[];
  selectedCoin: CoinData | null;
  coinHistory: CoinHistoryMap;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Initial state
const initialState: Coin100State = {
  allCoins: [],
  selectedCoin: null,
  coinHistory: {},
  loading: false,
  error: null,
  lastFetched: null,
};

interface FetchCoinBySymbolParams {
  symbol: string;
  period: string;
}

// Async thunks
export const fetchAllCoins = createAsyncThunk<
  CoinData[],
  string,
  { rejectValue: string }
>(
  'coin100/fetchAllCoins',
  async (period: string = '5m', { rejectWithValue }) => {
    try {
      const response = await coinApi.getAllCoins(period);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Failed to fetch coins');
      }
      // console.log(response.data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ error?: string }>;
      return rejectWithValue(
        axiosError.response?.data?.error || 'Failed to fetch coins'
      );
    }
  }
);

interface FetchCoinBySymbolResult {
  data: CoinData;
  symbol: string;
  period: string;
  timestamp: number;
}

export const fetchCoinBySymbol = createAsyncThunk<
  FetchCoinBySymbolResult,
  FetchCoinBySymbolParams,
  { rejectValue: string }
>(
  'coin100/fetchCoinBySymbol',
  async ({ symbol, period = '5m' }, { rejectWithValue }) => {
    try {
      const response = await coinApi.getCoinBySymbol(symbol, period);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Failed to fetch coin data');
      }

      return {
        data: response.data,
        symbol,
        period,
        timestamp: Date.now(),
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ error?: string }>;
      return rejectWithValue(
        axiosError.response?.data?.error || 'Failed to fetch coin data'
      );
    }
  }
);

const coin100Slice = createSlice({
  name: 'coin100',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSelectedCoin(state) {
      state.selectedCoin = null;
    },
    clearCoinHistory(state, action: PayloadAction<string>) {
      delete state.coinHistory[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllCoins
      .addCase(fetchAllCoins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCoins.fulfilled, (state, action) => {
        state.loading = false;
        state.allCoins = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAllCoins.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? 'An error occurred while fetching coins';
      })
      // fetchCoinBySymbol
      .addCase(fetchCoinBySymbol.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoinBySymbol.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCoin = action.payload.data;

        // Initialize coin history if it doesn't exist
        const { symbol, period, timestamp, data } = action.payload;
        if (!state.coinHistory[symbol]) {
          state.coinHistory[symbol] = {
            prices: [],
            timestamps: [],
            period: '',
            lastUpdated: 0,
          };
        }

        const history = state.coinHistory[symbol];

        // Reset history if period changed or last update was more than 1 minute ago
        if (
          history.period !== period ||
          timestamp - history.lastUpdated > 60000
        ) {
          history.prices = [data.current_price];
          history.timestamps = [timestamp];
          history.period = period;
          history.lastUpdated = timestamp;
        } else {
          // Append new data point
          history.prices.push(data.current_price);
          history.timestamps.push(timestamp);

          // Keep only last 100 data points
          if (history.prices.length > 100) {
            history.prices = history.prices.slice(-100);
            history.timestamps = history.timestamps.slice(-100);
          }
        }
      })
      .addCase(fetchCoinBySymbol.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? 'An error occurred while fetching coin data';
      });
  },
});

export const { clearError, clearSelectedCoin, clearCoinHistory } =
  coin100Slice.actions;
export default coin100Slice.reducer;
