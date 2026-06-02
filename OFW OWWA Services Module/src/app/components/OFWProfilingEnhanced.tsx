import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { 
  Search, Filter, ChevronDown, Plus, X, Save, FileText, Eye, Edit,
  Download, Globe, Ship, Briefcase, Calendar, MapPin, User,
  Upload, ArrowLeft, Check, AlertCircle, TrendingUp, Activity
} from "lucide-react";
import {
  FormSection, FormField, TextInput, SelectInput, TextArea,
  DateInput, InfoAlert, RadioGroup, WarningAlert
} from "./AssistanceFormComponents";
import { toast } from "sonner";
import { ClientSearchWidget } from "./ClientSearchWidget";
import { getProfilingData, saveClientProfile, updateClientProfile } from "../../api/clientApi";

interface OFWRecord {
   id: string;
   dbId?: string;
   rawFirstName?: string;
   rawLastName?: string;
   name: string;
   profileType: string;
   country: string;
   workerType: "Land-based" | "Sea-based";
   owwaStatus: "Active" | "Expired" | "N/A";
   status: string;
   statusColor: string;
   avatar: string;
   agency?: string;
   occupation?: string;
   contractExpiry?: string;
   birthDate?: string;
   gender?: string;
   civilStatus?: string;
   nationality?: string;
   phone?: string;
   email?: string;
   address?: string;
   contractStart?: string;
   contractEnd?: string;
   owwaMembershipNo?: string;
   owwaValidityDate?: string;
   emergencyContactName?: string;
   emergencyRelationship?: string;
   emergencyContactNumber?: string;
 }

export default function OFWProfiling() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [workerTypeFilter, setWorkerTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedOFW, setSelectedOFW] = useState<OFWRecord | null>(null);

// Form state
   const [formData, setFormData] = useState({
     // Personal Information
     lastName: "",
     firstName: "",
     middleName: "",
     suffix: "",
     birthDate: "",
     gender: "",
     civilStatus: "",
     nationality: "Filipino",
     contactNumber: "",
     email: "",
     address: "",
     
     // Employment Details
     workerType: "land-based" as "land-based" | "sea-based" | "",
     country: "",
     city_abroad: "",
     occupation: "",
     jobTitle: "",
     agency: "",
     agencyLicenseNo: "",
     
     // Contract Details
     contractStartDate: "",
     contractEndDate: "",
     contractDuration: "",
     monthlyIncome: 0,
     currency: "USD",
     
     // OWWA Membership
     owwaMembershipStatus: "active",
     owwaMembershipNo: "",
     owwaValidityDate: "",
     
     // Emergency Contact
     emergencyContactName: "",
     emergencyRelationship: "",
     emergencyContactNumber: "",
     emergencyAddress: "",
     
     // Sea-based Specific
     vesselName: "",
     vesselType: "",
     rank: "",
     seaServiceYears: 0,
     
     // Additional
     skillsQualifications: [] as string[],
     notes: ""
   });

  // Helper to format date from YYYY-MM-DD to readable format
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // ── Scroll-lock refs: keep the main list's scroll position stable
  //    across all modal open/close transitions so the page never "jumps to top".
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const savedScrollTopRef = useRef(0);
  const isModalOpenRef = useRef(false);

  // Capture scroll top whenever the scroll container is about to lose focus
  // (i.e. a modal is opening) and restore it when the modal closes.
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      // Only capture when a modal is NOT open — if a modal IS open we never
      // want to update the saved position from background scroll.
      if (!isModalOpenRef.current) {
        savedScrollTopRef.current = container.scrollTop;
      }
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  // Watch for modal state changes: capture on open, restore on close.
  // useLayoutEffect runs BEFORE paint so the restore is visible with zero flicker.
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const prevOpen = isModalOpenRef.current;
    isModalOpenRef.current = showAddForm || showProfileDetails;

    if (isModalOpenRef.current && !prevOpen) {
      // Modal just opened — save the current scroll position before anything
      // else in this render pass can shift the container.
      savedScrollTopRef.current = container.scrollTop;
    } else if (!isModalOpenRef.current && prevOpen) {
      // Modal just closed — restore the scroll to the saved position.
      requestAnimationFrame(() => {
        container.scrollTop = savedScrollTopRef.current;
      });
    }
    // Run once at mount so we pick up whatever scroll the page landed at.
    if (!prevOpen) savedScrollTopRef.current = container.scrollTop;
  }, [showAddForm, showProfileDetails]);

  // Live OFW data from backend
  const [ofws, setOfws] = useState<OFWRecord[]>([]);
  const [ofwsLoading, setOfwsLoading] = useState(true);
  const [editingOFWId, setEditingOFWId] = useState<string | null>(null);

