"use client";

import { db, auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";

export interface VaultUser {
  id: string;
  displayName: string;
  email: string;
  healthId: string; // e.g. "HT-GLOBAL-48291"
  phoneNumber?: string;
  bloodGroup: string;
  role: "patient" | "doctor";
  isVerified: boolean;
  photoURL?: string;
  organization?: string;
  licenseNumber?: string;
}

export interface EmergencyMedicalProfile {
  bloodGroup: string;
  knownAllergies: string;
  currentMedications: string;
  chronicConditions: string;
  previousSurgeries: string;
  emergencyContact: string;
  updatedAt?: string;
}

export interface ClinicalTimelineItem {
  id: string;
  year: string;
  date: string;
  category: "Vaccinations" | "Prescriptions" | "Lab Reports" | "Surgeries" | "Hospital Visits";
  title: string;
  provider: string;
  notes?: string;
  status: "Verified" | "Patient Uploaded";
  iconType: "report" | "pill" | "syringe" | "lab" | "surgery" | "hospital";
  createdAt?: string;
}

export interface ConsentAuthorization {
  id: string;
  requester: string;
  type: string;
  scope: string[];
  validUntil: string;
  status: "ACTIVE" | "PENDING" | "REVOKED";
  lastAccessed?: string;
}

/**
 * Helper to ensure Firestore calls never hang UI
 */
const withTimeout = <T>(promise: Promise<T>, timeoutMs = 1200): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), timeoutMs))
  ]);
};

/**
 * 1. REAL GOOGLE SIGN-IN VIA FIREBASE
 * Automatically creates a clean, fresh, un-hardcoded international account
 */
export async function signInWithGoogleAuth(role: "patient" | "doctor" = "patient"): Promise<VaultUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  const cleanName = fbUser.displayName || (role === "doctor" ? "Physician Member" : "Health Member");
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const globalHealthId = `HT-GLOBAL-${randomSuffix}`;

  // Check if existing user in Firestore
  let existingUser: VaultUser | null = null;
  try {
    if (db) {
      const userDoc = await withTimeout(getDoc(doc(db, "users", fbUser.uid)), 1500);
      if (userDoc.exists()) {
        existingUser = userDoc.data() as VaultUser;
      }
    }
  } catch (e) {}

  const activeUser: VaultUser = existingUser || {
    id: fbUser.uid,
    displayName: cleanName,
    email: fbUser.email || `${fbUser.uid}@healththread.io`,
    healthId: globalHealthId,
    phoneNumber: fbUser.phoneNumber || undefined,
    bloodGroup: "Not specified",
    role: role,
    isVerified: true,
    photoURL: fbUser.photoURL || undefined
  };

  await setActiveUser(activeUser);
  return activeUser;
}

/**
 * 2. QUICK FRESH ACCOUNT ENTRY (NO OTP, NO EKYC, NO HARDCODING)
 */
