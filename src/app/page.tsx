"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Stethoscope, 
  Lock, 
  Bot, 
  Sparkles, 
  Baby, 
  Bell, 
  Activity, 
  CheckCircle2, 
  Maximize2, 
  PhoneCall, 
  QrCode, 
  FileSearch, 
  Radio,
  Laptop,
  Smartphone,
  ChevronRight,
  Globe2,
  RefreshCw,
  Check,
  Download
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

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);
    const handleUpdate = () => setCurrentUser(getActiveUser());
    window.addEventListener("vitallens_user_updated", handleUpdate);
    return () => window.removeEventListener("vitallens_user_updated", handleUpdate);
  }, []);

  const handleQuickGoogle = async () => {
    try {
      await signInWithGoogleAuth("patient");
      router.push("/dashboard");
    } catch (e) {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcfd] text-slate-900 flex flex-col select-none overflow-x-hidden">
      
      {/* 1. TOP BRAND ACCENT BAR (Teal, Mint, Cyan, Ocean Blue) */}
      <BrandAccentBar />

      {/* 2. SLEEK LIGHT-MODE HEADER */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <HealthThreadLogo />
            
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <a href="#vault" className="hover:text-[#00a896] transition-colors">Vault</a>
              <a href="#beacon" className="hover:text-[#00a896] transition-colors">Beacon</a>
              <a href="#lumi" className="hover:text-[#00a896] transition-colors">Lumi AI</a>
              <a href="#how-it-works" className="hover:text-[#00a896] transition-colors">How It Works</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerPwaInstall()}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#00a896]" />
              <span>App</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-slate-600 font-medium">
                  Welcome, <strong>{currentUser.displayName}</strong>
                </span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00a896] to-[#0077b6] hover:opacity-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Open Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00a896] to-[#0077b6] hover:opacity-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-8 border-b border-slate-200/60 bg-gradient-to-b from-[#f0f9ff]/70 via-[#f8fafc] to-white">
        
        {/* Soft Ambient Brand Color Blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#00a896]/10 via-[#48cae4]/15 to-[#0077b6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-teal-200 shadow-xs text-xs font-semibold text-slate-700"
          >
            <span className="w-2 h-2 rounded-full bg-[#00a896] animate-pulse" />
            <span>HealthThread Ecosystem · Software, Product & AI Companion</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]"
          >
            Your Health,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a896] via-[#00b4d8] to-[#0077b6]">
              Connected.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal"
          >
            A seamless flow for better health. Your records unified in <strong>Vault</strong>, your home connected through <strong>Beacon</strong>, and your intelligent clinical companion in <strong>Lumi</strong>.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-3"
          >
            <button
              onClick={handleQuickGoogle}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm tracking-wide shadow-sm hover:shadow transition-all flex items-center gap-3"
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
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#00a896] to-[#0077b6] hover:opacity-95 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>Open Your Vault Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#00a896]" /> HIPAA & GDPR Standard</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-[#00b4d8]" /> 256-Bit Zero Knowledge</span>
            <span className="flex items-center gap-1.5"><Globe2 className="w-4 h-4 text-[#0077b6]" /> HL7 / FHIR Interoperable</span>
          </div>

        </div>
      </section>

      {/* 4. THE 3 CORE PILLARS (EXACT CARDS FROM IMAGE: VAULT, BEACON, LUMI) */}
      <section id="ecosystem" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00a896] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Unified Health Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Three Pillars. One Proactive Life.
          </h2>
          <p className="text-sm text-slate-600">
            Designed as a continuous loop to keep your clinical history complete, your home connected, and your diagnostics real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CARD 1: VAULT (SOFTWARE) */}
          <div id="vault" className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00a896]">
                  Software
                </span>
                <span className="w-8 h-8 rounded-full bg-teal-50 text-[#00a896] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Vault</h3>
              <p className="text-xs font-bold text-[#00a896] mt-0.5">Your health history</p>
              
              <p className="text-xs text-slate-600 leading-relaxed mt-3">
                A secure, unified home for your medical records, history, updates, medications, test results, and more.
              </p>

              {/* Graphical Card Representation */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/40 border border-slate-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 pb-2 border-b border-slate-200">
                  <span>Your Health History</span>
                  <span className="text-teal-700">Encrypted</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#00a896]" />
                    <span>Lab Results & Blood Panels</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#48cae4]" />
                    <span>Active Medications & Dosages</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#0077b6]" />
                    <span>Doctor Visits & Clinical Notes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#00a896]">
              <span>Lifelong Medical Timeline</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* CARD 2: BEACON (PRODUCT ECOSYSTEM) */}
          <div id="beacon" className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-cyan-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00b4d8]">
                  Product Ecosystem
                </span>
                <span className="w-8 h-8 rounded-full bg-cyan-50 text-[#00b4d8] flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Beacon</h3>
              <p className="text-xs font-bold text-[#00b4d8] mt-0.5">Your home health hub</p>
              
              <p className="text-xs text-slate-600 leading-relaxed mt-3">
                A connected health experience available at home, on your phone, and on your laptop with continuous synchronization.
              </p>

              {/* Graphical Card Representation */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/40 border border-slate-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 pb-2 border-b border-slate-200">
                  <span>Connected Devices</span>
                  <span className="text-cyan-700">Online</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-600">
                  <div className="p-2 bg-white rounded-xl shadow-2xs flex flex-col items-center gap-1">
                    <Radio className="w-4 h-4 text-[#00b4d8]" />
                    <span>Home Hub</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl shadow-2xs flex flex-col items-center gap-1">
                    <Smartphone className="w-4 h-4 text-[#00a896]" />
                    <span>Phone</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl shadow-2xs flex flex-col items-center gap-1">
                    <Laptop className="w-4 h-4 text-[#0077b6]" />
                    <span>Laptop</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 text-center pt-1">
                  "Good morning, Alex. How can I help you today?"
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#00b4d8]">
              <span>Real-Time Device Sync</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* CARD 3: LUMI (AI ASSISTANT) */}
          <div id="lumi" className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0077b6]">
                  AI Assistant
                </span>
                <span className="w-8 h-8 rounded-full bg-sky-50 text-[#0077b6] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#0077b6]" />
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Lumi</h3>
              <p className="text-xs font-bold text-[#0077b6] mt-0.5">Your health companion</p>
              
              <p className="text-xs text-slate-600 leading-relaxed mt-3">
                An AI companion inside Beacon that helps you understand symptoms, answer questions, and keep your health history updated in Vault.
              </p>

              {/* Graphical Card Representation */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#053d52] text-white border border-slate-800 text-xs space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-white pb-2 border-b border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#48cae4]" />
                    <span>Lumi Active Agent</span>
                  </div>
                  <span className="text-[9px] bg-[#00a896]/30 text-[#48cae4] px-1.5 py-0.5 rounded font-mono">Vision & Voice</span>
                </div>
                <div className="p-2 rounded-xl bg-black/40 text-[10px] text-slate-200 leading-relaxed border border-white/10">
                  "I noticed your resting heart rate and symptoms. Comparing with your past history in Vault..."
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#48cae4] pt-1">
                  <span>Say "WakeUp Lumi"</span>
                  <span className="font-semibold text-white">Full Screen Kiosk &rarr;</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0077b6]">
              <span>Voice & Camera Diagnostics</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

      </section>

      {/* 5. "HOW IT ALL WORKS TOGETHER" (FLOW DIAGRAM MATCHING USER IMAGE) */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 bg-gradient-to-b from-white via-[#f0f9ff]/40 to-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
              How It All Works Together
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Seamless Flow for Better Health.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Your health information, your AI companion, and your connected devices — all working together as one.
            </p>
          </div>

          {/* Workflow Diagram Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-md">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              
              {/* Node 1: You */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm mb-3">
                  You
                </div>
                <h4 className="text-sm font-bold text-slate-900">Member</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Interact through Beacon on your home device, phone, or laptop.
                </p>
              </div>

              {/* Node 2: Beacon */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-cyan-50/60 border border-cyan-200">
                <div className="w-12 h-12 rounded-full bg-[#00b4d8] text-white flex items-center justify-center mb-3 shadow-sm">
                  <Radio className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Beacon</h4>
                <p className="text-[10px] font-bold text-[#00b4d8] uppercase">Home Health Hub</p>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Centralized interface connecting hardware sensors & displays.
                </p>
              </div>

              {/* Node 3: Lumi */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-sky-50/60 border border-sky-200">
                <div className="w-12 h-12 rounded-full bg-[#0077b6] text-white flex items-center justify-center mb-3 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Lumi</h4>
                <p className="text-[10px] font-bold text-[#0077b6] uppercase">AI Companion</p>
                <ul className="text-[11px] text-slate-600 mt-1 text-left space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00a896]" /> Answers your questions</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00a896]" /> Personalized insights</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00a896]" /> Voice symptom check</li>
                </ul>
              </div>

              {/* Node 4: Vault */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-teal-50/60 border border-teal-200">
                <div className="w-12 h-12 rounded-full bg-[#00a896] text-white flex items-center justify-center mb-3 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Vault</h4>
                <p className="text-[10px] font-bold text-[#00a896] uppercase">Your Health History</p>
                <ul className="text-[11px] text-slate-600 mt-1 text-left space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00a896]" /> Reads health records</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00a896]" /> Updates your timeline</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00a896]" /> 100% Secure & unified</li>
                </ul>
              </div>

            </div>

            {/* Continuous Loop Caption */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#00a896]">
                A continuous loop for a more connected, proactive you.
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* 6. IMMERSIVE LUMI FULLSCREEN KIOSK TEASER */}
      <section className="bg-slate-950 text-white py-16 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,168,150,0.15)_0%,rgba(5,5,7,1)_70%)] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
          <div className="lg:w-1/2 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00a896]/20 border border-[#00a896]/40 text-[#48cae4] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Fullscreen Kiosk Mode
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Turn Any Screen Into Your Dedicated Lumi Companion
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Experience hands-free multimodal health consultation. Hide website borders and tabs for a 100% immersive robot screen with responsive animated eyes, speech recognition, and instant video first-aid guides.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#00a896] to-[#00b4d8] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg inline-flex items-center gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Launch Lumi AI Now</span>
              </Link>
            </div>
          </div>

          <div className="lg:w-1/2 flex items-center justify-center">
            <div className="w-full max-w-sm aspect-video bg-[#051119] border-2 border-[#00b4d8]/50 rounded-3xl p-6 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,180,216,0.25)]">
              <CuteNeonEyes state="speaking" statusText="Lumi Companion Online" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION & INTERNATIONAL FOOTER */}
      <section className="py-20 px-4 sm:px-8 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ready to Connect Your Health?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Join thousands of individuals taking control of their lifelong medical history with proactive AI companionship.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleQuickGoogle}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm tracking-wide shadow-xs transition-all flex items-center gap-2.5"
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
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#00a896] to-[#0077b6] hover:opacity-95 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center gap-2"
            >
              <span>Access HealthThread</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Sleek Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-8 border-t border-slate-800 mt-auto">
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
