"use client";

import { db, auth } from "./firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";

export interface VaultUser {
  id: string;
  displayName: string;
  email: string;
  healthId: string;
  phoneNumber: string;
  bloodGroup: string;
  role: "patient" | "doctor";
  isVerified: boolean;
  age?: number;
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

const STORAGE_KEY_USER = "vitallens_active_user";
const STORAGE_KEY_EMERGENCY = "healththread_emergency_profile";
const STORAGE_KEY_TIMELINE = "healththread_timeline_events";
const STORAGE_KEY_CONSENTS = "healththread_consents";

// Initial seed data used ONLY if database & localStorage are completely empty
const INITIAL_EMERGENCY_SEED: EmergencyMedicalProfile = {
  bloodGroup: "B+ Positive",
  knownAllergies: "Penicillin",
  currentMedications: "Amlodipine 5mg — once daily",
  chronicConditions: "Hypertension",
  previousSurgeries: "Appendectomy (2005)",
  emergencyContact: "Anita Kumar (Spouse) · +91 98111 22334"
};

const INITIAL_TIMELINE_SEED: ClinicalTimelineItem[] = [
  {
    id: "tl-2024",
    year: "2024",
    date: "12 Mar 2024",
    category: "Lab Reports",
    title: "Echocardiogram & Lipid Panel",
    provider: "Dr. Rajesh Sharma · Apollo Hospitals",
    notes: "Resting LVEF 60%, normal chamber dimensions. Fasting cholesterol 195 mg/dL within acceptable range.",
    status: "Verified",
    iconType: "report"
  },
  {
    id: "tl-2023",
    year: "2023",
    date: "04 Aug 2023",
    category: "Prescriptions",
    title: "Hypertension Diagnosis",
    provider: "Apollo Hospitals · Amlodipine 5mg prescribed",
    notes: "Patient advised low-sodium diet and daily BP monitoring.",
    status: "Verified",
    iconType: "pill"
  },
  {
    id: "tl-2021",
    year: "2021",
    date: "15 Jul 2021",
    category: "Vaccinations",
    title: "COVID-19 Covishield — Dose 1 & 2",
    provider: "Cowin Vaccination Center",
    notes: "Certificate verified via ABDM / Cowin digital health registry.",
    status: "Verified",
    iconType: "syringe"
  },
  {
    id: "tl-2018",
    year: "2018",
    date: "10 Oct 2018",
    category: "Lab Reports",
    title: "Annual Comprehensive Metabolic Panel",
    provider: "Thyrocare Labs",
    notes: "Liver and kidney function panels normal. HbA1c 5.4%.",
    status: "Verified",
    iconType: "lab"
  },
  {
    id: "tl-2012",
    year: "2012",
    date: "22 Jan 2012",
    category: "Prescriptions",
    title: "Acute Bronchitis — Prescription",
    provider: "Apollo Clinic",
    notes: "Azithromycin 500mg, Levocetirizine 5mg course for 5 days. Resolved.",
    status: "Patient Uploaded",
    iconType: "pill"
  },
  {
    id: "tl-2005",
    year: "2005",
    date: "18 Nov 2005",
    category: "Surgeries",
    title: "Appendectomy Surgery",
    provider: "Manipal Hospital",
    notes: "Laparoscopic uncomplicated appendectomy. Complete recovery without surgical sequelae.",
    status: "Verified",
    iconType: "surgery"
  }
];

const INITIAL_CONSENTS_SEED: ConsentAuthorization[] = [
  {
    id: "c-1",
    requester: "Apollo Hospitals, Sarita Vihar",
    type: "Hospital Multi-specialty Desk",
    scope: ["Lifelong Timeline", "Prescriptions", "Lab Reports"],
    validUntil: "31 Dec 2026",
    status: "ACTIVE",
    lastAccessed: "Yesterday at 14:22"
  },
  {
    id: "c-2",
    requester: "Dr. Rajesh Sharma (Cardiology)",
    type: "Registered ABDM Practitioner",
    scope: ["Echocardiogram", "Lipid Panel", "Emergency Profile"],
    validUntil: "15 Jun 2026",
    status: "ACTIVE",
    lastAccessed: "12 Mar 2024 at 10:15"
  },
  {
    id: "c-3",
    requester: "Thyrocare Technologies Ltd",
    type: "Diagnostic Lab Provider",
    scope: ["Direct Lab Report Auto-Sync"],
    validUntil: "Unlimited (Perpetual Sync)",
    status: "ACTIVE",
    lastAccessed: "10 Oct 2018"
  },
  {
    id: "c-4",
    requester: "Fortis Escorts Heart Institute",
    type: "Trauma & Clinical Research Center",
    scope: ["Cardiac Diagnostics", "Allergy History"],
    validUntil: "Pending Your Approval",
    status: "PENDING"
  }
];

/**
 * USER SESSION MANAGEMENT
 */
export function getActiveUser(): VaultUser {
  if (typeof window === "undefined") {
    return {
      id: "aradhya_tripathi",
      displayName: "Aradhya Tripathi",
      email: "aradhya.tripathi@healthvault.in",
      healthId: "HT-2026-88231",
      phoneNumber: "+91 98765 43210",
      bloodGroup: "B+",
      role: "patient",
      isVerified: true
    };
  }

  const stored = localStorage.getItem(STORAGE_KEY_USER);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }

