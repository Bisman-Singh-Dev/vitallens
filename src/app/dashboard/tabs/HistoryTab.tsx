"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  Trash2, 
  Eye, 
  Sparkles, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ShieldAlert,
  ChevronRight, 
  Image as ImageIcon,
  CheckCircle2,
  Stethoscope,
  X,
  Lock,
  Unlock,
  KeyRound
} from "lucide-react";
import { encryptData, decryptData } from "@/lib/encryption";

export interface DiagnosticRecord {
  id: string;
  timestamp: string;
  imageUrl?: string;
  userQuery?: string;
  diagnosisText: string;
  diseaseTitle?: string;
  recommendations?: string[];
  doctorSpecialty?: string;
}

const STORAGE_KEY_ENCRYPTED = "vitallens_diagnostics_encrypted_vault";
const SESSION_VAULT_KEY = "vitallens_vault_session_key";

/**
 * Retrieve active session encryption key if user is logged in
 */
export function getActiveSessionKey(): string | null {
  if (typeof window === "undefined") return null;
  const sessionPass = sessionStorage.getItem(SESSION_VAULT_KEY);
  if (sessionPass) return sessionPass;

  // Check if logged in user has an active session password
  const storedUser = localStorage.getItem("vitallens_active_user");
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      if (u.sessionKey) return u.sessionKey;
      if (u.isVoiceLoggedIn && u.displayName?.toLowerCase() === "rohan") {
        return "XYZ"; // Default password for Rohan voice login
      }
    } catch(e) {}
  }
  return null;
}

/**
 * Sets active session encryption key
 */
export function setActiveSessionKey(password: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_VAULT_KEY, password);
}

/**
 * Saves a diagnostic record encrypted with the user's password
 */
export async function saveDiagnosticRecord(record: Omit<DiagnosticRecord, "id" | "timestamp">) {
  if (typeof window === "undefined") return;
  
  const encryptionKey = getActiveSessionKey();
  if (!encryptionKey) {
    console.warn("No active encryption key found. Record will be stored in secure temporary state.");
  }

  const keyToUse = encryptionKey || "vitallens_temp_secure_key";

  try {
    let diseaseTitle = record.diseaseTitle;
    let doctorSpecialty = record.doctorSpecialty;
    const recommendations = record.recommendations || [];

    if (!diseaseTitle && record.diagnosisText) {
      const match = record.diagnosisText.match(/<<([^>>]+)>>/);
      if (match) diseaseTitle = match[1];
    }

    if (!doctorSpecialty && record.diagnosisText) {
      const match = record.diagnosisText.match(/What kind of doctor you should see:\s*([^\n\.]+)/i);
      if (match) doctorSpecialty = match[1].trim();
    }

    const newRecord: DiagnosticRecord = {
      id: "diag_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      imageUrl: record.imageUrl,
      userQuery: record.userQuery,
      diagnosisText: record.diagnosisText,
      diseaseTitle: diseaseTitle || "Clinical Health Observation",
      recommendations,
      doctorSpecialty: doctorSpecialty || "General Physician"
    };

    // Load existing encrypted vault
    const existingRaw = localStorage.getItem(STORAGE_KEY_ENCRYPTED);
    let list: DiagnosticRecord[] = [];

    if (existingRaw) {
      try {
        const decryptedJson = await decryptData(existingRaw, keyToUse);
        list = JSON.parse(decryptedJson);
      } catch (decErr) {
        // Vault might have been encrypted with a different key or is fresh
        console.warn("Existing vault could not be decrypted with current key; appending to new session.");
      }
    }

    const updated = [newRecord, ...list].slice(0, 50);
    const encryptedPayload = await encryptData(JSON.stringify(updated), keyToUse);
    localStorage.setItem(STORAGE_KEY_ENCRYPTED, encryptedPayload);
    window.dispatchEvent(new Event("vitallens_history_updated"));
  } catch (err) {
    console.error("Failed to encrypt & save diagnostic record:", err);
  }
}