// Helpers – keep DRY and consistent across load + submit flows
   const mapBackend = (r: any): OFWRecord => ({
     id: String(r.client_id || r.id),
     dbId: r.client_id || r.id, // client_id is the primary key
     rawFirstName: r.first_name || "",
     rawLastName: r.last_name || "",
     name: `${r.last_name || ""}, ${r.first_name || ""}`.trim() || "—",
     profileType: "Individual Profile",
     country: r.country_of_deployment || r.country || "—",
     workerType: (r.worker_type === "Sea-based" ? "Sea-based" : "Land-based") as "Land-based" | "Sea-based",
     owwaStatus: (r.owwa_membership_status === "Active" ? "Active"
       : r.owwa_membership_status === "Expired" ? "Expired"
       : "N/A") as "Active" | "Expired" | "N/A",
     status: "Active",
     statusColor: "bg-green-100 text-green-700",
     avatar: ((r as any).first_name?.[0] || "O") + ((r as any).last_name?.[0] || "F"),
     agency: r.recruitment_agency || r.agency || undefined,
     occupation: r.occupation_position || r.occupation || undefined,
     contractExpiry: undefined,
     birthDate: r.birth_date || undefined,
     gender: r.gender || undefined,
     civilStatus: r.civil_status || undefined,
     nationality: r.nationality || "Filipino",
     phone: r.phone_number || undefined,
     email: r.email || undefined,
     address: r.address || undefined,
     contractStart: r.contract_start || undefined,
     contractEnd: r.contract_end || undefined,
     owwaMembershipNo: r.membership_number || undefined,
     owwaValidityDate: r.validity_date || undefined,
     emergencyContactName: r.emergency_contact_name || undefined,
     emergencyRelationship: r.relationship || undefined,
     emergencyContactNumber: r.emergency_contact_number || undefined,
   });

  const loadOFWs = async () => {
    setOfwsLoading(true);
    try {
      const res: any = await getProfilingData();
      // Axios response = { data: [...] } or { count, results: [...] } from
      // Django REST Framework pagination – support both shapes.
      const raw = (res as any)?.data ?? (res as any)?.results ?? [];
      if (Array.isArray(raw) && raw.length > 0) {
        setOfws(raw.map(mapBackend));
      } else {
        setOfws([]);
      }
    } catch (e) {
      console.error("Failed to load OFW records:", e);
      setOfws([]);
    } finally {
      setOfwsLoading(false);
    }
  };

  useEffect(() => {
    loadOFWs();
  }, []);

  const filteredOFWs = ofws.filter(ofw => {
    const matchesSearch = 
      ofw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ofw.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ofw.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesWorkerType = workerTypeFilter === "all" || ofw.workerType.toLowerCase() === workerTypeFilter.toLowerCase();
    const matchesCountry = countryFilter === "all" || ofw.country === countryFilter;
    return matchesSearch && matchesStatus && matchesWorkerType && matchesCountry;
  });

  const handleViewOFW = (ofw: OFWRecord) => {
    setSelectedOFW(ofw);
    setShowProfileDetails(true);
  };

