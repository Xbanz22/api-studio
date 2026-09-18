import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Wrench,
  Database,
  Key,
  Activity,
  PlusCircle,
  Hash,
  ChevronRight,
  Filter,
  Layers
} from 'lucide-react';
import { ApiEndpoint, HttpMethod, MockRouteItem } from '../types';
import { CATEGORIES } from '../data/endpoints';

interface SidebarProps {
  endpoints: ApiEndpoint[];
  selectedEndpoint: ApiEndpoint | null;
  onSelectEndpoint: (endpoint: ApiEndpoint) => void;
  mockRoutes: MockRouteItem[];
  selectedMockRoute: MockRouteItem | null;
  onSelectMockRoute: (mock: MockRouteItem) => void;
  onOpenMockBuilder: () => void;
  lang: 'id' | 'en';
  endpointTiers?: Record<string, string>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  endpoints,
  selectedEndpoint,
  onSelectEndpoint,
  mockRoutes,
  selectedMockRoute,
  onSelectMockRoute,
  onOpenMockBuilder,
  lang,
  endpointTiers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const methods = ['ALL', 'GET', 'POST', 'PUT', 'DELETE'];

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'ai': return Sparkles;
      case 'tools': return Wrench;
      case 'data': return Database;
      case 'keys': return Key;
      case 'system': return Activity;
      default: return Hash;
    }
  };

  const getMethodBadgeClass = (method: HttpMethod | string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30';
      case 'POST':
        return 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/30';
      case 'PUT':
        return 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30';
      case 'PATCH':
        return 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  // Filtered built-in endpoints
  const filteredEndpoints = endpoints.filter((ep) => {
    const matchesSearch =
      !searchQuery ||
      ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.nameId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMethod = selectedMethod === 'ALL' || ep.method === selectedMethod;
    const matchesCategory = selectedCategory === 'ALL' || ep.category === selectedCategory;

    return matchesSearch && matchesMethod && matchesCategory;
  });

  // Filtered custom mock routes
  const filteredMockRoutes = mockRoutes.filter((mock) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      mock.path.toLowerCase().includes(q) ||
      mock.method.toLowerCase().includes(q) ||
      (mock.description && mock.description.toLowerCase().includes(q));

    const matchesMethod = selectedMethod === 'ALL' || mock.method === selectedMethod;
    const matchesCategory = selectedCategory === 'ALL' || selectedCategory === 'mock';

    return matchesSearch && matchesMethod && matchesCategory;
  });

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/60 text-slate-800 dark:text-slate-200 lg:w-80">
      {/* Search Bar & Filters */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 p-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'id' ? 'Cari endpoint, pinterest, path...' : 'Search endpoints, pinterest, paths...'}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 py-2 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-xs text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          )}
        </div>

        {/* Category Cards & Method Filters */}
        <div className="flex flex-col gap-2.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span className="uppercase tracking-wider font-mono text-[10px] text-slate-500">{lang === 'id' ? 'KATEGORI API' : 'API CATEGORIES'}</span>
              {selectedCategory !== 'ALL' && (
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  {lang === 'id' ? 'Tampilkan Semua' : 'Show All'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`flex items-center justify-between gap-1.5 rounded-xl border p-2 text-left transition-all ${
                  selectedCategory === 'ALL'
                    ? 'border-indigo-500/60 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-white shadow-sm ring-1 ring-indigo-500/30 font-bold'
                    : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Layers className="h-3 w-3" />
                  </div>
                  <span className="text-[11px] font-semibold truncate">{lang === 'id' ? 'Semua API' : 'All APIs'}</span>
                </div>
                <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  {endpoints.length + mockRoutes.length}
                </span>
              </button>

              {CATEGORIES.map((cat) => {
                const Icon = getCategoryIcon(cat.id);
                const isSelected = selectedCategory === cat.id;
                const count = cat.id === 'mock' ? mockRoutes.length : endpoints.filter(e => e.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center justify-between gap-1.5 rounded-xl border p-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500/60 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-white shadow-sm ring-1 ring-indigo-500/30 font-bold'
                        : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg ${
                        cat.id === 'ai' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                        cat.id === 'tools' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        cat.id === 'data' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' :
                        cat.id === 'keys' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        cat.id === 'system' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                        'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="text-[11px] font-semibold truncate">
                        {lang === 'id' ? cat.nameId : cat.nameEn}
                      </span>
                    </div>
                    <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {methods.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMethod(m)}
                className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition ${
                  selectedMethod === m
                    ? 'bg-slate-800 dark:bg-slate-700 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Categories / Groups */}
        {CATEGORIES.map((cat) => {
          const catEndpoints = filteredEndpoints.filter((ep) => ep.category === cat.id);
          if (catEndpoints.length === 0) return null;
          const Icon = getCategoryIcon(cat.id);

          return (
            <div key={cat.id} className="space-y-1">
              <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{lang === 'id' ? cat.nameId : cat.nameEn}</span>
                </div>
                <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {catEndpoints.length}
                </span>
              </div>

              <div className="space-y-1">
                {catEndpoints.map((ep) => {
                  const isSelected = selectedEndpoint?.id === ep.id && !selectedMockRoute;
                  const reqTier = endpointTiers?.[ep.path] || 'Free';
                  return (
                    <button
                      key={ep.id}
                      onClick={() => onSelectEndpoint(ep)}
                      className={`group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all ${
                        isSelected
                          ? 'border border-indigo-500/60 bg-indigo-50/90 dark:bg-indigo-950/80 text-indigo-950 dark:text-white shadow-sm'
                          : 'border border-transparent text-slate-800 dark:text-slate-200 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/90'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight ${getMethodBadgeClass(
                            ep.method
                          )}`}
                        >
                          {ep.method}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-cyan-300">
                              {lang === 'id' ? ep.nameId : ep.name}
                            </p>
                            {reqTier !== 'Free' && (
                              <span
                                className={`rounded px-1.5 py-[1px] text-[8px] font-black uppercase tracking-wider ${
                                  reqTier === 'Pro'
                                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40'
                                    : reqTier === 'Developer'
                                    ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40'
                                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                {reqTier === 'Developer' ? 'DEV' : reqTier === 'Enterprise' ? 'ENT' : reqTier}
                              </span>
                            )}
                          </div>
                          <p className="truncate font-mono text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                            {ep.path}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 transition ${
                          isSelected ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5' : 'text-slate-400 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Custom Mock Endpoints Section */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 space-y-1">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              <Database className="h-3.5 w-3.5" />
              <span>{lang === 'id' ? 'Mock API Kustom' : 'Custom Mock Routes'}</span>
            </div>
            <button
              onClick={onOpenMockBuilder}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              title="Create new Mock Route"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>{lang === 'id' ? 'Buat' : 'New'}</span>
            </button>
          </div>

          {filteredMockRoutes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 p-3 text-center">
              <p className="text-[11px] text-slate-600 dark:text-slate-500 font-medium">
                {mockRoutes.length === 0
                  ? (lang === 'id' ? 'Belum ada mock endpoint kustom.' : 'No custom mock endpoints yet.')
                  : (lang === 'id' ? 'Tidak ada mock route yang sesuai filter.' : 'No mock routes matching filter.')}
              </p>
              {mockRoutes.length === 0 && (
                <button
                  onClick={onOpenMockBuilder}
                  className="mt-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {lang === 'id' ? '+ Buat Mock Endpoint' : '+ Create Mock Endpoint'}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredMockRoutes.map((mock) => {
                const isSelected = selectedMockRoute?.id === mock.id;
                return (
                  <button
                    key={mock.id}
                    onClick={() => onSelectMockRoute(mock)}
                    className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-all ${
                      isSelected
                        ? 'border border-cyan-500/50 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-950 dark:text-white shadow-sm'
                        : 'border border-transparent text-slate-800 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span
                        className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight ${getMethodBadgeClass(
                          mock.method
                        )}`}
                      >
                        {mock.method}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs text-cyan-800 dark:text-cyan-300 group-hover:text-cyan-900 dark:group-hover:text-cyan-200 font-bold">
                          /api/m/{mock.path}
                        </p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-500 font-mono font-medium">Status: {mock.status} OK</p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-3.5 w-3.5 shrink-0 transition ${
                        isSelected ? 'text-cyan-600 dark:text-cyan-400 translate-x-0.5' : 'text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
