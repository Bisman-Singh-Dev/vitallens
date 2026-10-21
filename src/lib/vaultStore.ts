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
  orderBy 
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

// ACCOUNT-SPECIFIC DEFAULT INITIAL SEEDS (Used only on first login before user customizes)
const SEED_PROFILES: Record<string, EmergencyMedicalProfile> = {
  aradhya_tripathi: {
    bloodGroup: "B+ Positive",
    knownAllergies: "Penicillin",
    currentMedications: "Amlodipine 5mg — once daily",
    chronicConditions: "Hypertension",
    previousSurgeries: "Appendectomy (2005)",
    emergencyContact: "Anita Kumar (Spouse) · +91 98111 22334"
  },
  shashank_kumar: {
    bloodGroup: "O+ Positive",
    knownAllergies: "Sulfa Antibiotics",
    currentMedications: "Metformin 500mg — twice daily",
    chronicConditions: "Type 2 Diabetes",
    previousSurgeries: "Knee Arthroscopy (2019)",
    emergencyContact: "Ritu Kumar (Mother) · +91 98222 55667"
  },
  dr_rajesh_sharma: {
    bloodGroup: "A+ Positive",
    knownAllergies: "None reported",
    currentMedications: "Cardio-Protective Aspirin 75mg",
    chronicConditions: "Mild Hyperlipidemia",
    previousSurgeries: "None",
    emergencyContact: "Hospital Admin Desk · +91 11 2692 5858"
  }
};

const SEED_TIMELINES: Record<string, ClinicalTimelineItem[]> = {
  aradhya_tripathi: [
    {
      id: "tl-ara-1",
      year: "2024",
      date: "12 Mar 2024",
      category: "Lab Reports",
      title: "Echocardiogram & Lipid Panel",
      provider: "Dr. Rajesh Sharma · Apollo Hospitals",
      notes: "Resting LVEF 60%, normal chamber dimensions. Fasting cholesterol 195 mg/dL.",
      status: "Verified",
      iconType: "report"
    },
    {
      id: "tl-ara-2",
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
      id: "tl-ara-3",
      year: "2021",
      date: "15 Jul 2021",
      category: "Vaccinations",
      title: "COVID-19 Covishield — Dose 1 & 2",
      provider: "Cowin Vaccination Center",
      notes: "Certificate verified via ABDM registry.",
      status: "Verified",
      iconType: "syringe"
    },
    {
      id: "tl-ara-4",
      year: "2005",
      date: "18 Nov 2005",
      category: "Surgeries",
      title: "Appendectomy Surgery",
      provider: "Manipal Hospital",
      notes: "Laparoscopic uncomplicated appendectomy.",
      status: "Verified",
      iconType: "surgery"
    }
  ],
  shashank_kumar: [
    {
      id: "tl-sha-1",
      year: "2024",
      date: "08 Jan 2024",
      category: "Lab Reports",
      title: "Glycated Hemoglobin (HbA1c) Panel",
      provider: "Max Super Speciality · Dr. Kapoor",
      notes: "HbA1c 6.8% (Fair Glycemic Control). Serum Creatinine 0.9 mg/dL.",
      status: "Verified",
      iconType: "lab"
    },
    {
      id: "tl-sha-2",
      year: "2022",
      date: "19 Sep 2022",
      category: "Prescriptions",
      title: "Metformin 500mg Extended Release",
      provider: "Max Healthcare Pharmacy",
      notes: "Take 1 tablet twice daily with meals.",
      status: "Verified",
      iconType: "pill"
    },
    {
      id: "tl-sha-3",
      year: "2021",
      date: "22 Aug 2021",
      category: "Vaccinations",
      title: "Covaxin BBV152 — Booster Dose",
      provider: "Government Dispensary South Delhi",
      notes: "Lot #BBV-9941. No adverse events.",
      status: "Verified",
      iconType: "syringe"
    },
    {
      id: "tl-sha-4",
      year: "2019",
      date: "05 Jun 2019",
      category: "Surgeries",
      title: "Right Knee Meniscus Arthroscopy",
      provider: "Fortis Memorial Research Institute",
      notes: "Partial meniscectomy. Full mobility restored post-physio.",
      status: "Verified",
      iconType: "surgery"
    }
  ],
  dr_rajesh_sharma: [
    {
      id: "tl-doc-1",
      year: "2024",
      date: "02 Feb 2024",
      category: "Hospital Visits",
      title: "Annual Staff Health Clearance & ECG",
      provider: "Apollo Hospitals Occupational Health",
      notes: "Normal sinus rhythm, resting HR 68 bpm. Cleared for interventional cath lab duties.",
      status: "Verified",
      iconType: "report"
    }
  ]
};

