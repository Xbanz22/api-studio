import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Sliders,
  Shield,
  ShieldAlert,
  Zap,
  RefreshCw,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  Radio,
  Clock,
  Calendar,
  Layers,
  Activity,
  UserCheck,
  Key,
  Info
} from 'lucide-react';
import {
  RateLimitManagerSettings,
  RateLimitUsageStats,
  TierRateLimitConfig,
  ApiLogItem,
  UserProfile
} from '../types';

interface RateLimitManagerProps {
  user?: UserProfile | null;
  onNotify?: (msg: string) => void;
}

const defaultRateLimits: RateLimitManagerSettings = {
  enabled: true,
  globalMultiplier: 1.0,
  emergencyThrottle: false,
  totalViolationsBlocked: 0,
  tiers: {
    Free: {
      tier: 'Free',
      requestsPerMinute: 60,
      requestsPerDay: 1000,
      requestsPerWeek: 3000,
      requestsPerMonth: 5000,
      burstLimit: 15,
      enabled: true,
      description: 'Default tier untuk developer gratis & testing.'
    },
    Pro: {
      tier: 'Pro',
      requestsPerMinute: 300,
      requestsPerDay: 5000,
      requestsPerWeek: 15000,
      requestsPerMonth: 25000,
      burstLimit: 60,
      enabled: true,
      description: 'Tier komersial untuk aplikasi aktif & startup.'
    },
    Enterprise: {
      tier: 'Enterprise',
      requestsPerMinute: -1,
      requestsPerDay: -1,
      requestsPerWeek: -1,
      requestsPerMonth: -1,
      burstLimit: -1,
      enabled: true,
      description: 'Dedicated enterprise infrastructure dengan unlimited burst & kuota.'
    }
  }
};

