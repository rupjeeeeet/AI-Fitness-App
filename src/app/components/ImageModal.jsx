"use client";

import React from "react";

export default function ImageModal({ open, onClose, imageUrl, prompt, loading, error }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative z-10 max-w-3xl w-full rounded-2xl bg-slate-900/90 p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Image for: {prompt}</h3>
            <p className="text-sm text-slate-300">AI-generated visual preview</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md bg-white/5 px-3 py-1 text-sm text-slate-200"
            >
              Close
            </button>
            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-cyan-500 px-3 py-1 text-sm text-slate-900"
              >
                Open
              </a>
            )}
          </div>
        </div>

        <div className="mt-4">
          {loading && <div className="text-sm text-slate-300">Generating image…</div>}
          {!loading && error && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/5 p-4 text-rose-200">Error: {error}</div>
          )}
          {!loading && imageUrl && (
            <img src={imageUrl} alt={prompt} className="w-full rounded-md object-cover" />
          )}
          {!loading && !imageUrl && !error && (
            <div className="rounded-md border border-white/10 bg-white/5 p-6 text-slate-300">No image available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
