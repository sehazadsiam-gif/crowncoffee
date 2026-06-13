"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CrownMark from "@/components/CrownMark";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Incorrect password.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-16">
      <div className="flex items-center gap-2.5">
        <CrownMark className="h-7 w-7 text-[var(--accent)]" />
        <span className="font-display text-xl">Crown Coffee</span>
      </div>
      <h1 className="mt-6 font-display text-3xl">Admin sign in</h1>
      <p className="mt-2 text-center text-sm text-[var(--ink-soft)]">
        Enter the admin password to manage your menu, theme and site details.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 w-full">
        <label htmlFor="password" className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 text-base focus:border-[var(--accent)]"
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-[var(--ink)] px-7 py-3 text-sm font-semibold tracking-wide text-[var(--paper)] transition hover:bg-[var(--accent)] disabled:opacity-60"
        >
          {loading ? "Signing in\u2026" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
