// src/services/api.ts
import axios from 'axios';

// Create an Axios instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
