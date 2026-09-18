import React, { useState } from 'react';
import {
  Database,
  Plus,
  Trash2,
  Play,
  Copy,
  Check,
  Code2,
  Sparkles,
  AlertCircle,
  Clock,
  Layers,
  HelpCircle,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
  CreditCard,
  Bot,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Wand2,
  Terminal,
  Eye,
  FileCode,
  CheckCircle2,
  Sliders,
  ListPlus,
  Search
} from 'lucide-react';
import { MockRouteItem } from '../types';
import { JsonViewer } from './JsonViewer';

interface MockApiBuilderProps {
  mockRoutes: MockRouteItem[];
  onRefreshRoutes: () => void;
  onSelectMockRouteForTesting: (mock: MockRouteItem) => void;
  lang: 'id' | 'en';
}

interface PresetTemplate {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  path: string;
  method: string;
  status: number;
  delayMs: number;
  payload: any;
}

interface VisualField {
  id: string;
  key: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  value: string;
}

// Robust Multi-Pass Intelligent JSON Repair Engine
function smartRepairJson(input: string): { success: boolean; data?: any; formatted?: string; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    const fallback = { success: true, message: 'Halo dari Mock API Studio!' };
    return { success: true, data: fallback, formatted: JSON.stringify(fallback, null, 2) };
  }

  // 1. Direct standard JSON.parse
  try {
    const direct = JSON.parse(trimmed);
    return { success: true, data: direct, formatted: JSON.stringify(direct, null, 2) };
  } catch (e) {}

  // 2. Safe JavaScript Object literal evaluation
  // (Solves unquoted keys, single quotes, trailing commas, comments, etc.)
  try {
    const fn = new Function(`return (${trimmed});`);
    const evaluated = fn();
    if (evaluated !== undefined && evaluated !== null) {
      return { success: true, data: evaluated, formatted: JSON.stringify(evaluated, null, 2) };
    }
  } catch (e) {}

  // 3. Multi-Pass Heuristics Healing
  try {
    let text = trimmed;

    // Strip single & multiline comments
    text = text.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

    // Replace single quotes with double quotes
    text = text.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');

    // Fix unquoted object keys (e.g. { name: "John", age: 30 } -> { "name": "John", "age": 30 })
    text = text.replace(/([{,]\s*)([a-zA-Z0-9_$@-]+)\s*:/g, '$1"$2":');

    // Fix missing commas between lines
    text = text.replace(/(["\d\]\}\btrue\b|\bfalse\b|\bnull\b])\s*\n\s*(["{a-zA-Z0-9_$])/g, '$1,\n$2');

    // Remove trailing commas before } or ]
    text = text.replace(/,\s*([\]\}])/g, '$1');

    // Balance unclosed braces { } and [ ]
    const openCurly = (text.match(/\{/g) || []).length;
    let closeCurly = (text.match(/\}/g) || []).length;
    while (closeCurly < openCurly) {
      text += '\n}';
      closeCurly++;
    }

    const openSquare = (text.match(/\[/g) || []).length;
    let closeSquare = (text.match(/\]/g) || []).length;
    while (closeSquare < openSquare) {
      text += '\n]';
      closeSquare++;
    }

    // Try evaluation after healing
    try {
      const fn = new Function(`return (${text});`);
      const evaluated = fn();
      if (evaluated !== undefined && evaluated !== null) {
        return { success: true, data: evaluated, formatted: JSON.stringify(evaluated, null, 2) };
      }
    } catch (e) {}

    try {
      const parsed = JSON.parse(text);
      return { success: true, data: parsed, formatted: JSON.stringify(parsed, null, 2) };
    } catch (e) {}
  } catch (err) {}

  // 4. Auto-wrap plain text into JSON if not JSON
  try {
    const wrapped = {
      success: true,
      data: trimmed,
      note: 'Dikonversi otomatis ke format JSON yang valid'
    };
    return { success: true, data: wrapped, formatted: JSON.stringify(wrapped, null, 2) };
  } catch (e) {}

  return {
    success: false,
    error: 'Format teks belum bisa dibaca sebagai JSON. Klik tombol "Bungkus Otomatis" atau pilih template di atas.'
  };
}

