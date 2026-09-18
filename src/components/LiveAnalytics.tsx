import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  HardDrive,
  Calendar,
  Layers,
  Radio,
  Shield,
  Lock
} from 'lucide-react';
import { ApiLogItem, ServerStats, UserProfile } from '../types';

interface LiveAnalyticsProps {
  stats: ServerStats | null;
  logs: ApiLogItem[];
  user?: UserProfile | null;
  onRefresh: () => void;
  onClearLogs: () => void;
  lang: 'id' | 'en';
}

export const LiveAnalytics: React.FC<LiveAnalyticsProps> = ({
  stats,
  logs,
  user,
  onRefresh,
  onClearLogs,
  lang,
}) => {
  const isAdmin = user?.role === 'admin';

  // Helper to extract purely the endpoint path without sensitive query parameters for non-admin
  const getCleanEndpoint = (rawUrl: string) => {
    if (!rawUrl) return '';
    if (isAdmin) return rawUrl;
    return rawUrl.split('?')[0];
  };
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchLog, setSearchLog] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(2);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time polling with configurable interval
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      onRefresh();
    }, refreshIntervalSec * 1000);
    return () => clearInterval(timer);
  }, [autoRefresh, refreshIntervalSec, onRefresh]);

  // Refresh immediately when window/tab is focused
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        onRefresh();
      }
    };
    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onRefresh]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const filteredLogs = logs.filter((l) => {
    const matchesMethod = filterMethod === 'ALL' || l.method === filterMethod;
    let matchesStatus = true;
    if (filterStatus === '2xx') matchesStatus = l.status >= 200 && l.status < 300;
    else if (filterStatus === '4xx') matchesStatus = l.status >= 400 && l.status < 500;
    else if (filterStatus === '5xx') matchesStatus = l.status >= 500;

    const displayPath = getCleanEndpoint(l.url);
    const searchLower = searchLog.toLowerCase();
    const matchesSearch =
      displayPath.toLowerCase().includes(searchLower) ||
      (isAdmin && l.url.toLowerCase().includes(searchLower)) ||
      l.ip.includes(searchLog) ||
      l.method.toLowerCase().includes(searchLower) ||
      (isAdmin && l.userAgent && l.userAgent.toLowerCase().includes(searchLower));

    return matchesMethod && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30';
    }
    if (status >= 400 && status < 500) {
      return 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30';
    }
    return 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30';
  };

  const totalRequestsCount = stats?.totalRequests !== undefined ? stats.totalRequests : logs.length;
  const requestsTodayCount = stats?.requestsToday !== undefined ? stats.requestsToday : Math.min(totalRequestsCount, logs.length);
  const requestsThisWeekCount = stats?.requestsThisWeek !== undefined ? stats.requestsThisWeek : totalRequestsCount;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>{lang === 'id' ? 'Live Telemetri & Log Request API' : 'Real-time Telemetry & Request Logs'}</span>
            </h1>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>Live Engine Active</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {lang === 'id'
              ? 'Pantau hitungan request realtime secara global dan per-user, latensi server, serta status code secara instan.'
              : 'Monitor global & per-user real-time request counts, server latency, and status codes instantly.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Interval Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
            {[1, 2, 5].map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setRefreshIntervalSec(sec);
                  setAutoRefresh(true);
                }}
                className={`px-2 py-0.5 text-[11px] font-medium rounded transition ${
                  autoRefresh && refreshIntervalSec === sec
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
              autoRefresh
                ? 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Radio className={`h-3 w-3 ${autoRefresh ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`} />
            <span>{autoRefresh ? (lang === 'id' ? 'Auto Sync Aktif' : 'Auto Sync') : (lang === 'id' ? 'Paused' : 'Paused')}</span>
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
            <span>{lang === 'id' ? 'Segarkan' : 'Refresh'}</span>
          </button>

          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 rounded-lg border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{lang === 'id' ? 'Hapus Log' : 'Clear Logs'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Calls */}
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/70 dark:bg-gradient-to-br dark:from-indigo-950/40 dark:to-slate-900/60 p-4 space-y-1 relative overflow-hidden shadow-xs dark:shadow-lg dark:shadow-indigo-950/20">
          <div className="flex items-center justify-between text-indigo-800 dark:text-indigo-300">
            <span className="text-xs font-bold">{lang === 'id' ? 'Total Panggilan' : 'Total Requests'}</span>
            <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-extrabold text-indigo-950 dark:text-white tracking-tight">
            {totalRequestsCount.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span>{requestsTodayCount} {lang === 'id' ? 'hari ini' : 'today'}</span>
          </div>
        </div>

        {/* Avg Latency */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-400">
            <span className="text-xs font-bold">{lang === 'id' ? 'Rata-rata Latensi' : 'Avg Latency'}</span>
            <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="font-mono text-xl sm:text-2xl font-extrabold text-cyan-800 dark:text-cyan-300">
            {stats?.avgLatencyMs !== undefined ? stats.avgLatencyMs : 12} ms
          </p>
          <span className="text-[11px] text-slate-600 dark:text-slate-500 font-medium">Server processing speed</span>
        </div>

        {/* Success Rate */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-400">
            <span className="text-xs font-bold">{lang === 'id' ? 'Tingkat Sukses (2xx)' : 'Success Rate'}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-mono text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {stats?.successRatePercent !== undefined ? stats.successRatePercent : 100}%
          </p>
          <span className="text-[11px] text-slate-600 dark:text-slate-500 font-medium">HTTP 2xx ratio</span>
        </div>

        {/* Active Keys & Entities */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-400">
            <span className="text-xs font-bold">{lang === 'id' ? 'Key & Mock Aktif' : 'Active Keys & Mocks'}</span>
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="font-mono text-xl sm:text-2xl font-extrabold text-amber-800 dark:text-amber-300">
            {(stats?.activeApiKeys || 0) + (stats?.activeMockRoutes || 0)}
          </p>
          <span className="text-[11px] text-slate-600 dark:text-slate-500 font-medium">Active API entities</span>
        </div>
      </div>

      {/* Secondary Metrics Bar: Timeframe Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 px-4 py-2.5 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
            <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{lang === 'id' ? 'Permintaan Hari Ini' : 'Requests Today'}</span>
          </div>
          <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">{requestsTodayCount.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 px-4 py-2.5 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
            <Layers className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>{lang === 'id' ? 'Minggu Ini' : 'This Week'}</span>
          </div>
          <span className="font-mono font-extrabold text-purple-800 dark:text-purple-300 text-sm">{requestsThisWeekCount.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 px-4 py-2.5 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
            <HardDrive className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{lang === 'id' ? 'Bulan Ini' : 'This Month'}</span>
          </div>
          <span className="font-mono font-extrabold text-cyan-800 dark:text-cyan-300 text-sm">{totalRequestsCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Method & Status distribution (6 cols) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-4 sm:p-5 lg:col-span-6 space-y-4 shadow-xs">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>{lang === 'id' ? 'Distribusi HTTP Status Code' : 'HTTP Status Code Distribution'}</span>
            <span className="text-[11px] font-normal text-slate-600 dark:text-slate-400 font-mono">
              Total {totalRequestsCount}
            </span>
          </h2>

          <div className="space-y-2.5">
            {[
              { label: '2xx Success (OK / Created)', key: '2xx', count: stats?.statusBreakdown?.['2xx'] || 0, color: 'bg-emerald-500' },
              { label: '3xx Redirection', key: '3xx', count: stats?.statusBreakdown?.['3xx'] || 0, color: 'bg-blue-500' },
              { label: '4xx Client Error (Not Found / Bad Req)', key: '4xx', count: stats?.statusBreakdown?.['4xx'] || 0, color: 'bg-amber-500' },
              { label: '5xx Server Error', key: '5xx', count: stats?.statusBreakdown?.['5xx'] || 0, color: 'bg-rose-500' },
            ].map((item) => {
              const total = Math.max(1, totalRequestsCount);
              const pct = Math.round((item.count / total) * 100) || 0;
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-800 dark:text-slate-300 font-medium">{item.label}</span>
                    <span className="text-slate-700 dark:text-slate-400 font-semibold">{item.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full ${item.color} transition-all duration-500`} style={{ width: `${Math.max(item.count > 0 ? 3 : 0, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Endpoints (6 cols) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-4 sm:p-5 lg:col-span-6 space-y-4 shadow-xs">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>{lang === 'id' ? 'Endpoint Terpopuler' : 'Top Requested Endpoints'}</span>
            <span className="text-[11px] font-normal text-slate-600 dark:text-slate-400 font-mono">Real-time</span>
          </h2>

          {stats?.topEndpoints && Object.keys(stats.topEndpoints).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(stats.topEndpoints)
                .sort((a, b) => Number(b[1]) - Number(a[1]))
                .slice(0, 5)
                .map(([path, count]) => (
                  <div key={path} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-mono">
                    <span className="truncate text-cyan-800 dark:text-cyan-300 font-bold" title={isAdmin ? path : getCleanEndpoint(path)}>
                      {getCleanEndpoint(path)}
                    </span>
                    <span className="rounded bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-800 dark:text-slate-300">{count} hits</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              {lang === 'id' ? 'Belum ada data panggilan endpoint.' : 'No endpoint call data yet.'}
            </p>
          )}
        </div>
      </div>

      {/* Live Logs Stream Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'id' ? 'Aliran Log Request Realtime' : 'Live Request Log Stream'}</span>
            </h2>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                <Lock className="h-2.5 w-2.5" />
                <span>Super Admin Audit (Full View)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                <Shield className="h-2.5 w-2.5" />
                <span>{lang === 'id' ? 'Endpoint Terproteksi (Privasi Aktif)' : 'Protected Endpoint View'}</span>
              </span>
            )}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                placeholder="Filter URL / IP..."
                className="rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-1 pl-8 pr-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 text-xs text-slate-900 dark:text-slate-200 outline-none"
            >
              <option value="ALL">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 text-xs text-slate-900 dark:text-slate-200 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="2xx">2xx Success</option>
              <option value="4xx">4xx Client Error</option>
              <option value="5xx">5xx Server Error</option>
            </select>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            {lang === 'id' ? 'Tidak ada log request yang cocok.' : 'No matching request logs.'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const cleanEndpoint = getCleanEndpoint(log.url);

              return (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 p-3 transition hover:border-slate-300 dark:hover:border-slate-700 space-y-2"
                >
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="flex cursor-pointer flex-wrap items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                        log.method === 'GET' ? 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30' :
                        log.method === 'POST' ? 'text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/30' :
                        log.method === 'PUT' ? 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/30' :
                        'text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/30'
                      }`}>
                        {log.method}
                      </span>
                      <span
                        className="font-mono text-xs text-slate-900 dark:text-slate-200 font-semibold truncate"
                        title={isAdmin ? log.url : cleanEndpoint}
                      >
                        {cleanEndpoint}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className={`rounded border px-2 py-0.5 text-[11px] font-bold ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                      <span className="text-slate-700 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {log.latencyMs}ms
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Inspection */}
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/60 font-mono text-xs text-slate-700 dark:text-slate-400 space-y-1.5 bg-white dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <p><span className="text-slate-500">Timestamp:</span> {log.timestamp}</p>
                      
                      {isAdmin ? (
                        <>
                          <p><span className="text-slate-500">Client IP:</span> {log.ip}</p>
                          <p className="break-all"><span className="text-slate-500">Full URL:</span> <span className="text-amber-600 dark:text-amber-400 font-bold">{log.url}</span></p>
                          {log.userAgent && (
                            <p className="truncate"><span className="text-slate-500">User Agent:</span> {log.userAgent}</p>
                          )}
                          {log.bodyPreview && (
                            <div>
                              <span className="text-slate-500">Body Payload:</span>
                              <pre className="mt-1 text-slate-900 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-[11px] overflow-x-auto">
                                {log.bodyPreview}
                              </pre>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <p><span className="text-slate-500">Endpoint:</span> <span className="font-bold text-indigo-600 dark:text-indigo-400">{cleanEndpoint}</span></p>
                          <p><span className="text-slate-500">Client IP:</span> {log.ip ? log.ip.replace(/(\d+)\.(\d+)\.(\d+)\.(\d+)/, '$1.$2.***.***') : '***.***.***.***'}</p>
                          <div className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 p-2 text-[11px] text-indigo-700 dark:text-indigo-300 font-sans">
                            <Shield className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                            <span>
                              {lang === 'id'
                                ? 'Query parameter & isi payload disembunyikan untuk seluruh tier guna mencegah kebocoran data sensitif. Akses inspeksi lengkap hanya dimiliki Super Admin.'
                                : 'Query parameters & payload bodies are hidden across all tiers for data privacy. Full audit inspection is restricted to Super Admin.'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
