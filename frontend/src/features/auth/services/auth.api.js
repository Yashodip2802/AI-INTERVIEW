import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
});

export const register = async ({ username, email, password }) => {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });

    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const login = async ({ email, password }) => {
  try {
    const response = await api.post("/api/auth/login", { email, password });

    return response.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.get("/api/auth/logout");

    return response.data;
  } catch (error) {
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
