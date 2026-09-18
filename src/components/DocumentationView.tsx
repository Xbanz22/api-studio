import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Copy,
  Check,
  Shield,
  Zap,
  Terminal,
  FileCode,
  Layers,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ApiEndpoint, MockRouteItem } from '../types';
import { JsonViewer } from './JsonViewer';

interface DocumentationViewProps {
  endpoints: ApiEndpoint[];
  mockRoutes?: MockRouteItem[];
  lang: 'id' | 'en';
  onSelectEndpoint?: (endpoint: ApiEndpoint) => void;
  onSelectMockRoute?: (route: MockRouteItem) => void;
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({
  endpoints,
  mockRoutes = [],
  lang,
  onSelectEndpoint,
  onSelectMockRoute,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [openApiSpec, setOpenApiSpec] = useState<any>(null);
  const [isLoadingSpec, setIsLoadingSpec] = useState(false);

  const baseUrl = window.location.origin;

  const handleCopyBaseUrl = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleLoadOpenApi = async () => {
    setIsLoadingSpec(true);
    try {
      const res = await fetch('/api/docs/openapi.json');
      const data = await res.json();
      setOpenApiSpec(data);
    } catch (err: any) {
      alert('Failed to load OpenAPI spec: ' + err.message);
    } finally {
      setIsLoadingSpec(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 max-w-5xl mx-auto">
      
      {/* Hero Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
          <BookOpen className="h-4 w-4" />
          <span>{lang === 'id' ? 'Panduan Integrasi & Referensi API' : 'API Reference & Integration Guide'}</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
          REST API Hub & Studio Documentation
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          {lang === 'id'
            ? 'Dokumentasi standar arsitektur RESTful lengkap. Semua endpoint mengembalikan payload JSON terstandar, mendukung CORS lintas domain, dan dilengkapi otentikasi API Key.'
            : 'Standardized RESTful architecture documentation. All endpoints return consistent JSON payloads, support CORS across domains, and provide optional API Key authentication.'}
        </p>

        {/* Base URL Pill */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 font-mono text-xs text-slate-200">
            <span className="text-slate-500 mr-2">Base URL:</span>
            <span className="text-cyan-400 font-semibold">{baseUrl}</span>
          </div>

          <button
            onClick={handleCopyBaseUrl}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            {copiedUrl ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Base URL</span>
              </>
            )}
          </button>

          <a
            href="/api/docs/openapi.json"
            download="openapi.json"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export OpenAPI 3.0 Spec</span>
          </a>
        </div>
      </div>

      {/* 1. Quick Start Guide */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="h-5 w-5 text-indigo-400" />
          <span>{lang === 'id' ? 'Langkah Cepat Memulai (Quick Start)' : 'Quick Start Integration'}</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Card 1: cURL */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">1. cURL Command Line</span>
              <span className="font-mono text-[10px] text-slate-500">Terminal / Shell</span>
            </div>
            <pre className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
{`curl -X GET "${baseUrl}/api/status" \\
  -H "Accept: application/json"`}
            </pre>
          </div>

          {/* Card 2: JavaScript */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">2. JavaScript (Fetch API)</span>
              <span className="font-mono text-[10px] text-slate-500">Frontend / Node</span>
            </div>
            <pre className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
{`const res = await fetch("${baseUrl}/api/data/users");
const data = await res.json();
console.log(data);`}
            </pre>
          </div>
        </div>
      </section>

      {/* 2. Authentication & Rate Limiting */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-400" />
          <span>{lang === 'id' ? 'Otentikasi & Keamanan (API Keys)' : 'Authentication & Rate Limiting'}</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          {lang === 'id'
            ? 'Endpoint publik dapat dipanggil secara langsung. Untuk akses khusus, otentikasi dapat dilewatkan melalui HTTP Header atau URL Query Parameter:'
            : 'Public endpoints can be called directly. For protected quota access, authenticate via HTTP Headers or URL Query parameters:'}
        </p>

        <div className="space-y-2 font-mono text-xs">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-300">
            <span className="text-indigo-400 font-semibold">Header HTTP (Direkomendasikan):</span><br />
            <code className="text-emerald-400">x-api-key: api_pro_xxxxxxxxxxxxxxxxxxxxxx</code>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-300">
            <span className="text-cyan-400 font-semibold">Query Parameter (Alternatif):</span><br />
            <code className="text-cyan-300">{baseUrl}/api/data/users?apiKey=api_pro_xxxxxxxxxxxx</code>
          </div>
        </div>
      </section>

      {/* 3. HTTP Status Codes & Error Formats */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" />
          <span>{lang === 'id' ? 'Standar Kode Status HTTP & Respons Error' : 'HTTP Status Codes & Error Schemas'}</span>
        </h2>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-1">
            <span className="font-mono text-xs font-bold text-emerald-400">200 OK / 201 Created</span>
            <p className="text-[11px] text-slate-400">Permintaan berhasil diproses dan mengembalikan data yang diminta.</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-1">
            <span className="font-mono text-xs font-bold text-amber-400">400 Bad Request</span>
            <p className="text-[11px] text-slate-400">Parameter atau payload JSON yang dikirimkan tidak valid atau kurang.</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-1">
            <span className="font-mono text-xs font-bold text-rose-400">404 Not Found</span>
            <p className="text-[11px] text-slate-400">Resource dengan ID atau path yang diminta tidak ditemukan.</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-1">
            <span className="font-mono text-xs font-bold text-purple-400">429 Rate Limit Exceeded</span>
            <p className="text-[11px] text-slate-400">Jumlah permintaan melebihi kuota batas per menit API Key Anda.</p>
          </div>
        </div>
      </section>

      {/* 4. Complete Endpoints Directory */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-400" />
          <span>{lang === 'id' ? 'Direktori Lengkap Semua Endpoint API' : 'All Built-in REST Endpoints'}</span>
        </h2>

        <div className="space-y-2">
          {endpoints.map((ep) => (
            <div
              key={ep.id}
              onClick={() => onSelectEndpoint && onSelectEndpoint(ep)}
              className="flex flex-wrap items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 gap-2 transition hover:border-indigo-500/50 hover:bg-slate-900/80 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`rounded border px-2 py-0.5 font-mono text-xs font-bold ${
                    ep.method === 'GET'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : ep.method === 'POST'
                      ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                      : ep.method === 'PUT'
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {ep.method}
                </span>
                <div>
                  <p className="font-mono text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {ep.path}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'id' ? ep.summaryId : ep.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
                  {ep.category.toUpperCase()}
                </span>
                {onSelectEndpoint && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEndpoint(ep);
                    }}
                    className="flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20"
                  >
                    <span>{lang === 'id' ? 'Tes di Playground' : 'Test in Playground'}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Custom Mock Endpoints Directory (If Any) */}
      {mockRoutes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <span>{lang === 'id' ? 'Mock API Kustom Aktif (User-Defined)' : 'Active Custom Mock Endpoints'}</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">{mockRoutes.length} Endpoint Aktif</span>
          </div>

          <div className="space-y-2">
            {mockRoutes.map((mr) => (
              <div
                key={mr.id}
                onClick={() => onSelectMockRoute && onSelectMockRoute(mr)}
                className="flex flex-wrap items-center justify-between rounded-xl border border-cyan-900/40 bg-slate-900/40 p-3.5 gap-2 transition hover:border-cyan-500/50 hover:bg-slate-900/80 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-xs font-bold ${
                      mr.method === 'GET'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : mr.method === 'POST'
                        ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                        : mr.method === 'PUT'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {mr.method}
                  </span>
                  <div>
                    <p className="font-mono text-xs font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors">
                      {mr.path.startsWith('/') ? mr.path : `/${mr.path}`}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {(mr as any).name || 'Mock Route'} &bull; HTTP Status: {mr.status} &bull; Delay: {mr.delayMs}ms
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-0.5 text-[10px] font-medium text-cyan-300">
                    MOCK API
                  </span>
                  {onSelectMockRoute && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMockRoute(mr);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
                    >
                      <span>{lang === 'id' ? 'Tes di Playground' : 'Test in Playground'}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Live OpenAPI Spec Viewer */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">OpenAPI 3.0 Live Schema Viewer</h2>
          </div>
          <button
            onClick={handleLoadOpenApi}
            disabled={isLoadingSpec}
            className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20"
          >
            {isLoadingSpec ? 'Loading...' : openApiSpec ? 'Reload Schema' : 'Load Full Schema'}
          </button>
        </div>

        {openApiSpec && (
          <JsonViewer data={openApiSpec} maxHeight="350px" />
        )}
      </section>

    </div>
  );
};