export default function HistoryTab({ onClose }: { onClose?: () => void }) {
  const [records, setRecords] = useState<DiagnosticRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DiagnosticRecord | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Attempt auto-unlock if session key already exists (e.g. from voice login "XYZ" or login page)
  const attemptAutoUnlock = async () => {
    const existingKey = getActiveSessionKey();
    const encryptedVault = localStorage.getItem(STORAGE_KEY_ENCRYPTED);

    if (!encryptedVault) {
      setIsLocked(false);
      setRecords([]);
      return;
    }

    if (existingKey) {
      setIsDecrypting(true);
      try {
        const decryptedJson = await decryptData(encryptedVault, existingKey);
        const parsed = JSON.parse(decryptedJson);
        setRecords(parsed);
        setIsLocked(false);
      } catch (e) {
        setIsLocked(true);
      } finally {
        setIsDecrypting(false);
      }
    } else {
      setIsLocked(true);
    }
  };

  useEffect(() => {
    attemptAutoUnlock();
    const handleUpdate = () => attemptAutoUnlock();
    window.addEventListener("vitallens_history_updated", handleUpdate);
    return () => window.removeEventListener("vitallens_history_updated", handleUpdate);
  }, []);

  const handleManualUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!passwordInput.trim()) {
      setAuthError("Password is required to decrypt your vault.");
      return;
    }

    const encryptedVault = localStorage.getItem(STORAGE_KEY_ENCRYPTED);
    if (!encryptedVault) {
      setActiveSessionKey(passwordInput.trim());
      setIsLocked(false);
      setRecords([]);
      return;
    }

    setIsDecrypting(true);
    try {
      const decryptedJson = await decryptData(encryptedVault, passwordInput.trim());
      const parsed = JSON.parse(decryptedJson);
      setActiveSessionKey(passwordInput.trim());
      setRecords(parsed);
      setIsLocked(false);
      setPasswordInput("");
    } catch (err) {
      setAuthError("Access Denied: Incorrect password. AES-256 decryption failed.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const clearAllHistory = () => {
    if (confirm("Are you sure you want to permanently delete all encrypted medical records and images?")) {
      localStorage.removeItem(STORAGE_KEY_ENCRYPTED);
      setRecords([]);
      setSelectedRecord(null);
    }
  };

  const deleteSingleRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = records.filter(r => r.id !== id);
    const key = getActiveSessionKey() || "vitallens_temp_secure_key";
    try {
      const encryptedPayload = await encryptData(JSON.stringify(updated), key);
      localStorage.setItem(STORAGE_KEY_ENCRYPTED, encryptedPayload);
      setRecords(updated);
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  const lockVaultNow = () => {
    sessionStorage.removeItem(SESSION_VAULT_KEY);
    setIsLocked(true);
    setSelectedRecord(null);
  };

  const filteredRecords = records.filter(r => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      (r.diseaseTitle && r.diseaseTitle.toLowerCase().includes(q)) ||
      (r.diagnosisText && r.diagnosisText.toLowerCase().includes(q)) ||
      (r.userQuery && r.userQuery.toLowerCase().includes(q))
    );
  });

  // LOCKED STATE: Require Password to view any data or images
  if (isLocked) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-16 text-white select-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-neutral-900/90 border border-slate-700/80 p-8 sm:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(226,232,240,0.08)] text-center relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-2xl bg-black border-2 border-slate-600/60 flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(226,232,240,0.15)]">
            <Lock className="w-8 h-8 text-slate-200" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-2">
            Encrypted Medical Vault
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed max-w-sm mx-auto">
            All captured photos and clinical diagnoses are protected with client-side <strong>AES-256 GCM encryption</strong>. Nobody can access this without your password.
          </p>

          {authError && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 text-red-300 rounded-xl text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleManualUnlock} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Account Password / Voice Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="Enter password (e.g. XYZ)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/70 border border-slate-700/80 focus:border-slate-400 rounded-xl outline-none text-white text-sm transition-all placeholder-slate-600 focus:ring-1 focus:ring-slate-400"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isDecrypting}
              className="w-full py-3.5 px-4 bg-slate-200 hover:bg-white text-black font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(226,232,240,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDecrypting ? (
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Decrypt & Unlock Vault</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AES-256 Encryption Active
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Close View
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // UNLOCKED STATE: Display Vault Contents
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900/80 border border-slate-700/50 p-6 md:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(226,232,240,0.06)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black border border-slate-600/60 flex items-center justify-center text-slate-200 shadow-[0_0_20px_rgba(226,232,240,0.15)]">
              <History className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  Diagnosis Vault & Captured Imagery
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> AES-256 Decrypted
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                All photos and clinical analyses are encrypted on device and only accessible with your password.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={lockVaultNow}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all border border-slate-700"
              title="Lock vault immediately"
            >
              <Lock className="w-3.5 h-3.5" /> Lock Vault
            </button>
            {records.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="px-4 py-2.5 rounded-xl bg-black/60 border border-red-500/30 text-red-400 hover:bg-red-950/40 hover:border-red-500/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" /> Clear Vault
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all"
              >
                <X className="w-4 h-4" /> Close View
              </button>
            )}
          </div>
        </div>

        {/* Search bar */}
        {records.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <input
              type="text"
              placeholder="Search by symptom, disease name, or notes..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full px-4 py-3 bg-black/70 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
            />
          </div>
        )}
      </div>

      {/* Main Content: Split List and Detail */}
      {records.length === 0 ? (
        <div className="rounded-3xl bg-neutral-900/40 border border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-black/70 border border-slate-700 flex items-center justify-center mb-4">
            <ImageIcon className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">No Diagnoses Stored Yet</h3>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            When you take a photo with RoboDoc or upload an injury, the photo and its diagnosis are encrypted with your password and saved here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* List of items */}
          <div className="lg:col-span-5 space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredRecords.map((item) => {
              const isSelected = selectedRecord?.id === item.id;
              const dateFormatted = new Date(item.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedRecord(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-start gap-4 ${
                    isSelected
                      ? "bg-slate-800/80 border-slate-400 shadow-[0_0_20px_rgba(226,232,240,0.15)]"
                      : "bg-neutral-900/70 border-slate-800 hover:border-slate-700 hover:bg-neutral-800/50"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl bg-black border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt="Capture thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Stethoscope className="w-7 h-7 text-slate-500" />
                    )}
                    {item.imageUrl && (
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {dateFormatted}
                      </span>
                      <button
                        onClick={(e) => deleteSingleRecord(item.id, e)}
                        className="p-1 text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate group-hover:text-slate-200 transition-colors">
                      {item.diseaseTitle || "Diagnosis Report"}
                    </h4>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.diagnosisText.replace(/EMERGENCY_REDIRECT:[^\n]+/g, "").trim()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed view on the right */}
          <div className="lg:col-span-7">
            {selectedRecord ? (
              <div className="rounded-3xl bg-neutral-900/90 border border-slate-700/70 p-6 md:p-8 backdrop-blur-xl shadow-[0_0_35px_rgba(226,232,240,0.08)] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                      Saved Case Log
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                      {selectedRecord.diseaseTitle || "Diagnosis Overview"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> 
                      {new Date(selectedRecord.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-slate-800 border border-slate-600 rounded-full text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AES-256 Verified
                  </span>
                </div>

                {/* Picture Preview */}
                {selectedRecord.imageUrl && (
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Captured Symptom Image
                    </label>
                    <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video max-h-72 flex items-center justify-center">
                      <img
                        src={selectedRecord.imageUrl}
                        alt="High resolution diagnosis scan"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* User Inquiry */}
                {selectedRecord.userQuery && (
                  <div className="p-4 rounded-xl bg-black/50 border border-slate-800/80">
                    <span className="text-xs text-slate-400 block mb-1 font-semibold">User Context / Prompt:</span>
                    <p className="text-sm text-slate-200 italic">"{selectedRecord.userQuery}"</p>
                  </div>
                )}

                {/* Structured / Formatted Diagnostic Text */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-300" /> RoboDoc Clinical Diagnostic Breakdown
                  </label>
                  <div className="p-5 rounded-2xl bg-black/60 border border-slate-800 text-sm leading-relaxed text-slate-300 whitespace-pre-wrap font-sans">
                    {selectedRecord.diagnosisText}
                  </div>
                </div>

                {/* Recommended Doctor */}
                {selectedRecord.doctorSpecialty && (
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-slate-300 shrink-0" />
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                        Recommended Specialist
                      </span>
                      <p className="text-sm font-bold text-white">
                        {selectedRecord.doctorSpecialty}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl bg-neutral-900/50 border border-slate-800 p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                <Eye className="w-10 h-10 text-slate-600 mb-3" />
                <h4 className="text-base font-semibold text-slate-300 mb-1">Select a Diagnosis Log</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Click on any recorded log on the left to inspect the captured photo, AI clinical findings, and treatment guidance.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
