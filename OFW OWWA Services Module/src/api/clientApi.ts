import axios from "axios";

// Type for officer records returned by /api/officer-profiles/
export interface OWWAOfficerApiRecord {
  id: string;
  client_id: string;
  name: string;
  role: string;
  specialty?: string;
  assigned_region: string;
  assigned_province: string;
  assigned_city: string;
  assignedArea: string;
  employment_status: string;
  status: string;
  statusColor: string;
  startDate?: string;
  email: string;
  office_phone: string;
  mobile_phone: string;
  office_address: string;
  additional_information: string;
  created_at?: string;
  updated_at?: string;
}

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

// Authenticates against Django's User model and returns JWT tokens
export const login = async (payload: { username: string; password: string }) => {
  return API.post("login/", payload);
};

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

// Updates an existing registration entry
export const updateClientProfile = async (id: string, payload: any) => {
  return API.put(`ofw-registrations/${id}/`, payload);
};

export const uploadFiles = async (formData: FormData) => {
  return API.post("ofw-registrations/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ─── OWWA Officer Profiles ─────────────────────────────────────────────────────

function roleLabelFromApi(r: string): string {
  return roleLabelMap[r] || r;
}
function specialtyLabelFromApi(s: string): string {
  return specialtyLabelMap[s] || s;
}
function regionLabelFromApi(reg: string): string {
  return regionLabelMap[reg] || reg;
}

const roleLabelMap: Record<string, string> = {
  "Regional Director": "Regional Director",
  "Welfare Officer":    "Welfare Officer",
  "Case Officer":       "Case Officer",
  "Admin Staff":        "Admin Staff",
  "Legal Officer":      "Legal Officer",
};
const specialtyLabelMap: Record<string, string> = {
  "Repatriation Services":  "Repatriation Services",
  "Legal Assistance":       "Legal Assistance",
  "Crisis Response":        "Crisis Response",
  "Medical Assistance":     "Medical Assistance",
  "Administration":         "Administration",
  "Documentation":          "Documentation",
};
const regionLabelMap: Record<string, string> = {
  "region-1":  "Region I (Ilocos Region)",
  "region-2":  "Region II (Cagayan Valley)",
  "region-3":  "Region III (Central Luzon)",
  "region-4a": "Region IV-A (CALABARZON)",
  "region-4b": "Region IV-B (MIMAROPA)",
  "region-5":  "Region V (Bicol Region)",
  "region-6":  "Region VI (Western Visayas)",
  "region-7":  "Region VII (Central Visayas)",
  "region-8":  "Region VIII (Eastern Visayas)",
  "region-9":  "Region IX (Zamboanga Peninsula)",
  "region-10": "Region X (Northern Mindanao)",
  "region-11": "Region XI (Davao Region)",
  "region-12": "Region XII (SOCCSKSARGEN)",
  "region-13": "Region XIII (Caraga)",
  "car":       "Cordillera Administrative Region (CAR)",
  "ncr":       "National Capital Region (NCR)",
  "barmm":     "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)",
};

/** GET /api/officer-profiles/ – list all officer records */
export const getOfficerProfiles = async (): Promise<OWWAOfficerApiRecord[]> => {
  const { data } = await API.get("officer-profiles/");
  return Array.isArray(data) ? data.map(mapOfficerFromApi) : [];
};

/** POST /api/officer-profiles/ – create a new officer */
export const addOfficerProfile = async (payload: Record<string, any>): Promise<OWWAOfficerApiRecord> => {
  const { data } = await API.post("officer-profiles/", payload);
  return mapOfficerFromApi(data);
};

/** PUT /api/officer-profiles/{id}/ – full update of an existing officer */
export const updateOfficerProfile = async (id: string, payload: Record<string, any>): Promise<OWWAOfficerApiRecord> => {
  const { data } = await API.put(`officer-profiles/${id}/`, payload);
  return mapOfficerFromApi(data);
};

/** DELETE /api/officer-profiles/{id}/ – remove an officer record */
export const deleteOfficerProfile = async (id: string): Promise<void> => {
  await API.delete(`officer-profiles/${id}/`);
};

/** Convert a hyphen/underscore/slug string to readable Title Case. */
function toTitleCase(s: string): string {
  return s
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Internal: convert a raw DRF response record into the typed display shape. */
function mapOfficerFromApi(r: any): OWWAOfficerApiRecord {
  const id = r.client_id || "";
  const displayName = r.full_name?.trim() || id;
  const startDate = r.start_date
    ? new Date(r.start_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : undefined;
  const rawRegion = r.assigned_region || "";
  const assignedRegion = regionLabelMap[rawRegion] || rawRegion;
  const provinceDisplay = toTitleCase(r.assigned_province || "");
  const cityDisplay     = toTitleCase(r.assigned_city     || "");
  const assignedArea = [assignedRegion, provinceDisplay, cityDisplay].filter(Boolean).join(", ");
  return {
    id,
    client_id: id,
    name: displayName,
    role: roleLabelMap[r.role_position] || r.role_position || "",
    specialty: specialtyLabelMap[r.specialty_focus_area] || r.specialty_focus_area || "",
    assigned_region: rawRegion,
    assigned_province: r.assigned_province || "",
    assigned_city: r.assigned_city || "",
    assignedArea,
    employment_status: r.employment_status || "",
    status: r.employment_status || "",
    statusColor:
      r.employment_status === "Permanent"
        ? "bg-green-100 text-green-700"
        : r.employment_status === "Contractual"
          ? "bg-blue-100 text-blue-700"
          : "bg-amber-100 text-amber-700",
    startDate,
    email: r.email || "",
    office_phone: r.office_phone || "",
    mobile_phone: r.mobile_phone || "",
    office_address: r.office_address || "",
    additional_information: r.additional_information || "",
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

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