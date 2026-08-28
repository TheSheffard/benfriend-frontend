'use client';
import { useRef, useEffect, useState, useCallback } from 'react';

type CameraProps = {
  onCapture: (dataUrl: string) => void;
  autoCaptureMs?: number;
  showCaptureButton?: boolean;
};

export default function Camera({
  onCapture,
  autoCaptureMs,
  showCaptureButton = true,
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setReady(true);
      })
      .catch((e) => {
        setError('Camera access denied or unavailable');
      });
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const snap = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL('image/jpeg', 0.9));
  }, [onCapture]);

  // Auto-capture if interval set
  useEffect(() => {
    if (!autoCaptureMs || !ready) return;
    const timer = setInterval(() => snap(), autoCaptureMs);
    return () => clearInterval(timer);
  }, [autoCaptureMs, ready, snap]);

  return (
    <div className="relative">
      {!ready && !error && <div className="text-sm text-slate-500 p-4 bg-slate-900 rounded-xl">Starting camera…</div>}
      {error && <div className="text-sm text-red-300 p-4 bg-red-950 rounded-xl">{error}</div>}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full rounded-xl border border-slate-200 shadow-inner bg-black ${!ready ? 'hidden' : ''}`}
      />
      {ready && showCaptureButton && (
        <button
          onClick={snap}
          className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition-colors"
          type="button"
        >
          Capture Frame
        </button>
      )}
    </div>
  );
}
