"use client";

import { useState } from "react";
import CrownMark from "@/components/CrownMark";

const TABLE_COUNT = 50;
const BASE_URL = typeof window !== "undefined"
  ? window.location.origin
  : "https://crowncoffeebangladesh.xyz";

/**
 * Generates a QR code image URL using the free QR Server API.
 * No library needed — works fully on the client with a simple img src.
 */
function qrUrl(tableNum, baseUrl) {
  const data = encodeURIComponent(`${baseUrl}/order?table=${tableNum}`);
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${data}&margin=12&color=1C1612&bgcolor=FFFBF5`;
}

export default function QRGrid({ baseUrl }) {
  const [printing, setPrinting] = useState(false);
  const origin = baseUrl || BASE_URL;

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 200);
  };

  return (
    <>
      {/* Print controls — hidden when printing */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-2.5">
          <CrownMark className="h-7 w-7 text-[var(--accent)]" />
          <div>
            <p className="font-display text-2xl">Table QR Codes</p>
            <p className="text-sm text-[var(--ink-soft)]">
              Print and place one QR card at each table.
            </p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          disabled={printing}
          className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105 active:scale-95 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print All 50 QR Codes
        </button>
      </div>

      {/* QR Grid */}
      <div
        className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 print:grid-cols-2 print:gap-4"
        id="qr-grid"
      >
        {Array.from({ length: TABLE_COUNT }, (_, i) => i + 1).map((tableNum) => (
          <div
            key={tableNum}
            className="flex flex-col items-center rounded-2xl border-2 border-[var(--line)] bg-white p-4 shadow-sm print:break-inside-avoid print:border-2 print:border-gray-300 print:rounded-xl print:shadow-none"
          >
            {/* Crown logo */}
            <div className="mb-2 flex items-center gap-1.5">
              <CrownMark className="h-4 w-4 text-[var(--accent)]" />
              <span className="font-display text-sm font-bold text-[var(--ink)]">Crown Coffee</span>
            </div>

            {/* QR code */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl(tableNum, origin)}
              alt={`QR code for Table ${tableNum}`}
              className="h-40 w-40 rounded-lg"
              loading="lazy"
            />

            {/* Table label */}
            <div className="mt-3 flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--ink-soft)]">Table</span>
              <span className="font-display text-4xl font-black text-[var(--ink)]">{tableNum}</span>
            </div>

            {/* URL hint */}
            <p className="mt-2 text-[9px] text-center text-[var(--ink-soft)] leading-tight break-all">
              {origin}/order?table={tableNum}
            </p>

            {/* Scan instruction */}
            <p className="mt-2 text-[10px] font-semibold text-center text-[var(--accent)]">
              📷 Scan to order
            </p>
          </div>
        ))}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { margin: 0; background: white; }
          .print\\:hidden { display: none !important; }
          #qr-grid { page-break-inside: auto; }
        }
      `}</style>
    </>
  );
}
