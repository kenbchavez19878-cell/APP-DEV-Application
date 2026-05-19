import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Plus, Search, Eye, Loader2, 
  User, Globe, Briefcase, Calendar, RefreshCw, X
} from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { getProfilingData } from '../../api/clientApi';

interface LocalOFWRegistration {
  id?: number | string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  birthDate: string;
  gender?: string;
  civilStatus?: string;
  contactNumber?: string;
  email?: string;
  workerType: string;
  country: string;
  occupation: string;
  agency?: string;
  owwaMembershipStatus: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  created_at?: string;
}

type FormInputs = Omit<LocalOFWRegistration, 'id' | 'created_at'>;

export default function OFWProfiling() {
  const [records, setRecords] = useState<LocalOFWRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workerTypeFilter, setWorkerTypeFilter] = useState('all');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<LocalOFWRegistration | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, reset } = useForm<FormInputs>({
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      suffix: '',
      birthDate: '',
      gender: '',
      civilStatus: '',
      contactNumber: '',
      email: '',
      workerType: 'land-based',
      country: '',
      occupation: '',
      agency: '',
      owwaMembershipStatus: 'active',
      emergencyContactName: '',
      emergencyContactNumber: '',
    }
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      if (typeof getProfilingData === 'function') {
        const response = await getProfilingData();
        setRecords(response?.data || response || []);
      } else {
        const res = await fetch('/api/ofw-registrations/');
        const data = await res.json();
        setRecords(data || []);
      }
    } catch (error) {
      console.error('Error fetching database records:', error);
      toast.error('Failed to load real-time database feeds.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const onSubmitForm = async (data: FormInputs) => {
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/ofw-registrations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('OFW Profile created successfully!');
        setIsAddOpen(false);
        reset();
        fetchRecords();
      } else {
        throw new Error('Failed saving data backend server');
      }
    } catch (error) {
      console.error('Error submitting profile:', error);
      toast.error('Could not save data tracking entries to system.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const first = record?.firstName || '';
    const last = record?.lastName || '';
    const fullName = `${first} ${last}`.toLowerCase();
    
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          (record.id && String(record.id).includes(searchTerm)) ||
                          (record.country && record.country.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesWorkerType = workerTypeFilter === 'all' || record.workerType === workerTypeFilter;
    const matchesStatus = statusFilter === 'all' || record.owwaMembershipStatus === statusFilter;

    return matchesSearch && matchesWorkerType && matchesStatus;
  });

  return (
    <div className="h-full bg-slate-50 overflow-y-auto p-6 space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" /> OFW Profiling Center
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage information registry system records for Migrant Workers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-slate-200" onClick={fetchRecords} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Reload
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4" /> Add Migrant Profile
          </Button>
        </div>
      </div>

      {/* Query Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by worker name, system ID tag, or destination country..." 
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={workerTypeFilter} onValueChange={setWorkerTypeFilter}>
            <SelectTrigger className="w-[160px] bg-white border-slate-200">
              <SelectValue placeholder="Worker Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="land-based">Land-based</SelectItem>
              <SelectItem value="sea-based">Sea-based</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-white border-slate-200">
              <SelectValue placeholder="OWWA Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Memberships</SelectItem>
              <SelectItem value="active">Active Members</SelectItem>
              <SelectItem value="expired">Expired/Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="p-4">Full Name & Registry Key</th>
                <th className="p-4">Deployment Sector</th>
                <th className="p-4">Destination Country</th>
                <th className="p-4">OWWA Tracking Flag</th>
                <th className="p-4 text-right">System Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    Fetching records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No matched worker profiles found in data registry lookup query.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr key={record.id || index} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm shadow-sm">
                          {record.firstName?.[0] || 'O'}{record.lastName?.[0] || 'W'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {record.lastName}, {record.firstName} {record.middleName || ''}
                          </div>
                          <div className="text-xs text-slate-400">System ID: OFW-2026-{record.id || 'NEW'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        record.workerType === 'sea-based' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-teal-50 text-teal-700 border-teal-100'
                      }`}>
                        {record.workerType === 'sea-based' ? 'Sea-based Maritime' : 'Land-based Contract'}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-800">{record.country || 'Not Set'}</td>
                    <td className="p-4">
                      <Badge variant={record.owwaMembershipStatus === 'active' ? 'default' : 'secondary'} className={
                        record.owwaMembershipStatus === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50'
                      }>
                        {record.owwaMembershipStatus === 'active' ? 'Active Member' : 'Expired/Lapsed'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50" onClick={() => setViewingRecord(record)}>
                        <Eye className="w-4 h-4 mr-1" /> View Profile
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Form Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col overflow-hidden bg-white rounded-xl shadow-2xl border">
          <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Registration Entry Form
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Input verified details to provision a brand new profile trace context to server database structures.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <form onSubmit={handleSubmit(onSubmitForm)} id="ofw-submit-form" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-blue-600 rounded-sm"></span> 1. Core Profile Identity Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-slate-700 font-medium text-xs">First Name *</Label>
                    <Input id="firstName" {...register('firstName', { required: true })} placeholder="Given Name" className="border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-slate-700 font-medium text-xs">Last Name *</Label>
                    <Input id="lastName" {...register('lastName', { required: true })} placeholder="Family Surname" className="border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="middleName" className="text-slate-700 font-medium text-xs">Middle Name</Label>
                    <Input id="middleName" {...register('middleName')} placeholder="Optional Middle Name" className="border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="birthDate" className="text-slate-700 font-medium text-xs">Birth Date *</Label>
                    <Input id="birthDate" type="date" {...register('birthDate', { required: true })} className="border-slate-200" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-purple-600 rounded-sm"></span> 2. Allocation & Sector Metrics
                </h3>
                
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium text-xs">Deployment Mode Classification *</Label>
                  <Controller
                    control={control}
                    name="workerType"
                    render={({ field }) => (
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors font-normal">
                          <RadioGroupItem value="land-based" className="mt-0.5 text-blue-600" />
                          <div>
                            <span className="font-semibold text-slate-900 block text-sm">Land-based Worker Context</span>
                            <span className="text-xs text-slate-400">Deployed within healthcare facilities, retail plants, corporate hubs.</span>
                          </div>
                        </Label>
                        <Label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors font-normal">
                          <RadioGroupItem value="sea-based" className="mt-0.5 text-blue-600" />
                          <div>
                            <span className="font-semibold text-slate-900 block text-sm">Sea-based Maritime Sector</span>
                            <span className="text-xs text-slate-400">Deployed onboard ocean fleets, commercial cargo containers.</span>
                          </div>
                        </Label>
                      </RadioGroup>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-slate-700 font-medium text-xs">Destination Host Country *</Label>
                    <Input id="country" {...register('country', { required: true })} placeholder="e.g. Saudi Arabia, Singapore" className="border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="occupation" className="text-slate-700 font-medium text-xs">Job Position Title *</Label>
                    <Input id="occupation" {...register('occupation', { required: true })} placeholder="e.g. Staff Nurse, Ship Engineer" className="border-slate-200" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-emerald-600 rounded-sm"></span> 3. Membership Verification Details
                </h3>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium text-xs">OWWA Status State Validation</Label>
                  <Controller
                    control={control}
                    name="owwaMembershipStatus"
                    render={({ field }) => (
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                        <Label className="flex items-center gap-2 border px-4 py-2.5 rounded-lg border-slate-200 hover:bg-slate-50 cursor-pointer text-sm font-normal">
                          <RadioGroupItem value="active" /> Active Registry
                        </Label>
                        <Label className="flex items-center gap-2 border px-4 py-2.5 rounded-lg border-slate-200 hover:bg-slate-50 cursor-pointer text-sm font-normal">
                          <RadioGroupItem value="expired" /> Lapsed State
                        </Label>
                      </RadioGroup>
                    )}
                  />
                </div>
              </div>
            </form>
          </ScrollArea>

          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" className="border-slate-200 text-slate-700" onClick={() => setIsAddOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" form="ofw-submit-form" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details View Dialog */}
      <Dialog open={viewingRecord !== null} onOpenChange={(open: boolean) => !open && setViewingRecord(null)}>
        <DialogContent className="max-w-xl bg-white p-0 overflow-hidden border rounded-xl shadow-2xl">
          <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100 relative">
            <button className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setViewingRecord(null)}>
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl flex items-center justify-center text-lg shadow-sm">
                {viewingRecord?.firstName?.[0] || ''}{viewingRecord?.lastName?.[0] || ''}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {viewingRecord?.lastName}, {viewingRecord?.firstName}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  Registry Index Tracker Number: OFW-2026-{viewingRecord?.id || 'NEW'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-5 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block">Deployment Target</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-400" /> {viewingRecord?.country || 'Unassigned'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block">Assigned Sector Role</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" /> {viewingRecord?.occupation || 'Unassigned'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Worker Sector Classification</span>
                <span className="font-semibold text-slate-900 capitalize">{viewingRecord?.workerType} Contract</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Affiliated Placement Agency</span>
                <span className="font-semibold text-slate-900">{viewingRecord?.agency || 'Direct Hire Placement'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Date of Birth Context</span>
                <span className="font-semibold text-slate-900">{viewingRecord?.birthDate || 'Not specified'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">OWWA Membership Status</span>
                <Badge variant={viewingRecord?.owwaMembershipStatus === 'active' ? 'default' : 'destructive'} className={
                  viewingRecord?.owwaMembershipStatus === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                }>
                  {viewingRecord?.owwaMembershipStatus === 'active' ? 'Active Membership' : 'Inactive / Lapsed'}
                </Badge>
              </div>
            </div>

            {viewingRecord?.created_at && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> 
                <span><strong>Registered on system:</strong> {new Date(viewingRecord.created_at).toLocaleString()}</span>
              </div>
            )}
          </div>
          
          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
            <Button variant="outline" className="border-slate-200 text-slate-700 px-6" onClick={() => setViewingRecord(null)}>
              Dismiss View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}