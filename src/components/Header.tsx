import React, { useState } from 'react';
import {
  Layers,
  Key,
  Database,
  BarChart3,
  BookOpen,
  Zap,
  Globe,
  CheckCircle2,
  Menu,
  X,
  FileCode2,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  Webhook,
  Gauge,
  AlertTriangle,
  Download,
  Crown,
  Code2,
  Flame,
  Terminal,
  Bot,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile, SiteSettings } from '../types';

export type AppTab = 'dashboard' | 'admin' | 'explorer' | 'keys' | 'mock' | 'webhooks' | 'speedtest' | 'analytics' | 'docs';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onSwitchRole: () => void;
  lang: 'id' | 'en';
  setLang: (lang: 'id' | 'en') => void;
  theme?: 'dark' | 'light';
  setTheme?: (theme: 'dark' | 'light') => void;
  serverOnline: boolean;
  serverLatency: number | null;
  onOpenHealthTester: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  maintenanceModeActive?: boolean;
  onOpenProfileModal?: () => void;
  onOpenSiteSettingsModal?: () => void;
  onOpenVercelDeployModal?: () => void;
  onOpenBotPluginModal?: () => void;
  siteSettings?: SiteSettings | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onSwitchRole,
  lang,
  setLang,
  theme = 'dark',
  setTheme,
  serverOnline,
  serverLatency,
  onOpenHealthTester,
  mobileMenuOpen,
  setMobileMenuOpen,
  maintenanceModeActive = false,
  onOpenProfileModal,
  onOpenSiteSettingsModal,
  onOpenVercelDeployModal,
  onOpenBotPluginModal,
  siteSettings
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Dynamically select logo icon
  const renderLogoIcon = () => {
    const iconName = siteSettings?.logoIcon || 'Zap';
    switch (iconName) {
      case 'Crown':
        return <Crown className="h-5 w-5 text-white" />;
      case 'Sparkles':
        return <Sparkles className="h-5 w-5 text-white" />;
      case 'Code2':
        return <Code2 className="h-5 w-5 text-white" />;
      case 'Flame':
        return <Flame className="h-5 w-5 text-white" />;
      case 'Terminal':
        return <Terminal className="h-5 w-5 text-white" />;
      case 'Zap':
      default:
        return <Zap className="h-5 w-5 text-white" />;
    }
  };

  // Adaptive Tabs based on User Role
  const tabs = isAdmin
    ? [
        { id: 'admin', labelEn: 'Admin Control', labelId: 'Master Admin', icon: ShieldCheck },
        { id: 'explorer', labelEn: 'API Explorer', labelId: 'API Explorer', icon: Layers },
        { id: 'keys', labelEn: 'Global Keys', labelId: 'Kunci Global', icon: Key },
        { id: 'mock', labelEn: 'Mock Builder', labelId: 'Mock Engine', icon: Database },
        { id: 'webhooks', labelEn: 'Webhooks', labelId: 'Webhooks', icon: Webhook },
        { id: 'speedtest', labelEn: 'Radar', labelId: 'Speedtest', icon: Gauge },
        { id: 'analytics', labelEn: 'Traffic & Logs', labelId: 'Audit Traffic', icon: BarChart3 },
        { id: 'docs', labelEn: 'Docs & Spec', labelId: 'Dokumentasi', icon: BookOpen },
      ]
    : [
        { id: 'dashboard', labelEn: 'Developer Hub', labelId: 'Portal User', icon: LayoutDashboard },
        { id: 'explorer', labelEn: 'API Explorer', labelId: 'API Explorer', icon: Layers },
        { id: 'keys', labelEn: 'My API Keys', labelId: 'Kunci Saya', icon: Key },
        { id: 'webhooks', labelEn: 'Webhooks', labelId: 'Webhooks', icon: Webhook },
        { id: 'speedtest', labelEn: 'Speedtest', labelId: 'Speedtest', icon: Gauge },
        { id: 'analytics', labelEn: 'My Usage', labelId: 'Pemakaian', icon: BarChart3 },
        { id: 'docs', labelEn: 'Documentation', labelId: 'Dokumentasi', icon: BookOpen },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-black/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 gap-2">
        
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div
            onClick={() => setActiveTab(isAdmin ? 'admin' : 'dashboard')}
            className="flex cursor-pointer items-center gap-2 sm:gap-2.5 transition hover:opacity-90 min-w-0"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 shadow-md shadow-indigo-500/20">
              {renderLogoIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-sans text-xs sm:text-base font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                  {siteSettings?.title || 'REST API Studio'}
                </span>
                <span className={`hidden sm:inline-block rounded-full border px-2 py-0.2 text-[10px] font-bold ${
                  isAdmin 
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300' 
                    : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                }`}>
                  {isAdmin ? 'ADMIN' : 'DEVELOPER'}
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">
                {siteSettings?.tagline ? siteSettings.tagline : (
                  isAdmin
                    ? (lang === 'id' ? 'Master Operations Engine' : 'Master Ops Engine')
                    : (lang === 'id' ? 'Developer Portal & API Hub' : 'Developer Portal & API Hub')
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="hidden items-center gap-1 md:flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AppTab)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? isAdmin
                      ? 'border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-200 shadow-sm'
                      : 'border border-indigo-200 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? (isAdmin ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400') : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{lang === 'id' ? tab.labelId : tab.labelEn}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Auth, Server Status, Lang & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Maintenance Mode Status Pill */}
          {maintenanceModeActive && (
            <div
              className={`hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                isAdmin
                  ? 'border-amber-500/60 bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-pulse'
                  : 'border-rose-500/60 bg-rose-500/20 text-rose-700 dark:text-rose-300 animate-pulse'
              }`}
              title={
                isAdmin
                  ? 'Maintenance mode aktif. Anda memiliki akses Super Admin bypass.'
                  : 'Platform dalam pemeliharaan. Request API non-admin diblokir 503.'
              }
            >
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>{isAdmin ? 'MAINTENANCE (ADMIN BYPASS)' : 'MAINTENANCE MODE'}</span>
            </div>
          )}

          {/* Server status pill */}
          <button
            onClick={onOpenHealthTester}
            title="Click to run Batch Health & Latency Test"
            className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-2.5 py-1 text-xs transition hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${serverOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex h-2 w-2 rounded-full ${serverOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className="hidden font-medium text-slate-700 dark:text-slate-300 md:inline">
              {serverOnline ? (lang === 'id' ? 'Online' : 'Live') : 'Offline'}
            </span>
            {serverLatency !== null && (
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {serverLatency}ms
              </span>
            )}
          </button>

          {/* Quick Bot WA Plugin & Limit Tester */}
          {onOpenBotPluginModal && (
            <button
              onClick={onOpenBotPluginModal}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition shadow-sm"
              title="Uji Limit API Key & Export Plugin Bot WA"
            >
              <Bot className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Bot WA</span>
            </button>
          )}

          {/* Quick Vercel Deploy Export */}
          {onOpenVercelDeployModal && (
            <button
              onClick={onOpenVercelDeployModal}
              className="hidden xl:flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-900 dark:bg-black px-2.5 py-1.5 text-xs font-bold text-white hover:border-emerald-500/50 hover:text-emerald-300 transition shadow-sm"
              title="Deploy REST API Studio to Vercel"
            >
              <svg viewBox="0 0 76 65" className="h-3 w-3 fill-current text-white">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              <span>Deploy Vercel</span>
            </button>
          )}

          {/* Quick Postman Export */}
          <a
            href="/api/export/postman"
            download="rest_api_studio_postman.json"
            className="hidden xl:flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:text-slate-900 dark:hover:text-white transition"
            title="Download Postman Collection v2.1"
          >
            <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Postman</span>
          </a>

          {/* Theme Switcher Button */}
          {setTheme && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
              title={theme === 'dark' ? (lang === 'id' ? 'Aktifkan Mode Terang' : 'Switch to Light Mode') : (lang === 'id' ? 'Aktifkan Mode Gelap' : 'Switch to Dark Mode')}
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-indigo-600" />
              )}
              <span className="hidden sm:inline font-semibold text-[11px]">{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>
          )}

          {/* Language Selector */}
          <button
            onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
            title={lang === 'id' ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'}
          >
            <Globe className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="font-semibold">{lang === 'id' ? 'ID' : 'EN'}</span>
          </button>

          {/* User Profile / Login Button */}
          {currentUser ? (
            <div className="relative shrink-0">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center gap-2 rounded-xl border p-1 pr-2.5 transition ${
                  isAdmin
                    ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 hover:border-amber-400 dark:hover:border-amber-500/60'
                    : 'border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/20 hover:border-indigo-400 dark:hover:border-indigo-500/60'
                }`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-7 w-7 rounded-lg object-cover"
                />
                <div className="hidden text-left sm:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[100px]">
                    {currentUser.name}
                  </div>
                  <div className={`text-[10px] font-semibold leading-tight ${isAdmin ? 'text-amber-700 dark:text-amber-400' : 'text-indigo-700 dark:text-indigo-400'}`}>
                    {isAdmin ? 'Super Admin' : 'Developer'}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-xl dark:shadow-2xl dark:shadow-indigo-950/40 z-50">
                  <div className="mb-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{currentUser.email}</div>
                      <span className={`inline-block mt-0.5 rounded px-1.5 py-0.2 text-[9px] font-bold ${
                        isAdmin ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300'
                      }`}>
                        {isAdmin ? 'Role: Super Admin' : `Role: Developer (${currentUser.tier || 'Pro'})`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {onOpenProfileModal && (
                      <button
                        onClick={() => {
                          onOpenProfileModal();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between rounded-xl p-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        <span className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>{lang === 'id' ? 'Pengaturan Profil' : 'Edit Profile'}</span>
                        </span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Ubah</span>
                      </button>
                    )}

                    {isAdmin && onOpenSiteSettingsModal && (
                      <button
                        onClick={() => {
                          onOpenSiteSettingsModal();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between rounded-xl p-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        <span className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          <span>{lang === 'id' ? 'Branding & Title Web' : 'Web Branding Settings'}</span>
                        </span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Admin</span>
                      </button>
                    )}

                    {isAdmin && onOpenVercelDeployModal && (
                      <button
                        onClick={() => {
                          onOpenVercelDeployModal();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between rounded-xl p-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        <span className="flex items-center gap-2">
                          <svg viewBox="0 0 76 65" className="h-3 w-3 fill-current text-emerald-600 dark:text-emerald-400">
                            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                          </svg>
                          <span>{lang === 'id' ? 'Deploy ke Vercel' : 'Deploy to Vercel'}</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Export</span>
                      </button>
                    )}

                    {/* Show switch role for admin accounts to toggle views */}
                    {(currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'admin@apistudio.dev') && (
                      <button
                        onClick={() => {
                          onSwitchRole();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between rounded-xl p-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>{isAdmin ? 'Ganti ke View User' : 'Ganti ke View Admin'}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">1-Klik</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onLogout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 rounded-xl p-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>{lang === 'id' ? 'Keluar (Logout)' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition shrink-0 z-10"
            >
              <User className="h-3.5 w-3.5" />
              <span>{lang === 'id' ? 'Masuk' : 'Sign In'}</span>
            </button>
          )}

          {/* OpenAPI JSON link */}
          <a
            href="/api/docs/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300 lg:flex"
            title="Open OpenAPI 3.0 Raw JSON"
          >
            <FileCode2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>OpenAPI</span>
          </a>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 md:hidden space-y-3 shadow-2xl">
          {/* Mobile Auth / Account Section */}
          {!currentUser ? (
            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-950/40 dark:to-cyan-950/20 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {lang === 'id' ? 'Portal Developer' : 'Developer Portal'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {lang === 'id' ? 'Masuk untuk kelola API Key & kuota' : 'Sign in to access keys & quota'}
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition"
              >
                <User className="h-3.5 w-3.5" />
                <span>{lang === 'id' ? 'Masuk' : 'Sign In'}</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {currentUser.email}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 transition hover:bg-rose-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{lang === 'id' ? 'Keluar' : 'Logout'}</span>
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as AppTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{lang === 'id' ? tab.labelId : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Quick Utilities Footer */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            {/* Theme Switcher */}
            {setTheme && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {theme === 'dark' ? (
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-indigo-600" />
                )}
                <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>
            )}

            {/* Language Selector */}
            <button
              onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              <span>{lang === 'id' ? 'ID' : 'EN'}</span>
            </button>

            {/* Bot WA trigger */}
            {onOpenBotPluginModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBotPluginModal();
                }}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300"
              >
                <Bot className="h-3.5 w-3.5 text-emerald-600" />
                <span>Bot WA</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
