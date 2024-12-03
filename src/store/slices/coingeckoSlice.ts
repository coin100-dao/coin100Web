// src/store/slices/coingeckoSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Constants
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
  };
  links?: {
    homepage?: string[];
    twitter_screen_name?: string;
  };
}

interface GlobalMarketData {
  total_market_cap: { [key: string]: number };
  total_volume: { [key: string]: number };
  market_cap_percentage: { [key: string]: number };
  market_cap_change_percentage_24h_usd: number;
}

interface GlobalHistoricalData {
  market_caps: [number, number][];
  volumes: [number, number][];
  timestamps: number[];
}

interface GlobalHistoricalDataByRange {
  [timeRange: string]: {
    market_caps: [number, number][];
    timestamps: number[];
    lastFetched: number;
  };
}

interface CoingeckoState {
  topCoins: CoinMarketData[];
  coinDetails: CoinDetails | null;
  priceHistory: PriceHistoryData | null;
  totalMarketCap: number;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  selectedCoinId: string | null;
  historicalData: {
    [key: string]: {
      prices: [number, number][];
      lastFetched: number;
    };
  };
  globalMarketData: GlobalMarketData | null;
  globalHistoricalData: GlobalHistoricalData | null;
  globalDataLastFetched: number | null;
  globalHistoricalDataByRange: GlobalHistoricalDataByRange;
}

const initialState: CoingeckoState = {
  topCoins: [],
  coinDetails: null,
  priceHistory: null,
  totalMarketCap: 0,
  loading: false,
  error: null,
  lastFetched: null,
  selectedCoinId: null,
  historicalData: {},
  globalMarketData: null,
  globalHistoricalData: null,
  globalDataLastFetched: null,
  globalHistoricalDataByRange: {},
};

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

// Async thunk to fetch top 100 coins with sparkline data
export const fetchTopCoins = createAsyncThunk(
  'coingecko/fetchTopCoins',
  async (_, { rejectWithValue }) => {
    try {
      const fetchData = async () => {
        return axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 100,
            page: 1,
            sparkline: true,
            price_change_percentage: '24h',
          },
        });
      };

      const response = await fetchWithRetry(() => fetchData());
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Async thunk to fetch historical data for a specific coin
export const fetchCoinHistory = createAsyncThunk(
  'coingecko/fetchCoinHistory',
  async (
    { coinId, days = 30 }: { coinId: string; days?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days,
            interval: days > 90 ? 'daily' : 'hourly',
          },
        }
      );
      return { coinId, data: response.data };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Async thunk to fetch detailed coin data
export const fetchCoinDetails = createAsyncThunk(
  'coingecko/fetchCoinDetails',
  async (coinId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
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
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Async thunk to fetch global market data
export const fetchGlobalMarketData = createAsyncThunk(
  'coingecko/fetchGlobalMarketData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/global'
      );
      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Async thunk to fetch historical market cap data for a specific time range
export const fetchHistoricalMarketCap = createAsyncThunk(
  'coingecko/fetchHistoricalMarketCap',
  async (
    timeRange: '24h' | '7d' | '30d' | '90d' | '1y',
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/global/market_caps/chart?vs_currency=usd&days=${timeRange}`
      );

      return {
        timeRange,
        data: {
          market_caps: response.data.market_caps,
          timestamps: response.data.market_caps.map(
            (item: [number, number]) => item[0]
          ),
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const coingeckoSlice = createSlice({
  name: 'coingecko',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setSelectedCoin(state, action) {
      state.selectedCoinId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Top coins reducers
      .addCase(fetchTopCoins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopCoins.fulfilled, (state, action) => {
        state.loading = false;
        state.topCoins = action.payload;
        state.lastFetched = Date.now();
        state.totalMarketCap = action.payload.reduce(
          (sum: number, coin: { market_cap: number }) => sum + coin.market_cap,
          0
        );
      })
      .addCase(fetchTopCoins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Coin history reducers
      .addCase(fetchCoinHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoinHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.historicalData[action.payload.coinId] = {
          prices: action.payload.data.prices,
          lastFetched: Date.now(),
        };
      })
      .addCase(fetchCoinHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Coin details reducers
      .addCase(fetchCoinDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoinDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.coinDetails = action.payload;
      })
      .addCase(fetchCoinDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Global market data reducers
      .addCase(fetchGlobalMarketData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalMarketData.fulfilled, (state, action) => {
        state.loading = false;
        state.globalMarketData = action.payload;
        state.globalDataLastFetched = Date.now();
      })
      .addCase(fetchGlobalMarketData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Historical market cap data reducers
      .addCase(fetchHistoricalMarketCap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistoricalMarketCap.fulfilled, (state, action) => {
        const { timeRange, data } = action.payload;
        state.globalHistoricalDataByRange[timeRange] = {
          market_caps: data.market_caps,
          timestamps: data.timestamps,
          lastFetched: Date.now(),
        };
        state.loading = false;
      })
      .addCase(fetchHistoricalMarketCap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedCoin } = coingeckoSlice.actions;
export default coingeckoSlice.reducer;
