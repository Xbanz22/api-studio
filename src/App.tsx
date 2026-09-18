import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ApiExplorer } from './components/ApiExplorer';
import { ApiKeysManager } from './components/ApiKeysManager';
import { MockApiBuilder } from './components/MockApiBuilder';
import { LiveAnalytics } from './components/LiveAnalytics';
import { DocumentationView } from './components/DocumentationView';
import { BatchHealthTester } from './components/BatchHealthTester';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { WebhookSimulator } from './components/WebhookSimulator';
import { SpeedtestRadar } from './components/SpeedtestRadar';
import { TechLoadingScreen } from './components/TechLoadingScreen';
import { ProfileModal } from './components/ProfileModal';
import { SiteSettingsModal } from './components/SiteSettingsModal';
import { VercelDeployModal } from './components/VercelDeployModal';
import { BotPluginModal } from './components/BotPluginModal';
import { GuestWelcome } from './components/GuestWelcome';
import { BUILTIN_ENDPOINTS } from './data/endpoints';
import { ApiEndpoint, ApiKeyItem, MockRouteItem, ApiLogItem, ServerStats, UserProfile, SecuritySettings, SiteSettings } from './types';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

// Default Demo User (Developer)
const DEFAULT_USER: UserProfile = {
  id: 'usr_dev_free',
  name: 'Al Husain',
  email: 'developer@company.io',
  role: 'user',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  tier: 'Free',
  company: 'Cloud Innovators Ltd',
  createdAt: '2026-02-15T09:00:00Z',
  lastLoginAt: new Date().toISOString()
};

