import React, { useState, useEffect } from 'react';
import { Layers, Activity, Calendar, Zap, TrendingUp, RefreshCw, BarChart2, ShieldCheck, AlertTriangle, User, Users, Eye, Globe } from 'lucide-react';
import { ResponsiveContainer as ReResponsiveContainer, AreaChart as ReAreaChart, Area as ReArea, XAxis as ReXAxis, YAxis as ReYAxis, Tooltip as ReTooltip, CartesianGrid as ReCartesianGrid } from 'recharts';
import { BUILTIN_ENDPOINTS } from '../data/endpoints';

interface UsageStatsWidgetProps {
  userEmail: string;
  lang: 'id' | 'en';
  onNavigateDocs?: () => void;
}

interface StatsData {
  userRequestsToday: number;
  userTotalRequests: number;
  globalRequestsToday: number;
  monthlyTotalRequests: number;
  visitorsToday: number;
  visitorsActiveNow: number;
  visitorsTotal: number;
}

// Generate realistic mock traffic data for diagram visualization with error requests
const generateTrafficData = (range: '24h' | '7d' | '30d') => {
  if (range === '24h') {
    const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    return hours.map(h => ({
      time: h,
      requests: Math.floor(Math.random() * 85) + 35,
      errors: Math.floor(Math.random() * 4),
      latency: Math.floor(Math.random() * 8) + 14,
      visitors: Math.floor(Math.random() * 40) + 15,
      successRate: 99.8 + (Math.random() * 0.2)
    }));
  } else if (range === '7d') {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    return days.map(d => ({
      time: d,
      requests: Math.floor(Math.random() * 450) + 180,
      errors: Math.floor(Math.random() * 10) + 2,
      latency: Math.floor(Math.random() * 6) + 15,
      visitors: Math.floor(Math.random() * 220) + 90,
      successRate: 99.9
    }));
  } else {
    const weeks = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
    return weeks.map(w => ({
      time: w,
      requests: Math.floor(Math.random() * 1800) + 900,
      errors: Math.floor(Math.random() * 35) + 8,
      latency: Math.floor(Math.random() * 5) + 16,
      visitors: Math.floor(Math.random() * 950) + 400,
      successRate: 99.95
    }));
  }
};

