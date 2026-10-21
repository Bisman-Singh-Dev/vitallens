"use client";

import React from "react";

export function HealthThreadLogo({ 
  className = "w-9 h-9", 
  showText = true, 
  subtitle = "Patient Health Vault",
  textColor = "text-white",
  subtextColor = "text-sky-200/70"
}: { 
  className?: string; 
  showText?: boolean; 
  subtitle?: string;
  textColor?: string;
  subtextColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Tricolor Ring with EKG Pulse Icon */}
      <div className={`relative ${className} shrink-0 flex items-center justify-center`}>
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Ring gradient: Indian Saffron to Green */}
          <circle cx="22" cy="22" r="20" stroke="url(#ht_tricolor_grad)" strokeWidth="3" fill="#0b2c47" />
          
          {/* Inner pulse circle */}
          <circle cx="22" cy="22" r="16" fill="#0d3556" />

          {/* Heartbeat EKG Pulse Line */}
          <path 
            d="M9 22H14L17 14L21 29L24 18L27 24L29 22H35" 
            stroke="#38bdf8" 
            strokeWidth="2.4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <circle cx="21" cy="29" r="1.5" fill="#f97316" />
          <circle cx="17" cy="14" r="1.5" fill="#22c55e" />

          <defs>
            <linearGradient id="ht_tricolor_grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="leading-tight text-left">
          <div className={`text-base font-bold tracking-tight ${textColor}`}>
            HealthThread
          </div>
          {subtitle && (
            <div className={`text-[11px] font-medium tracking-wide ${subtextColor}`}>
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TricolorBar() {
  return (
    <div className="w-full h-[3px] flex shrink-0">
      <div className="w-1/2 h-full bg-[#f97316]" />
      <div className="w-1/2 h-full bg-[#16a34a]" />
    </div>
  );
}
