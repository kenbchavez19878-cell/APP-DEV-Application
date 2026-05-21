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
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// ─── OFW Registration ───────────────────────────────────────────────────────

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

// ─── Settings ───────────────────────────────────────────────────────────────

export interface SettingsProfileData {
  full_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  address?: string;
  bio?: string;
}

export interface SettingsSecurityData {
  two_factor_enabled?: boolean;
  session_timeout?: string;
}

export interface SettingsPasswordData {
  current_password: string;
  new_password: string;
}

export interface SettingsNotificationsData {
  email_notifications?: boolean;
  push_notifications?:  boolean;
  sms_notifications?:   boolean;
  new_clients?:         boolean;
  program_updates?:     boolean;
  system_maintenance?:  boolean;
  emergency_requests?:  boolean;
  weekly_reports?:      boolean;
  monthly_reports?:     boolean;
}

export interface SettingsPreferencesData {
  theme?:             "light" | "dark" | "system";
  language?:          string;
  timezone?:          string;
  date_format?:       string;
  items_per_page?:    number;
  default_dashboard?: string;
}

export interface SettingsPrivacyData {
  allow_analytics?:        boolean;
  share_for_research?:     boolean;
  enable_session_logging?: boolean;
  data_retention?:         string;
  show_activity_status?:   boolean;
}

/** GET – fetch settings for the currently authenticated user. Falls back silently so the UI can show defaults. */
export const getSettings = async () => {
  return API.get("user-settings/me/");
};

/** PUT – full upsert of settings for the current user. */
export const upsertSettings = async (payload: Record<string, any>) => {
  return API.put("user-settings/me/", payload);
};

/** PUT – update only profile fields. */
export const updateSettingsProfile = async (data: SettingsProfileData) => {
  return API.put("user-settings/me/profile/", data);
};

/** PUT – update only security fields (no password change). */
export const updateSettingsSecurity = async (data: SettingsSecurityData) => {
  return API.put("user-settings/me/security/", data);
};

/** PUT – change password (+ records history on the backend). */
export const changeSettingsPassword = async (data: SettingsPasswordData) => {
  return API.put("user-settings/me/password/", data);
};

/** PUT – update only notification toggles. */
export const updateSettingsNotifications = async (data: SettingsNotificationsData) => {
  return API.put("user-settings/me/notifications/", data);
};

/** PUT – update only preferences. */
export const updateSettingsPreferences = async (data: SettingsPreferencesData) => {
  return API.put("user-settings/me/preferences/", data);
};

/** PUT – update only privacy settings. */
export const updateSettingsPrivacy = async (data: SettingsPrivacyData) => {
  return API.put("user-settings/me/privacy/", data);
};

/** GET – password change history for the current user. */
export const getSettingsPasswordHistory = async () => {
  return API.get("user-settings/me/password-history/");
};

/* ─── Single default export used for non-settings intercept calls ─────────── */
export default API;