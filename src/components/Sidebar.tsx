import React, { useState } from 'react';
import type { CalculatorTab } from '../types/valuation';
import {
  BarChart3,
  ListOrdered,
  Scale,
  Coins,
  Calculator,
  TrendingUp,
  Sparkles,
  Layers,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Lock,
  Star,
  PanelLeftClose,
  PanelLeft,
  X,
  Globe,
  Building,
} from 'lucide-react';

interface SidebarProps {
  activeTab: CalculatorTab;
  onTabChange: (tab: CalculatorTab) => void;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
  isProtected?: boolean;
  onLogout?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  totalStocksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenSettingsModal,
  isProtected,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  totalStocksCount,
}) => {
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [recordsOpen, setRecordsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const primaryNav = [
    {
      id: 'screener' as CalculatorTab,
      label: 'Rankings & Screener',
      icon: <BarChart3 className="h-4 w-4" />,
      badge: totalStocksCount ? `${totalStocksCount}` : undefined,
    },
    {
      id: 'comparador' as CalculatorTab,
      label: 'Comparador de Tetos',
      icon: <Scale className="h-4 w-4" />,
    },
    {
      id: 'bazin' as CalculatorTab,
      label: 'Décio Bazin',
      icon: <Coins className="h-4 w-4" />,
    },
    {
      id: 'graham' as CalculatorTab,
      label: 'Benjamin Graham',
      icon: <Calculator className="h-4 w-4" />,
    },
    {
      id: 'lynch' as CalculatorTab,
      label: 'Peter Lynch',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      id: 'greenblatt' as CalculatorTab,
      label: 'Joel Greenblatt',
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: 'dcf' as CalculatorTab,
      label: 'DCF Simplificado',
      icon: <Layers className="h-4 w-4" />,
    },
  ];

  const favorites = [
    { label: 'Maiores Dividendos B3', targetTab: 'bazin' as CalculatorTab },
    { label: 'Oportunidades Graham', targetTab: 'graham' as CalculatorTab },
    { label: 'Fórmula Mágica Greenblatt', targetTab: 'greenblatt' as CalculatorTab },
    { label: 'Small Caps Crescimento', targetTab: 'lynch' as CalculatorTab },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto leadwave-sidebar text-zinc-400 select-none p-3.5">
      <div className="space-y-4">
        {/* Brand Header matching Leadwave */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            {/* Leadwave-style logo mark */}
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-white">
              <svg
                className="h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            {!isCollapsed && (
              <span className="text-sm font-semibold text-white tracking-tight">
                Leadwave
              </span>
            )}
          </div>

          {/* Collapse Icon */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Input matching Leadwave */}
        {!isCollapsed && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything"
              className="w-full rounded-lg bg-[#18181b] border border-[#27272a] py-1.5 pl-8 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500 transition-colors"
            />
          </div>
        )}

        {/* Primary Navigation List */}
        <div className="space-y-0.5">
          {primaryNav
            .filter((item) =>
              searchQuery
                ? item.label.toLowerCase().includes(searchQuery.toLowerCase())
                : true
            )
            .map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#202024] text-white'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]'
                  } ${isCollapsed ? 'justify-center px-1' : ''}`}
                >
                  <span
                    className={`shrink-0 ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <div className="flex flex-1 items-center justify-between overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[11px] font-mono text-zinc-500">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
        </div>

        {/* Collapsible: Favorites (matching Leadwave) */}
        {!isCollapsed && (
          <div className="pt-2 space-y-1">
            <button
              type="button"
              onClick={() => setFavoritesOpen(!favoritesOpen)}
              className="flex w-full items-center justify-between px-2.5 py-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                {favoritesOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <span>Favorites</span>
              </div>
            </button>

            {favoritesOpen && (
              <div className="space-y-0.5 pl-2">
                {favorites.map((fav) => (
                  <button
                    key={fav.label}
                    type="button"
                    onClick={() => {
                      onTabChange(fav.targetTab);
                      onCloseMobile();
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b] transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ListOrdered className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{fav.label}</span>
                    </div>
                    <Star className="h-3 w-3 text-orange-500 fill-orange-500 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collapsible: Records (matching Leadwave) */}
        {!isCollapsed && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setRecordsOpen(!recordsOpen)}
              className="flex w-full items-center justify-between px-2.5 py-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                {recordsOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <span>Mercados</span>
              </div>
            </button>

            {recordsOpen && (
              <div className="space-y-0.5 pl-2">
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('screener');
                    onCloseMobile();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b] transition-colors"
                >
                  <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-cyan-500/20 text-cyan-400">
                    <Building className="h-2.5 w-2.5" />
                  </div>
                  <span>B3 (Brasil)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onTabChange('screener');
                    onCloseMobile();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b] transition-colors"
                >
                  <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-blue-500/20 text-blue-400">
                    <Globe className="h-2.5 w-2.5" />
                  </div>
                  <span>EUA (Nasdaq/NYSE)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Actions matching Leadwave minimalism */}
      <div className="pt-4 border-t border-[#1c1c20] space-y-1">
        <button
          type="button"
          onClick={() => {
            onOpenAddModal();
            onCloseMobile();
          }}
          title={isCollapsed ? 'Adicionar Ticker' : undefined}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-[#18181b] transition-colors ${
            isCollapsed ? 'justify-center px-1' : ''
          }`}
        >
          <Plus className="h-4 w-4 text-zinc-400" />
          {!isCollapsed && <span>Adicionar Ticker</span>}
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenSettingsModal();
            onCloseMobile();
          }}
          title={isCollapsed ? 'Configurações' : undefined}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-[#18181b] transition-colors ${
            isCollapsed ? 'justify-center px-1' : ''
          }`}
        >
          <Settings className="h-4 w-4 text-zinc-400" />
          {!isCollapsed && <span>Configurações</span>}
        </button>

        {isProtected && onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title={isCollapsed ? 'Bloquear Sessão' : undefined}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ${
              isCollapsed ? 'justify-center px-1' : ''
            }`}
          >
            <Lock className="h-4 w-4" />
            {!isCollapsed && <span>Bloquear</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ${
          isCollapsed ? 'w-16' : 'w-60'
        } h-screen sticky top-0 z-30`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 w-64 max-w-[85vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
