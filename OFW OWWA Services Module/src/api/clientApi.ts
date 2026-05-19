import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/", // Points to your Django backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fetches data for the dashboard stats
export const getDashboardData = async () => {
  return API.get("ofw-registrations/");
};

// Fetches data for the OFW Profiling Table
export const getProfilingData = async () => {
  return API.get("ofw-registrations/");
};

// Backup fetch profile helper
export const getProfiles = async () => {
  return API.get("ofw-registrations/");
};

// Saves a new registration entry
export const saveClientProfile = async (payload: any) => {
  return API.post("ofw-registrations/", payload);
};

export const uploadFiles = async (formData: FormData) => {
  return API.post("ofw-registrations/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default API;