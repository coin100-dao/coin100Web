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
  loadingSymbols: { [key: string]: boolean }; // Track loading state per symbol
  error: string | null;
  lastFetched: number | null;
  lastSymbolFetch: { [key: string]: number }; // Track last fetch time per symbol
}

// Initial state
const initialState: Coin100State = {
  allCoins: [],
  selectedCoin: null,
  coinHistory: {},
  loading: false,
  loadingSymbols: {},
  error: null,
  lastFetched: null,
  lastSymbolFetch: {},
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
      .addCase(fetchCoinBySymbol.pending, (state, action) => {
        const symbol = action.meta.arg.symbol;
        state.loadingSymbols[symbol] = true;
        state.error = null;
      })
      .addCase(fetchCoinBySymbol.fulfilled, (state, action) => {
        const { symbol, period, timestamp, data } = action.payload;
        state.loadingSymbols[symbol] = false;
        state.lastSymbolFetch[symbol] = timestamp;
        state.selectedCoin = data;

        // Initialize coin history if it doesn't exist
        if (!state.coinHistory[symbol]) {
          state.coinHistory[symbol] = {
            prices: [],
            timestamps: [],
            period: '',
            lastUpdated: 0,
          };
        }

        const history = state.coinHistory[symbol];
        const timeSinceLastUpdate = timestamp - history.lastUpdated;

        // Only update if period changed or enough time has passed
        if (history.period !== period || timeSinceLastUpdate >= 5000) {
          if (history.period !== period) {
            // Reset history for new period
            history.prices = [data.current_price];
            history.timestamps = [timestamp];
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

          history.period = period;
          history.lastUpdated = timestamp;
        }
      })
      .addCase(fetchCoinBySymbol.rejected, (state, action) => {
        const symbol = action.meta.arg.symbol;
        state.loadingSymbols[symbol] = false;
        state.error =
          action.payload ?? 'An error occurred while fetching coin data';
      });
  },
});

export const { clearError, clearSelectedCoin, clearCoinHistory } =
  coin100Slice.actions;
export default coin100Slice.reducer;
