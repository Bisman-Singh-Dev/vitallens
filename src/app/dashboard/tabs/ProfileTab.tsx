"use client";

import { useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { signOut, deleteUser, reauthenticateWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Save, LogOut, Trash2, User, Phone, Cigarette, ShieldAlert } from "lucide-react";

export default function ProfileTab({ user }: { user: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    age: user.age || "",
    smokingStatus: user.smokingStatus || "",
    phoneNumber: user.phoneNumber || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.id), {
        age: parseInt(formData.age),
        smokingStatus: formData.smokingStatus,
        phoneNumber: formData.phoneNumber
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };


  const handleDeleteData = async () => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "users", user.id));
      // Note: A real app should trigger a Cloud Function to recursively delete subcollections (scans, reminders)
      // and delete files from Firebase Storage.

      // Delete Auth User
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
      
      router.push("/");
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        try {
          if (auth.currentUser) {
            await reauthenticateWithPopup(auth.currentUser, googleProvider);
            // Retry deletion
            await deleteDoc(doc(db, "users", user.id));
            await deleteUser(auth.currentUser);
            router.push("/");
          }
        } catch (reAuthErr) {
          console.error("Re-authentication failed", reAuthErr);
          alert("Could not re-authenticate. Please log out and log back in to delete your account.");
        }
      } else {
        console.error("Failed to delete account", err);
        alert("Failed to delete account. You may need to log in again to perform this sensitive action.");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Profile & Settings</h2>
        <p className="text-sm text-gray-400 mt-1">Manage your personal data and account settings</p>
      </div>

      <div className="bg-neutral-900 rounded-3xl border border-neon-red/30 shadow-[0_0_15px_rgba(255,51,102,0.1)] overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-neon-red/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-black border border-neon-red/50 flex items-center justify-center text-neon-red font-bold text-xl shadow-[0_0_10px_rgba(255,51,102,0.2)]">
              {user.displayName ? user.displayName.charAt(0) : "U"}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{user.displayName || "User"}</h3>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 space-y-6 bg-black/50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-white">Personal Information</h4>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-sm font-medium text-neon-red hover:text-neon-red/80 transition-colors"
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
                  className="text-sm font-medium text-neon-red hover:text-neon-red/80 flex items-center gap-1 transition-colors"
                >
                  <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                <User className="w-4 h-4 text-neon-red/70" /> Age
              </label>
              <input 
                type="number" 
                disabled={!isEditing}
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl focus:border-neon-red outline-none text-white transition-colors disabled:opacity-50 disabled:bg-neutral-900"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                <Cigarette className="w-4 h-4 text-neon-red/70" /> Smoking Status
              </label>
              <select 
                disabled={!isEditing}
                value={formData.smokingStatus}
                onChange={e => setFormData({...formData, smokingStatus: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl focus:border-neon-red outline-none text-white transition-colors appearance-none disabled:opacity-50 disabled:bg-neutral-900"
              >
                <option value="Never smoked">Never smoked</option>
                <option value="Former smoker">Former smoker</option>
                <option value="Current smoker (occasional)">Current smoker (occasional)</option>
                <option value="Current smoker (daily)">Current smoker (daily)</option>
                <option value="Underage">Underage</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4 text-neon-red/70" /> Phone Number (For SMS Reminders)
              </label>
              <input 
                type="tel" 
                disabled={!isEditing}
                value={formData.phoneNumber}
                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                placeholder="+1234567890"
                className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl focus:border-neon-red outline-none text-white transition-colors disabled:opacity-50 disabled:bg-neutral-900"
              />
              <p className="text-xs text-gray-500 mt-2">Required format: +[country code][number]. Example: +14155552671</p>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="p-8 border-t border-neon-red/20 bg-neutral-900">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-gray-400" /> Privacy & Data
          </h4>
          <p className="text-sm text-gray-400 mb-6 max-w-2xl leading-relaxed">
            Your health data is sensitive. We encrypt your information and store it securely. You consented to our data processing on {new Date(user.consent?.acceptedAt).toLocaleDateString()}. You have the right to request full deletion of your account and associated health data at any time.
          </p>

          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-black border border-red-500/50 text-red-500 text-sm font-medium rounded-lg hover:bg-red-950 transition-colors shadow-[0_0_10px_rgba(255,0,0,0.1)]"
            >
              Delete My Data & Account
            </button>
          ) : (
            <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-xl">
              <p className="text-sm text-red-400 font-medium mb-3">
                Are you sure? This action is permanent and will delete all your scans, reminders, and profile data.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-black border border-neutral-700 text-gray-300 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteData}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                >
                  <Trash2 className="w-4 h-4" /> Yes, Delete Everything
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
