import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Activity, CheckCircle2, Clock, Zap, BarChart2 } from 'lucide-react';
import { ApiLogItem, ServerStats } from '../types';

interface TrafficDiagramProps {
  stats: ServerStats | null;
  logs: ApiLogItem[];
  lang: 'id' | 'en';
}

const CustomXTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor="middle"
        className="text-[11px] font-bold fill-slate-700 dark:fill-slate-300"
      >
        {payload.value}
      </text>
    </g>
  );
};

const CustomYTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-6}
        y={4}
        textAnchor="end"
        className="text-[11px] font-bold fill-slate-700 dark:fill-slate-300"
      >
        {payload.value}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[160px]">
        <p className="font-extrabold text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3 font-medium">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                {entry.name === 'success' ? 'Sukses (2xx):' : 'Error (4xx/5xx):'}
              </span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">
              {entry.value} req
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const TrafficDiagram: React.FC<TrafficDiagramProps> = ({ stats, logs, lang }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Generate dataset based on logs and simulated baseline
  const dataPointsCount = timeRange === '24h' ? 12 : timeRange === '7d' ? 7 : 30;
  
  const chartData = Array.from({ length: dataPointsCount }, (_, i) => {
    const d = new Date();
    if (timeRange === '24h') {
      d.setHours(d.getHours() - (dataPointsCount - 1 - i) * 2);
    } else {
      d.setDate(d.getDate() - (dataPointsCount - 1 - i));
    }

    const timeLabel = timeRange === '24h'
      ? `${String(d.getHours()).padStart(2, '0')}:00`
      : `${d.getDate()}/${d.getMonth() + 1}`;

    const baseReqs = Math.floor(Math.sin(i * 0.6) * 100 + 220 + (i * 8));
    const logMatchCount = logs.filter(l => {
      const logTime = new Date(l.timestamp);
      return timeRange === '24h' 
        ? Math.abs(logTime.getHours() - d.getHours()) <= 1
        : logTime.getDate() === d.getDate();
    }).length;

    const totalRequests = logMatchCount > 0 ? logMatchCount * 6 + baseReqs : baseReqs;
    const errors = Math.floor(totalRequests * (0.015 + (i % 4 === 0 ? 0.025 : 0.005)));
    const success = totalRequests - errors;
    const latency = Math.floor(16 + Math.sin(i * 0.9) * 6 + (i % 2 === 0 ? 4 : 0));

    return {
      time: timeLabel,
      total: totalRequests,
      success,
      errors,
      latency
    };
  });

  const totalReqsSum = chartData.reduce((acc, curr) => acc + curr.total, 0);
  const totalErrorsSum = chartData.reduce((acc, curr) => acc + curr.errors, 0);
  const avgLatency = Math.round(chartData.reduce((acc, curr) => acc + curr.latency, 0) / chartData.length);
  const successPercentage = ((1 - (totalErrorsSum / (totalReqsSum || 1))) * 100).toFixed(1);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Top Header & Range Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{lang === 'id' ? 'Diagram Trafik & Analytics Live Server' : 'Live Server Traffic & Analytics Diagram'}</span>
              <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {lang === 'id'
                ? 'Visualisasi volume request HTTP (2xx Sukses vs 4xx/5xx Error) dan respons latensi server.'
                : 'Visualization of HTTP request volume (2xx Success vs 4xx/5xx Error) and latency.'}
            </p>
          </div>
        </div>

        {/* Range Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-1">
          {(['24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTimeRange(r)}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                timeRange === r
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r === '24h' ? '24 Jam' : r === '7d' ? '7 Hari' : '30 Hari'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Quick Stats Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
            <span>Total Requests</span>
            <Activity className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
            {totalReqsSum.toLocaleString()}
          </div>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
            {timeRange === '24h' ? 'Volume 24 jam terakhir' : `Volume ${timeRange}`}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
            <span>Tingkat Keberhasilan</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {successPercentage}%
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
            {totalErrorsSum} HTTP errors
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
            <span>Rata-rata Latensi</span>
            <Clock className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-lg font-black text-amber-700 dark:text-amber-400 font-mono">
            {avgLatency} ms
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
            ⚡ Ultra Fast Response
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
            <span>Status Firewall</span>
            <Zap className="h-3.5 w-3.5 text-cyan-500" />
          </div>
          <div className="text-lg font-black text-cyan-700 dark:text-cyan-400 font-mono">
            NORMAL
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400">
            Anti-DDoS Guard Active
          </div>
        </div>
      </div>

      {/* Recharts Area Chart Container */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/50 p-4 pt-5">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100, 116, 139, 0.2)" />

              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={<CustomXTick />}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={<CustomYTick />}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="success"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSuccess)"
              />

              <Area
                type="monotone"
                dataKey="errors"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorError)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3 border-t border-slate-200 dark:border-slate-800/80 pt-3 text-xs text-slate-800 dark:text-slate-200 font-bold">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-indigo-500 inline-block shadow-xs" />
            <span>HTTP 2xx (Sukses)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500 inline-block shadow-xs" />
            <span>HTTP 4xx/5xx (Error)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
