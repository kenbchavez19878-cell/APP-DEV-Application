import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import {
  Search, Edit, Plus, X, Save, FileText, Eye,
  Shield, MapPin, Phone, Mail, User,
  Check, AlertCircle, Briefcase
} from "lucide-react";
import {
  FormField, TextInput, SelectInput, TextArea,
  DateInput
} from "./AssistanceFormComponents";
import { toast } from "sonner";
import { ClientSearchWidget } from "./ClientSearchWidget";
import {
  getOfficerProfiles, addOfficerProfile,
} from "../../api/clientApi";

interface OWWAOfficer {
  id: string;
  name: string;
  role: string;
  assignedArea: string;
  email: string;
  phone: string;
  avatar: string;
  status: string;
  statusColor: string;
  specialty?: string;
  startDate?: string;
}

export function OWWAOfficerOrganization() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [areaFilter] = useState("all");
  const [selectedOfficer, setSelectedOfficer] = useState<OWWAOfficer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    officePhone: "",
    mobilePhone: "",
    role: "",
    specialty: "",
    assignedRegion: "",
    assignedProvince: "",
    assignedCity: "",
    officeAddress: "",
    employeeId: "",
    startDate: "",
    employmentStatus: "",
    responsibilities: [] as string[],
    notes: ""
  });

  // Officers – loaded from backend on mount, updated via API calls
  const [officers, setOfficers] = useState<OWWAOfficer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string>("");

  // Load all officers from the Django backend on every mount/resume
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError("");
    getOfficerProfiles()
      .then((apiRecords) => {
        if (cancelled) return;
        const mapped = apiRecords.map((r) => ({
          id:             r.id,
          name:           r.name,
          role:           r.role,
          assignedArea:   r.assignedArea,
          email:          r.email,
          phone:          r.mobile_phone || r.office_phone || "—",
          avatar:         "",          // no avatar field in backend – UI falls back to initials
          status:         r.status,
          statusColor:    r.statusColor,
          specialty:      r.specialty || undefined,
          startDate:      r.startDate || undefined,
        }));
        setOfficers(mapped);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch officer profiles:", err);
        setLoadError("Unable to load officer profiles. Retrying…");
        // keep officers as [] – "No officers found" will be shown
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // ── Scroll-lock refs: stabilise the background page's scroll position
  //    across all modal open/close transitions so it never jumps to top.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const savedScrollTopRef = useRef(0);
  const isModalOpenRef = useRef(false);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (!isModalOpenRef.current) {
        savedScrollTopRef.current = container.scrollTop;
      }
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const prevOpen = isModalOpenRef.current;
    isModalOpenRef.current = showAddForm || showProfileDetails;

    if (isModalOpenRef.current && !prevOpen) {
      savedScrollTopRef.current = container.scrollTop;
    } else if (!isModalOpenRef.current && prevOpen) {
      requestAnimationFrame(() => { container.scrollTop = savedScrollTopRef.current; });
    }
    if (!prevOpen) savedScrollTopRef.current = container.scrollTop;
  }, [showAddForm, showProfileDetails]);

  // Pause body scroll while any modal is open so the background can't drift.
  useLayoutEffect(() => {
    const open = showAddForm || showProfileDetails;
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = prev; };
  }, [showAddForm, showProfileDetails]);

  // ── Loading state banners ──────────────────────────────────────────────────
  // filteredOfficers is derived from the officers state (populated by API on mount)
  // ───────────────────────────────────────────────────────────────────────────

  // Officers state – loaded from backend on mount, updated via API calls
  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = 
      (officer.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (officer.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (officer.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || (officer.role || "").toLowerCase().includes(roleFilter.toLowerCase());
    const matchesArea = areaFilter === "all" || (officer.assignedArea || "").includes(areaFilter);
    return matchesSearch && matchesRole && matchesArea;
  });

  const handleViewOfficer = (officer: OWWAOfficer) => {
    setSelectedOfficer(officer);
    setShowProfileDetails(true);
  };

  const handleEditOfficer = (officer: OWWAOfficer) => {
    setSelectedOfficer(officer);

    // Reverse-lookup: human-readable area → region key
    const getRegionFromArea = (area: string): string => {
      const first = area.split(",")[0].toLowerCase().trim();
      for (const [key, label] of Object.entries(regionLabel)) {
        if (first === label.toLowerCase()) return key;
      }
      return "";
    };

    const areaParts = officer.assignedArea.split(",").map(p => p.trim());
    setFormData({
      ...formData,
      fullName: officer.name,
      email: officer.email,
      mobilePhone: officer.phone,
      role: officer.role.toLowerCase().replace(' ', '-'),
      specialty: officer.specialty?.toLowerCase() || '',
      assignedRegion: getRegionFromArea(officer.assignedArea),
      assignedProvince: areaParts[1] || "",
      assignedCity: areaParts[2] || "",
    });
    setShowAddForm(true);
    toast.info(`Editing ${officer.name}`);
  };

  const handleSaveDraft = () => {
    console.log("Saving draft...", formData);
    toast.success("Draft saved successfully!");
  };

  // ── Label conversion helpers ────────────────────────────────────────────
  // Converts stored kebab-case/dropdown values into human-readable labels.
  const toLabel = (s: string) =>
    s
      .split("-")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const contactLabel: Record<string, string> = {
    "regional-director": "Regional Director",
    "welfare-officer": "Welfare Officer",
    "case-officer": "Case Officer",
    "admin-staff": "Admin Staff",
    "legal-officer": "Legal Officer",
  };

  const specialtyLabel: Record<string, string> = {
    repatriation: "Repatriation Services",
    legal: "Legal Assistance",
    crisis: "Crisis Response",
    medical: "Medical Assistance",
    admin: "Administration",
    documentation: "Documentation",
  };

  const regionLabel: Record<string, string> = {
    ncr: "NCR (Metro Manila)",
    "ncr-metro-manila": "NCR (Metro Manila)",
    "region-1": "Region I (Ilocos)",
    "region-3": "Region III (Central Luzon)",
    "region-4a": "Region IV-A (CALABARZON)",
    "region-7": "Region VII (Central Visayas)",
    "region-11": "Region XI (Davao)",
  };

  const statusLabel: Record<string, string> = {
    permanent: "Permanent",
    contractual: "Contractual",
    probationary: "Probationary",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Required-field validation ──────────────────────────────────────────
    if (!formData.fullName.trim()) {
      toast.error("Full Name is required.");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email address is required.");
      return;
    }
    if (!formData.role) {
      toast.error("Role/Position is required.");
      return;
    }
    if (!formData.assignedRegion) {
      toast.error("Assigned Region is required.");
      return;
    }
    if (!formData.startDate) {
      toast.error("Start Date is required.");
      return;
    }
    if (!formData.employmentStatus) {
      toast.error("Employment Status is required.");
      return;
    }
    if (!formData.officeAddress.trim()) {
      toast.error("Office Address is required.");
      return;
    }

    const fullName = formData.fullName.trim();

    // Build a unique client_id from email prefix + short timestamp
    const emailParts = formData.email.trim().split("@");
    const emailPrefix = (emailParts[0] || "officer").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
    const newClientId = `${emailPrefix}-${Date.now().toString(36)}`;

    // Map kebab-case form values → human-readable labels for display
    const roleDisplay    = contactLabel[formData.role]    || toLabel(formData.role);
    const specialtyStr   = formData.specialty
      ? (specialtyLabel[formData.specialty] || toLabel(formData.specialty))
      : "";
    // Payload sent to the Django backend (uses label/display values per model choices)
    const payload: Record<string, any> = {
      client_id:              newClientId,
      full_name:              fullName,
      role_position:          roleDisplay,
      specialty_focus_area:   specialtyStr,
      assigned_region:        formData.assignedRegion,
      assigned_province:      formData.assignedProvince || "",
      assigned_city:          formData.assignedCity || "",
      start_date:             formData.startDate,
      employment_status:      statusLabel[formData.employmentStatus] || formData.employmentStatus,
      office_address:         formData.officeAddress.trim(),
      additional_information: formData.notes || "",
      email:                  formData.email.trim(),
      office_phone:           formData.officePhone || "",
      mobile_phone:           formData.mobilePhone || "",
    };

    setIsSaving(true);
    try {
      await addOfficerProfile(payload);

      // Refresh the list from the backend so all in-flight mutations are reflected
      const fresh = await getOfficerProfiles();
      const mapped = fresh.map((r) => ({
        id:           r.id,
        name:         r.name,
        role:         r.role,
        assignedArea: r.assignedArea,
        email:        r.email,
        phone:        r.mobile_phone || r.office_phone || "—",
        avatar:       "",
        status:       r.status,
        statusColor:  r.statusColor,
        specialty:    r.specialty || undefined,
        startDate:    r.startDate || undefined,
      }));
      setOfficers(mapped);
      toast.success("OWWA officer added successfully!");
      setShowAddForm(false);
    } catch (err: any) {
      console.error("Failed to create officer profile:", err);
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : "Failed to create officer profile. Please try again.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }

    // Reset form fields on close so modal re-opens cleanly
    setFormData({
      fullName: "", email: "", officePhone: "", mobilePhone: "",
      role: "", specialty: "", assignedRegion: "", assignedProvince: "",
      assignedCity: "", officeAddress: "", employeeId: "", startDate: "",
      employmentStatus: "", responsibilities: [], notes: "",
    });
  };

  // Profile Details View - Modal Design
  if (showProfileDetails && selectedOfficer) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowProfileDetails(false)}
      >
        <Card 
          className="bg-white max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-gradient-to-br from-green-500 to-green-700 p-8 text-white relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileDetails(false)}
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              >
                <X className="size-5" />
              </Button>
              
              <div className="flex items-start gap-6">
                <Avatar className="size-24 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-white text-green-600 text-2xl" style={{ fontWeight: 600 }}>
                    {selectedOfficer.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl mb-1" style={{ fontWeight: 600 }}>{selectedOfficer.name}</h2>
                  <p className="text-green-100 mb-3" style={{ fontWeight: 400 }}>ID: {selectedOfficer.id}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={`${selectedOfficer.statusColor} border-0`} style={{ fontWeight: 500 }}>
                      {selectedOfficer.status}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 gap-1.5" style={{ fontWeight: 400 }}>
                      <Shield className="size-3.5" />
                      {selectedOfficer.role}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 gap-1.5" style={{ fontWeight: 400 }}>
                      <MapPin className="size-3.5" />
                      {selectedOfficer.assignedArea}
                    </Badge>
                    {selectedOfficer.specialty && (
                      <Badge className="bg-white/20 text-white border-0" style={{ fontWeight: 400 }}>
                        {selectedOfficer.specialty}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Personal Information</h3>
                  <div className="space-y-3">
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600" style={{ fontWeight: 400 }}>Full Name:</span>
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOfficer.name}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600" style={{ fontWeight: 400 }}>Employee ID:</span>
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOfficer.id}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600" style={{ fontWeight: 400 }}>Email:</span>
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOfficer.email}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600" style={{ fontWeight: 400 }}>Phone:</span>
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOfficer.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Position Information */}
                <div>
                  <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Position Information</h3>
                  <div className="space-y-3">
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600" style={{ fontWeight: 400 }}>Role:</span>
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOfficer.role}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600" style={{ fontWeight: 400 }}>Specialty:</span>
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOfficer.specialty || "N/A"}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600" style={{ fontWeight: 400 }}>Start Date:</span>
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOfficer.startDate || "N/A"}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600" style={{ fontWeight: 400 }}>Status:</span>
                      <Badge className={selectedOfficer.statusColor} style={{ fontWeight: 500 }}>
                        {selectedOfficer.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Assignment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-sm flex justify-between">
                    <span className="text-gray-600" style={{ fontWeight: 400 }}>Assigned Region:</span>
                    <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOfficer.assignedArea}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="text-gray-600" style={{ fontWeight: 400 }}>Employment Type:</span>
                    <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOfficer.status}</span>
                  </div>
                </div>
              </div>

              {/* Office Location */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Office Location</h3>
                <p className="text-sm text-gray-900" style={{ fontWeight: 400 }}>
                  OWWA Regional Office<br />
                  {selectedOfficer.assignedArea}<br />
                  Philippines
                </p>
              </div>

              {/* Key Responsibilities */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Key Responsibilities</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900" style={{ fontWeight: 400 }}>OFW case management and assistance</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900" style={{ fontWeight: 400 }}>Processing of welfare assistance requests</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900" style={{ fontWeight: 400 }}>Coordination with partner agencies</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900" style={{ fontWeight: 400 }}>Documentation and reporting</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add Form View
  const OWWAFormModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddForm(false)}>
      <Card className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-8 py-6 relative">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 size-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="size-5 text-gray-600" />
            </button>
            <h2 className="text-2xl text-gray-900 mb-1">
              Add New OWWA Officer
            </h2>
            <p className="text-gray-600 text-sm">
              Fill in the information to register a new OWWA officer
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)] no-overflow-anchor">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Profiling Search */}
              <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-5">
                <ClientSearchWidget />
              </div>

              {/* Personal Information */}
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-l-purple-500">
                <div className="flex items-center gap-3 mb-5">
                  <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    <p className="text-sm text-gray-600">Officer contact details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