const handleEditOFW = (ofw: OFWRecord) => {
     setSelectedOFW(ofw);
     // Store the client_id (primary key) for the update endpoint URL
     setEditingOFWId(String(ofw.dbId || ofw.id));
     
     // Country reverse mapping
     const countryReverseMap: Record<string, string> = {
       "Saudi Arabia": "saudi-arabia",
       "UAE": "uae",
       "Hong Kong": "hong-kong",
       "Singapore": "singapore",
       "Qatar": "qatar",
       "International Waters": "international-waters",
       "Others": "others",
     };

     // Relationship reverse mapping (Pascal Case to lowercase)
     const relationshipReverseMap: Record<string, string> = {
       "Spouse": "spouse",
       "Parent": "parent",
       "Sibling": "sibling",
       "Child": "child",
       "Others": "others",
     };

     // Use rawFirstName/rawLastName from mapped data if available, otherwise parse name
     const firstName = ofw.rawFirstName || "";
     const lastName = ofw.rawLastName || "";

setFormData({
        firstName: firstName,
        lastName: lastName,
        middleName: "",
        suffix: "",
        birthDate: ofw.birthDate || "",
        gender: ofw.gender || "",
        civilStatus: ofw.civilStatus || "",
        nationality: ofw.nationality || "Filipino",
        contactNumber: ofw.phone || "",
        email: ofw.email || "",
        address: ofw.address || "",
        workerType: ofw.workerType.toLowerCase() as "land-based" | "sea-based" | "",
        country: countryReverseMap[ofw.country] || ofw.country || "",
        city_abroad: "",
        occupation: ofw.occupation || "",
        jobTitle: "",
        agency: ofw.agency || "",
        agencyLicenseNo: "",
        contractStartDate: ofw.contractStart || "",
        contractEndDate: ofw.contractEnd || "",
        contractDuration: "",
        monthlyIncome: 0,
        currency: "USD",
        owwaMembershipStatus: ofw.owwaStatus === "Active" ? "active" : ofw.owwaStatus === "Expired" ? "expired" : "not-member",
        owwaMembershipNo: ofw.owwaMembershipNo || "",
        owwaValidityDate: ofw.owwaValidityDate || "",
        emergencyContactName: ofw.emergencyContactName || "",
        emergencyRelationship: relationshipReverseMap[ofw.emergencyRelationship || ""] || ofw.emergencyRelationship || "",
        emergencyContactNumber: ofw.emergencyContactNumber || "",
        emergencyAddress: "",
        vesselName: "",
        vesselType: "",
        rank: "",
        seaServiceYears: 0,
        skillsQualifications: [],
        notes: "",
      });
     setShowAddForm(true);
     toast.info(`Editing ${ofw.name}`);
   };

const handleSaveDraft = () => {
    console.log("Saving draft...", formData);
    toast.success("Draft saved successfully!");
  };

