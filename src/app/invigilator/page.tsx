'use client';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace(/^http/, 'ws');

type Alert = {
  id: string;
  reg_number: string;
  exam_id: string;
  type: string;
  evidence_url: string;
  details?: {
    yaw_degrees?: number;
    last_visible_yaw_degrees?: number;
    confidence?: number;
    person_confidence?: number;
    severity?: number;
    detection_source?: string;
    pose_version?: string;
  };
  timestamp: string;
};

export default function InvigilatorPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/proctor/violations?limit=50`)
      .then((response) => response.json())
      .then((data) => setAlerts(Array.isArray(data.violations) ? data.violations : []))
      .catch(() => setAlerts([]));

    const websocket = new WebSocket(`${WS_URL}/ws/proctor-alerts`);
    websocket.onmessage = (event) => {
      try {
        const incoming: Alert = JSON.parse(event.data);
        setAlerts((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)].slice(0, 50));
      } catch {
        // Ignore malformed alert payloads.
      }
    };
    websocket.onopen = () => setConnected(true);
    websocket.onclose = () => setConnected(false);
    return () => websocket.close();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafaf9] text-slate-900 antialiased p-6 selection:bg-indigo-100">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Invigilator Incident Records
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Only confirmed, persistent violations are displayed.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium shadow-sm ${
              connected
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            {connected ? 'Live' : 'History only'}
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Card header */}
              <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  {alert.type?.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Card body */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-slate-900">{alert.reg_number}</div>
                  <div className="text-xs text-slate-400">Exam: {alert.exam_id}</div>
                </div>

                {alert.evidence_url && (
                  <img
                    src={alert.evidence_url}
                    alt={`${alert.type} evidence`}
                    className="w-full h-44 object-cover rounded-lg border border-stone-200"
                  />
                )}

                {typeof alert.details?.yaw_degrees === 'number' &&
                  (alert.details.pose_version === 'head-pose-calibrated-v2' || Math.abs(alert.details.yaw_degrees) <= 90) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Head angle</span>
                    <span className="font-medium text-slate-900">
                      {Math.abs(alert.details.yaw_degrees).toFixed(1)}°
                    </span>
                  </div>
                )}

                {typeof alert.details?.yaw_degrees === 'number' &&
                  !alert.details.pose_version &&
                  Math.abs(alert.details.yaw_degrees) > 90 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      Legacy uncalibrated head-angle record
                    </div>
                  )}

                {alert.details?.detection_source === 'candidate_visible_face_hidden' && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                    Candidate remained visible, but the face was turned away from the camera.
                  </div>
                )}

                {alert.details?.detection_source === 'recent_turn_then_landmarks_lost' && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                    Facial landmarks disappeared immediately after a detected head turn.
                  </div>
                )}

                {alert.details?.detection_source === 'candidate_not_visible' && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    Candidate was not visible in the camera frame.
                  </div>
                )}

                {typeof alert.details?.confidence === 'number' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Phone confidence</span>
                    <span className="font-medium text-slate-900">
                      {(alert.details.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-100">
                  <div className="text-xs text-slate-400">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </article>
          ))}

          {alerts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <span className="text-stone-400 text-xl">✓</span>
              </div>
              <p className="text-slate-500 text-sm">No confirmed incidents have been recorded.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
