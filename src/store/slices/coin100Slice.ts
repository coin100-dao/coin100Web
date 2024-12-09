// src/store/slices/coin100Slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { coinApi, CoinData } from '../../services/api';

// Types
interface CoinHistory {
  prices: number[];
  volumes: number[];
  timestamps: number[];
  start: string;
  end: string;
  lastUpdated: number;
}

interface CoinHistoryMap {
  [key: string]: CoinHistory;
}

interface TotalMarketCapData {
  timestamp: string;
  total_market_cap: string;
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
  totalMarketCapData: TotalMarketCapData[];
  loadingTotalMarketCap: boolean;
  totalMarketCapError: string | null;
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
  totalMarketCapData: [],
  loadingTotalMarketCap: false,
  totalMarketCapError: null,
};

interface FetchCoinBySymbolParams {
  symbol: string;
  start: string;
  end: string;
}

interface FetchCoinBySymbolResult {
  data: CoinData;
  symbol: string;
  timestamp: number;
}

// Async thunks
export const fetchAllCoins = createAsyncThunk<
  CoinData[],
  { start: string; end: string },
  { rejectValue: string }
>('coin100/fetchAllCoins', async ({ start, end }, { rejectWithValue }) => {
  try {
    const response = await coinApi.getAllCoins(start, end);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error || 'Failed to fetch coins');
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('An unknown error occurred');
  }
});

export const fetchCoinBySymbol = createAsyncThunk<
  FetchCoinBySymbolResult,
  FetchCoinBySymbolParams,
  { rejectValue: string }
>(
  'coin100/fetchCoinBySymbol',
  async ({ symbol, start, end }, { rejectWithValue }) => {
    try {
      const response = await coinApi.getCoinBySymbol(symbol, start, end);
      if (response.success && response.data) {
        return {
          data: response.data,
          symbol,
          timestamp: Date.now(),
        };
      }
      return rejectWithValue(response.error || 'Failed to fetch coin data');
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const fetchTotalMarketCap = createAsyncThunk<
  TotalMarketCapData[],
  { start: string; end: string },
  { rejectValue: string }
>(
  'coin100/fetchTotalMarketCap',
  async ({ start, end }, { rejectWithValue }) => {
    try {
      const response = await coinApi.getTotalMarketCap(start, end);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(
        response.error || 'Failed to fetch total market cap data'
      );
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const coin100Slice = createSlice({
  name: 'coin100',
  initialState,
  reducers: {
    clearError(state: Coin100State) {
      state.error = null;
    },
    clearSelectedCoin(state: Coin100State) {
      state.selectedCoin = null;
    },
    setSelectedCoin(state: Coin100State, action: PayloadAction<CoinData>) {
      state.selectedCoin = action.payload;
    },
    clearCoinHistory(state: Coin100State, action: PayloadAction<string>) {
      const symbol = action.payload;
      if (state.coinHistory[symbol]) {
        state.coinHistory[symbol] = {
          prices: [],
          volumes: [],
          timestamps: [],
          start: '',
          end: '',
          lastUpdated: 0,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllCoins
      .addCase(fetchAllCoins.pending, (state: Coin100State) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCoins.fulfilled, (state: Coin100State, action) => {
        state.loading = false;
        state.allCoins = action.payload;
        state.error = null;
      })
      .addCase(fetchAllCoins.rejected, (state: Coin100State, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Failed to fetch coins';
      })
      // fetchCoinBySymbol
      .addCase(fetchCoinBySymbol.pending, (state: Coin100State, action) => {
        const symbol = action.meta.arg.symbol;
        state.loadingSymbols[symbol] = true;
        state.error = null;
      })
      .addCase(fetchCoinBySymbol.fulfilled, (state: Coin100State, action) => {
        const { symbol, timestamp, data } = action.payload;
        const { start, end } = action.meta.arg;
        state.loadingSymbols[symbol] = false;
        state.lastSymbolFetch[symbol] = timestamp;
        state.selectedCoin = data;

        // Initialize coin history if it doesn't exist
        if (!state.coinHistory[symbol]) {
          state.coinHistory[symbol] = {
            prices: [],
            volumes: [],
            timestamps: [],
            start: '',
            end: '',
            lastUpdated: 0,
          };
        }

        const history = state.coinHistory[symbol];
        const timeSinceLastUpdate = timestamp - history.lastUpdated;

        // Only update if period changed or enough time has passed (5 seconds)
        if (
          history.start !== start ||
          history.end !== end ||
          timeSinceLastUpdate >= 5000
        ) {
          if (history.start !== start || history.end !== end) {
            // Reset history for new period
            history.prices = [data.current_price];
            history.volumes = [data.total_volume];
            history.timestamps = [timestamp];
          } else {
            // Add new data point
            history.prices.push(data.current_price);
            history.volumes.push(data.total_volume);
            history.timestamps.push(timestamp);

            // Keep only last 100 data points
            const maxDataPoints = 100;
            if (history.prices.length > maxDataPoints) {
              history.prices = history.prices.slice(-maxDataPoints);
              history.volumes = history.volumes.slice(-maxDataPoints);
              history.timestamps = history.timestamps.slice(-maxDataPoints);
            }
          }

          history.start = start;
          history.end = end;
          history.lastUpdated = timestamp;
        }
      })
      .addCase(fetchCoinBySymbol.rejected, (state: Coin100State, action) => {
        const symbol = action.meta.arg.symbol;
        state.loadingSymbols[symbol] = false;
        state.error =
          action.payload ?? 'An error occurred while fetching coin data';
      })
      // fetchTotalMarketCap
      .addCase(fetchTotalMarketCap.pending, (state: Coin100State) => {
        state.loadingTotalMarketCap = true;
        state.totalMarketCapError = null;
      })
      .addCase(fetchTotalMarketCap.fulfilled, (state: Coin100State, action) => {
        state.loadingTotalMarketCap = false;
        state.totalMarketCapData = action.payload;
      })
      .addCase(fetchTotalMarketCap.rejected, (state: Coin100State, action) => {
        state.loadingTotalMarketCap = false;
        state.totalMarketCapError =
          action.payload ?? 'Failed to fetch total market cap';
      });
  },
});

export const {
  clearError,
  clearSelectedCoin,
  setSelectedCoin,
  clearCoinHistory,
} = coin100Slice.actions;
export default coin100Slice.reducer;
