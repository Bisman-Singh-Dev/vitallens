"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Lock, 
  Sparkles, 
  Volume2,
  VolumeX,
  Radio,
  Laptop,
  Smartphone,
  ChevronRight,
  Globe2,
  Check,
  Download,
  Layers,
  HeartPulse,
  Activity,
  Flame,
  Zap,
  Play,
  Maximize2
} from "lucide-react";
import Link from "next/link";
import { HealthThreadLogo, BrandAccentBar } from "@/components/HealthThreadLogo";
import CuteNeonEyes from "@/components/CuteNeonEyes";
import { getActiveUser, VaultUser, signInWithGoogleAuth } from "@/lib/vaultStore";
import { triggerPwaInstall } from "@/components/PwaInstallPrompt";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<VaultUser | null>(null);
  const [isPlayingLumiSample, setIsPlayingLumiSample] = useState(false);
  const [activeVoiceSnippet, setActiveVoiceSnippet] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);
    const handleUpdate = () => setCurrentUser(getActiveUser());
    window.addEventListener("vitallens_user_updated", handleUpdate);
    return () => {
      window.removeEventListener("vitallens_user_updated", handleUpdate);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleQuickGoogle = async () => {
    try {
      await signInWithGoogleAuth("patient");
      router.push("/dashboard");
    } catch (e) {
      router.push("/login");
    }
  };

  // Play Lumi's Deepgram Aura Asteria Female Voice Preview
  const playLumiVoiceSample = async (phrase?: string) => {
    if (isPlayingLumiSample && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingLumiSample(false);
      setActiveVoiceSnippet(null);
      return;
    }

    const textToSpeak = phrase || "Hello! I am Lumi, your health companion. I keep your medical history synchronized in Vault and connect with Beacon across your home.";
    setIsPlayingLumiSample(true);
    setActiveVoiceSnippet(textToSpeak);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlayingLumiSample(false);
          setActiveVoiceSnippet(null);
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlayingLumiSample(false);
          setActiveVoiceSnippet(null);
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };

        await audio.play();
        return;
      }
    } catch (e) {
      console.warn("Lumi TTS audio error:", e);
    }

    // Fallback to browser TTS if offline
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(textToSpeak);
      u.rate = 1.0;
      u.onend = () => {
        setIsPlayingLumiSample(false);
        setActiveVoiceSnippet(null);
      };
      window.speechSynthesis.speak(u);
    } else {
      setIsPlayingLumiSample(false);
      setActiveVoiceSnippet(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcfd] text-slate-900 flex flex-col select-none overflow-x-hidden font-sans">
      
      {/* 1. TOP BRAND ACCENT BAR: Deep Teal, Mint, Vibrant Sky Cyan, Ocean Blue */}
      <BrandAccentBar />

      {/* 2. REFINED HEADER WITH ZERO HARDCODING */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/70 sticky top-0 z-50 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            <HealthThreadLogo />
            
            <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
              <a href="#vault" className="hover:text-[#00a896] transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a896]" />
                Vault
              </a>
              <a href="#beacon" className="hover:text-[#00b4d8] transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00b4d8]" />
                Beacon
              </a>
              <a href="#lumi" className="hover:text-[#0077b6] transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0077b6]" />
                Lumi AI
              </a>
              <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
                How It Works
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerPwaInstall()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#00a896]" />
              <span>Install App</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Signed in as</span>
                  <span className="text-xs text-slate-800 font-bold max-w-[140px] truncate">
                    {currentUser.displayName}
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00a896] via-[#00b4d8] to-[#0077b6] hover:opacity-95 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <span>Open Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00a896] to-[#0077b6] hover:opacity-95 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 3. HERO SECTION - SLEEK, COMPACT, DEPTH-PACKED WITH FLOWING GRADIENT */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-8 border-b border-slate-200/70 bg-gradient-to-b from-[#f0f9ff]/80 via-white to-[#fafcfd]">
        
        {/* Animated Flowing Gradient Mesh Orbs */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[720px] h-[440px] bg-gradient-to-tr from-[#00a896]/15 via-[#48cae4]/20 to-[#0077b6]/15 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#48cae4]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#0077b6]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-5">
          
          {/* Ecosystem Pill with glowing dot */}
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-teal-200/80 shadow-xs text-xs font-semibold text-slate-700 hover:border-teal-400 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#00a896] animate-ping" />
            <span className="text-[#00a896] font-bold">HealthThread Ecosystem</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600 font-medium">Software, Product & AI Companion</span>
          </motion.div>

          {/* Hero Title (Crisp, cohesive, fits comfortably on standard viewports) */}
          <motion.h1 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] max-w-4xl mx-auto"
          >
            Your Health,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a896] via-[#00b4d8] to-[#0077b6]">
              Connected.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal"
          >
            A seamless proactive loop. Your complete history secured in <strong>Vault</strong>, your home synced through <strong>Beacon</strong>, and diagnostic clarity through <strong>Lumi AI</strong> with natural voice.
          </motion.p>

          {/* CTA Group with Voice Demo & Google Login */}
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <button
              onClick={handleQuickGoogle}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300/90 text-slate-800 font-bold text-xs sm:text-sm tracking-wide shadow-sm hover:shadow transition-all flex items-center gap-2.5 active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <Link
              href="/login"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00a896] via-[#00b4d8] to-[#0077b6] hover:opacity-95 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Open Your Vault Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Interactive Deepgram Female Voice Trigger */}
            <button
              onClick={() => playLumiVoiceSample()}
              className={`px-4 py-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm ${
                isPlayingLumiSample 
                  ? "bg-teal-50 border-teal-400 text-[#00a896] animate-pulse"
                  : "bg-white hover:bg-slate-50 border-slate-300 text-slate-700"
              }`}
              title="Hear Lumi's new Deepgram Asteria female voice"
            >
              {isPlayingLumiSample ? (
                <>
                  <VolumeX className="w-4 h-4 text-[#00a896]" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#00a896]" />
                  <span>Hear Lumi's Voice</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Voice playing pill indicator */}
          <AnimatePresence>
            {isPlayingLumiSample && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/80 border border-teal-300 text-[11px] font-semibold text-teal-900"
              >
                <span className="w-2 h-2 rounded-full bg-[#00a896] animate-ping" />
                <span>Deepgram Asteria Voice: Speaking out loud</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#00a896]" /> HIPAA & GDPR Standard</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-[#00b4d8]" /> 256-Bit Zero-Knowledge</span>
            <span className="flex items-center gap-1.5"><Globe2 className="w-4 h-4 text-[#0077b6]" /> HL7 & FHIR Interoperable</span>
          </div>

          {/* Brand Palette Bar Preview */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Brand Signature:</span>
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white border border-slate-200/80 shadow-2xs">
              <span className="w-3.5 h-3.5 rounded-full bg-[#00a896]" title="Deep Teal (#00a896)" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#48cae4]" title="Mint Green (#48cae4)" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#00b4d8]" title="Vibrant Sky Cyan (#00b4d8)" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#0077b6]" title="Ocean Blue (#0077b6)" />
            </div>
          </div>

        </div>
      </section>

      {/* 4. THE 3 CORE PILLARS (VAULT, BEACON, LUMI) WITH CAROUSEL/GRID DEPTH */}
      <section id="ecosystem" className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#00a896] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Unified Health Experience
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Three Pillars. One Proactive Life.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Designed as a continuous loop to keep your clinical history complete, your home connected, and your diagnostics real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* CARD 1: VAULT (SOFTWARE) */}
          <div id="vault" className="relative bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all flex flex-col justify-between group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-500/10 transition-colors" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00a896] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                  Software
                </span>
                <span className="w-9 h-9 rounded-full bg-teal-50 text-[#00a896] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Vault</h3>
              <p className="text-xs font-bold text-[#00a896] mt-0.5">Your health history</p>
              
              <p className="text-xs text-slate-600 leading-relaxed mt-3">
                A secure, unified home for your medical records, history, updates, medications, test results, and clinical doctor notes.
              </p>

              {/* Graphic Card Preview */}
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/40 border border-slate-200 text-xs space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 pb-2 border-b border-slate-200">
                  <span className="flex items-center gap-1.5"><HeartPulse className="w-3.5 h-3.5 text-[#00a896]" /> Clinical Timeline</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded">Encrypted</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white shadow-2xs border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00a896]" />
                      <span className="font-medium text-slate-800">Lab Results & Blood Panels</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Verified</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white shadow-2xs border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#48cae4]" />
                      <span className="font-medium text-slate-800">Prescriptions & Active Meds</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Synced</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white shadow-2xs border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0077b6]" />
                      <span className="font-medium text-slate-800">Doctor Visits & Care Plans</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Timeline</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#00a896]">
              <Link href="/login" className="flex items-center gap-1 hover:underline">
                <span>Explore Lifelong Timeline</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* CARD 2: BEACON (PRODUCT ECOSYSTEM) */}
          <div id="beacon" className="relative bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-cyan-300 transition-all flex flex-col justify-between group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00b4d8] bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
                  Product Ecosystem
                </span>
                <span className="w-9 h-9 rounded-full bg-cyan-50 text-[#00b4d8] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Radio className="w-4 h-4" />
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Beacon</h3>
              <p className="text-xs font-bold text-[#00b4d8] mt-0.5">Your home health hub</p>
              
              <p className="text-xs text-slate-600 leading-relaxed mt-3">
                A connected health experience available on your dedicated home hardware hub, phone, and laptop with live synchronization.
              </p>

              {/* Graphic Card Preview */}
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/40 border border-slate-200 text-xs space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 pb-2 border-b border-slate-200">
                  <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-[#00b4d8]" /> Connected Endpoints</span>
                  <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.5 rounded">All Online</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-600">
                  <div className="p-2.5 bg-white rounded-xl shadow-2xs border border-slate-100 flex flex-col items-center gap-1.5">
                    <Radio className="w-4 h-4 text-[#00b4d8]" />
                    <span className="font-semibold text-slate-800">Home Hub</span>
                    <span className="text-[9px] text-[#00a896] font-bold">Beacon OS</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl shadow-2xs border border-slate-100 flex flex-col items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#00a896]" />
                    <span className="font-semibold text-slate-800">Mobile</span>
                    <span className="text-[9px] text-slate-400">iOS & PWA</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl shadow-2xs border border-slate-100 flex flex-col items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-[#0077b6]" />
                    <span className="font-semibold text-slate-800">Desktop</span>
                    <span className="text-[9px] text-slate-400">Web Portal</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 text-center pt-1 italic">
                  "Good morning! Your health status is nominal across all devices."
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#00b4d8]">
              <Link href="/login" className="flex items-center gap-1 hover:underline">
                <span>View Hardware Sync</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* CARD 3: LUMI (AI ASSISTANT WITH DEEPGRAM FEMALE VOICE) */}
          <div id="lumi" className="relative bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all flex flex-col justify-between group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/10 transition-colors" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0077b6] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  AI Assistant
                </span>
                <span className="w-9 h-9 rounded-full bg-sky-50 text-[#0077b6] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 text-[#0077b6]" />
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Lumi</h3>
              <p className="text-xs font-bold text-[#0077b6] mt-0.5">Your health companion</p>
              
              <p className="text-xs text-slate-600 leading-relaxed mt-3">
                An intelligent multimodal companion with female voice synthesis. Understands symptoms, interprets lab photos, and logs updates into Vault.
              </p>

              {/* Graphic Card Preview with Voice Trigger */}
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#042838] text-white border border-slate-800 text-xs space-y-2.5 shadow-md">
                <div className="flex items-center justify-between text-[11px] font-bold text-white pb-2 border-b border-slate-700/80">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#48cae4]" />
                    <span>Lumi Active Agent</span>
                  </div>
                  <span className="text-[9px] bg-[#00a896]/30 text-[#48cae4] px-1.5 py-0.5 rounded font-mono">Deepgram Voice</span>
                </div>
                
                <div className="p-2.5 rounded-xl bg-black/40 text-[10px] text-slate-200 leading-relaxed border border-white/10">
                  "I noticed your latest report. Your vitals look steady. How can I help you today?"
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => playLumiVoiceSample("Hi, I am Lumi! Let me help you monitor your health and medical documents.")}
                    className="px-2.5 py-1 rounded-lg bg-[#00a896] hover:bg-[#008f80] text-white text-[10px] font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Test Voice</span>
                  </button>
                  <Link href="/login" className="text-[10px] text-[#48cae4] hover:underline font-semibold">
                    Launch Kiosk &rarr;
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0077b6]">
              <Link href="/login" className="flex items-center gap-1 hover:underline">
                <span>Start Multimodal Session</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

      </section>

      {/* 5. HOW IT ALL WORKS TOGETHER - DYNAMIC FLOWING ANIMATION */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-8 bg-gradient-to-b from-white via-[#f0f9ff]/50 to-slate-50 border-y border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#00a896] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Continuous Synchronization Loop
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Seamless Flow for Better Health.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Your personal devices, AI companion, and clinical records synchronized in one proactive circle.
            </p>
          </div>

          {/* Workflow Loop Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-lg relative overflow-hidden">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch relative z-10">
              
              {/* Step 1: Member */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-sm mb-3 shadow-sm">
                  You
                </div>
                <h4 className="text-sm font-bold text-slate-900">Member</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Primary Patient</span>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Interact naturally through Beacon on your home screen, mobile phone, or laptop.
                </p>
              </div>

              {/* Step 2: Beacon */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-cyan-50/50 border border-cyan-200/80 shadow-2xs hover:border-cyan-400 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00b4d8] to-[#0096c7] text-white flex items-center justify-center mb-3 shadow-md">
                  <Radio className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Beacon</h4>
                <span className="text-[10px] font-bold text-[#00b4d8] uppercase tracking-wider mt-0.5">Home Health Hub</span>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  Connects hardware sensors, full screen kiosk mode, and real-time reminders.
                </p>
              </div>

              {/* Step 3: Lumi */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-sky-50/50 border border-sky-200/80 shadow-2xs hover:border-sky-400 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0077b6] to-[#023e8a] text-white flex items-center justify-center mb-3 shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Lumi</h4>
                <span className="text-[10px] font-bold text-[#0077b6] uppercase tracking-wider mt-0.5">Female Voice AI</span>
                <ul className="text-[11px] text-slate-600 mt-2 text-left space-y-1.5 w-full">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#00a896] shrink-0" /> Answers medical inquiries</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#00a896] shrink-0" /> Multimodal camera checks</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#00a896] shrink-0" /> Deepgram realistic voice</li>
                </ul>
              </div>

              {/* Step 4: Vault */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-teal-50/50 border border-teal-200/80 shadow-2xs hover:border-teal-400 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00a896] to-[#028090] text-white flex items-center justify-center mb-3 shadow-md">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Vault</h4>
                <span className="text-[10px] font-bold text-[#00a896] uppercase tracking-wider mt-0.5">Your Health History</span>
                <ul className="text-[11px] text-slate-600 mt-2 text-left space-y-1.5 w-full">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#00a896] shrink-0" /> Zero hardcoded profiles</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#00a896] shrink-0" /> Firestore cloud encryption</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#00a896] shrink-0" /> Instant emergency QR card</li>
                </ul>
              </div>

            </div>

            {/* Loop Banner */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-center">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#00a896] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00a896]" />
                A continuous loop for a more connected, proactive you.
              </span>
              <Link
                href="/login"
                className="text-xs font-bold text-[#0077b6] hover:underline flex items-center gap-1"
              >
                <span>Enter Ecosystem &rarr;</span>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 6. IMMERSIVE LUMI FULLSCREEN KIOSK TEASER WITH GLOW & VOICE */}
      <section className="bg-slate-950 text-white py-16 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,168,150,0.18)_0%,rgba(5,5,7,1)_70%)] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
          <div className="lg:w-1/2 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00a896]/20 border border-[#00a896]/40 text-[#48cae4] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Fullscreen Kiosk Mode
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Turn Any Screen Into Your Dedicated Lumi Companion
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Experience hands-free multimodal health consultation. Hide website borders and tabs for a 100% immersive companion with reactive animated eyes, speech recognition, and instant video first-aid guides.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#00a896] via-[#00b4d8] to-[#0077b6] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg inline-flex items-center gap-2 active:scale-95"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Launch Lumi AI Now</span>
              </Link>
              <button
                onClick={() => playLumiVoiceSample("Emergency or routine, I am always ready to listen and assist you.")}
                className="px-4 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-bold transition-all inline-flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4 text-[#48cae4]" />
                <span>Play Sample</span>
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 flex items-center justify-center w-full">
            <div className="w-full max-w-sm aspect-video bg-[#051119] border-2 border-[#00b4d8]/50 rounded-3xl p-6 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(0,180,216,0.3)] relative">
              <CuteNeonEyes state={isPlayingLumiSample ? "speaking" : "awake"} statusText={isPlayingLumiSample ? "Lumi Speaking..." : "Lumi Companion Online"} />
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION & FOOTER */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ready to Connect Your Health?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Take control of your medical history with proactive AI companionship. Sign in with Google for a fresh, personalized account.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleQuickGoogle}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm tracking-wide shadow-xs transition-all flex items-center gap-2.5 active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Sign Up with Google</span>
            </button>

            <Link
              href="/login"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#00a896] via-[#00b4d8] to-[#0077b6] hover:opacity-95 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Access HealthThread</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Sleek Footer */}
      <footer className="bg-slate-900 text-white py-10 px-4 sm:px-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <HealthThreadLogo isDark={true} />
          </div>

          <p className="text-center text-[11px] text-slate-400">
            Vault · Beacon · Lumi — Integrated Health Ecosystem. Built with HIPAA & GDPR Privacy Standards.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Security</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
