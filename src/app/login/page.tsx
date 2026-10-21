"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  User, 
  Stethoscope, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Smartphone, 
  FileText,
  Sparkles,
  HeartPulse
} from "lucide-react";
import { HealthThreadLogo } from "@/components/HealthThreadLogo";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();

  // Role Tab: "patient" vs "doctor"
  const [role, setRole] = useState<"patient" | "doctor">("patient");

  // Sub Tab: "ekyc" vs "otp"
  const [authMethod, setAuthMethod] = useState<"ekyc" | "otp">("ekyc");

  // Form Fields (Image 4 defaults)
  const [fullName, setFullName] = useState("Aradhya Tripathi");
  const [identityNumber, setIdentityNumber] = useState("4210 8842 7731");
  const [mobileNumber, setMobileNumber] = useState("+91 98765 43210");
  const [otpCode, setOtpCode] = useState("482910");

  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(true); // matching image 4 where "✓ OTP sent — for this demo, verification is instant." is shown
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanName = fullName.trim() || (role === "doctor" ? "Dr. Rajesh Sharma" : "Aradhya Tripathi");
    const accountId = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_");

    const activeUser = {
      id: accountId,
      displayName: cleanName,
      email: `${accountId}@healthvault.in`,
      healthId: `HT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      phoneNumber: mobileNumber,
      bloodGroup: role === "doctor" ? "A+" : "B+",
      role: role,
      isVerified: true
    };

    const { setActiveUser } = await import("@/lib/vaultStore");
    await setActiveUser(activeUser);

    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 400);
  };

  const handleSelectDemo = async (demoType: "patient" | "doctor") => {
    const { setActiveUser } = await import("@/lib/vaultStore");
    if (demoType === "patient") {
      setRole("patient");
      setFullName("Shashank Kumar");
      setIdentityNumber("5190 2841 9912");
      const userObj = {
        id: "shashank_kumar",
        displayName: "Shashank Kumar",
        email: "shashank.kumar@healthvault.in",
        healthId: "HT-2026-44102",
        phoneNumber: "+91 98112 33445",
        bloodGroup: "O+",
        role: "patient" as const,
        isVerified: true
      };
      await setActiveUser(userObj);
      router.push("/dashboard");
    } else {
      setRole("doctor");
      setFullName("Dr. Rajesh Sharma");
      setIdentityNumber("HP-99214-ABDM");
      const userObj = {
        id: "dr_rajesh_sharma",
        displayName: "Dr. Rajesh Sharma",
        email: "rajesh.sharma@apollohospitals.com",
        healthId: "HP-99214-ABDM",
        phoneNumber: "+91 98100 12345",
        bloodGroup: "A+",
        role: "doctor" as const,
        isVerified: true
      };
      await setActiveUser(userObj);
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userObj = {
        id: user.uid,
        displayName: user.displayName || "Google Health User",
        email: user.email || "user@google.com",
        photoURL: user.photoURL || undefined,
        healthId: `HT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        phoneNumber: "+91 98765 43210",
        bloodGroup: "Not set",
        role: "patient" as const,
        isVerified: true
      };

      const { setActiveUser } = await import("@/lib/vaultStore");
      await setActiveUser(userObj);
      router.push("/dashboard");
    } catch (err: any) {
      console.warn("Google sign-in popup bypassed; logging in directly for demo:", err);
      handleSelectDemo("patient");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#07243c] p-2 sm:p-6 md:p-10 select-none">
      
      {/* CARD CONTAINER (Image 4 Dual-Pane) */}
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-slate-700/50 min-h-[640px]">
        
        {/* LEFT PANE: BRAND & NATIONAL MISSION DETAILS (Image 4 Left) */}
        <div className="bg-[#0b2d49] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Ashoka Chakra / Sunburst radial rays */}
          <div className="absolute -bottom-20 -left-20 w-[420px] h-[420px] rounded-full border border-sky-400/10 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-[320px] h-[320px] rounded-full border border-sky-400/10 pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-[200px] h-[200px] rounded-full border border-sky-400/10 pointer-events-none" />

          {/* Top Brand & Ministry Line */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <HealthThreadLogo showText={false} className="w-11 h-11" />
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
                  HealthThread
                </h2>
                <p className="text-[10px] text-sky-200/80 font-medium tracking-wide">
                  National Digital Health Records Mission
                </p>
                <p className="text-[9px] text-sky-300/60 font-normal">
                  Ministry of Health & Family Welfare
                </p>
              </div>
            </div>
          </div>

          {/* Center Hero Heading & Subtitle */}
          <div className="relative z-10 my-10 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.18]">
              One health record.<br />Every hospital. For life.
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/85 leading-relaxed max-w-sm">
              Your complete medical history — vaccinations, prescriptions, surgeries, and lab reports — securely linked to your identity and shared only with your consent.
            </p>
          </div>

          {/* Bottom 3 Mission Stats */}
          <div className="relative z-10 pt-6 border-t border-sky-800/60 grid grid-cols-3 gap-2">
            <div>
              <p className="text-lg sm:text-xl font-black text-white tracking-tight">34 yrs</p>
              <p className="text-[10px] text-sky-200/70 mt-0.5 leading-tight">of continuous records</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-white tracking-tight">100%</p>
              <p className="text-[10px] text-sky-200/70 mt-0.5 leading-tight">privacy protected</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-white tracking-tight">eKYC</p>
              <p className="text-[10px] text-sky-200/70 mt-0.5 leading-tight">verified identity</p>
            </div>
          </div>

        </div>

        {/* RIGHT PANE: LOGIN FORM (Image 4 Right) */}
        <div className="bg-white p-7 sm:p-10 flex flex-col justify-between text-slate-800">
          
          <div>
            {/* Top Role Selector Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => {
                  setRole("patient");
                  setFullName("Aradhya Tripathi");
                  setIdentityNumber("4210 8842 7731");
                }}
                className={`flex-1 pb-3 text-xs sm:text-sm font-bold tracking-tight transition-all relative ${
                  role === "patient"
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Patient Login
                {role === "patient" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d95914] rounded-t-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole("doctor");
                  setFullName("Dr. Rajesh Sharma");
                  setIdentityNumber("HP-99214-ABDM");
                }}
                className={`flex-1 pb-3 text-xs sm:text-sm font-bold tracking-tight transition-all relative ${
                  role === "doctor"
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Doctor & Hospital Staff
                {role === "doctor" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d95914] rounded-t-full" />
                )}
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Full Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aradhya Tripathi"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#d95914] focus:ring-1 focus:ring-[#d95914] text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all"
                />
              </div>

              {/* Subtabs: eKYC Digital Identity vs Mobile OTP */}
              <div className="flex border-b border-slate-200 pt-1 pb-1 gap-6">
                <button
                  type="button"
                  onClick={() => setAuthMethod("ekyc")}
                  className={`text-xs font-semibold pb-1.5 transition-all relative ${
                    authMethod === "ekyc"
                      ? "text-[#d95914] font-bold"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  eKYC Digital Identity
                  {authMethod === "ekyc" && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d95914]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMethod("otp")}
                  className={`text-xs font-semibold pb-1.5 transition-all relative ${
                    authMethod === "otp"
                      ? "text-[#d95914] font-bold"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Mobile OTP
                  {authMethod === "otp" && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d95914]" />
                  )}
                </button>
              </div>

              {/* Digital Identity Number / Phone Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {authMethod === "ekyc" ? "Digital Identity Number" : "Registered Mobile Number"}
                </label>
                <input
                  type="text"
                  value={authMethod === "ekyc" ? identityNumber : mobileNumber}
                  onChange={(e) => authMethod === "ekyc" ? setIdentityNumber(e.target.value) : setMobileNumber(e.target.value)}
                  placeholder={authMethod === "ekyc" ? "4210 8842 7731" : "+91 98765 43210"}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#d95914] focus:ring-1 focus:ring-[#d95914] text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all tracking-wide"
                />
              </div>

              {/* Instant Verification Banner (Image 4 green alert) */}
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
                <span>✓ OTP sent — for this demo, verification is instant.</span>
              </div>

              {/* Big Saffron Orange Button (Image 4: "Send OTP") */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#d95914] hover:bg-[#c24e0f] text-white font-bold text-sm tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </form>

            {/* Quick Demo Selectors (Image 4) */}
            <div className="mt-5 space-y-2">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2.5 text-[11px] text-slate-400 font-medium absolute">
                  or select a demo account
                </span>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSelectDemo("patient")}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left flex items-center gap-3 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Patient Account</p>
                    <p className="text-[10px] text-slate-500 truncate">Shashank Kumar · Health ID verified</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemo("doctor")}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left flex items-center gap-3 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Physician Account</p>
                    <p className="text-[10px] text-slate-500 truncate">Dr. Rajesh Sharma · Apollo Hospitals</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Google Authentication Option (Preserved from VitalLens) */}
            <div className="mt-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google / Firebase</span>
              </button>
            </div>
          </div>

          {/* Footer Disclaimer (Image 4 bottom) */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              By continuing, you agree that your data is encrypted and never shared without your explicit consent.
            </p>
          </div>

        </div>

      </div>

    </main>
  );
}
