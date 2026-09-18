import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import {
  ShieldCheck,
  Activity,
  Server,
  Key,
  Users,
  AlertTriangle,
  Lock,
  Flame,
  Radio,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Sliders,
  Database,
  ArrowUpRight,
  Search,
  Plus,
  Edit2,
  Check,
  Cpu,
  Layers,
  Sparkles,
  DollarSign,
  TrendingUp,
  Clock,
  Megaphone,
  UserCheck,
  Copy,
  Zap,
  Crown,
  Eye,
  EyeOff,
  Save,
  Send,
  MessageSquare,
  Bot,
  X,
  Receipt,
  CheckCheck,
  CreditCard,
  QrCode,
  Smartphone,
  ExternalLink,
  Image as ImageIcon,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Phone,
  Globe,
  Gauge,
  Film
} from 'lucide-react';
import { TrafficDiagram } from './TrafficDiagram';
import { RateLimitManager } from './RateLimitManager';
import {
  ApiKeyItem,
  ApiLogItem,
  ServerStats,
  SecuritySettings,
  UserProfile,
  PricingPlan,
  SiteSettings,
  SystemAnnouncement,
  TelegramSettings,
  ManualPaymentRequest,
  ManualPaymentMethod
} from '../types';
import { ALL_MANAGEABLE_ENDPOINTS, ManageableEndpoint } from '../data/manageableEndpoints';

const originalFetch = window.fetch;
const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let url = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
  const savedUserStr = localStorage.getItem('api_studio_current_user');
  if (savedUserStr && url.startsWith('/api/')) {
    try {
      const user = JSON.parse(savedUserStr);
      if (user && user.email) {
        const customInit = init ? { ...init } : {};
        const headers = new Headers(customInit.headers || {});
        if (!headers.has('x-user-email')) {
          headers.set('x-user-email', user.email);
        }
        if (!headers.has('x-user-role')) {
          headers.set('x-user-role', user.role || 'user');
        }
        customInit.headers = headers;
        return originalFetch(input, customInit);
      }
    } catch (e) {
      console.error(e);
    }
  }
  return originalFetch(input, init);
};

interface AdminDashboardProps {
  user: UserProfile;
  stats: ServerStats | null;
  logs: ApiLogItem[];
  apiKeys: ApiKeyItem[];
  siteSettings?: SiteSettings | null;
  onUpdateSiteSettings?: (updated: SiteSettings) => void;
  onRefreshAll: () => void;
  onNavigateTab: (tab: 'explorer' | 'keys' | 'mock' | 'analytics' | 'docs') => void;
  lang: 'id' | 'en';
}

