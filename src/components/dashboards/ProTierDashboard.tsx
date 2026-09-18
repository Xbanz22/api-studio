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
  Plus,
  Trash2,
  Terminal,
  Activity,
  Webhook,
  Gauge,
  Cpu,
  BarChart2,
  Lock,
  Layers,
  CheckCircle2,
  Radio,
  ExternalLink
} from 'lucide-react';
import { ApiKeyItem, ApiLogItem, UserProfile } from '../../types';
import { UsageStatsWidget } from '../UsageStatsWidget';

interface ProTierDashboardProps {
  user: UserProfile;
  apiKeys: ApiKeyItem[];
  logs: ApiLogItem[];
  selectedApiKey: string;
  onSelectApiKey: (key: string) => void;
  onRefreshKeys: () => void;
  onOpenPricingModal: () => void;
  onNavigateTab: (tab: 'dashboard' | 'admin' | 'explorer' | 'keys' | 'mock' | 'webhooks' | 'speedtest' | 'analytics' | 'docs') => void;
  onQuickSwitchTier?: (tier: 'Free' | 'Pro' | 'Enterprise') => void;
  lang: 'id' | 'en';
}

export const ProTierDashboard: React.FC<ProTierDashboardProps> = ({
  user,
  apiKeys,
  logs,
  selectedApiKey,
  onSelectApiKey,
  onRefreshKeys,
  onOpenPricingModal,
  onNavigateTab,
  onQuickSwitchTier,
  lang,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [selectedSnippetLang, setSelectedSnippetLang] = useState<'curl' | 'js' | 'python' | 'php'>('curl');

  // Filter keys for this user - strictly matching ownerEmail to user.email to prevent leak/fallback
  const userKeys = apiKeys.filter(
    (k) => k.ownerEmail && user.email && k.ownerEmail.toLowerCase() === user.email.toLowerCase()
  );
  
  const activeKey = userKeys.find((k) => k.key === selectedApiKey) || userKeys[0];
  const currentKey = activeKey?.key || '';

  const totalUserRequests = userKeys.reduce((acc, k) => acc + (k.requestCount || 0), 0);
  const totalLimit = 25000;
  const rateLimit = 300;
  const usagePercent = Math.min(100, Math.round((totalUserRequests / totalLimit) * 100));

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Create new key (up to 5 keys for Pro)
  const handleCreateNewKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userKeys.length >= 5) {
      alert(lang === 'id' ? 'Batas maksimal 5 API Keys untuk paket Pro telah tercapai.' : 'Pro plan maximum limit of 5 API keys reached.');
      return;
    }

    setIsCreatingKey(true);
    try {
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim() || `Pro Key #${userKeys.length + 1}`,
          tier: 'Pro',
          ownerEmail: user.email
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setNewKeyName('');
        onSelectApiKey(data.data.key);
        await onRefreshKeys();
        setFeedbackMsg(lang === 'id' ? 'Kunci API Pro baru berhasil dibuat!' : 'New Pro API Key created!');
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        alert(data.error || 'Gagal membuat kunci API.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsCreatingKey(false);
    }
  };

  // Delete individual key
  const handleDeleteKey = async (keyToDelete: string) => {
    if (userKeys.length <= 1) {
      alert(lang === 'id' ? 'Anda harus mempertahankan minimal 1 API key aktif.' : 'You must keep at least 1 active API key.');
      return;
    }
    if (!confirm(lang === 'id' ? `Cabut & hapus API key ${keyToDelete}?` : `Revoke API key ${keyToDelete}?`)) return;

    try {
      const res = await fetch(`/api/keys/${encodeURIComponent(keyToDelete)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await onRefreshKeys();
        setFeedbackMsg(lang === 'id' ? 'Kunci API berhasil dicabut.' : 'API Key revoked.');
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const snippets = {
    curl: `curl -X POST https://api-studio.app/api/ai/generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${currentKey}" \\
  -d '{"prompt": "Generate microservices OpenAPI schema", "temperature": 0.7}'`,
    js: `// Pro Node.js / Browser Client
const response = await fetch('https://api-studio.app/api/ai/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${currentKey}'
  },
  body: JSON.stringify({
    prompt: 'Generate microservices OpenAPI schema',
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
    "prompt": "Generate microservices OpenAPI schema",
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
    'prompt' => 'Generate microservices OpenAPI schema',
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

      {feedbackMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Pro Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-slate-900 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>{lang === 'id' ? 'Kuota Bulanan' : 'Monthly Quota'}</span>
            </span>
            <span className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">{usagePercent}%</span>
          </div>
          <div className="font-mono text-lg font-extrabold text-slate-900 dark:text-white">
            {totalUserRequests.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ 25.000</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full" style={{ width: `${usagePercent}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'id' ? 'Batas Rate Limit' : 'Rate Limit'}</span>
            </span>
            <span className="rounded bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-1.5 py-0.2 text-[9px] font-bold">5x Fast</span>
          </div>
          <div className="font-mono text-lg font-extrabold text-slate-900 dark:text-white">
            300 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">req / menit</span>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Dedicated Burst Buffer</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Cpu className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Gemini 2.0 AI Flash</span>
            </span>
            <span className="rounded bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 px-1.5 py-0.2 text-[9px] font-bold">Priority</span>
          </div>
          <div className="font-mono text-lg font-extrabold text-purple-700 dark:text-purple-200">
            VIP Lane <span className="text-xs font-normal text-slate-500 dark:text-slate-400">active</span>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">No throttling queue</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Shield className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>Uptime SLA</span>
            </span>
            <span className="rounded bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 px-1.5 py-0.2 text-[9px] font-bold">99.9%</span>
          </div>
          <div className="font-mono text-lg font-extrabold text-slate-900 dark:text-white">
            APAC Edge <span className="text-xs font-normal text-slate-500 dark:text-slate-400">&lt; 25ms</span>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Singapore & Jakarta Nodes</p>
        </div>
      </div>

      {/* Multi-Key Studio (Up to 5 Keys for Pro) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>{lang === 'id' ? 'Multi-API Key Studio (Maks. 5 Kunci)' : 'Multi-API Key Studio (Max 5 Keys)'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'id'
                ? 'Pisahkan kunci untuk backend, aplikasi mobile, atau staging environment.'
                : 'Separate keys for backend services, mobile apps, or staging environments.'}
            </p>
          </div>

          {/* New Key Form */}
          {userKeys.length < 5 && (
            <form onSubmit={handleCreateNewKey} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={lang === 'id' ? 'Nama Kunci (cth: Mobile App)' : 'Key Name (e.g. Mobile App)'}
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isCreatingKey}
                className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isCreatingKey ? '...' : (lang === 'id' ? 'Buat Kunci' : 'New Key')}</span>
              </button>
            </form>
          )}
        </div>

        {/* Keys List */}
        <div className="space-y-2.5">
          {userKeys.map((k) => (
            <div
              key={k.key}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 transition ${
                k.key === selectedApiKey
                  ? 'border-indigo-400 dark:border-indigo-500/50 bg-indigo-50/60 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectApiKey(k.key)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                    k.key === selectedApiKey
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Pilih kunci ini sebagai aktif di Explorer"
                >
                  <Key className="h-4 w-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{k.name}</span>
                    {k.key === selectedApiKey && (
                      <span className="rounded bg-indigo-100 dark:bg-indigo-500/20 px-1.5 py-0.2 text-[8px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                        Selected Primary
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                    {k.key}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {k.requestCount || 0} req
                </span>

                <button
                  onClick={() => handleCopy(k.key)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Salin Key"
                >
                  {copiedKey === k.key ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>

                {userKeys.length > 1 && (
                  <button
                    onClick={() => handleDeleteKey(k.key)}
                    className="rounded-lg border border-rose-300 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20"
                    title="Hapus Key"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Diagnostic & Tools Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigateTab('webhooks')}
          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 transition hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/80 space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
              <Webhook className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Webhook Event Dispatcher</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {lang === 'id'
              ? 'Kirim event realtime dengan enkripsi HMAC SHA-256 ke backend Anda.'
              : 'Dispatch realtime events with HMAC SHA-256 signatures to your backend.'}
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('speedtest')}
          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 transition hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-900/80 space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
              <Gauge className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Global Speedtest Radar</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {lang === 'id'
              ? 'Uji latency round-trip & throughput ke 6 node cloud edge global.'
              : 'Benchmark round-trip latency & throughput across 6 global edge nodes.'}
          </p>
        </div>
      </div>

      {/* Integration Code */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'id' ? 'Snippet Integrasi Pro' : 'Pro Integration Code'}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {(['curl', 'js', 'python', 'php'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setSelectedSnippetLang(l)}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition ${
                  selectedSnippetLang === l
                    ? 'bg-indigo-600 text-white'
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
            onClick={() => handleCopy(snippets[selectedSnippetLang])}
            className="absolute right-3 top-3 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-sans text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            {copiedKey === snippets[selectedSnippetLang] ? 'Tersalin!' : 'Salin Kode'}
          </button>
          <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed pr-20 text-[11px]">
            {snippets[selectedSnippetLang]}
          </pre>
        </div>
      </div>

      {/* Enterprise Upgrade CTA */}
      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-slate-900/90 p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm hover:border-indigo-500/50 transition-all">
        <div className="space-y-1">
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>{lang === 'id' ? 'Butuh Skala Enterprise & Dedicated TAM?' : 'Need Enterprise Scale & Dedicated TAM?'}</span>
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            {lang === 'id'
              ? 'Tingkatkan ke Enterprise untuk kuota 100.000+ request, 1.000+ req/min, 99.999% SLA, dan Dedicated Solutions Engineer.'
              : 'Upgrade to Enterprise for 100,000+ requests, 1,000+ req/min, 99.999% SLA, and Dedicated Solutions Architect.'}
          </p>
        </div>
        <button
          onClick={onOpenPricingModal}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition shadow-md shadow-indigo-600/20"
        >
          {lang === 'id' ? 'Lihat Spesifikasi Enterprise' : 'Explore Enterprise'}
        </button>
      </div>
    </div>
  );
};
