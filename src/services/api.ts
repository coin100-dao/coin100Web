// src/services/api.ts
import axios, { AxiosInstance } from 'axios';

// Types
export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Create an Axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_API_BASE_URL,
  headers: {
    'x-api-key': import.meta.env.VITE_REACT_API_KEY,
  },
});

// API methods
export const coinApi = {
  getAllCoins: async (
    period: string = '5m'
  ): Promise<ApiResponse<CoinData[]>> => {
    const response = await api.get<ApiResponse<CoinData[]>>('/api/coins', {
      params: { period },
    });
    return response.data;
  },

  getCoinBySymbol: async (
    symbol: string,
    period: string = '5m'
  ): Promise<ApiResponse<CoinData>> => {
    const response = await api.get<ApiResponse<CoinData>>(
      `/api/coins/?symbol=${symbol}`,
      {
        params: { period },
      }
    );
    return response.data;
  },

  getTotalMarketCap: async (
    period: string = '5m'
  ): Promise<
    ApiResponse<{ timestamp: string; total_market_cap: string }[]>
  > => {
    const response = await api.get<
      ApiResponse<{ timestamp: string; total_market_cap: string }[]>
    >('/api/coins/market/total', {
      params: { period },
    });
    return response.data;
  },
};

export default api;
