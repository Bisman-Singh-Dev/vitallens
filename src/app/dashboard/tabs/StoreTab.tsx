"use client";

import { Check, ShieldCheck, Zap, Activity } from "lucide-react";
import { useState } from "react";

export default function StoreTab() {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const handlePurchase = () => {
    setIsPurchasing(true);
    // Mock purchase flow delay
    setTimeout(() => {
      setIsPurchasing(false);
      setPurchased(true);
    }, 1500);
  };

  if (purchased) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-neutral-900 rounded-3xl border border-neon-red/30 shadow-[0_0_15px_rgba(255,51,102,0.1)] px-6">
        <div className="w-20 h-20 bg-black border border-green-500/50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Order Confirmed!</h2>
        <p className="text-gray-400 max-w-md mb-8">
          Your RoboDoc Band is on its way. Once it arrives, follow the pairing instructions in the "My Health" tab to connect it to your home WiFi.
        </p>
        <button 
          onClick={() => setPurchased(false)}
          className="text-neon-red font-medium hover:text-white transition-colors"
        >
          &larr; Back to Store
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Wearables Store</h2>
        <p className="text-sm text-gray-400 mt-1">Upgrade your diagnostic tracking with dedicated hardware</p>
      </div>

      <div className="bg-neutral-900 rounded-3xl border border-neon-red/30 shadow-[0_0_15px_rgba(255,51,102,0.1)] overflow-hidden flex flex-col md:flex-row">
        
        {/* Product Image / Hero */}
        <div className="md:w-1/2 bg-black/50 p-8 flex items-center justify-center relative">
          <div className="w-full h-64 bg-black border border-neon-red/20 rounded-2xl flex flex-col items-center justify-center text-gray-400 relative overflow-hidden shadow-[inset_0_0_20px_rgba(255,51,102,0.1)]">
            <Activity className="w-16 h-16 mb-4 opacity-50 text-neon-red" />
            <span className="font-medium text-sm text-neon-red/70">RoboDoc Band Hardware</span>
            
            {/* Mock Band Visual */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-12 bg-neutral-900 rounded-full shadow-[0_0_15px_rgba(255,51,102,0.2)] border-2 border-neon-red/50 flex items-center justify-center opacity-90">
               <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                 <div className="w-4 h-4 bg-neon-red rounded-full animate-pulse blur-[2px]"></div>
               </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          <div className="inline-block px-3 py-1 bg-neon-red/20 border border-neon-red/50 text-neon-red text-xs font-bold uppercase tracking-wider rounded-md mb-4 w-max shadow-[0_0_10px_rgba(255,51,102,0.2)]">
            New Arrival
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">RoboDoc Band Pro</h3>
          <p className="text-2xl text-gray-400 font-light mb-6">$129.00</p>
          
          <p className="text-gray-300 mb-8 leading-relaxed">
            Continuous health monitoring right from your wrist. Syncs directly to your RoboDoc dashboard over WiFi, providing real-time insights to complement your eye-based diagnostic scans.
          </p>

          <ul className="space-y-4 mb-10">
            <li className="flex items-center gap-3 text-sm text-gray-300 font-medium">
              <ShieldCheck className="w-5 h-5 text-neon-red" /> Continuous Heart Rate & SpO2
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-300 font-medium">
              <Zap className="w-5 h-5 text-neon-red" /> Direct WiFi Sync (No phone required)
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-300 font-medium">
              <Activity className="w-5 h-5 text-neon-red" /> Advanced Sleep Stage Tracking
            </li>
          </ul>

          <button 
            onClick={handlePurchase}
            disabled={isPurchasing}
            className="w-full py-4 bg-neon-red text-white rounded-xl font-bold shadow-[0_0_20px_rgba(255,51,102,0.4)] hover:bg-neon-red/80 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {isPurchasing ? "Processing..." : "Order Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
