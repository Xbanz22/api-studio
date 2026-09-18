import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Zap,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  ArrowRight,
  HelpCircle,
  Crown,
  Building2,
  Smartphone,
  QrCode,
  Copy,
  Upload,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Receipt,
  FileText,
  CreditCard,
  History,
  RefreshCw,
  Eye,
  Info,
  Download,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { PricingPlan, UserProfile, ManualPaymentMethod, ManualPaymentRequest, AccountTier } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onUserTierUpdated?: (newTier: AccountTier) => void;
  lang: 'id' | 'en';
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserTierUpdated,
  lang,
}) => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plans' | 'checkout' | 'history'>('plans');

  // Checkout State
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PricingPlan | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<ManualPaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('pay_bca');
  const [uniqueCode, setUniqueCode] = useState<number>(() => Math.floor(100 + Math.random() * 899));
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Form State
  const [senderAccountName, setSenderAccountName] = useState('');
  const [senderAccountNumber, setSenderAccountNumber] = useState('');
  const [proofImageBase64, setProofImageBase64] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // History State
  const [userInvoices, setUserInvoices] = useState<ManualPaymentRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [viewingProof, setViewingProof] = useState<ManualPaymentRequest | null>(null);
  const [proofZoom, setProofZoom] = useState<number>(1);

  // Fast Instant Upgrade State
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Pricing Plans & Payment Methods
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    Promise.all([
      fetch('/api/pricing/plans').then(r => r.json()),
      fetch('/api/payments/methods').then(r => r.json())
    ])
      .then(([plansData, methodsData]) => {
        if (plansData.success && Array.isArray(plansData.data)) {
          setPlans(plansData.data);
        }
        if (methodsData.success && Array.isArray(methodsData.data)) {
          setPaymentMethods(methodsData.data);
          if (methodsData.data.length > 0) {
            setSelectedMethodId(methodsData.data[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch user invoices if logged in
    if (currentUser?.email) {
      fetchUserInvoices();
    }
  }, [isOpen, currentUser?.email]);

  const fetchUserInvoices = async () => {
    if (!currentUser?.email) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/payments/requests?email=${encodeURIComponent(currentUser.email)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUserInvoices(data.data);
      }
    } catch {}
    finally {
      setLoadingHistory(false);
    }
  };

  if (!isOpen) return null;

  const currentTier = currentUser?.tier || 'Free';

  // Handle Copy Helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Convert raw price string to number (e.g. "Rp 99.000" -> 99000)
  const getNumericPrice = (priceStr: string): number => {
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  // Click on a plan: If Free -> instant downgrade, if Paid -> Open Manual Checkout
  const handleChoosePlan = (plan: PricingPlan) => {
    if (plan.id === 'plan_free' || plan.name.toLowerCase().includes('free')) {
      handleDirectSimulationUpgrade(plan);
    } else {
      setSelectedPlanForCheckout(plan);
      setUniqueCode(Math.floor(100 + Math.random() * 899));
      setFormError(null);
      setActiveTab('checkout');
    }
  };

  // Direct Simulation (Free or Developer testing bypass)
  const handleDirectSimulationUpgrade = async (plan: PricingPlan) => {
    let targetTier: AccountTier = 'Pro';
    if (plan.id === 'plan_free' || plan.name.toLowerCase().includes('free')) {
      targetTier = 'Free';
    } else if (plan.id === 'plan_basic' || plan.name.toLowerCase().includes('basic')) {
      targetTier = 'Basic';
    } else if (plan.id === 'plan_enterprise' || plan.name.toLowerCase().includes('enterprise')) {
      targetTier = 'Enterprise';
    }

    setUpgradingPlanId(plan.id);
    try {
      const res = await fetch('/api/user/request-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser?.email || 'developer@company.io',
          targetTier
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          lang === 'id'
            ? `Berhasil beralih ke paket ${plan.name}! Kuota dan rate limit akun Anda telah diperbarui.`
            : `Successfully switched to ${plan.name}! Quota and rate limits updated.`
        );
        if (onUserTierUpdated) onUserTierUpdated(targetTier);
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      alert('Error updating tier: ' + err.message);
    } finally {
      setUpgradingPlanId(null);
    }
  };

  // Safe Download Proof Image
  const handleDownloadProof = (dataUrl: string, filename: string) => {
    try {
      const arr = dataUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'bukti-transfer.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Handle Image File Upload -> Compressed Base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setFormError('Ukuran gambar maksimal 15 MB.');
      return;
    }

    setFormError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        // Automatically resize down to max 1280px to prevent browser freezing & huge payloads
        const maxDimension = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setProofImageBase64(compressedDataUrl);
        } else {
          setProofImageBase64(rawDataUrl);
        }
      };
      img.onerror = () => {
        setProofImageBase64(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Handle Submit Manual Payment Confirmation
  const handleSubmitManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForCheckout) return;

    if (!senderAccountName.trim()) {
      setFormError('Harap isi Nama Pemilik Rekening / Pengirim.');
      return;
    }

    const basePrice = getNumericPrice(selectedPlanForCheckout.price);
    const targetTier: AccountTier = (selectedPlanForCheckout.id === 'plan_enterprise' || selectedPlanForCheckout.name.toLowerCase().includes('enterprise'))
      ? 'Enterprise'
      : (selectedPlanForCheckout.id === 'plan_basic' || selectedPlanForCheckout.name.toLowerCase().includes('basic'))
      ? 'Basic'
      : 'Pro';

    setSubmittingPayment(true);
    setFormError(null);

    try {
      const res = await fetch('/api/payments/manual-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser?.email || 'developer@company.io',
          userName: currentUser?.name || 'Developer User',
          planId: selectedPlanForCheckout.id,
          planName: selectedPlanForCheckout.name,
          targetTier,
          amount: basePrice,
          paymentMethodId: selectedMethodId,
          senderAccountName: senderAccountName.trim(),
          senderAccountNumber: senderAccountNumber.trim() || undefined,
          proofImageUrl: proofImageBase64 || undefined,
          notes: notes.trim() || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          `Konfirmasi pembayaran (${data.data.id}) berhasil dikirim! Admin akan memverifikasi dan meng-upgrade role Anda dalam waktu singkat.`
        );
        fetchUserInvoices();
        setActiveTab('history');
      } else {
        setFormError(data.error || 'Gagal mengirim konfirmasi.');
      }
    } catch (err: any) {
      setFormError('Terjadi kesalahan jaringan: ' + err.message);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);
  const basePriceNum = selectedPlanForCheckout ? getNumericPrice(selectedPlanForCheckout.price) : 0;
  const totalTransferNum = basePriceNum + uniqueCode;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6">
      <div className="min-h-full flex items-start sm:items-center justify-center py-6 sm:py-10">
        <div className="relative w-full max-w-6xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900 dark:text-white">
          
          {/* Top Bar / Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              {activeTab !== 'plans' && (
                <button
                  onClick={() => setActiveTab('plans')}
                  className="flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Kembali ke Paket</span>
                </button>
              )}

              <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-1">
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    activeTab === 'plans'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Daftar Paket & Harga
                </button>
                <button
                  onClick={() => {
                    fetchUserInvoices();
                    setActiveTab('history');
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    activeTab === 'history'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  <span>Riwayat Invoice ({userInvoices.length})</span>
                </button>
              </div>
            </div>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 p-2 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-center text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-fade-in flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: PRICING PLANS GRID */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{lang === 'id' ? 'Paket & Konfigurasi Kuota API' : 'Plans & API Quota Pricing'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {lang === 'id' ? 'Pilih Paket & Upgrade Tier Akun Anda' : 'Upgrade Your Account Tier'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {lang === 'id'
                    ? 'Tingkatkan batas rate limit (req/menit), kuota bulanan, dan prioritas endpoint Gemini 2.0 AI tanpa downtime.'
                    : 'Scale your rate limits (req/min), monthly quotas, and unlock priority Gemini AI processing.'}
                </p>
              </div>

              {loading ? (
                <div className="flex h-64 items-center justify-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Memuat daftar harga & kuota realtime...
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {plans.map((plan) => {
                    const isCurrent =
                      (plan.id === 'plan_free' && currentTier === 'Free') ||
                      (plan.id === 'plan_basic' && currentTier === 'Basic') ||
                      (plan.id === 'plan_pro' && currentTier === 'Pro') ||
                      (plan.id === 'plan_enterprise' && currentTier === 'Enterprise');

                    const isPopular = plan.isPopular || plan.id === 'plan_pro' || plan.name.toLowerCase() === 'pro';
                    const isBasic = plan.id === 'plan_basic' || plan.name.toLowerCase().includes('basic');
                    const isEnterprise = plan.id === 'plan_enterprise' || plan.name.toLowerCase().includes('enterprise');

                    return (
                      <div
                        key={plan.id}
                        className={`relative flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
                          isPopular
                            ? 'border-2 border-indigo-500 bg-indigo-50/40 dark:bg-slate-900/90 shadow-lg shadow-indigo-500/10 dark:shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                            : isEnterprise
                            ? 'border-2 border-amber-500/60 bg-amber-50/40 dark:bg-slate-900/90 shadow-md shadow-amber-500/5'
                            : isBasic
                            ? 'border border-sky-300 dark:border-sky-500/30 bg-sky-50/30 dark:bg-slate-900/90 shadow-sm'
                            : 'border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {isPopular && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                            Paling Populer
                          </div>
                        )}

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {isEnterprise ? (
                                <Crown className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                              ) : isPopular ? (
                                <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              ) : isBasic ? (
                                <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                              ) : (
                                <Shield className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                              )}
                              <span>{plan.name}</span>
                            </h3>
                            {isCurrent && (
                              <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                                Aktif
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 min-h-[36px] leading-relaxed">
                            {plan.description}
                          </p>

                          {/* Price Tag */}
                          <div className="border-y border-slate-200 dark:border-slate-800/80 py-3.5 space-y-1">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                                {plan.price}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">/ {plan.period || 'bulan'}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[11px] font-mono text-slate-700 dark:text-indigo-300">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                                <span>{plan.rateLimit} req/min</span>
                              </span>
                              <span className="text-slate-400 dark:text-slate-600">•</span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                <span>{plan.totalLimit.toLocaleString()} req/bln</span>
                              </span>
                            </div>
                          </div>

                          {/* Features List */}
                          <div className="space-y-2.5 pt-1 text-xs">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                              Fitur Termasuk:
                            </span>
                            <ul className="space-y-2">
                              {plan.features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="leading-snug">{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Action CTA Button */}
                        <div className="pt-6 space-y-2">
                          {isCurrent ? (
                            <button
                              disabled
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-default"
                            >
                              Paket Aktif Saat Ini
                            </button>
                          ) : (
                            <button
                              onClick={() => handleChoosePlan(plan)}
                              disabled={upgradingPlanId === plan.id}
                              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition shadow-md ${
                                isPopular
                                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'
                                  : isEnterprise
                                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/30'
                                  : isBasic
                                  ? 'bg-sky-600 text-white hover:bg-sky-700 shadow-sky-600/30'
                                  : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <span>
                                {plan.id === 'plan_free' ? 'Beralih ke Free' : `Beli / Upgrade ke ${plan.name}`}
                              </span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANUAL PAYMENT CHECKOUT */}
          {activeTab === 'checkout' && selectedPlanForCheckout && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Pembayaran Manual & Konfirmasi Transfer</span>
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Transfer sesuai nominal ke rekening resmi di bawah, lalu upload bukti transfer untuk di-approve admin.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Paket yang Dipilih:</span>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{selectedPlanForCheckout.name}</p>
                </div>
              </div>

              {formError && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Bank / QRIS Payment Methods */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    1. Pilih Rekening Bank / QRIS Tujuan:
                  </h3>

                  <div className="space-y-2">
                    {paymentMethods.map((method) => {
                      const isSelected = selectedMethodId === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedMethodId(method.id)}
                          className={`w-full rounded-xl border p-3.5 text-left transition ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/30 ring-1 ring-indigo-500/40 text-slate-900 dark:text-white'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              {method.type === 'qris' ? (
                                <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              ) : method.type === 'ewallet' ? (
                                <Smartphone className="h-4 w-4 text-sky-600 dark:text-cyan-400" />
                              ) : (
                                <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              )}
                              <span className="text-xs font-bold">{method.name}</span>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Account Detail Card */}
                  {selectedMethod && (
                    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-950/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                          Detail Rekening Tujuan
                        </span>
                        <span className="text-[10px] rounded-md bg-indigo-200 dark:bg-indigo-500/20 px-2 py-0.5 text-indigo-800 dark:text-indigo-300 font-mono">
                          {selectedMethod.type.toUpperCase()}
                        </span>
                      </div>

                      {selectedMethod.qrImageUrl ? (
                        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-inner my-2 border border-slate-200">
                          <img
                            src={selectedMethod.qrImageUrl}
                            alt="QRIS Barcode"
                            className="h-44 w-44 object-contain"
                          />
                          <span className="text-[10px] font-bold text-slate-700 mt-1">Scan QRIS Semua Pembayaran</span>
                        </div>
                      ) : null}

                      <div className="rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3 space-y-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Nomor Rekening / No. HP:</span>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="font-mono text-sm font-bold text-indigo-700 dark:text-cyan-400">
                              {selectedMethod.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(selectedMethod.accountNumber, 'acc')}
                              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              {copiedText === 'acc' ? <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3 w-3" />}
                              <span>{copiedText === 'acc' ? 'Tersalin' : 'Salin'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-2">
                          <span className="text-[10px] text-slate-500 block">Atas Nama (A/N):</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {selectedMethod.accountHolder}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {selectedMethod.instructions}
                      </p>
                    </div>
                  )}

                  {/* Amount Breakdown Card */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Harga Paket ({selectedPlanForCheckout.name}):</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">Rp {basePriceNum.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
                      <span className="flex items-center gap-1">
                        <span>Kode Unik Verifikasi:</span>
                        <span title="Kode unik agar pembayaran Anda mudah diverifikasi admin">
                          <Info className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                        </span>
                      </span>
                      <span className="font-mono font-bold">+Rp {uniqueCode}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Total yang Harus Ditransfer:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                          Rp {totalTransferNum.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(totalTransferNum.toString(), 'total')}
                          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          {copiedText === 'total' ? 'Tersalin' : 'Salin Total'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Confirmation & Proof Form */}
                <div className="lg:col-span-7">
                  <form onSubmit={handleSubmitManualPayment} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>2. Formulir Konfirmasi Bukti Transfer:</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Email Akun Pemesan:
                        </label>
                        <input
                          type="email"
                          disabled
                          value={currentUser?.email || 'developer@company.io'}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-3.5 py-2 text-xs font-mono text-slate-500 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Nama Pengirim / Pemilik Rekening <span className="text-rose-500 dark:text-rose-400">*</span>:
                        </label>
                        <input
                          type="text"
                          required
                          value={senderAccountName}
                          onChange={(e) => setSenderAccountName(e.target.value)}
                          placeholder="Contoh: Ahmad Fauzi"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Nomor Rekening / No. HP Pengirim (Opsional):
                      </label>
                      <input
                        type="text"
                        value={senderAccountNumber}
                        onChange={(e) => setSenderAccountNumber(e.target.value)}
                        placeholder="Contoh: 5220392811 / 08129821xxxx"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    {/* Upload Struk Bukti Transfer */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Upload Foto Bukti Struk Transfer (JPG/PNG):
                      </label>
                      <div className="mt-1 flex justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800 px-6 pt-5 pb-6 hover:border-indigo-500/50 transition">
                        {proofImageBase64 ? (
                          <div className="space-y-2 text-center">
                            <img
                              src={proofImageBase64}
                              alt="Bukti Transfer"
                              className="max-h-44 rounded-lg mx-auto object-cover border border-slate-200 dark:border-slate-700 shadow-md"
                            />
                            <button
                              type="button"
                              onClick={() => setProofImageBase64('')}
                              className="text-xs font-semibold text-rose-500 dark:text-rose-400 hover:underline"
                            >
                              Ganti Gambar
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500" />
                            <div className="flex text-xs text-slate-500 dark:text-slate-400">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md font-semibold text-indigo-600 dark:text-indigo-400 hover:underline focus-within:outline-none"
                              >
                                <span>Pilih file gambar</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handleImageFileChange}
                                />
                              </label>
                              <p className="pl-1">atau drag and drop struk transfer</p>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Maksimal 4 MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Catatan Tambahan (Opsional):
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Sudah transfer via m-BCA jam 14:30 WIB"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submittingPayment}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition"
                      >
                        {submittingPayment ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Mengirim Konfirmasi...</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Kirim Bukti Pembayaran</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER INVOICES / PAYMENT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Riwayat Pesanan & Status Invoice</span>
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Lacak proses persetujuan dan riwayat upgrade role akun Anda.
                  </p>
                </div>

                <button
                  onClick={fetchUserInvoices}
                  disabled={loadingHistory}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {userInvoices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-2">
                  <Receipt className="h-8 w-8 text-slate-400 dark:text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada riwayat pesanan pembayaran.</p>
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Lihat Daftar Paket & Beli Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userInvoices.map((inv) => {
                    const isPending = inv.status === 'PENDING';
                    const isApproved = inv.status === 'APPROVED';
                    const isRejected = inv.status === 'REJECTED';

                    return (
                      <div
                        key={inv.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{inv.id}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isApproved
                                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40'
                                  : isRejected
                                  ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40'
                                  : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40 animate-pulse'
                              }`}
                            >
                              {isApproved ? 'DISETUJUI (AKTIF)' : isRejected ? 'DITOLAK' : 'MENUNGGU VERIFIKASI ADMIN'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300">
                            Upgrade ke: <strong>{inv.planName} ({inv.targetTier})</strong> • Metode: {inv.paymentMethodName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Pengirim: {inv.senderAccountName} • Tanggal: {new Date(inv.createdAt).toLocaleString('id-ID')}
                          </p>
                          {inv.adminNotes && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1 bg-white dark:bg-slate-950/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80">
                              Catatan Admin: "{inv.adminNotes}"
                            </p>
                          )}
                        </div>

                        <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
                          <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            Rp {inv.totalAmount.toLocaleString()}
                          </span>

                          {inv.proofImageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setProofZoom(1);
                                setViewingProof(inv);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Lihat Bukti</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Lightbox Modal for Viewing Proof in PricingModal */}
          {viewingProof && viewingProof.proofImageUrl && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-6">
              <div className="relative max-w-3xl w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Foto Struk Bukti Transfer</h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Invoice #{viewingProof.id} • {viewingProof.planName} (Rp {viewingProof.totalAmount.toLocaleString()})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadProof(viewingProof.proofImageUrl!, `struk-${viewingProof.id}.jpg`)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                      title="Download Bukti Transfer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Unduh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewingProof(null)}
                      className="rounded-xl border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Controls Bar */}
                <div className="flex items-center justify-between px-2 text-xs text-slate-400">
                  <span className="text-[11px]">Pengirim: <strong className="text-white">{viewingProof.senderAccountName}</strong></span>
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setProofZoom(z => Math.max(0.5, z - 0.25))}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-1 text-[10px] font-mono text-slate-300">{Math.round(proofZoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setProofZoom(z => Math.min(3, z + 0.25))}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setProofZoom(1)}
                      className="px-1.5 py-0.5 text-[10px] rounded text-indigo-400 hover:underline font-semibold"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Image Container */}
                <div className="flex justify-center items-center p-3 bg-slate-900/60 rounded-xl max-h-[60vh] sm:max-h-[68vh] overflow-auto border border-slate-900">
                  <img
                    src={viewingProof.proofImageUrl}
                    alt="Struk Transfer"
                    style={{ transform: `scale(${proofZoom})`, transition: 'transform 0.15s ease' }}
                    className="max-h-full max-w-full rounded-lg object-contain origin-center shadow-lg"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Status: <span className="font-bold text-amber-400">{viewingProof.status}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewingProof(null)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
                  >
                    Tutup Tampilan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Note */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/40 p-4 text-center text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Semua transaksi diverifikasi dengan aman oleh tim administrator.</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Admin dapat menyetujui invoice di menu Admin Control Center.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
