"use client";

import React, { useState } from "react";
import { 
  Stethoscope, 
  Search, 
  UserCheck, 
  FileText, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle,
  ArrowLeft,
  FilePlus,
  Send
} from "lucide-react";
import { 
  getActiveUser, 
  getEmergencyProfile, 
  addTimelineEvent, 
  ClinicalTimelineItem 
} from "@/lib/vaultStore";

export default function DoctorPortalTab({ 
  onSwitchBack, 
  onAddPrescription 
}: { 
  onSwitchBack: () => void;
  onAddPrescription?: (rx: any) => void;
}) {
  const [searchId, setSearchId] = useState("HT-2026-88231");
  const [patientFound, setPatientFound] = useState(true);
  const [rxDrug, setRxDrug] = useState("");
  const [rxDosage, setRxDosage] = useState("");
  const [rxInstructions, setRxInstructions] = useState("");
  const [rxIssued, setRxIssued] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim().toUpperCase().includes("HT") || searchId.includes("4210") || searchId.trim().length > 3) {
      setPatientFound(true);
    } else {
      setPatientFound(false);
    }
  };

  const handleIssueRx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxDrug.trim()) return;

    const patient = getActiveUser();
    await addTimelineEvent({
      year: new Date().getFullYear().toString(),
      date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      category: "Prescriptions",
      title: `${rxDrug.trim()} — Digital e-Prescription`,
      provider: "Dr. Rajesh Sharma · Apollo Hospitals",
      notes: `${rxDosage.trim()} | Instructions: ${rxInstructions.trim()}`,
      status: "Verified",
      iconType: "pill"
    }, patient?.id);

    if (onAddPrescription) {
      onAddPrescription({
        title: `${rxDrug.trim()} — Prescription`,
        provider: "Dr. Rajesh Sharma · Apollo Hospitals",
        notes: `${rxDosage.trim()} · ${rxInstructions.trim()}`
      });
    }

    setRxIssued(true);
    setTimeout(() => {
      setRxIssued(false);
      setRxDrug("");
      setRxDosage("");
      setRxInstructions("");
    }, 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* DOCTOR BANNER */}
      <div className="bg-[#0b2b46] rounded-2xl border border-slate-700/60 p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-700/80 border border-emerald-500/40 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Dr. Rajesh Sharma, MD</h2>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                ABDM Verified Practitioner
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Senior Consultant Cardiologist · Apollo Hospitals, New Delhi · Reg ID: ABDM-HP-88914
            </p>
          </div>
        </div>

        <button
          onClick={onSwitchBack}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Switch to Patient Vault</span>
        </button>
      </div>

      {/* SEARCH PATIENT VAULT */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Patient Lookup & ABHA Health Records Authorization
        </h3>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input 
              type="text" 
              placeholder="Enter Patient Health ID (e.g. HT-2026-88231 or 4210 8842 7731)..." 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900"
            />
          </div>
          <button 
            type="submit"
            className="px-5 py-2.5 bg-[#0d3859] hover:bg-[#0a2d48] text-white text-xs font-bold rounded-xl transition-colors"
          >
            Access Vault
          </button>
        </form>

        {patientFound ? (
          <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Consent Active · Full Clinical Access
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-1">Aradhya Tripathi</h4>
                <p className="text-xs text-slate-500">ABHA: HT-2026-88231 · Phone: +91 98765 43210 · Age: 34 yrs</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  Blood: B+ Positive
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Allergy: Penicillin
                </span>
              </div>
            </div>

            {/* Quick clinical findings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Active Rx</p>
                <p className="font-bold text-slate-800 mt-0.5">Amlodipine 5mg OD</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Chronic</p>
                <p className="font-bold text-slate-800 mt-0.5">Essential Hypertension</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Last Blood Pressure</p>
                <p className="font-bold text-emerald-700 mt-0.5">122/80 mmHg (Controlled)</p>
              </div>
            </div>

            {/* ISSUE DIGITAL E-PRESCRIPTION */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-blue-600" />
                <h5 className="text-sm font-bold text-slate-900">Issue Cryptographically Signed e-Prescription</h5>
              </div>

              {rxIssued && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>e-Prescription signed by Dr. Rajesh Sharma and synced dynamically to Aradhya's Lifelong Timeline.</span>
                </div>
              )}

              <form onSubmit={handleIssueRx} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Medication Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Telmisartan 40mg / Atorvastatin 10mg" 
                      value={rxDrug}
                      onChange={(e) => setRxDrug(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dosage & Frequency</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1 Tablet once daily after dinner" 
                      value={rxDosage}
                      onChange={(e) => setRxDosage(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Doctor's Advice & Diagnostic Note</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Continue low sodium diet. Follow-up lipid profile in 6 months." 
                    value={rxInstructions}
                    onChange={(e) => setRxInstructions(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-[#0d3859] hover:bg-[#0a2d48] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Sign & Deliver to Health Vault</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-semibold">Patient record not found for "{searchId}"</p>
            <p className="text-xs text-slate-400 mt-1">Verify ABHA ID or request electronic consent from patient.</p>
          </div>
        )}
      </div>

    </div>
  );
}
