import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const LOCAL = '192.168.0.50:4000';
const WEB = 'server-heald-production-a5c8.up.railway.app'; 
// const PROD = 'server.rivascript';

const API_BASE_URL = `https://${WEB}`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;