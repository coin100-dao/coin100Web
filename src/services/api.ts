// src/services/api.ts
import axios, { AxiosInstance } from 'axios';

// Types
export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number;
  current_price: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  last_updated: string;
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
};

export default api;
