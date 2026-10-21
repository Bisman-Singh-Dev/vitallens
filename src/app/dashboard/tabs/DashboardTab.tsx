"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Pill, 
  Syringe, 
  ShieldCheck, 
  ChevronRight, 
  ArrowUpRight, 
  Sparkles, 
  AlertTriangle,
  QrCode
} from "lucide-react";
import { getActiveUser, getEmergencyProfile, getTimelineEvents, ClinicalTimelineItem } from "@/lib/vaultStore";

export interface DashboardTabProps {
  user: any;
  setActiveTab: (tab: string) => void;
  emergencyProfile?: any;
}

export default function DashboardTab({ user, setActiveTab, emergencyProfile }: DashboardTabProps) {
  const [events, setEvents] = useState<ClinicalTimelineItem[]>([]);
  const [activeProfile, setActiveProfile] = useState<any>(emergencyProfile);
  const [activeUser, setActiveUser] = useState<any>(user);

  useEffect(() => {
    const loadDynamicData = async () => {
      const u = getActiveUser();
      setActiveUser(u);
      const ep = await getEmergencyProfile(u?.id);
      setActiveProfile(ep);
      const evs = await getTimelineEvents(u?.id);
      setEvents(evs);
    };

    loadDynamicData();

    const handleUpdate = () => loadDynamicData();
    window.addEventListener("healththread_timeline_updated", handleUpdate);
    window.addEventListener("healththread_profile_updated", handleUpdate);
    window.addEventListener("vitallens_user_updated", handleUpdate);

    return () => {
      window.removeEventListener("healththread_timeline_updated", handleUpdate);
      window.removeEventListener("healththread_profile_updated", handleUpdate);
      window.removeEventListener("vitallens_user_updated", handleUpdate);
    };
  }, []);

  const patientName = activeUser?.displayName || "Patient";
  const healthId = activeUser?.healthId || activeUser?.ekycDetails?.abhaNumber || "ABHA Pending";
  const phoneNumber = activeUser?.phoneNumber || "Not provided";
  const bloodGroup = activeProfile?.bloodGroup || activeUser?.bloodGroup || "Not specified";

  // Calculate dynamic metrics from user's live profile & timeline (real 0 for fresh accounts)
  const totalEventsCount = events.length;
  const activeMedicationsCount = activeProfile?.currentMedications && 
    activeProfile.currentMedications !== "None" && 
    activeProfile.currentMedications !== "None reported"
      ? activeProfile.currentMedications.split(",").filter((s: string) => s.trim().length > 0).length 
      : 0;
  const knownAllergiesCount = activeProfile?.knownAllergies && 
    activeProfile.knownAllergies !== "None" && 
    activeProfile.knownAllergies !== "None reported" && 
    activeProfile.knownAllergies !== "None known"
      ? activeProfile.knownAllergies.split(",").filter((s: string) => s.trim().length > 0).length 
      : 0;
  const chronicConditionsCount = activeProfile?.chronicConditions && 
    activeProfile.chronicConditions !== "None" && 
    activeProfile.chronicConditions !== "None reported"
      ? activeProfile.chronicConditions.split(",").filter((s: string) => s.trim().length > 0).length 
      : 0;

  // Show the latest 3 recent events dynamically from the timeline
  const recentEvents = events.slice(0, 3);

  const getIcon = (type: ClinicalTimelineItem["iconType"]) => {
    switch (type) {
      case "report": return <FileText className="w-5 h-5" />;
      case "pill": return <Pill className="w-5 h-5" />;
      case "syringe": return <Syringe className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getIconBg = (type: ClinicalTimelineItem["iconType"]) => {
    switch (type) {
      case "report": return "bg-purple-50 text-purple-600 border-purple-200";
      case "pill": return "bg-orange-50 text-orange-600 border-orange-200";
      case "syringe": return "bg-sky-50 text-sky-600 border-sky-200";
      default: return "bg-emerald-50 text-emerald-600 border-emerald-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* DIGITAL HEALTH ID CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#05668d] via-[#028090] to-[#00a896] p-6 sm:p-8 text-white shadow-md border border-white/15">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/[0.06] pointer-events-none" />
        <div className="absolute right-28 bottom-0 -mb-20 w-60 h-60 rounded-full bg-[#48cae4]/[0.08] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold tracking-widest text-[#48cae4] uppercase">
                HealthThread Universal ID
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                {patientName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs sm:text-sm text-sky-100">
              <div>
                <span className="text-sky-200/80 block text-[11px] uppercase tracking-wider">Vault ID</span>
                <span className="font-semibold text-white tracking-wide font-mono">{healthId}</span>
              </div>
              <div>
                <span className="text-sky-200/80 block text-[11px] uppercase tracking-wider">Contact</span>
                <span className="font-semibold text-white tracking-wide">{phoneNumber || activeUser?.email || "Connected"}</span>
              </div>
              <div>
                <span className="text-sky-200/80 block text-[11px] uppercase tracking-wider">Blood Group</span>
                <span className="font-semibold text-white tracking-wide">{bloodGroup.replace(" Positive", "+").replace(" Negative", "-")}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-3 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#48cae4]" />
              <span>✓ HIPAA & GDPR Secured</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => alert(`HealthThread Global Medical Card\nMember: ${patientName}\nVault ID: ${healthId}\nStatus: Verified Encrypted Vault`)}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-[11px] font-semibold text-white border border-white/25 flex items-center gap-1.5 transition-colors"
                title="View Health QR"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR</span>
              </button>
              <button 
                onClick={() => setActiveTab("emergency")}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-[11px] font-semibold text-white border border-white/25 flex items-center gap-1.5 transition-colors"
              >
                <span>Emergency Card</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 DYNAMIC STATS METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab("timeline")}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-colors"
        >
          <p className="text-3xl sm:text-4xl font-bold text-slate-800">{totalEventsCount}</p>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Total Health Events</p>
        </div>

        <div 
          onClick={() => setActiveTab("emergency")}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-colors"
        >
          <p className="text-3xl sm:text-4xl font-bold text-slate-800">{activeMedicationsCount}</p>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Active Medication</p>
        </div>

        <div 
          onClick={() => setActiveTab("emergency")}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-colors"
        >
          <p className="text-3xl sm:text-4xl font-bold text-slate-800">{knownAllergiesCount}</p>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Known Allergy</p>
        </div>

        <div 
          onClick={() => setActiveTab("emergency")}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-colors"
        >
          <p className="text-3xl sm:text-4xl font-bold text-slate-800">{chronicConditionsCount}</p>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Chronic Condition</p>
        </div>
      </div>

      {/* RECENT HEALTH EVENTS SECTION */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Recent Health Events
          </h2>
          <button
            onClick={() => setActiveTab("timeline")}
            className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <span>View full timeline</span>
            <span>&rarr;</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentEvents.map((event) => (
            <div 
              key={event.id}
              onClick={() => setActiveTab("timeline")}
              className="py-4 flex items-center justify-between gap-4 group cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getIconBg(event.iconType)}`}>
                  {getIcon(event.iconType)}
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {event.provider} · {event.date || event.year}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                  event.status === "Verified" 
                    ? "text-emerald-600 bg-emerald-50 border-emerald-200" 
                    : "text-amber-700 bg-amber-50 border-amber-200"
                }`}>
                  {event.status}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}

          {recentEvents.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              No recent health events. Use Lifelong Timeline to add your first record.
            </div>
          )}
        </div>
      </div>

      {/* QUICK CLINICAL ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div 
          onClick={() => setActiveTab("ai-diagnostics")}
          className="bg-gradient-to-br from-slate-900 to-[#0e3c5d] text-white p-5 rounded-2xl border border-slate-700/60 cursor-pointer hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-bold text-sky-200 uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-sky-300" /> VitalLens RoboDoc AI
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-sky-200 transition-colors">
              AI Voice & Camera Vitals Scan
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              Instant multimodal symptom examination, heart pulse check, and gesture-driven clinical analysis.
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-all">
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("telemedicine")}
          className="bg-gradient-to-br from-red-900/90 to-red-950 text-white p-5 rounded-2xl border border-red-700/40 cursor-pointer hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-bold text-red-200 uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3 h-3 text-red-300" /> Care Services
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-red-200 transition-colors">
              Telemedicine & Emergency ER
            </h3>
            <p className="text-xs text-red-200/90 mt-1 max-w-sm">
              Connect with on-duty physicians, trigger instant SOS dispatch, or call nearby hospital emergency wards.
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-all">
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
