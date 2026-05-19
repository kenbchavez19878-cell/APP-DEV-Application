import { useState, useMemo } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Search,
  Users,
  Plane,
  Shield,
  HandHeart,
  Download,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface OFWRecord {
  id: string;
  name: string;
  country: string;
  owwaStatus: "Active" | "Expired" | "N/A";
  assistanceStatus: "Assisted" | "Pending" | "None";
  registrationDate: string;
}

export function OFWServicesDashboard({ data = [] }: { data?: OFWRecord[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedOwwaStatus, setSelectedOwwaStatus] = useState("all");
  const [selectedAssistanceStatus, setSelectedAssistanceStatus] =
    useState("all");

  const filtered = useMemo(() => {
    return (data || []).filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCountry =
        selectedCountry === "all" || r.country === selectedCountry;

      const matchOwwa =
        selectedOwwaStatus === "all" || r.owwaStatus === selectedOwwaStatus;

      const matchAssist =
        selectedAssistanceStatus === "all" ||
        r.assistanceStatus === selectedAssistanceStatus;

      return matchSearch && matchCountry && matchOwwa && matchAssist;
    });
  }, [data, searchQuery, selectedCountry, selectedOwwaStatus, selectedAssistanceStatus]);

  const total = data.length;
  const active = data.filter((r) => r.owwaStatus === "Active").length;
  const assisted = data.filter((r) => r.assistanceStatus === "Assisted").length;

  const handleExport = () => {
    toast.success(`Exporting ${filtered.length} records...`);
  };

  return (
    <div className="h-full bg-[#f8f9fb] overflow-y-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ================= CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <Card className="border-l-4 border-l-blue-500 bg-white rounded-xl shadow-sm">
            <CardContent className="p-4 min-h-[130px] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-600">Total OFWs</p>
                <Users className="size-4 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold">{total}</h2>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 bg-white rounded-xl shadow-sm">
            <CardContent className="p-4 min-h-[130px] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-600">Active Abroad</p>
                <Plane className="size-4 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">{active}</h2>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 bg-white rounded-xl shadow-sm">
            <CardContent className="p-4 min-h-[130px] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-600">OWWA Members</p>
                <Shield className="size-4 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold">{active}</h2>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 bg-white rounded-xl shadow-sm">
            <CardContent className="p-4 min-h-[130px] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-600">Assisted</p>
                <HandHeart className="size-4 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold">{assisted}</h2>
            </CardContent>
          </Card>

        </div>

        {/* ================= FILTERS (FIXED DROPDOWN ICONS) ================= */}
        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">

            <div className="flex flex-col lg:flex-row gap-3">

              {/* SEARCH */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search OFW..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none"
                />
              </div>

              {/* COUNTRY */}
              <div className="relative w-full lg:w-[170px]">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white appearance-none pr-8"
                >
                  <option value="all">All Countries</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              </div>

              {/* OWWA STATUS */}
              <div className="relative w-full lg:w-[170px]">
                <select
                  value={selectedOwwaStatus}
                  onChange={(e) => setSelectedOwwaStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white appearance-none pr-8"
                >
                  <option value="all">All OWWA Status</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="N/A">N/A</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              </div>

              {/* ASSISTANCE STATUS */}
              <div className="relative w-full lg:w-[190px]">
                <select
                  value={selectedAssistanceStatus}
                  onChange={(e) => setSelectedAssistanceStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white appearance-none pr-8"
                >
                  <option value="all">All Assistance</option>
                  <option value="Assisted">Assisted</option>
                  <option value="Pending">Pending</option>
                  <option value="None">None</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              </div>

              {/* EXPORT */}
              <Button
                onClick={handleExport}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Download className="size-4" />
                Export
                <ChevronDown className="size-4" />
              </Button>

            </div>

          </CardContent>
        </Card>

        {/* ================= TABLE ================= */}
        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">

            <table className="w-full">

              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left text-xs uppercase text-gray-500">ID</th>
                  <th className="p-4 text-left text-xs uppercase text-gray-500">Name</th>
                  <th className="p-4 text-left text-xs uppercase text-gray-500">Country</th>
                  <th className="p-4 text-left text-xs uppercase text-gray-500">OWWA</th>
                  <th className="p-4 text-left text-xs uppercase text-gray-500">Assistance</th>
                  <th className="p-4 text-left text-xs uppercase text-gray-500">Date</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan={6}>
                      No records found
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">{r.id}</td>
                      <td className="p-4 font-medium">{r.name}</td>
                      <td className="p-4">{r.country}</td>
                      <td className="p-4">
                        <Badge>{r.owwaStatus}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge>{r.assistanceStatus}</Badge>
                      </td>
                      <td className="p-4">{r.registrationDate}</td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}