// src/store/slices/coingeckoSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the shape of the state
interface CoinGeckoState {
  topCoins: CoinMarketData[];
  coinDetails: CoinDetails | null;
  totalMarketCap: number;
  loading: boolean;
  error: string | null;
}

interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  // Add other fields as needed
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
    // Add other fields as needed
  };
  // Add other fields as needed
}

// Initial state
const initialState: CoinGeckoState = {
  topCoins: [],
  coinDetails: null,
  totalMarketCap: 0,
  loading: false,
  error: null,
};

// Async thunk to fetch top 100 coins
export const fetchTopCoins = createAsyncThunk<
  CoinMarketData[],
  void,
  { rejectValue: string }
>('coingecko/fetchTopCoins', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<CoinMarketData[]>(
      'https://api.coingecko.com/api/v3/coins/markets',
      {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 100,
          page: 1,
          sparkline: false,
        },
      }
    );
    console.log(response);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return rejectWithValue(error.response.statusText);
    }
    return rejectWithValue('Failed to fetch top coins');
  }
});

// Async thunk to fetch coin details
export const fetchCoinDetails = createAsyncThunk<
  CoinDetails,
  string,
  { rejectValue: string }
>('coingecko/fetchCoinDetails', async (coinId, { rejectWithValue }) => {
  try {
    const response = await axios.get<CoinDetails>(
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
    console.log(response);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return rejectWithValue(error.response.statusText);
    }
    return rejectWithValue('Failed to fetch coin details');
  }
});

// Slice
const coingeckoSlice = createSlice({
  name: 'coingecko',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle fetchTopCoins
    builder.addCase(fetchTopCoins.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchTopCoins.fulfilled,
      (state, action: PayloadAction<CoinMarketData[]>) => {
        state.loading = false;
        state.topCoins = action.payload;
        state.totalMarketCap = action.payload.reduce(
          (sum, coin) => sum + coin.market_cap,
          0
        );
      }
    );
    builder.addCase(fetchTopCoins.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to fetch top coins';
    });

    // Handle fetchCoinDetails
    builder.addCase(fetchCoinDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchCoinDetails.fulfilled,
      (state, action: PayloadAction<CoinDetails>) => {
        state.loading = false;
        state.coinDetails = action.payload;
      }
    );
    builder.addCase(fetchCoinDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to fetch coin details';
    });
  },
});

export default coingeckoSlice.reducer;
