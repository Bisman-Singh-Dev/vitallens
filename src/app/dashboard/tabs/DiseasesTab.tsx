"use client";

import { motion } from "framer-motion";
import { AlertCircle, ChevronRight, Activity, CalendarClock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DiseasesTab({ user, latestScan, setActiveTab }: { user: any, latestScan: any, setActiveTab?: (tab: string) => void }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!latestScan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-neutral-900/50 rounded-3xl border border-neon-red/20 shadow-[0_0_15px_rgba(255,51,102,0.1)]">
        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-6 border border-neon-red/30">
          <Activity className="w-10 h-10 text-neon-red opacity-50" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">No Scan Data Found</h2>
        <p className="text-gray-400 max-w-md mb-8">
          You haven't completed your first diagnostic scan yet. Use the RoboDoc camera to analyze symptoms.
        </p>
        <button 
          onClick={() => setActiveTab ? setActiveTab("ai-diagnostics") : window.location.href = "/dashboard"} 
          className="px-6 py-3 bg-neon-red text-white hover:bg-neon-red-bright font-bold rounded-xl shadow-[0_0_20px_rgba(255,51,102,0.4)] transition-all"
        >
          Start Diagnostic Scan
        </button>
      </div>
    );
  }

  const { flaggedConditions = [], personalizedPlan = [], disclaimer, capturedAt } = latestScan;
  const scanDate = new Date(capturedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-8">
      {/* Disclaimer Banner */}
      <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
        <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-red-400 mb-1">Medical Disclaimer</h4>
          <p className="text-sm text-red-300/80 leading-relaxed">
            {disclaimer || "This is an AI-generated diagnostic estimate, not an in-person hospital diagnosis. Consult a licensed physician for any urgent concern."}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Diagnostic Insights</h2>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
            <CalendarClock className="w-4 h-4" />
            Last checked: {scanDate}
          </div>
        </div>
        <button 
          onClick={() => setActiveTab ? setActiveTab("ai-diagnostics") : window.location.href = "/dashboard"} 
          className="px-4 py-2 bg-neutral-900 border border-neon-red/50 text-neon-red font-medium rounded-lg hover:bg-neon-red/10 transition-colors shadow-[0_0_10px_rgba(255,51,102,0.2)] text-sm"
        >
          Re-Scan
        </button>
      </div>

      {/* Flagged Conditions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {flaggedConditions.length === 0 ? (
          <div className="sm:col-span-2 bg-green-950/30 border border-green-500/30 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="font-semibold text-green-400 mb-1">No significant risks detected</h3>
            <p className="text-green-500/80 text-sm">Your visual indicators look normal based on our AI check.</p>
          </div>
        ) : (
          flaggedConditions.map((condition: any, idx: number) => (
            <div key={idx} className="bg-neutral-900 rounded-2xl border border-neon-red/30 shadow-[0_0_10px_rgba(255,51,102,0.05)] overflow-hidden transition-all hover:shadow-[0_0_15px_rgba(255,51,102,0.2)] hover:border-neon-red/60 flex flex-col">
              <div 
                className="p-5 flex items-start justify-between cursor-pointer flex-1"
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              >
                <div className="flex items-start gap-4">
                  {/* Progress Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-neutral-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-neon-red"
                        strokeWidth="3"
                        strokeDasharray={`${condition.likelihood_percent}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-xs font-bold text-white">{condition.likelihood_percent}%</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{condition.name}</h3>
                    <p className="text-xs text-neon-red mb-2">Risk Indicator</p>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{condition.rationale}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-neon-red/10 bg-black flex justify-end">
                <Link 
                  href={`/dashboard/plan/${encodeURIComponent(condition.name)}`}
                  className="px-4 py-2 bg-neon-red/10 text-neon-red border border-neon-red/50 hover:bg-neon-red hover:text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_10px_rgba(255,51,102,0.2)]"
                >
                  Create Personalized Plan
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Personalized Plan */}
      {personalizedPlan.length > 0 && (
        <div className="bg-neutral-900 rounded-3xl border border-neon-red/30 shadow-[0_0_15px_rgba(255,51,102,0.1)] p-6 sm:p-8 mt-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-neon-red/20 flex items-center justify-center text-neon-red">📋</span>
            General Reduction Plan
          </h3>
          <ul className="space-y-4">
            {personalizedPlan.map((step: string, idx: number) => (
              <li key={idx} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-black border border-neon-red flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_rgba(255,51,102,0.4)]">
                  <span className="text-neon-red text-xs font-bold">{idx + 1}</span>
                </div>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{step}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