export async function createFreshAccount(
  name: string, 
  email: string, 
  role: "patient" | "doctor" = "patient",
  organization?: string
): Promise<VaultUser> {
  const cleanName = name.trim() || (role === "doctor" ? "Dr. Health Specialist" : "New Member");
  const cleanId = "usr_" + cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20) + "_" + Math.floor(1000 + Math.random() * 9000);
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);

  const newUser: VaultUser = {
    id: cleanId,
    displayName: cleanName,
    email: email.trim() || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}@healththread.io`,
    healthId: `HT-GLOBAL-${randomSuffix}`,
    bloodGroup: "Not specified",
    role: role,
    isVerified: true,
    organization: organization?.trim() || undefined
  };

  await setActiveUser(newUser);
  return newUser;
}

/**
 * 3. SESSION MANAGEMENT
 */
export function getActiveUser(): VaultUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem("vitallens_active_user");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.id) {
        // Discard any stale demo accounts from previous sessions
        if (
          parsed.displayName === "Shashank Kumar" || 
          parsed.displayName === "Aradhya Tripathi" ||
          parsed.id === "shashank_demo" ||
          parsed.id === "aradhya_demo"
        ) {
          localStorage.removeItem("vitallens_active_user");
          localStorage.removeItem("vitallens_emergency_profile");
          return null;
        }
        return parsed;
      }
    } catch (e) {}
  }

  return null;
}

export async function setActiveUser(user: VaultUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem("vitallens_active_user", JSON.stringify(user));
    window.dispatchEvent(new Event("vitallens_user_updated"));
  }

  // Persist directly to Firebase Firestore
  try {
    if (db && user.id) {
      const userRef = doc(db, "users", user.id);
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        healthId: user.healthId,
        bloodGroup: user.bloodGroup,
        role: user.role,
        isVerified: user.isVerified,
        photoURL: user.photoURL || null,
        organization: user.organization || null,
        lastActive: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    console.warn("Firestore user sync error:", err);
  }
}

export function clearActiveUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("vitallens_active_user");
    window.dispatchEvent(new Event("vitallens_user_updated"));
  }
  try {
    fbSignOut(auth);
  } catch(e) {}
}

/**
 * 4. EMERGENCY PROFILE (Stored by userId)
 * Fresh accounts start with clean, empty defaults
 */
export async function getEmergencyProfile(userId?: string): Promise<EmergencyMedicalProfile> {
  const active = getActiveUser();
  const uid = userId || active?.id;

  const defaultProfile: EmergencyMedicalProfile = {
    bloodGroup: active?.bloodGroup || "Not specified",
    knownAllergies: "None reported",
    currentMedications: "None",
    chronicConditions: "None",
    previousSurgeries: "None",
    emergencyContact: "Not provided"
  };

  if (!uid) return defaultProfile;

  const storageKey = `vault_emergency_${uid}`;

  // 1. Check local storage first
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
  }

  // 2. Fetch from Firestore
  try {
    if (db && uid) {
      const ref = doc(db, "users", uid, "vault", "emergency_profile");
      const snap = await withTimeout(getDoc(ref), 1200);
      if (snap.exists()) {
        const data = snap.data() as EmergencyMedicalProfile;
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (err) {}

  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(defaultProfile));
  }

  return defaultProfile;
}

export async function saveEmergencyProfile(profile: EmergencyMedicalProfile, userId?: string) {
  const uid = userId || getActiveUser()?.id;
  if (!uid) return;

  const storageKey = `vault_emergency_${uid}`;
  const profileWithDate = {
    ...profile,
    updatedAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(profileWithDate));
    window.dispatchEvent(new Event("healththread_profile_updated"));
  }

  try {
    if (db && uid) {
      const ref = doc(db, "users", uid, "vault", "emergency_profile");
      await setDoc(ref, profileWithDate, { merge: true });
    }
  } catch (err) {
    console.warn("Firestore emergency save error:", err);
  }
}

/**
 * 5. CLINICAL TIMELINE (Stored by userId)
 * Fresh accounts start with an empty list []
 */
export async function getTimelineEvents(userId?: string): Promise<ClinicalTimelineItem[]> {
  const uid = userId || getActiveUser()?.id;
  if (!uid) return [];

  const storageKey = `vault_timeline_${uid}`;

  // 1. Check local storage first
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Sync with Firestore in background
          if (db && uid) {
            const colRef = collection(db, "users", uid, "timeline");
            const q = query(colRef, orderBy("year", "desc"));
            withTimeout(getDocs(q), 1200).then(snap => {
              if (!snap.empty) {
                const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as ClinicalTimelineItem[];
                localStorage.setItem(storageKey, JSON.stringify(items));
              }
            }).catch(() => {});
          }
          return parsed;
        }
      } catch (e) {}
    }
  }

  // 2. Fetch from Firestore
  try {
    if (db && uid) {
      const colRef = collection(db, "users", uid, "timeline");
      const q = query(colRef, orderBy("year", "desc"));
      const snap = await withTimeout(getDocs(q), 1200);
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as ClinicalTimelineItem[];
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(items));
        }
        return items;
      }
    }
  } catch (err) {}

  return [];
}

export async function addTimelineEvent(item: Omit<ClinicalTimelineItem, "id">, userId?: string): Promise<ClinicalTimelineItem> {
  const uid = userId || getActiveUser()?.id;
  if (!uid) throw new Error("No active user session");

  const storageKey = `vault_timeline_${uid}`;
  const newId = "tl-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
  const fullItem: ClinicalTimelineItem = {
    ...item,
    id: newId,
    createdAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    const existing = await getTimelineEvents(uid);
    const updated = [fullItem, ...existing];
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new Event("healththread_timeline_updated"));
  }

  try {
    if (db && uid) {
      const ref = doc(db, "users", uid, "timeline", newId);
      await setDoc(ref, fullItem);
    }
  } catch (err) {
    console.warn("Firestore timeline add error:", err);
  }

  return fullItem;
}

export async function deleteTimelineEvent(id: string, userId?: string) {
  const uid = userId || getActiveUser()?.id;
  if (!uid) return;

  const storageKey = `vault_timeline_${uid}`;

  if (typeof window !== "undefined") {
    const existing = await getTimelineEvents(uid);
    const updated = existing.filter(e => e.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new Event("healththread_timeline_updated"));
  }

  try {
    if (db && uid) {
      const ref = doc(db, "users", uid, "timeline", id);
      await deleteDoc(ref);
    }
  } catch (err) {
    console.warn("Firestore timeline delete error:", err);
  }
}

/**
 * 6. INTERNATIONAL CONSENTS & SHARING (Stored by userId)
 */
export async function getConsents(userId?: string): Promise<ConsentAuthorization[]> {
  const uid = userId || getActiveUser()?.id;
  if (!uid) return [];

  const storageKey = `vault_consents_${uid}`;

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
  }

  try {
    if (db && uid) {
      const colRef = collection(db, "users", uid, "consents");
      const snap = await withTimeout(getDocs(colRef), 1200);
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as ConsentAuthorization[];
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(items));
        }
        return items;
      }
    }
  } catch (err) {}

  // Clean International Base Consent
  const defaultConsents: ConsentAuthorization[] = [
    {
      id: "c-global-cloud",
      requester: "HealthThread Global Vault Security (HIPAA & GDPR)",
      type: "Encrypted Cloud Storage",
      scope: ["Emergency Medical Profile", "Encrypted Vault Records"],
      validUntil: "Indefinite · Patient Revocable",
      status: "ACTIVE",
      lastAccessed: "Account Registration"
    }
  ];

  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(defaultConsents));
  }
  return defaultConsents;
}

export async function updateConsentStatus(id: string, status: ConsentAuthorization["status"], validUntil?: string, userId?: string) {
  const uid = userId || getActiveUser()?.id;
  if (!uid) return;

  const storageKey = `vault_consents_${uid}`;

  if (typeof window !== "undefined") {
    const existing = await getConsents(uid);
    const updated = existing.map(c => c.id === id ? { 
      ...c, 
      status, 
      ...(validUntil ? { validUntil } : {}) 
    } : c);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new Event("healththread_consents_updated"));
  }

  try {
    if (db && uid) {
      const ref = doc(db, "users", uid, "consents", id);
      await updateDoc(ref, { 
        status, 
        ...(validUntil ? { validUntil } : {}),
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn("Firestore consent update error:", err);
  }
}
