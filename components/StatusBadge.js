"use client";

import { useEffect, useState } from "react";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const WEEKDAY_TO_KEY = {
  Sun: "sun",
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
};

function getDhakaNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const map = {};
  for (const part of parts) map[part.type] = part.value;

  return {
    day: WEEKDAY_TO_KEY[map.weekday],
    minutes: parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10),
  };
}

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour12}:${String(m).padStart(2, "0")} ${period}` : `${hour12} ${period}`;
}

function computeStatus(hours) {
  if (!hours) return null;
  const { day, minutes } = getDhakaNow();
  const today = hours[day];

  if (!today || today.closed) {
    return nextOpening(hours, day, "Closed today");
  }

  const open = toMinutes(today.open);
  const close = toMinutes(today.close);

  if (minutes >= open && minutes < close) {
    return { open: true, label: `Open · closes ${formatTime(today.close)}` };
  }

  if (minutes < open) {
    return { open: false, label: `Opens today ${formatTime(today.open)}` };
  }

  return nextOpening(hours, day, "Closed");
}

function nextOpening(hours, fromDay, fallbackLabel) {
  for (let i = 1; i <= 7; i++) {
    const idx = (DAY_KEYS.indexOf(fromDay) + i) % 7;
    const day = hours[DAY_KEYS[idx]];
    if (day && !day.closed) {
      const prefix = i === 1 ? "Opens tomorrow" : "Opens";
      return { open: false, label: `${prefix} ${formatTime(day.open)}` };
    }
  }
  return { open: false, label: fallbackLabel };
}

export default function StatusBadge({ hours, className = "" }) {
  const [status, setStatus] = useState(() => computeStatus(hours));

  useEffect(() => {
    const update = () => setStatus(computeStatus(hours));
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [hours]);

  if (!status) return null;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-3.5 py-1.5 text-xs font-medium tracking-wide text-[var(--ink-soft)] ${className}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${status.open ? "bg-[var(--secondary)]" : "bg-[var(--mute)]"}`}
        aria-hidden="true"
      />
      {status.label}
    </span>
  );
}
