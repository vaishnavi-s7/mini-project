import axios from "axios";

/**
 * Shared Axios client for all frontend requests.
 * The base URL points at the local backend API by default.
 */
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/**
 * Attach the current auth token to each request when available.
 */
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
