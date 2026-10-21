"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  History, 
  ShieldAlert, 
  Lock, 
  Stethoscope, 
  Baby, 
  Bot, 
  FileText, 
  Bell, 
  Activity, 
  ShoppingBag, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  Maximize2, 
  Minimize2,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { HealthThreadLogo, TricolorBar } from "@/components/HealthThreadLogo";
import DashboardTab from "./tabs/DashboardTab";
import TimelineTab from "./tabs/TimelineTab";
import EmergencyProfileTab from "./tabs/EmergencyProfileTab";
import ConsentManagementTab from "./tabs/ConsentManagementTab";
import TelemedicineTab from "./tabs/TelemedicineTab";
import MaternalCareTab from "./tabs/MaternalCareTab";
import DoctorPortalTab from "./tabs/DoctorPortalTab";

// Preserved VitalLens tabs
import AIDiagnosticsTab from "./tabs/AIDiagnosticsTab";
import DocumentAnalysisTab from "./tabs/DocumentAnalysisTab";
import HealthManagerTab from "./tabs/HealthManagerTab";
import DiseasesTab from "./tabs/DiseasesTab";
import StoreTab from "./tabs/StoreTab";
import ProfileTab from "./tabs/ProfileTab";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [user, setUser] = useState<any>(null);
  const [emergencyProfile, setEmergencyProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Sync user and emergency profile from storage
  const syncData = () => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("vitallens_active_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {}
      } else {
        setUser({
          id: "aradhya_tripathi",
          displayName: "Aradhya Tripathi",
          email: "aradhya.tripathi@healthvault.in",
          healthId: "HT-2026-88231",
          phoneNumber: "+91 98765 43210",
          bloodGroup: "B+",
          isVerified: true
        });
      }

      const storedEmergency = localStorage.getItem("healththread_emergency_profile");
      if (storedEmergency) {
        try {
          setEmergencyProfile(JSON.parse(storedEmergency));
        } catch (e) {}
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    syncData();
    const handleUpdate = () => syncData();
    window.addEventListener("vitallens_user_updated", handleUpdate);
    window.addEventListener("healththread_profile_updated", handleUpdate);
    return () => {
      window.removeEventListener("vitallens_user_updated", handleUpdate);
      window.removeEventListener("healththread_profile_updated", handleUpdate);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vitallens_active_user");
    }
    try {
      auth.signOut();
    } catch(e) {}
    router.push("/login");
  };

  // Background alarm trigger service (retained from VitalLens)
  useEffect(() => {
    let lastFiredMinute = "";

    const checkAlarms = async () => {
      const now = new Date();
      const currentMinute = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const currentDay = dayNames[now.getDay()];

      if (currentMinute === lastFiredMinute) return;

      const saved = localStorage.getItem("roboDocAlarms");
      if (saved) {
        try {
          const alarms: any[] = JSON.parse(saved);
          for (const alarm of alarms) {
            if (!alarm.time) continue;
            let alarmTimeStr = alarm.time.length === 4 ? "0" + alarm.time : alarm.time;

            if (alarm.isActive && alarmTimeStr === currentMinute && (alarm.days.includes("Everyday") || alarm.days.includes(currentDay))) {
              lastFiredMinute = currentMinute;
              try {
                const ttsRes = await fetch("/api/tts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ text: alarm.message })
                });
                if (ttsRes.ok) {
                  const audioBlob = await ttsRes.blob();
                  const audioUrl = URL.createObjectURL(audioBlob);
                  const audio = new Audio(audioUrl);
                  audio.play();
                }
              } catch (e) {
                console.error("Alarm TTS failed", e);
              }
              break;
            }
          }
        } catch (e) {}
      }
    };

    const interval = setInterval(checkAlarms, 10000); 
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboard";
      case "timeline": return "Lifelong Timeline";
      case "emergency": return "Emergency Profile";
      case "consent": return "Consent Management";
      case "telemedicine": return "Telemedicine & Emergency Access";
      case "maternal": return "Maternal Care";
      case "doctor-portal": return "Doctor Portal & Clinical Staff";
      case "ai-diagnostics": return "AI Diagnostics & Voice Assist (VitalLens)";
      case "document-analysis": return "Document Analysis";
      case "health-manager": return "Health Manager & Alarms";
      case "diseases": return "Biomarker Insights";
      case "store": return "Wearables Store";
      case "profile": return "Account Settings";
      default: return "HealthThread Vault";
    }
  };

  const getInitials = (name?: string) => {
    if (!name || name === "User" || name === "Guest User") return "AT";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-[#0e3c5d] rounded-full animate-spin" />
      </div>
    );
  }

  const isFullscreenAIDiagnostics = activeTab === "ai-diagnostics-fullscreen";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col select-none">
      
      {/* 1. TOP TRICOLOR BAR (Left Saffron, Right Green) */}
      <TricolorBar />

      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. LEFT SIDEBAR (Images 1, 2, 3, 5) */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#0e3c5d] text-white flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static shrink-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          
          {/* Top Brand Logo Section */}
          <div className="p-5 pb-6 border-b border-[#164e75]/60 flex items-center justify-between">
            <HealthThreadLogo />
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-xs font-semibold">
            
            {/* Primary HealthThread Vault Items (Images 1-3) */}
            <button
              onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "dashboard"
                  ? "bg-[#164e75] text-white shadow-xs font-bold"
                  : "text-slate-300 hover:bg-[#134468] hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-sky-300" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab("timeline"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "timeline"
                  ? "bg-[#164e75] text-white shadow-xs font-bold"
                  : "text-slate-300 hover:bg-[#134468] hover:text-white"
              }`}
            >
              <History className="w-4 h-4 text-amber-300" />
              <span>Lifelong Timeline</span>
            </button>

            <button
              onClick={() => { setActiveTab("emergency"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "emergency"
                  ? "bg-[#164e75] text-white shadow-xs font-bold"
                  : "text-slate-300 hover:bg-[#134468] hover:text-white"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-cyan-300" />
              <span>Emergency Profile</span>
            </button>

            <button
              onClick={() => { setActiveTab("consent"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "consent"
                  ? "bg-[#164e75] text-white shadow-xs font-bold"
                  : "text-slate-300 hover:bg-[#134468] hover:text-white"
              }`}
            >
              <Lock className="w-4 h-4 text-emerald-300" />
              <span>Consent Management</span>
            </button>

            {/* CARE SERVICES CATEGORY (Images 1, 2, 3, 5) */}
            <div className="pt-4 pb-1.5 px-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-300/60">
                Care Services
              </span>
            </div>

            <button
              onClick={() => { setActiveTab("telemedicine"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "telemedicine"
                  ? "bg-[#164e75] text-white shadow-xs font-bold"
                  : "text-slate-300 hover:bg-[#134468] hover:text-white"
              }`}
            >
              <Stethoscope className="w-4 h-4 text-pink-300" />
              <span>Telemedicine & ER</span>
            </button>

            <button
              onClick={() => { setActiveTab("maternal"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "maternal"
                  ? "bg-[#164e75] text-white shadow-xs font-bold"
                  : "text-slate-300 hover:bg-[#134468] hover:text-white"
              }`}
            >
              <Baby className="w-4 h-4 text-amber-300" />
              <span>Maternal Care</span>
            </button>

            {/* VITAL LENS CLINICAL AI (Preserved features) */}
            <div className="pt-4 pb-1.5 px-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-300/60">
                VitalLens Clinical AI
              </span>
            </div>

            <button
              onClick={() => { setActiveTab("ai-diagnostics"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "ai-diagnostics"
                  ? "bg-[#164e75] text-white shadow-xs font-bold"
                  : "text-slate-300 hover:bg-[#134468] hover:text-white"
              }`}
            >
              <Bot className="w-4 h-4 text-purple-300" />
              <span>AI Voice & Camera Doctor</span>
            </button>

            <button
              onClick={() => { setActiveTab("document-analysis"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "document-analysis"
                  ? "bg-[#164e75] text-white shadow-xs font-bold"
                  : "text-slate-300 hover:bg-[#134468] hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4 text-blue-300" />
              <span>Document & Lab OCR</span>
            </button>

            <button
              onClick={() => { setActiveTab("health-manager"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "health-manager"
                  ? "bg-[#164e75] text-white shadow-xs font-bold"
                  : "text-slate-300 hover:bg-[#134468] hover:text-white"
              }`}
            >
              <Bell className="w-4 h-4 text-yellow-300" />
              <span>Health Manager & Alarms</span>
            </button>

            <button
              onClick={() => { setActiveTab("diseases"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "diseases"
                  ? "bg-[#164e75] text-white shadow-xs font-bold"
                  : "text-slate-300 hover:bg-[#134468] hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-300" />
              <span>Biomarker Insights</span>
            </button>

            <button
              onClick={() => { setActiveTab("store"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "store"
                  ? "bg-[#164e75] text-white shadow-xs font-bold"
                  : "text-slate-300 hover:bg-[#134468] hover:text-white"
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-sky-300" />
              <span>Wearables Store</span>
            </button>

          </nav>

          {/* Bottom Sidebar Action Buttons (Images 1, 2, 3, 5) */}
          <div className="p-3.5 border-t border-[#164e75]/60 space-y-2 mt-auto">
            <button
              onClick={() => {
                setActiveTab(activeTab === "doctor-portal" ? "dashboard" : "doctor-portal");
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#134468]/70 hover:bg-[#134468] text-[11px] font-semibold text-sky-100 flex items-center justify-center gap-2 transition-all border border-[#1b5886]"
            >
              <span>... Switch to {activeTab === "doctor-portal" ? "Patient Vault" : "Doctor Portal"}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-1.5 px-3 rounded-lg text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <span>← Log out</span>
            </button>
          </div>
        </aside>

        {/* 3. MAIN WORKSPACE / HEADER & TABS CANVAS */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* TOP BAR / HEADER (Exact match from images) */}
          <header className="bg-white border-b border-slate-200 px-5 sm:px-8 py-4 flex items-center justify-between shrink-0 sticky top-0 z-30">
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {getPageTitle()}
              </h1>
            </div>

            {/* Top Right Badges (✓ eKYC Verified + Avatar "AT") */}
            <div className="flex items-center gap-3 relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs font-semibold shadow-2xs">
                <span>✓ eKYC Verified</span>
              </div>

              {/* Avatar circle "AT" */}
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-9 h-9 rounded-full bg-[#0e3c5d] hover:bg-[#0a2d48] text-white flex items-center justify-center text-xs font-bold shadow-xs transition-colors"
                title="User Profile Menu"
              >
                {getInitials(user?.displayName)}
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.displayName || "Aradhya Tripathi"}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email || "aradhya.tripathi@healthvault.in"}</p>
                    <p className="text-[10px] font-mono text-sky-700 mt-1">ID: {user?.healthId || "HT-2026-88231"}</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={() => { setActiveTab("emergency"); setShowUserDropdown(false); }}
                      className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      Emergency Profile
                    </button>
                    <button
                      onClick={() => { setActiveTab("consent"); setShowUserDropdown(false); }}
                      className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      Consent Management
                    </button>
                    <button
                      onClick={() => { setActiveTab("profile"); setShowUserDropdown(false); }}
                      className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      Account Settings
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-1.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </header>

          {/* MAIN TAB CONTENT CONTAINER */}
          <main className="p-5 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="w-full"
              >
                {activeTab === "dashboard" && (
                  <DashboardTab 
                    user={user} 
                    setActiveTab={setActiveTab} 
                    emergencyProfile={emergencyProfile}
                  />
                )}

                {activeTab === "timeline" && (
                  <TimelineTab setActiveTab={setActiveTab} />
                )}

                {activeTab === "emergency" && (
                  <EmergencyProfileTab user={user} />
                )}

                {activeTab === "consent" && (
                  <ConsentManagementTab />
                )}

                {activeTab === "telemedicine" && (
                  <TelemedicineTab user={user} emergencyProfile={emergencyProfile} />
                )}

                {activeTab === "maternal" && (
                  <MaternalCareTab setActiveTab={setActiveTab} />
                )}

                {activeTab === "doctor-portal" && (
                  <DoctorPortalTab 
                    onSwitchBack={() => setActiveTab("dashboard")} 
                  />
                )}

                {/* Preserved VitalLens tabs with integrated clinical styling */}
                {activeTab === "ai-diagnostics" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold">VitalLens RoboDoc AI Consultation</h3>
                        <p className="text-xs text-slate-300">Voice-interactive clinical diagnostics & vision sensor</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("dashboard")}
                        className="text-xs font-semibold text-sky-300 hover:underline"
                      >
                        &larr; Back to Dashboard
                      </button>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-[#070709] min-h-[700px]">
                      <AIDiagnosticsTab 
                        user={user} 
                        setActiveTab={setActiveTab} 
                      />
                    </div>
                  </div>
                )}

                {activeTab === "document-analysis" && (
                  <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-sm">
                    <DocumentAnalysisTab user={user} />
                  </div>
                )}

                {activeTab === "health-manager" && (
                  <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-sm">
                    <HealthManagerTab user={user} setActiveTab={setActiveTab} />
                  </div>
                )}

                {activeTab === "diseases" && (
                  <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-sm">
                    <DiseasesTab user={user} latestScan={null} setActiveTab={setActiveTab} />
                  </div>
                )}

                {activeTab === "store" && (
                  <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-sm">
                    <StoreTab />
                  </div>
                )}

                {activeTab === "profile" && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
                    <ProfileTab user={user} />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </main>

        </div>

      </div>

    </div>
  );
}
