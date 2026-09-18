import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Gauge,
  Webhook,
  Code2,
  Lock,
  Mail,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, SiteSettings } from '../types';

interface GuestWelcomeProps {
  onLoginSuccess: (user: UserProfile) => void;
  onOpenAuthModal: (initialTab?: 'otp' | 'login' | 'register') => void;
  onExploreApis: () => void;
  lang: 'id' | 'en';
  siteSettings?: SiteSettings | null;
}

export const GuestWelcome: React.FC<GuestWelcomeProps> = ({
  onLoginSuccess,
  onOpenAuthModal,
  onExploreApis,
  lang,
  siteSettings
}) => {
  const [errorMsg] = useState<string | null>(null);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-950 p-6 sm:p-10 shadow-2xl">
          {siteSettings?.enableHeroVideo && siteSettings?.heroVideoUrl && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
              {siteSettings.heroVideoUrl.includes('youtube') || siteSettings.heroVideoUrl.includes('youtu.be') ? (
                <iframe
                  src={siteSettings.heroVideoUrl.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&muted=1&loop=1&controls=0'}
                  className="w-full h-full object-cover scale-150 border-0"
                  title="Guest Hero Video"
                />
              ) : (
                <video
                  src={siteSettings.heroVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 -mb-20 h-56 w-56 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>{lang === 'id' ? 'Developer API Platform & Hub' : 'Developer API Platform & Hub'}</span>
              <span className="text-indigo-400 font-bold">•</span>
              <span className="text-sky-300 font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>1,842+ {lang === 'id' ? 'Pengunjung Aktif' : 'Active Visitors'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {siteSettings?.title || 'REST API Studio'}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 mt-1">
                {siteSettings?.tagline || (lang === 'id' ? 'Infrastruktur API Interaktif & Sandbox Siap Pakai' : 'Interactive API Infrastructure & Ready Sandbox')}
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              {lang === 'id'
                ? 'Jelajahi dan uji coba lebih dari 30+ endpoint REST API interaktif, buat Mock API kustom, simulasikan webhook real-time, pantau latensi radar global, dan kelola API Key developer Anda dalam satu platform.'
                : 'Explore and test 30+ interactive REST API endpoints, build custom Mock APIs, simulate real-time webhooks, monitor global radar latency, and manage your developer API keys in one unified hub.'}
            </p>

            {errorMsg && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Quick Actions & Auth Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {/* Primary: Register with Email OTP */}
              <button
                type="button"
                onClick={() => onOpenAuthModal('register')}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-cyan-300" />
                <span>{lang === 'id' ? 'Daftar Akun Developer (OTP Email)' : 'Register Developer Account'}</span>
                <span className="rounded bg-indigo-400/20 px-1.5 py-0.5 text-[9px] font-extrabold text-indigo-200 uppercase">
                  Free 1 Key
                </span>
              </button>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="flex items-center gap-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 text-xs font-bold shadow-md transition active:scale-95"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{lang === 'id' ? 'Lanjutkan dengan Google' : 'Continue with Google'}</span>
              </button>

              {/* Password Login */}
              <button
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 px-4 py-2.5 text-xs font-bold transition active:scale-95"
              >
                <Lock className="h-4 w-4 text-slate-400" />
                <span>{lang === 'id' ? 'Masuk' : 'Sign In'}</span>
              </button>

              {/* Direct API Exploration without Login */}
              <button
                type="button"
                onClick={onExploreApis}
                className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300 px-4 py-2.5 text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Layers className="h-4 w-4 text-indigo-400" />
                <span>{lang === 'id' ? 'Jelajahi API (Tanpa Akun)' : 'Explore APIs (Guest)'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-indigo-500/40 hover:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Gemini 2.0 AI Generator</h3>
            <p className="mt-1 text-xs text-slate-400">
              Buat teks AI, analisis kode, dan generate respons cerdas langsung lewat REST API endpoint.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-cyan-500/40 hover:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
              <Database className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Mock API Builder Engine</h3>
            <p className="mt-1 text-xs text-slate-400">
              Buat custom mock route tanpa koding server dengan delay latensi dan kustom JSON payload.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-purple-500/40 hover:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
              <Webhook className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Webhook Simulator</h3>
            <p className="mt-1 text-xs text-slate-400">
              Dispatch webhook event instan (payment, deploy, auth) dengan preview signature HMAC SHA-256.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-emerald-500/40 hover:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <Gauge className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Speedtest & Latency Radar</h3>
            <p className="mt-1 text-xs text-slate-400">
              Uji performa TTFB dan latensi server secara real-time dari berbagai simulasi edge region.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-amber-500/40 hover:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">30+ Built-in Utilities</h3>
            <p className="mt-1 text-xs text-slate-400">
              QR generator, Hash SHA256, Base64, UUID, Currency FX, Weather, Lorem Ipsum, dan Mock Data.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-blue-500/40 hover:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
              <Code2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Multi-Language Code Export</h3>
            <p className="mt-1 text-xs text-slate-400">
              Salin kode cURL, JavaScript (Fetch / Axios), Python (Requests), Node.js, Go, dan PHP 1-klik.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
