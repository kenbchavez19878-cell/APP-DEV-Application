import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getDashboardData = async () => {
  return API.get("api/clients");
};

export const getProfilingData = async () => {
  return API.get("api/clients");
};

// ✅ ADD THIS (FIX YOUR ERROR)
export const getProfiles = async () => {
  return API.get("api/clients/");
};

export const saveClientProfile = async (payload: any) => {
  return API.post("clients/save/", payload);
};

export const uploadFiles = async (formData: FormData) => {
  return API.post("clientprofiling/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default API;