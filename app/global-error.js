"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#12100E] text-white p-6 font-sans">
        <div className="max-w-md w-full text-center bg-[#1C1815] border border-[#B6862C]/30 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-[#B6862C]/20 border border-[#B6862C] text-[#B6862C] rounded-2xl flex items-center justify-center mx-auto text-3xl">
            ☕
          </div>
          
          <div>
            <h2 className="text-2xl font-bold font-serif text-[#F3EAD8]">
              Unexpected Application Error
            </h2>
            <p className="text-sm text-stone-400 mt-2">
              A system error occurred. Click below to reload the application cleanly.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="px-8 py-3 rounded-xl bg-[#B6862C] hover:bg-[#9E7324] text-white font-semibold text-sm transition-all shadow-lg active:scale-95"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
