"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Activity, Bell, HeartPulse, ShoppingBag, User as UserIcon, LogOut, ShieldAlert } from "lucide-react";
import DiseasesTab from "./tabs/DiseasesTab";
import HealthManagerTab from "./tabs/HealthManagerTab";
import MyHealthTab from "./tabs/MyHealthTab";
import StoreTab from "./tabs/StoreTab";
import ProfileTab from "./tabs/ProfileTab";
import AIDiagnosticsTab from "./tabs/AIDiagnosticsTab";
import DocumentAnalysisTab from "./tabs/DocumentAnalysisTab";
import VoiceAlarmsTab from "./tabs/VoiceAlarmsTab";
import { MessageSquareText, FileSearch, AlarmClock } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ai-diagnostics");
  const [user, setUser] = useState<any>(null);
  const [latestScan, setLatestScan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startVoiceAlarmFlow, setStartVoiceAlarmFlow] = useState(false);

  useEffect(() => {
    const initGuest = async () => {
      // Instantly mock the guest user to completely bypass Firebase loading times
      setUser({ id: "guest_user", displayName: "Guest User", email: "guest@example.com", onboardingComplete: true });
      setIsLoading(false);
    };
    
    initGuest();
  }, []);

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
             alarmTimeStr = "0" + alarmTimeStr; // pad '9:30' to '09:30'
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
      <div className="flex-1 min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: "ai-diagnostics", label: "AI Diagnostics", icon: <MessageSquareText className="w-5 h-5" /> },
    { id: "health-manager", label: "Health Manager", icon: <Bell className="w-5 h-5" /> },
  ];

  const isFullScreenTab = activeTab === "ai-diagnostics" || activeTab === "health-manager";

  return (
    <div className="flex-1 min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Navigation */}
      {!isFullScreenTab && (
        <aside className="w-full md:w-64 bg-card border-r border-border/50 flex flex-col">
          <div className="p-6 pb-2">
            <div className="flex items-center gap-2 mb-8">
              <HeartPulse className="w-8 h-8 text-brand-500" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-brand-700">
                RoboDoc
              </span>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-brand-50 text-brand-700 font-medium"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full relative overflow-y-auto bg-background">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={isFullScreenTab ? "w-full min-h-screen" : "max-w-4xl mx-auto p-4 md:p-8"}
          >
            {activeTab === "diseases" && <DiseasesTab user={user} latestScan={latestScan} />}
            {activeTab === "ai-diagnostics" && <AIDiagnosticsTab user={user} setActiveTab={setActiveTab} setStartVoiceAlarmFlow={setStartVoiceAlarmFlow} />}
            {activeTab === "document-analysis" && <DocumentAnalysisTab user={user} />}
            {activeTab === "voice-alarms" && <VoiceAlarmsTab />}
            {activeTab === "health-manager" && <HealthManagerTab user={user} setActiveTab={setActiveTab} />}
            {activeTab === "my-health" && <MyHealthTab user={user} />}
            {activeTab === "store" && <StoreTab />}
            {activeTab === "profile" && <ProfileTab user={user} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
