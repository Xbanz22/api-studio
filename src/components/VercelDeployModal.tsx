import React, { useState } from 'react';
import {
  Download,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  X,
  Code2,
  CheckCircle2,
  Rocket
} from 'lucide-react';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'id' | 'en';
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cli' | 'github' | 'code'>('cli');

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadPackage = () => {
    window.location.href = '/api/export/vercel';
  };

  const vercelJsonSnippet = `{
  "version": 2,
  "name": "rest-api-studio",
  "builds": [
    { "src": "api/index.js", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white border border-slate-700 shadow-md">
            <svg viewBox="0 0 76 65" className="h-6 w-6 fill-current">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{lang === 'id' ? 'Integrasi & Export Deploy Vercel' : 'Deploy REST API Studio to Vercel'}</span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                Serverless Ready
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'id'
                ? 'Paket export 1-click lengkap dengan vercel.json & Serverless Function Handler'
                : '1-click export bundle complete with vercel.json & Serverless Function Handler'}
            </p>
          </div>
        </div>

        {/* Action Download Box */}
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Rocket className="h-4 w-4 text-emerald-400" />
              <span>{lang === 'id' ? 'Download Paket Vercel Bundle (.zip)' : 'Download Ready-to-Deploy Package (.zip)'}</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {lang === 'id' ? 'Termasuk source code, vercel.json, api/index.js & instruksi CLI' : 'Includes source code, vercel.json, api/index.js & CLI instructions'}
            </p>
          </div>

          <button
            onClick={handleDownloadPackage}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md shadow-emerald-600/30 shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>{lang === 'id' ? 'Download Vercel Package' : 'Download Vercel Package'}</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('cli')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'cli' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'id' ? 'Metode 1: Vercel CLI' : 'Option 1: Vercel CLI'}
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'github' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'id' ? 'Metode 2: Dashboard Web (GitHub)' : 'Option 2: Web Dashboard'}
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'code' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Preview vercel.json
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'cli' && (
          <div className="space-y-3 text-xs text-slate-300">
            <p className="text-slate-400">
              {lang === 'id' ? 'Jalankan perintah berikut di terminal komputer Anda setelah meng-unzip proyek:' : 'Run the following commands in your terminal after extracting the project:'}
            </p>

            <div className="space-y-2 font-mono">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">1. Install Vercel CLI (Global)</span>
                  <span className="text-emerald-400 font-bold">npm install -g vercel</span>
                </div>
                <button
                  onClick={() => handleCopy('npm install -g vercel', 'c1')}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white"
                >
                  {copiedCmd === 'c1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">2. Deploy Preview Environment</span>
                  <span className="text-amber-300 font-bold">vercel</span>
                </div>
                <button
                  onClick={() => handleCopy('vercel', 'c2')}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white"
                >
                  {copiedCmd === 'c2' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">3. Deploy Direct to Production</span>
                  <span className="text-cyan-300 font-bold">vercel --prod</span>
                </div>
                <button
                  onClick={() => handleCopy('vercel --prod', 'c3')}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white"
                >
                  {copiedCmd === 'c3' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'github' && (
          <div className="space-y-3 text-xs text-slate-300">
            <ol className="list-decimal list-inside space-y-2 leading-relaxed">
              <li>{lang === 'id' ? 'Download & unzip paket deployment Vercel.' : 'Download & extract the Vercel deployment package.'}</li>
              <li>{lang === 'id' ? 'Push folder ke repository GitHub / GitLab milik Anda.' : 'Push the code to your GitHub or GitLab repository.'}</li>
              <li>{lang === 'id' ? 'Buka Vercel Web Dashboard:' : 'Open Vercel Web Dashboard:'}</li>
            </ol>

            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:border-slate-500 transition"
            >
              <span>Buka https://vercel.com/new</span>
              <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
            </a>

            <p className="text-[11px] text-slate-400">
              {lang === 'id'
                ? 'Vercel akan secara otomatis mendeteksi file vercel.json dan menyajikan frontend & API backend serverless!'
                : 'Vercel automatically recognizes vercel.json and hosts both Vite frontend and serverless API endpoints!'}
            </p>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">vercel.json Configuration</span>
              <button
                onClick={() => handleCopy(vercelJsonSnippet, 'vjson')}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-sans text-slate-300 hover:text-white"
              >
                {copiedCmd === 'vjson' ? 'Tersalin!' : 'Salin Code'}
              </button>
            </div>
            <pre className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto">
              {vercelJsonSnippet}
            </pre>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            {lang === 'id' ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
