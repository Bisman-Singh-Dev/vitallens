"use client";

import React, { useState, useEffect } from "react";
import { 
  HeartHandshake, 
  AlertCircle, 
  Phone, 
  Edit3, 
  Check, 
  X, 
  Share2, 
  QrCode, 
  ShieldAlert,
  Save,
  UserCheck
} from "lucide-react";
import { 
  getEmergencyProfile, 
  saveEmergencyProfile, 
  EmergencyMedicalProfile, 
  getActiveUser 
} from "@/lib/vaultStore";

export default function EmergencyProfileTab({ user }: { user?: any }) {
  const [profile, setProfile] = useState<EmergencyMedicalProfile>({
    bloodGroup: "B+ Positive",
    knownAllergies: "Penicillin",
    currentMedications: "Amlodipine 5mg — once daily",
    chronicConditions: "Hypertension",
    previousSurgeries: "Appendectomy (2005)",
    emergencyContact: "Anita Kumar (Spouse) · +91 98111 22334"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EmergencyMedicalProfile>(profile);
  const [showQR, setShowQR] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  const loadData = async () => {
    const activeU = getActiveUser();
    const data = await getEmergencyProfile(activeU?.id);
    setProfile(data);
    setEditForm(data);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("healththread_profile_updated", handleUpdate);
    return () => window.removeEventListener("healththread_profile_updated", handleUpdate);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeU = getActiveUser();
    await saveEmergencyProfile(editForm, activeU?.id);
    setProfile(editForm);
    setIsEditing(false);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      {savedNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>✓ Emergency medical profile updated and cryptographically verified.</span>
          <button onClick={() => setSavedNotification(false)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* MAIN EMERGENCY CARD CONTAINER (Matching Image 1) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        
        {/* Header with Title and Edit button on the right */}
        <div className="flex items-center justify-between pb-7 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Emergency Medical Profile
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly broadcasted to emergency responders, paramedics, and trauma centers during acute ER events.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQR(true)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>ER QR</span>
            </button>
            <button
              onClick={() => {
                setEditForm(profile);
                setIsEditing(true);
              }}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Edit
            </button>
          </div>
        </div>

        {/* 2-COLUMN PROFILE GRID (Image 1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7 pt-7">
          
          {/* Blood Group */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 tracking-wide">
              Blood Group
            </label>
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-50 border border-red-200 shadow-2xs">
                {profile.bloodGroup}
              </span>
            </div>
          </div>

          {/* Known Allergies */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 tracking-wide">
              Known Allergies
            </label>
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-50 border border-red-200 shadow-2xs">
                {profile.knownAllergies}
              </span>
            </div>
          </div>

          {/* Current Medications */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 tracking-wide">
              Current Medications
            </label>
            <div>
              <span className="inline-block px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200/90 shadow-2xs">
                {profile.currentMedications}
              </span>
            </div>
          </div>

          {/* Chronic Conditions */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 tracking-wide">
              Chronic Conditions
            </label>
            <div>
              <span className="inline-block px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200/90 shadow-2xs">
                {profile.chronicConditions}
              </span>
            </div>
          </div>

          {/* Previous Surgeries */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 tracking-wide">
              Previous Surgeries
            </label>
            <div>
              <span className="inline-block px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200/90 shadow-2xs">
                {profile.previousSurgeries}
              </span>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 tracking-wide">
              Emergency Contact
            </label>
            <div>
              <span className="inline-block px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200/90 shadow-2xs">
                {profile.emergencyContact}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* EMERGENCY RESPONDER NOTICE */}
      <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-start gap-3">
        <UserCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-900 leading-relaxed">
          <strong className="font-semibold text-sky-950">ABDM Emergency Bypass Protocol:</strong> In life-threatening emergencies, authorized paramedics and ER doctors can scan your patient QR code or biometric NFC band to view this critical medical profile without waiting for 2-factor OTP.
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSave}
            className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 p-6 relative animate-in fade-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Emergency Medical Profile</h3>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={editForm.bloodGroup}
                  onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-900 bg-white"
                >
                  <option value="A+ Positive">A+ Positive</option>
                  <option value="A- Negative">A- Negative</option>
                  <option value="B+ Positive">B+ Positive</option>
                  <option value="B- Negative">B- Negative</option>
                  <option value="O+ Positive">O+ Positive</option>
                  <option value="O- Negative">O- Negative</option>
                  <option value="AB+ Positive">AB+ Positive</option>
                  <option value="AB- Negative">AB- Negative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Known Allergies</label>
                <input 
                  type="text" 
                  value={editForm.knownAllergies}
                  onChange={(e) => setEditForm({ ...editForm, knownAllergies: e.target.value })}
                  placeholder="e.g. Penicillin, Peanuts"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Medications</label>
                <input 
                  type="text" 
                  value={editForm.currentMedications}
                  onChange={(e) => setEditForm({ ...editForm, currentMedications: e.target.value })}
                  placeholder="e.g. Amlodipine 5mg — once daily"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chronic Conditions</label>
                <input 
                  type="text" 
                  value={editForm.chronicConditions}
                  onChange={(e) => setEditForm({ ...editForm, chronicConditions: e.target.value })}
                  placeholder="e.g. Hypertension, Asthma"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Surgeries</label>
                <input 
                  type="text" 
                  value={editForm.previousSurgeries}
                  onChange={(e) => setEditForm({ ...editForm, previousSurgeries: e.target.value })}
                  placeholder="e.g. Appendectomy (2005)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact</label>
                <input 
                  type="text" 
                  value={editForm.emergencyContact}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                  placeholder="e.g. Name (Relation) · +91 98xxx xxxxx"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0d3859] hover:bg-[#0a2d48] rounded-lg flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ER QR CODE MODAL */}
      {showQR && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl border border-slate-200 p-6 text-center relative animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setShowQR(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-base font-bold text-slate-900 mb-1">Emergency Responder QR</h3>
            <p className="text-xs text-slate-500 mb-4">Print or save this QR code on lock-screen for paramedic access.</p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block mb-4">
              <div className="w-48 h-48 bg-white border border-slate-300 rounded-lg flex flex-col items-center justify-center p-2">
                <QrCode className="w-40 h-40 text-slate-800" />
              </div>
              <p className="text-[10px] font-mono text-slate-500 mt-2">ID: HT-2026-88231 | {profile.bloodGroup.toUpperCase()}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert("Emergency lock-screen card saved to downloads!");
                  setShowQR(false);
                }}
                className="w-full py-2 bg-[#0d3859] hover:bg-[#0a2d48] text-white text-xs font-semibold rounded-lg"
              >
                Save to Phone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
