"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application runtime error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#12100E] text-white p-6 font-sans">
      <div className="max-w-md w-full text-center bg-[#1C1815] border border-[#B6862C]/30 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-[#B6862C]/20 border border-[#B6862C] text-[#B6862C] rounded-2xl flex items-center justify-center mx-auto text-3xl">
          ☕
        </div>
        
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#F3EAD8]">
            Something went wrong
          </h2>
          <p className="text-sm text-stone-400 mt-2">
            We encountered a temporary issue while loading this page. Please try refreshing or return to the main menu.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#B6862C] hover:bg-[#9E7324] text-white font-semibold text-sm transition-all shadow-lg active:scale-95"
          >
            Try Again
          </button>

          <a
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-sm transition-all active:scale-95"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