type AdminSubTab = 'overview' | 'rate_limits' | 'manual_payments' | 'pricing' | 'custom_keys' | 'users' | 'announcement' | 'telegram' | 'endpoint_tiers' | 'branding_contact';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  stats,
  logs,
  apiKeys,
  siteSettings,
  onUpdateSiteSettings,
  onRefreshAll,
  onNavigateTab,
  lang,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('overview');

  // Site & Contact Settings State
  const [siteForm, setSiteForm] = useState<SiteSettings>({
    title: siteSettings?.title || 'REST API Studio',
    tagline: siteSettings?.tagline || 'Developer Infrastructure & Interactive API Hub',
    description: siteSettings?.description || 'Platform REST API interaktif dengan live runner, dokumentasi OpenAPI, mock engine, dan API key manager.',
    faviconUrl: siteSettings?.faviconUrl || '⚡',
    thumbnailUrl: siteSettings?.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
    logoIcon: siteSettings?.logoIcon || 'Zap',
    supportWhatsapp: siteSettings?.supportWhatsapp || '',
    supportTelegram: siteSettings?.supportTelegram || '',
    heroVideoUrl: siteSettings?.heroVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-code-animation-on-a-computer-screen-1241-large.mp4',
    enableHeroVideo: siteSettings?.enableHeroVideo ?? true,
  });
  const [isSavingSite, setIsSavingSite] = useState(false);

  useEffect(() => {
    if (siteSettings) {
      setSiteForm({
        title: siteSettings.title || 'REST API Studio',
        tagline: siteSettings.tagline || 'Developer Infrastructure & Interactive API Hub',
        description: siteSettings.description || '',
        faviconUrl: siteSettings.faviconUrl || '⚡',
        thumbnailUrl: siteSettings.thumbnailUrl || '',
        logoIcon: siteSettings.logoIcon || 'Zap',
        supportWhatsapp: siteSettings.supportWhatsapp || '',
        supportTelegram: siteSettings.supportTelegram || '',
        heroVideoUrl: siteSettings.heroVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-code-animation-on-a-computer-screen-1241-large.mp4',
        enableHeroVideo: siteSettings.enableHeroVideo ?? true,
      });
    }
  }, [siteSettings]);

  // Security Settings State
  const [security, setSecurity] = useState<SecuritySettings>({
    maintenanceMode: false,
    blockedIps: ['198.51.100.42'],
    globalRateMultiplier: 1.0,
    requireAuthForPublicEndpoints: false,
    corsOrigins: ['*']
  });
  const [newBlockedIp, setNewBlockedIp] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | '2xx' | '4xx' | '5xx'>('all');
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isUpdatingSec, setIsUpdatingSec] = useState(false);

  // Manual Payments State
  const [paymentRequests, setPaymentRequests] = useState<ManualPaymentRequest[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<ManualPaymentMethod[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedProofImage, setSelectedProofImage] = useState<string | null>(null);
  const [adminProofZoom, setAdminProofZoom] = useState<number>(1);
  const [rejectingOrder, setRejectingOrder] = useState<ManualPaymentRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [orderToDelete, setOrderToDelete] = useState<ManualPaymentRequest | null>(null);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [adminApproveNotes, setAdminApproveNotes] = useState('');
  const [editingPaymentMethods, setEditingPaymentMethods] = useState(false);
  const [savingMethods, setSavingMethods] = useState(false);

  // Key Management State
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKeyItem | null>(null);
  const [isRevokingKey, setIsRevokingKey] = useState(false);

  // Pricing Plans State
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isAddingNewPlan, setIsAddingNewPlan] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    name: '',
    price: 'Rp 149.000',
    period: 'bulan',
    rateLimit: 500,
    totalLimit: 50000,
    description: 'Paket kustom untuk performa tinggi.',
    featuresText: '5 API Keys Aktif\n500 Req / Menit Rate Limit\n50.000 Req / Bulan Kuota\nDedicated AI Priority Support',
    isPopular: false,
    badgeColor: 'indigo'
  });

  // Custom API Key Generator State (Admin Only)
  const [customKeyForm, setCustomKeyForm] = useState({
    customKey: '',
    name: '',
    tier: 'Enterprise' as 'Free' | 'Pro' | 'Enterprise',
    rateLimit: 1000,
    totalLimit: 100000,
    isUnlimitedRate: false,
    isUnlimitedQuota: false,
    ownerEmail: 'developer@company.io'
  });
  const [isCreatingCustomKey, setIsCreatingCustomKey] = useState(false);

  // Users List State
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // System Announcement State
  const [announcement, setAnnouncement] = useState<SystemAnnouncement>({
    enabled: true,
    message: '🔥 Update Platform: Endpoint Gemini 2.0 AI Flash telah aktif. Kuota Free Tier: 60 req/min & 5.000 req/bulan!',
    type: 'info'
  });
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);

  // Telegram Bot Logger State
  const [telegram, setTelegram] = useState<TelegramSettings>({
    enabled: false,
    botToken: '',
    chatId: '',
    sendOnErrors: true,
    sendOnSecurityAlerts: true,
    sendOnAllRequests: false,
    sendOnKeyActivity: true,
    autoBackupEnabled: false,
    autoBackupIntervalHours: 24,
    lastAutoBackupAt: null,
    lastTestStatus: null
  });
  const [loadingTelegram, setLoadingTelegram] = useState(false);
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Backup & Restore State
  const [isSendingTelegramBackup, setIsSendingTelegramBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string; restored?: any } | null>(null);

  // Endpoint Tiers State
  const [localTiers, setLocalTiers] = useState<Record<string, string>>({});
  const [isSavingTiers, setIsSavingTiers] = useState(false);
  const [endpointSearchQuery, setEndpointSearchQuery] = useState('');
  const [endpointCategoryFilter, setEndpointCategoryFilter] = useState<'all' | 'ai' | 'tools' | 'data' | 'keys' | 'system' | 'analytics'>('all');

  useEffect(() => {
    if (security && security.endpointTiers) {
      setLocalTiers(security.endpointTiers);
    }
  }, [security]);

  // Initial Data Fetching
  const fetchSecurity = () => {
    fetch('/api/admin/security')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setSecurity(data.data);
      })
      .catch(() => {});
  };

  const fetchTelegram = () => {
    setLoadingTelegram(true);
    fetch('/api/admin/telegram')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setTelegram(data.data);
          if (data.data.lastTestStatus) {
            setTelegramTestStatus(data.data.lastTestStatus);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTelegram(false));
  };

  const fetchPricingPlans = () => {
    setLoadingPlans(true);
    fetch('/api/pricing/plans')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setPricingPlans(data.data);
      })
      .catch(() => {})
      .finally(() => setLoadingPlans(false));
  };

  const fetchUsers = () => {
    setLoadingUsers(true);
    fetch('/api/auth/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setUsersList(data.data);
      })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  };

  const fetchAnnouncement = () => {
    fetch('/api/system/announcement')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setAnnouncement(data.data);
      })
      .catch(() => {});
  };

  const fetchPayments = () => {
    setLoadingPayments(true);
    Promise.all([
      fetch('/api/payments/requests').then((r) => r.json()),
      fetch('/api/payments/methods').then((r) => r.json())
    ])
      .then(([reqs, methods]) => {
        if (reqs.success && Array.isArray(reqs.data)) setPaymentRequests(reqs.data);
        if (methods.success && Array.isArray(methods.data)) setPaymentMethods(methods.data);
      })
      .catch(() => {})
      .finally(() => setLoadingPayments(false));
  };

  useEffect(() => {
    fetchSecurity();
    fetchPricingPlans();
    fetchUsers();
    fetchAnnouncement();
    fetchTelegram();
    fetchPayments();
  }, []);

  const handleApprovePayment = async (orderId: string) => {
    setApprovingOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/payments/requests/${orderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: adminApproveNotes || 'Pembayaran diverifikasi & role tier diaktifkan oleh admin.' })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Pesanan ${orderId} berhasil DISETUJUI! Role ${data.data?.userEmail} otomatis di-upgrade ke ${data.data?.targetTier}.`);
        setAdminApproveNotes('');
        fetchPayments();
        fetchUsers();
        onRefreshAll();
        setTimeout(() => setFeedback(null), 4000);
      } else {
        alert(data.error || 'Gagal menyetujui pesanan');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setApprovingOrderId(null);
    }
  };

  const handleRejectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingOrder) return;
    try {
      const res = await fetch(`/api/admin/payments/requests/${rejectingOrder.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: rejectReason || 'Bukti transfer tidak valid atau dana belum masuk rekening.' })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Pesanan ${rejectingOrder.id} telah ditolak.`);
        setRejectingOrder(null);
        setRejectReason('');
        fetchPayments();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(data.error || 'Gagal menolak pesanan');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleConfirmDeletePayment = async () => {
    if (!orderToDelete) return;
    setIsDeletingPayment(true);
    const orderId = orderToDelete.id;
    try {
      const res = await fetch(`/api/admin/payments/requests/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Pesanan ${orderId} (${orderToDelete.userEmail}) berhasil dihapus.`);
        setOrderToDelete(null);
        fetchPayments();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(data.error || 'Gagal menghapus data pesanan.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsDeletingPayment(false);
    }
  };

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

  const handleSavePaymentMethods = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMethods(true);
    try {
      const res = await fetch('/api/admin/payments/methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methods: paymentMethods })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Daftar rekening tujuan pembayaran berhasil disimpan!');
        setEditingPaymentMethods(false);
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(data.error || 'Gagal menyimpan rekening');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSavingMethods(false);
    }
  };

  const updateSecurity = async (newSec: Partial<SecuritySettings>) => {
    setIsUpdatingSec(true);
    try {
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSec)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSecurity(data.data);
        setFeedback(lang === 'id' ? 'Pengaturan firewall diperbarui!' : 'Firewall updated!');
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err: any) {
      setFeedback('Error: ' + err.message);
    } finally {
      setIsUpdatingSec(false);
    }
  };

  const countEndpointsForTier = (tier: 'Free' | 'Basic' | 'Pro' | 'Enterprise') => {
    const TIER_WEIGHTS: Record<string, number> = { 'Free': 1, 'Basic': 2, 'Pro': 3, 'Enterprise': 4 };
    const userWeight = TIER_WEIGHTS[tier];
    let allowedCount = 0;

    ALL_MANAGEABLE_ENDPOINTS.forEach((ep) => {
      const requiredTier = localTiers[ep.path] || 'Free';
      const reqWeight = TIER_WEIGHTS[requiredTier] || 1;
      if (userWeight >= reqWeight) {
        allowedCount++;
      }
    });
    return allowedCount;
  };

  const handleSaveEndpointTiers = async () => {
    setIsSavingTiers(true);
    try {
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpointTiers: localTiers })
      });
      const data = await res.json();
      if (data.success) {
        setSecurity(data.data);
        setFeedback('Konfigurasi otorisasi tier endpoint berhasil disimpan!');
        setTimeout(() => setFeedback(null), 4000);
      } else {
        alert(data.error || 'Gagal menyimpan otorisasi endpoint.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSavingTiers(false);
    }
  };

  const handleToggleMaintenance = () => {
    updateSecurity({ maintenanceMode: !security.maintenanceMode });
  };

  const handleAddBlockedIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedIp.trim()) return;
    const updated = Array.from(new Set([...security.blockedIps, newBlockedIp.trim()]));
    updateSecurity({ blockedIps: updated });
    setNewBlockedIp('');
  };

  const handleRemoveBlockedIp = (ip: string) => {
    const updated = security.blockedIps.filter((i) => i !== ip);
    updateSecurity({ blockedIps: updated });
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/analytics/clear', { method: 'POST' });
      setFeedback(lang === 'id' ? 'Log server berhasil dibersihkan!' : 'Server logs cleared!');
      onRefreshAll();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback('Failed clearing logs: ' + err.message);
    }
  };

  const handleChangeKeyTier = async (keyStr: string, tier: 'Free' | 'Pro' | 'Enterprise') => {
    const rateLimit = tier === 'Enterprise' ? 1000 : tier === 'Pro' ? 300 : 60;
    const totalLimit = tier === 'Enterprise' ? 100000 : tier === 'Pro' ? 25000 : 5000;
    try {
      const res = await fetch(`/api/keys/${encodeURIComponent(keyStr)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, rateLimit, totalLimit })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(lang === 'id' ? `Tier kunci diubah ke ${tier}!` : `Tier changed to ${tier}!`);
        onRefreshAll();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err: any) {
      setFeedback('Error updating key: ' + err.message);
    }
  };

  const handleResetKeyCount = async (keyStr: string) => {
    try {
      const res = await fetch(`/api/keys/${encodeURIComponent(keyStr)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetCount: true })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(lang === 'id' ? 'Hitungan pemakaian kuota direset ke 0!' : 'Usage count reset to 0!');
        onRefreshAll();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err: any) {
      setFeedback('Error: ' + err.message);
    }
  };

  const confirmAdminRevoke = async () => {
    if (!keyToRevoke) return;
    setIsRevokingKey(true);
    try {
      const res = await fetch(`/api/keys/${encodeURIComponent(keyToRevoke.key)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedback(lang === 'id' ? 'Kunci API berhasil dicabut oleh Admin!' : 'Key revoked by Admin!');
        setKeyToRevoke(null);
        onRefreshAll();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err: any) {
      setFeedback('Failed revoking: ' + err.message);
    } finally {
      setIsRevokingKey(false);
    }
  };

  // --- PRICING MANAGEMENT HANDLERS ---
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      const res = await fetch(`/api/admin/pricing/plans/${editingPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingPlan.name,
          price: editingPlan.price,
          period: editingPlan.period,
          rateLimit: Number(editingPlan.rateLimit),
          totalLimit: Number(editingPlan.totalLimit),
          description: editingPlan.description,
          features: editingPlan.features,
          isPopular: editingPlan.isPopular
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(lang === 'id' ? `Paket "${editingPlan.name}" berhasil diupdate!` : `Plan "${editingPlan.name}" updated!`);
        setEditingPlan(null);
        fetchPricingPlans();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(data.error || 'Gagal update plan');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleCreateNewPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanForm.name.trim() || !newPlanForm.price.trim()) return;

    const featuresList = newPlanForm.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/admin/pricing/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlanForm.name.trim(),
          price: newPlanForm.price.trim(),
          period: newPlanForm.period,
          rateLimit: Number(newPlanForm.rateLimit) || 60,
          totalLimit: Number(newPlanForm.totalLimit) || 5000,
          description: newPlanForm.description.trim(),
          features: featuresList,
          isPopular: newPlanForm.isPopular,
          badgeColor: newPlanForm.badgeColor
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(lang === 'id' ? `Paket baru "${newPlanForm.name}" berhasil ditambahkan!` : 'New plan added!');
        setIsAddingNewPlan(false);
        setNewPlanForm({
          name: '',
          price: 'Rp 149.000',
          period: 'bulan',
          rateLimit: 500,
          totalLimit: 50000,
          description: 'Paket kustom untuk performa tinggi.',
          featuresText: '5 API Keys Aktif\n500 Req / Menit Rate Limit\n50.000 Req / Bulan Kuota\nDedicated AI Priority Support',
          isPopular: false,
          badgeColor: 'indigo'
        });
        fetchPricingPlans();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(data.error || 'Gagal membuat paket');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Hapus paket pricing ini?')) return;
    try {
      const res = await fetch(`/api/admin/pricing/plans/${planId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedback('Paket pricing berhasil dihapus.');
        fetchPricingPlans();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(data.error || 'Gagal menghapus');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // --- CUSTOM API KEY GENERATOR (ADMIN) ---
  const handleGenerateCustomKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeyForm.customKey.trim()) return;

    setIsCreatingCustomKey(true);
    try {
      const res = await fetch('/api/admin/keys/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customKey: customKeyForm.customKey.trim(),
          name: customKeyForm.name.trim() || `Custom Key (${customKeyForm.ownerEmail})`,
          tier: customKeyForm.tier,
          rateLimit: customKeyForm.isUnlimitedRate ? -1 : Number(customKeyForm.rateLimit),
          totalLimit: customKeyForm.isUnlimitedQuota ? -1 : Number(customKeyForm.totalLimit),
          ownerEmail: customKeyForm.ownerEmail.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Custom API Key "${customKeyForm.customKey}" berhasil dibuat dan diaktifkan di database!`);
        setCustomKeyForm({
          customKey: '',
          name: '',
          tier: 'Enterprise',
          rateLimit: 1000,
          totalLimit: 100000,
          isUnlimitedRate: false,
          isUnlimitedQuota: false,
          ownerEmail: 'developer@company.io'
        });
        onRefreshAll();
        setTimeout(() => setFeedback(null), 4000);
      } else {
        alert(data.error || 'Gagal membuat custom API Key');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsCreatingCustomKey(false);
    }
  };

  const handleAutoFillCustomKeyRandom = () => {
    const randomHex = Math.random().toString(36).substring(2, 10);
    setCustomKeyForm({
      ...customKeyForm,
      customKey: `api_vip_${customKeyForm.tier.toLowerCase()}_${randomHex}`
    });
  };

  // --- USER TIER UPDATE HANDLER ---
  const handleUpdateUserTier = async (email: string, tier: 'Free' | 'Pro' | 'Developer' | 'Enterprise') => {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}/tier`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Tier user ${email} berhasil diubah ke ${tier}!`);
        fetchUsers();
        onRefreshAll();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(data.error || 'Gagal update user tier');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleExpireUserSubscription = async (email: string) => {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}/expire-now`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Masa aktif user ${email} diset EXPIRED! Tier diturunkan ke Free.`);
        fetchUsers();
        onRefreshAll();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(data.error || 'Gagal mereset masa aktif user');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // --- SYSTEM ANNOUNCEMENT HANDLER ---
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAnnouncement(true);
    try {
      const res = await fetch('/api/admin/system/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement)
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Pengumuman siaran broadcast berhasil diperbarui!');
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  // --- TELEGRAM LOGGER HANDLERS ---
  const handleSaveTelegram = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingTelegram(true);
    try {
      const res = await fetch('/api/admin/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegram)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTelegram(data.data);
        setFeedback(lang === 'id' ? 'Konfigurasi Telegram Logger berhasil disimpan!' : 'Telegram logger configuration saved!');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(data.error || 'Gagal menyimpan konfigurasi Telegram');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!telegram.botToken.trim() || !telegram.chatId.trim()) {
      alert(lang === 'id' ? 'Mohon isi Bot Token dan Chat ID terlebih dahulu.' : 'Please provide Bot Token and Chat ID.');
      return;
    }
    setIsTestingTelegram(true);
    setTelegramTestStatus(null);
    try {
      const res = await fetch('/api/admin/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: telegram.botToken,
          chatId: telegram.chatId
        })
      });
      const data = await res.json();
      if (data.success) {
        setTelegramTestStatus({
          success: true,
          message: data.message || 'Pesan uji berhasil dikirim ke bot Telegram Anda!'
        });
        setFeedback('Pesan uji Telegram berhasil terkirim!');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setTelegramTestStatus({
          success: false,
          message: data.error || 'Gagal mengirim pesan uji ke Telegram.'
        });
      }
    } catch (err: any) {
      setTelegramTestStatus({
        success: false,
        message: err.message || 'Gagal terhubung ke server Telegram.'
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  // --- BACKUP & RESTORE HANDLERS ---
  const handleDownloadBackup = () => {
    window.open('/api/admin/backup/download', '_blank');
    setFeedback(lang === 'id' ? 'File backup database berhasil diunduh!' : 'Database backup downloaded successfully!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSendBackupToTelegram = async () => {
    setIsSendingTelegramBackup(true);
    try {
      const res = await fetch('/api/admin/backup/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exportedBy: `Admin Manual (${user?.email || 'Admin'})` })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(data.message || 'Backup JSON berhasil dikirim ke Telegram!');
        setTimeout(() => setFeedback(null), 4000);
        fetchTelegram();
      } else {
        alert(data.error || 'Gagal mengirim file backup ke Telegram');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSendingTelegramBackup(false);
    }
  };

  const handleRestoreBackupFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(lang === 'id' ? 'Apakah Anda yakin ingin memulihkan (restore) data dari file backup ini? Data di server akan diperbarui dengan isi file.' : 'Are you sure you want to restore data from this backup file?')) {
      e.target.value = '';
      return;
    }

    setIsRestoringBackup(true);
    setRestoreStatus(null);

    try {
      let backupObj: any;

      if (file.name.toLowerCase().endsWith('.zip')) {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        const dbFile = zip.file('database_state.json');
        if (!dbFile) {
          throw new Error('File database_state.json tidak ditemukan di dalam archive ZIP ini.');
        }
        const dbText = await dbFile.async('text');
        backupObj = JSON.parse(dbText);
      } else {
        const text = await file.text();
        backupObj = JSON.parse(text);
      }

      const res = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupObj)
      });

      const data = await res.json();
      if (data.success) {
        setRestoreStatus({
          success: true,
          message: data.message || 'Restore database berhasil!',
          restored: data.restored
        });
        setFeedback(lang === 'id' ? 'Database berhasil dipulihkan dari file backup!' : 'Database restored successfully!');
        // Refresh system data
        fetchUsers();
        fetchPricingPlans();
        fetchPayments();
        fetchTelegram();
        onRefreshAll();
      } else {
        setRestoreStatus({
          success: false,
          message: data.error || 'Gagal memulihkan database dari file.'
        });
      }
    } catch (err: any) {
      setRestoreStatus({
        success: false,
        message: 'Gagal memproses file backup: ' + err.message
      });
    } finally {
      setIsRestoringBackup(false);
      e.target.value = '';
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((l) => {
    if (statusFilter !== 'all') {
      const codeGroup = `${Math.floor(l.status / 100)}xx`;
      if (codeGroup !== statusFilter) return false;
    }
    if (searchLogQuery) {
      const q = searchLogQuery.toLowerCase();
      return (
        l.url.toLowerCase().includes(q) ||
        l.method.toLowerCase().includes(q) ||
        l.ip.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      
      {/* Admin Master Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-100 dark:from-slate-950 dark:via-amber-950/20 dark:to-slate-950 p-5 sm:p-6 shadow-sm">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                  <span>Super Admin Control Center</span>
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  Node v22 / Express Engine
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {lang === 'id' ? 'Master Platform, Pricing & Rate Limiter Center' : 'Master Platform & Pricing Center'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {lang === 'id'
                  ? 'Atur harga paket tier, batas req/menit, kuota bulanan, buat Custom API Key, dan pantau realtime traffic.'
                  : 'Configure tier pricing, req/min limits, monthly quotas, create custom API keys, and inspect traffic.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onRefreshAll();
                fetchPricingPlans();
                fetchUsers();
                fetchAnnouncement();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition shadow-xs"
            >
              <RefreshCw className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
              <span>{lang === 'id' ? 'Refresh Semua' : 'Refresh All'}</span>
            </button>
            <button
              onClick={handleToggleMaintenance}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs ${
                security.maintenanceMode
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-300'
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>
                {security.maintenanceMode
                  ? (lang === 'id' ? 'Maintenance AKTIF' : 'Maintenance ON')
                  : (lang === 'id' ? 'Toggle Maintenance' : 'Toggle Maintenance')}
              </span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar for Admin Sections */}
        <div className="relative z-10 mt-6 flex flex-wrap items-center gap-1.5 border-t border-slate-200 dark:border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeSubTab === 'overview'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Overview & Firewall Traffic</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rate_limits')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeSubTab === 'rate_limits'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-800 dark:text-cyan-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Gauge className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>Rate Limit Manager & Quota Tier</span>
          </button>

          <button
            onClick={() => setActiveSubTab('manual_payments')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeSubTab === 'manual_payments'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Receipt className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Verifikasi Pembayaran & Role</span>
            {paymentRequests.filter((r) => r.status === 'PENDING').length > 0 && (
              <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[9px] font-bold text-white animate-pulse">
                {paymentRequests.filter((r) => r.status === 'PENDING').length} Baru
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('pricing')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeSubTab === 'pricing'
                ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-800 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Manajemen Harga & Limit Role</span>
          </button>

          <button
            onClick={() => setActiveSubTab('endpoint_tiers')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeSubTab === 'endpoint_tiers'
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-800 dark:text-rose-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
            <span>Otorisasi Tier Endpoint</span>
          </button>

          <button
            onClick={() => setActiveSubTab('custom_keys')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeSubTab === 'custom_keys'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Key className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            <span>Generator Custom API Key</span>
          </button>

          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeSubTab === 'users'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Daftar User & Upgrade Tier</span>
          </button>

          <button
            onClick={() => setActiveSubTab('announcement')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeSubTab === 'announcement'
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-800 dark:text-rose-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Megaphone className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
            <span>Broadcast Banner Sistem</span>
          </button>

          <button
            onClick={() => setActiveSubTab('telegram')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeSubTab === 'telegram'
                ? 'bg-sky-500/20 border border-sky-500/40 text-sky-800 dark:text-sky-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
            <span>Telegram Bot Logger</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold ${telegram.enabled ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {telegram.enabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('branding_contact')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeSubTab === 'branding_contact'
                ? 'bg-green-500/20 border border-green-500/40 text-green-800 dark:text-green-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Phone className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
            <span>Kontak & Web (WhatsApp, Telegram & Video)</span>
            {siteForm.supportWhatsapp && (
              <span className="rounded-full bg-green-500/20 px-1.5 py-0.2 text-[9px] font-mono font-bold text-green-700 dark:text-green-400 border border-green-500/30">
                WA OK
              </span>
            )}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/40 p-3 text-xs text-indigo-300 flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>{feedback}</span>
          </span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <Check className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: OVERVIEW & FIREWALL TRAFFIC */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Metrics Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Visitor Counter Telemetry Card */}
            <div className="rounded-xl border border-sky-500/30 bg-gradient-to-b from-sky-50 dark:from-sky-950/30 to-white dark:to-slate-900/60 p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-sky-700 dark:text-sky-300">Pengunjung Platform</span>
                <div className="rounded-lg bg-sky-500/20 p-1.5 text-sky-600 dark:text-sky-400">
                  <Globe className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {(stats?.visitorStats?.totalVisitors || 1842).toLocaleString()}{' '}
                <span className="text-xs text-sky-700 dark:text-sky-300/80 font-sans">pengunjung</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>Unique: <strong className="text-slate-900 dark:text-white">{stats?.visitorStats?.uniqueVisitors || 156} IP</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {stats?.visitorStats?.onlineNow || 21} Live
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Throughput</span>
                <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {stats?.totalRequests || logs.length} <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">requests</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Sukses: {stats?.successRatePercent || 100}%</span>
                <span>Avg: {stats?.avgLatencyMs || 22}ms</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Global API Keys</span>
                <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-600 dark:text-indigo-400">
                  <Key className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 font-mono">
                {apiKeys.length} <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">kunci aktif</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Mock Routes: {stats?.activeMockRoutes || 1}</span>
                <button
                  onClick={() => setActiveSubTab('custom_keys')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Custom Key &rarr;
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Firewall Blacklist</span>
                <div className="rounded-lg bg-rose-500/10 p-1.5 text-rose-600 dark:text-rose-400">
                  <Flame className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                {security.blockedIps.length} <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">IP Diblokir</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>DDoS Guard Active</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Paket Pricing Aktif</span>
                <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {pricingPlans.length} <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">Tiers</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Free / Pro / VIP</span>
                <button
                  onClick={() => setActiveSubTab('pricing')}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  Kelola &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Traffic Diagram Component */}
          <TrafficDiagram stats={stats} logs={logs} lang={lang} />

          {/* Master API Keys Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  <span>Master API Keys Database ({apiKeys.length} Kunci)</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Ubah Tier secara instan, reset kuota pemakaian, atau cabut kunci paksa.
                </p>
              </div>

              <button
                onClick={() => setActiveSubTab('custom_keys')}
                className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                <span>+ Buat Custom Key</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/80 font-mono text-[11px] text-slate-400">
                  <tr>
                    <th className="p-3">Nama Key & Token</th>
                    <th className="p-3">Owner Email</th>
                    <th className="p-3">Tier</th>
                    <th className="p-3">Pemakaian Realtime</th>
                    <th className="p-3">Rate Limit</th>
                    <th className="p-3 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {apiKeys.map((k) => (
                    <tr key={k.key} className="hover:bg-slate-900/50 transition">
                      <td className="p-3">
                        <div className="font-bold text-white">{k.name}</div>
                        <div className="font-mono text-[11px] text-slate-500 truncate max-w-[220px]">
                          {k.key}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-300 text-[11px]">
                        {k.ownerEmail || 'system/public'}
                      </td>
                      <td className="p-3">
                        <select
                          value={k.tier}
                          onChange={(e) => handleChangeKeyTier(k.key, e.target.value as any)}
                          className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-semibold text-indigo-300 outline-none focus:border-indigo-500"
                        >
                          <option value="Free">Free (60/m)</option>
                          <option value="Pro">Pro (300/m)</option>
                          <option value="Developer">Developer (600/m)</option>
                          <option value="Enterprise">Enterprise (1000/m)</option>
                        </select>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-bold text-white">{k.requestCount}</span>
                        <span className="text-slate-500"> / {(k.totalLimit || 5000).toLocaleString()} req</span>
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        {k.rateLimit} req/min
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleResetKeyCount(k.key)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-700"
                          title="Reset request counter to 0"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setKeyToRevoke(k)}
                          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/20"
                          title="Revoke / Delete Key"
                        >
                          Cabut
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Traffic Stream & Firewall Box */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                      <span>Live Request Stream & Audit ({filteredLogs.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400">Inspeksi langsung setiap traffic API yang masuk.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Cari URL / IP..."
                      value={searchLogQuery}
                      onChange={(e) => setSearchLogQuery(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-white placeholder-slate-500 outline-none w-36"
                    />
                    <button
                      onClick={handleClearLogs}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                    >
                      Clear Log
                    </button>
                  </div>
                </div>

                <div className="max-h-[320px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 font-mono text-[11px]">
                  {filteredLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">Belum ada request yang tercatat.</div>
                  ) : (
                    <div className="divide-y divide-slate-800/80">
                      {filteredLogs.slice(0, 30).map((l) => (
                        <div key={l.id} className="flex items-center justify-between p-2.5 hover:bg-slate-900/50">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                l.method === 'GET'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : l.method === 'POST'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {l.method}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                l.status < 300
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : l.status < 500
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {l.status}
                            </span>
                            <span className="text-slate-300 truncate">{l.url}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 shrink-0 text-[10px]">
                            <span className="font-mono">{l.ip}</span>
                            <button
                              onClick={() => {
                                if (l.ip && !security.blockedIps.includes(l.ip)) {
                                  updateSecurity({ blockedIps: [...security.blockedIps, l.ip] });
                                  setFeedback(`IP ${l.ip} berhasil ditambahkan ke daftar blokir firewall!`);
                                  setTimeout(() => setFeedback(null), 3000);
                                }
                              }}
                              className="rounded border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold text-rose-400 hover:bg-rose-500/20"
                              title="1-Click Ban IP ini"
                            >
                              Ban IP
                            </button>
                            <span className="text-emerald-400 font-mono">{l.latencyMs}ms</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Firewall Blacklist */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                <span>Firewall IP Blacklist</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Blokir IP mencurigakan dari mengakses seluruh gateway API.</p>

              <form onSubmit={handleAddBlockedIp} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: 198.51.100.42"
                  value={newBlockedIp}
                  onChange={(e) => setNewBlockedIp(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Blokir
                </button>
              </form>

              <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
                {security.blockedIps.map((ip) => (
                  <div key={ip} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-rose-600 dark:text-rose-300">
                    <span>{ip}</span>
                    <button
                      onClick={() => handleRemoveBlockedIp(ip)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-white"
                      title="Buka Blokir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Anti-Bot & CAPTCHA Protection Control Panel */}
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 p-5 space-y-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Proteksi Anti-Bot & Smart CAPTCHA Gateway</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${security.captchaEnabled !== false ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                      {security.captchaEnabled !== false ? 'AKTIF' : 'NON-AKTIF'}
                    </span>
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono text-amber-300 font-bold">
                      ⚡ 2-Step Turnstile
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Mencegah serangan spam bot, brute-force form pendaftaran & email OTP dengan verifikasi 2-langkah (Turnstile Handshake + Konfirmasi Pola).
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  const nextState = !(security.captchaEnabled !== false);
                  updateSecurity({ captchaEnabled: nextState });
                  setFeedback(`Sistem CAPTCHA anti-bot berhasil di-${nextState ? 'aktifkan' : 'nonaktifkan'}!`);
                  setTimeout(() => setFeedback(null), 3000);
                }}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  security.captchaEnabled !== false
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                {security.captchaEnabled !== false ? 'Nonaktifkan CAPTCHA' : 'Aktifkan CAPTCHA'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 pt-1">
              {/* Toggle Register */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Daftar Akun</span>
                  <input
                    type="checkbox"
                    checked={security.requireCaptchaRegister !== false}
                    onChange={(e) => {
                      updateSecurity({ requireCaptchaRegister: e.target.checked });
                    }}
                    className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-300">
                  Wajibkan CAPTCHA sebelum pendaftar baru bisa mengirimkan OTP verifikasi.
                </p>
              </div>

              {/* Toggle Forgot Password */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Reset Sandi</span>
                  <input
                    type="checkbox"
                    checked={security.requireCaptchaForgot !== false}
                    onChange={(e) => {
                      updateSecurity({ requireCaptchaForgot: e.target.checked });
                    }}
                    className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-300">
                  Cegah spammer melakukan spam pengiriman OTP reset ke email.
                </p>
              </div>

              {/* Toggle Login */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Login Sandi</span>
                  <input
                    type="checkbox"
                    checked={Boolean(security.requireCaptchaLogin)}
                    onChange={(e) => {
                      updateSecurity({ requireCaptchaLogin: e.target.checked });
                    }}
                    className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-300">
                  Wajibkan CAPTCHA untuk setiap login (otomatis aktif jika 3x gagal).
                </p>
              </div>

              {/* Toggle Google Login */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Login Google</span>
                  <input
                    type="checkbox"
                    checked={security.requireCaptchaGoogle !== false}
                    onChange={(e) => {
                      updateSecurity({ requireCaptchaGoogle: e.target.checked });
                    }}
                    className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-300">
                  Wajibkan verifikasi anti-bot sebelum autentikasi Google SSO.
                </p>
              </div>

              {/* Select Mode & Provider */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <span className="text-xs font-semibold text-white block">Tipe Verifikasi</span>
                <select
                  value={security.captchaMode || 'mixed'}
                  onChange={(e) => {
                    updateSecurity({ captchaMode: e.target.value as any });
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-500"
                >
                  <option value="mixed">⚡ 2-Step Turnstile + Visual</option>
                  <option value="text">Hanya Huruf (Text Distortion)</option>
                  <option value="math">Teka-teki Matematika (Math)</option>
                </select>
                <p className="text-[10px] text-slate-300">
                  Mendukung 2-Step Turnstile & Anti-OCR SVG.
                </p>
              </div>
            </div>

            {/* Cloudflare Custom Domain & DNS Info Banner */}
            <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-200">
                    Siap Deploy ke Custom Domain & Cloudflare Proxy
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Cloudflare Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Aplikasi ini telah siap dihubungkan ke domain kustom Anda (misal: <code className="text-amber-300 font-mono">api.domainanda.com</code>) menggunakan Cloudflare DNS / Proxy (Orange Cloud) dan SSL otomatis. Seluruh endpoint, webhook, dan verifikasi Turnstile 2-langkah akan berjalan lancar di domain kustom Anda.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB: RATE LIMIT MANAGER & TIER QUOTA (NEW) */}
      {/* ========================================================================= */}
      {activeSubTab === 'rate_limits' && (
        <RateLimitManager
          user={user}
          onNotify={(msg) => {
            if (onRefreshAll) onRefreshAll();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB: MANUAL PAYMENTS & ROLE VERIFICATION (NEW) */}
      {/* ========================================================================= */}
      {activeSubTab === 'manual_payments' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-emerald-950/20 to-slate-950 p-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Verifikasi Pembayaran Manual & Upgrade Role</span>
                  {paymentRequests.filter((r) => r.status === 'PENDING').length > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {paymentRequests.filter((r) => r.status === 'PENDING').length} Menunggu Konfirmasi
                    </span>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Periksa bukti struk transfer pengguna, lalu klik "Setujui & Upgrade" untuk menaikkan role dan rate limit secara instan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingPaymentMethods(!editingPaymentMethods)}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                  editingPaymentMethods
                    ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>{editingPaymentMethods ? 'Tutup Pengaturan Rekening' : 'Kelola Rekening Tujuan'}</span>
              </button>

              <button
                onClick={fetchPayments}
                disabled={loadingPayments}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingPayments ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Bank / QRIS Accounts Editor Mode */}
          {editingPaymentMethods && (
            <div className="rounded-2xl border border-indigo-500/40 bg-slate-900/90 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-indigo-400" />
                  <span>Pengaturan Rekening Bank & QRIS Admin</span>
                </h3>
                <span className="text-[11px] text-slate-400">Rekening ini akan tampil saat user memilih bayar manual.</span>
              </div>

              <form onSubmit={handleSavePaymentMethods} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {paymentMethods.map((method, idx) => (
                    <div key={method.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{method.name} ({method.type.toUpperCase()})</span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {method.id}</span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block font-semibold">Nomor Rekening / No. HP</label>
                          <input
                            type="text"
                            value={method.accountNumber}
                            onChange={(e) => {
                              const updated = [...paymentMethods];
                              updated[idx].accountNumber = e.target.value;
                              setPaymentMethods(updated);
                            }}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block font-semibold">Atas Nama (A/N)</label>
                          <input
                            type="text"
                            value={method.accountHolder}
                            onChange={(e) => {
                              const updated = [...paymentMethods];
                              updated[idx].accountHolder = e.target.value;
                              setPaymentMethods(updated);
                            }}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white"
                          />
                        </div>

                        {method.type === 'qris' && (
                          <div>
                            <label className="text-[10px] text-slate-400 block font-semibold">URL Gambar Barcode QRIS</label>
                            <input
                              type="text"
                              value={method.qrImageUrl || ''}
                              onChange={(e) => {
                                const updated = [...paymentMethods];
                                updated[idx].qrImageUrl = e.target.value;
                                setPaymentMethods(updated);
                              }}
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        )}

                        <div>
                          <label className="text-[10px] text-slate-400 block font-semibold">Petunjuk Transfer</label>
                          <input
                            type="text"
                            value={method.instructions}
                            onChange={(e) => {
                              const updated = [...paymentMethods];
                              updated[idx].instructions = e.target.value;
                              setPaymentMethods(updated);
                            }}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPaymentMethods(false)}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingMethods}
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    {savingMethods ? 'Menyimpan...' : 'Simpan Semua Rekening'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setPaymentStatusFilter('ALL')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                paymentStatusFilter === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua Pesanan ({paymentRequests.length})
            </button>
            <button
              onClick={() => setPaymentStatusFilter('PENDING')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                paymentStatusFilter === 'PENDING'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Menunggu Verifikasi</span>
              <span className="rounded-full bg-amber-500/30 px-1.5 py-0.2 text-[10px]">
                {paymentRequests.filter((r) => r.status === 'PENDING').length}
              </span>
            </button>
            <button
              onClick={() => setPaymentStatusFilter('APPROVED')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                paymentStatusFilter === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Disetujui</span>
              <span className="rounded-full bg-emerald-500/30 px-1.5 py-0.2 text-[10px]">
                {paymentRequests.filter((r) => r.status === 'APPROVED').length}
              </span>
            </button>
            <button
              onClick={() => setPaymentStatusFilter('REJECTED')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                paymentStatusFilter === 'REJECTED'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Ditolak</span>
              <span className="rounded-full bg-rose-500/30 px-1.5 py-0.2 text-[10px]">
                {paymentRequests.filter((r) => r.status === 'REJECTED').length}
              </span>
            </button>
          </div>

          {/* Payment Requests List */}
          {paymentRequests.filter((r) => paymentStatusFilter === 'ALL' || r.status === paymentStatusFilter).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-2">
              <Receipt className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-300 font-semibold">Tidak ada data pesanan pembayaran.</p>
              <p className="text-xs text-slate-500">Permintaan pembayaran baru dari user akan langsung muncul di halaman ini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentRequests
                .filter((r) => paymentStatusFilter === 'ALL' || r.status === paymentStatusFilter)
                .map((req) => {
                  const isPending = req.status === 'PENDING';
                  const isApproved = req.status === 'APPROVED';
                  const isRejected = req.status === 'REJECTED';

                  return (
                    <div
                      key={req.id}
                      className={`rounded-2xl border p-5 transition ${
                        isPending
                          ? 'border-amber-500/40 bg-gradient-to-r from-slate-950 via-amber-950/10 to-slate-950 shadow-lg'
                          : isApproved
                          ? 'border-emerald-500/30 bg-slate-950/60'
                          : 'border-slate-800 bg-slate-950/40 opacity-75'
                      }`}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        
                        {/* Left Info: Invoice, User, and Tier */}
                        <div className="lg:col-span-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-extrabold text-white">{req.id}</span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                isApproved
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : isRejected
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                              }`}
                            >
                              {isApproved ? '✓ DISETUJUI' : isRejected ? '✕ DITOLAK' : 'MENUNGGU VERIFIKASI'}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="text-slate-300">
                              User: <strong>{req.userName}</strong> ({req.userEmail})
                            </div>
                            <div className="flex items-center gap-2 text-indigo-300">
                              <span>Target Role Upgrade:</span>
                              <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-bold font-mono">
                                {req.planName} ({req.targetTier})
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] font-mono">
                              Diajukan pada: {new Date(req.createdAt).toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>

                        {/* Middle Info: Amount, Transfer Method & Sender */}
                        <div className="lg:col-span-4 space-y-2 rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Total Nominal:</span>
                            <span className="font-mono text-sm font-extrabold text-emerald-400">
                              Rp {req.totalAmount.toLocaleString()}
                            </span>
                          </div>

                          <div className="border-t border-slate-800 pt-1.5 space-y-1">
                            <div className="text-slate-300">
                              Metode: <strong>{req.paymentMethodName}</strong>
                            </div>
                            <div className="text-slate-400">
                              Pengirim: <strong className="text-slate-200">{req.senderAccountName}</strong>
                              {req.senderAccountNumber && <span> ({req.senderAccountNumber})</span>}
                            </div>
                            {req.notes && (
                              <div className="text-slate-400 italic text-[11px] pt-1">
                                Catatan User: "{req.notes}"
                              </div>
                            )}
                            {req.adminNotes && (
                              <div className="text-amber-400 italic text-[11px] pt-1 border-t border-slate-800/80 mt-1">
                                Catatan Admin: "{req.adminNotes}"
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Proof Image Thumbnail & Action Buttons */}
                        <div className="lg:col-span-4 flex flex-col sm:flex-row items-center gap-3 justify-end w-full">
                          {req.proofImageUrl ? (
                            <button
                              type="button"
                              onClick={() => setSelectedProofImage(req.proofImageUrl!)}
                              className="relative group rounded-xl overflow-hidden border border-slate-700 h-20 w-24 bg-slate-900 shrink-0"
                              title="Klik untuk memperbesar struk"
                            >
                              <img
                                src={req.proofImageUrl}
                                alt="Struk Transfer"
                                className="h-full w-full object-cover group-hover:scale-105 transition"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-[10px] font-bold">
                                <Eye className="h-4 w-4 mr-1" /> Zoom
                              </div>
                            </button>
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-800 h-20 w-24 flex flex-col items-center justify-center text-slate-600 text-[10px] shrink-0">
                              <ImageIcon className="h-5 w-5 mb-0.5" />
                              <span>Tanpa Foto</span>
                            </div>
                          )}

                          <div className="flex flex-col gap-2 w-full sm:w-auto">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => handleApprovePayment(req.id)}
                                  disabled={approvingOrderId === req.id}
                                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                                >
                                  <Check className="h-4 w-4" />
                                  <span>{approvingOrderId === req.id ? 'Memproses...' : 'Setujui & Upgrade Role'}</span>
                                </button>
                                <button
                                  onClick={() => setRejectingOrder(req)}
                                  className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/20 px-4 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Tolak</span>
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setOrderToDelete(req)}
                                className="flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:border-rose-900 transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Hapus Data</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
            </div>
          )}

        </div>
      )}

      {/* Proof Image Lightbox Modal */}
      {selectedProofImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-6">
          <div className="relative max-w-3xl w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-400" />
                <span>Foto Struk Bukti Transfer Pembayaran</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadProof(selectedProofImage, 'struk-bukti-transfer.jpg')}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title="Unduh Struk"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Unduh</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedProofImage(null);
                    setAdminProofZoom(1);
                  }}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center justify-between px-2 text-xs text-slate-400">
              <span className="text-[11px] text-slate-500">Gunakan tombol zoom untuk memeriksa detail struk</span>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setAdminProofZoom(z => Math.max(0.5, z - 0.25))}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="px-1 text-[10px] font-mono text-slate-300">{Math.round(adminProofZoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setAdminProofZoom(z => Math.min(3, z + 0.25))}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAdminProofZoom(1)}
                  className="px-1.5 py-0.5 text-[10px] rounded text-indigo-400 hover:underline font-semibold"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Image Viewport */}
            <div className="flex justify-center items-center p-3 bg-slate-900/60 rounded-xl max-h-[60vh] sm:max-h-[68vh] overflow-auto border border-slate-900">
              <img
                src={selectedProofImage}
                alt="Struk Transfer Full"
                style={{ transform: `scale(${adminProofZoom})`, transition: 'transform 0.15s ease' }}
                className="max-h-full max-w-full rounded-lg object-contain origin-center shadow-lg"
              />
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedProofImage(null);
                  setAdminProofZoom(1);
                }}
                className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
              >
                Tutup Tampilan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Tolak Pesanan Pembayaran?</h3>
                <p className="text-xs text-slate-400">Invoice: {rejectingOrder.id} ({rejectingOrder.userEmail})</p>
              </div>
            </div>

            <form onSubmit={handleRejectPayment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Alasan Penolakan (akan ditampilkan ke user):
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Bukti transfer tidak terbaca / nominal transfer tidak sesuai (kurang kode unik)."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingOrder(null)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700"
                >
                  Ya, Tolak Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Payment Record Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Hapus Data Riwayat Pesanan?</h3>
                <p className="text-xs text-slate-400">Invoice: {orderToDelete.id}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">User / Email:</span>
                <span className="font-semibold text-white">{orderToDelete.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Paket & Nominal:</span>
                <span className="font-semibold text-emerald-400">{orderToDelete.planName} (Rp {orderToDelete.totalAmount.toLocaleString()})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Saat Ini:</span>
                <span className={`font-bold ${orderToDelete.status === 'APPROVED' ? 'text-emerald-400' : orderToDelete.status === 'REJECTED' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {orderToDelete.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Data konfirmasi pembayaran dan struk transfer ini akan dihapus secara permanen dari server. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                disabled={isDeletingPayment}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePayment}
                disabled={isDeletingPayment}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition"
              >
                {isDeletingPayment ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PRICING & ROLE LIMITS CONFIGURATOR (NEW) */}
      {/* ========================================================================= */}
      {activeSubTab === 'pricing' && (
        <div className="space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-400" />
                <span>Manajemen Harga & Konfigurasi Batas Kuota Role</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Admin dapat mengatur harga role, batas request per menit (rate limit), batas kuota bulanan, dan fitur-fitur yang didapatkan user.
              </p>
            </div>

            <button
              onClick={() => setIsAddingNewPlan(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Paket Pricing Baru</span>
            </button>
          </div>

          {/* Add New Plan Form (Modal / Inline Card) */}
          {isAddingNewPlan && (
            <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/20 p-5 space-y-4 backdrop-blur">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>Tambah Paket Pricing & Kuota Kustom</span>
                </h3>
                <button
                  onClick={() => setIsAddingNewPlan(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewPlan} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Nama Paket</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Startup Scale Tier"
                    value={newPlanForm.name}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Harga (e.g. Rp 149.000 / $19)</label>
                  <input
                    type="text"
                    required
                    placeholder="Rp 149.000"
                    value={newPlanForm.price}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, price: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Rate Limit (Req / Menit)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPlanForm.rateLimit}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, rateLimit: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Maksimal Req / Bulan</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={newPlanForm.totalLimit}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, totalLimit: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Deskripsi Singkat</label>
                  <input
                    type="text"
                    placeholder="Deskripsi peruntukan paket"
                    value={newPlanForm.description}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Daftar Fitur Termasuk (1 fitur per baris)</label>
                  <textarea
                    rows={3}
                    value={newPlanForm.featuresText}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, featuresText: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-4 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewPlan(false)}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
                  >
                    Simpan Paket Baru
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Active Pricing Plans Cards Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {pricingPlans.map((plan) => {
              const isEditingThis = editingPlan?.id === plan.id;

              return (
                <div
                  key={plan.id}
                  className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg flex flex-col justify-between space-y-4"
                >
                  {isEditingThis ? (
                    <form onSubmit={handleSavePlan} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Nama Paket</label>
                        <input
                          type="text"
                          value={editingPlan.name}
                          onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Harga</label>
                          <input
                            type="text"
                            value={editingPlan.price}
                            onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Periode</label>
                          <input
                            type="text"
                            value={editingPlan.period}
                            onChange={(e) => setEditingPlan({ ...editingPlan, period: e.target.value })}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Rate Limit (req/m)</label>
                          <input
                            type="number"
                            value={editingPlan.rateLimit}
                            onChange={(e) => setEditingPlan({ ...editingPlan, rateLimit: Number(e.target.value) })}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Batas Kuota / Bln</label>
                          <input
                            type="number"
                            value={editingPlan.totalLimit}
                            onChange={(e) => setEditingPlan({ ...editingPlan, totalLimit: Number(e.target.value) })}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingPlan(null)}
                          className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          Simpan
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                            {plan.id === 'plan_enterprise' ? (
                              <Crown className="h-4 w-4 text-amber-400" />
                            ) : (
                              <Zap className="h-4 w-4 text-indigo-400" />
                            )}
                            <span>{plan.name}</span>
                          </h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingPlan(plan)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                              title="Edit Harga & Limit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {plan.id !== 'plan_free' && (
                              <button
                                onClick={() => handleDeletePlan(plan.id)}
                                className="rounded-lg p-1 text-rose-400 hover:bg-rose-950 hover:text-rose-200"
                                title="Hapus Paket"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 min-h-[32px]">{plan.description}</p>

                        <div className="border-y border-slate-800 py-3 space-y-1 font-mono">
                          <div className="text-2xl font-extrabold text-white">{plan.price} <span className="text-xs text-slate-400 font-sans">/ {plan.period}</span></div>
                          <div className="flex items-center gap-2 text-xs text-indigo-300">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{plan.rateLimit} req/min</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-emerald-400" />
                              <span>{plan.totalLimit.toLocaleString()} req/bln</span>
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-300">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fitur:</span>
                          <ul className="space-y-1">
                            {plan.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                <span className="text-slate-300">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800">
                        <button
                          onClick={() => setEditingPlan(plan)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                        >
                          Ubah Limit & Harga
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB: ENDPOINT TIER AUTHORIZATION (ADMIN ONLY) */}
      {/* ========================================================================= */}
      {activeSubTab === 'endpoint_tiers' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-slate-900 via-rose-950/10 to-slate-900 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Otorisasi Tier Endpoint API</h3>
                <p className="text-xs text-slate-400">
                  Konfigurasi hak akses minimal ke setiap endpoint sistem untuk 4 tier lisensi (Free, Basic, Pro, Enterprise).
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 leading-relaxed space-y-2">
              <span className="font-semibold text-rose-300 block mb-1">💡 Aturan Mekanisme Otorisasi:</span>
              <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                <li>Jika diset <strong className="text-emerald-400 font-mono">Free</strong>: Semua tier (Free, Basic, Pro, Enterprise) dapat memanggil endpoint ini.</li>
                <li>Jika diset <strong className="text-sky-400 font-mono">Basic</strong>: Pengguna tier <strong className="text-emerald-400">Free dikunci</strong>. Klien minimal tier Basic, Pro, atau Enterprise yang diizinkan.</li>
                <li>Jika diset <strong className="text-cyan-400 font-mono">Pro</strong>: Pengguna tier <strong className="text-emerald-400">Free & Basic dikunci</strong>. Hanya akun Pro & Enterprise yang diizinkan.</li>
                <li>Jika diset <strong className="text-amber-400 font-mono">Enterprise</strong>: Pengguna tier <strong className="text-emerald-400">Free, Basic & Pro dikunci</strong>. Hanya akun Enterprise yang dapat memanggil.</li>
                <li><strong className="text-purple-400">Super Admin</strong> selalu memiliki akses bypass tidak terbatas pada seluruh endpoint sistem untuk keperluan pengujian.</li>
              </ul>
            </div>
          </div>

          {/* Real-time Scope Simulator Impact Box (4 Tiers) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                tier: 'Free' as const,
                label: 'Free Tier Scope',
                color: 'border-emerald-500/20 bg-emerald-950/5 text-emerald-400',
                barColor: 'bg-emerald-500',
                count: countEndpointsForTier('Free'),
                desc: 'Klien starter gratis tanpa biaya.'
              },
              {
                tier: 'Basic' as const,
                label: 'Basic Tier Scope',
                color: 'border-sky-500/20 bg-sky-950/5 text-sky-400',
                barColor: 'bg-sky-500',
                count: countEndpointsForTier('Basic'),
                desc: 'Akses esensial berbayar (Rp 49rb/bln).'
              },
              {
                tier: 'Pro' as const,
                label: 'Pro Tier Scope',
                color: 'border-cyan-500/20 bg-cyan-950/5 text-cyan-400',
                barColor: 'bg-cyan-500',
                count: countEndpointsForTier('Pro'),
                desc: 'Akses scraper & fitur advanced.'
              },
              {
                tier: 'Enterprise' as const,
                label: 'Enterprise Tier Scope',
                color: 'border-amber-500/20 bg-amber-950/5 text-amber-400',
                barColor: 'bg-amber-500',
                count: countEndpointsForTier('Enterprise'),
                desc: 'Akses penuh tanpa batas seluruh infrastruktur.'
              }
            ].map((sim) => (
              <div key={sim.tier} className={`rounded-xl border p-4 flex flex-col justify-between space-y-2.5 ${sim.color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">{sim.label}</span>
                  <Crown className="h-4 w-4 opacity-75" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black">{sim.count}</span>
                  <span className="text-xs opacity-70">dari {ALL_MANAGEABLE_ENDPOINTS.length} endpoint aktif</span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${sim.barColor}`}
                    style={{ width: `${(sim.count / ALL_MANAGEABLE_ENDPOINTS.length) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] opacity-70 italic leading-snug">
                  {sim.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari endpoint berdasarkan path, nama, atau method..."
                value={endpointSearchQuery}
                onChange={(e) => setEndpointSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
              />
              {endpointSearchQuery && (
                <button
                  onClick={() => setEndpointSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
              {[
                { id: 'all', label: 'Semua', count: ALL_MANAGEABLE_ENDPOINTS.length },
                { id: 'ai', label: 'AI & ML', count: ALL_MANAGEABLE_ENDPOINTS.filter(e => e.category === 'ai').length },
                { id: 'tools', label: 'Tools', count: ALL_MANAGEABLE_ENDPOINTS.filter(e => e.category === 'tools').length },
                { id: 'data', label: 'Data', count: ALL_MANAGEABLE_ENDPOINTS.filter(e => e.category === 'data').length },
                { id: 'keys', label: 'Keys', count: ALL_MANAGEABLE_ENDPOINTS.filter(e => e.category === 'keys').length },
                { id: 'system', label: 'System', count: ALL_MANAGEABLE_ENDPOINTS.filter(e => e.category === 'system').length },
                { id: 'analytics', label: 'Analytics', count: ALL_MANAGEABLE_ENDPOINTS.filter(e => e.category === 'analytics').length }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setEndpointCategoryFilter(cat.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    endpointCategoryFilter === cat.id
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-900'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${
                    endpointCategoryFilter === cat.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Grouped Endpoints Manager */}
          {[
            { id: 'ai', title: 'AI & Machine Learning APIs', icon: <Sparkles className="h-4 w-4 text-purple-400" /> },
            { id: 'tools', title: 'Utilities, Scrapers & Developer APIs', icon: <Cpu className="h-4 w-4 text-rose-400" /> },
            { id: 'data', title: 'Data Sandbox & Mock CRUD Feed', icon: <Database className="h-4 w-4 text-emerald-400" /> },
            { id: 'keys', title: 'API Key Management & Security', icon: <Key className="h-4 w-4 text-amber-400" /> },
            { id: 'system', title: 'System Health & Documentation Specs', icon: <Activity className="h-4 w-4 text-blue-400" /> },
            { id: 'analytics', title: 'Administration, Ingress & Analytics', icon: <Sliders className="h-4 w-4 text-indigo-400" /> }
          ].map((group) => {
            const filtered = ALL_MANAGEABLE_ENDPOINTS.filter(e => {
              if (endpointCategoryFilter !== 'all' && e.category !== endpointCategoryFilter) return false;
              if (e.category !== group.id) return false;
              if (endpointSearchQuery.trim()) {
                const q = endpointSearchQuery.toLowerCase();
                return e.path.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q) || e.method.toLowerCase().includes(q);
              }
              return true;
            });

            if (filtered.length === 0) return null;

            return (
              <div key={group.id} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  {group.icon}
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">{group.title}</h4>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-bold">
                    {filtered.length} Endpoints
                  </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {filtered.map((ep) => {
                    const currentSelectedTier = localTiers[ep.path] || 'Free';

                    return (
                      <div
                        key={ep.path}
                        className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex flex-col justify-between gap-4 hover:border-slate-700/80 transition group"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-black font-mono ${
                                  ep.method === 'GET'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                    : ep.method === 'POST'
                                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                                    : ep.method === 'PUT'
                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {ep.method}
                              </span>
                              <code className="text-xs font-mono font-bold text-slate-200 group-hover:text-rose-300 transition">
                                {ep.path}
                              </code>
                            </div>
                          </div>

                          <h5 className="text-xs font-bold text-slate-300">{ep.name}</h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{ep.desc}</p>
                        </div>

                        {/* Tier Selector Pills (4 Tiers) */}
                        <div className="pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Akses Tier Minimal:</span>
                          <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                            {(['Free', 'Basic', 'Pro', 'Enterprise'] as const).map((t) => {
                              const isActive = currentSelectedTier === t;
                              return (
                                <button
                                  key={t}
                                  onClick={() => {
                                    setLocalTiers((prev) => ({
                                      ...prev,
                                      [ep.path]: t
                                    }));
                                  }}
                                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-all duration-200 ${
                                    isActive
                                      ? t === 'Free'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                                        : t === 'Basic'
                                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-extrabold shadow-[0_0_8px_rgba(14,165,233,0.15)]'
                                        : t === 'Pro'
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-extrabold shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/60'
                                  }`}
                                >
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Action Footer Button */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <div className="text-xs text-slate-400">
              * Perubahan otorisasi tier akan langsung aktif di gerbang firewall sistem API secara real-time.
            </div>
            <button
              onClick={handleSaveEndpointTiers}
              disabled={isSavingTiers}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-500 active:scale-95 transition disabled:opacity-50"
            >
              {isSavingTiers ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Menyimpan Otorisasi...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Otorisasi Endpoint</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: CUSTOM API KEY GENERATOR (ADMIN ONLY) */}
      {/* ========================================================================= */}
      {activeSubTab === 'custom_keys' && (
        <div className="space-y-6">
          
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Master Custom API Key Generator (Super Admin)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Admin dapat mengetikkan token string API Key kustom secara bebas, mengatur rate limit per menit, kuota bulanan, dan menugaskan kunci ke email klien manapun.
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerateCustomKey} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300">Custom API Key Token String</label>
                  <button
                    type="button"
                    onClick={handleAutoFillCustomKeyRandom}
                    className="text-[10px] font-semibold text-amber-400 hover:underline"
                  >
                    Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: api_vip_client_production"
                  value={customKeyForm.customKey}
                  onChange={(e) => setCustomKeyForm({ ...customKeyForm, customKey: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-xs text-amber-300 outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Nama Label Key / Klien</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Production VIP Client"
                  value={customKeyForm.name}
                  onChange={(e) => setCustomKeyForm({ ...customKeyForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Owner Email</label>
                <input
                  type="email"
                  required
                  placeholder="developer@company.io"
                  value={customKeyForm.ownerEmail}
                  onChange={(e) => setCustomKeyForm({ ...customKeyForm, ownerEmail: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Tier Role</label>
                <select
                  value={customKeyForm.tier}
                  onChange={(e) => {
                    const t = e.target.value as any;
                    const r = t === 'Enterprise' ? 1000 : t === 'Developer' ? 600 : t === 'Pro' ? 300 : 60;
                    const q = t === 'Enterprise' ? 100000 : t === 'Developer' ? 50000 : t === 'Pro' ? 25000 : 5000;
                    setCustomKeyForm({ ...customKeyForm, tier: t, rateLimit: r, totalLimit: q });
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-indigo-300 outline-none focus:border-amber-500"
                >
                  <option value="Free">Free (Default 60/min)</option>
                  <option value="Pro">Pro (Default 300/min)</option>
                  <option value="Developer">Developer (Default 600/min)</option>
                  <option value="Enterprise">Enterprise VIP (Default 1000/min)</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300">Rate Limit (Req / Menit)</label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customKeyForm.isUnlimitedRate}
                      onChange={(e) => setCustomKeyForm({ ...customKeyForm, isUnlimitedRate: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                    />
                    <span className="text-[10px] font-bold text-amber-400">⚡ Unlimited (∞)</span>
                  </label>
                </div>
                {customKeyForm.isUnlimitedRate ? (
                  <div className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300">
                    ∞ Tanpa Batas (Unlimited Rate)
                  </div>
                ) : (
                  <input
                    type="number"
                    min="1"
                    required
                    value={customKeyForm.rateLimit}
                    onChange={(e) => setCustomKeyForm({ ...customKeyForm, rateLimit: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-amber-500"
                  />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300">Kuota Bulanan (Req / Bulan)</label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customKeyForm.isUnlimitedQuota}
                      onChange={(e) => setCustomKeyForm({ ...customKeyForm, isUnlimitedQuota: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                    />
                    <span className="text-[10px] font-bold text-amber-400">⚡ Unlimited (∞)</span>
                  </label>
                </div>
                {customKeyForm.isUnlimitedQuota ? (
                  <div className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300">
                    ∞ Tanpa Batas Kuota (Unlimited Quota)
                  </div>
                ) : (
                  <input
                    type="number"
                    min="100"
                    required
                    value={customKeyForm.totalLimit}
                    onChange={(e) => setCustomKeyForm({ ...customKeyForm, totalLimit: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-amber-500"
                  />
                )}
              </div>

              <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Preset Cepat:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomKeyForm({
                        ...customKeyForm,
                        tier: 'Enterprise',
                        isUnlimitedRate: true,
                        isUnlimitedQuota: true,
                        name: 'God Mode / Unlimited VIP Key'
                      });
                    }}
                    className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-500/20"
                  >
                    👑 VIP Full Unlimited (∞ / ∞)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomKeyForm({
                        ...customKeyForm,
                        tier: 'Pro',
                        isUnlimitedRate: false,
                        isUnlimitedQuota: false,
                        rateLimit: 500,
                        totalLimit: 50000,
                        name: 'Pro Custom 50k'
                      });
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] text-slate-300 hover:text-white"
                  >
                    Pro Standard (500/m • 50k)
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingCustomKey}
                  className="flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-700 disabled:opacity-50 transition"
                >
                  <Key className="h-4 w-4" />
                  <span>{isCreatingCustomKey ? 'Menyimpan ke DB...' : 'Buat & Aktifkan Custom API Key'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Keys List Reference */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Daftar API Key yang Sudah Aktif di Database</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className="p-3">Key String</th>
                    <th className="p-3">Label & Owner</th>
                    <th className="p-3">Tier</th>
                    <th className="p-3">Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {apiKeys.map((k) => (
                    <tr key={k.key}>
                      <td className="p-3 text-amber-300 font-bold">{k.key}</td>
                      <td className="p-3">
                        <div className="text-white font-sans font-semibold">{k.name}</div>
                        <div className="text-slate-500 text-[11px]">{k.ownerEmail}</div>
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                          {k.tier}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">
                        {k.rateLimit === -1 ? '∞ Unlimited' : `${k.rateLimit} req/m`} • {k.totalLimit === -1 ? '∞ Unlimited' : `${k.totalLimit.toLocaleString()} req/bln`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: USERS LIST & TIER ALLOCATOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                <span>Manajemen Akun User & Alokasi Tier</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Admin dapat melihat akun terdaftar dan mengubah status tier user (Free / Pro / Enterprise) secara instan.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role Sistem</th>
                  <th className="p-3.5">Tier Saat Ini</th>
                  <th className="p-3.5">Perusahaan</th>
                  <th className="p-3.5 text-right">Ubah Tier (Admin Override)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full border border-slate-700 object-cover" />
                        <div>
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="font-mono text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          u.tier === 'Enterprise'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : u.tier === 'Pro'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {u.tier || 'Free'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {u.company || '-'}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleUpdateUserTier(u.email, 'Free')}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                          u.tier === 'Free' ? 'bg-slate-800 text-white border-slate-600' : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        Free
                      </button>
                      <button
                        onClick={() => handleUpdateUserTier(u.email, 'Pro')}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                          u.tier === 'Pro' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40 hover:bg-indigo-900/40'
                        }`}
                      >
                        Pro
                      </button>
                      <button
                        onClick={() => handleUpdateUserTier(u.email, 'Developer')}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                          u.tier === 'Developer' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40 hover:bg-cyan-900/40'
                        }`}
                      >
                        Developer
                      </button>
                      <button
                        onClick={() => handleUpdateUserTier(u.email, 'Enterprise')}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                          u.tier === 'Enterprise' ? 'bg-amber-600 text-white border-amber-500' : 'bg-amber-950/40 text-amber-300 border-amber-800/40 hover:bg-amber-900/40'
                        }`}
                      >
                        Enterprise VIP
                      </button>
                      <button
                        onClick={() => handleExpireUserSubscription(u.email)}
                        title="Simulasikan Masa Aktif Expired Sekarang"
                        className="rounded-lg px-2.5 py-1 text-[11px] font-bold border bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900/60 transition"
                      >
                        ⏰ Expire Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: SYSTEM BROADCAST ANNOUNCEMENT BANNER */}
      {/* ========================================================================= */}
      {activeSubTab === 'announcement' && (
        <div className="space-y-6">
          
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Siaran Pengumuman Global (Broadcast Announcement)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Pesan broadcast ini akan muncul secara realtime di bagian atas dashboard seluruh pengguna developer.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enableAnnouncement"
                  checked={announcement.enabled}
                  onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="enableAnnouncement" className="text-xs font-bold text-white cursor-pointer">
                  Aktifkan Banner Pengumuman di Dashboard User
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Tipe Pesan</label>
                <div className="flex gap-3 text-xs">
                  {(['info', 'warning', 'success'] as const).map((t) => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="radio"
                        name="announcementType"
                        checked={announcement.type === t}
                        onChange={() => setAnnouncement({ ...announcement, type: t })}
                        className="text-indigo-600"
                      />
                      <span className="capitalize">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Isi Pesan Pengumuman</label>
                <textarea
                  rows={3}
                  required
                  value={announcement.message}
                  onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                  placeholder="Tulis pesan pengumuman untuk seluruh developer..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Preview Banner */}
              <div className="space-y-1 pt-2">
                <span className="text-[11px] font-bold text-slate-400">Preview Live Tampilan di User:</span>
                <div
                  className={`rounded-xl border p-3 text-xs flex items-center gap-2.5 ${
                    announcement.type === 'warning'
                      ? 'border-amber-500/40 bg-amber-950/30 text-amber-200'
                      : announcement.type === 'success'
                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                      : 'border-indigo-500/40 bg-indigo-950/30 text-indigo-200'
                  }`}
                >
                  <Megaphone className="h-4 w-4 shrink-0" />
                  <span>{announcement.message || 'Contoh pesan broadcast...'}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingAnnouncement}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSavingAnnouncement ? 'Menyimpan...' : 'Simpan & Publikasikan Broadcast'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB TAB 6: TELEGRAM BOT LOGGER & REALTIME ALERTS          */}
      {/* ========================================================= */}
      {activeSubTab === 'telegram' && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-slate-950 via-sky-950/20 to-slate-950 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-300">
                      Telegram Bot Logger & Security Dispatcher
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${telegram.enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                      {telegram.enabled ? '● AKTIF' : '○ NONAKTIF'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {lang === 'id' ? 'Integrasi Log & Notifikasi Bot Telegram' : 'Telegram Bot Logger Integration'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'id'
                      ? 'Dapatkan laporan insiden error 5xx/4xx, aktivitas API Key, dan pengaktifan Maintenance Mode secara otomatis ke grup/channel Telegram dengan format HTML blockquote yang rapi.'
                      : 'Stream errors, maintenance mode toggles, and API security alerts directly to your Telegram chat with rich HTML blockquote formatting.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchTelegram}
                  disabled={loadingTelegram}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-sky-400 ${loadingTelegram ? 'animate-spin' : ''}`} />
                  <span>{lang === 'id' ? 'Reload Konfigurasi' : 'Reload Config'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup & Restore Dedicated Management Card */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/20 to-slate-950 p-6 shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Backup Proyek & Pemulihan Sistem (Restore)</span>
                    <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-500/30">
                      ZIP Archive + JSON State
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mengekspor seluruh file proyek (Source Code) + Snapshot Database ke file ZIP (mengabaikan <code>node_modules</code>, <code>dist</code>, <code>.git</code>).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Manual Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 hover:border-slate-600 transition shadow-sm"
                >
                  <Download className="h-4 w-4 text-emerald-400" />
                  <span>Unduh Backup Proyek (.ZIP)</span>
                </button>

                {/* Send to Telegram Button */}
                <button
                  type="button"
                  onClick={handleSendBackupToTelegram}
                  disabled={isSendingTelegramBackup || !telegram.botToken || !telegram.chatId}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-md shadow-indigo-600/20"
                >
                  <Send className={`h-4 w-4 ${isSendingTelegramBackup ? 'animate-bounce' : ''}`} />
                  <span>{isSendingTelegramBackup ? 'Mengirim ke Tele...' : 'Kirim Backup ZIP ke Telegram'}</span>
                </button>

                {/* Restore / Import File Button */}
                <label className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 cursor-pointer transition shadow-sm">
                  <Upload className={`h-4 w-4 ${isRestoringBackup ? 'animate-spin' : ''}`} />
                  <span>{isRestoringBackup ? 'Memproses Restore...' : 'Restore Data (JSON / ZIP)'}</span>
                  <input
                    type="file"
                    accept=".json,.zip,application/json,application/zip"
                    onChange={handleRestoreBackupFromFile}
                    disabled={isRestoringBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Restore Result Notification Banner */}
            {restoreStatus && (
              <div className={`rounded-xl border p-4 text-xs space-y-2 ${
                restoreStatus.success
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                  : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {restoreStatus.success ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 text-rose-400" />}
                    <span>{restoreStatus.message}</span>
                  </div>
                  <button onClick={() => setRestoreStatus(null)} className="text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {restoreStatus.restored && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-emerald-500/20 font-mono text-[11px]">
                    <div><b>Users:</b> {restoreStatus.restored.users}</div>
                    <div><b>API Keys:</b> {restoreStatus.restored.apiKeys}</div>
                    <div><b>Mock Routes:</b> {restoreStatus.restored.mockRoutes}</div>
                    <div><b>Paket Pricing:</b> {restoreStatus.restored.pricingPlans}</div>
                    <div><b>Pembayaran:</b> {restoreStatus.restored.paymentRequests}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Test Status Banner if present */}
          {telegramTestStatus && (
            <div className={`rounded-2xl border p-4 text-xs flex items-center justify-between gap-3 ${
              telegramTestStatus.success
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
            }`}>
              <div className="flex items-center gap-2.5">
                {telegramTestStatus.success ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold">
                    {telegramTestStatus.success ? 'Koneksi Telegram Sukses!' : 'Pengujian Gagal:'}
                  </span>
                  <p className="text-slate-300 text-[11px] mt-0.5">{telegramTestStatus.message}</p>
                </div>
              </div>
              <button
                onClick={() => setTelegramTestStatus(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Columns: Credentials & Toggles Form */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSaveTelegram} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-sky-400" />
                    <span>Pengaturan Kredensial Telegram Bot</span>
                  </h3>
                  
                  {/* Master Switch Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-slate-300">
                      {telegram.enabled ? 'Bot Aktif' : 'Bot Nonaktif'}
                    </span>
                    <input
                      type="checkbox"
                      checked={telegram.enabled}
                      onChange={(e) => setTelegram({ ...telegram, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500 relative"></div>
                  </label>
                </div>

                {/* Bot Token Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Bot API Token (dari @BotFather) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showBotToken ? 'text' : 'password'}
                      value={telegram.botToken}
                      onChange={(e) => setTelegram({ ...telegram, botToken: e.target.value })}
                      placeholder="Contoh: 1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 pr-10 font-mono text-xs text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBotToken(!showBotToken)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showBotToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Dapatkan token rahasia dengan mengirim perintah <code className="text-sky-400 font-mono">/newbot</code> ke akun Telegram resmi <a href="https://t.me/botfather" target="_blank" rel="noreferrer" className="text-sky-400 underline">@BotFather</a>.
                  </p>
                </div>

                {/* Chat ID / User ID Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Target Chat ID / User ID / Group ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={telegram.chatId}
                    onChange={(e) => setTelegram({ ...telegram, chatId: e.target.value })}
                    placeholder="Contoh: 123456789 (User) atau -1001234567890 (Grup/Channel)"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Ketahui User ID Anda via bot <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-sky-400 underline">@userinfobot</a> atau <a href="https://t.me/GetIDsBot" target="_blank" rel="noreferrer" className="text-sky-400 underline">@GetIDsBot</a>. Jika mengirim ke grup, jadikan bot sebagai admin grup.
                  </p>
                </div>

                {/* Event Dispatch Filters */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <label className="block text-xs font-bold text-slate-200">
                    Pilih Kategori Log Yang Dikirim ke Telegram:
                  </label>

                  <div className="space-y-2.5">
                    {/* Error & Incidents */}
                    <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 hover:border-slate-700 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={telegram.sendOnErrors}
                        onChange={(e) => setTelegram({ ...telegram, sendOnErrors: e.target.checked })}
                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="text-rose-400">🚨</span> Error & Insiden API (500, 503, 400+)
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Kirim notifikasi instan saat terjadi crash endpoint, 503 Maintenance block, 429 Rate limit, atau 401 Unauthorized.
                        </p>
                      </div>
                    </label>

                    {/* Security & Maintenance alerts */}
                    <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 hover:border-slate-700 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={telegram.sendOnSecurityAlerts}
                        onChange={(e) => setTelegram({ ...telegram, sendOnSecurityAlerts: e.target.checked })}
                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="text-amber-400">🛡️</span> Peringatan Keamanan & Maintenance Lockdown
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Kirim alert saat Administrator menyalakan/mematikan Mode Pemeliharaan (Maintenance) atau memblokir IP.
                        </p>
                      </div>
                    </label>

                    {/* API Key lifecycle */}
                    <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 hover:border-slate-700 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={telegram.sendOnKeyActivity}
                        onChange={(e) => setTelegram({ ...telegram, sendOnKeyActivity: e.target.checked })}
                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="text-indigo-400">🔑</span> Aktivitas Manajemen Kunci API
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Kirim log saat user baru membuat API Key, merotasi secret key, atau mencabut kunci.
                        </p>
                      </div>
                    </label>

                    {/* Stream all traffic (optional) */}
                    <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 hover:border-slate-700 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={telegram.sendOnAllRequests}
                        onChange={(e) => setTelegram({ ...telegram, sendOnAllRequests: e.target.checked })}
                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="text-emerald-400">⚡</span> Stream Semua Request (Traffic Feed)
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Kirim setiap request yang berhasil (200 OK) ke Telegram (rekomendasi: matikan bila traffic tinggi).
                        </p>
                      </div>
                    </label>

                    {/* Auto Backup Configuration Toggle */}
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3.5 space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!telegram.autoBackupEnabled}
                          onChange={(e) => setTelegram({ ...telegram, autoBackupEnabled: e.target.checked })}
                          className="mt-0.5 rounded border-indigo-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="text-indigo-400">🗂️</span> Otomatiskan Backup Proyek (.ZIP) ke Telegram
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Sistem akan secara berkala mengemas seluruh file proyek (Source Code) & snapshot database ke file ZIP (tanpa folder berat seperti node_modules & dist) dan mengirimkannya langsung ke Telegram bot Anda.
                          </p>
                        </div>
                      </label>

                      {telegram.autoBackupEnabled && (
                        <div className="pt-2 border-t border-indigo-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-indigo-200 mb-1">
                              Frekuensi Auto Backup:
                            </label>
                            <select
                              value={telegram.autoBackupIntervalHours || 24}
                              onChange={(e) => setTelegram({ ...telegram, autoBackupIntervalHours: Number(e.target.value) })}
                              className="w-full rounded-lg border border-indigo-500/40 bg-slate-950 px-2.5 py-1.5 text-xs text-indigo-300 font-semibold outline-none focus:border-indigo-400"
                            >
                              <option value={1}>Setiap 1 Jam</option>
                              <option value={6}>Setiap 6 Jam</option>
                              <option value={12}>Setiap 12 Jam</option>
                              <option value={24}>Setiap 24 Jam (Harian)</option>
                              <option value={48}>Setiap 48 Jam (2 Hari)</option>
                            </select>
                          </div>

                          <div className="flex flex-col justify-end text-[11px] text-slate-400">
                            <span>Status Auto Backup Terakhir:</span>
                            <span className="font-mono text-indigo-300 font-semibold mt-0.5">
                              {telegram.lastAutoBackupAt
                                ? new Date(telegram.lastAutoBackupAt).toLocaleString('id-ID')
                                : 'Belum pernah berjalan (Pending)'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit & Test Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={isTestingTelegram || !telegram.botToken.trim() || !telegram.chatId.trim()}
                    className="flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-2.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 disabled:opacity-50 transition"
                  >
                    <Send className={`h-4 w-4 ${isTestingTelegram ? 'animate-bounce' : ''}`} />
                    <span>{isTestingTelegram ? 'Mengirim Test...' : 'Kirim Pesan Uji (Test Connection)'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingTelegram}
                    className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-500 disabled:opacity-50 transition"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSavingTelegram ? 'Menyimpan...' : 'Simpan Konfigurasi Telegram'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right 5 Columns: Telegram Blockquote Visual Mockup & Instructions */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Telegram UI Mockup Card */}
              <div className="rounded-2xl border border-sky-900/60 bg-[#17212b] p-4 shadow-xl text-white font-sans space-y-3">
                
                {/* Telegram App Header Bar */}
                <div className="flex items-center gap-3 border-b border-[#242f3d] pb-3">
                  <div className="h-9 w-9 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white text-sm shadow">
                    🤖
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>API Studio Alert Bot</span>
                      <span className="rounded bg-sky-400/20 text-sky-300 text-[9px] px-1 py-0.2 font-mono">bot</span>
                    </div>
                    <p className="text-[10px] text-sky-400/80">bot live status: online</p>
                  </div>
                </div>

                {/* Message Bubble 1: Security Alert */}
                <div className="rounded-xl bg-[#242f3d] p-3 text-xs space-y-2 border border-slate-700/50">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>[API STUDIO] MAINTENANCE LOCKDOWN</span>
                  </div>

                  {/* HTML Blockquote preview */}
                  <div className="border-l-4 border-amber-400 bg-[#1b2532] pl-3 py-1.5 rounded-r-lg space-y-1 text-[11px] font-mono text-slate-300">
                    <div><b>Status:</b> 🔒 MAINTENANCE MODE ACTIVE</div>
                    <div><b>Actor:</b> admin@apistudio.dev (Super Admin)</div>
                    <div><b>HTTP Response Code:</b> 503 Service Unavailable</div>
                    <div><b>Bypass Allowed:</b> ✅ Admin Role Only</div>
                    <div><b>Timestamp:</b> 2026-09-01 14:30:00 UTC</div>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    ⚠️ <i>Semua request publik & free/pro tier dihentikan sementara untuk peningkatan infrastruktur.</i>
                  </p>

                  <div className="text-right text-[9px] text-slate-500 font-mono">14:30 ✓✓</div>
                </div>

                {/* Message Bubble 2: API Error Incident */}
                <div className="rounded-xl bg-[#242f3d] p-3 text-xs space-y-2 border border-slate-700/50">
                  <div className="font-bold text-rose-400 flex items-center gap-1.5">
                    <span>🚨</span>
                    <span>[API INCIDENT] HTTP 500 / 503 ERROR</span>
                  </div>

                  {/* HTML Blockquote preview */}
                  <div className="border-l-4 border-rose-500 bg-[#1b2532] pl-3 py-1.5 rounded-r-lg space-y-1 text-[11px] font-mono text-slate-300">
                    <div><b>Method & Path:</b> POST /api/v1/ai/generate</div>
                    <div><b>Client IP:</b> 203.0.113.88</div>
                    <div><b>User Role:</b> Free (api_free_dev_9821)</div>
                    <div><b>Error Reason:</b> Maintenance Mode is Active</div>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    ⚡ <i>Request diblokir secara otomatis oleh security interceptor.</i>
                  </p>

                  <div className="text-right text-[9px] text-slate-500 font-mono">14:32 ✓✓</div>
                </div>

              </div>

              {/* Step-by-step Setup Guide */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Panduan Cepat Setup Bot Telegram:</span>
                </h4>

                <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside leading-relaxed font-medium">
                  <li>
                    Buka Telegram dan cari akun <span className="text-sky-700 dark:text-sky-300 font-mono font-bold bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">@BotFather</span>, lalu kirim perintah <span className="text-sky-700 dark:text-sky-300 font-mono font-bold bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">/newbot</span>.
                  </li>
                  <li>
                    Beri nama bot Anda (misal: <i>My API Alert Bot</i>) dan username (misal: <i>my_api_alert_bot</i>).
                  </li>
                  <li>
                    Salin <b>HTTP API Token</b> yang diberikan BotFather ke kolom <b>Bot API Token</b> di samping.
                  </li>
                  <li>
                    Cari akun <span className="text-sky-700 dark:text-sky-300 font-mono font-bold bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">@userinfobot</span> di Telegram, lalu klik <b>Start</b> untuk melihat <b>Id</b> akun Anda.
                  </li>
                  <li>
                    <b>PENTING:</b> Buka bot baru Anda di Telegram dan klik tombol <b>Start</b> (atau kirim pesan <span className="text-sky-700 dark:text-sky-300 font-mono font-bold bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">/start</span>) agar bot memiliki izin mengirim pesan ke Anda!
                  </li>
                  <li>
                    Klik <b>Kirim Pesan Uji</b> untuk memvalidasi token dan format blockquote.
                  </li>
                </ol>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Branding & Contact Settings Sub Tab */}
      {activeSubTab === 'branding_contact' && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-slate-950 via-green-950/20 to-slate-950 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/20 text-green-400 border border-green-500/30 shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-green-500/40 bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-300">
                      Kontak Owner & Branding Platform
                    </span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                      Sinkronisasi Realtime
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    Pengaturan Nomor WhatsApp & Akun Support Owner
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Atur nomor WhatsApp dan akun Telegram owner/CS untuk menerima chat konsultasi upgrade paket atau bukti bayar pengguna.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setIsSavingSite(true);
                    try {
                      const res = await fetch('/api/admin/site-settings', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'x-user-role': 'admin'
                        },
                        body: JSON.stringify(siteForm)
                      });
                      const data = await res.json();
                      if (data && data.success) {
                        setFeedback('Pengaturan kontak WhatsApp, Telegram, dan branding web berhasil disimpan!');
                        onUpdateSiteSettings?.(siteForm);
                        onRefreshAll();
                      } else {
                        setFeedback(data.error || 'Gagal menyimpan pengaturan.');
                      }
                    } catch (e: any) {
                      setFeedback('Error: ' + e.message);
                    } finally {
                      setIsSavingSite(false);
                      setTimeout(() => setFeedback(null), 4000);
                    }
                  }}
                  disabled={isSavingSite}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-green-600/20 hover:bg-green-500 transition disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSavingSite ? 'Menyimpan...' : 'Simpan Semua Kontak & Web'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Feedback banner if saved */}
          {feedback && (
            <div className="flex items-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 p-3 text-xs text-green-300 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Grid of Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: WhatsApp & Telegram Direct Settings */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* WhatsApp Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-500/20 text-green-400 border border-green-500/30">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Nomor WhatsApp Owner / CS</h3>
                      <p className="text-[11px] text-slate-400">Akan digunakan untuk link chat tombol "Hubungi Owner" dan konsultasi upgrade.</p>
                    </div>
                  </div>
                  {siteForm.supportWhatsapp && (
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400 border border-green-500/30">
                      Terisi
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Nomor WhatsApp (Kode Negara)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">+</span>
                    <input
                      type="text"
                      value={siteForm.supportWhatsapp || ''}
                      onChange={(e) => setSiteForm(prev => ({ ...prev, supportWhatsapp: e.target.value.replace(/[^0-9]/g, '') }))}
                      placeholder="6281234567890"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-7 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Gunakan format internasional tanpa tanda +, contoh: <code className="text-green-300 font-mono">6281234567890</code> (62 untuk Indonesia).
                  </p>
                </div>

                {/* WhatsApp Test Button */}
                {siteForm.supportWhatsapp ? (
                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={`https://wa.me/${siteForm.supportWhatsapp}?text=${encodeURIComponent('Halo Admin, saya pengguna REST API Studio ingin bertanya mengenai platform API...')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 px-3.5 py-2 text-xs font-bold text-green-300 hover:bg-green-500/20 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-green-400" />
                      <span>Tes Buka Chat WhatsApp (+{siteForm.supportWhatsapp})</span>
                    </a>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                    ⚠️ Belum ada nomor WhatsApp yang dikonfigurasi. Masukkan nomor di atas lalu klik simpan!
                  </div>
                )}
              </div>

              {/* Telegram Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      <Send className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Akun Telegram Owner / Support</h3>
                      <p className="text-[11px] text-slate-400">Username Telegram untuk konsultasi cepat via direct message.</p>
                    </div>
                  </div>
                  {siteForm.supportTelegram && (
                    <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/30">
                      Terisi
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Username Telegram (Tanpa @)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">@</span>
                    <input
                      type="text"
                      value={siteForm.supportTelegram || ''}
                      onChange={(e) => setSiteForm(prev => ({ ...prev, supportTelegram: e.target.value.replace(/[@]/g, '') }))}
                      placeholder="apistudio_owner"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-8 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Masukkan username akun Telegram owner/CS tanpa tanda @, contoh: <code className="text-sky-300 font-mono">apistudio_owner</code>.
                  </p>
                </div>

                {/* Telegram Test Button */}
                {siteForm.supportTelegram ? (
                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={`https://t.me/${siteForm.supportTelegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-sky-500/10 border border-sky-500/30 px-3.5 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
                      <span>Tes Buka Chat Telegram (@{siteForm.supportTelegram})</span>
                    </a>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
                    Belum ada username Telegram yang disimpan.
                  </div>
                )}
              </div>

            </div>

            {/* Right Col: Web Branding & Display Info */}
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Identitas & Branding Web</h3>
                      <p className="text-[11px] text-slate-400">Judul, slogan, deskripsi, dan ikon favicon platform.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Nama / Judul Platform
                    </label>
                    <input
                      type="text"
                      value={siteForm.title}
                      onChange={(e) => setSiteForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="REST API Studio"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Tagline */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Slogan / Tagline Website
                    </label>
                    <input
                      type="text"
                      value={siteForm.tagline}
                      onChange={(e) => setSiteForm(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="Developer Infrastructure & Interactive API Hub"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Deskripsi Platform
                    </label>
                    <textarea
                      rows={3}
                      value={siteForm.description}
                      onChange={(e) => setSiteForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Platform REST API interaktif..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Favicon Emoticon Options */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Ikon Favicon Cepat
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['⚡', '🚀', '👑', '🔥', '💻', '🌐', '🛠️', '🎯', '✨'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSiteForm(prev => ({ ...prev, faviconUrl: emoji }))}
                          className={`h-9 w-9 rounded-xl text-lg flex items-center justify-center border transition ${
                            siteForm.faviconUrl === emoji
                              ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save button in column */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsSavingSite(true);
                        try {
                          const res = await fetch('/api/admin/site-settings', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'x-user-role': 'admin'
                            },
                            body: JSON.stringify(siteForm)
                          });
                          const data = await res.json();
                          if (data && data.success) {
                            setFeedback('Pengaturan kontak WhatsApp, Telegram, dan branding web berhasil disimpan!');
                            onUpdateSiteSettings?.(siteForm);
                            onRefreshAll();
                          } else {
                            setFeedback(data.error || 'Gagal menyimpan pengaturan.');
                          }
                        } catch (e: any) {
                          setFeedback('Error: ' + e.message);
                        } finally {
                          setIsSavingSite(false);
                          setTimeout(() => setFeedback(null), 4000);
                        }
                      }}
                      disabled={isSavingSite}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-xs font-bold text-white shadow-md hover:bg-green-500 transition disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isSavingSite ? 'Menyimpan...' : 'Simpan Semua Kontak & Web'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Background Settings Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                      <Film className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pengaturan Video Background & Hero Banner</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Atur video latar belakang animasi / promo video untuk dashboard.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteForm.enableHeroVideo ?? true}
                        onChange={(e) => setSiteForm(prev => ({ ...prev, enableHeroVideo: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                      {siteForm.enableHeroVideo ?? true ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      URL Video Background / Hero (Direct MP4, WebM, atau YouTube Link)
                    </label>
                    <input
                      type="text"
                      value={siteForm.heroVideoUrl || ''}
                      onChange={(e) => setSiteForm(prev => ({ ...prev, heroVideoUrl: e.target.value }))}
                      placeholder="https://assets.mixkit.co/videos/preview/mixkit-code-animation-on-a-computer-screen-1241-large.mp4"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Video Presets */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Preset Video Background Cepat
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: '💻 Cyber Code', url: 'https://assets.mixkit.co/videos/preview/mixkit-code-animation-on-a-computer-screen-1241-large.mp4' },
                        { name: '🌐 Digital Network', url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-screens-41551-large.mp4' },
                        { name: '✨ Glowing Lines', url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-digital-lines-background-41481-large.mp4' },
                        { name: '⚡ Particle Tech', url: 'https://assets.mixkit.co/videos/preview/mixkit-glowing-lines-and-dots-in-a-dark-background-41552-large.mp4' }
                      ].map(p => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => setSiteForm(prev => ({ ...prev, heroVideoUrl: p.url, enableHeroVideo: true }))}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-left truncate ${
                            siteForm.heroVideoUrl === p.url
                              ? 'bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-300'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-500/50'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Video Preview Box */}
                  {siteForm.heroVideoUrl && (siteForm.enableHeroVideo ?? true) && (
                    <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden relative group shadow-sm">
                      <div className="p-2 bg-slate-900 text-slate-400 text-[10px] font-bold font-mono border-b border-slate-800 flex justify-between items-center">
                        <span>LIVE PREVIEW VIDEO BACKGROUND</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Playing
                        </span>
                      </div>
                      <div className="h-36 w-full relative overflow-hidden flex items-center justify-center bg-black">
                        {siteForm.heroVideoUrl.includes('youtube') || siteForm.heroVideoUrl.includes('youtu.be') ? (
                          <iframe
                            src={siteForm.heroVideoUrl.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&muted=1&loop=1'}
                            className="w-full h-full border-0 pointer-events-none"
                            title="Preview Video"
                          />
                        ) : (
                          <video
                            src={siteForm.heroVideoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-80"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Revocation Confirmation Modal */}
      {keyToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cabut API Key Paksa?</h3>
                <p className="text-xs text-slate-400">Admin akan menghapus kunci ini secara permanen.</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs space-y-1 font-mono">
              <div className="text-white font-bold">{keyToRevoke.name}</div>
              <div className="text-slate-500 text-[11px] break-all">{keyToRevoke.key}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setKeyToRevoke(null)}
                disabled={isRevokingKey}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmAdminRevoke}
                disabled={isRevokingKey}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition"
              >
                {isRevokingKey ? 'Mencabut...' : 'Ya, Cabut Kunci'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
