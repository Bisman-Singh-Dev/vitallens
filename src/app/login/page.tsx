"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [customName, setCustomName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "signup") {
        setIsSignup(true);
      }
    }
  }, []);

  const handleGoogleSignIn = async () => {
    if (isSignup && !customName.trim()) {
      setError("Please enter your name before proceeding.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // First time sign in, create document
        await setDoc(userDocRef, {
          email: user.email,
          displayName: isSignup ? customName.trim() : user.displayName,
          photoURL: user.photoURL,
          onboardingComplete: false,
          createdAt: new Date().toISOString(),
          consent: {
            acceptedAt: new Date().toISOString(),
            version: "1.0"
          }
        });
        router.push("/onboarding");
      } else {
        const data = userDoc.data();
        if (data.onboardingComplete) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-black px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-red/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-neutral-900 p-8 rounded-3xl shadow-[0_0_30px_rgba(255,51,102,0.15)] border border-neon-red/30 text-center relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-black border border-neon-red rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,51,102,0.5)]">
            <Stethoscope className="w-8 h-8 text-neon-red" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">Welcome to RoboDoc</h2>
        <p className="text-gray-400 mb-8">Sign in to access your AI health insights and personalized plans.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-500/50 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isSignup && (
          <div className="mb-6 text-left">
            <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-neon-red/30 focus:border-neon-red rounded-xl outline-none text-white transition-colors"
            />
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-black border border-neon-red text-white font-medium py-3 px-4 rounded-xl hover:bg-neon-red/10 transition-colors shadow-[0_0_15px_rgba(255,51,102,0.2)] disabled:opacity-50"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-neon-red border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <p className="mt-8 text-xs text-gray-500">
          By signing in, you agree to our <Link href="/terms" className="text-neon-red hover:underline">Terms of Service</Link> and acknowledge the <Link href="/privacy" className="text-neon-red hover:underline">Privacy Policy</Link>. This is an AI wellness tool, not a medical device.
        </p>
      </motion.div>
    </main>
  );
}