<FormField label="Full Name *" required helperText="Enter full name as shown on official documents">
                    <TextInput
                      placeholder="officer@owwa.gov.ph"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-white border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100/30 h-11"
                    />
                  </FormField>

                  <FormField label="Email Address" required>
                    <TextInput
                      type="email"
                      placeholder="officer@owwa.gov.ph"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-white border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100/30 h-11"
                    />
                  </FormField>
                </div>
              </div>

              {/* Position Details */}
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-l-purple-500">
                <div className="flex items-center gap-3 mb-5">
                  <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Position Details</h3>
                    <p className="text-sm text-gray-600">Role and assignment information</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField label="Role/Position" required>
                    <SelectInput
                      options={[
                        { value: "regional-director", label: "Regional Director" },
                        { value: "welfare-officer", label: "Welfare Officer" },
                        { value: "case-officer", label: "Case Officer" },
                        { value: "admin-staff", label: "Admin Staff" },
                        { value: "legal-officer", label: "Legal Officer" }
                      ]}
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      required
                      className="bg-white border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100/30 h-11"
                    />
                  </FormField>

                  <FormField label="Specialty/Focus Area">
                    <SelectInput
                      options={[
                        { value: "repatriation", label: "Repatriation Services" },
                        { value: "legal", label: "Legal Assistance" },
                        { value: "crisis", label: "Crisis Response" },
                        { value: "medical", label: "Medical Assistance" },
                        { value: "admin", label: "Administration" },
                        { value: "documentation", label: "Documentation" }
                      ]}
                      value={formData.specialty}
                      onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                      className="bg-white border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100/30 h-11"
                    />
                  </FormField>

                  <FormField label="Assigned Region" required>
                    <SelectInput
                      options={[
                        { value: "ncr", label: "NCR (Metro Manila)" },
                        { value: "region-1", label: "Region I (Ilocos)" },
                        { value: "region-3", label: "Region III (Central Luzon)" },
                        { value: "region-4a", label: "Region IV-A (CALABARZON)" },
                        { value: "region-7", label: "Region VII (Central Visayas)" },
                        { value: "region-11", label: "Region XI (Davao)" }
                      ]}
                      value={formData.assignedRegion}
                      onChange={(e) => setFormData({...formData, assignedRegion: e.target.value})}
                      required
                      className="bg-white border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100/30 h-11"
                    />
                  </FormField>

                  <FormField label="Assigned Province">
                    <TextInput
                      placeholder="Province"
                      value={formData.assignedProvince}
                      onChange={(e) => setFormData({...formData, assignedProvince: e.target.value})}
                      className="bg-white border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100/30 h-11"
                    />
                  </FormField>

                  <FormField label="Assigned City">
                    <TextInput
                      placeholder="City/Municipality"
                      value={formData.assignedCity}
                      onChange={(e) => setFormData({...formData, assignedCity: e.target.value})}
                      className="bg-white border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100/30 h-11"
                    />
                  </FormField>

                  <FormField label="Start Date" required>
                    <DateInput
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      max={new Date().toISOString().split('T')[0]}
                      required
                      className="bg-white border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100/30 h-11"
                    />
                  </FormField>

                  <FormField label="Employment Status" required>
                    <SelectInput
                      options={[
                        { value: "permanent", label: "Permanent" },
                        { value: "contractual", label: "Contractual" },
                        { value: "probationary", label: "Probationary" }
                      ]}
                      value={formData.employmentStatus}
                      onChange={(e) => setFormData({...formData, employmentStatus: e.target.value})}
                      required
                      className="bg-white border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100/30 h-11"
                    />
                  </FormField>
                </div>
              </div>

              {/* Office Address */}
              <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-l-orange-500">
                <div className="flex items-center gap-3 mb-5">
                  <div className="size-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPin className="size-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Office Address</h3>
                    <p className="text-sm text-gray-600">Complete office address</p>
                  </div>
                </div>

                <FormField label="Office Address" required>
                  <TextArea
                    placeholder="Complete office address..."
                    value={formData.officeAddress}
                    onChange={(e) => setFormData({...formData, officeAddress: e.target.value})}
                    required
                    className="bg-white border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100/30"
                  />
                </FormField>
              </div>

              {/* Additional Notes */}
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-l-gray-500">
                <div className="flex items-center gap-3 mb-5">
                  <div className="size-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="size-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                    <p className="text-sm text-gray-600">Any additional information</p>
                  </div>
                </div>

                <FormField label="Notes / Remarks">
                  <TextArea
                    placeholder="Any additional information..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="bg-white border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-100/30"
                  />
                </FormField>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="gap-2 hover:bg-gray-50 transition-colors"
              >
                <Save className="size-4" />
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className={`gap-2 transition-colors ${
                  isSaving
                    ? 'bg-blue-400 cursor-not-allowed opacity-70'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                }`}
              >
                <Check className="size-4" />
                {isSaving ? 'Saving…' : 'Add Officer'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (showAddForm) {
    return <OWWAFormModal />;
  }

  // Main List View
  return (
    <div className="h-full bg-gray-50 overflow-y-auto" ref={scrollContainerRef}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                style={{ fontWeight: 400 }}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                style={{ fontWeight: 400 }}
              >
                <option value="all">All Roles</option>
                <option value="welfare">Welfare Officer</option>
                <option value="case">Case Officer</option>
                <option value="director">Regional Director</option>
                <option value="admin">Admin Staff</option>
              </select>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddForm(true)}>
                <Plus className="size-4" />
                Add New Officer
              </Button>
            </div>
          </div>
        </div>

        {/* Table View - No Cards */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Officer Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Role / Specialty
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Assigned Area
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs text-gray-600 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Search className="size-8 text-gray-400 animate-spin" />
                        <p className="text-sm text-gray-500">Loading officer profiles…</p>
                      </div>
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="size-12 text-amber-500" />
                        <p className="text-amber-600" style={{ fontWeight: 500 }}>{loadError}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.reload()}
                          className="mt-1"
                        >
                          Retry
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : filteredOfficers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="size-12 text-gray-400" />
                        <p className="text-gray-500" style={{ fontWeight: 400 }}>No officers found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOfficers.map((officer) => (
                    <tr key={officer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10 border border-gray-200">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm" style={{ fontWeight: 600 }}>
                              {officer.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{officer.name}</p>
                            <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>{officer.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900" style={{ fontWeight: 400 }}>{officer.role}</p>
                        <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>{officer.specialty || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-gray-500" />
                          <p className="text-sm text-gray-900" style={{ fontWeight: 400 }}>{officer.assignedArea}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Mail className="size-3.5 text-gray-500" />
                            <p className="text-xs text-gray-900" style={{ fontWeight: 400 }}>{officer.email}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="size-3.5 text-gray-500" />
                            <p className="text-xs text-gray-900" style={{ fontWeight: 400 }}>{officer.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={officer.statusColor} style={{ fontWeight: 500 }}>
                          {officer.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOfficer(officer)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                          >
                            <Eye className="size-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOfficer(officer)}
                            className="h-8 w-8 p-0 hover:bg-green-50"
                          >
                            <Edit className="size-4 text-green-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p style={{ fontWeight: 400 }}>
            Showing <span style={{ fontWeight: 600 }}>{filteredOfficers.length}</span> of <span style={{ fontWeight: 600 }}>{officers.length}</span> officers
          </p>
        </div>
      </div>
    </div>
  );
}