const SEED_CONSENTS: Record<string, ConsentAuthorization[]> = {
  aradhya_tripathi: [
    {
      id: "c-ara-1",
      requester: "Apollo Hospitals, Sarita Vihar",
      type: "Hospital Multi-specialty Desk",
      scope: ["Lifelong Timeline", "Prescriptions", "Lab Reports"],
      validUntil: "31 Dec 2026",
      status: "ACTIVE",
      lastAccessed: "Yesterday at 14:22"
    },
    {
      id: "c-ara-2",
      requester: "Dr. Rajesh Sharma (Cardiology)",
      type: "Registered ABDM Practitioner",
      scope: ["Echocardiogram", "Lipid Panel", "Emergency Profile"],
      validUntil: "15 Jun 2026",
      status: "ACTIVE",
      lastAccessed: "12 Mar 2024 at 10:15"
    }
  ],
  shashank_kumar: [
    {
      id: "c-sha-1",
      requester: "Max Super Speciality Hospital, Saket",
      type: "Endocrinology Department",
      scope: ["Blood Glucose Logs", "HbA1c Lab Reports"],
      validUntil: "30 Sep 2026",
      status: "ACTIVE",
      lastAccessed: "08 Jan 2024 at 11:30"
    },
    {
      id: "c-sha-2",
      requester: "Fortis Escorts Heart Institute",
      type: "Preventive Care Unit",
      scope: ["Allergy History", "Surgeries"],
      validUntil: "Pending Approval",
      status: "PENDING"
    }
  ]
};

/**
 * 1. ACTIVE USER IDENTITY & SESSION MANAGEMENT
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

  const stored = localStorage.getItem("vitallens_active_user");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.id) return parsed;
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
  localStorage.setItem("vitallens_active_user", JSON.stringify(defaultUser));
  return defaultUser;
}

export async function setActiveUser(user: VaultUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem("vitallens_active_user", JSON.stringify(user));
    window.dispatchEvent(new Event("vitallens_user_updated"));
  }

  // Persist directly to Firebase Firestore users collection
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
    console.warn("Firestore user sync error:", err);
  }
}

const withTimeout = <T>(promise: Promise<T>, timeoutMs = 1200): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), timeoutMs))
  ]);
};

/**
 * 2. ACCOUNT-SPECIFIC EMERGENCY PROFILE (Stored by userId)
 */
export async function getEmergencyProfile(userId?: string): Promise<EmergencyMedicalProfile> {
  const uid = userId || getActiveUser().id;
  const storageKey = `vault_emergency_${uid}`;

  // 1. Check local storage first for instant response
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
  }

  // 2. Fetch from Firestore with timeout
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
  } catch (err) {
    // Graceful fallback to local storage / seed
  }

  // 3. Fallback to seed for known demo accounts or blank for new users
  const defaultProfile = SEED_PROFILES[uid] || {
    bloodGroup: "Not specified",
    knownAllergies: "None known",
    currentMedications: "None",
    chronicConditions: "None",
    previousSurgeries: "None",
    emergencyContact: "Not provided"
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(defaultProfile));
  }

  return defaultProfile;
}

