import React, { useState, useEffect } from 'react';
import {
  Webhook,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Key,
  Globe,
  RefreshCw,
  Copy,
  Check,
  Code2,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { WebhookDeliveryItem } from '../types';

interface WebhookSimulatorProps {
  lang: 'id' | 'en';
}

const PRESET_EVENTS = [
  {
    id: 'payment.success',
    name: 'Payment Completed',
    nameId: 'Pembayaran Sukses',
    description: 'Triggered when an invoice or subscription is paid.',
    descriptionId: 'Dipicu ketika tagihan atau langganan berhasil dibayar.',
    defaultPayload: {
      id: 'evt_pay_998124',
      event: 'payment.success',
      timestamp: new Date().toISOString(),
      data: {
        transactionId: 'trx_849201948',
        amount: 249000,
        currency: 'IDR',
        paymentMethod: 'QRIS_INSTANT',
        customer: {
          name: 'Al Husain Developer',
          email: 'developer@company.io',
          tier: 'Pro'
        },
        status: 'SUCCESS'
      }
    }
  },
  {
    id: 'quota.threshold_warning',
    name: 'Quota Threshold (80%)',
    nameId: 'Peringatan Kuota 80%',
    description: 'Triggered when an API Key reaches 80% of its monthly limit.',
    descriptionId: 'Dipicu saat penggunaan API Key mencapai 80% kuota bulanan.',
    defaultPayload: {
      id: 'evt_quota_554129',
      event: 'quota.threshold_warning',
      timestamp: new Date().toISOString(),
      data: {
        apiKeyName: 'Production Gateway Key',
        usedRequests: 20000,
        maxMonthlyQuota: 25000,
        usagePercentage: 80,
        ownerEmail: 'developer@company.io',
        alertLevel: 'WARNING'
      }
    }
  },
  {
    id: 'user.account_created',
    name: 'User Registered',
    nameId: 'Pendaftaran Akun Baru',
    description: 'Triggered when a new user signs up.',
    descriptionId: 'Dipicu ketika pengguna baru mendaftar di portal.',
    defaultPayload: {
      id: 'evt_usr_119482',
      event: 'user.account_created',
      timestamp: new Date().toISOString(),
      data: {
        userId: 'usr_new_9812',
        name: 'Sarah Wijaya',
        email: 'sarah.w@startup.id',
        role: 'user',
        tier: 'Free',
        registeredAt: new Date().toISOString()
      }
    }
  },
  {
    id: 'incident.reported',
    name: 'Security Incident',
    nameId: 'Peringatan Insiden Firewall',
    description: 'Triggered when abnormal brute force or rate spikes are detected.',
    descriptionId: 'Dipicu ketika terdeteksi lonjakan anomali atau blokir IP.',
    defaultPayload: {
      id: 'evt_sec_330912',
      event: 'incident.reported',
      timestamp: new Date().toISOString(),
      data: {
        incidentType: 'RATE_LIMIT_FLOOD',
        blockedIp: '198.51.100.42',
        requestsPerSecond: 145,
        actionTaken: 'IP_BLOCKED_TEMPORARILY',
        severity: 'HIGH'
      }
    }
  }
];

export const WebhookSimulator: React.FC<WebhookSimulatorProps> = ({ lang }) => {
  const [selectedEventId, setSelectedEventId] = useState('payment.success');
  const [targetUrl, setTargetUrl] = useState(
    typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/mock-receiver` : '/api/webhooks/mock-receiver'
  );
  const [secretKey, setSecretKey] = useState('whsec_studio_demo_secret_2026');
  const [payloadText, setPayloadText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [isDispatching, setIsDispatching] = useState(false);
  const [lastDelivery, setLastDelivery] = useState<WebhookDeliveryItem | null>(null);
  const [history, setHistory] = useState<WebhookDeliveryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);

  const currentPreset = PRESET_EVENTS.find((e) => e.id === selectedEventId) || PRESET_EVENTS[0];

  useEffect(() => {
    setPayloadText(JSON.stringify(currentPreset.defaultPayload, null, 2));
    setJsonError(null);
  }, [selectedEventId]);

  const fetchHistory = () => {
    setLoadingHistory(true);
    fetch('/api/webhooks/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setHistory(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError(null);

    let parsedPayload: any;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (err: any) {
      setJsonError(lang === 'id' ? `Format JSON tidak valid: ${err.message}` : `Invalid JSON format: ${err.message}`);
      return;
    }

    setIsDispatching(true);
    try {
      const res = await fetch('/api/webhooks/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: targetUrl.trim(),
          event: selectedEventId,
          secret: secretKey.trim(),
          payload: parsedPayload
        })
      });
      const data = await res.json();
      if (data.success && data.delivery) {
        setLastDelivery(data.delivery);
        fetchHistory();
      } else {
        setJsonError(data.error || 'Failed to dispatch webhook');
      }
    } catch (err: any) {
      setJsonError('Network Error: ' + err.message);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/30 p-6 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
                <Webhook className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {lang === 'id' ? 'Webhook Simulator & Event Dispatcher' : 'Webhook Simulator & Event Dispatcher'}
                </h1>
                <p className="text-xs text-slate-400">
                  {lang === 'id'
                    ? 'Simulasikan pengiriman webhook real-time dengan verifikasi HMAC SHA-256 dan inspeksi respon.'
                    : 'Simulate real-time webhook deliveries with HMAC SHA-256 signature verification & response inspection.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  setTargetUrl(`${window.location.origin}/api/webhooks/mock-receiver`);
                }
              }}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800 hover:text-white transition flex items-center gap-1.5"
            >
              <Code2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>{lang === 'id' ? 'Gunakan Mock Receiver Bawaan' : 'Use Built-in Mock Receiver'}</span>
            </button>
            <button
              onClick={fetchHistory}
              disabled={loadingHistory}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Event Configuration & Payload */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleDispatch} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 backdrop-blur-sm">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>{lang === 'id' ? '1. Konfigurasi Event & Target Endpoint' : '1. Event & Endpoint Configuration'}</span>
            </h2>

            {/* Event Preset Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {lang === 'id' ? 'Pilih Template Event' : 'Select Event Template'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_EVENTS.map((preset) => {
                  const isSelected = selectedEventId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedEventId(preset.id)}
                      className={`flex flex-col text-left rounded-xl p-2.5 border transition ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-slate-200 font-mono">{preset.id}</span>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {lang === 'id' ? preset.nameId : preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>{lang === 'id' ? 'Target Webhook URL (POST)' : 'Target Webhook URL (POST)'}</span>
                <span className="text-[10px] text-indigo-400 font-mono">Accepts HTTP/HTTPS</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="url"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://your-domain.com/api/webhook"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3.5 font-mono text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Secret Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>{lang === 'id' ? 'Webhook Secret Key (HMAC SHA-256)' : 'Webhook Secret Key (HMAC SHA-256)'}</span>
                <span className="text-[10px] text-slate-400 font-mono">X-Hub-Signature-256</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3.5 font-mono text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Payload Editor */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'id' ? 'JSON Payload Body' : 'JSON Payload Body'}
                </label>
                <button
                  type="button"
                  onClick={() => setPayloadText(JSON.stringify(currentPreset.defaultPayload, null, 2))}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 transition"
                >
                  {lang === 'id' ? 'Reset ke Default' : 'Reset to Default'}
                </button>
              </div>
              <textarea
                rows={9}
                value={payloadText}
                onChange={(e) => {
                  setPayloadText(e.target.value);
                  setJsonError(null);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 font-mono text-xs text-emerald-400 outline-none focus:border-indigo-500 resize-none leading-relaxed"
                placeholder="{}"
              />
            </div>

            {jsonError && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{jsonError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isDispatching}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDispatching ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{lang === 'id' ? 'Mengirim Webhook...' : 'Dispatching Webhook...'}</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>{lang === 'id' ? 'Kirim Webhook Sekarang' : 'Dispatch Webhook Now'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Result: Live Inspection & Security */}
        <div className="lg:col-span-5 space-y-5">
          {/* Latest Delivery Result Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3.5 backdrop-blur-sm">
            <h2 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>{lang === 'id' ? 'Hasil Pengiriman Terakhir' : 'Latest Delivery Inspection'}</span>
              </span>
              {lastDelivery && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    lastDelivery.success
                      ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                      : 'border border-rose-500/40 bg-rose-500/15 text-rose-300'
                  }`}
                >
                  HTTP {lastDelivery.status} {lastDelivery.statusText}
                </span>
              )}
            </h2>

            {lastDelivery ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                    <span className="text-[10px] text-slate-400 block">{lang === 'id' ? 'Waktu Respon' : 'Latency'}</span>
                    <span className="font-mono font-bold text-white">{lastDelivery.latencyMs} ms</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                    <span className="text-[10px] text-slate-400 block">{lang === 'id' ? 'ID Pengiriman' : 'Delivery ID'}</span>
                    <span className="font-mono font-bold text-indigo-300 text-[11px] truncate block">
                      {lastDelivery.id}
                    </span>
                  </div>
                </div>

                {/* Signature Hash Header */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-400">Header X-Hub-Signature-256</span>
                    <button
                      onClick={() => handleCopy(lastDelivery.signature, 'sig')}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      {copied === 'sig' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span className="text-[10px]">{copied === 'sig' ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-[10px] text-emerald-400 break-all bg-slate-900/80 p-1.5 rounded">
                    {lastDelivery.signature}
                  </p>
                </div>

                {/* Target Response Body Preview */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    {lang === 'id' ? 'Respon Body dari Server Target' : 'Target Server Response Body'}
                  </span>
                  <pre className="font-mono text-[10px] text-slate-300 bg-slate-900/80 p-2 rounded max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {lastDelivery.responseBodyPreview || '[Empty Response]'}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-500 space-y-2">
                <Clock className="h-8 w-8 mx-auto text-slate-600 opacity-60" />
                <p className="text-xs">
                  {lang === 'id'
                    ? 'Belum ada webhook yang dikirim. Klik tombol "Kirim Webhook Sekarang" untuk menguji.'
                    : 'No webhook dispatched yet. Click "Dispatch Webhook Now" to test.'}
                </p>
              </div>
            )}
          </div>

          {/* Verification Code Guide snippet */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>{lang === 'id' ? 'Cara Verifikasi di Backend Anda (Node.js)' : 'How to Verify Signature (Node.js)'}</span>
            </span>
            <pre className="font-mono text-[10px] text-slate-400 bg-slate-900 p-2.5 rounded-xl overflow-x-auto leading-relaxed">
{`const crypto = require('crypto');
const expected = 'sha256=' + crypto
  .createHmac('sha256', SECRET)
  .update(rawBody)
  .digest('hex');

if (req.headers['x-hub-signature-256'] === expected) {
  // ✅ Signature Valid!
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span>{lang === 'id' ? 'Riwayat Pengiriman Webhook (Audit Trail)' : 'Webhook Delivery History'}</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">{history.length} events logged</span>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                <tr>
                  <th className="pb-2.5">{lang === 'id' ? 'Status' : 'Status'}</th>
                  <th className="pb-2.5">{lang === 'id' ? 'Event' : 'Event'}</th>
                  <th className="pb-2.5">{lang === 'id' ? 'Target URL' : 'Target URL'}</th>
                  <th className="pb-2.5">{lang === 'id' ? 'Latency' : 'Latency'}</th>
                  <th className="pb-2.5">{lang === 'id' ? 'Waktu' : 'Timestamp'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 pr-2">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                          h.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {h.status} {h.statusText}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-indigo-300 font-bold">{h.event}</td>
                    <td className="py-2.5 pr-2 text-slate-300 truncate max-w-[200px]" title={h.targetUrl}>
                      {h.targetUrl}
                    </td>
                    <td className="py-2.5 pr-2 text-slate-400">{h.latencyMs}ms</td>
                    <td className="py-2.5 text-slate-500 text-[10px]">
                      {new Date(h.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            {lang === 'id' ? 'Belum ada log riwayat webhook.' : 'No webhook dispatch history found.'}
          </div>
        )}
      </div>
    </div>
  );
};
