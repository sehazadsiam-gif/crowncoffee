import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#12100E] text-white p-6 font-sans">
      <div className="max-w-md w-full text-center bg-[#1C1815] border border-[#B6862C]/30 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-[#B6862C]/20 border border-[#B6862C] text-[#B6862C] rounded-2xl flex items-center justify-center mx-auto text-3xl">
          🔍
        </div>
        
        <div>
          <h2 className="text-3xl font-bold font-serif text-[#F3EAD8]">
            404
          </h2>
          <p className="text-lg font-semibold text-stone-200 mt-1">
            Page Not Found
          </p>
          <p className="text-sm text-stone-400 mt-2">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/menu"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#B6862C] hover:bg-[#9E7324] text-white font-semibold text-sm transition-all shadow-lg active:scale-95"
          >
            Explore Menu
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-sm transition-all active:scale-95"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
