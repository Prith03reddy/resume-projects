import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

/**
 * ServerClock Micro-Component
 * Isolates 1-second interval ticking to prevent re-rendering the parent Header,
 * the App root, or the heavy Leaflet Map canvas.
 */
function ServerClock({ isDark = true }) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className={`hidden md:flex font-mono text-xs font-semibold px-3 py-1.5 rounded-lg border items-center space-x-1.5 ${
        isDark
          ? 'bg-slate-900/80 text-slate-300 border-slate-800'
          : 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
      <span>{formattedTime}</span>
    </div>
  );
}

export default React.memo(ServerClock);

