import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const LOCAL = '192.168.0.27:3000';
// const WEB = 'server-heald.onrender.com'; 
// const PROD = 'server.rivascript';

const API_BASE_URL = `http://${LOCAL}`;

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