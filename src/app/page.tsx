"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldAlert, FileHeart, Activity, Camera, BrainCircuit, CheckCircle2, ChevronDown, LayoutDashboard, Eye, Zap, Brain } from "lucide-react";
import Link from "next/link";
import GradualBlur from "@/components/GradualBlur";
import { useState } from "react";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center w-full bg-black min-h-screen text-white relative overflow-x-hidden">
      
      {/* Massive Neon Red Glow Background */}
      <div className="absolute top-0 left-0 w-full h-[1200px] pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[900px] h-[900px] bg-brand-500/40 rounded-full blur-[160px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[10%] left-[20%] w-[700px] h-[700px] bg-neon-red/30 rounded-full blur-[140px]"
        />
      </div>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto py-24 px-6 lg:py-40 relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-[90vh]">
        <div className="lg:w-1/2 flex flex-col items-start text-left">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-4 uppercase leading-[0.9]"
          >
            <span className="text-neon-red block drop-shadow-[0_0_15px_rgba(255,51,102,0.8)]">RoboDoc</span>
            <span className="text-white">Vision</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-gray-300 font-light max-w-lg mb-10 leading-relaxed"
          >
            A deeper look into your health. We use multimodal AI to analyze visual bio-markers in your eye, delivering highly personalized wellness insights.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
          >
            <Link href="/dashboard">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(226, 232, 240, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(226,232,240,0.3)] flex items-center gap-2 w-full justify-center transition-all"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-black/60 border border-slate-600 text-white font-bold uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(226,232,240,0.1)] flex items-center gap-2 w-full justify-center transition-all"
              >
                Sign In / Login
              </motion.button>
            </Link>
          </motion.div>
        </div>
        
        {/* Mascot / Right Side Graphic */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="lg:w-1/2 mt-20 lg:mt-0 flex justify-end relative z-10"
        >
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-72 h-72 sm:w-[450px] sm:h-[450px] rounded-full bg-black/40 backdrop-blur-2xl border-2 border-neon-red/30 shadow-[0_0_150px_rgba(255,51,102,0.4)] flex items-center justify-center overflow-hidden"
          >
             <img src="/mascot/robo-doctor.png" alt="Robo-Doctor Mascot" className="w-[120%] h-auto object-cover opacity-90" />
          </motion.div>
        </motion.div>

      </section>

      {/* Wearable Showcase Section (New) */}
      <section className="w-full min-h-[90vh] bg-black py-24 px-6 flex flex-col items-center justify-center relative z-10 border-b border-neon-red/20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02, boxShadow: "0 0 120px rgba(255,51,102,0.6)" }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="w-full max-w-6xl aspect-[16/9] border-4 border-neon-red rounded-[3rem] shadow-[0_0_80px_rgba(255,51,102,0.4)] flex items-center justify-center overflow-hidden bg-gradient-to-tr from-brand-900/40 to-black relative cursor-pointer group"
        >
          {/* Inner animated glowing effect */}
          <div className="absolute inset-0 bg-neon-red/10 group-hover:bg-neon-red/30 transition-colors duration-700 z-0" />
          
          <div className="z-10 text-center flex flex-col items-center">
             <Activity className="w-32 h-32 md:w-48 md:h-48 text-neon-red mb-8 drop-shadow-[0_0_30px_rgba(255,51,102,1)] group-hover:scale-110 transition-transform duration-500" />
             <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white drop-shadow-lg">RoboDoc <span className="text-neon-red drop-shadow-[0_0_20px_rgba(255,51,102,0.8)]">Band</span></h2>
             <p className="text-2xl text-gray-300 font-light mt-6 tracking-widest uppercase">Coming Soon</p>
          </div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-4xl text-gray-300 font-light text-center max-w-4xl mt-16 leading-relaxed"
        >
          Our Latest Wearable Allowing to live a better and peaceful life without stress.
        </motion.p>
      </section>

      {/* Features Overview */}
      <section id="features" className="w-full bg-neutral-dark/80 border-y border-neon-red/20 py-32 px-6 relative z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 md:mb-24 flex flex-col items-center text-center"
          >
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-6">
              The <span className="text-neon-red drop-shadow-[0_0_10px_rgba(255,51,102,0.8)]">Core</span> Engine
            </h2>
            <div className="w-32 h-1.5 bg-neon-red rounded-full shadow-[0_0_10px_rgba(255,51,102,0.5)]" />
            <p className="mt-8 text-xl text-gray-400 font-light max-w-3xl">
              We leverage multi-modal Gemini Vision AI to turn your smartphone into a preventative wellness tool. Connect your wearables to make the picture complete.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/features/analysis">
              <FeatureCard
                icon={<ShieldAlert className="w-10 h-10 text-neon-red drop-shadow-[0_0_8px_rgba(255,51,102,0.8)]" />}
                title="Visual Biomarkers"
                description="Our proprietary AI scans your eye photo for early indicators of common wellness issues, such as digital strain, fatigue, and vascular changes."
                delay={0.1}
              />
            </Link>
            <Link href="/features/reminders">
              <FeatureCard
                icon={<FileHeart className="w-10 h-10 text-neon-red drop-shadow-[0_0_8px_rgba(255,51,102,0.8)]" />}
                title="Actionable Habits"
                description="Don't just see data—act on it. Receive automated, highly personalized lifestyle suggestions and SMS Text reminders tailored to you."
                delay={0.2}
              />
            </Link>
            <Link href="/features/wearables">
              <FeatureCard
                icon={<Activity className="w-10 h-10 text-neon-red drop-shadow-[0_0_8px_rgba(255,51,102,0.8)]" />}
                title="Wearable Sync"
                description="Connect your RoboDoc Band to continuously track live heart rate, blood oxygen (SpO2), and sleep duration alongside your AI scans."
                delay={0.3}
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Any Body Part Section (New) */}
      <section className="w-full bg-black py-24 px-6 relative z-10">
        {/* Deep red side glow */}
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-neon-red/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <div className="w-20 h-20 bg-neon-red/10 border border-neon-red/30 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(255,51,102,0.2)]">
              <Camera className="w-10 h-10 text-neon-red" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-6">
              Scan Any Body Part
            </h2>
            <p className="text-xl text-gray-400 font-light mb-6 leading-relaxed">
              Your skin, eyes, and body hold subtle visual clues to your overall health. Now, you can use your smartphone to take a live photo of any area of concern.
            </p>
            <p className="text-lg text-gray-500 font-light leading-relaxed">
              Whether it's a new skin rash, swollen joints, or digital eye strain, our multimodal AI analyzes these visual biomarkers instantly to provide personalized insights and direct you toward the right wellness habits.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:w-1/2 relative"
          >
            <div className="bg-black/50 border border-neon-red/30 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-neon-red transition-all shadow-[0_0_20px_rgba(255,51,102,0.1)] hover:shadow-[0_0_40px_rgba(255,51,102,0.3)]">
              <div className="w-14 h-14 bg-neon-red/10 border border-neon-red/30 rounded-xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-neon-red" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 z-10">Gemini Vision AI</h3>
              <p className="text-gray-400 font-light leading-relaxed z-10 relative">
                Powered by state-of-the-art vision models. Instantly analyzes microvascular patterns, pupil dilation, and skin tone to detect hidden health biomarkers with clinical-grade precision.
              </p>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neon-red/10 blur-[50px] rounded-full z-0 group-hover:bg-neon-red/20 transition-all"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Dashboard Experience (New) */}
      <section className="w-full bg-black py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <div className="w-20 h-20 bg-neon-red/10 border border-neon-red/30 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(255,51,102,0.2)]">
              <LayoutDashboard className="w-10 h-10 text-neon-red" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-6">
              The Command Center
            </h2>
            <p className="text-xl text-gray-400 font-light mb-6 leading-relaxed">
              Your health isn't a static number. The RoboDoc dashboard gives you a living, breathing view of your wellness journey over time.
            </p>
            <ul className="space-y-4 text-gray-300 font-light text-lg">
              <li className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-neon-red" /> <strong>Interactive Charts:</strong> Track your resting heart rate and SpO2 dynamically.
              </li>
              <li className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-neon-red" /> <strong>Historical Scans:</strong> Compare today's eye scan with last month's results.
              </li>
              <li className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-neon-red" /> <strong>Centralized Habits:</strong> Check off your daily routines directly in the app.
              </li>
            </ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:w-1/2 w-full"
          >
            {/* Mock Dashboard UI Graphic */}
            <div className="w-full aspect-[4/3] rounded-2xl bg-black border border-white/10 shadow-2xl overflow-hidden flex flex-col">
              <div className="h-10 w-full bg-neutral-dark/80 border-b border-white/10 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-1/3 h-8 bg-white/5 rounded-md" />
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/50" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 h-24 bg-white/5 rounded-xl border border-white/5" />
                  <div className="flex-1 h-24 bg-white/5 rounded-xl border border-white/5" />
                  <div className="flex-1 h-24 bg-white/5 rounded-xl border border-white/5" />
                </div>
                <div className="flex-1 w-full bg-gradient-to-t from-neon-red/10 to-transparent rounded-xl border border-neon-red/20 mt-4 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-neon-red/20 blur-2xl" />
                  {/* Decorative chart line mock */}
                  <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,80 Q25,60 50,70 T100,30" fill="none" stroke="rgba(255, 51, 102, 0.8)" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="w-full bg-black py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 md:mb-24 text-center flex flex-col items-center"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">
              How It Works
            </h2>
            <div className="w-24 h-1 bg-neon-red rounded-full shadow-[0_0_10px_rgba(255,51,102,0.6)]" />
            <p className="mt-6 text-gray-400 max-w-2xl mx-auto font-light text-xl">
              Three simple steps to unlock deep insights into your visual and systemic wellness.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-neon-red/40 to-transparent z-0 shadow-[0_0_10px_rgba(255,51,102,0.4)]" />
            
            <StepCard 
              number="01" 
              icon={<Camera className="w-7 h-7 text-white" />} 
              title="Snap a Photo" 
              description="Use your smartphone or webcam to take a high-resolution, well-lit picture of your eye." 
              delay={0.1} 
            />
            <StepCard 
              number="02" 
              icon={<BrainCircuit className="w-7 h-7 text-white" />} 
              title="Gemini Vision AI" 
              description="Our cutting-edge multimodal AI scans the image locally to detect subtle bio-markers." 
              delay={0.2} 
            />
            <StepCard 
              number="03" 
              icon={<CheckCircle2 className="w-7 h-7 text-white" />} 
              title="Get Your Plan" 
              description="Receive a customized report with likelihood scores and a personalized daily habit plan." 
              delay={0.3} 
            />
          </div>
        </div>
      </section>

      {/* FAQ Section (New) */}
      <section className="w-full bg-neutral-dark/40 py-32 px-6 relative z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-neon-red rounded-full mx-auto shadow-[0_0_10px_rgba(255,51,102,0.6)]" />
          </div>

          <div className="space-y-6">
            <FAQCard 
              question="Is this a medical diagnosis?"
              answer="No. RoboDoc is a wellness tool designed to estimate potential risk factors based on visual indicators. It should never replace a consultation with a licensed ophthalmologist or physician."
            />
            <FAQCard 
              question="What happens to the images I scan?"
              answer="Extremely secure. We use enterprise-grade encryption. Images are encoded in base64 format and sent securely over HTTPS to the Gemini Vision API for transient inference, and are never used to train public models."
            />
            <FAQCard 
              question="Do I need the RoboDoc Band to use the app?"
              answer="Not at all! The core eye-scanning feature and habit manager work completely independently. The band is just an optional add-on for users who want continuous heart rate and sleep tracking in the same dashboard."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full bg-gradient-to-b from-black to-brand-900/60 py-20 px-6 relative z-10 border-t border-neon-red/20 overflow-hidden">
        {/* Intense center glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-neon-red/20 blur-[150px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-8"
          >
            Ready to <span className="text-neon-red drop-shadow-[0_0_15px_rgba(255,51,102,0.8)]">Transform</span> Your Health?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-gray-300 font-light mb-12"
          >
            Join the platform that turns a simple selfie into actionable, life-changing wellness habits.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/dashboard">
              <button className="px-14 py-6 bg-neon-red text-white font-black text-xl uppercase tracking-widest rounded-md shadow-[0_0_50px_rgba(255,51,102,0.8)] hover:bg-brand-400 hover:scale-105 transition-all">
                Go To Dashboard
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-black text-white py-12 px-6 mt-auto border-t border-neon-red/30 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-2xl font-black uppercase text-neon-red drop-shadow-[0_0_8px_rgba(255,51,102,0.8)] tracking-widest mb-2">RoboDoc</span>
            <p className="text-gray-500 text-sm max-w-md">
              Where flavor hits the road... for your health.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/5 text-xs text-gray-600 text-center">
          <p className="max-w-4xl mx-auto uppercase tracking-wider font-semibold">
            Medical Disclaimer: This is an AI-generated wellness estimate, not a medical diagnosis. Consult a licensed physician or ophthalmologist for any health concern.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.5)", borderColor: "rgba(255,51,102,0.4)" }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      className="bg-black/60 backdrop-blur-sm p-10 rounded-2xl border border-white/10 flex flex-col items-start h-full cursor-pointer group transition-all"
    >
      <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-neon-red/10 transition-colors shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-black uppercase tracking-wide text-white mb-4 group-hover:text-neon-red transition-colors drop-shadow-md">{title}</h3>
      <p className="text-gray-400 leading-relaxed font-light text-lg">
        {description}
      </p>
    </motion.div>
  );
}

function StepCard({ number, icon, title, description, delay }: { number: string, icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center text-center relative z-10 group"
    >
      <span className="text-5xl font-black text-white/20 drop-shadow-md mb-6">{number}</span>
      <div className="w-24 h-24 rounded-full bg-neon-red flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,51,102,0.4)] group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(255,51,102,0.6)] transition-all relative">
        {icon}
      </div>
      <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-sm">{title}</h3>
      <p className="text-gray-400 leading-relaxed font-light text-lg">{description}</p>
    </motion.div>
  );
}

function FAQCard({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className="border border-white/10 bg-black/40 rounded-xl overflow-hidden cursor-pointer hover:border-neon-red/30 transition-colors backdrop-blur-sm"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="p-6 flex items-center justify-between">
        <h4 className="text-xl font-bold text-white">{question}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className="w-6 h-6 text-neon-red" />
        </motion.div>
      </div>
      <motion.div 
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden px-6"
      >
        <p className="pb-6 text-gray-400 font-light text-lg leading-relaxed">{answer}</p>
      </motion.div>
    </div>
  );
}
