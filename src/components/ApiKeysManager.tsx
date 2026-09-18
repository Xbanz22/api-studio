import React, { useState, useEffect } from 'react';
import {
  Key,
  Copy,
  Check,
  Trash2,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  Play,
  RefreshCw,
  Activity,
  CheckCircle2,
  Info,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  Globe,
  Network,
  GlobeLock,
  X,
  Crown,
  Edit3,
  Save,
  Plus,
  Award,
  Star,
  Cpu,
  Layers
} from 'lucide-react';
import { ApiKeyItem, UserProfile } from '../types';
import { PricingModal } from './PricingModal';

const originalFetch = window.fetch;
const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let url = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
  const savedUserStr = localStorage.getItem('api_studio_current_user');
  if (savedUserStr && url.startsWith('/api/')) {
    try {
      const user = JSON.parse(savedUserStr);
      if (user && user.email) {
        const customInit = init ? { ...init } : {};
        const headers = new Headers(customInit.headers || {});
        if (!headers.has('x-user-email')) {
          headers.set('x-user-email', user.email);
        }
        if (!headers.has('x-user-role')) {
          headers.set('x-user-role', user.role || 'user');
        }
        customInit.headers = headers;
        return originalFetch(input, customInit);
      }
    } catch (e) {
      console.error(e);
    }
  }
  return originalFetch(input, init);
};

interface ApiKeysManagerProps {
  apiKeys: ApiKeyItem[];
  currentUser?: UserProfile | null;
  selectedApiKey?: string;
  onRefreshKeys: () => void;
  onSelectKeyForTesting: (key: string) => void;
  onSwitchToAdminTab?: () => void;
  onUserTierUpdated?: (newTier: 'Free' | 'Pro' | 'Enterprise') => void;
  lang: 'id' | 'en';
}

