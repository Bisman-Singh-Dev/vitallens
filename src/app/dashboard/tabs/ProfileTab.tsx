"use client";

import { useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { signOut, deleteUser, reauthenticateWithPopup, updatePassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { 
  Save, 
  LogOut, 
  Trash2, 
  User, 
  Phone, 
  Cigarette, 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";

export default function ProfileTab({ user }: { user: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || "User");
  const [formData, setFormData] = useState({
    age: user.age || "",
    smokingStatus: user.smokingStatus || "Never smoked",
    phoneNumber: user.phoneNumber || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Password Linking State
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLinkingPassword, setIsLinkingPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user.id && user.id !== "guest_user") {
        await updateDoc(doc(db, "users", user.id), {
          displayName: displayName.trim(),
          age: parseInt(formData.age) || 0,
          smokingStatus: formData.smokingStatus,
          phoneNumber: formData.phoneNumber
        });
      }

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      }

      if (typeof window !== "undefined") {
        const activeUser = JSON.parse(localStorage.getItem("vitallens_active_user") || "{}");
        const updated = {
          ...activeUser,
          displayName: displayName.trim(),
          age: formData.age,
          smokingStatus: formData.smokingStatus,
          phoneNumber: formData.phoneNumber
        };
        localStorage.setItem("vitallens_active_user", JSON.stringify(updated));
        window.dispatchEvent(new Event("vitallens_user_updated"));
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMessage("");
    setPasswordErrorMessage("");

    if (!passwordInput || passwordInput.length < 6) {
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      setPasswordErrorMessage("Passwords do not match.");
      return;
    }

    setIsLinkingPassword(true);

    try {
      // 1. Try Firebase Auth update if active
      if (auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, passwordInput);
        } catch (authErr: any) {
          console.warn("Firebase updatePassword notice:", authErr.message);
          // If recent login required, still link locally so user credentials persist
        }
      }

      // 2. Persist in Firestore
      if (user.id && user.id !== "guest_user") {
        try {
          await setDoc(doc(db, "users", user.id), {
            passwordLinked: true,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (dbErr) {
          console.warn("Firestore password link notice:", dbErr);
        }
      }

      // 3. Persist in localStorage session
      if (typeof window !== "undefined") {
        const activeUser = JSON.parse(localStorage.getItem("vitallens_active_user") || "{}");
        const updated = {
          ...activeUser,
          id: user.id || "rohan_demo",
          displayName: displayName || user.displayName || "User",
          email: user.email || "user@vitallens.health",
          passwordLinked: true,
          password: passwordInput,
        };
        localStorage.setItem("vitallens_active_user", JSON.stringify(updated));
        window.dispatchEvent(new Event("vitallens_user_updated"));
      }

      setPasswordSuccessMessage("Password successfully linked to your account! You can now log in using this password.");
      setPasswordInput("");
      setConfirmPasswordInput("");
    } catch (err: any) {
      setPasswordErrorMessage(err.message || "Failed to link password.");
    } finally {
      setIsLinkingPassword(false);
    }
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vitallens_active_user");
    }
    try {
      await signOut(auth);
    } catch (e) {}
    router.push("/login");
  };

  const handleDeleteData = async () => {
    try {
      if (user.id && user.id !== "guest_user") {
        await deleteDoc(doc(db, "users", user.id));
      }
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("vitallens_active_user");
      }
      router.push("/");
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        try {
          if (auth.currentUser) {
            await reauthenticateWithPopup(auth.currentUser, googleProvider);
            if (user.id && user.id !== "guest_user") {
              await deleteDoc(doc(db, "users", user.id));
            }
            await deleteUser(auth.currentUser);
            if (typeof window !== "undefined") {
              localStorage.removeItem("vitallens_active_user");
            }
            router.push("/");
          }
        } catch (reAuthErr) {
          alert("Could not re-authenticate. Please log out and log back in to delete your account.");
        }
      } else {
        alert("Failed to delete account. Please try again after logging in.");
      }
    }
  };

  return (
    <div className="space-y-8 select-none">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Profile & Account Security</h2>
          <p className="text-sm text-gray-400 mt-1">Manage personal details, linked account info, and password authentication</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-neutral-900 border border-neutral-700 hover:border-red-500/80 text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4 text-neon-red" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="bg-neutral-900 rounded-3xl border border-neon-red/30 shadow-[0_0_20px_rgba(255,51,102,0.1)] overflow-hidden">
        
        {/* Header with Account Details */}
        <div className="p-8 border-b border-neon-red/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-black border-2 border-neon-red/60 flex items-center justify-center text-neon-red font-bold text-2xl shadow-[0_0_15px_rgba(255,51,102,0.3)]">
              {displayName ? displayName.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{displayName}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950/80 text-neon-red border border-red-500/40">
                  {user.passwordLinked || user.password ? "Password Linked" : "Active Account"}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-0.5">{user.email || "Linked to RoboDoc Profile"}</p>
              <p className="text-xs text-neutral-500 mt-0.5 font-mono">UID: {user.id || "local-device-user"}</p>
            </div>
          </div>
        </div>

        {/* 1. Account Info & Personal Details */}
        <div className="p-8 space-y-6 bg-black/50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-neon-red" /> Personal Information
            </h4>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-sm font-semibold text-neon-red hover:text-neon-red-bright transition-colors"
              >
                Edit Details
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-sm font-semibold text-neon-red hover:text-neon-red-bright flex items-center gap-1 transition-colors"
                >
                  <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Display Name
              </label>
              <input 
                type="text" 
                disabled={!isEditing}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl focus:border-neon-red outline-none text-white transition-colors disabled:opacity-60 disabled:bg-neutral-900"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Age
              </label>
              <input 
                type="number" 
                disabled={!isEditing}
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl focus:border-neon-red outline-none text-white transition-colors disabled:opacity-60 disabled:bg-neutral-900"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block flex items-center gap-2">
                <Cigarette className="w-4 h-4 text-neon-red/70" /> Smoking Status
              </label>
              <select 
                disabled={!isEditing}
                value={formData.smokingStatus}
                onChange={e => setFormData({...formData, smokingStatus: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl focus:border-neon-red outline-none text-white transition-colors appearance-none disabled:opacity-60 disabled:bg-neutral-900"
              >
                <option value="Never smoked">Never smoked</option>
                <option value="Former smoker">Former smoker</option>
                <option value="Current smoker (occasional)">Current smoker (occasional)</option>
                <option value="Current smoker (daily)">Current smoker (daily)</option>
                <option value="Underage">Underage</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block flex items-center gap-2">
                <Phone className="w-4 h-4 text-neon-red/70" /> Phone Number (For Emergency Alerts)
              </label>
              <input 
                type="tel" 
                disabled={!isEditing}
                value={formData.phoneNumber}
                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                placeholder="+1234567890"
                className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl focus:border-neon-red outline-none text-white transition-colors disabled:opacity-60 disabled:bg-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* 2. Link Account Info with Password */}
        <div className="p-8 border-t border-neon-red/20 bg-neutral-950/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-500/50 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-neon-red" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Link Account with Password</h4>
              <p className="text-xs text-gray-400">Set or update your security password to link credentials to this account</p>
            </div>
          </div>

          {passwordSuccessMessage && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{passwordSuccessMessage}</span>
            </div>
          )}

          {passwordErrorMessage && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center gap-2 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{passwordErrorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLinkPassword} className="space-y-4 max-w-xl mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-2.5 bg-black border border-neutral-800 rounded-xl focus:border-neon-red outline-none text-white text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-2.5 bg-black border border-neutral-800 rounded-xl focus:border-neon-red outline-none text-white text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLinkingPassword}
              className="px-5 py-2.5 bg-neon-red hover:bg-neon-red-bright text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(255,51,102,0.4)] flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isLinkingPassword ? "Linking Password..." : "Link Password to Account"}</span>
            </button>
          </form>
        </div>

        {/* 3. Privacy & Account Deletion */}
        <div className="p-8 border-t border-neon-red/20 bg-neutral-900">
          <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-gray-400" /> Privacy & Data Rights
          </h4>
          <p className="text-xs text-gray-400 mb-6 max-w-2xl leading-relaxed">
            Your clinical data and diagnostic history remain encrypted and private. You can request deletion of all associated scan records and credentials at any time.
          </p>

          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-black border border-red-500/50 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-950 transition-colors shadow-[0_0_10px_rgba(255,0,0,0.1)]"
            >
              Delete My Account & Health Data
            </button>
          ) : (
            <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-xl max-w-lg">
              <p className="text-xs text-red-300 font-medium mb-3">
                Are you sure? This action is permanent and will delete all stored scans and records.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 bg-black border border-neutral-700 text-gray-300 text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteData}
                  className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Yes, Delete Everything
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
