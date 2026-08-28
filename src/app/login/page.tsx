'use client';
import { useCallback, useState } from 'react';
import Camera from '../components/Camera';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const REQUIRED_SAMPLES = 3;

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [reg, setReg] = useState('');
  const [msg, setMsg] = useState('Look straight at the camera in good lighting.');
  const [samples, setSamples] = useState<string[]>([]);
  const [verifying, setVerifying] = useState(false);

  const handleCapture = useCallback((dataUrl: string) => {
    setSamples((previous) => [...previous, dataUrl].slice(-REQUIRED_SAMPLES));
  }, []);

  const handleVerify = async () => {
    if (!username.trim() || !reg.trim()) {
      setMsg('Enter your username and registration number.');
      return;
    }
    if (samples.length < REQUIRED_SAMPLES) {
      setMsg('Keep looking at the camera while the live samples are collected.');
      return;
    }

    setVerifying(true);
    setMsg('Comparing three live face samples with your enrolled face…');
    try {
      const res = await fetch(`${API_URL}/api/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, reg_number: reg, images: samples }),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem('exam_token', data.token);
        sessionStorage.setItem('reg_number', data.reg_number);
        window.location.href = '/exam';
      } else {
        setMsg(data.detail || 'Identity or face verification failed.');
      }
    } catch {
      setMsg('The verification service is unavailable.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#fafaf9] antialiased selection:bg-indigo-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-stone-200 p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            Secure Login
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Exam Portal
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Accurate facial identity verification
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
              Username / Full Name
            </label>
            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="name"
              className="w-full rounded-lg border border-stone-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
            />
          </div>
          <div>
            <label htmlFor="reg" className="block text-sm font-medium text-slate-700 mb-1.5">
              Registration Number
            </label>
            <input
              id="reg"
              value={reg}
              onChange={(event) => setReg(event.target.value)}
              autoComplete="off"
              placeholder="e.g. STU-001"
              className="w-full rounded-lg border border-stone-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        {/* Camera */}
        <Camera onCapture={handleCapture} autoCaptureMs={750} showCaptureButton={false} />
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Live samples</span>
          <span className={samples.length === REQUIRED_SAMPLES ? 'text-emerald-700 font-semibold' : ''}>
            {samples.length}/{REQUIRED_SAMPLES} ready
          </span>
        </div>

        {/* Button */}
        <button
          onClick={handleVerify}
          disabled={verifying || samples.length < REQUIRED_SAMPLES}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold py-3 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:shadow-none"
        >
          {verifying ? 'Verifying…' : 'Verify Face & Enter Exam'}
        </button>

        {/* Message */}
        {msg && (
          <p className="text-sm text-center text-slate-600 bg-stone-100 border border-stone-200 rounded-lg py-3 px-4">
            {msg}
          </p>
        )}
      </div>
    </main>
  );
}