export const MockApiBuilder: React.FC<MockApiBuilderProps> = ({
  mockRoutes,
  onRefreshRoutes,
  onSelectMockRouteForTesting,
  lang,
}) => {
  const [pathInput, setPathInput] = useState('shop/products');
  const [methodInput, setMethodInput] = useState('GET');
  const [statusInput, setStatusInput] = useState(200);
  const [delayInput, setDelayInput] = useState(150);
  const [editorMode, setEditorMode] = useState<'code' | 'visual'>('code');

  const [responseBodyText, setResponseBodyText] = useState(
    JSON.stringify(
      {
        success: true,
        message: 'Daftar produk berhasil dimuat!',
        total: 2,
        data: [
          { id: 101, name: 'Sepatu Sneakers Ultra', price: 350000, stock: 12, rating: 4.8 },
          { id: 102, name: 'Kaos Oversize Vintage', price: 95000, stock: 45, rating: 4.9 }
        ]
      },
      null,
      2
    )
  );

  // Visual Form Fields (For beginners who don't want to write JSON manually)
  const [visualFields, setVisualFields] = useState<VisualField[]>([
    { id: '1', key: 'success', type: 'boolean', value: 'true' },
    { id: '2', key: 'message', type: 'string', value: 'Data berhasil diambil!' },
    { id: '3', key: 'nama_barang', type: 'string', value: 'Laptop Gaming Pro' },
    { id: '4', key: 'harga', type: 'number', value: '15000000' },
    { id: '5', key: 'stok_tersedia', type: 'number', value: '25' }
  ]);

  const [bodyError, setBodyError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activeTestResult, setActiveTestResult] = useState<{ id: string; data: any; status: number; latency: number } | null>(null);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>('ecommerce');
  const [autoFixSuccessMsg, setAutoFixSuccessMsg] = useState<string | null>(null);

  // Preset Template Library
  const presetTemplates: PresetTemplate[] = [
    {
      id: 'pinterest_scraper',
      name: 'Pinterest Scraper & Pin Search',
      category: 'Scraper & Media',
      icon: <Search className="h-4 w-4 text-rose-400" />,
      description: 'Mock data pencarian pin Pinterest dengan query {{q}}, gambar resolusi tinggi, dan jumlah likes.',
      path: 'search/pinterest',
      method: 'GET',
      status: 200,
      delayMs: 120,
      payload: {
        success: true,
        query: '{{q}}',
        total: 2,
        source: 'Pinterest Pin Search Engine',
        data: [
          {
            id: 'pin_9921',
            title: 'Inspirasi Estetika {{q}} #1',
            description: 'Koleksi pin estetika untuk pencarian {{q}}.',
            image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
            pinUrl: 'https://www.pinterest.com/pin/9921/',
            author: '@creator_aesthetic',
            likes: 342,
            repinCount: 105
          },
          {
            id: 'pin_9922',
            title: 'Wallpaper & Moodboard {{q}} #2',
            description: 'Foto HD Pinterest inspirasi {{q}}.',
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
            pinUrl: 'https://www.pinterest.com/pin/9922/',
            author: '@pins_designer',
            likes: 820,
            repinCount: 240
          }
        ]
      }
    },
    {
      id: 'ecommerce',
      name: 'E-Commerce / Produk Toko',
      category: 'Toko Online',
      icon: <ShoppingBag className="h-4 w-4 text-emerald-400" />,
      description: 'Respon daftar produk dengan nama, harga, stok, dan rating bintang.',
      path: 'shop/products',
      method: 'GET',
      status: 200,
      delayMs: 150,
      payload: {
        success: true,
        message: 'Daftar produk berhasil dimuat!',
        total: 2,
        data: [
          { id: 101, name: 'Sepatu Sneakers Ultra', price: 350000, stock: 12, rating: 4.8 },
          { id: 102, name: 'Kaos Oversize Vintage', price: 95000, stock: 45, rating: 4.9 }
        ]
      }
    },
    {
      id: 'auth_success',
      name: 'User Login & Profil JWT',
      category: 'Autentikasi',
      icon: <UserCheck className="h-4 w-4 text-sky-400" />,
      description: 'Simulasi login berhasil dengan Bearer token dan data profil developer.',
      path: 'auth/user-profile',
      method: 'POST',
      status: 200,
      delayMs: 200,
      payload: {
        success: true,
        message: 'Login berhasil! Selamat datang kembali.',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfODkzMjEiLCJlbWFpbCI6ImRldkBhcGlzdHVkaW8uZGV2In0',
        user: {
          id: 'usr_89321',
          name: 'Dimas Pratama',
          email: 'dimas.pratama@apistudio.dev',
          role: 'Admin',
          balance: 1500000
        }
      }
    },
    {
      id: 'payment_success',
      name: 'Transaksi QRIS / Checkout',
      category: 'Fintech & Payment',
      icon: <CreditCard className="h-4 w-4 text-indigo-400" />,
      description: 'Respon callback transaksi QRIS atau Virtual Account berstatus PAID.',
      path: 'payments/qris-callback',
      method: 'POST',
      status: 201,
      delayMs: 300,
      payload: {
        status: 'PAID',
        transactionId: 'TRX-2026-QRIS-99201',
        amount: 250000,
        fee: 1500,
        paymentMethod: 'QRIS_INSTANT',
        paidAt: new Date().toISOString(),
        customer: {
          name: 'Pelanggan Setia',
          phone: '081234567890'
        }
      }
    },
    {
      id: 'ai_response',
      name: 'AI Chatbot Generator',
      category: 'Kecerdasan Buatan',
      icon: <Bot className="h-4 w-4 text-purple-400" />,
      description: 'Respon teks cerdas ala Gemini/ChatGPT beserta statistik token.',
      path: 'ai/assistant-reply',
      method: 'POST',
      status: 200,
      delayMs: 500,
      payload: {
        model: 'gemini-3.7-flash',
        reply: 'Halo! Mock API ini siap digunakan untuk aplikasi frontend Anda. Data ini bisa Anda ubah sesuka hati!',
        tokensUsed: { prompt: 24, completion: 45, total: 69 },
        confidence: 0.98
      }
    },
    {
      id: 'crypto_prices',
      name: 'Crypto & Harga Koin',
      category: 'Pasar & Keuangan',
      icon: <TrendingUp className="h-4 w-4 text-amber-400" />,
      description: 'Data pasar mata uang kripto (Bitcoin, Ethereum, Solana) dalam Rupiah.',
      path: 'market/crypto-rates',
      method: 'GET',
      status: 200,
      delayMs: 100,
      payload: {
        currency: 'IDR',
        updatedAt: new Date().toISOString(),
        market: [
          { symbol: 'BTC/IDR', price: 1450000000, change24h: '+3.4%' },
          { symbol: 'ETH/IDR', price: 56000000, change24h: '+1.8%' },
          { symbol: 'SOL/IDR', price: 3200000, change24h: '+7.2%' }
        ]
      }
    },
    {
      id: 'error_simulation',
      name: 'Simulasi Error 400 / 500',
      category: 'Testing Error Frontend',
      icon: <AlertTriangle className="h-4 w-4 text-rose-400" />,
      description: 'Endpoint sengaja dibuat error untuk mengetes tampilan pop-up error di aplikasi Anda.',
      path: 'test/simulate-error',
      method: 'GET',
      status: 400,
      delayMs: 150,
      payload: {
        success: false,
        error: 'Bad Request: Parameter [account_id] tidak boleh kosong.',
        code: 'ERR_INVALID_PARAM',
        documentationUrl: 'https://docs.apistudio.dev/errors'
      }
    }
  ];

  // Apply a Preset Template
  const handleApplyPreset = (preset: PresetTemplate) => {
    setActivePreset(preset.id);
    setPathInput(preset.path);
    setMethodInput(preset.method);
    setStatusInput(preset.status);
    setDelayInput(preset.delayMs);
    setResponseBodyText(JSON.stringify(preset.payload, null, 2));
    setBodyError(null);
    setAutoFixSuccessMsg(null);
  };

  // Convert Visual Fields to JSON string
  const syncVisualFieldsToJson = (fields: VisualField[]) => {
    const obj: any = {};
    fields.forEach((f) => {
      if (!f.key.trim()) return;
      if (f.type === 'number') {
        obj[f.key] = Number(f.value) || 0;
      } else if (f.type === 'boolean') {
        obj[f.key] = f.value === 'true';
      } else if (f.type === 'array') {
        obj[f.key] = f.value.split(',').map((s) => s.trim()).filter(Boolean);
      } else {
        obj[f.key] = f.value;
      }
    });
    setResponseBodyText(JSON.stringify(obj, null, 2));
    setBodyError(null);
  };

  const handleAddVisualField = () => {
    const newField: VisualField = {
      id: Math.random().toString(),
      key: 'field_' + (visualFields.length + 1),
      type: 'string',
      value: 'contoh nilai'
    };
    const updated = [...visualFields, newField];
    setVisualFields(updated);
    syncVisualFieldsToJson(updated);
  };

  const handleUpdateVisualField = (id: string, updates: Partial<VisualField>) => {
    const updated = visualFields.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setVisualFields(updated);
    syncVisualFieldsToJson(updated);
  };

  const handleRemoveVisualField = (id: string) => {
    const updated = visualFields.filter((f) => f.id !== id);
    setVisualFields(updated);
    syncVisualFieldsToJson(updated);
  };

  // Format JSON
  const handleFormatJson = () => {
    const result = smartRepairJson(responseBodyText);
    if (result.success && result.formatted) {
      setResponseBodyText(result.formatted);
      setBodyError(null);
      setAutoFixSuccessMsg('JSON berhasil dirapikan!');
      setTimeout(() => setAutoFixSuccessMsg(null), 3000);
    } else {
      setBodyError(result.error || 'Format JSON tidak valid');
    }
  };

  // Auto-Fix JSON with Multi-Pass Engine
  const handleAutoFixJson = () => {
    const result = smartRepairJson(responseBodyText);
    if (result.success && result.formatted) {
      setResponseBodyText(result.formatted);
      setBodyError(null);
      setAutoFixSuccessMsg('✨ JSON berhasil diperbaiki dan diformat otomatis!');
      setTimeout(() => setAutoFixSuccessMsg(null), 3500);
    } else {
      setBodyError(result.error || 'Gagal memperbaiki. Klik tombol "Bungkus Otomatis" di bawah.');
    }
  };

  // Wrap arbitrary text as valid JSON
  const handleWrapAsJson = () => {
    const fallback = {
      success: true,
      text_data: responseBodyText.trim() || 'Contoh data respon',
      timestamp: new Date().toISOString()
    };
    setResponseBodyText(JSON.stringify(fallback, null, 2));
    setBodyError(null);
    setAutoFixSuccessMsg('Teks berhasil dibungkus ke format JSON valid!');
    setTimeout(() => setAutoFixSuccessMsg(null), 3000);
  };

  // Create Mock Handler
  const handleCreateMock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathInput.trim()) return;

    const result = smartRepairJson(responseBodyText);
    if (!result.success) {
      setBodyError(result.error || 'Format JSON tidak valid. Klik Auto-Fix terlebih dahulu.');
      return;
    }

    const parsedBody = result.data;
    setIsSubmitting(true);
    try {
      const cleanPath = pathInput.trim().replace(/^\/+|\/+$/g, '');
      const res = await fetch('/api/mock-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: cleanPath,
          method: methodInput,
          status: Number(statusInput) || 200,
          delayMs: Number(delayInput) || 0,
          responseBody: parsedBody
        })
      });

      const data = await res.json();
      if (data.success) {
        setBodyError(null);
        onRefreshRoutes();
        // Trigger quick test preview for the new route
        handleQuickTest({
          id: data.data?.id || 'mr_new',
          path: cleanPath,
          method: methodInput,
          status: Number(statusInput) || 200,
          delayMs: Number(delayInput) || 0,
          responseBody: parsedBody,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      alert('Error creating mock endpoint: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Mock
  const handleDeleteMock = async (id: string) => {
    if (!confirm(lang === 'id' ? 'Hapus endpoint mock ini? Anda selalu bisa membuatnya kembali kapan saja.' : 'Delete this mock endpoint?')) return;
    try {
      await fetch(`/api/mock-routes/${id}`, { method: 'DELETE' });
      onRefreshRoutes();
      if (activeTestResult?.id === id) {
        setActiveTestResult(null);
      }
    } catch (err: any) {
      alert('Error deleting mock: ' + err.message);
    }
  };

  // Get Best Public Base URL for External Testing (cURL, Postman, Telegram Bot)
  const getPublicBaseUrl = () => {
    const origin = window.location.origin;
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
    return origin;
  };

  // Copy Full URL
  const handleCopyUrl = (mockPath: string, forcePublic = true) => {
    const base = forcePublic ? getPublicBaseUrl() : window.location.origin;
    const full = `${base}/api/m/${mockPath}`;
    navigator.clipboard.writeText(full);
    setCopiedPath(mockPath);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  // Copy Code Snippet (cURL / JS Fetch)
  const handleCopyCodeSnippet = (mock: MockRouteItem, format: 'curl' | 'fetch') => {
    const publicUrl = `${getPublicBaseUrl()}/api/m/${mock.path}`;
    let snippet = '';
    if (format === 'curl') {
      snippet = `curl -L -X ${mock.method} "${publicUrl}"`;
    } else {
      snippet = `fetch("${publicUrl}", { method: "${mock.method}" })\n  .then(res => res.json())\n  .then(data => console.log(data));`;
    }
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(mock.id + '_' + format);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // Quick Test execution
  const handleQuickTest = async (mock: MockRouteItem) => {
    setIsTesting(mock.id);
    const start = performance.now();
    try {
      const res = await fetch(`/api/m/${mock.path}`, {
        method: mock.method === 'ALL' ? 'GET' : mock.method
      });
      const data = await res.json();
      const elapsed = Math.round(performance.now() - start);
      setActiveTestResult({ id: mock.id, data, status: res.status, latency: elapsed });
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setActiveTestResult({ id: mock.id, data: { error: err.message }, status: 500, latency: elapsed });
    } finally {
      setIsTesting(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-300">
                  Instant Mock REST API Engine
                </span>
                <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                  ● 100% AMAN & TANPA KODING
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                {lang === 'id' ? 'Mock REST API Generator' : 'Mock REST API Studio'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-3xl">
                {lang === 'id'
                  ? 'Bingung atau takut salah? Tenang! Mock API adalah fitur untuk membuat API tiruan (palsu) yang 100% aman. Sangat cocok untuk menguji frontend, mobile app, atau prototipe tanpa merusak database apapun.'
                  : 'Create instant mock REST endpoints with custom JSON responses, HTTP status codes, and latency simulation.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Easy Explanation Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5 flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs text-emerald-200/90 leading-relaxed flex-1">
            <p className="font-bold text-emerald-300 text-sm">
              💡 Apa itu Mock API & Kenapa 100% Aman?
            </p>
            <p>
              <strong>Mock API</strong> adalah data tiruan. Jika salah ketik atau ingin mengganti datanya, <strong>tidak akan merusak sistem apapun</strong>. Bisa diubah atau dihapus kapan saja!
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 sm:p-5 flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Terminal className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs text-cyan-200/90 leading-relaxed flex-1">
            <p className="font-bold text-cyan-300 text-sm">
              🌐 Tips Menembak API dari cURL / Postman / Bot:
            </p>
            <p>
              Gunakan URL Publik (<strong>ais-pre-...</strong>) bukan domain internal editor (ais-dev). Tombol <strong>"Salin URL"</strong> dan <strong>"cURL"</strong> di bawah sudah otomatis memakai format publik!
            </p>
          </div>
        </div>
      </div>

      {/* Preset 1-Click Templates Selector */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-cyan-400" />
            <span>Pilih Template Siap Pakai (1-Klik Jadi):</span>
          </h2>
          <span className="text-[11px] text-slate-400">Klik salah satu kotak di bawah untuk mengisi form otomatis 👇</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {presetTemplates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleApplyPreset(tpl)}
              className={`text-left rounded-xl border p-3.5 transition flex flex-col justify-between space-y-2 ${
                activePreset === tpl.id
                  ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500/50'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {tpl.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{tpl.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">/api/m/{tpl.path}</span>
                  </div>
                </div>
                <span className="rounded bg-slate-900 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-400 border border-slate-800">
                  {tpl.method}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {tpl.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Mock Builder Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Builder Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-cyan-400" />
                <span>Kustomisasi Endpoint Mock</span>
              </h2>

              <div className="flex items-center gap-2">
                {/* Editor Mode Switch */}
                <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-0.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setEditorMode('code')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${
                      editorMode === 'code' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    <span>Mode Teks JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('visual')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${
                      editorMode === 'visual' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Mode Form Visual</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPathInput('my-new-endpoint');
                    setMethodInput('GET');
                    setStatusInput(200);
                    setDelayInput(0);
                    setResponseBodyText(JSON.stringify({ success: true, message: 'Halo dunia dari mock baru!' }, null, 2));
                    setBodyError(null);
                    setActivePreset(null);
                    setAutoFixSuccessMsg(null);
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateMock} className="space-y-4">
              
              {/* Endpoint Path URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Path URL Endpoint</span>
                  <span className="text-[10px] text-slate-400 font-normal">Awalan otomatis <code className="text-cyan-400">/api/m/...</code></span>
                </label>
                <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30">
                  <span className="font-mono text-xs text-cyan-400 font-bold select-none mr-1">/api/m/</span>
                  <input
                    type="text"
                    required
                    value={pathInput}
                    onChange={(e) => setPathInput(e.target.value)}
                    placeholder="contoh: user/profile atau toko/barang"
                    className="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder-slate-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Ketik nama url sesuka Anda. Contoh: jika Anda mengisi <code>produk/sepatu</code>, maka url lengkapnya adalah <code>/api/m/produk/sepatu</code>.
                </p>
              </div>

              {/* Method, Status, & Delay Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Method */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">HTTP Method</label>
                  <select
                    value={methodInput}
                    onChange={(e) => setMethodInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-500"
                  >
                    <option value="GET">GET (Ambil Data)</option>
                    <option value="POST">POST (Kirim / Simpan)</option>
                    <option value="PUT">PUT (Ubah Data)</option>
                    <option value="DELETE">DELETE (Hapus)</option>
                    <option value="ALL">ALL (Semua Method)</option>
                  </select>
                </div>

                {/* Status Code */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">HTTP Status Respon</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-500"
                  >
                    <option value={200}>200 - OK (Sukses)</option>
                    <option value={201}>201 - Created (Berhasil Dibuat)</option>
                    <option value={204}>204 - No Content</option>
                    <option value={400}>400 - Bad Request (Error Client)</option>
                    <option value={401}>401 - Unauthorized (Butuh Login)</option>
                    <option value={404}>404 - Not Found (Tidak Ditemukan)</option>
                    <option value={500}>500 - Server Error</option>
                  </select>
                </div>

                {/* Latency Delay */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Simulasi Delay / Lag</label>
                  <select
                    value={delayInput}
                    onChange={(e) => setDelayInput(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value={0}>0ms (Sangat Cepat / Kilat)</option>
                    <option value={150}>150ms (Normal Realistis)</option>
                    <option value={500}>500ms (Sedang)</option>
                    <option value={1500}>1500ms (Simulasi Jaringan Lambat)</option>
                  </select>
                </div>
              </div>

              {/* EDITOR MODE 1: VISUAL FORM BUILDER (No coding needed) */}
              {editorMode === 'visual' && (
                <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Form Builder Visual (Anti-Error)</span>
                      <span className="text-[11px] text-slate-400">Tambah nama kolom dan isinya langsung tanpa pusing tanda kutip/kurung.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVisualField}
                      className="flex items-center gap-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Kolom</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {visualFields.map((field) => (
                      <div key={field.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-2">
                        {/* Key */}
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) => handleUpdateVisualField(field.id, { key: e.target.value })}
                          placeholder="Nama Kolom (contoh: harga)"
                          className="w-1/3 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-white outline-none focus:border-cyan-500"
                        />

                        {/* Type */}
                        <select
                          value={field.type}
                          onChange={(e) => handleUpdateVisualField(field.id, { type: e.target.value as any })}
                          className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-300 outline-none"
                        >
                          <option value="string">Teks (String)</option>
                          <option value="number">Angka (Number)</option>
                          <option value="boolean">Ya/Tidak (Boolean)</option>
                          <option value="array">Daftar Koma (Array)</option>
                        </select>

                        {/* Value */}
                        {field.type === 'boolean' ? (
                          <select
                            value={field.value}
                            onChange={(e) => handleUpdateVisualField(field.id, { value: e.target.value })}
                            className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none"
                          >
                            <option value="true">true (Ya/Aktif)</option>
                            <option value="false">false (Tidak/Nonaktif)</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleUpdateVisualField(field.id, { value: e.target.value })}
                            placeholder={field.type === 'number' ? '1000' : field.type === 'array' ? 'item1, item2, item3' : 'Isi teks'}
                            className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                          />
                        )}

                        {/* Delete Field */}
                        <button
                          type="button"
                          onClick={() => handleRemoveVisualField(field.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EDITOR MODE 2: CODE JSON EDITOR (With Intelligent Multi-Pass Auto-Fix) */}
              {editorMode === 'code' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span>Isi Respons JSON (Payload Data)</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoFixJson}
                        className="flex items-center gap-1 rounded-lg bg-amber-500/15 border border-amber-500/40 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30 transition shadow-sm"
                        title="Perbaiki otomatis tanda kutip, kurung, dan koma secara cerdas"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span>✨ Auto-Fix Cerdas</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleFormatJson}
                        className="flex items-center gap-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20 transition"
                      >
                        <Code2 className="h-3 w-3" />
                        <span>Rapikan</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={responseBodyText}
                    onChange={(e) => {
                      setResponseBodyText(e.target.value);
                      setBodyError(null);
                      setAutoFixSuccessMsg(null);
                    }}
                    rows={8}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-cyan-200 leading-relaxed outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />

                  {/* Success Toast for Auto-Fix */}
                  {autoFixSuccessMsg && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{autoFixSuccessMsg}</span>
                    </div>
                  )}

                  {/* Error Box with Immediate Recovery Actions */}
                  {bodyError && (
                    <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-bold">Ada sedikit kesalahan format JSON:</span>
                          <p className="text-[11px] text-rose-200/90 mt-0.5">{bodyError}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-500/20">
                        <button
                          type="button"
                          onClick={handleAutoFixJson}
                          className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-500 transition"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Klik Perbaiki Otomatis</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleWrapAsJson}
                          className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:text-white transition"
                        >
                          Bungkus Teks Sebagai Objek JSON
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyPreset(presetTemplates[0])}
                          className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:text-white transition"
                        >
                          Reset ke Template Toko
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit & Deploy Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Endpoint akan langsung aktif tanpa perlu restart server.
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting || !pathInput.trim()}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-900/30 transition hover:bg-cyan-500 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isSubmitting ? 'Menyimpan & Deploy...' : 'Simpan & Aktifkan Mock API 🚀'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): Live Preview Box & Quick Tips */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Realtime Output Simulator Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                <span>Pratinjau Hasil (Live Output):</span>
              </h3>
              <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 border border-emerald-500/30">
                HTTP {statusInput}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-900 pb-1.5">
                <span className="text-cyan-300 font-bold">{methodInput}</span>
                <span className="truncate text-slate-300">/api/m/{pathInput || '...'}</span>
                <span className="text-amber-400">{delayInput}ms</span>
              </div>

              {/* JSON preview display */}
              <div className="max-h-64 overflow-y-auto text-[11px]">
                {(() => {
                  const res = smartRepairJson(responseBodyText);
                  if (res.success && res.data) {
                    return <JsonViewer data={res.data} maxHeight="200px" />;
                  }
                  return (
                    <div className="text-rose-400 text-xs py-4 text-center">
                      ⚠️ Format JSON ada kesalahan penulisan. Klik tombol Auto-Fix di atas.
                    </div>
                  );
                })()}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ini adalah tampilan data yang akan diterima oleh aplikasi (React, Vue, Flutter, Postman, dll) saat memanggil URL mock ini.
            </p>
          </div>

          {/* 3 Steps Guide for Beginners */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>3 Langkah Mudah Menggunakan Mock API:</span>
            </h4>

            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">1</span>
                <p>Pilih template di atas atau ketik nama URL yang kamu mau.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">2</span>
                <p>Klik tombol <strong>"Simpan & Aktifkan Mock API"</strong>.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">3</span>
                <p>Salin URL atau klik <strong>"Tes Cepat"</strong> untuk langsung mencoba!</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Active Mock Endpoints List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Daftar Endpoint Mock Aktif Anda</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Endpoint berikut sedang online dan siap ditembak dari browser, cURL, maupun frontend Anda.
            </p>
          </div>
          <span className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-mono font-bold text-cyan-300">
            {mockRoutes.length} route aktif
          </span>
        </div>

        {mockRoutes.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <Database className="h-6 w-6" />
            </div>
            <p className="text-xs text-slate-400">
              Belum ada endpoint mock yang dibuat. Pilih salah satu template di atas untuk mulai membuat!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockRoutes.map((mock) => (
              <div
                key={mock.id}
                className="rounded-xl border border-slate-800/80 bg-slate-950 p-4 transition hover:border-slate-700 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-300">
                      {mock.method}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-white">
                      /api/m/{mock.path}
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-700">
                      HTTP {mock.status}
                    </span>
                    {mock.delayMs > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                        <Clock className="h-2.5 w-2.5" />
                        {mock.delayMs}ms
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Quick Test Button */}
                    <button
                      onClick={() => handleQuickTest(mock)}
                      disabled={isTesting === mock.id}
                      className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                      <Play className={`h-3 w-3 ${isTesting === mock.id ? 'animate-spin' : ''}`} />
                      <span>{isTesting === mock.id ? 'Menguji...' : 'Tes Cepat'}</span>
                    </button>

                    {/* Copy URL */}
                    <button
                      onClick={() => handleCopyUrl(mock.path)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition"
                      title="Salin Full URL"
                    >
                      {copiedPath === mock.path ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Salin URL</span>
                        </>
                      )}
                    </button>

                    {/* Copy cURL snippet */}
                    <button
                      onClick={() => handleCopyCodeSnippet(mock, 'curl')}
                      className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition"
                      title="Salin perintah cURL"
                    >
                      <Terminal className="h-3 w-3 text-slate-400" />
                      <span>{copiedSnippet === mock.id + '_curl' ? 'cURL Tersalin!' : 'cURL'}</span>
                    </button>

                    {/* Load to Editor to Modify */}
                    <button
                      onClick={() => {
                        setPathInput(mock.path);
                        setMethodInput(mock.method);
                        setStatusInput(mock.status);
                        setDelayInput(mock.delayMs);
                        setResponseBodyText(JSON.stringify(mock.responseBody, null, 2));
                        window.scrollTo({ top: 100, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition"
                      title="Edit di Form"
                    >
                      <Code2 className="h-3 w-3 text-slate-400" />
                      <span>Edit</span>
                    </button>

                    {/* Delete Mock */}
                    <button
                      onClick={() => handleDeleteMock(mock.id)}
                      className="flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition"
                      title="Hapus Mock"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Test Result Viewer */}
                {activeTestResult?.id === mock.id && (
                  <div className="mt-2 rounded-xl border border-cyan-500/30 bg-slate-950 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400">Status: {activeTestResult.status}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-amber-400 font-mono">Latensi: {activeTestResult.latency}ms</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">Response Body Sukses Diterima</span>
                      </div>
                      <button onClick={() => setActiveTestResult(null)} className="text-slate-500 hover:text-white text-xs">
                        Tutup
                      </button>
                    </div>
                    <JsonViewer data={activeTestResult.data} maxHeight="200px" />
                  </div>
                )}

                {/* Default Payload View */}
                {activeTestResult?.id !== mock.id && (
                  <div className="rounded-lg border border-slate-900 bg-slate-900/40 p-3">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Payload JSON Mock:</p>
                    <pre className="font-mono text-[11px] text-cyan-200/90 overflow-x-auto max-h-32">
                      {JSON.stringify(mock.responseBody, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
