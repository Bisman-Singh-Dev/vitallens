"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Pill, 
  Syringe, 
  Activity, 
  Building2, 
  CheckCircle2, 
  Upload, 
  Plus, 
  X, 
  Trash2,
  Calendar, 
  User, 
  ShieldCheck,
  Search,
  Download
} from "lucide-react";
import { 
  getTimelineEvents, 
  addTimelineEvent, 
  deleteTimelineEvent, 
  ClinicalTimelineItem, 
  getActiveUser 
} from "@/lib/vaultStore";

const CATEGORIES = [
  "All",
  "Vaccinations",
  "Prescriptions",
  "Lab Reports",
  "Surgeries",
  "Hospital Visits"
] as const;

export default function TimelineTab({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [events, setEvents] = useState<ClinicalTimelineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<ClinicalTimelineItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Event Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<ClinicalTimelineItem["category"]>("Prescriptions");
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newProvider, setNewProvider] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const loadData = async () => {
    const user = getActiveUser();
    const data = await getTimelineEvents(user?.id);
    setEvents(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("healththread_timeline_updated", handleUpdate);
    return () => window.removeEventListener("healththread_timeline_updated", handleUpdate);
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesCategory = selectedCategory === "All" || ev.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ev.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.year.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let icon: ClinicalTimelineItem["iconType"] = "report";
    if (newCategory === "Vaccinations") icon = "syringe";
    else if (newCategory === "Prescriptions") icon = "pill";
    else if (newCategory === "Lab Reports") icon = "lab";
    else if (newCategory === "Surgeries") icon = "surgery";
    else if (newCategory === "Hospital Visits") icon = "hospital";

    const user = getActiveUser();
    await addTimelineEvent({
      year: newYear.trim() || new Date().getFullYear().toString(),
      date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      category: newCategory,
      title: newTitle.trim(),
      provider: newProvider.trim() || "Patient Uploaded Record",
      notes: newNotes.trim(),
      status: "Patient Uploaded",
      iconType: icon
    }, user?.id);

    setShowAddModal(false);
    setNewTitle("");
    setNewProvider("");
    setNewNotes("");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this record from your lifelong timeline?")) {
      const user = getActiveUser();
      await deleteTimelineEvent(id, user?.id);
      setSelectedEvent(null);
    }
  };

  const renderIcon = (type: ClinicalTimelineItem["iconType"]) => {
    switch (type) {
      case "report":
        return <FileText className="w-4 h-4 text-purple-600" />;
      case "pill":
        return <Pill className="w-4 h-4 text-orange-500" />;
      case "syringe":
        return <Syringe className="w-4 h-4 text-sky-600" />;
      case "lab":
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case "surgery":
      case "hospital":
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const getIconBorder = (type: ClinicalTimelineItem["iconType"]) => {
    switch (type) {
      case "report": return "border-purple-200 bg-purple-50";
      case "pill": return "border-orange-200 bg-orange-50";
      case "syringe": return "border-sky-200 bg-sky-50";
      case "lab": return "border-emerald-200 bg-emerald-50";
      case "surgery": return "border-indigo-200 bg-indigo-50";
      default: return "border-slate-200 bg-slate-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* FILTER BUTTONS ROW (Image 2) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#0d3859] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* TIMELINE LIST CONTAINER (Image 2) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="relative">
          {/* Vertical Timeline Guide Line */}
          <div className="absolute left-[78px] sm:left-[88px] top-6 bottom-6 w-[1.5px] bg-slate-200 pointer-events-none" />

          <div className="space-y-6">
            {filteredEvents.map((ev) => (
              <div 
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className="relative flex items-start gap-4 sm:gap-6 group cursor-pointer hover:bg-slate-50/80 p-2 sm:p-3 rounded-xl transition-all"
              >
                {/* Year Label */}
                <div className="w-12 sm:w-14 text-right shrink-0 pt-1">
                  <span className="text-xs sm:text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                    {ev.year}
                  </span>
                </div>

                {/* Circular Node Icon */}
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 shadow-2xs ${getIconBorder(ev.iconType)}`}>
                  {renderIcon(ev.iconType)}
                </div>

                {/* Event Content Details */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {ev.title}
                    </h3>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {ev.status === "Verified" ? (
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                          Patient Uploaded
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    {ev.provider}
                  </p>

                  {ev.notes && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {ev.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {!isLoading && filteredEvents.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-700">No clinical records found in this vault.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Add your prescriptions, lab reports, surgeries, or doctor notes to build your lifelong chronological health timeline.
                </p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 bg-[#0e3c5d] text-white rounded-xl text-xs font-semibold hover:bg-[#0a2c44] transition-colors shadow-xs"
                >
                  + Add Your First Record
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getIconBorder(selectedEvent.iconType)}`}>
                {renderIcon(selectedEvent.iconType)}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {selectedEvent.category} · {selectedEvent.year}
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedEvent.title}
                </h3>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Clinical Provider / Location</span>
                <span className="font-semibold text-slate-900">{selectedEvent.provider}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Recorded Date</span>
                <span>{selectedEvent.date || selectedEvent.year}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Verification Status</span>
                <span className={selectedEvent.status === "Verified" ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                  {selectedEvent.status} by HealthThread Global Registry
                </span>
              </div>
              {selectedEvent.notes && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Clinical Summary & Notes</span>
                  <p className="mt-0.5 leading-relaxed text-slate-800">{selectedEvent.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedEvent.id)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    alert(`Downloading cryptographic medical record for: ${selectedEvent.title}`);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-[#0d3859] hover:bg-[#0a2d48] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW TIMELINE RECORD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddEvent}
            className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 p-6 relative animate-in fade-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Clinical Timeline Event</h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
              <input 
                type="text" 
                placeholder="e.g. Dental Root Canal / Blood Test" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select 
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-900"
                >
                  <option value="Prescriptions">Prescriptions</option>
                  <option value="Vaccinations">Vaccinations</option>
                  <option value="Lab Reports">Lab Reports</option>
                  <option value="Surgeries">Surgeries</option>
                  <option value="Hospital Visits">Hospital Visits</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                <input 
                  type="text" 
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital / Clinic / Doctor</label>
              <input 
                type="text" 
                placeholder="e.g. Max Healthcare · Dr. Sharma" 
                value={newProvider}
                onChange={(e) => setNewProvider(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Notes & Findings</label>
              <textarea 
                rows={3}
                placeholder="Observations, dosage, or summary notes..." 
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0d3859] hover:bg-[#0a2d48] rounded-lg"
              >
                Save to Timeline
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