const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     console.log("[handleSubmit] fired — formData:", formData);

     // Validate required fields only for new records
     if (!editingOFWId) {
       if (!formData.firstName?.trim()) {
         toast.error("First Name is required.");
         return;
       }
       if (!formData.lastName?.trim()) {
         toast.error("Last Name is required.");
         return;
       }
     }

     try {
       // Map frontend dropdown values (lowercase-with-hyphens) → Django COUNTRY_CHOICES labels
       const fCountry = formData.country || "";
       const countryMap: Record<string, string> = {
         "saudi-arabia": "Saudi Arabia",
         "uae": "UAE",
         "hong-kong": "Hong Kong",
         "singapore": "Singapore",
         "qatar": "Qatar",
         "international-waters": "International Waters",
         "others": "Others",
       };
       const countryOfDeployment = countryMap[fCountry] || formData.country || "Others";

       // Determine worker type
       const workerType = formData.workerType === "sea-based" ? "Sea-based" : "Land-based";
       // Determine OWWA status
       const owwaStatus = formData.owwaMembershipStatus === "active" ? "Active"
         : formData.owwaMembershipStatus === "expired" ? "Expired"
         : "Not a Member";

       const relationshipMap: Record<string, string> = {
         "spouse": "Spouse",
         "parent": "Parent",
         "sibling": "Sibling",
         "child": "Child",
         "others": "Others",
       };
       // Send relationship in expected format (Pascal Case)
       const relationshipValue = relationshipMap[formData.emergencyRelationship] || "Others";

// Build payload - include required fields with fallback to selectedOFW raw values for editing
       const basePayload: Record<string, string> = {
         first_name: formData.firstName?.trim() || selectedOFW?.rawFirstName?.trim() || "",
         last_name: formData.lastName?.trim() || selectedOFW?.rawLastName?.trim() || "",
         worker_type: workerType,
         country_of_deployment: countryOfDeployment || "Others",
         occupation_position: formData.occupation?.trim() || selectedOFW?.occupation?.trim() || "",
         owwa_membership_status: owwaStatus,
         emergency_contact_name: formData.emergencyContactName?.trim() || selectedOFW?.emergencyContactName?.trim() || "",
         relationship: relationshipValue,
         emergency_contact_number: formData.emergencyContactNumber?.trim() || selectedOFW?.emergencyContactNumber?.trim() || "",
       };
// Optional fields
        if (formData.middleName?.trim()) basePayload.middle_name = formData.middleName.trim();
        if (formData.birthDate?.trim()) basePayload.birth_date = formData.birthDate.trim();
        if (formData.gender) basePayload.gender = formData.gender;
        if (formData.civilStatus) basePayload.civil_status = formData.civilStatus;
        if (formData.nationality) basePayload.nationality = formData.nationality;
        if (formData.contactNumber?.trim()) basePayload.phone_number = formData.contactNumber.trim();
        if (formData.email?.trim()) basePayload.email = formData.email.trim();
        if (formData.address?.trim()) basePayload.address = formData.address.trim();
        if (formData.agency?.trim()) basePayload.recruitment_agency = formData.agency.trim();
        if (formData.contractStartDate?.trim()) basePayload.contract_start = formData.contractStartDate.trim();
        if (formData.contractEndDate?.trim()) basePayload.contract_end = formData.contractEndDate.trim();

if (editingOFWId) {
          // UPDATE existing record - include client_id in payload (required by DRF serializer)
          const fullPayload = { ...basePayload, client_id: editingOFWId };
          console.log("[handleSubmit] PUT payload for client_id:", editingOFWId, "->", fullPayload);
          const result: any = await updateClientProfile(editingOFWId, fullPayload);
          console.log("[handleSubmit] PUT ok — result:", result?.data ?? result);
          toast.success("OFW profile updated successfully!");
        } else {
         // CREATE new record
         const initials = `${(formData.firstName?.[0] || "O")}${(formData.lastName?.[0] || "F")}`.toUpperCase();
         const clientId = `${initials}-${Date.now()}`;
         const fullPayload = { ...basePayload, client_id: clientId };
         console.log("[handleSubmit] POST payload:", fullPayload);
         const result: any = await saveClientProfile(fullPayload);
         console.log("[handleSubmit] POST ok — result:", result?.data ?? result);
         toast.success("OFW profile created successfully!");
       }
       // Reset form and state
       setShowAddForm(false);
       setEditingOFWId(null);
       setSelectedOFW(null);
       await loadOFWs();
     } catch (err: any) {
       const status = err?.response?.status ?? "network";
       const detail = err?.response?.data?.message || err?.response?.data?.detail || JSON.stringify(err?.response?.data ?? err.message);
       console.error("[handleSubmit] FAILED — status:", status, "body:", err?.response?.data ?? err.message);
       toast.error(`Save failed: ${detail}`);
     }
   };

  // Profile Details View - Modal Design
  if (showProfileDetails && selectedOFW) {
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
            <div className="bg-gray-50 border-b border-gray-200 p-8 relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileDetails(false)}
                className="absolute top-3 left-4 text-gray-600 hover:bg-gray-100"
              >
                <X className="size-5" />
              </Button>

              <div className="flex items-start gap-5">
                <Avatar className="size-24 border-4 border-blue-100 shadow-lg">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl" style={{ fontWeight: 600 }}>
                    {selectedOFW.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 600 }}>{selectedOFW.name}</h2>
                  <p className="text-gray-600 mb-3" style={{ fontWeight: 400 }}>ID: {selectedOFW.id}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={`${selectedOFW.statusColor} border-0`} style={{ fontWeight: 500 }}>
                      {selectedOFW.status}
                    </Badge>
                    <Badge className="bg-gray-200 text-gray-700 border-0 gap-1.5" style={{ fontWeight: 400 }}>
                      {selectedOFW.workerType === "Sea-based" ? <Ship className="size-3.5" /> : <Globe className="size-3.5" />}
                      {selectedOFW.workerType}
                    </Badge>
                    <Badge className="bg-gray-200 text-gray-700 border-0" style={{ fontWeight: 400 }}>
                      {selectedOFW.country}
                    </Badge>
                    <Badge
                      className={
                        selectedOFW.owwaStatus === "Active"
                          ? "bg-green-100 text-green-700 border-0"
                          : "bg-orange-100 text-orange-700 border-0"
                      }
                      style={{ fontWeight: 400 }}
                    >
                      OWWA: {selectedOFW.owwaStatus}
                    </Badge>
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
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.name}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600" style={{ fontWeight: 400 }}>Birth Date:</span>
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{formatDate(selectedOFW.birthDate)}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600" style={{ fontWeight: 400 }}>Gender:</span>
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.gender || "N/A"}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600" style={{ fontWeight: 400 }}>Civil Status:</span>
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.civilStatus || "N/A"}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600" style={{ fontWeight: 400 }}>Nationality:</span>
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.nationality || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="size-4 text-gray-400" />
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="size-4 text-gray-400" />
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.email || "N/A"}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="size-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.address || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

