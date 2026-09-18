import React, { useState, useEffect, useRef } from 'react';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  Building,
  Eye,
  EyeOff,
  X,
  Info,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  User,
  ArrowLeft,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';
import { TechLoadingScreen } from './TechLoadingScreen';
import { CaptchaWidget, CaptchaData } from './CaptchaWidget';

export type AuthTabType = 'login' | 'register' | 'register_verify' | 'forgot' | 'forgot_verify' | 'google_select';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  lang: 'id' | 'en';
  initialTab?: AuthTabType | 'otp';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  lang,
  initialTab = 'register'
}) => {
  // Main view state
  const [tab, setTab] = useState<AuthTabType>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Captcha anti-bot states
  const [registerCaptcha, setRegisterCaptcha] = useState<CaptchaData>({ token: '', answer: '' });
  const [forgotCaptcha, setForgotCaptcha] = useState<CaptchaData>({ token: '', answer: '' });
  const [loginCaptcha, setLoginCaptcha] = useState<CaptchaData>({ token: '', answer: '' });
  const [googleCaptcha, setGoogleCaptcha] = useState<CaptchaData>({ token: '', answer: '' });
  const [isLoginCaptchaRequired, setIsLoginCaptchaRequired] = useState(false);

  // New Password for Reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // OTP State for Email Verification & Reset
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const [maskedEmail, setMaskedEmail] = useState<string>('');

  // UI state
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  // Listen for Google OAuth callback via postMessage
  useEffect(() => {
    const handleAuthMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const { user, token } = event.data;
        if (user && token) {
          localStorage.setItem('api_studio_auth_token', token);
          localStorage.setItem('api_studio_current_user', JSON.stringify(user));
          onLoginSuccess(user);
          onClose();
        }
        setSocialLoading(null);
      } else if (event.data?.type === 'GOOGLE_AUTH_CODE') {
        const { code } = event.data;
        if (code) {
          try {
            const res = await fetch('/api/auth/google/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code })
            });
            const data = await res.json();
            if (data.success && data.user) {
              localStorage.setItem('api_studio_auth_token', data.token);
              localStorage.setItem('api_studio_current_user', JSON.stringify(data.user));
              onLoginSuccess(data.user);
              onClose();
            }
          } catch (e) {
          } finally {
            setSocialLoading(null);
          }
        }
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setErrorMsg(event.data.error || (lang === 'id' ? 'Otentikasi Google dibatalkan atau gagal.' : 'Google auth cancelled or failed.'));
        setSocialLoading(null);
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [onLoginSuccess, onClose, lang]);

  const handleGoogleVerifyEmail = async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg(lang === 'id' ? 'Masukkan alamat email Google yang valid.' : 'Please enter a valid Google email.');
      return;
    }
    if (!googleCaptcha.token || !googleCaptcha.answer) {
      setErrorMsg(lang === 'id' ? 'Silakan klik dan selesaikan verifikasi centang "Saya bukan robot" (Turnstile) terlebih dahulu.' : 'Please complete the anti-bot verification check first.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/google/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: targetEmail.trim().toLowerCase(),
          captchaToken: googleCaptcha.token,
          captchaAnswer: googleCaptcha.answer
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('api_studio_auth_token', data.token);
        localStorage.setItem('api_studio_current_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Gagal otentikasi Google.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat otentikasi Google.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Login trigger - Opens in-app Google Account Chooser (no origin_mismatch popup)
  const handleGoogleLogin = async () => {
    setTab('google_select');
    setErrorMsg(null);
  };

  const openGooglePopup = async () => {
    try {
      const origin = window.location.origin;
      const redirectUri = `${origin}/auth/google/callback`;
      
      const res = await fetch(`/api/auth/google/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      const data = await res.json();
      
      if (!data.url) {
        throw new Error(lang === 'id' ? 'Gagal memuat URL otorisasi Google.' : 'Failed to load Google auth URL.');
      }

      // Buka popup resmi Google OAuth Account Chooser
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.open(data.url, '_blank');
      } else {
        const checkTimer = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkTimer);
            setSocialLoading(null);
          }
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'id' ? 'Gagal membuka Google Sign-In.' : 'Failed to open Google Sign-In.'));
      setSocialLoading(null);
    }
  };

  // Hook: Initial tab routing
  useEffect(() => {
    if (initialTab && isOpen) {
      if (initialTab === 'otp') {
        setTab('register');
      } else {
        setTab(initialTab);
      }
    }
  }, [initialTab, isOpen]);

  // Hook #25: Countdown timer for OTP resend
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // ==========================================
  // OTP DIGIT INPUT HANDLERS
  // ==========================================
  const handleDigitChange = (index: number, val: string, onComplete?: (code: string) => void) => {
    // Handle paste
    if (val.length > 1) {
      const cleanDigits = val.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      cleanDigits.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      if (cleanDigits.length === 6 && onComplete) {
        onComplete(cleanDigits.join(''));
      } else {
        const nextIdx = Math.min(cleanDigits.length, 5);
        inputRefs.current[nextIdx]?.focus();
      }
      return;
    }

    const singleDigit = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = singleDigit;
    setOtpDigits(newDigits);

    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit on last digit
    if (singleDigit && index === 5 && onComplete) {
      const completeCode = newDigits.slice(0, 5).join('') + singleDigit;
      if (completeCode.length === 6) {
        onComplete(completeCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ==========================================
  // 1. REGISTER: SEND OTP
  // ==========================================
  const handleRegisterSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(lang === 'id' ? 'Nama lengkap / Username wajib diisi.' : 'Full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(lang === 'id' ? 'Alamat email resmi / Gmail wajib diisi.' : 'Valid email is required.');
      return;
    }
    if (!password || password.length < 5) {
      setErrorMsg(lang === 'id' ? 'Kata sandi minimal 5 karakter.' : 'Password must be at least 5 characters.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setErrorMsg(lang === 'id' ? 'Konfirmasi kata sandi tidak cocok.' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          company: company.trim() || 'Individual Dev',
          captchaToken: registerCaptcha.token,
          captchaAnswer: registerCaptcha.answer
        })
      });

      const data = await res.json();
      if (data.success) {
        setMaskedEmail(data.obfuscatedEmail || email);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpCountdown(60);
        setTab('register_verify');
        setSuccessMsg(lang === 'id' 
          ? `Kode verifikasi 6-digit telah dikirimkan ke email ${email}. Periksa inbox / spam Anda.` 
          : `6-digit verification code sent to ${email}. Check inbox / spam.`);
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      } else {
        setErrorMsg(data.error || 'Gagal mengirim kode verifikasi OTP.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi bermasalah saat mengirim OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 2. REGISTER: VERIFY OTP & REDIRECT TO LOGIN
  // ==========================================
  const handleRegisterVerifyOtp = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg(lang === 'id' ? 'Masukkan 6-digit kode OTP lengkap.' : 'Enter full 6-digit code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: fullCode
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.user) {
          localStorage.setItem('api_studio_auth_token', data.token || 'demo-token');
          localStorage.setItem('api_studio_current_user', JSON.stringify(data.user));
          onLoginSuccess(data.user);
          onClose();
        } else {
          // Switch to login tab, pre-fill email, clear OTP, show success notice
          setTab('login');
          setPassword('');
          setConfirmPassword('');
          setSuccessMsg(lang === 'id' 
            ? `🎉 Email ${email} berhasil diverifikasi! Akun developer aktif. Silakan masuk menggunakan kata sandi Anda.` 
            : `🎉 Email ${email} verified! Developer account active. Please sign in with your password.`);
          setTimeout(() => passwordInputRef.current?.focus(), 200);
        }
      } else {
        setErrorMsg(data.error || (lang === 'id' ? 'Kode verifikasi salah.' : 'Verification code invalid.'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memverifikasi OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 3. LOGIN: SUBMIT EMAIL & PASSWORD
  // ==========================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg(lang === 'id' ? 'Email dan Password wajib diisi.' : 'Email and Password required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          captchaToken: loginCaptcha.token,
          captchaAnswer: loginCaptcha.answer
        })
      });

      const data = await res.json();
      if (data.requireCaptcha) {
        setIsLoginCaptchaRequired(true);
      }
      if (data.success && data.user) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || (lang === 'id' ? 'Email atau kata sandi salah.' : 'Invalid email or password.'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi error saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 4. FORGOT PASSWORD: SEND OTP
  // ==========================================
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(lang === 'id' ? 'Masukkan alamat email yang terdaftar.' : 'Enter registered email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(),
          captchaToken: forgotCaptcha.token,
          captchaAnswer: forgotCaptcha.answer
        })
      });

      const data = await res.json();
      if (data.success) {
        setMaskedEmail(data.obfuscatedEmail || email);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpCountdown(60);
        setTab('forgot_verify');
        setSuccessMsg(lang === 'id' 
          ? `Kode OTP reset sandi telah dikirimkan ke ${email}. Periksa kotak masuk atau spam email Anda.` 
          : `Password reset OTP code sent to ${email}. Check inbox or spam.`);
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      } else {
        setErrorMsg(data.error || 'Gagal mengirim kode reset kata sandi.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi error.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 5. FORGOT PASSWORD: RESET PASSWORD
  // ==========================================
  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg(lang === 'id' ? 'Masukkan 6-digit kode OTP lengkap.' : 'Enter full 6-digit OTP code.');
      return;
    }
    if (!newPassword || newPassword.length < 5) {
      setErrorMsg(lang === 'id' ? 'Kata sandi baru minimal 5 karakter.' : 'New password must be at least 5 chars.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg(lang === 'id' ? 'Konfirmasi kata sandi tidak cocok.' : 'Password confirmation does not match.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: fullCode,
          newPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        setTab('login');
        setPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setSuccessMsg(lang === 'id' 
          ? 'Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.' 
          : 'Password updated successfully! Please sign in with your new password.');
        setTimeout(() => passwordInputRef.current?.focus(), 200);
      } else {
        setErrorMsg(data.error || 'Gagal mengatur ulang kata sandi.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Credentials Quick Fill
  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setTab('login');
    setErrorMsg(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Loading Overlay (Only for form submission & OTP verification, NOT Google SSO) */}
      {isLoading && (
        <TechLoadingScreen
          title={
            tab === 'register' 
              ? (lang === 'id' ? 'Mengirim Kode OTP Verifikasi Email...' : 'Sending Email OTP Code...') 
              : tab === 'register_verify' 
              ? (lang === 'id' ? 'Memverifikasi Email & Menyiapkan Akun...' : 'Verifying Email & Setting up Account...')
              : tab === 'forgot' || tab === 'forgot_verify'
              ? (lang === 'id' ? 'Memproses Reset Kata Sandi...' : 'Processing Password Reset...')
              : (lang === 'id' ? 'Otentikasi Pengguna...' : 'Authenticating User...')
          }
          subtitle={
            tab === 'register' 
              ? (lang === 'id' ? 'Menghubungkan ke server email SMTP & menyiapkan 6-digit OTP...' : 'Connecting to SMTP server & generating 6-digit OTP...') 
              : tab === 'register_verify' 
              ? (lang === 'id' ? 'Membuat akun Free Developer Tier dengan 1 API Key...' : 'Generating Free Developer Account with 1 API Key...')
              : (lang === 'id' ? 'Memvalidasi kredensial dan sesi aman...' : 'Validating credentials & secure session...')
          }
          targetView={tab === 'register' ? 'register' : 'login'}
          minDurationMs={800}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-2xl shadow-indigo-500/10 max-h-[92vh] overflow-y-auto">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal Header */}
          <div className="mb-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {tab === 'register_verify' || tab === 'forgot_verify' ? (
                <Mail className="h-5 w-5 text-cyan-400" />
              ) : tab === 'forgot' ? (
                <Lock className="h-5 w-5 text-amber-400" />
              ) : (
                <KeyRound className="h-5 w-5" />
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {tab === 'login'
                ? (lang === 'id' ? 'Masuk ke REST API Studio' : 'Sign In to REST API Studio')
                : tab === 'register'
                ? (lang === 'id' ? 'Daftar Akun Developer' : 'Register Developer Account')
                : tab === 'register_verify'
                ? (lang === 'id' ? 'Verifikasi Email Pendaftaran' : 'Verify Registration Email')
                : tab === 'forgot'
                ? (lang === 'id' ? 'Lupa Kata Sandi' : 'Forgot Password')
                : tab === 'google_select'
                ? (lang === 'id' ? 'Masuk dengan Akun Google' : 'Sign In with Google Account')
                : (lang === 'id' ? 'Buat Kata Sandi Baru' : 'Set New Password')}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {tab === 'login'
                ? (lang === 'id' ? 'Akses dasbor, kelola kunci API & simulasi endpoint' : 'Access your dashboard, manage API keys & simulate endpoints')
                : tab === 'register'
                ? (lang === 'id' ? 'Daftar wajib email resmi untuk verifikasi OTP & dapatkan 1 API Key Free' : 'Register with official email for OTP verification & get 1 Free API Key')
                : tab === 'register_verify'
                ? (lang === 'id' ? 'Masukkan 6-digit kode OTP yang dikirimkan ke email Anda' : 'Enter 6-digit OTP code sent to your email inbox')
                : tab === 'forgot'
                ? (lang === 'id' ? 'Masukkan email akun Anda untuk menerima kode OTP reset sandi' : 'Enter your registered email to receive a password reset OTP')
                : tab === 'google_select'
                ? (lang === 'id' ? 'Otentikasi cepat menggunakan akun Google atau email Anda' : 'Fast authentication using your Google or email account')
                : (lang === 'id' ? 'Masukkan kode OTP dan buat kata sandi baru akun Anda' : 'Enter OTP code and set your new account password')}
            </p>
          </div>

          {/* Primary 2-Tab Switcher (Login vs Register) */}
          {(tab === 'login' || tab === 'register') && (
            <div className="mb-4 flex rounded-xl border border-slate-800 bg-slate-900/80 p-1">
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  tab === 'login'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>{lang === 'id' ? 'Masuk' : 'Sign In'}</span>
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  tab === 'register'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                <span>{lang === 'id' ? 'Daftar Akun' : 'Register'}</span>
              </button>
            </div>
          )}

          {/* Notifications / Alerts */}
          {errorMsg && (
            <div className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 animate-in fade-in">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300 flex items-start gap-1.5 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 1: REGISTER (Pendaftaran Akun Resmi) */}
          {/* ========================================================================= */}
          {tab === 'register' && (
            <div className="space-y-3">
              {/* Free Plan Benefit Banner */}
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2 text-emerald-300">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400" />
                <div className="text-[10px] leading-tight">
                  <p className="font-semibold text-emerald-200">
                    {lang === 'id' ? 'Paket Otomatis: Free Developer Plan' : 'Auto Plan: Free Developer Plan'}
                  </p>
                  <p className="text-emerald-400/80 mt-0.5">
                    {lang === 'id' 
                      ? 'Setelah verifikasi OTP email, akun langsung aktif dengan 1 API Key gratis (60 req/min).' 
                      : 'After OTP email verification, account activates with 1 free API Key (60 req/min).'}
                  </p>
                </div>
              </div>

              {/* Form Input Fields */}
              <form onSubmit={handleRegisterSendOtp} className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-300">
                    {lang === 'id' ? 'Nama Lengkap / Username' : 'Full Name / Username'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Rabani Al Husain"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-300">
                    {lang === 'id' ? 'Alamat Email Resmi (Gmail / Email)' : 'Official Email (Gmail)'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama.anda@gmail.com"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-300">
                    {lang === 'id' ? 'Kata Sandi / Password' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 5 karakter"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-8 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-300">
                    {lang === 'id' ? 'Konfirmasi Kata Sandi' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-8 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-2 text-[10px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>
                    {lang === 'id' 
                      ? 'Kebijakan Anti-Abuse: 1 Perangkat/IP = 1 Akun Terdaftar' 
                      : 'Anti-Abuse Policy: 1 Device/IP = 1 Registered Account'}
                  </span>
                </div>

                {/* Anti-Bot Security CAPTCHA Widget */}
                <div className="pt-1">
                  <CaptchaWidget onCaptchaChange={setRegisterCaptcha} lang={lang} />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email || !name || !password}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  <span>{isLoading ? 'Mengirim OTP...' : 'Daftar & Kirim Kode OTP Verifikasi'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Already have account redirect */}
              <div className="text-center pt-2 text-xs text-slate-400">
                {lang === 'id' ? 'Sudah punya akun?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="font-bold text-indigo-400 hover:text-indigo-300 underline"
                >
                  {lang === 'id' ? 'Masuk di sini' : 'Sign In here'}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: REGISTER VERIFY OTP (6-Digit OTP Email Verification) */}
          {/* ========================================================================= */}
          {tab === 'register_verify' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-slate-300">
                  {lang === 'id' ? 'Masukkan 6-digit kode verifikasi yang dikirimkan ke:' : 'Enter 6-digit code sent to:'}
                </p>
                <p className="text-xs font-mono font-bold text-cyan-300 mt-0.5">
                  {email}
                </p>
              </div>

              {/* 6-box input */}
              <div className="flex justify-center gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value, handleRegisterVerifyOtp)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="h-11 w-11 rounded-xl border border-slate-700 bg-slate-900 text-center text-lg font-mono font-bold text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  />
                ))}
              </div>

              {/* Notice Banner */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold mb-0.5">
                  <Mail className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{lang === 'id' ? 'Kode OTP Terkirim ke Email Anda' : 'OTP Code Sent to Your Email'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'id' 
                    ? 'Buka aplikasi Gmail / Email di HP Anda dan periksa kotak masuk atau folder spam.' 
                    : 'Open Gmail / Email app on your phone and check inbox or spam folder.'}
                </p>
              </div>

              {/* Actions: Resend or Change Email */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMsg(null); }}
                  className="flex items-center gap-1 text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>{lang === 'id' ? 'Ubah Data / Email' : 'Change Info'}</span>
                </button>

                <button
                  type="button"
                  disabled={otpCountdown > 0 || isLoading}
                  onClick={() => handleRegisterSendOtp()}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 disabled:text-slate-600"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>
                    {otpCountdown > 0 ? `Kirim ulang (${otpCountdown}s)` : 'Kirim Ulang Kode'}
                  </span>
                </button>
              </div>

              <button
                type="button"
                disabled={isLoading || otpDigits.join('').length !== 6}
                onClick={() => handleRegisterVerifyOtp()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-600/30 transition disabled:opacity-50"
              >
                <span>{isLoading ? 'Memverifikasi...' : 'Verifikasi Email & Aktifkan Akun'}</span>
                <ShieldCheck className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: LOGIN (Masuk dengan Email & Password + Link Lupa Password) */}
          {/* ========================================================================= */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-300">
                  {lang === 'id' ? 'Alamat Email Terdaftar' : 'Registered Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@domain.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold text-slate-300">
                    {lang === 'id' ? 'Kata Sandi / Password' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    {lang === 'id' ? 'Lupa kata sandi?' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-8 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Conditional Anti-Bot Challenge for Login (Brute-Force defense) */}
              {isLoginCaptchaRequired && (
                <div className="pt-1">
                  <CaptchaWidget onCaptchaChange={setLoginCaptcha} lang={lang} />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition active:scale-[0.98] disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Memproses...' : (lang === 'id' ? 'Masuk Sekarang' : 'Sign In Now')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              {/* OR Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-slate-900 px-2 text-slate-500 font-semibold">
                    {lang === 'id' ? 'atau' : 'or'}
                  </span>
                </div>
              </div>

              {/* Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={socialLoading !== null}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 text-xs font-bold shadow-sm transition active:scale-[0.98] disabled:opacity-50"
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
                <span>
                  {socialLoading === 'google'
                    ? (lang === 'id' ? 'Membuka Google...' : 'Opening Google...')
                    : (lang === 'id' ? 'Lanjutkan dengan Google' : 'Continue with Google')}
                </span>
              </button>

              {/* Switch to Register link */}
              <div className="text-center pt-2 text-xs text-slate-400">
                {lang === 'id' ? 'Belum punya akun?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="font-bold text-indigo-400 hover:text-indigo-300 underline"
                >
                  {lang === 'id' ? 'Daftar Sekarang (Gratis)' : 'Register Now (Free)'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* VIEW 4: FORGOT PASSWORD (Step 1: Input Email) */}
          {/* ========================================================================= */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotSendOtp} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-300">
                  {lang === 'id' ? 'Masukkan Email Akun Anda' : 'Enter Your Account Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama.anda@gmail.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-2.5 text-amber-300 text-[11px]">
                <div className="flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    {lang === 'id'
                      ? 'Sistem akan mengirimkan 6-digit kode OTP ke email ini untuk memverifikasi kepemilikan akun sebelum mengubah kata sandi.'
                      : 'We will send a 6-digit OTP code to this email to verify account ownership before resetting password.'}
                  </span>
                </div>
              </div>

              {/* Anti-Bot Security CAPTCHA Widget */}
              <div className="pt-1">
                <CaptchaWidget onCaptchaChange={setForgotCaptcha} lang={lang} />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/30 transition disabled:opacity-50"
              >
                <span>{isLoading ? 'Mengirim Kode...' : 'Kirim Kode OTP Reset Sandi'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMsg(null); }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← {lang === 'id' ? 'Kembali ke Halaman Masuk' : 'Back to Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* VIEW 6: GOOGLE ACCOUNT CHOOSER (Seamless In-Modal Sign-In) */}
          {/* ========================================================================= */}
          {tab === 'google_select' && (
            <div className="space-y-3.5 py-1">
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/90 p-4 space-y-3 shadow-xl">
                <div className="flex items-center gap-2 mb-1 border-b border-slate-800 pb-2.5">
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {lang === 'id' ? 'Otentikasi Akun Google' : 'Google Account Sign In'}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {lang === 'id' ? 'Pilih atau masukkan email Google Anda' : 'Select or enter your Google email'}
                    </p>
                  </div>
                </div>

                {/* Official Google OAuth Popup Button */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={openGooglePopup}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 py-2.5 px-4 text-xs font-bold shadow-md transition active:scale-[0.98]"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="text-slate-900 dark:text-white font-extrabold">{lang === 'id' ? 'Buka Dialog Akun Google (Popup)' : 'Open Google Sign-In Popup'}</span>
                </button>

                {/* Divider */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
                  <div className="relative flex justify-center text-[9px] uppercase"><span className="bg-slate-900 px-2 text-slate-500 font-semibold">{lang === 'id' ? 'Atau Masuk Cepat dengan Email Google' : 'Or Fast Sign-in with Google Email'}</span></div>
                </div>

                {/* Custom Google Email Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (googleCustomEmail.trim()) {
                      handleGoogleVerifyEmail(googleCustomEmail.trim());
                    }
                  }}
                  className="space-y-2.5"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-300">
                      {lang === 'id' ? 'Masukkan Alamat Email Akun Anda:' : 'Enter Your Account Email Address:'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={googleCustomEmail}
                        onChange={(e) => setGoogleCustomEmail(e.target.value)}
                        placeholder="email.anda@gmail.com"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Anti-Bot Security CAPTCHA Widget for Google Login */}
                  <div className="pt-1">
                    <CaptchaWidget onCaptchaChange={setGoogleCaptcha} lang={lang} initialMode="turnstile" />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !googleCustomEmail.trim() || !googleCaptcha.answer}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition disabled:opacity-50 active:scale-[0.98]"
                  >
                    <span className="text-white font-extrabold">{isLoading ? (lang === 'id' ? 'Memverifikasi Akun...' : 'Verifying Account...') : (lang === 'id' ? 'Lanjutkan Masuk' : 'Continue Sign In')}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-white" />
                  </button>
                </form>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMsg(null); }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← {lang === 'id' ? 'Kembali ke Login Email & Password' : 'Back to Standard Sign In'}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 5: FORGOT PASSWORD (Step 2: OTP + New Password) */}
          {/* ========================================================================= */}
          {tab === 'forgot_verify' && (
            <form onSubmit={handleForgotResetPassword} className="space-y-3">
              <div className="text-center mb-1">
                <p className="text-xs text-slate-300">
                  {lang === 'id' ? 'Masukkan 6-digit kode reset yang dikirimkan ke:' : 'Enter 6-digit reset code sent to:'}
                </p>
                <p className="text-xs font-mono font-bold text-amber-300 mt-0.5">
                  {email}
                </p>
              </div>

              {/* 6-box input */}
              <div className="flex justify-center gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="h-10 w-10 rounded-xl border border-slate-700 bg-slate-900 text-center text-lg font-mono font-bold text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                  />
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-300">
                  {lang === 'id' ? 'Kata Sandi Baru' : 'New Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 5 karakter"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-8 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-300">
                  {lang === 'id' ? 'Konfirmasi Kata Sandi Baru' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-8 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => { setTab('forgot'); setErrorMsg(null); }}
                  className="text-slate-400 hover:text-white"
                >
                  ← {lang === 'id' ? 'Ganti Email' : 'Change Email'}
                </button>

                <button
                  type="button"
                  disabled={otpCountdown > 0 || isLoading}
                  onClick={handleForgotSendOtp}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 disabled:text-slate-600"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>
                    {otpCountdown > 0 ? `Kirim ulang (${otpCountdown}s)` : 'Kirim Ulang Kode'}
                  </span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpDigits.join('').length !== 6 || !newPassword}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/30 transition disabled:opacity-50"
              >
                <span>{isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}</span>
                <Check className="h-4 w-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  );
};
