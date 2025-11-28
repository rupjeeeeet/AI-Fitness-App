"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ResultCards from "../components/ResultCards";

export default function ResultsPage() {
  const [plan, setPlan] = useState(null);
  const [raw, setRaw] = useState(null);
  const [regenLoading, setRegenLoading] = useState(false);
  const [quote, setQuote] = useState(null);

  const readStorage = () => {
    try {
      const r = typeof window !== "undefined" ? sessionStorage.getItem("latestPlan") : null;
      setRaw(r);
      if (r) setPlan(JSON.parse(r));
      else setPlan(null);
    } catch (e) {
      setRaw(null);
      setPlan(null);
    }
  };

  useEffect(() => {
    readStorage();
    // fetch daily motivation
    (async () => {
      try {
        const r = await fetch('/api/motivation');
        if (r.ok) {
          const j = await r.json();
          setQuote(j.quote || null);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#040615] via-[#081637] to-[#060814] text-slate-100 px-6 py-14">
      <main className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-semibold">Your AI Plan</h1>

        {!plan && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <p className="mb-0">No generated plan found. Please create a plan first.</p>
            <div className="flex gap-3">
              <Link href="/" className="text-cyan-300 underline text-sm">
                ← Go back to the form
              </Link>
              <button
                onClick={readStorage}
                className="text-sm text-slate-200 underline"
              >
                Retry reading storage
              </button>
            </div>

            {raw === null ? null : (
              <details className="mt-3 text-xs text-slate-400">
                <summary>Show raw sessionStorage.latestPlan</summary>
                <pre className="whitespace-pre-wrap mt-2">{raw}</pre>
              </details>
            )}
          </div>
        )}

        {plan && (
          <div>
            {plan.summary && (
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">{plan.summary}</div>
            )}

            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                {quote && <div className="text-sm text-slate-300">💬 Daily Motivation: <span className="font-semibold text-white">{quote}</span></div>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // export printable view as PDF via browser print
                    const el = document.getElementById('plan-print-area');
                    if (!el) return;
                    const w = window.open('', '_blank');
                    if (!w) return;
                    w.document.write('<html><head><title>AI Plan</title>');
                    w.document.write('<style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;background:#fff;color:#111}</style>');
                    w.document.write('</head><body>');
                    w.document.write(el.innerHTML);
                    w.document.write('</body></html>');
                    w.document.close();
                    setTimeout(() => { w.print(); }, 500);
                  }}
                  className="rounded-md bg-cyan-600 px-3 py-2 text-sm text-white"
                >
                  Export as PDF
                </button>

                <button
                  onClick={async () => {
                    // Regenerate plan using latestUser in sessionStorage
                    try {
                      setRegenLoading(true);
                      const rawUser = sessionStorage.getItem('latestUser');
                      if (!rawUser) {
                        alert('No saved user to regenerate. Please submit the form first.');
                        return;
                      }

                      const user = JSON.parse(rawUser);
                      const r = await fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user })
                      });
                      const j = await r.json();
                      if (!r.ok) {
                        alert(j.error || 'Regeneration failed');
                        return;
                      }
                      sessionStorage.setItem('latestPlan', JSON.stringify(j));
                      setPlan(j);
                      setRaw(JSON.stringify(j));
                    } catch (e) {
                      console.error(e);
                      alert('Regeneration error');
                    } finally {
                      setRegenLoading(false);
                    }
                  }}
                  className="rounded-md bg-white/5 px-3 py-2 text-sm text-white"
                >
                  {regenLoading ? 'Regenerating…' : 'Regenerate Plan'}
                </button>
              </div>
            </div>

            <div id="plan-print-area">
              <ResultCards plan={plan} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
