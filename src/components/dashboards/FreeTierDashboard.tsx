import React, { useState } from 'react';
import {
  Zap,
  Key,
  TrendingUp,
  Clock,
  Shield,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Terminal,
  CheckCircle2,
  Lock,
  Play,
  Layers,
  HelpCircle,
  Cpu,
  Coins,
  QrCode,
  Users
} from 'lucide-react';
import { ApiKeyItem, ApiLogItem, UserProfile } from '../../types';
import { UsageStatsWidget } from '../UsageStatsWidget';

interface FreeTierDashboardProps {
  user: UserProfile;
  activeKey: ApiKeyItem | undefined;
  currentKey: string;
  totalUserRequests: number;
  totalLimit: number;
  rateLimit: number;
  usagePercent: number;
  isUnlimitedQuota: boolean;
  isUnlimitedRate: boolean;
  copiedKey: string | null;
  onCopy: (text: string) => void;
  onOpenRegenerateModal: () => void;
  onOpenPricingModal: () => void;
  onNavigateTab: (tab: 'dashboard' | 'admin' | 'explorer' | 'keys' | 'mock' | 'webhooks' | 'speedtest' | 'analytics' | 'docs') => void;
  onQuickSwitchTier?: (tier: 'Free' | 'Pro' | 'Enterprise') => void;
  onRefreshKeys?: () => void;
  onLogNewRequest?: () => void;
  lang: 'id' | 'en';
}