{/* Employment Details */}
               <div className="mb-8 pb-8 border-b border-gray-200">
                 <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Employment Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="text-sm flex justify-between">
                     <span className="text-gray-600" style={{ fontWeight: 400 }}>Worker Type:</span>
                     <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.workerType}</span>
                   </div>
                   <div className="text-sm flex justify-between">
                     <span className="text-gray-600" style={{ fontWeight: 400 }}>Country:</span>
                     <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.country}</span>
                   </div>
                   <div className="text-sm flex justify-between">
                     <span className="text-gray-600" style={{ fontWeight: 400 }}>Occupation:</span>
                     <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.occupation || "N/A"}</span>
                   </div>
                   <div className="text-sm flex justify-between">
                     <span className="text-gray-600" style={{ fontWeight: 400 }}>Agency:</span>
                     <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.agency || "N/A"}</span>
                   </div>
                   <div className="text-sm flex justify-between">
                     <span className="text-gray-600" style={{ fontWeight: 400 }}>Contract Start:</span>
                     <span className="text-gray-900" style={{ fontWeight: 400 }}>{formatDate(selectedOFW.contractStart)}</span>
                   </div>
                   <div className="text-sm flex justify-between">
                     <span className="text-gray-600" style={{ fontWeight: 400 }}>Contract End:</span>
                     <span className="text-gray-900" style={{ fontWeight: 400 }}>{formatDate(selectedOFW.contractEnd)}</span>
                   </div>
                 </div>
               </div>

               {/* OWWA Membership */}
               <div className="mb-8 pb-8 border-b border-gray-200">
                 <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>OWWA Membership Status</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="text-sm flex justify-between">
                     <span className="text-gray-600" style={{ fontWeight: 400 }}>Status:</span>
                     <Badge className={selectedOFW.owwaStatus === "Active" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"} style={{ fontWeight: 500 }}>
                       {selectedOFW.owwaStatus}
                     </Badge>
                   </div>
                   <div className="text-sm flex justify-between">
                     <span className="text-gray-600" style={{ fontWeight: 400 }}>Membership No.:</span>
                     <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.owwaMembershipNo || "N/A"}</span>
                   </div>
                   <div className="text-sm flex justify-between">
                     <span className="text-gray-600" style={{ fontWeight: 400 }}>Issue Date:</span>
                     <span className="text-gray-900" style={{ fontWeight: 400 }}>{formatDate(selectedOFW.contractStart)}</span>
                   </div>
                   <div className="text-sm flex justify-between">
                     <span className="text-gray-600" style={{ fontWeight: 400 }}>Validity Date:</span>
                     <span className="text-gray-900" style={{ fontWeight: 400 }}>{formatDate(selectedOFW.owwaValidityDate)}</span>
                   </div>
                 </div>
               </div>

               {/* Emergency Contact */}
               <div className="mb-8">
                 <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Emergency Contact</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="text-sm flex justify-between">
                     <span className="text-gray-600" style={{ fontWeight: 400 }}>Name:</span>
                     <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.emergencyContactName || "N/A"}</span>
                   </div>
                   <div className="text-sm flex justify-between">
                     <span className="text-gray-600" style={{ fontWeight: 400 }}>Relationship:</span>
                     <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.emergencyRelationship || "N/A"}</span>
                   </div>
                   <div className="text-sm flex justify-between">
                     <span className="text-gray-600" style={{ fontWeight: 400 }}>Contact Number:</span>
                     <span className="text-gray-900" style={{ fontWeight: 400 }}>{selectedOFW.emergencyContactNumber || "N/A"}</span>
                   </div>
                 </div>
               </div>

              {/* Supporting Documents */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Supporting Documents</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-900" style={{ fontWeight: 400 }}>Employment Contract.pdf</p>
                        <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>Uploaded: Jan 1, 2023</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="size-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-900" style={{ fontWeight: 400 }}>OWWA Certificate.pdf</p>
                        <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>Uploaded: Jan 5, 2023</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="size-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-900" style={{ fontWeight: 400 }}>Passport Copy.pdf</p>
                        <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>Uploaded: Dec 20, 2022</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const OFWFormModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={() => {
      setShowAddForm(false);
      setEditingOFWId(null);
      setSelectedOFW(null);
    }}>
      <Card className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-8 py-6 relative">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingOFWId(null);
                setSelectedOFW(null);
              }}
              className="absolute top-3 left-4 size-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="size-5 text-gray-600" />
            </button>
            <h2 className="text-2xl text-gray-900 mb-1">
              {selectedOFW ? "Edit OFW Profile" : "Add New OFW Profile"}
            </h2>
            <p className="text-gray-600 text-sm">
              {selectedOFW ? "Update overseas worker information" : "Register a new overseas Filipino worker profile"}
            </p>
          </div>

