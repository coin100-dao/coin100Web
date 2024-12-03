// src/store/slices/coingeckoSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Constants
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

// Define the shape of the state
interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  sparkline_in_7d: {
    price: number[];
  };
}

interface PriceHistoryData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    // Add other fields as needed
  };
  links?: {
    homepage?: string[];
    twitter_screen_name?: string;
  };
  // Add other fields as needed
}

interface CoingeckoState {
  topCoins: CoinMarketData[];
  coinDetails: CoinDetails | null;
  priceHistory: PriceHistoryData | null;
  totalMarketCap: number;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Initial state
const initialState: CoingeckoState = {
  topCoins: [],
  coinDetails: null,
  priceHistory: null,
  totalMarketCap: 0,
  loading: false,
  error: null,
  lastFetched: null,
};

// Helper function for exponential backoff
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> => {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return fetchWithRetry(fetchFn, retries - 1, delay * 2);
  }
};

// Async thunk to fetch top 100 coins
export const fetchTopCoins = createAsyncThunk(
  'coingecko/fetchTopCoins',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { coingecko: CoingeckoState };
      const now = Date.now();

      // Return cached data if it's still fresh
      if (
        state.coingecko.lastFetched &&
        now - state.coingecko.lastFetched < CACHE_DURATION &&
        state.coingecko.topCoins.length > 0
      ) {
        return state.coingecko.topCoins;
      }

      const fetchData = () =>
        axios.get<CoinMarketData[]>(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: 100,
              page: 1,
              sparkline: true,
            },
          }
        );

      const response = await fetchWithRetry(() => fetchData());
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch top coins');
    }
  }
);

// Async thunk to fetch coin details
export const fetchCoinDetails = createAsyncThunk(
  'coingecko/fetchCoinDetails',
  async (coinId: string, { rejectWithValue }) => {
    try {
      const fetchData = () =>
        axios.get<CoinDetails>(
          `https://api.coingecko.com/api/v3/coins/${coinId}`,
          {
            params: {
              localization: false,
              tickers: false,
              market_data: true,
              community_data: false,
              developer_data: false,
              sparkline: false,
            },
          }
        );

      const response = await fetchWithRetry(() => fetchData());
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch coin details');
    }
  }
);

// Async thunk to fetch coin price history
export const fetchCoinPriceHistory = createAsyncThunk(
  'coingecko/fetchCoinPriceHistory',
  async (coinId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: 7,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch price history');
    }
  }
);

// Slice
const coingeckoSlice = createSlice({
  name: 'coingecko',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchTopCoins
    builder.addCase(fetchTopCoins.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTopCoins.fulfilled, (state, action) => {
      state.loading = false;
      state.topCoins = action.payload;
      state.lastFetched = Date.now();
      state.totalMarketCap = action.payload.reduce(
        (sum, coin) => sum + coin.market_cap,
        0
      );
    });
    builder.addCase(fetchTopCoins.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle fetchCoinDetails
    builder.addCase(fetchCoinDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCoinDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.coinDetails = action.payload;
    });
    builder.addCase(fetchCoinDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle fetchCoinPriceHistory
    builder.addCase(fetchCoinPriceHistory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCoinPriceHistory.fulfilled, (state, action) => {
      state.loading = false;
      state.priceHistory = action.payload;
    });
    builder.addCase(fetchCoinPriceHistory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = coingeckoSlice.actions;
export default coingeckoSlice.reducer;
