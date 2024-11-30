// src/services/api.ts
import axios from 'axios';

// Create an Axios instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Token getter function
let getToken: () => string | null = () => null;

// Function to set the token getter
export const setTokenGetter = (getter: () => string | null) => {
  getToken = getter;
};

// Request interceptor to set the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers['Authorization']);
    } else {
      delete config.headers['Authorization'];
      console.log('Authorization header removed');
    }
    return config;
  },
  (error) => {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `Response error: ${error.response.status} - ${error.response.statusText}`,
        error.response.data
      );
      if (error.response.status === 401) {
        console.log('Unauthorized! Dispatching logout.');
        // You can emit an event or handle it appropriately
      }
    } else {
      console.error('Response error without status:', error);
    }
    return Promise.reject(error);
  }
);

export default api;