export const ApiKeysManager: React.FC<ApiKeysManagerProps> = ({
  apiKeys,
  currentUser,
  selectedApiKey,
  onRefreshKeys,
  onSelectKeyForTesting,
  onSwitchToAdminTab,
  onUserTierUpdated,
  lang,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showKeyToken, setShowKeyToken] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  // Key Revocation State
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKeyItem | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Inline Key Name Rename State
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>('');
  const [isSavingName, setIsSavingName] = useState<boolean>(false);

  // Multi-key Creation Modal State (for Pro & Enterprise)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createKeyNameInput, setCreateKeyNameInput] = useState<string>('');
  const [isCreatingKey, setIsCreatingKey] = useState<boolean>(false);

  // Security Whitelist Modal State (IP & Domain Origin Guard)
  const [securityModalKey, setSecurityModalKey] = useState<ApiKeyItem | null>(null);
  const [allowedIpsInput, setAllowedIpsInput] = useState<string>('');
  const [allowedOriginsInput, setAllowedOriginsInput] = useState<string>('');
  const [isSavingSecurity, setIsSavingSecurity] = useState<boolean>(false);

  const handleOpenSecurityModal = (keyItem: ApiKeyItem) => {
    setSecurityModalKey(keyItem);
    setAllowedIpsInput((keyItem.allowedIps || []).join(', '));
    setAllowedOriginsInput((keyItem.allowedOrigins || []).join(', '));
  };

  const handleSaveSecurityRules = async () => {
    if (!securityModalKey) return;
    setIsSavingSecurity(true);
    try {
      const ips = allowedIpsInput.split(',').map(s => s.trim()).filter(Boolean);
      const origins = allowedOriginsInput.split(',').map(s => s.trim()).filter(Boolean);

      const res = await fetch('/api/keys/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: securityModalKey.key,
          allowedIps: ips,
          allowedOrigins: origins
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(
          lang === 'id'
            ? 'Aturan IP Whitelist & Domain Origin berhasil disimpan!'
            : 'IP Whitelist & Domain Origin security rules saved!'
        );
        setSecurityModalKey(null);
        onRefreshKeys();
        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err: any) {
      alert('Gagal menyimpan aturan keamanan: ' + err.message);
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const userTier = currentUser?.tier || 'Free';
  const isFreeTierUser = !isAdmin && userTier === 'Free';

  // Format key name dynamically according to tier (cleans up legacy 'Free Key' when upgraded)
  const formatKeyDisplayName = (keyItem?: ApiKeyItem) => {
    if (!keyItem) return `${currentUser?.name || 'Developer'} ${userTier} Key`;
    let name = keyItem.name || '';
    if (userTier === 'Pro' && (name.includes('Free Key') || name.toLowerCase().includes('free key'))) {
      name = name.replace(/Free Key/gi, 'Pro Key');
    } else if (userTier === 'Enterprise' && (name.includes('Free Key') || name.includes('Pro Key'))) {
      name = name.replace(/Free Key/gi, 'Enterprise Key').replace(/Pro Key/gi, 'Enterprise Key');
    }
    return name;
  };

  const handleStartRename = (keyItem: ApiKeyItem) => {
    setEditingKey(keyItem.key);
    setEditNameValue(formatKeyDisplayName(keyItem));
  };

  const handleSaveRename = async (keyString: string) => {
    if (!editNameValue.trim()) return;
    setIsSavingName(true);
    try {
      const res = await fetch(`/api/keys/${encodeURIComponent(keyString)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editNameValue.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(lang === 'id' ? 'Nama API Key berhasil diperbarui!' : 'API Key name updated!');
        setEditingKey(null);
        onRefreshKeys();
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        alert(data.error || 'Gagal mengubah nama key.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCreateNewUserKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createKeyNameInput.trim()) return;

    if (userTier === 'Pro' && userKeys.length >= 5) {
      alert(lang === 'id' ? 'Batas maksimal 5 API Keys untuk paket Pro telah tercapai.' : 'Pro plan maximum limit of 5 API keys reached.');
      return;
    }

    setIsCreatingKey(true);
    try {
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || 'developer@company.io',
          'x-user-role': currentUser?.role || 'user'
        },
        body: JSON.stringify({
          name: createKeyNameInput.trim(),
          tier: userTier,
          ownerEmail: currentUser?.email
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFeedbackMsg(lang === 'id' ? 'Kunci API baru berhasil dibuat!' : 'New API Key generated!');
        setCreateKeyNameInput('');
        setIsCreateModalOpen(false);
        onSelectKeyForTesting(data.data.key);
        await onRefreshKeys();
        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        alert(data.error || 'Gagal membuat kunci API.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsCreatingKey(false);
    }
  };

  // Find all keys belonging to the current user - strictly matching ownerEmail
  const userKeys = apiKeys.filter(
    (k) => k.ownerEmail && currentUser?.email && k.ownerEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  // Find the primary user's active key - strictly confined to user's keys to prevent Admin Key leak
  const activeUserKey = userKeys.find(
    (k) => k.key === selectedApiKey
  ) || userKeys[0];

  // Auto poll keys periodically for live counts
  useEffect(() => {
    onRefreshKeys();
    const interval = setInterval(() => {
      onRefreshKeys();
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshKeys();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleRegenerateKey = async () => {
    if (!activeUserKey) {
      // If no key exists yet, generate initial key
      setIsRegenerating(true);
      try {
        const res = await fetch('/api/keys/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser?.email || 'developer@company.io',
            'x-user-role': currentUser?.role || 'user'
          },
          body: JSON.stringify({
            name: `${currentUser?.name || 'Developer'}'s API Key`,
            tier: userTier,
            ownerEmail: currentUser?.email || 'developer@company.io'
          })
        });
        const data = await res.json();
        if (data.success) {
          setFeedbackMsg(
            lang === 'id'
              ? 'API Key baru Anda berhasil diaktifkan!'
              : 'New API Key generated successfully!'
          );
          onRefreshKeys();
          setTimeout(() => setFeedbackMsg(null), 3500);
        }
      } catch (err: any) {
        setFeedbackMsg('Error: ' + err.message);
      } finally {
        setIsRegenerating(false);
      }
      return;
    }

    // Strict rotation: automatically purges old key on backend
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/keys/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || 'developer@company.io',
          'x-user-role': currentUser?.role || 'user'
        },
        body: JSON.stringify({
          oldKey: activeUserKey.key,
          ownerEmail: currentUser?.email || 'developer@company.io',
          name: activeUserKey.name || `${currentUser?.name || 'Developer'}'s API Key`
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(
          lang === 'id'
            ? 'API Key berhasil di-regenerate! Kunci lama telah otomatis dihapus dari database.'
            : 'API Key regenerated! Old key was permanently purged from database.'
        );
        onRefreshKeys();
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (err: any) {
      setFeedbackMsg('Error: ' + err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const confirmRevokeKey = async () => {
    if (!keyToRevoke) return;
    setIsRevoking(true);

    try {
      const res = await fetch(`/api/keys/${encodeURIComponent(keyToRevoke.key)}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        setFeedbackMsg(
          lang === 'id'
            ? `API Key '${keyToRevoke.name}' berhasil dicabut & dihapus.`
            : `API Key '${keyToRevoke.name}' revoked & purged.`
        );
        setKeyToRevoke(null);
        onRefreshKeys();
        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        setFeedbackMsg(data.error || 'Gagal mencabut API Key.');
      }
    } catch (err: any) {
      setFeedbackMsg('Gagal mencabut API Key: ' + err.message);
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 14) return '••••••••••••••••';
    return key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 4);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base sm:text-xl font-bold text-white tracking-tight">
                  {lang === 'id' ? 'Kunci API & Kredensial Pengembang' : 'API Key & Developer Credentials'}
                </h1>
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Realtime Sync</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                {lang === 'id'
                  ? 'Gunakan API Key ini untuk mengakses seluruh endpoint AI Gemini, Database, dan Utility.'
                  : 'Use this API Key to authenticate all AI Gemini, Database, and Utility endpoints.'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{lang === 'id' ? 'Refresh Status' : 'Refresh'}</span>
            </button>
            <button
              onClick={() => setPricingModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
              <span>{lang === 'id' ? 'Lihat Paket & Kuota' : 'View Plans'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. NON-ADMIN (DEVELOPER / FREE / PRO / ENTERPRISE USER) DEDICATED VIEW */}
      {/* ========================================================================= */}
      {!isAdmin ? (
        <div className="space-y-6">
          
          {/* Active Key Container Card - Dynamically styled for Tier Free / Pro / Enterprise */}
          <div
            className={`rounded-2xl relative overflow-hidden p-5 sm:p-6 space-y-5 transition-all duration-300 ${
              userTier === 'Enterprise'
                ? 'border border-amber-500/60 bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 shadow-2xl shadow-amber-500/20'
                : userTier === 'Pro'
                ? 'border border-purple-500/50 bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 shadow-xl shadow-purple-500/15'
                : 'border border-slate-800 bg-slate-900/60 backdrop-blur'
            }`}
          >
            {/* Top Animated Bar for Pro & Enterprise */}
            {userTier === 'Enterprise' && (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 animate-pulse" />
            )}
            {userTier === 'Pro' && (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 animate-pulse" />
            )}

            {/* Header: Name, Rename Action, & Tier Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    userTier === 'Enterprise'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-inner'
                      : userTier === 'Pro'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-inner'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}
                >
                  {userTier === 'Enterprise' ? (
                    <Crown className="h-5 w-5 text-amber-400" />
                  ) : userTier === 'Pro' ? (
                    <Sparkles className="h-5 w-5 text-purple-400" />
                  ) : (
                    <Shield className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Inline Name Edit Mode */}
                    {editingKey === activeUserKey?.key ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          className="rounded-lg border border-indigo-500/60 bg-slate-950 px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          placeholder="Nama API Key..."
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => activeUserKey && handleSaveRename(activeUserKey.key)}
                          disabled={isSavingName}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 transition"
                        >
                          <Save className="h-3 w-3" />
                          <span>Simpan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingKey(null)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                          <span>{formatKeyDisplayName(activeUserKey)}</span>
                          <button
                            type="button"
                            onClick={() => activeUserKey && handleStartRename(activeUserKey)}
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-md transition"
                            title="Ubah nama Kunci API ini"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
                          </button>
                        </h2>
                      </>
                    )}

                    {/* Distinct Tier Badge */}
                    {userTier === 'Enterprise' ? (
                      <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 px-3 py-0.5 text-xs font-black shadow-lg shadow-amber-500/40 border border-amber-300">
                        <Crown className="h-3.5 w-3.5" /> ENTERPRISE VIP
                      </span>
                    ) : userTier === 'Pro' ? (
                      <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white px-3 py-0.5 text-xs font-extrabold shadow-md shadow-purple-500/30 border border-purple-400/50">
                        <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" /> PRO DEVELOPER
                      </span>
                    ) : (
                      <span className="rounded-full bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300">
                        Tier Free
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'id' ? 'Kunci aktif utama yang terikat dengan akun Anda.' : 'Primary active key assigned to your account.'}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Aktif & Terlindungi</span>
                </span>
              </div>
            </div>

            {/* Premium SLA Banner Indicator for Pro & Enterprise */}
            {userTier === 'Enterprise' && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-3 flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Crown className="h-4 w-4 text-amber-400 animate-bounce" />
                  <span>Dedicated Isolated Server Node • 99.99% Enterprise SLA Uptime • 1,000 req/min Rate Limit</span>
                </div>
                <span className="rounded bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 text-[10px] text-amber-200 font-mono">Dedicated Server Cluster</span>
              </div>
            )}

            {userTier === 'Pro' && (
              <div className="rounded-xl border border-purple-500/40 bg-purple-950/40 p-3 flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 text-purple-200 font-bold">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>High Priority Edge Routing • 99.9% SLA Guarantee • 300 req/min Burst Limit</span>
                </div>
                <span className="rounded bg-purple-500/20 border border-purple-400/30 px-2 py-0.5 text-[10px] text-purple-200 font-mono">Priority CDN Cluster</span>
              </div>
            )}

            {/* Token String Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">API Key Secret Token</span>
                <span className="text-[11px] font-mono text-slate-500">Header: x-api-key</span>
              </div>
              
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-xs text-slate-200">
                <Key className={`h-4 w-4 shrink-0 ${userTier === 'Enterprise' ? 'text-amber-400' : userTier === 'Pro' ? 'text-purple-400' : 'text-indigo-400'}`} />
                <div className="flex-1 overflow-x-auto select-all">
                  {showKeyToken
                    ? activeUserKey?.key || 'api_free_example_key'
                    : maskKey(activeUserKey?.key || 'api_free_example_key')}
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowKeyToken(!showKeyToken)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                  title={showKeyToken ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showKeyToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => activeUserKey && handleCopy(activeUserKey.key)}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                >
                  {copiedKey === activeUserKey?.key ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quota & Limits Metric Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span>Rate Limit</span>
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {activeUserKey?.rateLimit === -1 ? 'Unlimited' : `${activeUserKey?.rateLimit || 60} req/min`}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${userTier === 'Enterprise' ? 'bg-amber-400' : userTier === 'Pro' ? 'bg-purple-500' : 'bg-amber-500'}`} style={{ width: '100%' }} />
                </div>
                <p className="text-[11px] text-slate-500">Maksimal request per 60 detik</p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Pemakaian Kuota Bulanan</span>
                  </span>
                  <span className="font-mono font-bold text-indigo-300">
                    {activeUserKey?.requestCount || 0} / {activeUserKey?.totalLimit === -1 ? 'Unlimited' : (activeUserKey?.totalLimit || 5000).toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{
                      width: activeUserKey?.totalLimit === -1 ? '15%' : `${Math.min(
                        100,
                        Math.round(((activeUserKey?.requestCount || 0) / (activeUserKey?.totalLimit || 5000)) * 100)
                      )}%`
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {activeUserKey?.totalLimit === -1
                    ? 'Tanpa Batas Kuota Bulanan'
                    : `${Math.max(0, (activeUserKey?.totalLimit || 5000) - (activeUserKey?.requestCount || 0)).toLocaleString()} request tersisa`}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    <span>DDoS Protection</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">Active</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                </div>
                <p className="text-[11px] text-slate-500">Token-bucket per IP & Token</p>
              </div>
            </div>

            {/* IP Whitelist & Domain Origin Guard Card */}
            <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-indigo-950/30 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <GlobeLock className="h-4 w-4 text-cyan-400" />
                    <span>Keamanan Akses: IP Whitelist & CORS Domain Guard</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Kunci API Key agar hanya dapat dipanggil dari IP Server atau Domain Origin tertentu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => activeUserKey && handleOpenSecurityModal(activeUserKey)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition shrink-0"
                >
                  <Network className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{lang === 'id' ? 'Atur IP & Domain Whitelist' : 'Configure IP & Domain Guard'}</span>
                </button>
              </div>

              {/* Status Badges Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Network className="h-3.5 w-3.5 text-slate-400" />
                    <span>IP Whitelist:</span>
                  </span>
                  {activeUserKey?.allowedIps && activeUserKey.allowedIps.length > 0 ? (
                    <span className="font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded text-[11px] truncate max-w-[180px]">
                      {activeUserKey.allowedIps.join(', ')}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic text-[11px]">Semua IP diizinkan (*)</span>
                  )}
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <span>Allowed Origins:</span>
                  </span>
                  {activeUserKey?.allowedOrigins && activeUserKey.allowedOrigins.length > 0 ? (
                    <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px] truncate max-w-[180px]">
                      {activeUserKey.allowedOrigins.join(', ')}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic text-[11px]">Semua Domain diizinkan (*)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Safe Key Rotation / Regenerate Button */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                  <span>Regenerate API Key (Rotasi Kunci Aman)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Jika kunci Anda bocor atau ingin diganti, lakukan rotasi. Kunci lama akan otomatis dihapus permanen dari database.
                </p>
              </div>

              <button
                onClick={handleRegenerateKey}
                disabled={isRegenerating}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/30 hover:bg-amber-700 disabled:opacity-50 transition shrink-0"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>{isRegenerating ? 'Memproses...' : 'Regenerate API Key'}</span>
              </button>
            </div>

          </div>

          {/* Multi-Key Management Section for Pro & Enterprise Users */}
          {(userTier === 'Pro' || userTier === 'Enterprise') && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">
                    Daftar API Keys Anda ({userKeys.length} {userTier === 'Pro' ? '/ 5' : 'Kunci Active'})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-500 shadow-md shadow-purple-600/30 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Buat API Key Baru</span>
                </button>
              </div>

              <div className="space-y-2">
                {userKeys.map((k) => (
                  <div
                    key={k.key}
                    className={`rounded-xl border p-3.5 flex flex-wrap items-center justify-between gap-3 transition ${
                      k.key === activeUserKey?.key
                        ? 'border-purple-500/50 bg-purple-950/20 text-white'
                        : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Key className="h-4 w-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 font-bold text-xs text-white">
                          <span>{formatKeyDisplayName(k)}</span>
                          {k.key === activeUserKey?.key && (
                            <span className="rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 text-[9px]">Active Choice</span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">{maskKey(k.key)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectKeyForTesting(k.key)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
                      >
                        Pilih Key Ini
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(k.key)}
                        className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
                        title="Salin Key"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartRename(k)}
                        className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
                        title="Ubah Nama"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upgrade Tier Promotional Banner (Visible for Free & Pro) */}
          {userTier !== 'Enterprise' && (
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-indigo-950/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white">
                    {userTier === 'Pro' ? 'Tingkatkan ke Enterprise VIP untuk Unlimited Rate & Dedicated Node!' : 'Butuh Rate Limit Lebih Tinggi atau Multi-Key?'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {userTier === 'Pro'
                      ? 'Dapatkan rate limit 1.000+ req/min dan dedicated node server tanpa batas.'
                      : 'Lihat paket Pro (300 req/min) dan Enterprise VIP (1.000+ req/min) dengan kuota puluhan ribu request.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPricingModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition shrink-0"
              >
                <span>Lihat Detail Paket</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

        </div>
      ) : (
        /* ========================================================================= */
        /* 2. ADMIN MASTER KEYS DIRECTORY & QUICK CONTROLS */
        /* ========================================================================= */
        <div className="space-y-6">
          
          {/* Admin Fast Actions Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
            <div className="flex items-center gap-2.5">
              <Shield className="h-5 w-5 text-amber-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Master API Keys Database ({apiKeys.length} Kunci Terdaftar)</h2>
                <p className="text-xs text-slate-400">Admin memiliki izin penuh untuk mengelola, membuat custom key, dan mencabut token pengguna.</p>
              </div>
            </div>

            {onSwitchToAdminTab && (
              <button
                onClick={onSwitchToAdminTab}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-amber-600/30 hover:bg-amber-700 transition"
              >
                <Key className="h-3.5 w-3.5" />
                <span>Buka Generator Custom Key (Admin)</span>
              </button>
            )}
          </div>

          {/* Admin Table of All Keys */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                  <tr>
                    <th className="p-3.5">Nama & Token Key</th>
                    <th className="p-3.5">Owner Email</th>
                    <th className="p-3.5">Tier</th>
                    <th className="p-3.5">Rate Limit</th>
                    <th className="p-3.5">Pemakaian Kuota</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {apiKeys.map((item) => (
                    <tr key={item.key} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{item.key}</span>
                          <button
                            onClick={() => handleCopy(item.key)}
                            className="text-slate-500 hover:text-slate-300"
                            title="Salin"
                          >
                            {copiedKey === item.key ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono text-[11px]">
                        {item.ownerEmail || 'system/public'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.tier === 'Enterprise'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : item.tier === 'Pro'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                              : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                          }`}
                        >
                          {item.tier}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        {item.rateLimit} req/min
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        {item.requestCount || 0} / {(item.totalLimit || 5000).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenSecurityModal(item)}
                          className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-900/40 hover:text-cyan-200 transition"
                          title="Atur IP Whitelist & Domain Origin"
                        >
                          Keamanan
                        </button>
                        <button
                          onClick={() => onSelectKeyForTesting(item.key)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-950/60 hover:text-indigo-200 transition"
                          title="Gunakan untuk test API"
                        >
                          Test
                        </button>
                        <button
                          onClick={() => setKeyToRevoke(item)}
                          className="rounded-lg border border-rose-500/30 bg-rose-950/20 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-900/40 hover:text-rose-200 transition"
                          title="Cabut Key"
                        >
                          Cabut
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Revocation Confirmation Modal */}
      {keyToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cabut API Key?</h3>
                <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs space-y-1 font-mono">
              <div className="text-slate-300 font-bold">{keyToRevoke.name}</div>
              <div className="text-slate-500 text-[11px] break-all">{keyToRevoke.key}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setKeyToRevoke(null)}
                disabled={isRevoking}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmRevokeKey}
                disabled={isRevoking}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:bg-rose-700 transition"
              >
                {isRevoking ? 'Mencabut...' : 'Ya, Cabut Kunci'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Whitelist Modal (IP & Domain CORS Guard) */}
      {securityModalKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 shadow-2xl shadow-cyan-500/10 space-y-5">
            <button
              onClick={() => setSecurityModalKey(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-900 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                <GlobeLock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Atur IP Whitelist & Domain Origin</h3>
                <p className="text-xs text-slate-400">
                  {securityModalKey.name} (<span className="font-mono text-cyan-300">{securityModalKey.key.substring(0, 16)}...</span>)
                </p>
              </div>
            </div>

            {/* IP Whitelist Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Network className="h-3.5 w-3.5 text-cyan-400" />
                  <span>IP Whitelist Server / Client</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Pisahkan dengan koma (,)</span>
              </label>
              <input
                type="text"
                value={allowedIpsInput}
                onChange={(e) => setAllowedIpsInput(e.target.value)}
                placeholder="misal: 103.15.2.1, 180.252.10.0/24 (kosongkan untuk ijinkan semua IP)"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Hanya request dari IP yang tercantum di atas yang dapat menggunakan API Key ini. Gunakan <code className="text-cyan-300 font-mono">*</code> atau kosongkan untuk mengizinkan semua IP.
              </p>
            </div>

            {/* Domain Origin Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Allowed Domain Origins (CORS Guard)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Pisahkan dengan koma (,)</span>
              </label>
              <input
                type="text"
                value={allowedOriginsInput}
                onChange={(e) => setAllowedOriginsInput(e.target.value)}
                placeholder="misal: https://myweb.com, http://localhost:3000, *.mycompany.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Mencegah pencurian API Key di browser. Request dari domain selain yang tercantum akan otomatis ditolak HTTP 403 Forbidden.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSecurityModalKey(null)}
                disabled={isSavingSecurity}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSecurityRules}
                disabled={isSavingSecurity}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-600/30 hover:bg-cyan-700 transition disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{isSavingSecurity ? 'Menyimpan...' : 'Simpan Aturan Keamanan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Key Creation Modal for Pro & Enterprise */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Plus className="h-4 w-4" />
                <span>Buat API Key Baru ({userTier} Plan)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUserKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nama API Key / Project Identifier</label>
                <input
                  type="text"
                  value={createKeyNameInput}
                  onChange={(e) => setCreateKeyNameInput(e.target.value)}
                  placeholder="Misal: Mobile App Server / Production Web"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Gunakan nama yang mudah diingat untuk membedakan peruntukan API key ini.
                </p>
              </div>

              <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3 text-xs space-y-1 text-purple-200">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>Fitur Otomatis Tier {userTier}</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Kunci baru ini secara otomatis mewarisi Rate Limit{' '}
                  <span className="font-bold text-purple-300">
                    {userTier === 'Enterprise' ? '1.000 req/min' : '300 req/min'}
                  </span>{' '}
                  dan Kuota{' '}
                  <span className="font-bold text-purple-300">
                    {userTier === 'Enterprise' ? 'Unlimited' : '25.000 req/bln'}
                  </span>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreatingKey || !createKeyNameInput.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-50 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isCreatingKey ? 'Membuat Key...' : 'Buat API Key'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pricing Modal Component */}
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        currentUser={currentUser}
        onUserTierUpdated={onUserTierUpdated}
        lang={lang}
      />

    </div>
  );
};
