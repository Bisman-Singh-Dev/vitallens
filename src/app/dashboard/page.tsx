"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { 
  HeartPulse, 
  MessageSquareText, 
  Bell, 
  History, 
  X, 
  LogOut, 
  User as UserIcon, 
  LogIn,
  Eye,
  Activity
} from "lucide-react";
import DiseasesTab from "./tabs/DiseasesTab";
import HealthManagerTab from "./tabs/HealthManagerTab";
import MyHealthTab from "./tabs/MyHealthTab";
import StoreTab from "./tabs/StoreTab";
import ProfileTab from "./tabs/ProfileTab";
import AIDiagnosticsTab from "./tabs/AIDiagnosticsTab";
import DocumentAnalysisTab from "./tabs/DocumentAnalysisTab";
import VoiceAlarmsTab from "./tabs/VoiceAlarmsTab";
import HistoryTab from "./tabs/HistoryTab";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ai-diagnostics");
  const [user, setUser] = useState<any>(null);
  const [latestScan, setLatestScan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startVoiceAlarmFlow, setStartVoiceAlarmFlow] = useState(false);

  // Load user session from localStorage or Firebase
  const syncUserSession = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vitallens_active_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
          setIsLoading(false);
          return;
        } catch (e) {}
      }
    }

    if (auth.currentUser) {
      setUser({
        id: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || "User",
        email: auth.currentUser.email,
        photoURL: auth.currentUser.photoURL
      });
    } else {
      setUser({ id: "guest_user", displayName: "Guest User", email: "guest@example.com", onboardingComplete: true });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    syncUserSession();

    const handleUserUpdate = () => syncUserSession();
    window.addEventListener("vitallens_user_updated", handleUserUpdate);
    return () => window.removeEventListener("vitallens_user_updated", handleUserUpdate);
  }, []);

  const handleVoiceLogin = (userName: string) => {
    setUser({
      id: userName.toLowerCase() + "_user",
      displayName: userName,
      email: `${userName.toLowerCase()}@vitallens.health`,
      isVoiceLoggedIn: true,
      onboardingComplete: true
    });
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vitallens_active_user");
    }
    try {
      auth.signOut();
    } catch(e) {}
    setUser({ id: "guest_user", displayName: "Guest User", email: "guest@example.com" });
    setActiveTab("ai-diagnostics");
  };

  // Background alarm trigger service
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
        const alarms: any[] = JSON.parse(saved);
        for (const alarm of alarms) {
          if (!alarm.time) continue;
          
          let alarmTimeStr = alarm.time;
          if (alarmTimeStr.length === 4) {
             alarmTimeStr = "0" + alarmTimeStr;
          }

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
      }
    };

    const interval = setInterval(checkAlarms, 10000); 
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-[#070709] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  const isFullscreenVoice = activeTab === "ai-diagnostics";

  return (
    <div className="flex-1 min-h-screen bg-[#070709] text-white flex flex-col md:flex-row overflow-hidden relative">
      
      {/* Floating Top Floating Bar when on non-fullscreen or to switch tabs */}
      {!isFullscreenVoice && (
        <aside className="w-full md:w-64 bg-neutral-900/90 border-r border-slate-800/80 flex flex-col p-5 backdrop-blur-xl shrink-0 z-20">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <button 
              onClick={() => setActiveTab("ai-diagnostics")}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-black border border-slate-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <span className="text-lg font-black tracking-wider text-white">RoboDoc</span>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">VitalLens AI</span>
              </div>
            </button>
          </div>

          <nav className="space-y-1.5 mt-6 flex-1">
            <button
              onClick={() => setActiveTab("ai-diagnostics")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "ai-diagnostics"
                  ? "bg-slate-800 text-white shadow-[0_0_15px_rgba(226,232,240,0.1)] border border-slate-700"
                  : "text-slate-400 hover:bg-neutral-800/60 hover:text-white"
              }`}
            >
              <MessageSquareText className="w-4 h-4 text-slate-300" />
              AI Voice Diagnostics
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-slate-800 text-white shadow-[0_0_15px_rgba(226,232,240,0.1)] border border-slate-700"
                  : "text-slate-400 hover:bg-neutral-800/60 hover:text-white"
              }`}
            >
              <History className="w-4 h-4 text-slate-300" />
              Diagnosis & Image Vault
            </button>

            <button
              onClick={() => setActiveTab("health-manager")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "health-manager"
                  ? "bg-slate-800 text-white shadow-[0_0_15px_rgba(226,232,240,0.1)] border border-slate-700"
                  : "text-slate-400 hover:bg-neutral-800/60 hover:text-white"
              }`}
            >
              <Bell className="w-4 h-4 text-slate-300" />
              Health Manager
            </button>

            <button
              onClick={() => setActiveTab("diseases")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "diseases"
                  ? "bg-slate-800 text-white shadow-[0_0_15px_rgba(226,232,240,0.1)] border border-slate-700"
                  : "text-slate-400 hover:bg-neutral-800/60 hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4 text-slate-300" />
              Biomarker Insights
            </button>
          </nav>

          {/* User profile / Logout bottom */}
          <div className="pt-4 border-t border-slate-800 mt-auto">
            {user?.displayName && user.displayName !== "Guest User" ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In / Login
              </Link>
            )}
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full relative overflow-y-auto bg-[#070709]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={isFullscreenVoice ? "w-full min-h-screen" : "w-full min-h-screen"}
          >
            {activeTab === "ai-diagnostics" && (
              <AIDiagnosticsTab 
                user={user} 
                setActiveTab={setActiveTab} 
                setStartVoiceAlarmFlow={setStartVoiceAlarmFlow}
                onVoiceLogin={handleVoiceLogin}
              />
            )}
            {activeTab === "history" && (
              <HistoryTab onClose={() => setActiveTab("ai-diagnostics")} />
            )}
            {activeTab === "health-manager" && (
              <HealthManagerTab user={user} setActiveTab={setActiveTab} />
            )}
            {activeTab === "diseases" && (
              <div className="max-w-4xl mx-auto p-6 md:p-10">
                <DiseasesTab user={user} latestScan={latestScan} />
              </div>
            )}
            {activeTab === "profile" && (
              <div className="max-w-4xl mx-auto p-6 md:p-10">
                <ProfileTab user={user} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
