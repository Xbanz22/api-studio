import React, { useState } from 'react';
import {
  Gauge,
  Play,
  RefreshCw,
  Globe2,
  Zap,
  Activity,
  CheckCircle2,
  Server,
  ArrowUpRight,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { SpeedtestRegion } from '../types';

interface SpeedtestRadarProps {
  lang: 'id' | 'en';
}

interface RegionResult {
  regionId: string;
  latencyMs: number;
  jitterMs: number;
  throughputReqSec: number;
  status: string;
  testedAt: string;
}

const REGIONS: SpeedtestRegion[] = [
  { id: 'ap-southeast-3', name: 'Jakarta', country: 'Indonesia', flag: '🇮🇩', baseLatencyMs: 12, provider: 'Equinix JK1' },
  { id: 'ap-southeast-1', name: 'Singapore', country: 'Singapore', flag: '🇸🇬', baseLatencyMs: 20, provider: 'AWS ap-southeast-1' },
  { id: 'ap-northeast-1', name: 'Tokyo', country: 'Japan', flag: '🇯🇵', baseLatencyMs: 65, provider: 'GCP asia-northeast1' },
  { id: 'eu-central-1', name: 'Frankfurt', country: 'Germany', flag: '🇩🇪', baseLatencyMs: 155, provider: 'AWS eu-central-1' },
  { id: 'us-east-1', name: 'N. Virginia', country: 'United States', flag: '🇺🇸', baseLatencyMs: 198, provider: 'Cloudflare Edge IAD' },
  { id: 'ap-southeast-2', name: 'Sydney', country: 'Australia', flag: '🇦🇺', baseLatencyMs: 110, provider: 'AWS ap-southeast-2' }
];

export const SpeedtestRadar: React.FC<SpeedtestRadarProps> = ({ lang }) => {
  const [testing, setTesting] = useState(false);
  const [activeTestingId, setActiveTestingId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, RegionResult>>({});

  const testSingleRegion = async (regionId: string) => {
    setActiveTestingId(regionId);
    try {
      const res = await fetch('/api/speedtest/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regionId })
      });
      const data = await res.json();
      if (data.success) {
        setResults((prev) => ({
          ...prev,
          [regionId]: {
            regionId,
            latencyMs: data.latencyMs,
            jitterMs: data.jitterMs,
            throughputReqSec: data.throughputReqSec,
            status: data.status,
            testedAt: new Date().toLocaleTimeString()
          }
        }));
      }
    } catch {
      // Fallback
    } finally {
      setActiveTestingId(null);
    }
  };

  const runFullBenchmark = async () => {
    setTesting(true);
    for (const reg of REGIONS) {
      await testSingleRegion(reg.id);
    }
    setTesting(false);
  };

  const testedCount = Object.keys(results).length;
  const avgLatency =
    testedCount > 0
      ? Math.round(
          (Object.values(results) as RegionResult[]).reduce(
            (acc: number, curr: RegionResult) => acc + (curr.latencyMs || 0),
            0
          ) / testedCount
        )
      : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-cyan-950/30 p-6 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {lang === 'id' ? 'Global Multi-Region Speedtest & Latency Radar' : 'Global Multi-Region Latency Radar'}
                </h1>
                <p className="text-xs text-slate-400">
                  {lang === 'id'
                    ? 'Uji latensi round-trip (RTT), throughput, dan packet jitter API Studio ke edge node global.'
                    : 'Benchmark API Studio round-trip time (RTT), throughput, and jitter across worldwide edge nodes.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {avgLatency !== null && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-right">
                <span className="text-[10px] text-slate-400 block font-medium">
                  {lang === 'id' ? 'Rata-rata Latensi Global' : 'Global Avg Latency'}
                </span>
                <span className="font-mono text-base font-extrabold text-emerald-400">{avgLatency} ms</span>
              </div>
            )}

            <button
              onClick={runFullBenchmark}
              disabled={testing}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition flex items-center gap-2 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{lang === 'id' ? 'Menguji...' : 'Testing...'}</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>{lang === 'id' ? 'Jalankan Speedtest Semua Region' : 'Benchmark All Regions'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Regional Edge Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REGIONS.map((reg) => {
          const res = results[reg.id];
          const isCurrentTesting = activeTestingId === reg.id;

          let grade = 'A+';
          let gradeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
          if (res) {
            if (res.latencyMs > 180) {
              grade = 'B';
              gradeColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
            } else if (res.latencyMs > 100) {
              grade = 'A';
              gradeColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
            }
          }

          return (
            <div
              key={reg.id}
              className={`rounded-2xl border bg-slate-900/60 p-5 space-y-4 backdrop-blur-sm transition relative overflow-hidden ${
                isCurrentTesting
                  ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-lg'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isCurrentTesting && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 animate-pulse" />
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl" role="img" aria-label={reg.country}>
                    {reg.flag}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{reg.name}</span>
                      <span className="text-xs text-slate-400 font-normal">({reg.country})</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">{reg.provider}</p>
                  </div>
                </div>

                {res ? (
                  <span className={`rounded-xl border px-2 py-0.5 text-xs font-black font-mono ${gradeColor}`}>
                    {grade}
                  </span>
                ) : (
                  <span className="rounded-xl border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] text-slate-500">
                    Standby
                  </span>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">{lang === 'id' ? 'Latensi' : 'Latency'}</span>
                  <span className="font-mono text-sm font-bold text-white">
                    {res ? `${res.latencyMs} ms` : `~${reg.baseLatencyMs} ms`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Jitter</span>
                  <span className="font-mono text-sm font-bold text-slate-300">
                    {res ? `±${res.jitterMs}ms` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Throughput</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {res ? `${res.throughputReqSec}/s` : '—'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500 font-mono">
                  {res ? `Tested at ${res.testedAt}` : 'Ready for test'}
                </span>
                <button
                  type="button"
                  onClick={() => testSingleRegion(reg.id)}
                  disabled={isCurrentTesting || testing}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:border-emerald-500/50 hover:bg-slate-700 hover:text-white transition flex items-center gap-1 disabled:opacity-50"
                >
                  <Radio className={`h-3 w-3 ${isCurrentTesting ? 'animate-pulse text-emerald-400' : ''}`} />
                  <span>{isCurrentTesting ? 'Ping...' : 'Ping Node'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Network SLA Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-white">99.99% Uptime SLA</p>
              <p className="text-[11px] text-slate-400">High availability load-balanced cluster</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-white">&lt; 30ms Edge Routing</p>
              <p className="text-[11px] text-slate-400">Optimized Southeast Asia routing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-white">DDoS &amp; Rate Protected</p>
              <p className="text-[11px] text-slate-400">Realtime IP filtering and rate buckets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