{/* Form Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]" style={{ overflowAnchor: "none" }}>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Client Profiling Search */}
                <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-5">
                  <ClientSearchWidget />
                </div>

               {/* Personal Information */}
               <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-l-blue-500">
                 <div className="flex items-center gap-3 mb-5">
                   <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
                     <User className="size-5 text-blue-600" />
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                     <p className="text-sm text-gray-600">Worker's basic details</p>
                   </div>
                 </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <FormField label="First Name" required>
                   <TextInput
                     placeholder="Given name"
                     value={formData.firstName}
                     onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                     required
                   />
                 </FormField>

                 <FormField label="Last Name" required>
                   <TextInput
                     placeholder="Family surname"
                     value={formData.lastName}
                     onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                     required
                   />
                 </FormField>

                 <FormField label="Birth Date">
                   <DateInput
                     value={formData.birthDate}
                     onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                   />
                 </FormField>

                 <FormField label="Gender">
                   <SelectInput
                     options={[
                       { value: "Male", label: "Male" },
                       { value: "Female", label: "Female" },
                       { value: "Other", label: "Other" }
                     ]}
                     value={formData.gender}
                     onChange={(e) => setFormData({...formData, gender: e.target.value})}
                   />
                 </FormField>

                 <FormField label="Civil Status">
                   <SelectInput
                     options={[
                       { value: "Single", label: "Single" },
                       { value: "Married", label: "Married" },
                       { value: "Divorced", label: "Divorced" },
                       { value: "Widowed", label: "Widowed" },
                       { value: "Separated", label: "Separated" }
                     ]}
                     value={formData.civilStatus}
                     onChange={(e) => setFormData({...formData, civilStatus: e.target.value})}
                   />
                 </FormField>

                 <FormField label="Nationality">
                   <SelectInput
                     options={[
                       { value: "Filipino", label: "Filipino" },
                       { value: "American", label: "American" },
                       { value: "Chinese", label: "Chinese" },
                       { value: "Japanese", label: "Japanese" },
                       { value: "Korean", label: "Korean" },
                       { value: "Indian", label: "Indian" }
                     ]}
                     value={formData.nationality}
                     onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                   />
                 </FormField>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                 <FormField label="Contact Number">
                   <TextInput
                     type="tel"
                     placeholder="e.g., 09123456789"
                     value={formData.contactNumber}
                     onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                   />
                 </FormField>

                 <FormField label="Email">
                   <TextInput
                     type="email"
                     placeholder="email@example.com"
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                   />
                 </FormField>
               </div>

               <div className="mt-5">
                 <FormField label="Address">
                   <TextArea
                     placeholder="Full address"
                     value={formData.address || ""}
                     onChange={(e) => setFormData({...formData, address: e.target.value})}
                   />
                 </FormField>
               </div>
               </div>

               {/* Employment Details */}
               <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-l-purple-500">
                 <div className="flex items-center gap-3 mb-5">
                   <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                     <Globe className="size-5 text-purple-600" />
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-gray-900">Employment Details</h3>
                     <p className="text-sm text-gray-600">Overseas work information</p>
                   </div>
                 </div>

               <div className="space-y-5">
                 <FormField 
                   label="Worker Type" 
                   required
                   helperText="Select whether land-based or sea-based worker"
                 >
                   <RadioGroup
                     name="workerType"
                     value={formData.workerType}
                     onChange={(value) => setFormData({...formData, workerType: value as "land-based" | "sea-based"})}
                     options={[
                       { 
                         value: "land-based", 
                         label: "Land-based OFW",
                         description: "Working in factories, offices, homes, etc."
                       },
                       { 
                         value: "sea-based", 
                         label: "Sea-based OFW (Seafarer)",
                         description: "Working on ships, vessels, maritime industry"
                       }
                     ]}
                   />
                 </FormField>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <FormField label="Country of Deployment" required>
                     <SelectInput
                       options={[
                         { value: "saudi-arabia", label: "Saudi Arabia" },
                         { value: "uae", label: "United Arab Emirates" },
                         { value: "hong-kong", label: "Hong Kong" },
                         { value: "singapore", label: "Singapore" },
                         { value: "qatar", label: "Qatar" },
                         { value: "international-waters", label: "International Waters (Sea-based)" },
                         { value: "others", label: "Others" }
                       ]}
                       value={formData.country}
                       onChange={(e) => setFormData({...formData, country: e.target.value})}
                       required
                     />
                   </FormField>

