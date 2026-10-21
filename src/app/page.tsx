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
  UserCheck, 
  Building2, 
  ShieldAlert, 
  KeyRound,
  Download,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { HealthThreadLogo, TricolorBar } from "@/components/HealthThreadLogo";
import CuteNeonEyes from "@/components/CuteNeonEyes";
import { getActiveUser, VaultUser } from "@/lib/vaultStore";
import { triggerPwaInstall } from "@/components/PwaInstallPrompt";

export default function LandingPage() {
  const [currentUser, setCurrentUser] = useState<VaultUser | null>(null);

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);
    const handleUpdate = () => setCurrentUser(getActiveUser());
    window.addEventListener("vitallens_user_updated", handleUpdate);
    return () => window.removeEventListener("vitallens_user_updated", handleUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col select-none">
      
      {/* 1. TOP NATIONAL TRICOLOR BAR */}
      <TricolorBar />

      {/* 2. OFFICIAL GOVERNMENT HEADER */}
      <header className="bg-[#0b2d49] text-white border-b border-sky-900/50 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <HealthThreadLogo />
            <div className="hidden sm:block border-l border-sky-800/80 pl-3">
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest block">
                Official Health Vault
              </span>
              <span className="text-[9px] text-sky-200/70 block">
                Ayushman Bharat Digital Mission (ABDM)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerPwaInstall()}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sky-700/60 bg-sky-950/60 hover:bg-sky-900 text-sky-200 text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Install Web App</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-sky-200 font-medium">
                  Signed in as <strong>{currentUser.displayName}</strong>
                </span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-[#d95914] hover:bg-[#c24e0f] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Go to Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-2 rounded-xl text-sky-200 hover:text-white hover:bg-sky-900/50 text-xs font-bold transition-all"
                >
                  Doctor Login
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-[#d95914] hover:bg-[#c24e0f] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Access Vault / Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0b2d49] via-[#0e3c5d] to-[#124d77] text-white py-16 sm:py-24 px-4 sm:px-8 border-b border-sky-900/40">
        
        {/* Subtle Decorative Background Circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-400/[0.04] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-emerald-400/[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-600/50 text-sky-200 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>National Health Authority · ABDM Compliant Architecture</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              One Citizen.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-amber-200">
                One Lifelong Digital Health Record.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed max-w-xl">
              Securely consolidate all your hospital discharge summaries, diagnostic lab reports, prescriptions, and emergency vitals into a tamper-proof national vault. Integrated with multimodal <strong>RoboDoc AI</strong> for instantaneous clinical diagnostics.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-xl bg-[#d95914] hover:bg-[#c24e0f] text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span>Verify eKYC & Enter Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <a
                href="#features"
                className="px-5 py-3.5 rounded-xl bg-sky-900/60 hover:bg-sky-800 text-sky-100 font-semibold text-sm border border-sky-600/40 transition-all flex items-center gap-2"
              >
                <span>Explore All 8 Clinical Features</span>
              </a>
            </div>

            {/* 3 Real Verifiable Government Standards */}
            <div className="pt-6 border-t border-sky-800/80 grid grid-cols-3 gap-4 max-w-md">
              <div>
                <p className="text-lg font-black text-white">14-Digit</p>
                <p className="text-[11px] text-sky-200/80">Universal ABHA ID</p>
              </div>
              <div>
                <p className="text-lg font-black text-white">256-Bit</p>
                <p className="text-[11px] text-sky-200/80">AES Vault Encryption</p>
              </div>
              <div>
                <p className="text-lg font-black text-white">100%</p>
                <p className="text-[11px] text-sky-200/80">Patient Consent Control</p>
              </div>
            </div>

          </div>

          {/* Right Hero Interactive Preview: Live Digital Health ID Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-7 rounded-3xl shadow-2xl relative overflow-hidden text-white">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    ABHA eKYC Certified
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-sky-200">
                  NHA · MoHFW
                </span>
              </div>

              <div className="my-5 space-y-3">
                <p className="text-[10px] uppercase font-bold tracking-widest text-sky-300">
                  Universal Health Identifier
                </p>
                <p className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-white">
                  91-4210-8842-7731
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-sky-100 pt-2">
                  <div>
                    <span className="text-sky-300/80 block text-[10px] uppercase">ABHA Address</span>
                    <span className="font-semibold">citizen@abdm</span>
                  </div>
                  <div>
                    <span className="text-sky-300/80 block text-[10px] uppercase">Aadhaar Linked</span>
                    <span className="font-semibold text-emerald-300">✓ Biometric Verified</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Feature Tag in Card */}
              <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs">
                <span className="text-sky-200 text-[11px]">RoboDoc AI Doctor Enabled</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4. ALL 8 CORE FEATURES OF THE NATIONAL VAULT (Requested by user) */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d95914] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            Comprehensive Digital Health Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for National Healthcare Security & Clinical Intelligence
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every feature is purpose-built to comply with Ayushman Bharat Digital Mission (ABDM) standards and provide instantaneous clinical AI assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                1. Lifelong Digital Health Vault
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chronological timeline unifying lab tests, prescriptions, immunizations, and hospital stays across all healthcare providers for life.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-sky-700">
              <span>ABHA Integrated</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-3 relative z-10">
              <div className="w-11 h-11 rounded-xl bg-red-950/80 text-neon-red flex items-center justify-center border border-red-500/40">
                <Bot className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>2. RoboDoc Multimodal AI</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Voice-activated hands-free consultation, symptom diagnosis, camera-based visual assessment, and dedicated <strong>100% Full-Screen Device Mode</strong>.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-[11px] font-semibold text-red-400">
              <span>Voice & Vision AI</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                3. ABDM Consent Management
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete patient autonomy. Authorize hospital records access with defined expiration dates and revoke doctor access with a single click.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-emerald-700">
              <span>Patient Data Sovereignty</span>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                4. Document & Pathology OCR
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload handwritten doctor prescriptions or complex blood panel PDFs. Clinical AI extracts diagnoses, biomarkers, and dosages automatically.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-blue-700">
              <span>Automatic Extraction</span>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                5. Emergency Profile & SOS
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Critical blood group, allergies, and emergency contacts accessible via public QR card. Direct 108/112 ambulance linkage and ER video consults.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-rose-700">
              <span>Life-Saving QR Access</span>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                <Baby className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                6. Maternal & Child Health
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated trimester vitals tracking, fetal heart rate monitoring, ultrasound report archive, and prenatal vaccination schedules.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-amber-700">
              <span>Prenatal Care Tracking</span>
            </div>
          </div>

          {/* Feature 7 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                7. Doctor & Staff Portal
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                NMC-registered physicians can look up patients by ABHA, view consented diagnostic history, and sign electronic prescriptions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-indigo-700">
              <span>Clinical Registry</span>
            </div>
          </div>

          {/* Feature 8 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-yellow-50 text-yellow-700 flex items-center justify-center border border-yellow-100">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                8. Voice-Guided Health Alarms
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Spoken audio medication reminders that speak dosage instructions automatically, preventing missed doses for elderly or chronic patients.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-yellow-700">
              <span>Adherence Assistant</span>
            </div>
          </div>

        </div>

      </section>

      {/* 5. ROBODOC FULLSCREEN SHOWCASE BANNER */}
      <section className="bg-[#050507] text-white py-16 px-4 sm:px-8 border-y border-red-950/40">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="lg:w-1/2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-neon-red/50 text-red-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-neon-red animate-pulse" />
              <span>Full Screen Robot Mode</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Transform Your Device into a Dedicated AI Doctor Kiosk
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              With one click, hide all website tabs, sidebars, and navigation bars. RoboDoc runs in 100% full-screen immersive display with glowing responsive neon eyes, speech-to-text, and real-time visual symptom recognition.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="px-5 py-3 rounded-xl bg-neon-red hover:bg-neon-red-bright text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,51,102,0.4)] inline-flex items-center gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Experience RoboDoc Now</span>
              </Link>
            </div>
          </div>

          <div className="lg:w-1/2 flex items-center justify-center">
            <div className="w-full max-w-sm aspect-video bg-[#0c0709] border-2 border-neon-red/60 rounded-3xl p-6 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(255,51,102,0.3)]">
              <CuteNeonEyes state="speaking" statusText="RoboDoc Multimodal Sensor Online" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION & FOOTER */}
      <section className="py-16 px-4 sm:px-8 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready to Take Control of Your Family's Health Records?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Create your official Ayushman Bharat Digital Health Account (ABHA) in under 60 seconds with instant government eKYC verification.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl bg-[#0e3c5d] hover:bg-[#092b43] text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center gap-2"
            >
              <span>Access Your Health Vault</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Official MoHFW Style Footer */}
      <footer className="bg-[#0b2d49] text-white py-10 px-4 sm:px-8 border-t border-sky-900/60 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-sky-200/80">
          <div className="flex items-center gap-3">
            <HealthThreadLogo showText={false} className="w-8 h-8" />
            <div>
              <p className="font-bold text-white text-sm">HealthThread</p>
              <p className="text-[10px] text-sky-300/70">National Digital Health Records Vault · MoHFW</p>
            </div>
          </div>

          <p className="text-center text-[11px] text-sky-200/70">
            Powered by Ayushman Bharat Digital Mission (ABDM) Standards & VitalLens Multimodal AI.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-sky-300">
            <span>256-Bit SSL Encrypted</span>
            <span>•</span>
            <span>Zero-Knowledge Vault</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
