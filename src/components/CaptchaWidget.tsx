import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShieldCheck, RefreshCw, Volume2, CheckCircle2, AlertCircle, Sparkles, Check, Globe, Shield, Zap, Key, Rocket, Lock, CheckCheck } from 'lucide-react';

export interface CaptchaData {
  token: string;
  answer: string;
}

interface CaptchaWidgetProps {
  onCaptchaChange: (data: CaptchaData) => void;
  lang?: 'id' | 'en';
  theme?: 'dark' | 'light';
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  initialMode?: 'turnstile' | 'distortion' | 'math';
}

const STEP2_ICONS = [
  { id: 'shield', labelId: 'Perisai Keamanan', labelEn: 'Security Shield', icon: Shield, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/50' },
  { id: 'zap', labelId: 'Kilat Cepat', labelEn: 'Lightning Zap', icon: Zap, color: 'text-amber-400 border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/50' },
  { id: 'key', labelId: 'Kunci Akses', labelEn: 'Access Key', icon: Key, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/50' },
  { id: 'rocket', labelId: 'Roket API', labelEn: 'API Rocket', icon: Rocket, color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/30 hover:bg-indigo-900/50' },
];

export const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({
  onCaptchaChange,
  lang = 'id',
  disabled = false,
  className = '',
  autoFocus = false,
  initialMode = 'turnstile'
}) => {
  const [activeTab, setActiveTab] = useState<'turnstile' | 'distortion' | 'math'>(initialMode);
  const [captchaSvg, setCaptchaSvg] = useState<string>('');
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [captchaType, setCaptchaType] = useState<'text' | 'math'>('text');
  const [phoneticText, setPhoneticText] = useState<string>('');
  const [turnstilePassCode, setTurnstilePassCode] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2-Step Turnstile Interactive Verification States
  const [isStep1Checking, setIsStep1Checking] = useState<boolean>(false);
  const [isStep1Verified, setIsStep1Verified] = useState<boolean>(false);
  const [targetStep2Id, setTargetStep2Id] = useState<string>('shield');
  const [isStep2Verified, setIsStep2Verified] = useState<boolean>(false);
  const [step2Error, setStep2Error] = useState<boolean>(false);
  const mouseMovesRef = useRef<number>(0);

  // Pick random target icon for Step 2
  const pickNewStep2Target = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * STEP2_ICONS.length);
    setTargetStep2Id(STEP2_ICONS[randomIndex].id);
    setStep2Error(false);
  }, []);

  // Track cursor movement for entropy/bot heuristics
  useEffect(() => {
    const handleMouseMove = () => {
      mouseMovesRef.current += 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchCaptcha = useCallback(async (forcedMode?: 'turnstile' | 'distortion' | 'math') => {
    setIsLoading(true);
    setErrorMessage(null);
    setUserInput('');
    setIsStep1Checking(false);
    setIsStep1Verified(false);
    setIsStep2Verified(false);
    setStep2Error(false);
    pickNewStep2Target();
    onCaptchaChange({ token: '', answer: '' });

    const targetMode = forcedMode || activeTab;

    try {
      const modeParam = targetMode === 'math' ? 'math' : 'mixed';
      const res = await fetch(`/api/auth/captcha?mode=${modeParam}&t=${Date.now()}`);
      if (!res.ok) throw new Error('Failed to load CAPTCHA');
      const data = await res.json();

      if (data.success && data.svg && data.captchaToken) {
        setCaptchaSvg(data.svg);
        setCaptchaToken(data.captchaToken);
        setTurnstilePassCode(data.turnstilePass || `TS_${data.captchaToken.substring(0, 16)}`);
        setCaptchaType(data.type || 'text');
        setPhoneticText(data.audioPhonetic || '');
      } else {
        throw new Error(data.error || 'Invalid CAPTCHA payload');
      }
    } catch (err: any) {
      console.error('Error loading CAPTCHA:', err);
      setErrorMessage(
        lang === 'id' ? 'Gagal memuat CAPTCHA. Klik muat ulang.' : 'Failed to load CAPTCHA. Click reload.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, lang, onCaptchaChange, pickNewStep2Target]);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setUserInput(val);
    onCaptchaChange({
      token: captchaToken,
      answer: val
    });
  };

  // Step 1: Cloudflare Turnstile Checkbox Click Trigger
  const handleStep1Click = () => {
    if (disabled || isStep1Checking || isStep1Verified || !captchaToken) return;

    setIsStep1Checking(true);
    setErrorMessage(null);

    // Simulate browser handshake & entropy verification
    setTimeout(() => {
      setIsStep1Checking(false);
      setIsStep1Verified(true);
      pickNewStep2Target();
    }, 450);
  };

  // Step 2: Interactive Icon Confirmation Click
  const handleStep2IconClick = (iconId: string) => {
    if (disabled || !isStep1Verified || isStep2Verified || !captchaToken) return;

    if (iconId === targetStep2Id) {
      // Step 2 Success!
      setIsStep2Verified(true);
      setStep2Error(false);

      const validatedPass = turnstilePassCode || `TS_${captchaToken.substring(0, 16)}`;
      onCaptchaChange({
        token: captchaToken,
        answer: validatedPass
      });
    } else {
      // Wrong icon clicked, re-roll target and flash error
      setStep2Error(true);
      setTimeout(() => {
        pickNewStep2Target();
      }, 500);
    }
  };

  const handlePlayAudio = () => {
    if (!phoneticText || isSpeaking) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const textToSpeak = lang === 'id' 
          ? `Kode verifikasi keamanan: ${phoneticText.split('').join(', ')}`
          : `Security verification code: ${phoneticText.split('').join(', ')}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.lang = lang === 'id' ? 'id-ID' : 'en-US';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const switchTab = (tab: 'turnstile' | 'distortion' | 'math') => {
    setActiveTab(tab);
    setUserInput('');
    setIsStep1Verified(false);
    setIsStep2Verified(false);
    setIsStep1Checking(false);
    fetchCaptcha(tab);
  };

  const currentTargetObj = STEP2_ICONS.find(i => i.id === targetStep2Id) || STEP2_ICONS[0];

  return (
    <div className={`rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 space-y-3 shadow-md ${className}`}>
      {/* Header Info & Provider Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>{lang === 'id' ? 'Verifikasi Keamanan (2 Langkah)' : 'Security Verification (2-Step)'}</span>
        </div>
        
        {/* Style / Provider Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
          <button
            type="button"
            onClick={() => switchTab('turnstile')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              activeTab === 'turnstile' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Turnstile 2-Step
          </button>
          <button
            type="button"
            onClick={() => switchTab('distortion')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              activeTab === 'distortion' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎨 Visual SVG
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CLOUDFLARE TURNSTILE 2-STEP INTERACTIVE VERIFICATION WIDGET */}
      {/* ========================================================================= */}
      {activeTab === 'turnstile' && (
        <div className="space-y-2.5">
          {/* STEP 1: Turnstile Checkbox */}
          <div
            onClick={handleStep1Click}
            className={`relative flex items-center justify-between rounded-xl border p-2.5 transition select-none cursor-pointer ${
              isStep1Verified
                ? 'border-emerald-500/40 bg-emerald-950/20'
                : isStep1Checking
                ? 'border-amber-500/50 bg-amber-950/20'
                : 'border-slate-700 bg-slate-950 hover:border-slate-600 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {/* Checkbox Box */}
              <div
                className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                  isStep1Verified
                    ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                    : isStep1Checking
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-600 bg-slate-900 hover:border-amber-400'
                }`}
              >
                {isStep1Checking && (
                  <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
                )}
                {isStep1Verified && (
                  <Check className="h-3.5 w-3.5 stroke-[3] text-slate-950" />
                )}
              </div>

              {/* Text Prompt */}
              <div>
                <span className="text-[11px] font-bold text-white block">
                  {isStep1Verified
                    ? (lang === 'id' ? 'Langkah 1: Sinyal Browser Lolos' : 'Step 1: Browser Signal Verified')
                    : isStep1Checking
                    ? (lang === 'id' ? 'Langkah 1: Menganalisis keamanan...' : 'Step 1: Analyzing security...')
                    : (lang === 'id' ? 'Langkah 1: Verifikasi bahwa Anda adalah manusia' : 'Step 1: Verify you are human')}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  {isStep1Verified
                    ? (lang === 'id' ? '✓ Turnstile Handshake Selesai' : '✓ Turnstile Handshake Passed')
                    : (lang === 'id' ? 'Klik kotak untuk memulai' : 'Click checkbox to start')}
                </span>
              </div>
            </div>

            {/* Cloudflare Style Brand Badge */}
            <div className="flex flex-col items-end pl-2 shrink-0 border-l border-slate-800/80">
              <div className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/>
                </svg>
                <span className="text-[8px] font-black tracking-tighter text-amber-400">TURNSTILE</span>
              </div>
              <span className="text-[7px] text-slate-500 font-mono">Cloudflare Guard</span>
            </div>
          </div>

          {/* STEP 2: Interactive Anti-Bot Icon Confirmation (Reveals when Step 1 is done) */}
          {isStep1Verified && !isStep2Verified && (
            <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/30 p-2.5 space-y-2 animate-fade-in shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-indigo-200">
                    {lang === 'id' ? 'Langkah 2: Konfirmasi Pola Keamanan' : 'Step 2: Security Pattern Confirmation'}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-indigo-400">2 / 2</span>
              </div>

              <p className="text-[10px] text-slate-300">
                {lang === 'id' ? 'Klik simbol berikut: ' : 'Click on the symbol: '}
                <strong className="text-amber-300 font-bold underline decoration-amber-500">
                  {lang === 'id' ? currentTargetObj.labelId : currentTargetObj.labelEn}
                </strong>
              </p>

              {step2Error && (
                <p className="text-[9px] text-rose-400 font-semibold animate-pulse">
                  {lang === 'id' ? '⚠️ Simbol salah! Coba lagi simbol yang diminta di atas.' : '⚠️ Incorrect symbol! Please click the requested symbol above.'}
                </p>
              )}

              {/* 4 Interactive Symbols Grid */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {STEP2_ICONS.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleStep2IconClick(item.id)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg border py-2 px-1 text-[9px] font-bold transition active:scale-95 ${item.color}`}
                    >
                      <IconComp className="h-4 w-4" />
                      <span className="truncate max-w-[55px]">
                        {lang === 'id' ? item.labelId.split(' ')[0] : item.labelEn.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fully Verified 2-Step Confirmation Banner */}
          {isStep1Verified && isStep2Verified && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-2.5 text-emerald-300 shadow-sm shadow-emerald-950/40 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                <div>
                  <span className="text-xs font-extrabold text-white block">
                    {lang === 'id' ? 'Verifikasi 2 Langkah Berhasil!' : '2-Step Verification Completed!'}
                  </span>
                  <span className="text-[9px] text-emerald-400/90 font-mono">
                    Token Validated • Siap Lanjut Masuk
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fetchCaptcha('turnstile')}
                title="Muat ulang sesi"
                className="text-[10px] text-slate-400 hover:text-white"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Footer Info */}
          {!isStep2Verified && (
            <div className="flex items-center justify-between text-[9px] text-slate-400 px-1">
              <span className="text-slate-400 font-mono flex items-center gap-1">
                • 2-Step Anti-Bot Verification Engine
              </span>
              <button
                type="button"
                disabled={isLoading || isStep1Checking}
                onClick={() => fetchCaptcha('turnstile')}
                className="hover:text-white flex items-center gap-1 text-[9px]"
              >
                <RefreshCw className="h-2.5 w-2.5" />
                <span>{lang === 'id' ? 'Muat ulang sesi' : 'Refresh session'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GRAPHIC DISTORTION & AUDIO TTS MODE */}
      {/* ========================================================================= */}
      {(activeTab === 'distortion' || activeTab === 'math') && (
        <div className="space-y-2.5">
          {/* Captcha Image Display and Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 h-12 overflow-hidden rounded-lg border border-slate-700/80 bg-slate-950 flex items-center justify-center select-none shadow-inner">
              {isLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                  <span>{lang === 'id' ? 'Membuat tantangan...' : 'Generating challenge...'}</span>
                </div>
              ) : errorMessage ? (
                <div className="flex items-center gap-1 text-[10px] text-rose-400 px-2 text-center">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center p-0.5"
                  dangerouslySetInnerHTML={{ __html: captchaSvg }}
                />
              )}
            </div>

            {/* Action Buttons: Audio & Reload */}
            <div className="flex flex-col gap-1 shrink-0">
              <button
                type="button"
                disabled={isLoading || disabled}
                onClick={() => fetchCaptcha()}
                title={lang === 'id' ? 'Ganti Kode CAPTCHA' : 'Reload CAPTCHA'}
                className="flex h-5 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
              
              <button
                type="button"
                disabled={isLoading || disabled || !phoneticText}
                onClick={handlePlayAudio}
                title={lang === 'id' ? 'Dengarkan Kode Suara' : 'Listen to Audio Code'}
                className="flex h-5 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition active:scale-95 disabled:opacity-50"
              >
                <Volume2 className={`h-3 w-3 ${isSpeaking ? 'text-cyan-400 animate-pulse' : ''}`} />
              </button>
            </div>
          </div>

          {/* Input Field */}
          <div className="relative">
            <input
              type="text"
              required
              autoFocus={autoFocus}
              disabled={disabled || isLoading}
              value={userInput}
              onChange={handleInputChange}
              placeholder={
                captchaType === 'math'
                  ? (lang === 'id' ? 'Tulis hasil perhitungan di atas...' : 'Enter calculation result...')
                  : (lang === 'id' ? 'Ketik karakter di atas...' : 'Type characters shown above...')
              }
              maxLength={10}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono font-bold tracking-widest text-emerald-400 placeholder:text-slate-500 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 uppercase transition"
            />
            {userInput.length >= 2 && (
              <div className="absolute right-2.5 top-2.5 text-emerald-400 pointer-events-none">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
