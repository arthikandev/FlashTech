import axios from "axios";
import { loadToken } from "../utils/tokenStorage.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = loadToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