export const FreeTierDashboard: React.FC<FreeTierDashboardProps> = ({
  user,
  activeKey,
  currentKey,
  totalUserRequests,
  totalLimit,
  rateLimit,
  usagePercent,
  isUnlimitedQuota,
  isUnlimitedRate,
  copiedKey,
  onCopy,
  onOpenRegenerateModal,
  onOpenPricingModal,
  onNavigateTab,
  onQuickSwitchTier,
  onRefreshKeys,
  onLogNewRequest,
  lang,
}) => {
  const [selectedSnippetLang, setSelectedSnippetLang] = useState<'curl' | 'js' | 'python' | 'php'>('curl');
  
  // Interactive 1-click Playground Test State
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ status: number; latency: number; data: any } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const runQuickTest = async (endpoint: 'currency' | 'qrcode' | 'users' | 'ai') => {
    setIsTesting(true);
    setTestingEndpoint(endpoint);
    const start = performance.now();

    try {
      let url = '';
      let options: RequestInit = { headers: { 'x-api-key': currentKey } };

      if (endpoint === 'currency') {
        url = '/api/data/currency?from=USD&to=IDR&amount=10';
      } else if (endpoint === 'qrcode') {
        url = '/api/tools/qr?text=https://api.studio.dev&size=150';
      } else if (endpoint === 'users') {
        url = '/api/data/users?limit=2';
      } else if (endpoint === 'ai') {
        url = '/api/ai/generate';
        options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': currentKey
          },
          body: JSON.stringify({
            prompt: 'Berikan 1 tips arsitektur REST API yang aman dan scalable dalam 1 kalimat.',
            temperature: 0.7
          })
        };
      }

      const res = await fetch(url, options);
      const data = await res.json();
      const latency = Math.round(performance.now() - start);

      setTestResult({
        status: res.status,
        latency,
        data
      });

      if (onRefreshKeys) {
        onRefreshKeys();
      }
      if (onLogNewRequest) {
        onLogNewRequest();
      }
    } catch (err: any) {
      setTestResult({
        status: 500,
        latency: Math.round(performance.now() - start),
        data: { error: err.message }
      });
    } finally {
      setIsTesting(false);
    }
  };

  const snippets = {
    curl: `curl -X POST https://api-studio.app/api/ai/generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${currentKey}" \\
  -d '{"prompt": "Buat 3 ide fitur REST API modern", "temperature": 0.7}'`,
    js: `// Modern JavaScript / TypeScript Fetch
const response = await fetch('https://api-studio.app/api/ai/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${currentKey}'
  },
  body: JSON.stringify({
    prompt: 'Buat 3 ide fitur REST API modern',
    temperature: 0.7
  })
});
const result = await response.json();
console.log(result);`,
    python: `import requests

url = "https://api-studio.app/api/ai/generate"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${currentKey}"
}
payload = {
    "prompt": "Buat 3 ide fitur REST API modern",
    "temperature": 0.7
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    php: `<?php
$ch = curl_init('https://api-studio.app/api/ai/generate');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: ${currentKey}'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'prompt' => 'Buat 3 ide fitur REST API modern',
    'temperature' => 0.7
]));
$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Realtime Usage Request Breakdown Stats */}
      <UsageStatsWidget userEmail={user.email} lang={lang} />

      {/* Main Grid: Single API Key Widget & Quota Tracker */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left 7 Cols: Primary Key Card */}
        <div className="lg:col-span-7 rounded-2xl border border-cyan-300 dark:border-cyan-500/30 bg-white dark:bg-slate-900/70 p-5 sm:p-6 space-y-4 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30">
                <Key className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{lang === 'id' ? 'Kunci API Utama (Free)' : 'Your Free API Key'}</span>
                  <span className="rounded bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-1.5 py-0.2 text-[9px] font-bold">
                    Aktif
                  </span>
                </h2>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {lang === 'id' ? 'Kirim via header HTTP: ' : 'Send via HTTP header: '}
                  <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.2 font-mono text-cyan-700 dark:text-cyan-300 font-bold">x-api-key</code>
                </p>
              </div>
            </div>

            {/* Regenerate Key */}
            <button
              onClick={onOpenRegenerateModal}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
              title={currentKey ? "Ganti kunci & hapus kunci lama dari database" : "Generate API Key pribadi Anda"}
            >
              <RefreshCw className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{currentKey ? (lang === 'id' ? 'Rotasi Kunci' : 'Rotate Key') : (lang === 'id' ? '⚡ Buat Kunci' : '⚡ Generate Key')}</span>
            </button>
          </div>

          {/* Key String Box */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 flex items-center justify-between font-mono text-xs text-slate-800 dark:text-slate-200">
            {currentKey ? (
              <>
                <div className="truncate select-all pr-2 text-cyan-700 dark:text-cyan-300 font-semibold">
                  {currentKey}
                </div>
                <button
                  onClick={() => onCopy(currentKey)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2.5 py-1 text-xs font-sans font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shrink-0"
                >
                  {copiedKey === currentKey ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">{lang === 'id' ? 'Tersalin!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{lang === 'id' ? 'Salin Key' : 'Copy Key'}</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-amber-600 dark:text-amber-400 font-sans italic text-xs">
                  {lang === 'id' ? '⚠️ Anda belum memiliki API Key. Silakan buat sekarang.' : '⚠️ You do not have an API key yet. Please generate one.'}
                </span>
                <button
                  onClick={onOpenRegenerateModal}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-3 py-1 font-sans text-xs transition"
                >
                  <Key className="h-3.5 w-3.5" />
                  <span>{lang === 'id' ? '⚡ Generate API Key' : '⚡ Generate API Key'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Limits info */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 p-3 space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{lang === 'id' ? 'Batas Rate Limit' : 'Rate Limit'}</span>
              </span>
              <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">60 req / menit</p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 p-3 space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{lang === 'id' ? 'Slot Kunci API' : 'API Key Slots'}</span>
              </span>
              <p className="font-mono text-sm font-bold text-cyan-700 dark:text-cyan-300">1 Kunci Aktif</p>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Quota & Upgrade Teaser */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 space-y-4 backdrop-blur shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span>{lang === 'id' ? 'Pemakaian Kuota Bulanan' : 'Monthly Quota Usage'}</span>
              </span>
              <span className="font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                {totalUserRequests.toLocaleString()} / {totalLimit.toLocaleString()}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  usagePercent > 80 ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-2">
              <span>{usagePercent}% terpakai</span>
              <span>{Math.max(0, totalLimit - totalUserRequests).toLocaleString()} request tersisa</span>
            </div>
          </div>

          {/* Starter Plan Info Box */}
          <div className="rounded-xl border border-cyan-300 dark:border-cyan-500/40 bg-cyan-50/90 dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{lang === 'id' ? 'Buka Limit Lebih Tinggi di Pro' : 'Unlock Higher Limits in Pro'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-200">
              {lang === 'id'
                ? 'Dapatkan 300 req/min, 25.000 kuota request/bulan, dan hingga 5 multi-API keys.'
                : 'Get 300 req/min, 25,000 requests/month, and up to 5 multi-API keys.'}
            </p>
            <button
              onClick={onOpenPricingModal}
              className="mt-1 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-cyan-200 underline"
            >
              {lang === 'id' ? 'Lihat Spesifikasi Paket' : 'View Plan Specs'} &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 1-Click Starter API Tester */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Play className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>{lang === 'id' ? 'Tes Cepat Endpoint Starter (1-Klik Live)' : 'Quick 1-Click Starter Endpoint Tester'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'id'
                ? 'Uji respon API secara instan langsung dari dashboard menggunakan Free API Key Anda.'
                : 'Test live API responses directly from the dashboard using your Free API Key.'}
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-500/20 font-bold">
            Free Ready
          </span>
        </div>

        {/* 4 Quick Test Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => runQuickTest('currency')}
            disabled={isTesting}
            className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-3 text-left transition hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-900 group shadow-sm"
          >
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                <Coins className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Currency Exchange</span>
              </span>
              <span className="rounded bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-1 py-0.2 text-[8px] font-bold">GET</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate w-full">/api/currency/convert</span>
          </button>

          <button
            onClick={() => runQuickTest('qrcode')}
            disabled={isTesting}
            className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-3 text-left transition hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-900 group shadow-sm"
          >
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                <QrCode className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>QR Code Generator</span>
              </span>
              <span className="rounded bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-1 py-0.2 text-[8px] font-bold">GET</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate w-full">/api/tools/qrcode</span>
          </button>

          <button
            onClick={() => runQuickTest('users')}
            disabled={isTesting}
            className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-3 text-left transition hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-900 group shadow-sm"
          >
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                <Users className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Random Users API</span>
              </span>
              <span className="rounded bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-1 py-0.2 text-[8px] font-bold">GET</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate w-full">/api/data/users</span>
          </button>

          <button
            onClick={() => runQuickTest('ai')}
            disabled={isTesting}
            className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-3 text-left transition hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-900 group shadow-sm"
          >
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                <Cpu className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Gemini 2.0 AI Flash</span>
              </span>
              <span className="rounded bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 px-1 py-0.2 text-[8px] font-bold">POST</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate w-full">/api/ai/generate</span>
          </button>
        </div>

        {/* Inline Test Result Box */}
        {isTesting && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-cyan-700 dark:text-cyan-300">
            <RefreshCw className="h-4 w-4 animate-spin text-cyan-600 dark:text-cyan-400" />
            <span>{lang === 'id' ? 'Menjalankan request ke server...' : 'Sending request to gateway...'}</span>
          </div>
        )}

        {testResult && !isTesting && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-4 space-y-2 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px]">
              <span className="text-slate-400 flex items-center gap-2">
                <span>Respon:</span>
                <span className={`font-bold ${testResult.status < 400 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  HTTP {testResult.status}
                </span>
              </span>
              <span className="text-cyan-400">{testResult.latency}ms</span>
            </div>
            <pre className="overflow-x-auto text-slate-200 max-h-48 text-[11px] leading-relaxed">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Code Integration Snippets */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'id' ? 'Contoh Integrasi Cepat (Quick Start)' : 'Quick Start Integration Snippets'}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {(['curl', 'js', 'python', 'php'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setSelectedSnippetLang(l)}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition ${
                  selectedSnippetLang === l
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-4 font-mono text-xs shadow-inner">
          <button
            onClick={() => onCopy(snippets[selectedSnippetLang])}
            className="absolute right-3 top-3 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-sans text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            {copiedKey === snippets[selectedSnippetLang] ? 'Tersalin!' : 'Salin Kode'}
          </button>
          <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed pr-20 text-[11px]">
            {snippets[selectedSnippetLang]}
          </pre>
        </div>
      </div>

      {/* Feature Matrix & Tier Comparison */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-5 sm:p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <span>{lang === 'id' ? 'Status Fitur Paket Anda vs Pro/Enterprise' : 'Feature Matrix Comparison'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-cyan-300 dark:border-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-950/10 p-3.5 space-y-2 shadow-sm">
            <span className="font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>Free Starter (Aktif)</span>
            </span>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
              <li>✓ 1 Active API Key</li>
              <li>✓ 60 Req / Menit Rate Limit</li>
              <li>✓ 5.000 Req / Bulan Kuota</li>
              <li>✓ Standar Edge Gateway</li>
            </ul>
          </div>

          <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 space-y-2 opacity-85 shadow-sm">
            <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
              <span>Pro Developer</span>
              <Lock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            </span>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
              <li>✦ Hingga 5 API Keys</li>
              <li>✦ 300 Req / Menit (5x Lebih Cepat)</li>
              <li>✦ 25.000 Req / Bulan Kuota</li>
              <li>✦ Webhook Event Dispatcher</li>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 space-y-2 opacity-85 shadow-sm">
            <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>Enterprise VIP</span>
              <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </span>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
              <li>✦ Unlimited Custom Keys</li>
              <li>✦ 1.000+ Req / Menit Limit</li>
              <li>✦ 100.000+ Req / Bulan Kuota</li>
              <li>✦ 99.999% SLA & Dedicated TAM</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
