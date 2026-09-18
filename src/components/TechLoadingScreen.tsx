import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Cpu, Terminal, Zap, CheckCircle2, Server, Lock } from 'lucide-react';

interface TechLoadingScreenProps {
  title?: string;
  subtitle?: string;
  targetView?: 'dashboard' | 'register' | 'login' | 'admin' | 'general';
  onComplete?: () => void;
  minDurationMs?: number;
}

export const TechLoadingScreen: React.FC<TechLoadingScreenProps> = ({
  title = 'Memuat REST API Studio...',
  subtitle = 'Menghubungkan ke gateway, memverifikasi token & menyinkronkan state...',
  targetView = 'general',
  onComplete,
  minDurationMs = 1200
}) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = targetView === 'register' ? [
    'Menginisialisasi skema pendaftaran developer...',
    'Membuat pasang kunci API default (Free Tier)...',
    'Mengamankan kredensial dengan enkripsi SSL 256-bit...',
    'Akun siap! Dialihkan ke Dashboard...'
  ] : targetView === 'login' ? [
    'Memverifikasi otentikasi token JWT...',
    'Mengambil profil pengguna & level akses tier...',
    'Menyinkronkan kunci API & riwayat request...',
    'Otentikasi berhasil! Dialihkan...'
  ] : targetView === 'dashboard' ? [
    'Menghubungkan ke REST Engine Edge Node...',
    'Memuat metrik analitik real-time & log lalu lintas...',
    'Menyiapkan playground API & mock routes...',
    'Dashboard SIAP!'
  ] : [
    'Menghubungkan ke REST API Studio Core...',
    'Mengautentikasi kredensial developer...',
    'Menyiapkan lingkungan kerja...',
    'Proses selesai!'
  ];

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculated = Math.min(100, Math.floor((elapsed / minDurationMs) * 100));
      setProgress(calculated);

      // Rotate status messages
      if (calculated >= 80) setStatusIndex(3);
      else if (calculated >= 50) setStatusIndex(2);
      else if (calculated >= 25) setStatusIndex(1);

      if (elapsed >= minDurationMs) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 selection:bg-indigo-500/30 selection:text-indigo-300"
    >
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute h-80 w-80 rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <motion.div
        initial={{ scale: 0.9, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl text-center overflow-hidden"
      >
        {/* Glowing Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 animate-pulse" />

        {/* Outer Orbital Ring Spinner */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/40"
          />
          {/* Inner Counter-Rotating Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="absolute inset-2 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 border-r-transparent"
          />
          {/* Pulsing Core Icon */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-indigo-500/20">
            {targetView === 'register' ? (
              <ShieldCheck className="h-7 w-7 text-cyan-300 animate-pulse" />
            ) : targetView === 'login' ? (
              <Lock className="h-7 w-7 text-indigo-300 animate-pulse" />
            ) : targetView === 'dashboard' ? (
              <Server className="h-7 w-7 text-cyan-300 animate-pulse" />
            ) : (
              <Cpu className="h-7 w-7 text-indigo-300 animate-pulse" />
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <span>{title}</span>
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
        </h3>

        {/* Subtitle */}
        <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* Progress Bar */}
        <div className="mt-6 mb-3">
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1 text-cyan-400">
              <Terminal className="h-3 w-3" />
              <span>STATUS: SYSTEM_READY</span>
            </span>
            <span className="text-indigo-300 font-bold">{progress}%</span>
          </div>

          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800 p-0.5 border border-slate-700/50">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 shadow-sm shadow-indigo-500/50"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Status Ticker Message */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 text-[11px] font-mono text-slate-300 flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2 truncate">
            <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0 animate-bounce" />
            <span className="truncate text-slate-300 font-sans">{statuses[statusIndex]}</span>
          </div>
          {progress === 100 && (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