export const RateLimitManager: React.FC<RateLimitManagerProps> = ({ user, onNotify }) => {
  const [config, setConfig] = useState<RateLimitManagerSettings>(defaultRateLimits);
  const [stats, setStats] = useState<RateLimitUsageStats[]>([]);
  const [recentViolations, setRecentViolations] = useState<ApiLogItem[]>([]);
  const [totalBlocked, setTotalBlocked] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [resettingTier, setResettingTier] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTierView, setActiveTierView] = useState<'Free' | 'Pro' | 'Enterprise'>('Free');

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (user?.email) headers['x-user-email'] = user.email;
    if (user?.role) headers['x-user-role'] = user.role;
    if (!headers['x-user-email']) headers['x-user-email'] = 'admin@apistudio.dev';
    if (!headers['x-user-role']) headers['x-user-role'] = 'admin';
    return headers;
  };

  const fetchRateLimits = async (forceConfig = false) => {
    try {
      if (forceConfig) setLoading(true);
      const res = await fetch('/api/admin/rate-limits', {
        headers: getAuthHeaders()
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (json.success && json.data) {
          // ONLY overwrite config if forceConfig is true (initial load or manual refresh)
          if (forceConfig) {
            setConfig(json.data);
            setIsDirty(false);
          }
          if (json.stats) setStats(json.stats);
          if (json.recentViolations) setRecentViolations(json.recentViolations);
          if (typeof json.totalBlocked === 'number') setTotalBlocked(json.totalBlocked);
        }
      } else if (!res.ok) {
        // Fallback to public endpoint if admin restricted
        const pubRes = await fetch('/api/rate-limits');
        const pubType = pubRes.headers.get('content-type') || '';
        if (pubRes.ok && pubType.includes('application/json')) {
          const pubJson = await pubRes.json();
          if (pubJson.success && pubJson.tiers && forceConfig) {
            setConfig(prev => ({
              ...prev,
              enabled: pubJson.enabled ?? true,
              tiers: pubJson.tiers
            }));
            setIsDirty(false);
          }
        }
      }
    } catch (err) {
      console.warn('Notice: Failed to fetch rate limits from gateway:', err);
    } finally {
      if (forceConfig) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load forces config
    fetchRateLimits(true);
    // Background polling every 5s only updates real-time telemetry/stats
    const interval = setInterval(() => {
      fetchRateLimits(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [user?.email, user?.role]);

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/rate-limits', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(config)
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (json.success) {
          if (json.data) setConfig(json.data);
          setIsDirty(false);
          setFeedback('✅ Konfigurasi Rate Limit & Quota Gateway berhasil disimpan dan diterapkan ke seluruh server!');
          if (onNotify) onNotify('Konfigurasi Rate Limit berhasil diperbarui secara global.');
          setTimeout(() => setFeedback(null), 4000);
        } else {
          setFeedback(`❌ Gagal: ${json.error || 'Terjadi kesalahan'}`);
        }
      } else {
        setFeedback('❌ Respon server tidak berformat JSON.');
      }
    } catch (err: any) {
      setFeedback(`❌ Gagal menyimpan konfigurasi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetQuota = async (tierOrAll: 'Free' | 'Pro' | 'Enterprise' | 'all') => {
    const confirmText = tierOrAll === 'all'
      ? 'Apakah Anda yakin ingin mereset seluruh counter kuota & rate limit untuk SEMUA tier dan API Key?'
      : `Apakah Anda yakin ingin mereset counter kuota untuk seluruh pengguna di tier ${tierOrAll}?`;

    if (!window.confirm(confirmText)) return;

    try {
      setResettingTier(tierOrAll);
      const payload = tierOrAll === 'all' ? { all: true } : { tier: tierOrAll };
      const res = await fetch('/api/admin/rate-limits/reset', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (json.success) {
          setFeedback(`✅ ${json.message}`);
          fetchRateLimits();
          setTimeout(() => setFeedback(null), 4000);
        }
      }
    } catch (err: any) {
      setFeedback(`❌ Gagal mereset: ${err.message}`);
    } finally {
      setResettingTier(null);
    }
  };

  const handleApplyPreset = (presetKey: 'balanced' | 'strict' | 'high_capacity' | 'unlimited') => {
    let updatedTiers = { ...config.tiers };

    if (presetKey === 'balanced') {
      updatedTiers = {
        Free: {
          tier: 'Free',
          requestsPerMinute: 60,
          requestsPerDay: 1000,
          requestsPerWeek: 3000,
          requestsPerMonth: 5000,
          burstLimit: 15,
          enabled: true,
          description: 'Default tier untuk developer gratis & testing.'
        },
        Pro: {
          tier: 'Pro',
          requestsPerMinute: 300,
          requestsPerDay: 5000,
          requestsPerWeek: 15000,
          requestsPerMonth: 25000,
          burstLimit: 60,
          enabled: true,
          description: 'Tier komersial untuk aplikasi aktif & startup.'
        },
        Enterprise: {
          tier: 'Enterprise',
          requestsPerMinute: -1,
          requestsPerDay: -1,
          requestsPerWeek: -1,
          requestsPerMonth: -1,
          burstLimit: -1,
          enabled: true,
          description: 'Dedicated enterprise infrastructure dengan unlimited burst & kuota.'
        }
      };
    } else if (presetKey === 'strict') {
      updatedTiers = {
        Free: {
          tier: 'Free',
          requestsPerMinute: 30,
          requestsPerDay: 300,
          requestsPerWeek: 1000,
          requestsPerMonth: 2000,
          burstLimit: 8,
          enabled: true,
          description: 'Strict economy mode untuk membatasi beban server.'
        },
        Pro: {
          tier: 'Pro',
          requestsPerMinute: 150,
          requestsPerDay: 2500,
          requestsPerWeek: 8000,
          requestsPerMonth: 12000,
          burstLimit: 30,
          enabled: true,
          description: 'Pro tier konservatif dengan proteksi lonjakan ketat.'
        },
        Enterprise: {
          tier: 'Enterprise',
          requestsPerMinute: 1000,
          requestsPerDay: 20000,
          requestsPerWeek: 80000,
          requestsPerMonth: 200000,
          burstLimit: 150,
          enabled: true,
          description: 'Enterprise cap dengan batas atas terukur.'
        }
      };
    } else if (presetKey === 'high_capacity') {
      updatedTiers = {
        Free: {
          tier: 'Free',
          requestsPerMinute: 120,
          requestsPerDay: 2000,
          requestsPerWeek: 8000,
          requestsPerMonth: 15000,
          burstLimit: 30,
          enabled: true,
          description: 'High capacity free quota untuk hackathon & adopsi cepat.'
        },
        Pro: {
          tier: 'Pro',
          requestsPerMinute: 600,
          requestsPerDay: 15000,
          requestsPerWeek: 50000,
          requestsPerMonth: 100000,
          burstLimit: 120,
          enabled: true,
          description: 'Pro tier skala tinggi untuk aplikasi multi-user production.'
        },
        Enterprise: {
          tier: 'Enterprise',
          requestsPerMinute: -1,
          requestsPerDay: -1,
          requestsPerWeek: -1,
          requestsPerMonth: -1,
          burstLimit: -1,
          enabled: true,
          description: 'Uncapped cloud edge routing.'
        }
      };
    } else if (presetKey === 'unlimited') {
      updatedTiers = {
        Free: {
          tier: 'Free',
          requestsPerMinute: 500,
          requestsPerDay: 50000,
          requestsPerWeek: 200000,
          requestsPerMonth: 500000,
          burstLimit: 100,
          enabled: true,
          description: 'Open Beta Promo (Sangat Longgar).'
        },
        Pro: {
          tier: 'Pro',
          requestsPerMinute: -1,
          requestsPerDay: -1,
          requestsPerWeek: -1,
          requestsPerMonth: -1,
          burstLimit: -1,
          enabled: true,
          description: 'Unlimited Pro Access.'
        },
        Enterprise: {
          tier: 'Enterprise',
          requestsPerMinute: -1,
          requestsPerDay: -1,
          requestsPerWeek: -1,
          requestsPerMonth: -1,
          burstLimit: -1,
          enabled: true,
          description: 'Unlimited VIP Edge Compute.'
        }
      };
    }

    setConfig(prev => ({
      ...prev,
      tiers: updatedTiers
    }));
    setIsDirty(true);
    setFeedback(`⚡ Preset '${presetKey.toUpperCase()}' telah dimuat ke form. Klik 'Simpan Konfigurasi' untuk menerapkan.`);
  };

  const updateTierField = (
    tier: 'Free' | 'Pro' | 'Enterprise',
    field: keyof TierRateLimitConfig,
    value: any
  ) => {
    setConfig(prev => ({
      ...prev,
      tiers: {
        ...prev.tiers,
        [tier]: {
          ...prev.tiers[tier],
          [field]: value
        }
      }
    }));
    setIsDirty(true);
  };

  const getTierStats = (tier: string) => {
    return stats.find(s => s.tier === tier) || {
      tier,
      activeUsers: 0,
      activeKeys: 0,
      requestsToday: 0,
      requestsThisWeek: 0,
      requestsThisMonth: 0,
      minuteLimit: 60,
      dayLimit: 1000,
      weekLimit: 3000,
      monthLimit: 5000,
      dayUtilizationPercent: 0,
      monthUtilizationPercent: 0,
      violationsBlocked: 0
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Feedback */}
      {feedback && (
        <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/50 p-4 text-xs font-semibold text-indigo-300 flex items-center justify-between shadow-lg shadow-indigo-950/30">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Header & Gateway Master Status */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 text-white shadow-lg shadow-indigo-500/20">
                <Gauge className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Rate Limit & Quota Manager</span>
                  <span className="rounded-full bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-0.5 text-[10px] font-mono text-indigo-300">
                    API Gateway Level
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Atur alokasi kuota request spesifik (Per Menit, Hari, Minggu, dan Bulan) untuk setiap Tier dan terapkan penegakan secara global.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isDirty && (
              <span className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 animate-pulse">
                <span>⚠️ Ada perubahan belum disimpan</span>
              </span>
            )}

            <button
              onClick={() => fetchRateLimits(true)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
              title="Muat Ulang Data dari Server"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => handleResetQuota('all')}
              disabled={resettingTier === 'all'}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 hover:text-rose-200 transition"
              title="Reset seluruh counter traffic"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${resettingTier === 'all' ? 'animate-spin' : ''}`} />
              <span>Reset Semua Kuota</span>
            </button>

            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-50 ${
                isDirty
                  ? 'bg-gradient-to-r from-amber-500 to-indigo-600 shadow-indigo-600/40 ring-2 ring-amber-400/50 hover:from-amber-400 hover:to-indigo-500'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500'
              }`}
            >
              <Check className="h-4 w-4" />
              <span>{saving ? 'Menerapkan...' : isDirty ? 'Simpan Perubahan Sekarang' : 'Simpan Konfigurasi'}</span>
            </button>
          </div>
        </div>

        {/* Global Gateway Status & Traffic Throttle Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Master Gateway Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${config.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {config.enabled ? <Shield className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">API Gateway Enforcement</p>
                <p className="text-[11px] text-slate-400">
                  {config.enabled ? '🟢 Penegakan Aktif & Membatasi Traffic' : '🔴 Bypass (Semua Request Lolos)'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enabled ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Emergency Throttling (Cut Capacity 50%) */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${config.emergencyThrottle ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Emergency Traffic Throttle</p>
                <p className="text-[11px] text-slate-400">
                  {config.emergencyThrottle ? '⚠️ Batas diturunkan 50% (Defensif)' : 'Normal Capacity (100%)'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, emergencyThrottle: !prev.emergencyThrottle }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.emergencyThrottle ? 'bg-amber-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.emergencyThrottle ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Global Multiplier Selector */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Global Multiplier</p>
                <p className="text-[11px] text-slate-400">Skala kapasitas: {config.globalMultiplier}x</p>
              </div>
            </div>
            <select
              value={config.globalMultiplier}
              onChange={(e) => setConfig(prev => ({ ...prev, globalMultiplier: parseFloat(e.target.value) || 1.0 }))}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-bold text-indigo-300 focus:border-indigo-500 focus:outline-none"
            >
              <option value="0.25">0.25x (Ketertatan Ekstrem)</option>
              <option value="0.5">0.5x (Hemat Server)</option>
              <option value="0.75">0.75x (Konservatif)</option>
              <option value="1.0">1.0x (Normal Standar)</option>
              <option value="1.5">1.5x (Longgar)</option>
              <option value="2.0">2.0x (Kapasitas Ganda)</option>
            </select>
          </div>
        </div>

        {/* Quick Strategy Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Preset Cepat:</span>
          </span>
          <button
            onClick={() => handleApplyPreset('balanced')}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 font-medium hover:border-indigo-500/50 hover:text-white transition"
          >
            ⚖️ Balanced Standard
          </button>
          <button
            onClick={() => handleApplyPreset('strict')}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 font-medium hover:border-amber-500/50 hover:text-white transition"
          >
            🛡️ Strict Economy
          </button>
          <button
            onClick={() => handleApplyPreset('high_capacity')}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 font-medium hover:border-emerald-500/50 hover:text-white transition"
          >
            🚀 High Capacity Dev
          </button>
          <button
            onClick={() => handleApplyPreset('unlimited')}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 font-medium hover:border-purple-500/50 hover:text-white transition"
          >
            🎁 Open Beta Promo
          </button>
        </div>
      </div>

      {/* KPI Overview Cards per Tier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['Free', 'Pro', 'Enterprise'] as const).map((tierKey) => {
          const tierStat = getTierStats(tierKey);
          const tierCfg = config.tiers[tierKey] || defaultRateLimits.tiers[tierKey];
          const isSelected = activeTierView === tierKey;

          const badgeStyles = {
            Free: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400',
            Pro: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-400',
            Enterprise: 'border-amber-500/30 bg-amber-950/20 text-amber-400'
          }[tierKey];

          return (
            <div
              key={tierKey}
              onClick={() => setActiveTierView(tierKey)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? 'border-indigo-500/60 bg-slate-900/90 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold font-mono ${badgeStyles}`}>
                  {tierKey.toUpperCase()} TIER
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tierCfg.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {tierCfg.enabled ? 'ENFORCING' : 'DISABLED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    <span>Pengguna</span>
                  </p>
                  <p className="text-lg font-bold text-white">{tierStat.activeUsers} <span className="text-xs text-slate-500 font-normal">akun</span></p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    <span>API Keys</span>
                  </p>
                  <p className="text-lg font-bold text-white">{tierStat.activeKeys} <span className="text-xs text-slate-500 font-normal">keys</span></p>
                </div>
              </div>

              {/* Usage Progress */}
              <div className="space-y-2 text-[11px] border-t border-slate-800/80 pt-3">
                <div className="flex justify-between text-slate-300">
                  <span>Traffic Hari Ini:</span>
                  <span className="font-mono font-bold text-white">
                    {tierStat.requestsToday.toLocaleString()} / {tierCfg.requestsPerDay === -1 ? '∞' : tierCfg.requestsPerDay.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      tierStat.dayUtilizationPercent > 85
                        ? 'bg-rose-500'
                        : tierStat.dayUtilizationPercent > 60
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${tierCfg.requestsPerDay === -1 ? 100 : Math.min(100, Math.max(3, tierStat.dayUtilizationPercent))}%` }}
                  />
                </div>

                <div className="flex justify-between text-slate-400 text-[10px] pt-1">
                  <span>Bulan Ini: <b>{tierStat.requestsThisMonth.toLocaleString()}</b> req</span>
                  <span>Limit: <b>{tierCfg.requestsPerMinute === -1 ? 'Unlimited' : `${tierCfg.requestsPerMinute} /min`}</b></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier Quota Form Configurator Tabs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span>Konfigurasi Kuota & Batas Permintaan Tier: <span className="text-indigo-400">{activeTierView}</span></span>
            </h3>
            <p className="text-xs text-slate-400">
              Sesuaikan limit rate per menit, hari, minggu, dan bulan untuk tier ini. Nilai <code className="text-indigo-300">-1</code> berarti Unlimited (Tanpa Batas).
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {(['Free', 'Pro', 'Enterprise'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTierView(t)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  activeTierView === t
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t} Tier
              </button>
            ))}
          </div>
        </div>

        {/* Selected Tier Editor Form */}
        {(() => {
          const tConfig = config.tiers[activeTierView] || defaultRateLimits.tiers[activeTierView];

          return (
            <div className="space-y-6">
              {/* Tier Enforcement Switch & Description */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Status Penegakan Tier</p>
                    <p className="text-[11px] text-slate-400">
                      {tConfig.enabled ? '✅ Rate limit ditegakkan' : '⛔ Tier ini dilepas (bebas limit)'}
                    </p>
                  </div>
                  <button
                    onClick={() => updateTierField(activeTierView, 'enabled', !tConfig.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      tConfig.enabled ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="md:col-span-2 p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Deskripsi / Kebijakan Tier</label>
                  <input
                    type="text"
                    value={tConfig.description || ''}
                    onChange={(e) => updateTierField(activeTierView, 'description', e.target.value)}
                    placeholder="Contoh: Tier untuk developer gratis dengan alokasi standar..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Specific Limit Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Requests Per Minute (RPM) */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Per Menit (RPM)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => updateTierField(activeTierView, 'requestsPerMinute', tConfig.requestsPerMinute === -1 ? 60 : -1)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold transition ${
                        tConfig.requestsPerMinute === -1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tConfig.requestsPerMinute === -1 ? 'UNLIMITED' : 'LIMITED'}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      disabled={tConfig.requestsPerMinute === -1}
                      value={tConfig.requestsPerMinute === -1 ? '' : tConfig.requestsPerMinute}
                      onChange={(e) => updateTierField(activeTierView, 'requestsPerMinute', parseInt(e.target.value, 10) || 1)}
                      placeholder="Unlimited (-1)"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-mono font-bold text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">req/min</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Membatasi frekuensi burst per menit agar server tidak overload.</p>
                </div>

                {/* 2. Requests Per Day (RPD) */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Per Hari (24 Jam)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => updateTierField(activeTierView, 'requestsPerDay', tConfig.requestsPerDay === -1 ? 1000 : -1)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold transition ${
                        tConfig.requestsPerDay === -1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tConfig.requestsPerDay === -1 ? 'UNLIMITED' : 'LIMITED'}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      disabled={tConfig.requestsPerDay === -1}
                      value={tConfig.requestsPerDay === -1 ? '' : tConfig.requestsPerDay}
                      onChange={(e) => updateTierField(activeTierView, 'requestsPerDay', parseInt(e.target.value, 10) || 1)}
                      placeholder="Unlimited (-1)"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-mono font-bold text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">req/hari</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Kuota sliding window 24 jam per API Key / Pengguna.</p>
                </div>

                {/* 3. Requests Per Week (RPW) */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-purple-400" />
                      <span>Per Minggu (7 Hari)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => updateTierField(activeTierView, 'requestsPerWeek', tConfig.requestsPerWeek === -1 ? 5000 : -1)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold transition ${
                        tConfig.requestsPerWeek === -1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tConfig.requestsPerWeek === -1 ? 'UNLIMITED' : 'LIMITED'}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      disabled={tConfig.requestsPerWeek === -1}
                      value={tConfig.requestsPerWeek === -1 ? '' : tConfig.requestsPerWeek}
                      onChange={(e) => updateTierField(activeTierView, 'requestsPerWeek', parseInt(e.target.value, 10) || 1)}
                      placeholder="Unlimited (-1)"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-mono font-bold text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">req/minggu</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Mencegah akumulasi traffic berlebih dalam 1 siklus mingguan.</p>
                </div>

                {/* 4. Requests Per Month (RPMo) */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span>Per Bulan (30 Hari)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => updateTierField(activeTierView, 'requestsPerMonth', tConfig.requestsPerMonth === -1 ? 10000 : -1)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold transition ${
                        tConfig.requestsPerMonth === -1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tConfig.requestsPerMonth === -1 ? 'UNLIMITED' : 'LIMITED'}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      disabled={tConfig.requestsPerMonth === -1}
                      value={tConfig.requestsPerMonth === -1 ? '' : tConfig.requestsPerMonth}
                      onChange={(e) => updateTierField(activeTierView, 'requestsPerMonth', parseInt(e.target.value, 10) || 1)}
                      placeholder="Unlimited (-1)"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-mono font-bold text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">req/bulan</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Batas total kuota billing & langganan bulanan pengguna.</p>
                </div>
              </div>

              {/* Extra Burst Limit & Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Burst Allowance (5 Detik):</span>
                    <input
                      type="number"
                      value={tConfig.burstLimit === -1 ? '' : tConfig.burstLimit}
                      onChange={(e) => updateTierField(activeTierView, 'burstLimit', parseInt(e.target.value, 10) || -1)}
                      placeholder="Unlimited (-1)"
                      className="w-28 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-mono font-bold text-indigo-300 focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500 font-mono">req/5s</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResetQuota(activeTierView)}
                    disabled={resettingTier === activeTierView}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition"
                  >
                    <RotateCcw className={`h-3.5 w-3.5 ${resettingTier === activeTierView ? 'animate-spin' : ''}`} />
                    <span>Reset Counter Tier {activeTierView}</span>
                  </button>

                  <button
                    onClick={handleSaveConfig}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{saving ? 'Menyimpan...' : 'Terapkan Perubahan'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Live Rate Limit Violations (HTTP 429 Stream) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="h-4 w-4 text-rose-400 animate-pulse" />
              <span>Live Rate Limit Violations (HTTP 429 Stream)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pantauan otomatis request yang diblokir oleh Gateway karena melewati ambang batas kuota atau rate limit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-mono font-bold text-rose-300">
              Total Diblokir: {totalBlocked.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 font-mono text-[11px]">
          {recentViolations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
              <Check className="h-6 w-6 text-emerald-500/50" />
              <span>Belum ada pelanggaran rate limit yang tercatat. Seluruh traffic berjalan lancar dalam kuota.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentViolations.map((l) => (
                <div key={l.id} className="flex flex-wrap items-center justify-between p-2.5 hover:bg-slate-900/50 gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      HTTP {l.status}
                    </span>
                    <span className="font-bold text-slate-300">{l.method}</span>
                    <span className="truncate text-slate-400 max-w-xs">{l.url}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 text-[10px]">
                    {l.ip && <span className="text-slate-400">IP: {l.ip}</span>}
                    <span className="text-slate-400">{new Date(l.timestamp).toLocaleTimeString()}</span>
                    <span className="rounded bg-rose-950/40 text-rose-300 px-1.5 py-0.5 border border-rose-500/20">
                      Rate Limit Blocked
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
