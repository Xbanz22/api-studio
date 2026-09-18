import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Zap,
  Activity,
  Check
} from 'lucide-react';
import { ApiEndpoint } from '../types';

interface BatchHealthTesterProps {
  isOpen: boolean;
  onClose: () => void;
  endpoints: ApiEndpoint[];
  lang: 'id' | 'en';
}

interface TestResult {
  id: string;
  path: string;
  method: string;
  status: number | null;
  latencyMs: number | null;
  error?: string;
  loading: boolean;
}

export const BatchHealthTester: React.FC<BatchHealthTesterProps> = ({
  isOpen,
  onClose,
  endpoints,
  lang,
}) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Initialize results array
    const initial = endpoints.map((ep) => ({
      id: ep.id,
      path: ep.path,
      method: ep.method,
      status: null,
      latencyMs: null,
      loading: true
    }));
    setResults(initial);

    // Run tests in parallel with slight stagger
    await Promise.all(
      endpoints.map(async (ep, idx) => {
        let testUrl = ep.path;
        if (testUrl.includes(':')) {
          testUrl = testUrl.replace(/:[a-zA-Z0-9_]+/g, 'usr_1');
        }

        const start = performance.now();
        try {
          let bodyPayload: any = undefined;
          if (ep.method === 'POST') {
            if (ep.id === 'ai-generate') bodyPayload = { prompt: 'Health check ping' };
            else if (ep.id === 'ai-sentiment') bodyPayload = { text: 'Great REST API service' };
            else if (ep.id === 'ai-translate') bodyPayload = { text: 'halo', targetLang: 'en' };
            else if (ep.id === 'tools-hash') bodyPayload = { text: 'ping', algorithm: 'sha256' };
            else if (ep.id === 'data-users-create') bodyPayload = { name: 'Ping Test', email: 'ping@test.com' };
          }

          const res = await fetch(testUrl, {
            method: ep.method,
            headers: { 'Content-Type': 'application/json' },
            body: bodyPayload ? JSON.stringify(bodyPayload) : undefined
          });

          const latency = Math.round(performance.now() - start);

          setResults((prev) =>
            prev.map((r) =>
              r.id === ep.id
                ? { ...r, status: res.status, latencyMs: latency, loading: false }
                : r
            )
          );
        } catch (err: any) {
          const latency = Math.round(performance.now() - start);
          setResults((prev) =>
            prev.map((r) =>
              r.id === ep.id
                ? { ...r, status: 500, latencyMs: latency, error: err.message, loading: false }
                : r
            )
          );
        }
      })
    );

    setIsRunning(false);
  };

  useEffect(() => {
    if (isOpen) {
      runAllTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalTested = results.filter((r) => !r.loading).length;
  const successCount = results.filter((r) => r.status && r.status >= 200 && r.status < 400).length;
  const totalLatency = results.reduce((acc, r) => acc + (r.latencyMs || 0), 0);
  const avgLatency = totalTested > 0 ? Math.round(totalLatency / totalTested) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {lang === 'id' ? 'Uji Kesehatan & Latensi Batch' : 'Batch Endpoint Health & Latency Probe'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {lang === 'id' ? 'Menguji semua endpoint REST API secara paralel' : 'Pinging all REST endpoints in parallel'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scorecard Summary */}
        <div className="grid grid-cols-3 gap-2 border-b border-slate-800 bg-slate-950/40 p-4 text-center">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-500">Status Score</span>
            <p className="text-lg font-bold text-emerald-400">
              {successCount} / {endpoints.length} OK
            </p>
          </div>

          <div className="space-y-0.5 border-x border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Average Latency</span>
            <p className="text-lg font-bold text-cyan-400 font-mono">
              {avgLatency} ms
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-500">Health Rating</span>
            <p className="text-lg font-bold text-white">
              {successCount === endpoints.length ? '100% Optimal' : `${Math.round((successCount / endpoints.length) * 100)}%`}
            </p>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {results.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/70 px-3.5 py-2.5 text-xs font-mono"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className={`rounded px-1.5 py-0.5 font-bold text-[10px] ${
                  r.method === 'GET' ? 'text-emerald-400 bg-emerald-500/10' :
                  r.method === 'POST' ? 'text-indigo-400 bg-indigo-500/10' :
                  r.method === 'PUT' ? 'text-amber-400 bg-amber-500/10' :
                  'text-rose-400 bg-rose-500/10'
                }`}>
                  {r.method}
                </span>
                <span className="truncate text-slate-200">{r.path}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {r.loading ? (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />
                    Probing...
                  </span>
                ) : r.status !== null ? (
                  <>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      {r.latencyMs}ms
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 font-bold text-[11px] ${
                        r.status >= 200 && r.status < 300
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {r.status} {r.status === 200 || r.status === 201 ? 'OK' : 'Err'}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 p-4 bg-slate-950/60">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{lang === 'id' ? 'Uji Ulang Semua' : 'Re-run All Probes'}</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
          >
            {lang === 'id' ? 'Tutup' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
