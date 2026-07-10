"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CrownMark from "@/components/CrownMark";

export default function ManagerLoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/manager-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        router.push("/manager");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Incorrect PIN");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 antialiased font-sans">
      <div className="w-full max-w-sm px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)" }}>
              <CrownMark className="h-7 w-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Manager Portal</h1>
            <p className="text-sm text-slate-400">Crown Coffee — Staff Access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pin" className="block text-sm font-semibold text-slate-300 mb-1.5">
                Manager PIN
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="current-password"
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-800 bg-slate-950 px-4 py-3 text-center text-2xl font-bold tracking-widest text-white focus:border-amber-500 focus:outline-none transition"
                required
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-950/25 border border-red-900/50 px-3 py-2 text-sm text-red-400 text-center font-semibold">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className="w-full rounded-xl py-3.5 text-sm font-bold tracking-wide text-white transition hover:brightness-105 active:scale-98 disabled:opacity-50 cursor-pointer"
              style={{ background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)" }}
            >
              {loading ? "Verifying…" : "Access Portal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
