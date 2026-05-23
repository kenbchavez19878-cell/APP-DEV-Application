import { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  Search, X, CheckCircle, UserX, ChevronRight, ChevronDown,
  User, Phone, MapPin, Calendar, Users
} from "lucide-react";
import { clientProfilingDatabase, type ClientProfile, type FamilyMember } from "../data/clientProfilingData";

interface SelectedEntry {
  client: ClientProfile;
  member?: FamilyMember;
}

interface ClientSearchWidgetProps {
  onClientSelect?: (client: ClientProfile | null, member?: FamilyMember | null) => void;
  className?: string;
}

const statusColors: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-gray-100 text-gray-600",
  Pending: "bg-amber-100 text-amber-700",
};

const relationshipColors: Record<string, string> = {
  Spouse: "bg-rose-100 text-rose-700",
  Son: "bg-blue-100 text-blue-700",
  Daughter: "bg-purple-100 text-purple-700",
  Father: "bg-orange-100 text-orange-700",
  Mother: "bg-pink-100 text-pink-700",
  Sibling: "bg-teal-100 text-teal-700",
};

export function ClientSearchWidget({ onClientSelect, className = "" }: ClientSearchWidgetProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClientProfile[]>([]);
  const [selected, setSelected] = useState<SelectedEntry | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedFamilyIds, setExpandedFamilyIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAnchorRef = useRef(0);
  const restorePendingRef = useRef(false);

   // ── Scroll-jump guard ────────────────────────────────────────────────
  // Runs only when the dropdown's actual content or visibility changes,
  // NOT on every keystroke.  If an ancestor's scrollTop drifted by more
  // than 1 px (e.g. browser's overflow-anchor fired) it is snapped back.
  useLayoutEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    let el: HTMLElement | null = c;
    const anchor = scrollAnchorRef.current;
    while (el && el !== document.body && (!(el.scrollHeight > el.clientHeight) || !(el.className.includes("overflow-y") || el.style.overflowY === "auto" || el.style.overflowY === "scroll")))
      el = el.parentElement;
    const scroller = el || c;
    if (Math.abs(scroller.scrollTop - anchor) > 1)
      scroller.scrollTop = anchor;
    // ^^ gate: only write when off by >1 px — no-op when typing normally
  }, [results, isOpen, expandedFamilyIds, selected]);

  const savedScrollTop = () => {
    if (!containerRef.current) return;
    let el: HTMLElement | null = containerRef.current;
    while (el && el !== document.body && (!(el.scrollHeight > el.clientHeight) || !(el.className.includes("overflow-y") || el.style.overflowY === "auto" || el.style.overflowY === "scroll")))
      el = el.parentElement;
    const scroller = el || containerRef.current;
    scrollAnchorRef.current = scroller.scrollTop;
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (value: string) => {
    savedScrollTop();                    // ← capture scrollTop before any state update
    setQuery(value);
    setExpandedFamilyIds(new Set());
    if (value.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setHasSearched(false);
      return;
    }
    const q = value.toLowerCase();
    const filtered = clientProfilingDatabase.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.barangay.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.firstName.toLowerCase().includes(q) ||
        c.familyMembers?.some(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.firstName.toLowerCase().includes(q) ||
            m.lastName.toLowerCase().includes(q)
        )
    );

    // Auto-expand family results that matched via a member name
    const autoExpand = new Set<string>();
    filtered.forEach((c) => {
      if (c.familyMembers?.some((m) => m.name.toLowerCase().includes(q) || m.firstName.toLowerCase().includes(q) || m.lastName.toLowerCase().includes(q))) {
        autoExpand.add(c.id);
      }
    });
    setExpandedFamilyIds(autoExpand);
    setResults(filtered);
    setIsOpen(true);
    setHasSearched(true);
  };

  const toggleFamily = (clientId: string) => {
    savedScrollTop();
    setExpandedFamilyIds((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  };

  const selectFamilyHead = (client: ClientProfile) => {
    savedScrollTop();
    setSelected({ client });
    setQuery("");
    setIsOpen(false);
    setHasSearched(false);
    setExpandedFamilyIds(new Set());
    onClientSelect?.(client, null);
  };

  const selectMember = (client: ClientProfile, member: FamilyMember) => {
    savedScrollTop();
    setSelected({ client, member });
    setQuery("");
    setIsOpen(false);
    setHasSearched(false);
    setExpandedFamilyIds(new Set());
    onClientSelect?.(client, member);
  };

  const handleClear = () => {
    savedScrollTop();
    setSelected(null);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setHasSearched(false);
    onClientSelect?.(null, null);
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const relColor = (rel: string) =>
    relationshipColors[rel] ?? "bg-gray-100 text-gray-600";

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white">
          <User className="size-3.5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Client Profiling Search</p>
          <p className="text-xs text-gray-500">
            Search by name or ID · Family heads show linked members
          </p>
        </div>
      </div>

      {/* Search input */}
      {!selected && (
        <div ref={containerRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-blue-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search client or family member name, ID..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => results.length > 0 && setIsOpen(true)}
              className="w-full pl-10 pr-10 py-3 bg-white border-2 border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); setIsOpen(false); setHasSearched(false); setExpandedFamilyIds(new Set()); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {results.length > 0 ? (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-medium">
                      {results.length} result{results.length !== 1 ? "s" : ""} found
                    </p>
                    <p className="text-xs text-blue-600">
                      Click <Users className="size-3 inline" /> to see family members
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {results.map((client) => {
                      const isExpanded = expandedFamilyIds.has(client.id);
                      const hasFamily = client.type === "Family" && client.familyMembers && client.familyMembers.length > 0;

                      return (
                        <div key={client.id}>
                          {/* Family Head / Individual row */}
                          <div className="flex items-center group">
                            <button
                              type="button"
                              onClick={() => selectFamilyHead(client)}
                              className="flex-1 text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                {initials(client.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColors[client.status]}`}>
                                    {client.status}
                                  </span>
                                  {hasFamily && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center gap-1">
                                      <Users className="size-3" />
                                      Family Head
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-xs text-blue-600 font-mono">{client.id}</span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <MapPin className="size-3" />{client.barangay}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="size-4 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                            </button>

                            {/* Expand family members toggle */}
                            {hasFamily && (
                              <button
                                type="button"
                                onClick={() => toggleFamily(client.id)}
                                className="flex-shrink-0 px-3 py-3 self-stretch flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 transition-colors border-l border-gray-100 font-medium"
                                title={isExpanded ? "Hide family members" : "Show family members"}
                              >
                                <Users className="size-3.5" />
                                <span className="hidden sm:inline">{client.familyMembers!.length}</span>
                                <ChevronDown className={`size-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            )}
                          </div>

                          {/* Family members sub-list */}
                          {hasFamily && isExpanded && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
                              <div className="px-4 py-1.5 flex items-center gap-2">
                                <div className="h-px flex-1 bg-blue-200" />
                                <p className="text-xs text-blue-600 font-semibold">
                                  Family Members of {client.firstName}
                                </p>
                                <div className="h-px flex-1 bg-blue-200" />
                              </div>
                              {client.familyMembers!.map((member) => (
                                <button
                                  key={member.id}
                                  type="button"
                                  onClick={() => selectMember(client, member)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-blue-100 transition-colors flex items-center gap-3 border-t border-blue-100/60 group"
                                >
                                  {/* Indent line */}
                                  <div className="flex-shrink-0 flex items-center gap-2 pl-4">
                                    <div className="w-px h-4 bg-blue-300" />
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                      {initials(member.name)}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${relColor(member.relationship)}`}>
                                        {member.relationship}
                                      </span>
                                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColors[member.status]}`}>
                                        {member.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                      <span className="text-xs text-gray-500">{member.age} yrs · {member.gender}</span>
                                      {member.occupation && (
                                        <span className="text-xs text-gray-500 truncate">{member.occupation}</span>
                                      )}
                                    </div>
                                  </div>
                                  <ChevronRight className="size-3.5 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : hasSearched ? (
                <div className="px-4 py-5 flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                    <UserX className="size-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Client not found</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      No record matching <span className="font-medium text-gray-700">"{query}"</span> in the Client Profiling database.
                      Please register the client first under <span className="text-blue-600 font-medium">Client Profiling & Records</span> before proceeding.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Selected card */}
      {selected && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${selected.member ? "bg-gradient-to-br from-indigo-400 to-purple-500" : "bg-gradient-to-br from-emerald-400 to-emerald-600"}`}>
              {initials(selected.member ? selected.member.name : selected.client.name)}
            </div>
            <div className="flex-1 min-w-0">
              {selected.member ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-900">{selected.member.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${relColor(selected.member.relationship)}`}>
                      {selected.member.relationship}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[selected.member.status]}`}>
                      {selected.member.status}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-600 font-mono mt-0.5">{selected.member.id}</p>
                  <div className="flex items-center gap-2 mt-1 p-2 bg-white/60 rounded-lg border border-emerald-100">
                    <Users className="size-3 text-blue-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600">
                      Family of <span className="font-semibold text-blue-700">{selected.client.name}</span>
                      <span className="text-gray-400 ml-1 font-mono">{selected.client.id}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Calendar className="size-3 text-gray-400" />
                      {selected.member.age} yrs · {selected.member.gender}
                    </span>
                    {selected.member.contactNumber && (
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Phone className="size-3 text-gray-400" />
                        {selected.member.contactNumber}
                      </span>
                    )}
                    {selected.member.occupation && (
                      <span className="text-xs text-gray-600 truncate">{selected.member.occupation}</span>
                    )}
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin className="size-3 text-gray-400" />
                      {selected.client.barangay}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-900">{selected.client.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[selected.client.status]}`}>
                      {selected.client.status}
                    </span>
                    {selected.client.type === "Family" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center gap-1">
                        <Users className="size-3" />
                        Family Head
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-blue-600 font-mono mt-0.5">{selected.client.id}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-2">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin className="size-3 text-gray-400" />{selected.client.barangay}
                    </span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Phone className="size-3 text-gray-400" />{selected.client.contactNumber}
                    </span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Calendar className="size-3 text-gray-400" />
                      DOB: {selected.client.dateOfBirth}
                    </span>
                    <span className="text-xs text-gray-600">
                      {selected.client.gender} · {selected.client.civilStatus}
                    </span>
                    {selected.client.occupation && (
                      <span className="text-xs text-gray-600 truncate">{selected.client.occupation}</span>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 text-emerald-600">
                <CheckCircle className="size-4" />
                <span className="text-xs font-semibold">Linked</span>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1 hover:border-red-200"
              >
                <X className="size-3" />
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {!selected && !query && (
        <p className="text-xs text-gray-400 mt-2 ml-1">
          Type at least 2 characters · Family heads expand to show members you can link directly.
        </p>
      )}
    </div>
  );
}