export async function saveEmergencyProfile(profile: EmergencyMedicalProfile, userId?: string) {
  const uid = userId || getActiveUser().id;
  const storageKey = `vault_emergency_${uid}`;
  const profileWithDate = {
    ...profile,
    updatedAt: new Date().toISOString()
  };

  // 1. Update localStorage immediately for instant UI responsiveness
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(profileWithDate));
    window.dispatchEvent(new Event("healththread_profile_updated"));
  }

  // 2. Persist to Firebase Firestore
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
 * 3. ACCOUNT-SPECIFIC CLINICAL TIMELINE (Stored by userId)
 */
export async function getTimelineEvents(userId?: string): Promise<ClinicalTimelineItem[]> {
  const uid = userId || getActiveUser().id;
  const storageKey = `vault_timeline_${uid}`;

  // 1. Fetch from Local Storage for THIS user first for instant load
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Asynchronously sync with Firestore in background without blocking
          if (db && uid) {
            const colRef = collection(db, "users", uid, "timeline");
            const q = query(colRef, orderBy("year", "desc"));
            withTimeout(getDocs(q), 1200).then(snap => {
              if (!snap.empty) {
                const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ClinicalTimelineItem[];
                localStorage.setItem(storageKey, JSON.stringify(items));
              }
            }).catch(() => {});
          }
          return parsed;
        }
      } catch (e) {}
    }
  }

  // 2. Fetch from Firestore if no local cache
  try {
    if (db && uid) {
      const colRef = collection(db, "users", uid, "timeline");
      const q = query(colRef, orderBy("year", "desc"));
      const snap = await withTimeout(getDocs(q), 1200);
      if (!snap.empty) {
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ClinicalTimelineItem[];
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(items));
        }
        return items;
      }
    }
  } catch (err) {
    // Fallback to seed
  }

  // 3. Fallback to seed for known demo accounts or empty list for new users
  const defaultItems = SEED_TIMELINES[uid] || [];
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(defaultItems));
  }
  return defaultItems;
}

export async function addTimelineEvent(item: Omit<ClinicalTimelineItem, "id">, userId?: string): Promise<ClinicalTimelineItem> {
  const uid = userId || getActiveUser().id;
  const storageKey = `vault_timeline_${uid}`;
  const newId = "tl-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
  const fullItem: ClinicalTimelineItem = {
    ...item,
    id: newId,
    createdAt: new Date().toISOString()
  };

  // 1. Update localStorage
  if (typeof window !== "undefined") {
    const existing = await getTimelineEvents(uid);
    const updated = [fullItem, ...existing];
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new Event("healththread_timeline_updated"));
  }

  // 2. Persist to Firestore
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
  const uid = userId || getActiveUser().id;
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
 * 4. ACCOUNT-SPECIFIC CONSENTS (Stored by userId)
 */
export async function getConsents(userId?: string): Promise<ConsentAuthorization[]> {
  const uid = userId || getActiveUser().id;
  const storageKey = `vault_consents_${uid}`;

  // 1. Fetch from Local Storage for THIS user first
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Asynchronously sync with Firestore in background without blocking
          if (db && uid) {
            const colRef = collection(db, "users", uid, "consents");
            withTimeout(getDocs(colRef), 1200).then(snap => {
              if (!snap.empty) {
                const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ConsentAuthorization[];
                localStorage.setItem(storageKey, JSON.stringify(items));
              }
            }).catch(() => {});
          }
          return parsed;
        }
      } catch (e) {}
    }
  }

  // 2. Fetch from Firestore if no local cache
  try {
    if (db && uid) {
      const colRef = collection(db, "users", uid, "consents");
      const snap = await withTimeout(getDocs(colRef), 1200);
      if (!snap.empty) {
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ConsentAuthorization[];
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(items));
        }
        return items;
      }
    }
  } catch (err) {
    // Fallback to seed
  }

  const defaultConsents = SEED_CONSENTS[uid] || [];
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(defaultConsents));
  }
  return defaultConsents;
}

export async function updateConsentStatus(id: string, status: ConsentAuthorization["status"], validUntil?: string, userId?: string) {
  const uid = userId || getActiveUser().id;
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
