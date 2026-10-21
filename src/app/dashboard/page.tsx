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
  LogOut, 
  ShieldCheck, 
  Maximize2, 
  Minimize2,
  Menu,
  X,
  SidebarClose,
  SidebarOpen
} from "lucide-react";
import { HealthThreadLogo, TricolorBar } from "@/components/HealthThreadLogo";
import DashboardTab from "./tabs/DashboardTab";
import TimelineTab from "./tabs/TimelineTab";
import EmergencyProfileTab from "./tabs/EmergencyProfileTab";
import ConsentManagementTab from "./tabs/ConsentManagementTab";
import TelemedicineTab from "./tabs/TelemedicineTab";
import MaternalCareTab from "./tabs/MaternalCareTab";
import DoctorPortalTab from "./tabs/DoctorPortalTab";
import AIDiagnosticsTab from "./tabs/AIDiagnosticsTab";
import DocumentAnalysisTab from "./tabs/DocumentAnalysisTab";
import HealthManagerTab from "./tabs/HealthManagerTab";
import ProfileTab from "./tabs/ProfileTab";
import { getActiveUser, getEmergencyProfile, VaultUser, EmergencyMedicalProfile } from "@/lib/vaultStore";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [user, setUser] = useState<VaultUser | null>(() => {
    if (typeof window !== "undefined") {
      return getActiveUser();
    }
    return null;
  });
  const [emergencyProfile, setEmergencyProfile] = useState<EmergencyMedicalProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Immersive Fullscreen Device Mode (Hides all website elements, navbar, tabs, header)
  const [isRoboDocFullscreen, setIsRoboDocFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync account-specific user and emergency profile
  const syncAccountData = async () => {
    const activeU = getActiveUser();
    if (!activeU) {
      router.push("/login");
      return;
    }
    setUser(activeU);
    const ep = await getEmergencyProfile(activeU.id);
    setEmergencyProfile(ep);
  };

  useEffect(() => {
    syncAccountData();
    const handleUpdate = () => syncAccountData();
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
      case "ai-diagnostics": return "AI Voice & Camera Doctor (RoboDoc)";
      case "document-analysis": return "Document Analysis & OCR";
      case "health-manager": return "Health Manager & Alarms";
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

  // Guard against unauthenticated session
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0e3c5d] flex flex-col items-center justify-center text-white select-none">
        <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin mb-3" />
        <p className="text-xs text-sky-200 font-medium">Verifying National Health Vault session...</p>
      </div>
    );
  }

  // 1. FULLSCREEN IMMERSIVE ROBODOC VIEW (No website borders, no tabs, full screen display)
  if (isRoboDocFullscreen) {
    return (
      <div className="fixed inset-0 z-50 w-screen h-screen bg-[#050507] text-white flex flex-col overflow-hidden select-none">
        {/* Floating Top Floating Bar to exit or toggle website tabs */}
        <div className="absolute top-4 right-5 z-50 flex items-center gap-2">
          <button
            onClick={() => setIsRoboDocFullscreen(false)}
            className="px-3.5 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white text-xs font-semibold border border-slate-700/80 backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
            title="Exit Fullscreen Mode"
          >
            <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Show Website Tabs</span>
          </button>
          <button
            onClick={() => {
              setIsRoboDocFullscreen(false);
              setActiveTab("dashboard");
            }}
            className="p-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md shadow-lg transition-all"
            title="Close & Go to Dashboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* RoboDoc Multimodal Component occupying 100% of viewport */}
        <div className="w-full h-full flex-1">
          <AIDiagnosticsTab 
            user={user} 
            setActiveTab={setActiveTab} 
            onToggleFullscreen={() => setIsRoboDocFullscreen(false)}
            isFullscreen={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col select-none">
      
      {/* 1. TOP TRICOLOR BAR (Left Saffron, Right Green) */}
      <TricolorBar />

      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. LEFT SIDEBAR */}
        {!sidebarCollapsed && (
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

            {/* Navigation Items (Clean & Understandable) */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-xs font-semibold">
              
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

              {/* CARE SERVICES CATEGORY */}
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

              {/* CLINICAL AI CATEGORY */}
              <div className="pt-4 pb-1.5 px-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-sky-300/60">
                  Clinical AI Doctor
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

            </nav>

            {/* Bottom Sidebar Action Buttons */}
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
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </aside>
        )}

        {/* 3. MAIN WORKSPACE / HEADER & TABS CANVAS */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* TOP BAR / HEADER */}
          <header className="bg-white border-b border-slate-200 px-5 sm:px-8 py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-30">
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Sidebar toggle button (Hide tabs / full width) */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:flex p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                title={sidebarCollapsed ? "Show Sidebar Tabs" : "Hide Sidebar Tabs"}
              >
                {sidebarCollapsed ? <SidebarOpen className="w-4 h-4" /> : <SidebarClose className="w-4 h-4" />}
              </button>
              
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {getPageTitle()}
              </h1>
            </div>

            {/* Top Right Badges & Fullscreen Action */}
            <div className="flex items-center gap-2.5 relative">
              
              {/* Fullscreen Button for RoboDoc Device Mode (Hide Tabs) */}
              <button
                onClick={() => {
                  setActiveTab("ai-diagnostics");
                  setIsRoboDocFullscreen(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all border border-slate-700 hover:scale-105"
                title="Make Screen Fully Robot View (Hide Website Tabs)"
              >
                <Maximize2 className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>Robot Screen (Hide Tabs)</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs font-semibold shadow-2xs">
                <span>✓ eKYC Verified</span>
              </div>

              {/* Avatar circle */}
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-8 h-8 rounded-full bg-[#0e3c5d] hover:bg-[#0a2d48] text-white flex items-center justify-center text-xs font-bold shadow-xs transition-colors"
                title="Account Menu"
              >
                {getInitials(user?.displayName)}
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 top-11 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.displayName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    <p className="text-[10px] font-mono text-sky-700 mt-1">Health ID: {user?.healthId}</p>
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

                {/* RoboDoc AI Diagnostics with dedicated full screen option */}
                {activeTab === "ai-diagnostics" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold flex items-center gap-2">
                          <span>RoboDoc Multimodal AI Doctor</span>
                          <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                            Voice & Vision Active
                          </span>
                        </h3>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Voice-interactive clinical symptom analysis, heart rate scan, and gesture recognition.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setIsRoboDocFullscreen(true)}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Make Screen Fully Robot (Hide Tabs)</span>
                        </button>
                        <button
                          onClick={() => setActiveTab("dashboard")}
                          className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                        >
                          &larr; Dashboard
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-[#070709] min-h-[700px] relative">
                      <AIDiagnosticsTab 
                        user={user} 
                        setActiveTab={setActiveTab} 
                        onToggleFullscreen={() => setIsRoboDocFullscreen(true)}
                        isFullscreen={false}
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
