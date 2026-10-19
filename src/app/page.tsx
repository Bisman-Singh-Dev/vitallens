"use client";

import { motion } from "framer-motion";
import { 
  ArrowRight, 
  ShieldAlert, 
  FileHeart, 
  Activity, 
  Camera, 
  BrainCircuit, 
  CheckCircle2, 
  ChevronDown, 
  Sparkles, 
  Lock, 
  HeartPulse, 
  Mic, 
  ShieldCheck, 
  Scan, 
  Cpu
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CuteNeonEyes from "@/components/CuteNeonEyes";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center w-full bg-[#070709] min-h-screen text-white relative overflow-x-hidden selection:bg-slate-300 selection:text-black">
      
      {/* Dynamic Ambient Neon Gray/Silver Aurora Glows */}
      <div className="absolute top-0 left-0 w-full h-[1000px] pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[10%] w-[900px] h-[900px] bg-slate-300/30 rounded-full blur-[180px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.12, 1], opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] right-[5%] w-[800px] h-[800px] bg-slate-500/20 rounded-full blur-[160px]"
        />
      </div>

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto py-6 px-6 relative z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black/80 border border-slate-700/80 flex items-center justify-center text-white shadow-[0_0_20px_rgba(226,232,240,0.15)]">
            <HeartPulse className="w-5 h-5 text-slate-200" />
          </div>
          <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
            ROBODOC
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800/80 text-slate-300 border border-slate-700">
            VitalLens AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs uppercase tracking-wider font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link href="/dashboard">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 rounded-full bg-slate-200 hover:bg-white text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(226,232,240,0.25)] flex items-center gap-1.5"
            >
              Launch App <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto py-16 px-6 lg:py-28 relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-[82vh] gap-12">
        <div className="lg:w-7/12 flex flex-col items-start text-left">
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/70 text-slate-300 text-xs font-semibold mb-6 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-300 animate-pulse" />
            <span>Next-Gen Voice Health Intelligence & Diagnostics</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-6 uppercase leading-[0.92]"
          >
            <span className="text-white block drop-shadow-[0_0_20px_rgba(226,232,240,0.25)]">Clinical AI</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-400 to-slate-600">
              In Your Browser
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-slate-400 font-normal max-w-xl mb-10 leading-relaxed"
          >
            Instant multimodal symptom scanning, sub-second Groq voice diagnostics, and client-side AES-256 encrypted health vaults. Built to run universally on any browser or device.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link href="/dashboard" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.04, boxShadow: "0 0 35px rgba(226, 232, 240, 0.45)" }}
                whileTap={{ scale: 0.96 }}
                className="px-8 py-4 bg-white text-black font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(226,232,240,0.3)] flex items-center gap-2.5 w-full justify-center transition-all"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.04, backgroundColor: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.96 }}
                className="px-8 py-4 bg-black/70 border border-slate-700 hover:border-slate-500 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-sm flex items-center gap-2.5 w-full justify-center transition-all backdrop-blur-md"
              >
                Sign In / Login
              </motion.button>
            </Link>
          </motion.div>

          {/* Feature Badges */}
          <div className="mt-12 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> AES-256 Client Encrypted
            </span>
            <span className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-slate-300" /> Voice Login & Hands-free AI
            </span>
            <span className="flex items-center gap-2">
              <Scan className="w-4 h-4 text-slate-300" /> Multi-modal Vision Scanning
            </span>
          </div>
        </div>
        
        {/* Interactive Centerpiece: Living Cute Neon Eyes */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="lg:w-5/12 flex flex-col items-center justify-center relative"
        >
          <div className="relative p-10 sm:p-14 rounded-3xl bg-neutral-900/60 border border-slate-800/80 backdrop-blur-2xl shadow-[0_0_60px_rgba(226,232,240,0.06)] flex flex-col items-center">
            
            {/* Top Badge */}
            <div className="mb-6 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700 text-[11px] font-semibold tracking-wider uppercase text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span>Interactive Agent Active</span>
            </div>

            <CuteNeonEyes state="awake" />

            <div className="mt-8 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
                Say "WakeUp Robodoc"
              </p>
              <p className="text-[11px] text-slate-500">
                Or speak: "I am Rohan and password is XYZ" to log in
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Core AI Engines Grid */}
      <section className="w-full max-w-7xl mx-auto py-24 px-6 relative z-10 border-t border-slate-800/80">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4">
            Clinical Precision & Ultra-Low Latency
          </h2>
          <div className="w-20 h-1 bg-slate-400 rounded-full shadow-[0_0_12px_rgba(226,232,240,0.6)]" />
          <p className="mt-4 text-base text-slate-400 font-light max-w-2xl leading-relaxed">
            Engineered with modern vision AI, local browser cryptography, and instant speech synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Camera className="w-6 h-6 text-slate-200" />}
            title="Biomarker Camera"
            description="Take high-resolution photos of rashes, burns, cuts, or eye biomarkers. Our AI identifies symptoms and provides verified clinical steps instantly."
          />
          <FeatureCard
            icon={<Lock className="w-6 h-6 text-slate-200" />}
            title="Encrypted Vault"
            description="All diagnostic records and images are sealed with client-side AES-256 GCM encryption. Your health data is inaccessible without your password."
          />
          <FeatureCard
            icon={<Cpu className="w-6 h-6 text-slate-200" />}
            title="Groq Voice Engine"
            description="Sub-second conversational intelligence powered by Groq Llama-3.3-70B. Speak freely in Hindi or English with hands-free camera gestures."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full max-w-7xl mx-auto py-24 px-6 relative z-10 border-t border-slate-800/80">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">
            Workflow
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4">
            Three Steps to Full Insight
          </h2>
          <div className="w-20 h-1 bg-slate-400 rounded-full mx-auto shadow-[0_0_12px_rgba(226,232,240,0.6)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            step="01"
            title="Speak or Capture"
            description="Click the mic, wake up RoboDoc with your voice, or show a thumbs-up to your camera to snap a symptom photo."
          />
          <StepCard
            step="02"
            title="Clinical Multimodal AI"
            description="Vision models parse subtle visual indicators while Groq computes rapid clinical recommendations."
          />
          <StepCard
            step="03"
            title="Encrypted Preservation"
            description="The report and high-res photo are automatically locked into your private AES-256 Diagnosis Vault."
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-4xl mx-auto py-20 px-6 relative z-10 border-t border-slate-800/80">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-3">
            Frequently Asked Questions
          </h2>
          <div className="w-16 h-1 bg-slate-400 rounded-full mx-auto shadow-[0_0_10px_rgba(226,232,240,0.6)]" />
        </div>

        <div className="space-y-4">
          <FAQCard 
            question="Who can see my captured images and diagnosis logs?"
            answer="Nobody except you. Every image and diagnosis is encrypted directly on your device with AES-256 GCM using your password. Without the password, the data is unreadable random ciphertext."
          />
          <FAQCard 
            question="How does voice login work?"
            answer="Simply speak to the agent: 'I am Rohan and password is XYZ'. RoboDoc identifies your voice phrase, authenticates your session, and unlocks your encrypted vault without touching the keyboard."
          />
          <FAQCard 
            question="Is this a replacement for a doctor?"
            answer="No. RoboDoc is an AI wellness assistant designed for early symptom estimation and first-aid guidance. In emergencies, please dial your local emergency services (911, 112, or 108)."
          />
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="w-full py-20 px-6 relative z-10 border-t border-slate-800/80 bg-neutral-950/60 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mb-6">
            Experience RoboDoc Today
          </h2>
          <p className="text-base text-slate-400 max-w-lg mb-10 leading-relaxed font-light">
            Start a voice conversation or capture your first symptom check right now in your browser.
          </p>
          <Link href="/dashboard">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(226, 232, 240, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-white text-black font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(226,232,240,0.3)] transition-all flex items-center gap-2"
            >
              Open RoboDoc Dashboard <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Clean Minimalist Footer */}
      <footer className="w-full bg-[#070709] py-10 px-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold tracking-wider text-slate-400">ROBODOC • VITALLENS</span>
          <p className="text-[11px] text-slate-600 max-w-md">
            Medical Disclaimer: AI-generated wellness insight tool. Not a medical diagnosis. Consult a physician for medical emergencies.
          </p>
          <p>© {new Date().getFullYear()} RoboDoc AI</p>
        </div>
      </footer>

    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -6, borderColor: "rgba(226,232,240,0.4)" }}
      transition={{ duration: 0.3 }}
      className="p-8 rounded-3xl bg-neutral-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col items-start transition-all shadow-[0_0_30px_rgba(226,232,240,0.02)] group"
    >
      <div className="w-12 h-12 rounded-2xl bg-black border border-slate-700/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed font-light">{description}</p>
    </motion.div>
  );
}

function StepCard({ step, title, description }: { step: string, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-neutral-900/40 border border-slate-800/80 flex flex-col items-start text-left relative group hover:border-slate-700 transition-all">
      <span className="text-3xl font-black text-slate-600 mb-4 group-hover:text-slate-300 transition-colors">{step}</span>
      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-400 leading-relaxed font-light">{description}</p>
    </div>
  );
}

function FAQCard({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className="border border-slate-800 bg-neutral-900/50 rounded-2xl overflow-hidden cursor-pointer hover:border-slate-700 transition-colors backdrop-blur-sm"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="p-5 flex items-center justify-between">
        <h4 className="text-base font-bold text-white">{question}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </div>
      <motion.div 
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden px-5"
      >
        <p className="pb-5 text-slate-400 font-light text-sm leading-relaxed">{answer}</p>
      </motion.div>
    </div>
  );
}
