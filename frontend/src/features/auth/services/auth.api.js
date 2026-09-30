import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async ({ username, email, password }) => {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });

    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const login = async ({ email, password }) => {
  try {
    const response = await api.post("/api/auth/login", { email, password });

    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.get("/api/auth/logout");
    localStorage.removeItem("token");
    return response.data;
  } catch (error) {
    localStorage.removeItem("token");
    console.error("Error logging out user:", error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await api.get("/api/auth/get-me");

    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
