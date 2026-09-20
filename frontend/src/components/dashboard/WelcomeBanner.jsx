import React from 'react';

export default function WelcomeBanner({ userName = "Priya Sharma" }) {
  return (
    <div className="relative overflow-hidden rounded-none bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/40 border border-amber-200 border-l-4 border-l-amber-600 p-6 shadow-xs">
      {/* Background Gujarat Heritage / Riverfront Panoramic Illustration */}
      <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-30 pointer-events-none hidden md:block">
        <svg viewBox="0 0 500 150" className="w-full h-full object-cover text-amber-800" fill="currentColor">
          <path d="M50 150 L60 90 L80 60 L100 90 L110 150 Z" />
          <path d="M120 150 L135 70 L155 40 L175 70 L190 150 Z" />
          <path d="M200 150 L220 50 L250 20 L280 50 L300 150 Z" />
          <path d="M310 150 L330 80 L350 50 L370 80 L390 150 Z" />
          <path d="M400 150 L420 100 L440 70 L460 100 L480 150 Z" />
          <line x1="0" y1="148" x2="500" y2="148" stroke="#b45309" strokeWidth="4" />
        </svg>
      </div>

      <div className="relative z-10 max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          Welcome, {userName}!
        </h1>
        <p className="text-sm md:text-base text-slate-700 font-medium mt-1 leading-relaxed">
          Track your family&apos;s schemes, applications and benefits &mdash; all in one place.
        </p>
      </div>
    </div>
  );
}
