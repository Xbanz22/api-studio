import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  Megaphone,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  X,
  MessageSquare,
  Phone,
  Send,
  RotateCcw,
  Copy,
  Check,
  Bot,
  User as UserIcon,
  HelpCircle,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ApiKeyItem, ApiLogItem, UserProfile, SystemAnnouncement } from '../types';
import { PricingModal } from './PricingModal';
import { FreeTierDashboard } from './dashboards/FreeTierDashboard';
import { ProTierDashboard } from './dashboards/ProTierDashboard';
import { EnterpriseTierDashboard } from './dashboards/EnterpriseTierDashboard';

interface UserDashboardProps {
  user: UserProfile;
  apiKeys: ApiKeyItem[];
  logs: ApiLogItem[];
  selectedApiKey: string;
  onSelectApiKey: (key: string) => void;
  onRefreshKeys: () => void;
  onNavigateTab: (tab: 'dashboard' | 'admin' | 'explorer' | 'keys' | 'mock' | 'webhooks' | 'speedtest' | 'analytics' | 'docs') => void;
  onUserTierUpdated?: (newTier: 'Free' | 'Pro' | 'Enterprise') => void;
  onOpenBotPluginModal?: () => void;
  lang: 'id' | 'en';
  siteSettings?: any;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  apiKeys,
  logs,
  selectedApiKey,
  onSelectApiKey,
  onRefreshKeys,
  onNavigateTab,
  onUserTierUpdated,
  onOpenBotPluginModal,
  lang,
  siteSettings,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // AI Assistant Chat Drawer State
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string; time?: string }[]>([
    {
      sender: 'ai',
      text: 'Halo! Saya **AI Asisten REST API Studio**. Ada yang bisa saya bantu hari ini terkait API Key, Mock Endpoints, atau fitur tier Anda?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userQuestion, setUserQuestion] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [copiedChatIdx, setCopiedChatIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (aiDrawerOpen) {
      scrollToBottom();
    }
  }, [chatMessages, aiTyping, aiDrawerOpen]);

  const quickChips = [
    { label: '🔑 Cara Autentikasi API Key', q: 'Bagaimana cara menggunakan header x-api-key untuk request ke endpoint?' },
    { label: '⚡ Perbedaan Tier Free & Enterprise', q: 'Apa perbedaan limit dan kuota antara tier Free, Pro, dan Enterprise?' },
    { label: '🛠️ Cara Buat Mock API Endpoint', q: 'Bagaimana cara membuat custom Mock REST endpoint?' },
    { label: '💬 Hubungi Support WhatsApp', q: 'Bagaimana cara menghubungi Customer Service atau Admin via WhatsApp?' }
  ];

  const handleSendAiQuestion = async (customPrompt?: string) => {
    const questionToSend = (typeof customPrompt === 'string' ? customPrompt : userQuestion).trim();
    if (!questionToSend || aiTyping) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text: questionToSend, time: timeStr }]);
    setUserQuestion('');
    setAiTyping(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: questionToSend,
          history: chatMessages
        })
      });
      const data = await res.json();
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (data.success && data.text) {
        setChatMessages((prev) => [...prev, { sender: 'ai', text: data.text, time: replyTime }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.error || 'Maaf, saya sedang mengalami kendala koneksi ke server AI. Silakan coba sesaat lagi.',
            time: replyTime
          }
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Gagal mengirim pesan. Silakan periksa koneksi jaringan Anda.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } finally {
      setAiTyping(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        sender: 'ai',
        text: 'Percakapan telah direset. Silakan tanyakan hal baru yang ingin Anda ketahui!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleCopyChatText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedChatIdx(idx);
    setTimeout(() => setCopiedChatIdx(null), 2000);
  };

  // System Announcement
  const [announcement, setAnnouncement] = useState<SystemAnnouncement | null>(null);

  useEffect(() => {
    fetch('/api/system/announcement')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.enabled) {
          setAnnouncement(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Find user's active primary key - strictly filtered to user's keys to prevent fallback to Admin Master Key
  const userKeysOnly = apiKeys.filter(
    (k) => k.ownerEmail && user.email && k.ownerEmail.toLowerCase() === user.email.toLowerCase()
  );
  const activeKey = userKeysOnly.find((k) => k.key === selectedApiKey) || userKeysOnly[0];

  const currentKey = activeKey?.key || '';
  
  // Realtime usage counts
  const totalUserRequests = activeKey?.requestCount || 0;
  const totalLimit = activeKey?.totalLimit ?? (user.tier === 'Enterprise' ? 100000 : user.tier === 'Pro' ? 25000 : 5000);
  const rateLimit = activeKey?.rateLimit ?? (user.tier === 'Enterprise' ? 1000 : user.tier === 'Pro' ? 300 : 60);
  const isUnlimitedQuota = totalLimit === -1;
  const isUnlimitedRate = rateLimit === -1;
  const usagePercent = isUnlimitedQuota ? 0 : Math.min(100, Math.round((totalUserRequests / Math.max(1, totalLimit)) * 100));

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Dedicated Key Generation & Regeneration Handler (generates first key or purges old key on rotation)
  const handleRegenerateKey = async () => {
    setIsRegenerating(true);
    try {
      const endpoint = activeKey ? '/api/keys/regenerate' : '/api/keys/generate';
      const body = activeKey
        ? {
            oldKey: activeKey.key,
            ownerEmail: user.email,
            name: activeKey.name || `${user.name}'s API Key`
          }
        : {
            ownerEmail: user.email,
            tier: user.tier,
            name: `${user.name}'s ${user.tier} Key`
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
          'x-user-role': user.role || 'user'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success && data.data) {
        onSelectApiKey(data.data.key);
        await onRefreshKeys();
        setShowRegenerateModal(false);
        setFeedbackMsg(
          activeKey
            ? (lang === 'id'
                ? 'Kunci API berhasil diganti! Kunci lama telah otomatis dihapus dari database.'
                : 'API Key regenerated! Previous key was automatically purged from database.')
            : (lang === 'id'
                ? 'Kunci API pribadi Anda berhasil dibuat!'
                : 'Your personal API key has been created successfully!')
        );
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        alert(data.error || 'Gagal memproses API key.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Quick switch tier helper for testing
  const handleQuickSwitchTier = async (newTier: 'Free' | 'Pro' | 'Enterprise') => {
    try {
      const res = await fetch('/api/user/request-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          targetTier: newTier
        })
      });
      const data = await res.json();
      if (data.success) {
        if (onUserTierUpdated) {
          onUserTierUpdated(newTier);
        }
        await onRefreshKeys();
        setFeedbackMsg(
          lang === 'id'
            ? `Dashboard dialihkan ke tampilan ${newTier} Tier!`
            : `Dashboard switched to ${newTier} Tier view!`
        );
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Real-time Expiration Timer state
  const [realtimeCountdown, setRealtimeCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    formattedTarget: string;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    formattedTarget: ''
  });

  useEffect(() => {
    const expiryDateStr = user.subscriptionExpiresAt || (
      user.tier !== 'Free'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null
    );

    if (!expiryDateStr) {
      setRealtimeCountdown({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false,
        formattedTarget: ''
      });
      return;
    }

    const updateTimer = () => {
      const targetTime = new Date(expiryDateStr).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      const formattedTarget = new Date(expiryDateStr).toLocaleString(
        lang === 'id' ? 'id-ID' : 'en-US',
        { dateStyle: 'medium', timeStyle: 'medium' }
      );

      if (diff <= 0) {
        setRealtimeCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          formattedTarget
        });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setRealtimeCountdown({
          days,
          hours,
          minutes,
          seconds,
          isExpired: false,
          formattedTarget
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user.subscriptionExpiresAt, user.tier, lang]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-28">

      {/* Video Hero Background Banner (If Enabled by Admin) */}
      {siteSettings?.enableHeroVideo && siteSettings?.heroVideoUrl && (
        <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md group">
          {siteSettings.heroVideoUrl.includes('youtube') || siteSettings.heroVideoUrl.includes('youtu.be') ? (
            <iframe
              src={siteSettings.heroVideoUrl.replace('watch?v=', 'embed/').split('&')[0] + `?autoplay=1&muted=${isVideoMuted ? 1 : 0}&loop=1&controls=0`}
              className="absolute inset-0 w-full h-full object-cover scale-125 pointer-events-none opacity-85"
              title="Hero Background Video"
            />
          ) : (
            <video
              ref={videoRef}
              src={siteSettings.heroVideoUrl}
              autoPlay
              loop
              muted={isVideoMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-85"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between z-10 text-white">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/30 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-indigo-200 border border-indigo-400/30 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Featured Platform Video
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white drop-shadow-md">
                {siteSettings.title || 'REST API Studio'}
              </h2>
              <p className="text-xs text-slate-200 line-clamp-1 max-w-xl">
                {siteSettings.tagline || 'Developer Infrastructure & Interactive API Hub'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const newMuted = !isVideoMuted;
                  setIsVideoMuted(newMuted);
                  if (videoRef.current) {
                    videoRef.current.muted = newMuted;
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md px-3 py-2 text-xs font-bold text-white border border-white/20 transition"
                title={isVideoMuted ? 'Bunyikan Audio Video' : 'Matikan Audio Video'}
              >
                {isVideoMuted ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                    <span className="hidden xs:inline">Mute</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    <span className="hidden xs:inline">Unmute</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onNavigateTab('explorer')}
                className="hidden sm:flex items-center gap-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-indigo-400/30 transition shadow-md"
              >
                <span>Explore APIs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified User Overview & Status Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm dark:shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl border border-indigo-500/30 object-cover shadow"
              />
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                ✓
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {lang === 'id' ? `Halo, ${user.name}` : `Welcome, ${user.name}`}
                </h1>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                  user.tier === 'Enterprise'
                    ? 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                    : user.tier === 'Pro'
                    ? 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40'
                    : 'bg-cyan-500/10 text-cyan-700 border-cyan-500/30 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
                }`}>
                  {user.tier || 'Free'} Tier
                </span>
              </div>
              
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  {realtimeCountdown.isExpired ? (
                    <span className="text-rose-600 dark:text-rose-400 font-bold">Kedaluwarsa</span>
                  ) : realtimeCountdown.formattedTarget ? (
                    <span className="font-mono text-amber-700 dark:text-amber-300 font-bold">
                      Sisa {realtimeCountdown.days}d {realtimeCountdown.hours}h {realtimeCountdown.minutes}m
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Aktif Permanen</span>
                  )}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>{rateLimit === -1 ? 'Unlimited' : `${rateLimit} req/m`}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>{totalLimit === -1 ? 'Unlimited' : `${totalLimit.toLocaleString()} req/bln`}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('explorer')}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 text-xs font-bold transition shadow-md shadow-indigo-600/20"
            >
              <span>API Explorer</span>
            </button>

            {user.tier === 'Free' && (
              <button
                onClick={() => setPricingModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-3.5 py-2 text-xs font-bold transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Upgrade Pro</span>
              </button>
            )}

            {onOpenBotPluginModal && (
              <button
                onClick={onOpenBotPluginModal}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-3.5 py-2 text-xs font-bold transition"
              >
                <Bot className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Bot WA</span>
              </button>
            )}
          </div>
        </div>

        {/* Slim Announcement Banner inside card */}
        {announcement && announcement.enabled && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs text-indigo-700 dark:text-indigo-300">
            <div className="flex items-center gap-2 truncate">
              <Megaphone className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 animate-bounce" />
              <span className="truncate">{announcement.message}</span>
            </div>
            <button
              onClick={() => setPricingModalOpen(true)}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 underline shrink-0"
            >
              Lihat
            </button>
          </div>
        )}
      </div>

      {feedbackMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Render Distinct Role/Tier Specific Dashboard */}
      {user.tier === 'Enterprise' ? (
        <EnterpriseTierDashboard
          user={user}
          apiKeys={apiKeys}
          logs={logs}
          selectedApiKey={selectedApiKey}
          onSelectApiKey={onSelectApiKey}
          onRefreshKeys={onRefreshKeys}
          onNavigateTab={onNavigateTab}
          onQuickSwitchTier={handleQuickSwitchTier}
          lang={lang}
        />
      ) : user.tier === 'Pro' ? (
        <ProTierDashboard
          user={user}
          apiKeys={apiKeys}
          logs={logs}
          selectedApiKey={selectedApiKey}
          onSelectApiKey={onSelectApiKey}
          onRefreshKeys={onRefreshKeys}
          onOpenPricingModal={() => setPricingModalOpen(true)}
          onNavigateTab={onNavigateTab}
          onQuickSwitchTier={handleQuickSwitchTier}
          lang={lang}
        />
      ) : (
        <FreeTierDashboard
          user={user}
          activeKey={activeKey}
          currentKey={currentKey}
          totalUserRequests={totalUserRequests}
          totalLimit={totalLimit}
          rateLimit={rateLimit}
          usagePercent={usagePercent}
          isUnlimitedQuota={isUnlimitedQuota}
          isUnlimitedRate={isUnlimitedRate}
          copiedKey={copiedKey}
          onCopy={handleCopy}
          onOpenRegenerateModal={() => setShowRegenerateModal(true)}
          onOpenPricingModal={() => setPricingModalOpen(true)}
          onNavigateTab={onNavigateTab}
          onQuickSwitchTier={handleQuickSwitchTier}
          onRefreshKeys={onRefreshKeys}
          lang={lang}
        />
      )}

      {/* WhatsApp & Telegram Owner Support Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <Phone className="h-4.5 w-4.5 text-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold text-white">Hubungi Owner & Layanan Bantuan</h3>
        </div>
        <p className="text-xs text-slate-400 font-normal leading-relaxed">
          Butuh upgrade instan, bantuan kustomisasi API, atau mengalami kendala transaksi? Tim developer/owner kami siap membantu Anda secara langsung via WhatsApp atau Telegram.
        </p>
        <div className="flex flex-wrap gap-3">
          {siteSettings?.supportWhatsapp ? (
            <a
              href={`https://wa.me/${siteSettings.supportWhatsapp}?text=Halo%20Owner%20REST%20API%20Studio,%20saya%20butuh%20bantuan%20terkait%20layanan%20API.`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 px-4 py-2.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
            >
              <Phone className="h-4 w-4" />
              <span>WhatsApp Support (+{siteSettings.supportWhatsapp})</span>
            </a>
          ) : (
            <span className="text-xs text-slate-500 italic animate-pulse">WhatsApp support belum dikonfigurasi admin</span>
          )}

          {siteSettings?.supportTelegram ? (
            <a
              href={`https://t.me/${siteSettings.supportTelegram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600/10 hover:bg-sky-600/20 border border-sky-500/20 px-4 py-2.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
            >
              <Send className="h-4 w-4" />
              <span>Telegram Support (@{siteSettings.supportTelegram})</span>
            </a>
          ) : (
            <span className="text-xs text-slate-500 italic animate-pulse">Telegram support belum dikonfigurasi admin</span>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Key Rotation */}
      {showRegenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {lang === 'id' ? 'Regenerate API Key?' : 'Regenerate API Key?'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'id' ? 'Rotasi kunci otomatis & aman' : 'Safe key rotation'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'id'
                ? 'Kunci API lama Anda akan langsung dihapus dari database dan tidak dapat digunakan lagi. Aplikasi Anda harus diperbarui menggunakan kunci baru yang di-generate.'
                : 'Your existing API key will be permanently deleted from the database. Any active applications will need to be updated with the new key.'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenerateModal(false)}
                disabled={isRegenerating}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleRegenerateKey}
                disabled={isRegenerating}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-600/30 hover:bg-amber-700 transition"
              >
                {isRegenerating ? 'Memproses...' : (lang === 'id' ? 'Ya, Regenerate Kunci' : 'Yes, Regenerate Key')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal Component */}
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        currentUser={user}
        onUserTierUpdated={onUserTierUpdated}
        lang={lang}
      />

      {/* Floating AI Assistant Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setAiDrawerOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 p-3 sm:px-4 sm:py-2.5 text-xs font-bold text-white shadow-xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all"
          title="Tanya AI Asisten"
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="hidden sm:inline">Tanya AI</span>
        </button>
      </div>

      {/* AI Assistant Right Drawer */}
      {aiDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-lg border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-2xl flex flex-col justify-between animate-slide-in backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
                <Bot className="h-5 w-5" />
                <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>AI Support Assistant</span>
                  <span className="rounded bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 px-1.5 py-0.2 text-[9px] font-semibold text-indigo-800 dark:text-indigo-300">
                    Gemini Flash
                  </span>
                </h3>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-normal flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Siap Membantu 24/7 • Respons Cepat</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearChat}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                title="Reset Percakapan"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAiDrawerOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                title="Tutup Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="py-2.5 border-b border-slate-200 dark:border-slate-800/60 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendAiQuestion(chip.q)}
                disabled={aiTyping}
                className="whitespace-nowrap rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:text-indigo-900 dark:hover:text-indigo-200 transition shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                  ) : (
                    <div className="markdown-body space-y-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_strong]:font-bold [&_code]:bg-slate-200 dark:[&_code]:bg-slate-950 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[11px] [&_code]:text-amber-800 dark:[&_code]:text-amber-300 [&_pre]:bg-slate-200 dark:[&_pre]:bg-slate-950 [&_pre]:p-2.5 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-2 [&_pre]:border [&_pre]:border-slate-300 dark:[&_pre]:border-slate-800">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  )}

                  {/* Message Footer & Copy Action */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-200 dark:border-white/5 text-[10px] text-slate-500 dark:text-slate-400">
                    <span>{msg.time || ''}</span>
                    {msg.sender === 'ai' && (
                      <button
                        type="button"
                        onClick={() => handleCopyChatText(msg.text, i)}
                        className="opacity-70 group-hover:opacity-100 flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition"
                        title="Salin Pesan"
                      >
                        {copiedChatIdx === i ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {aiTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  <span>AI sedang menyusun jawaban...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendAiQuestion();
            }}
            className="border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Tanyakan seputar API, rate limits, tier..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={aiTyping}
              />
            </div>
            <button
              type="submit"
              disabled={aiTyping || !userQuestion.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Kirim</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
