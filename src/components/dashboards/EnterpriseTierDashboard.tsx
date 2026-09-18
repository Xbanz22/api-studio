import React, { useState } from 'react';
import {
  Shield,
  Key,
  Server,
  Activity,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  Mail,
  PhoneCall,
  Calendar,
  Layers,
  Terminal,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Award,
  Sliders
} from 'lucide-react';
import { ApiKeyItem, ApiLogItem, UserProfile } from '../../types';
import { UsageStatsWidget } from '../UsageStatsWidget';

interface EnterpriseTierDashboardProps {
  user: UserProfile;
  apiKeys: ApiKeyItem[];
  logs: ApiLogItem[];
  selectedApiKey: string;
  onSelectApiKey: (key: string) => void;
  onRefreshKeys: () => void;
  onNavigateTab: (tab: 'dashboard' | 'admin' | 'explorer' | 'keys' | 'mock' | 'webhooks' | 'speedtest' | 'analytics' | 'docs') => void;
  onQuickSwitchTier?: (tier: 'Free' | 'Pro' | 'Enterprise') => void;
  lang: 'id' | 'en';
}

export const EnterpriseTierDashboard: React.FC<EnterpriseTierDashboardProps> = ({
  user,
  apiKeys,
  logs,
  selectedApiKey,
  onSelectApiKey,
  onRefreshKeys,
  onNavigateTab,
  onQuickSwitchTier,
  lang,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'Production' | 'Staging' | 'Disaster-Recovery' | 'Microservices'>('Production');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [keyPendingDelete, setKeyPendingDelete] = useState<string | null>(null);
  const [isDeletingKey, setIsDeletingKey] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [tamContactModal, setTamContactModal] = useState(false);
  const [selectedSnippetLang, setSelectedSnippetLang] = useState<'curl' | 'js' | 'python' | 'php'>('curl');

  // Filter keys for this enterprise user - strictly matching ownerEmail to user.email to prevent leak/fallback
  const userKeys = apiKeys.filter(
    (k) => k.ownerEmail && user.email && k.ownerEmail.toLowerCase() === user.email.toLowerCase()
  );
  
  const activeKey = userKeys.find((k) => k.key === selectedApiKey) || userKeys[0];
  const currentKey = activeKey?.key || '';

  const totalUserRequests = userKeys.reduce((acc, k) => acc + (k.requestCount || 0), 0);
  const totalLimit = 100000;
  const usagePercent = Math.min(100, Math.round((totalUserRequests / totalLimit) * 100));

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Create new Enterprise key
  const handleCreateEnterpriseKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCreatingKey(true);
    try {
      const fullKeyName = `${newKeyName.trim() || 'Enterprise Key'} [${newKeyEnv}]`;
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
          'x-user-role': user.role || 'Enterprise'
        },
        body: JSON.stringify({
          name: fullKeyName,
          tier: 'Enterprise',
          ownerEmail: user.email
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setNewKeyName('');
        onSelectApiKey(data.data.key);
        await onRefreshKeys();
        setFeedbackMsg(lang === 'id' ? 'Kunci API Enterprise berhasil di-provision!' : 'Enterprise API Key provisioned!');
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg(data.error || 'Gagal membuat kunci API Enterprise.');
      }
    } catch (err: any) {
      setFeedbackMsg('Error: ' + err.message);
    } finally {
      setIsCreatingKey(false);
    }
  };

  const confirmDeleteKey = async () => {
    if (!keyPendingDelete) return;
    setIsDeletingKey(true);

    try {
      const res = await fetch(`/api/keys/${encodeURIComponent(keyPendingDelete)}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': user.email || '',
          'x-user-role': user.role || 'Enterprise'
        }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(lang === 'id' ? 'Enterprise Key berhasil dimusnahkan dari server.' : 'Enterprise Key revoked.');
        setKeyPendingDelete(null);
        await onRefreshKeys();
        // If deleted key was active, pick the next available
        const remaining = userKeys.filter(k => k.key !== keyPendingDelete);
        if (remaining.length > 0) {
          onSelectApiKey(remaining[0].key);
        }
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg(data.error || 'Gagal menghapus API Key.');
      }
    } catch (err: any) {
      setFeedbackMsg('Error: ' + err.message);
    } finally {
      setIsDeletingKey(false);
    }
  };

  const snippets = {
    curl: `curl -X POST https://api-studio.app/api/ai/generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${currentKey}" \\
  -d '{"prompt": "Process mission-critical batch inference", "temperature": 0.2}'`,
    js: `// Enterprise High-Concurrency Client with Retries
import { Agent } from 'https';
const keepAliveAgent = new Agent({ keepAlive: true, maxSockets: 100 });

const response = await fetch('https://api-studio.app/api/ai/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${currentKey}',
    'X-Enterprise-VPC': 'vpc-primary-cluster'
  },
  body: JSON.stringify({
    prompt: 'Process mission-critical batch inference',
    temperature: 0.2
  })
});
const result = await response.json();
console.log(result);`,
    python: `import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
adapter = HTTPAdapter(max_retries=Retry(total=3, backoff_factor=0.3))
session.mount("https://", adapter)

url = "https://api-studio.app/api/ai/generate"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${currentKey}",
    "X-Enterprise-VPC": "vpc-primary-cluster"
}
payload = {
    "prompt": "Process mission-critical batch inference",
    "temperature": 0.2
}

response = session.post(url, json=payload, headers=headers, timeout=10)
print(response.json())`,
    php: `<?php
// Enterprise Curl with Keep-Alive
$ch = curl_init('https://api-studio.app/api/ai/generate');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TCP_KEEPALIVE, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: ${currentKey}',
    'X-Enterprise-VPC: vpc-primary-cluster'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'prompt' => 'Process mission-critical batch inference',
    'temperature' => 0.2
]));
$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Realtime Request Analytics breakdown */}
      <UsageStatsWidget userEmail={user.email} lang={lang} />

      {/* Enterprise High-Availability Cluster Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>SLA Uptime Status</span>
            </span>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">99.999%</span>
          </div>
          <div className="font-mono text-lg font-extrabold text-white">
            100% Operational
          </div>
          <p className="text-[10px] text-emerald-400 font-medium">MTTR Guarantee &lt; 60s</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>Rate Limit Dedicated</span>
            </span>
            <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">Enterprise</span>
          </div>
          <div className="font-mono text-lg font-extrabold text-white">
            1.000+ <span className="text-xs font-normal text-slate-300">req / menit</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Custom Burst Expansion On-Demand</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <span>{lang === 'id' ? 'Kuota Bulanan' : 'Monthly Quota'}</span>
            </span>
            <span className="font-mono text-amber-300 font-bold">100k+</span>
          </div>
          <div className="font-mono text-lg font-extrabold text-white">
            {totalUserRequests.toLocaleString()} <span className="text-xs font-normal text-slate-300">/ 100.000</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${usagePercent}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-cyan-400" />
              <span>Multi-Region Failover</span>
            </span>
            <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">3 Nodes</span>
          </div>
          <div className="font-mono text-xs font-bold text-slate-100">
            JK1 • SG1 • NRT1
          </div>
          <p className="text-[10px] text-emerald-400 font-medium">Hot Synchronous Standby</p>
        </div>
      </div>

      {/* Multi-Region Real-time Infrastructure Nodes */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="h-4 w-4 text-amber-400" />
            <span>{lang === 'id' ? 'Status Kluster Dedicated & Redundansi Multi-Region' : 'Dedicated Multi-Region Cluster Status'}</span>
          </h3>
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            All Ingress Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">🇮🇩 Jakarta (JK1)</span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">PRIMARY ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Equinix Data Center • &lt; 8ms RTT</p>
            <div className="text-[10px] text-slate-500">100% Ingress Routing Load</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">🇸🇬 Singapore (ap-southeast-1)</span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-bold text-indigo-300">HOT STANDBY</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">AWS Ingress • &lt; 14ms RTT</p>
            <div className="text-[10px] text-slate-500">Real-time DB Replication Synchronized</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">🇯🇵 Tokyo (asia-northeast1)</span>
              <span className="rounded bg-purple-500/20 px-1.5 py-0.2 text-[9px] font-bold text-purple-300">EDGE INGRESS</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">GCP Edge Cloud • &lt; 38ms RTT</p>
            <div className="text-[10px] text-slate-500">Global Anycast Routing</div>
          </div>
        </div>
      </div>

      {/* Enterprise Multi-Environment Key Studio (Unlimited Keys) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-400" />
              <span>{lang === 'id' ? 'Enterprise Environment Keys (Unlimited)' : 'Enterprise Environment Keys (Unlimited)'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'id'
                ? 'Kelola kunci terisolasi per environment dengan kebijakan rotasi & firewall terpusat.'
                : 'Manage isolated keys per environment with centralized rotation & firewall policies.'}
            </p>
          </div>

          {/* Provision Key Form */}
          <form onSubmit={handleCreateEnterpriseKey} className="flex flex-wrap items-center gap-2">
            <select
              value={newKeyEnv}
              onChange={(e) => setNewKeyEnv(e.target.value as any)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none"
            >
              <option value="Production">Prod Environment</option>
              <option value="Staging">Staging Test</option>
              <option value="Disaster-Recovery">Disaster Recovery (DR)</option>
              <option value="Microservices">Microservices Core</option>
            </select>

            <input
              type="text"
              placeholder={lang === 'id' ? 'Label Kunci (cth: Payment Core)' : 'Key Label (e.g. Payment Core)'}
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={isCreatingKey}
              className="flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition shrink-0 shadow-md shadow-amber-600/20"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isCreatingKey ? '...' : (lang === 'id' ? 'Provision Key' : 'Provision Key')}</span>
            </button>
          </form>
        </div>

        {/* Keys List */}
        <div className="space-y-2.5">
          {userKeys.map((k) => (
            <div
              key={k.key}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 transition ${
                k.key === selectedApiKey
                  ? 'border-amber-500/50 bg-amber-950/20'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectApiKey(k.key)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                    k.key === selectedApiKey
                      ? 'border-amber-500 bg-amber-600 text-white'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Pilih kunci ini sebagai aktif di Explorer"
                >
                  <Key className="h-4 w-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{k.name}</span>
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[8px] font-bold text-amber-300 uppercase">
                      Enterprise Dedicated
                    </span>
                    {k.key === selectedApiKey && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[8px] font-bold text-emerald-400 uppercase">
                        Active In Explorer
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                    {k.key}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-300">
                  {k.requestCount || 0} req <span className="text-slate-500 text-[10px]">/ 100k</span>
                </span>

                <button
                  onClick={() => handleCopy(k.key)}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  title="Salin Key"
                >
                  {copiedKey === k.key ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>

                <button
                  onClick={() => setKeyPendingDelete(k.key)}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-xs text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition"
                  title="Hapus / Cabut Key"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {userKeys.length === 0 && (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 space-y-3">
              <Key className="h-8 w-8 text-amber-400/60 mx-auto" />
              <p className="text-xs text-slate-400">Belum ada API Key aktif untuk akun Enterprise Anda.</p>
              <button
                onClick={() => handleCreateEnterpriseKey()}
                disabled={isCreatingKey}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg hover:from-amber-400 hover:to-amber-500 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isCreatingKey ? 'Membuat Key...' : 'Generate Kunci Enterprise Sekarang'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Key Revocation */}
      {keyPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfirmasi Hapus API Key</h3>
                <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
              <p className="text-[11px] text-slate-400">API Key yang akan dimusnahkan:</p>
              <p className="font-mono text-xs font-bold text-rose-300 break-all">{keyPendingDelete}</p>
              <p className="text-[10px] text-slate-500 pt-1">
                Semua microservices, integrasi, dan request yang menggunakan kunci ini akan langsung ditolak dengan status HTTP 401 Unauthorized.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setKeyPendingDelete(null)}
                disabled={isDeletingKey}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteKey}
                disabled={isDeletingKey}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeletingKey ? 'Memusnahkan...' : 'Ya, Hapus Kunci'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Shield Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">
            {lang === 'id' ? 'Sertifikasi Keamanan & Kepatuhan' : 'Security & Compliance Certifications'}
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          {lang === 'id'
            ? 'Akun Enterprise Anda dilindungi oleh standar keamanan data perbankan internasional.'
            : 'Your Enterprise account is protected under international enterprise security frameworks.'}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-1 font-semibold">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-2 text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>SOC2 Type II Certified</span>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-2 text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>ISO 27001 ISMS</span>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-2 text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>PCI-DSS Level 1 Ready</span>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-2 text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>GDPR Zero Data Retain</span>
          </div>
        </div>
      </div>

      {/* Integration Code */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {lang === 'id' ? 'Snippet Integrasi Enterprise (High Concurrency)' : 'Enterprise High-Concurrency Snippets'}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {(['curl', 'js', 'python', 'php'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setSelectedSnippetLang(l)}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition ${
                  selectedSnippetLang === l
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200">
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

    </div>
  );
};