  const defaultUser: VaultUser = {
    id: "aradhya_tripathi",
    displayName: "Aradhya Tripathi",
    email: "aradhya.tripathi@healthvault.in",
    healthId: "HT-2026-88231",
    phoneNumber: "+91 98765 43210",
    bloodGroup: "B+",
    role: "patient",
    isVerified: true
  };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultUser));
  return defaultUser;
}

export async function setActiveUser(user: VaultUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    window.dispatchEvent(new Event("vitallens_user_updated"));
  }

  // Also sync to Firestore users collection
  try {
    if (db && user.id) {
      const userRef = doc(db, "users", user.id);
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        healthId: user.healthId,
        phoneNumber: user.phoneNumber,
        bloodGroup: user.bloodGroup,
        role: user.role,
        lastActive: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    console.warn("Firestore user sync fallback to local storage:", err);
  }
}

/**
 * EMERGENCY PROFILE MANAGEMENT
 */
export async function getEmergencyProfile(userId?: string): Promise<EmergencyMedicalProfile> {
  const uid = userId || getActiveUser().id;

  // 1. Try Firestore
  try {
    if (db && uid) {
      const ref = doc(db, "users", uid, "vault", "emergency_profile");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as EmergencyMedicalProfile;
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_EMERGENCY, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (err) {
    console.warn("Firestore emergency profile fetch fallback to local:", err);
  }

  // 2. Try localStorage
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY_EMERGENCY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
  }

  return INITIAL_EMERGENCY_SEED;
}

export async function saveEmergencyProfile(profile: EmergencyMedicalProfile, userId?: string) {
  const uid = userId || getActiveUser().id;
  const profileWithDate = {
    ...profile,
    updatedAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_EMERGENCY, JSON.stringify(profileWithDate));
    window.dispatchEvent(new Event("healththread_profile_updated"));
  }

  try {
    if (db && uid) {
      const ref = doc(db, "users", uid, "vault", "emergency_profile");
      await setDoc(ref, profileWithDate, { merge: true });
    }
  } catch (err) {
    console.warn("Firestore emergency profile save fallback to local:", err);
  }
}

/**
 * CLINICAL TIMELINE MANAGEMENT
 */
export async function getTimelineEvents(userId?: string): Promise<ClinicalTimelineItem[]> {
  const uid = userId || getActiveUser().id;

  // 1. Try Firestore
  try {
    if (db && uid) {
      const colRef = collection(db, "users", uid, "timeline");
      const q = query(colRef, orderBy("year", "desc"));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ClinicalTimelineItem[];
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(items));
        }
        return items;
      }
    }
  } catch (err) {
    console.warn("Firestore timeline fetch fallback to local:", err);
  }

  // 2. Try localStorage
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY_TIMELINE);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
  }

  // Fallback to initial seed
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(INITIAL_TIMELINE_SEED));
  }
  return INITIAL_TIMELINE_SEED;
}

export async function addTimelineEvent(item: Omit<ClinicalTimelineItem, "id">, userId?: string): Promise<ClinicalTimelineItem> {
  const uid = userId || getActiveUser().id;
  const newId = "tl-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
  const fullItem: ClinicalTimelineItem = {
    ...item,
    id: newId,
    createdAt: new Date().toISOString()
  };

  // Update localStorage
  if (typeof window !== "undefined") {
    const existing = await getTimelineEvents(uid);
    const updated = [fullItem, ...existing];
    localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(updated));
    window.dispatchEvent(new Event("healththread_timeline_updated"));
  }

  // Save to Firestore
  try {
    if (db && uid) {
      const ref = doc(db, "users", uid, "timeline", newId);
      await setDoc(ref, fullItem);
    }
  } catch (err) {
    console.warn("Firestore timeline add fallback to local:", err);
  }

  return fullItem;
}

export async function deleteTimelineEvent(id: string, userId?: string) {
  const uid = userId || getActiveUser().id;

  if (typeof window !== "undefined") {
    const existing = await getTimelineEvents(uid);
    const updated = existing.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(updated));
    window.dispatchEvent(new Event("healththread_timeline_updated"));
  }

  try {
    if (db && uid) {
      const ref = doc(db, "users", uid, "timeline", id);
      await deleteDoc(ref);
    }
  } catch (err) {
    console.warn("Firestore timeline delete fallback to local:", err);
  }
}

/**
 * CONSENT MANAGEMENT
 */
export async function getConsents(userId?: string): Promise<ConsentAuthorization[]> {
  const uid = userId || getActiveUser().id;

  try {
    if (db && uid) {
      const colRef = collection(db, "users", uid, "consents");
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ConsentAuthorization[];
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_CONSENTS, JSON.stringify(items));
        }
        return items;
      }
    }
  } catch (err) {
    console.warn("Firestore consents fetch fallback to local:", err);
  }

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY_CONSENTS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    localStorage.setItem(STORAGE_KEY_CONSENTS, JSON.stringify(INITIAL_CONSENTS_SEED));
  }

  return INITIAL_CONSENTS_SEED;
}

export async function updateConsentStatus(id: string, status: ConsentAuthorization["status"], validUntil?: string, userId?: string) {
  const uid = userId || getActiveUser().id;

  if (typeof window !== "undefined") {
    const existing = await getConsents(uid);
    const updated = existing.map(c => c.id === id ? { 
      ...c, 
      status, 
      ...(validUntil ? { validUntil } : {}) 
    } : c);
    localStorage.setItem(STORAGE_KEY_CONSENTS, JSON.stringify(updated));
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
    console.warn("Firestore consent update fallback to local:", err);
  }
}