<FormField label="Occupational/Position" required>
                      <TextInput
                        placeholder="e.g., Domestic Helper, Nurse, Seaman"
                        value={formData.occupation}
                        onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                        required
                      />
                    </FormField>

                    <FormField label="Recruitment Agency">
                      <TextInput
                        placeholder="POEA-licensed agency"
                        value={formData.agency}
                        onChange={(e) => setFormData({...formData, agency: e.target.value})}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                    <FormField label="Contract Start Date">
                      <DateInput
                        value={formData.contractStartDate}
                        onChange={(e) => setFormData({...formData, contractStartDate: e.target.value})}
                      />
                    </FormField>

                    <FormField label="Contract End Date">
                      <DateInput
                        value={formData.contractEndDate}
                        onChange={(e) => setFormData({...formData, contractEndDate: e.target.value})}
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* OWWA Membership */}
              <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-l-orange-500">
                <div className="flex items-center gap-3 mb-5">
                  <div className="size-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="size-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">OWWA Membership</h3>
                    <p className="text-sm text-gray-600">Overseas Workers Welfare Administration membership</p>
                  </div>
                </div>

              <div className="space-y-5">
                <FormField 
                  label="OWWA Membership Status" 
                  required
                  helperText="Overseas Workers Welfare Administration membership"
                >
                  <RadioGroup
                    name="owwaMembership"
                    value={formData.owwaMembershipStatus}
                    onChange={(value) => setFormData({...formData, owwaMembershipStatus: value})}
                    options={[
                      { value: "active", label: "Active Member", description: "Current valid membership" },
                      { value: "expired", label: "Expired", description: "Membership needs renewal" },
                      { value: "not-member", label: "Not a Member", description: "Needs to register" }
                    ]}
                  />
                </FormField>

                {formData.owwaMembershipStatus === "active" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField label="OWWA Membership No." required>
                      <TextInput
                        placeholder="Membership number"
                        value={formData.owwaMembershipNo}
                        onChange={(e) => setFormData({...formData, owwaMembershipNo: e.target.value})}
                        required
                      />
                    </FormField>

                    <FormField label="Validity Date" required>
                      <DateInput
                        value={formData.owwaValidityDate}
                        onChange={(e) => setFormData({...formData, owwaValidityDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </div>

              {/* Emergency Contact */}
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-l-green-500">
                <div className="flex items-center gap-3 mb-5">
                  <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="size-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                    <p className="text-sm text-gray-600">Emergency contact details</p>
                  </div>
                </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <FormField label="Emergency Contact Name">
                   <TextInput
                     placeholder="Full name"
                     value={formData.emergencyContactName}
                     onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                   />
                 </FormField>

                 <FormField label="Relationship">
                   <SelectInput
                     options={[
                       { value: "spouse", label: "Spouse" },
                       { value: "parent", label: "Parent" },
                       { value: "sibling", label: "Sibling" },
                       { value: "child", label: "Child" },
                       { value: "others", label: "Others" }
                     ]}
                     value={formData.emergencyRelationship}
                     onChange={(e) => setFormData({...formData, emergencyRelationship: e.target.value})}
                   />
                 </FormField>

                 <FormField label="Emergency Contact Number">
                   <TextInput
                     type="tel"
                     placeholder="e.g., 09123456789"
                     value={formData.emergencyContactNumber}
                     onChange={(e) => setFormData({...formData, emergencyContactNumber: e.target.value})}
                   />
                 </FormField>
               </div>
            </div>

            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingOFWId(null);
                  setSelectedOFW(null);
                }}
                className="hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                className="gap-2 hover:bg-gray-50 transition-colors"
              >
                <Save className="size-4" />
                Save Draft
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white gap-2 transition-colors"
              >
                <Check className="size-4" />
                {editingOFWId ? "Update Profile" : "Save Profile"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (showAddForm) {
    return <OFWFormModal />;
  }

  // Main List View
  return (
    <div className="h-full bg-gray-50 overflow-y-auto" ref={scrollContainerRef}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Search and Filters - Simplified without More Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or OFW ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                style={{ fontWeight: 400 }}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                style={{ fontWeight: 400 }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="repatriated">Repatriated</option>
                <option value="distressed">Distressed</option>
              </select>
              <select
                value={workerTypeFilter}
                onChange={(e) => setWorkerTypeFilter(e.target.value)}
                className="h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                style={{ fontWeight: 400 }}
              >
                <option value="all">All Worker Types</option>
                <option value="land-based">Land-based</option>
                <option value="sea-based">Sea-based</option>
              </select>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                style={{ fontWeight: 400 }}
              >
                <option value="all">All Countries</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Singapore">Singapore</option>
                <option value="Hong Kong">Hong Kong</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Qatar">Qatar</option>
              </select>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddForm(true)}>
                <Plus className="size-4" />
                Add New OFW
              </Button>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    OFW Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Country / Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Agency / Occupation
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    OWWA Status
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
                {filteredOFWs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="size-12 text-gray-400" />
                        <p className="text-gray-500" style={{ fontWeight: 400 }}>No OFW records found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOFWs.map((ofw) => (
                    <tr key={ofw.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10 border border-gray-200">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm" style={{ fontWeight: 600 }}>
                              {ofw.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{ofw.name}</p>
                            <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>{ofw.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900" style={{ fontWeight: 400 }}>{ofw.country}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {ofw.workerType === "Sea-based" ? (
                            <Ship className="size-3.5 text-gray-500" />
                          ) : (
                            <Globe className="size-3.5 text-gray-500" />
                          )}
                          <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>{ofw.workerType}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900" style={{ fontWeight: 400 }}>{ofw.agency || "N/A"}</p>
                        <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>{ofw.occupation || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          className={
                            ofw.owwaStatus === "Active" 
                              ? "bg-green-100 text-green-700" 
                              : ofw.owwaStatus === "Expired"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                          }
                          style={{ fontWeight: 500 }}
                        >
                          {ofw.owwaStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={ofw.statusColor} style={{ fontWeight: 500 }}>
                          {ofw.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOFW(ofw)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                          >
                            <Eye className="size-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOFW(ofw)}
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
            Showing <span style={{ fontWeight: 600 }}>{filteredOFWs.length}</span> of <span style={{ fontWeight: 600 }}>{ofws.length}</span> OFW records
          </p>
        </div>
      </div>
    </div>
  );
}