const DEFAULT_ADMIN: UserProfile = {
  id: 'usr_admin_master',
  name: 'Platform Administrator',
  email: 'admin@apistudio.dev',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  tier: 'Enterprise',
  company: 'API Studio Core Team',
  createdAt: '2026-01-01T00:00:00Z',
  lastLoginAt: new Date().toISOString()
};

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

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('api_studio_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    try {
      const saved = localStorage.getItem('api_studio_current_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u?.role === 'admin') return 'admin';
        return 'dashboard';
      }
    } catch {}
    return 'dashboard';
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [siteSettingsModalOpen, setSiteSettingsModalOpen] = useState(false);
  const [vercelModalOpen, setVercelModalOpen] = useState(false);
  const [botPluginModalOpen, setBotPluginModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'otp' | 'login' | 'register' | 'google_select'>('login');
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [endpointTiers, setEndpointTiers] = useState<Record<string, string>>({});

  const fetchJson = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const fetchEndpointTiers = async () => {
    const data = await fetchJson('/api/security/tiers');
    if (data && data.success && data.tiers) {
      setEndpointTiers(data.tiers);
    }
  };

  const fetchSiteSettings = async () => {
    const data = await fetchJson('/api/site/settings');
    if (!data) return;
    const settingsData = data.data || data.settings;
    if (data.success && settingsData) {
      setSiteSettings(settingsData);
      if (settingsData.title) {
        document.title = settingsData.tagline ? `${settingsData.title} - ${settingsData.tagline}` : settingsData.title;
      }
      if (settingsData.faviconUrl) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        if (settingsData.faviconUrl.startsWith('http')) {
          link.href = settingsData.faviconUrl;
        } else {
          link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${settingsData.faviconUrl}</text></svg>`;
        }
      }
    }
  };

  useEffect(() => {
    fetchSiteSettings();
    fetchEndpointTiers();
  }, []);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('api_studio_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem('api_studio_theme', theme);
    } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [explorerMobileView, setExplorerMobileView] = useState<'list' | 'playground'>('list');
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [isNavLoading, setIsNavLoading] = useState(false);
  const [navTargetView, setNavTargetView] = useState<'dashboard' | 'register' | 'login' | 'admin' | 'general'>('general');

  const triggerTabWithLoading = (nextTab: AppTab) => {
    if (nextTab === activeTab) return;
    setNavTargetView(nextTab === 'dashboard' ? 'dashboard' : nextTab === 'admin' ? 'admin' : 'general');
    setIsNavLoading(true);
    setActiveTab(nextTab);
  };

  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(BUILTIN_ENDPOINTS[2]); // Start with AI Generator
  const [selectedMockRoute, setSelectedMockRoute] = useState<MockRouteItem | null>(null);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [mockRoutes, setMockRoutes] = useState<MockRouteItem[]>([]);
  const [logs, setLogs] = useState<ApiLogItem[]>([]);
  const [stats, setStats] = useState<ServerStats | null>(null);

  const [serverOnline, setServerOnline] = useState(true);
  const [serverLatency, setServerLatency] = useState<number | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);

  // Filter keys visible to current user (Admin sees all, regular user sees only their keys)
  // Strict Key Isolation:
  // - Admin in Admin Tab sees all system keys for management
  // - In Explorer, User Dashboards, Mock, etc.:
  //   Users ONLY see keys they own (ownerEmail === currentUser.email)
  //   AND matching their active tier (e.g. Free tier only sees their own Free key, never Admin/Enterprise)
  const visibleApiKeys = apiKeys.filter((k) => {
    if (!currentUser?.email) return false;
    if (currentUser.role === 'admin' && activeTab === 'admin') {
      return true;
    }
    const isOwner = k.ownerEmail && k.ownerEmail.toLowerCase() === currentUser.email.toLowerCase();
    if (!isOwner) return false;
    if (currentUser.tier === 'Free') {
      return k.tier === 'Free';
    }
    if (currentUser.tier === 'Pro') {
      return k.tier === 'Pro' || k.tier === 'Free';
    }
    return true;
  });

  // Auto-sync selectedApiKey to current user's available keys
  useEffect(() => {
    if (visibleApiKeys.length > 0) {
      const exists = visibleApiKeys.some((k) => k.key === selectedApiKey);
      if (!exists) {
        setSelectedApiKey(visibleApiKeys[0].key);
      }
    } else {
      setSelectedApiKey('');
    }
  }, [currentUser?.email, currentUser?.role, currentUser?.tier, visibleApiKeys.length, activeTab]);

  // Sync user changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('api_studio_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('api_studio_current_user');
    }
  }, [currentUser]);

  // Fetch Global Security & Maintenance State
  const fetchSecuritySettings = async () => {
    const data = await fetchJson('/api/admin/security');
    if (data && data.success && data.settings) {
      setSecuritySettings(data.settings);
    }
  };

  // Sync Current User Profile & Tier from Server
  const syncUserProfile = async () => {
    if (!currentUser?.email) return;
    const data = await fetchJson(`/api/user/profile?email=${encodeURIComponent(currentUser.email)}`);
    if (data && data.success && data.user) {
      // If tier or role has updated on server, update state and localStorage
      if (data.user.tier !== currentUser.tier || data.user.role !== currentUser.role) {
        const updatedUser: UserProfile = {
          ...currentUser,
          tier: data.user.tier,
          role: data.user.role,
          name: data.user.name || currentUser.name,
          company: data.user.company || currentUser.company
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('api_studio_current_user', JSON.stringify(updatedUser));
      }
    }
  };

  // Ping Server Health
  const checkServerHealth = async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/status');
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        setServerOnline(true);
        setServerLatency(latency);
      } else {
        setServerOnline(false);
      }
    } catch {
      setServerOnline(false);
      setServerLatency(null);
    }
  };

  // Fetch API Keys (Per-user filtered)
  const fetchKeys = async () => {
    const url = currentUser && currentUser.role !== 'admin'
      ? `/api/user/my-keys?email=${encodeURIComponent(currentUser.email)}`
      : '/api/keys/list';
    const data = await fetchJson(url);
    if (data && data.success) {
      setApiKeys(data.data || []);
    }
  };

  // Fetch Mock Routes
  const fetchMockRoutes = async () => {
    const data = await fetchJson('/api/mock-routes');
    if (data && data.success) {
      setMockRoutes(data.data || []);
    }
  };

  // Fetch Analytics & Logs (Per-user filtered)
  const fetchAnalytics = async () => {
    const statsUrl = currentUser && currentUser.role !== 'admin'
      ? `/api/analytics/stats?email=${encodeURIComponent(currentUser.email)}`
      : '/api/analytics/stats';
    const logsUrl = currentUser && currentUser.role !== 'admin'
      ? `/api/analytics/logs?email=${encodeURIComponent(currentUser.email)}&limit=100`
      : '/api/analytics/logs?limit=100';

    const [statsData, logsData] = await Promise.all([
      fetchJson(statsUrl),
      fetchJson(logsUrl)
    ]);
    if (statsData && statsData.success) setStats(statsData);
    if (logsData && logsData.success) setLogs(logsData.logs || []);
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/analytics/logs', { method: 'DELETE' });
      setLogs([]);
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  // Unified refresh after API call
  const handleLogNewRequest = () => {
    fetchAnalytics();
    fetchKeys();
  };

  // Switch role between User and Admin easily
  const handleSwitchRole = async () => {
    if (!currentUser) return;
    setIsNavLoading(true);
    const nextRole = currentUser.role === 'admin' ? 'user' : 'admin';
    const updatedUser: UserProfile = {
      ...currentUser,
      role: nextRole
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('api_studio_current_user', JSON.stringify(updatedUser));
    setNavTargetView(nextRole === 'admin' ? 'admin' : 'dashboard');
    setActiveTab(nextRole === 'admin' ? 'admin' : 'dashboard');

    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          role: nextRole,
          tier: currentUser.tier
        })
      });
    } catch (err) {
      console.error('Failed to sync role switch with server:', err);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('api_studio_auth_token');
      localStorage.removeItem('api_studio_current_user');
      sessionStorage.removeItem('api_studio_auth_token');
      sessionStorage.removeItem('api_studio_current_user');
    } catch (e) {
      console.error('Failed to clear storage during logout:', e);
    }
    setCurrentUser(null);
    setActiveTab('dashboard');
    setAuthModalOpen(false);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsNavLoading(true);
    if (user.role === 'admin') {
      setNavTargetView('admin');
      setActiveTab('admin');
    } else {
      setNavTargetView('dashboard');
      setActiveTab('dashboard');
    }
  };

  const handleUserTierUpdated = (newTier: 'Free' | 'Pro' | 'Enterprise') => {
    if (currentUser) {
      const updated = { ...currentUser, tier: newTier };
      setCurrentUser(updated);
      localStorage.setItem('api_studio_current_user', JSON.stringify(updated));
    }
    fetchKeys();
  };

  // Re-fetch keys & analytics whenever currentUser changes
  useEffect(() => {
    fetchKeys();
    fetchAnalytics();
  }, [currentUser?.email, currentUser?.role]);

  // Initial load
  useEffect(() => {
    checkServerHealth();
    fetchKeys();
    fetchMockRoutes();
    fetchAnalytics();
    fetchSecuritySettings();
    syncUserProfile();

    const healthInterval = setInterval(() => {
      checkServerHealth();
      fetchSecuritySettings();
      syncUserProfile();
    }, 6000);
    return () => clearInterval(healthInterval);
  }, []);

  // Real-time Live Polling: when viewing Admin or Analytics, refresh request logs every 2.5s
  useEffect(() => {
    if (activeTab === 'admin' || activeTab === 'analytics') {
      const liveInterval = setInterval(() => {
        fetchAnalytics();
      }, 2500);
      return () => clearInterval(liveInterval);
    }
  }, [activeTab, currentUser?.email, currentUser?.role]);

  // Sync data whenever active tab switches
  useEffect(() => {
    syncUserProfile();
    if (activeTab === 'keys') {
      fetchKeys();
    } else if (activeTab === 'analytics' || activeTab === 'admin') {
      fetchAnalytics();
      fetchKeys();
      fetchSecuritySettings();
    } else if (activeTab === 'mock') {
      fetchMockRoutes();
    } else if (activeTab === 'explorer' || activeTab === 'dashboard' || activeTab === 'webhooks' || activeTab === 'speedtest') {
      fetchKeys();
      fetchAnalytics();
      fetchSecuritySettings();
      fetchMockRoutes();
    }
  }, [activeTab]);

  // When a mock route is selected to be tested in Explorer
  const handleSelectMockRoute = (mock: MockRouteItem) => {
    setSelectedMockRoute(mock);
    // Create temporary endpoint wrapper for the Mock Route
    const mockEpWrapper: ApiEndpoint = {
      id: `mock-${mock.id}`,
      name: `Mock: /api/m/${mock.path}`,
      nameId: `Mock: /api/m/${mock.path}`,
      category: 'mock',
      method: mock.method as any,
      path: `/api/m/${mock.path}`,
      summary: mock.description || `Custom mock route with ${mock.status} response`,
      summaryId: mock.description || `Custom mock route dengan respons ${mock.status}`,
      description: mock.description || `User-defined mock endpoint responding with HTTP ${mock.status}. Supports dynamic query parameter interpolation {{param}}.`,
      descriptionId: mock.description || `Endpoint mock kustom dengan status HTTP ${mock.status}. Mendukung interpolasi parameter {{param}}.`,
      tags: ['Custom Mock', mock.method, ...mock.path.split('/')],
      queryParams: mock.queryParams || [
        { name: 'q', type: 'string', required: false, defaultValue: 'aesthetic wallpaper', description: 'Kata kunci pencarian / filter parameter' }
      ],
      headers: mock.headers,
      requestBodySample: mock.requestBodySample,
      responseSample: mock.responseBody
    };
    setSelectedEndpoint(mockEpWrapper);
    setActiveTab('explorer');
    setExplorerMobileView('playground');
  };

  // Update existing mock route parameters / body / headers
  const handleUpdateMockRoute = async (mockId: string, updates: Partial<MockRouteItem>) => {
    try {
      const res = await fetch(`/api/mock-routes/${mockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        await fetchMockRoutes();
        if (selectedMockRoute && selectedMockRoute.id === mockId) {
          const updatedMock = { ...selectedMockRoute, ...updates };
          handleSelectMockRoute(updatedMock);
        }
      }
    } catch (err) {
      console.error('Failed to update mock route:', err);
    }
  };

  const handleSelectBuiltinEndpoint = (ep: ApiEndpoint) => {
    setSelectedMockRoute(null);
    setSelectedEndpoint(ep);
    setActiveTab('explorer');
    setExplorerMobileView('playground');
  };

  return (
    <div className={`flex h-screen w-screen flex-col font-sans transition-colors duration-200 overflow-hidden ${theme === 'dark' ? 'bg-black text-slate-100 dark' : 'bg-[#FAF8F5] text-slate-900 light'}`}>
      {/* Global Navigation Tech Loading Overlay */}
      {isNavLoading && (
        <TechLoadingScreen
          title={navTargetView === 'dashboard' ? 'Memuat Dashboard Developer...' : navTargetView === 'admin' ? 'Memuat Panel Admin Master...' : 'Sinkronisasi REST Studio...'}
          subtitle="Menghubungkan ke API Hub, mengambil log & memverifikasi otorisasi..."
          targetView={navTargetView}
          minDurationMs={1000}
          onComplete={() => setIsNavLoading(false)}
        />
      )}

      {/* Top Navbar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={triggerTabWithLoading}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        serverOnline={serverOnline}
        serverLatency={serverLatency}
        onOpenHealthTester={() => setHealthModalOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        maintenanceModeActive={securitySettings?.maintenanceMode}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onOpenSiteSettingsModal={() => setSiteSettingsModalOpen(true)}
        onOpenVercelDeployModal={() => setVercelModalOpen(true)}
        onOpenBotPluginModal={() => setBotPluginModalOpen(true)}
        siteSettings={siteSettings}
      />

      {/* Global Maintenance Alert Bar */}
      {securitySettings?.maintenanceMode && (
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 px-4 py-1.5 text-xs text-white shadow-md flex items-center justify-between z-30 shrink-0 font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 animate-bounce" />
            <span>
              {lang === 'id'
                ? 'PERHATIAN: Mode Maintenance sedang aktif. Endpoint API publik/user diblokir dengan kode HTTP 503.'
                : 'NOTICE: Maintenance Mode is active. Public and user API endpoints return HTTP 503.'}
            </span>
            {currentUser?.role === 'admin' && (
              <span className="rounded bg-black/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Admin Bypass Active
              </span>
            )}
          </div>
          {currentUser?.role === 'admin' ? (
            <button
              onClick={() => setActiveTab('admin')}
              className="text-xs underline font-bold hover:text-amber-200"
            >
              {lang === 'id' ? 'Buka Pengaturan Admin' : 'Open Admin Security'}
            </button>
          ) : (
            <span className="text-[11px] opacity-80">
              {lang === 'id' ? 'Hanya Admin yang dapat mematikan' : 'Admin only'}
            </span>
          )}
        </div>
      )}

      {/* Main View Container */}
      <main className="flex flex-1 overflow-hidden">
        {/* Guest Welcome & Exploration View (When visitor is not signed in) */}
        {!currentUser && (activeTab === 'dashboard' || activeTab === 'admin') && (
          <GuestWelcome
            onLoginSuccess={handleLoginSuccess}
            onOpenAuthModal={(targetTab = 'otp') => {
              setAuthModalInitialTab(targetTab);
              setAuthModalOpen(true);
            }}
            onExploreApis={() => {
              setActiveTab('explorer');
              setExplorerMobileView('playground');
            }}
            lang={lang}
            siteSettings={siteSettings}
          />
        )}

        {/* User Developer Portal Dashboard */}
        {activeTab === 'dashboard' && currentUser && (
          <UserDashboard
            user={currentUser}
            apiKeys={visibleApiKeys}
            logs={logs}
            selectedApiKey={selectedApiKey}
            onSelectApiKey={setSelectedApiKey}
            onRefreshKeys={fetchKeys}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'explorer') setExplorerMobileView('playground');
            }}
            onUserTierUpdated={handleUserTierUpdated}
            onOpenBotPluginModal={() => setBotPluginModalOpen(true)}
            lang={lang}
            siteSettings={siteSettings}
          />
        )}

        {/* Admin Master Operations Dashboard */}
        {activeTab === 'admin' && currentUser && (
          <AdminDashboard
            user={currentUser}
            stats={stats}
            logs={logs}
            apiKeys={apiKeys}
            siteSettings={siteSettings}
            onUpdateSiteSettings={(newSettings) => setSiteSettings(newSettings)}
            onRefreshAll={() => {
              fetchAnalytics();
              fetchKeys();
              fetchMockRoutes();
              fetchSecuritySettings();
              syncUserProfile();
              fetchSiteSettings();
            }}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'explorer') setExplorerMobileView('playground');
            }}
            lang={lang}
          />
        )}

        {/* API Explorer */}
        {activeTab === 'explorer' && (
          <div className="flex h-full w-full flex-col lg:flex-row overflow-hidden">
            {/* Sidebar List (Desktop) */}
            <div className="h-full w-full lg:w-80 lg:shrink-0 hidden lg:block border-r border-slate-200 dark:border-slate-800">
              <Sidebar
                endpoints={BUILTIN_ENDPOINTS}
                selectedEndpoint={selectedEndpoint}
                onSelectEndpoint={handleSelectBuiltinEndpoint}
                mockRoutes={mockRoutes}
                selectedMockRoute={selectedMockRoute}
                onSelectMockRoute={handleSelectMockRoute}
                onOpenMockBuilder={() => setActiveTab('mock')}
                lang={lang}
                endpointTiers={endpointTiers}
              />
            </div>

            {/* Main Api Explorer */}
            <div className="h-full flex-1 overflow-hidden flex flex-col">
              <ApiExplorer
                endpoint={selectedEndpoint}
                selectedMockRoute={selectedMockRoute}
                onUpdateMockRoute={handleUpdateMockRoute}
                apiKeys={visibleApiKeys}
                selectedApiKey={selectedApiKey}
                onSelectApiKey={setSelectedApiKey}
                currentUser={currentUser}
                lang={lang}
                onLogNewRequest={handleLogNewRequest}
                endpointTiers={endpointTiers}
                onSelectEndpoint={handleSelectBuiltinEndpoint}
              />
            </div>
          </div>
        )}

        {/* API Keys Management */}
        {activeTab === 'keys' && (
          <ApiKeysManager
            apiKeys={visibleApiKeys}
            currentUser={currentUser}
            selectedApiKey={selectedApiKey}
            onRefreshKeys={fetchKeys}
            onSelectKeyForTesting={(key) => {
              setSelectedApiKey(key);
              setActiveTab('explorer');
              setExplorerMobileView('playground');
            }}
            onUserTierUpdated={handleUserTierUpdated}
            onSwitchToAdminTab={() => setActiveTab('admin')}
            lang={lang}
          />
        )}

        {/* Mock API Builder */}
        {activeTab === 'mock' && (
          <MockApiBuilder
            mockRoutes={mockRoutes}
            onRefreshRoutes={fetchMockRoutes}
            onSelectMockRouteForTesting={handleSelectMockRoute}
            lang={lang}
          />
        )}

        {/* Webhooks Simulator & Event Dispatcher */}
        {activeTab === 'webhooks' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <WebhookSimulator lang={lang} />
          </div>
        )}

        {/* Global Speedtest & Latency Radar */}
        {activeTab === 'speedtest' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <SpeedtestRadar lang={lang} />
          </div>
        )}

        {/* Live Analytics & Traffic */}
        {activeTab === 'analytics' && (
          <LiveAnalytics
            stats={stats}
            logs={logs}
            user={currentUser}
            onRefresh={fetchAnalytics}
            onClearLogs={handleClearLogs}
            lang={lang}
          />
        )}

        {/* Documentation View */}
        {activeTab === 'docs' && (
          <DocumentationView
            endpoints={BUILTIN_ENDPOINTS}
            mockRoutes={mockRoutes}
            onSelectEndpoint={handleSelectBuiltinEndpoint}
            onSelectMockRoute={handleSelectMockRoute}
            lang={lang}
          />
        )}
      </main>

      {/* Auth Modal (Login / Register / OTP Quick Switch) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
        initialTab={authModalInitialTab}
      />

      {/* Batch Health Check Modal */}
      <BatchHealthTester
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        endpoints={BUILTIN_ENDPOINTS}
        lang={lang}
      />

      {/* Profile Management Modal */}
      {currentUser && (
        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={currentUser}
          onProfileUpdated={(updated) => setCurrentUser(updated)}
          lang={lang}
        />
      )}

      {/* Web Branding / Site Settings Modal */}
      <SiteSettingsModal
        isOpen={siteSettingsModalOpen}
        onClose={() => setSiteSettingsModalOpen(false)}
        settings={siteSettings}
        onSettingsUpdated={setSiteSettings}
        onSaved={fetchSiteSettings}
        lang={lang}
      />

      {/* Vercel Deployment Modal */}
      <VercelDeployModal
        isOpen={vercelModalOpen}
        onClose={() => setVercelModalOpen(false)}
        lang={lang}
      />

      {/* WhatsApp Bot Plugin & Limit Tester Modal */}
      <BotPluginModal
        isOpen={botPluginModalOpen}
        onClose={() => setBotPluginModalOpen(false)}
        apiKeys={apiKeys}
        defaultKey={selectedApiKey}
        lang={lang}
      />
    </div>
  );
}