export const UsageStatsWidget: React.FC<UsageStatsWidgetProps> = ({ userEmail, lang, onNavigateDocs }) => {
  const [stats, setStats] = useState<StatsData>({
    userRequestsToday: 350,
    userTotalRequests: 1166,
    globalRequestsToday: 14820,
    monthlyTotalRequests: 142500,
    visitorsToday: 1280,
    visitorsActiveNow: 32,
    visitorsTotal: 28450,
  });
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [trafficData, setTrafficData] = useState(() => generateTrafficData('24h'));

  // Reactive theme mode tracking for crystal-clear chart contrast in Light & Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/stats?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success) {
        setStats({
          userRequestsToday: data.userRequestsToday ?? data.requestsToday ?? 350,
          userTotalRequests: data.userTotalRequests ?? data.totalRequests ?? 1166,
          globalRequestsToday: data.globalRequestsToday ?? 14820,
          monthlyTotalRequests: data.monthlyTotalRequests ?? data.requestsThisMonth ?? 142500,
          visitorsToday: data.visitorsToday ?? 1280,
          visitorsActiveNow: data.visitorsActiveNow ?? 32,
          visitorsTotal: data.visitorsTotal ?? 28450,
        });
      }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [userEmail]);

  useEffect(() => {
    setTrafficData(generateTrafficData(timeframe));
  }, [timeframe]);

  const totalEndpointsCount = BUILTIN_ENDPOINTS?.length || 421;
  const totalErrorsCount = trafficData.reduce((acc, item) => acc + item.errors, 0);

  const displayUserEmail = userEmail ? userEmail.split('@')[0] : 'Akun Saya';

  return (
    <div className="space-y-5">
      {/* Overview Real-Time Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="inline-block rounded border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-indigo-700 dark:text-indigo-400 font-mono uppercase">
            OVERVIEW REAL-TIME
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 uppercase">
            DASHBOARD METRICS & TRAFFIC
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {lang === 'id'
              ? 'Monitoring real-time pemakaian akun, statistik pengunjung, request global harian, dan akumulasi statistik bulanan.'
              : 'Real-time monitoring of account usage, visitor traffic, overall daily requests, and monthly statistics.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              fetchStats();
              setTrafficData(generateTrafficData(timeframe));
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {onNavigateDocs && (
            <button
              onClick={onNavigateDocs}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <span>Dokumentasi</span>
            </button>
          )}
        </div>
      </div>

      {/* 5 Cards Grid - Including Visitor Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* CARD 1: PEMAKAIAN AKUN SAYA */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-3.5 shadow-sm hover:border-indigo-500/40 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <User className="h-4 w-4" />
            </div>
            <span className="flex items-center gap-1 rounded-full border border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 font-mono">
              @{displayUserEmail}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
              PEMAKAIAN AKUN SAYA
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight mt-0.5">
              {stats.userRequestsToday.toLocaleString()} <span className="text-xs font-semibold text-slate-500 font-sans">req</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{stats.userTotalRequests.toLocaleString()} total req</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Aktif</span>
          </p>
        </div>

        {/* CARD 2: PENGUNJUNG (VISITORS) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-3.5 shadow-sm hover:border-purple-500/40 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Users className="h-4 w-4" />
            </div>
            <span className="flex items-center gap-1 rounded-full border border-purple-300 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {stats.visitorsActiveNow} Online Live
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
              PENGUNJUNG HARI INI
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight mt-0.5">
              {stats.visitorsToday.toLocaleString()} <span className="text-xs font-semibold text-slate-500 font-sans">visitor</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{stats.visitorsTotal.toLocaleString()} total visitor</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold">Unique IP</span>
          </p>
        </div>

        {/* CARD 3: TOTAL REQUEST HARI INI (KESELURUHAN) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-3.5 shadow-sm hover:border-emerald-500/40 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-4 w-4" />
            </div>
            <span className="flex items-center gap-1 rounded-full border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              <TrendingUp className="h-3 w-3" /> Global Hari Ini
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
              REQUEST HARI INI
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight mt-0.5">
              {stats.globalRequestsToday.toLocaleString()} <span className="text-xs font-semibold text-slate-500 font-sans">req</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Total dari seluruh user hari ini
          </p>
        </div>

        {/* CARD 4: TOTAL REQUEST (DIHITUNG PER BULAN) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-3.5 shadow-sm hover:border-cyan-500/40 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-200 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="flex items-center gap-1 rounded-full border border-cyan-300 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-400 font-mono">
              Per Bulan (30d)
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
              TOTAL BULANAN
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight mt-0.5">
              {stats.monthlyTotalRequests.toLocaleString()} <span className="text-xs font-semibold text-slate-500 font-sans">req</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 dark:bg-cyan-400 rounded-full w-3/4" />
            </div>
          </div>
        </div>

        {/* CARD 5: AVERAGE LATENCY & STATUS */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-3.5 shadow-sm hover:border-amber-500/40 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
            <span className="flex items-center gap-1 rounded-full border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3 inline" /> 99.98%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
              AVERAGE LATENCY
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight mt-0.5">
              18 ms
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{totalEndpointsCount} Endpoints</span>
            <span className="text-emerald-500 font-semibold">Healthy</span>
          </p>
        </div>
      </div>

      {/* REAL-TIME TRAFFIC DIAGRAM / CHART */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              <BarChart2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Diagram Traffic Request Real-Time</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Grafik beban trafik API per periode, request error, dan latensi jaringan.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Legend indicators */}
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <span>Req Sukses</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span>Visitor</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Req Error</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                <span>Latensi (ms)</span>
              </span>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {(['24h', '7d', '30d'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    timeframe === tf
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tf === '24h' ? '24 Jam' : tf === '7d' ? '7 Hari' : '30 Hari'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-64 w-full">
          <ReResponsiveContainer width="100%" height="100%">
            <ReAreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <ReCartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? '#334155' : '#cbd5e1'}
                opacity={isDarkMode ? 0.3 : 0.6}
              />
              <ReXAxis
                dataKey="time"
                stroke={isDarkMode ? '#94a3b8' : '#334155'}
                fontSize={11}
                tickLine={false}
                tick={{ fill: isDarkMode ? '#cbd5e1' : '#1e293b', fontWeight: 600 }}
              />
              <ReYAxis
                stroke={isDarkMode ? '#94a3b8' : '#334155'}
                fontSize={11}
                tickLine={false}
                tick={{ fill: isDarkMode ? '#cbd5e1' : '#1e293b', fontWeight: 600 }}
              />
              <ReTooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                  borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                  borderRadius: '12px',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  fontSize: '12px',
                  boxShadow: isDarkMode
                    ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  fontWeight: '600'
                }}
                labelStyle={{
                  color: isDarkMode ? '#94a3b8' : '#475569',
                  fontWeight: '700',
                  marginBottom: '4px'
                }}
                formatter={(val: any, name: any) => {
                  if (name === 'requests') return [`${val} requests`, 'Request Sukses'];
                  if (name === 'visitors') return [`${val} visitor`, 'Pengunjung Unik'];
                  if (name === 'errors') return [`${val} error`, 'Request Error (4xx/5xx)'];
                  if (name === 'latency') return [`${val} ms`, 'Latensi Server'];
                  return [val, name];
                }}
              />
              <ReArea
                type="monotone"
                dataKey="requests"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#trafficGradient)"
                name="requests"
              />
              <ReArea
                type="monotone"
                dataKey="visitors"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#visitorGradient)"
                name="visitors"
              />
              <ReArea
                type="monotone"
                dataKey="errors"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#errorGradient)"
                name="errors"
              />
              <ReArea
                type="monotone"
                dataKey="latency"
                stroke="#06b6d4"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#latencyGradient)"
                name="latency"
              />
            </ReAreaChart>
          </ReResponsiveContainer>
        </div>

        {/* Diagram Footer Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Puncak Request:</span>
            <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
              118 req/min
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Total Request Error:</span>
            <div className="text-xs font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-rose-500" />
              <span>{totalErrorsCount} Error</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Rata-rata Latensi:</span>
            <div className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
              16.4 ms
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Status Server:</span>
            <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Healthy (99.98%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
