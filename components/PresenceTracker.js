"use client";

import { useEffect } from "react";

export default function PresenceTracker() {
  useEffect(() => {
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    const ping = () => {
      fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      }).catch(() => {});
    };

    ping();
    const interval = setInterval(ping, 10000); // Ping every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  return null;
}
