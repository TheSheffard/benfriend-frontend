'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Camera from '../components/Camera';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://benfriendbackend.vercel.app';

type VerifiedSession = {
  reg_number: string;
  exam_id: string;
  expires_at: string;
};

type MonitorSignals = {
  calibrated: boolean;
  calibration_samples: number;
  calibration_required: number;
  candidate_state: string;
  yaw_degrees: number | null;
};

export default function ExamPage() {
  const [timer, setTimer] = useState(0);
  const [session, setSession] = useState<VerifiedSession | null>(null);
  const [monitor, setMonitor] = useState<MonitorSignals | null>(null);
  const capturedRef = useRef<string | null>(null);

  const handleCapture = useCallback((dataUrl: string) => {
    capturedRef.current = dataUrl;
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('exam_token');
    if (!token) {
      window.location.replace('/login');
      return;
    }
    fetch(`${API_URL}/api/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('invalid session');
        return response.json();
      })
      .then((data) => setSession(data))
      .catch(() => {
        sessionStorage.clear();
        window.location.replace('/login');
      });
  }, []);

  useEffect(() => {
    if (!session) return;
    const token = sessionStorage.getItem('exam_token');
    const interval = setInterval(async () => {
      const image = capturedRef.current;
      if (!image || !token) return;
      try {
        const response = await fetch(`${API_URL}/api/proctor/analyze-frame`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ exam_id: session.exam_id, image }),
        });
        if (response.status === 401) {
          sessionStorage.clear();
          window.location.replace('/login');
          return;
        }
        if (response.ok) {
          const data = await response.json();
          if (data.signals) setMonitor(data.signals);
        }
      } catch {
        // A temporary network failure should not interrupt the candidate's exam UI.
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    const timerId = setInterval(() => setTimer((seconds) => seconds + 1), 1000);
    return () => clearInterval(timerId);
  }, []);

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fafaf9] antialiased">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-8 py-6 flex items-center gap-3">
          <div className="h-4 w-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600">Validating verified session…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf9] p-6 antialiased selection:bg-indigo-100">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main question paper */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Question Paper — Exam 001
            </h2>
          </div>
          <div className="space-y-5 text-slate-700 leading-relaxed">
            <p>
              <strong className="text-slate-900">Q1.</strong> What is the primary purpose of
              face verification at exam login?
            </p>
            <p>
              <strong className="text-slate-900">Q2.</strong> Describe one advantage of using
              ONNX Runtime over full PyTorch for proctoring.
            </p>
            <p>
              <strong className="text-slate-900">Q3.</strong> At what interval should the
              frontend capture frames for proctoring to balance accuracy and load?
            </p>
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <strong>Live monitoring active.</strong> A record is created only after a behavior
            persists across multiple frames.
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Webcam monitor */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-3">Webcam Monitor</h3>
            {monitor && !monitor.calibrated && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Look straight at the camera while head position is calibrated ({monitor.calibration_samples}/{monitor.calibration_required}).
              </div>
            )}
            <div className="rounded-lg overflow-hidden border border-stone-200 bg-slate-900 shadow-inner">
              <Camera onCapture={handleCapture} autoCaptureMs={700} showCaptureButton={false} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
              <span>
                Elapsed: <strong className="text-slate-900">{timer}s</strong>
              </span>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                monitor?.calibrated
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${monitor?.calibrated ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {monitor?.calibrated ? 'Monitoring' : 'Calibrating'}
              </span>
            </div>
          </div>

          {/* Session status */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-2">Session Status</h3>
            <div className="text-sm text-slate-500">
              <div className="flex justify-between py-1">
                <span>Verified</span>
                <span className="font-medium text-slate-900">{session.reg_number}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Exam ID</span>
                <span className="font-medium text-slate-900">{session.exam_id}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Expires</span>
                <span className="font-medium text-slate-900">
                  {new Date(session.expires_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
