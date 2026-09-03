'use client';
import Link from 'next/link';
import { ShieldCheck, Eye, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans selection:bg-indigo-100 antialiased">
      {/* Subtle top bar */}
      <nav className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight text-slate-900">
          Exam Proctor
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/invigilator"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Invigilator
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-6 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            AI-Powered Proctoring
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-slate-950">
            Biometric verification.
            <br />
            <span className="text-slate-400 font-medium">Real-time proctoring.</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl">
            Students authenticate once with facial verification at login, then enter a
            monitored exam session where AI detects prohibited behaviors—turning away,
            missing presence, or device usage—instantly alerting invigilators.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all duration-200 hover:shadow-md"
            >
              Begin Verification
            </Link>
            <Link
              href="/invigilator"
              className="inline-flex items-center justify-center rounded-lg border border-stone-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-stone-50 transition-all duration-200 hover:shadow-md"
            >
              Invigilator Dashboard
            </Link>
            <span className="text-sm text-slate-400">No download required</span>
          </div>
        </div>
      </section>

      {/* Features — clean, restrained cards */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="bg-white rounded-xl p-7 border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                <ShieldCheck size={20} strokeWidth={1.75} />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Login Verification</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              YuNet face detection and SFace embedding compare live frames against
              pre‑computed student references using cosine similarity.
            </p>
          </article>

          <article className="bg-white rounded-xl p-7 border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                <Eye size={20} strokeWidth={1.75} />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Real-Time Proctoring</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              MediaPipe head pose tracking and ONNX Runtime phone detection run
              continuously. Violations trigger instant evidence uploads and dashboard
              alerts.
            </p>
          </article>

          <article className="bg-white rounded-xl p-7 border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                <Lock size={20} strokeWidth={1.75} />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Evidence & Logging</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Violation snapshots are stored in Cloudinary, incidents logged in MongoDB,
              and alert payloads broadcast to invigilator dashboards over persistent
              WebSockets.
            </p>
          </article>
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="w-full border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-slate-400">
          <span>Exam Proctor System</span>
          <span>Lightweight / Render-Hostable</span>
        </div>
      </footer>
    </main>
  );
}