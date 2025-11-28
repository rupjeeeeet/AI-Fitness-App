"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      const prefer = stored || 'dark';
      setTheme(prefer);
      document.documentElement.dataset.theme = prefer;
      if (prefer === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    document.documentElement.dataset.theme = next;
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button onClick={toggle} className="rounded px-3 py-1 text-sm bg-white/5 text-white">
      {theme === 'dark' ? 'Switch to Light ☀️' : 'Switch to Dark 🌙'}
    </button>
  );
}
