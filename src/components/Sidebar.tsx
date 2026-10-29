import React from 'react';
import type { CalculatorTab } from '../types/valuation';
import {
  ListOrdered,
  Coins,
  Calculator,
  TrendingUp,
  Sparkles,
  Layers,
  Scale,
  PlusCircle,
  Settings2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Shield,
  Search,
  Activity,
  X,
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
  const navSections = [
    {
      group: 'DASHBOARDS',
      items: [
        {
          id: 'screener' as CalculatorTab,
          label: 'Rankings & Screener',
          sublabel: 'Tabela & Dados Automáticos',
          icon: <ListOrdered className="h-4 w-4" />,
          badge: 'Live',
        },
        {
          id: 'comparador' as CalculatorTab,
          label: 'Comparador de Tetos',
          sublabel: 'Média de Todos os Métodos',
          icon: <Scale className="h-4 w-4" />,
        },
      ],
    },
    {
      group: 'MÉTODOS FUNDAMENTALISTAS',
      items: [
        {
          id: 'bazin' as CalculatorTab,
          label: 'Décio Bazin',
          sublabel: 'Dividendos Mínimos (6%)',
          icon: <Coins className="h-4 w-4" />,
        },
        {
          id: 'graham' as CalculatorTab,
          label: 'Benjamin Graham',
          sublabel: 'Fórmula LPA × VPA (22,5)',
          icon: <Calculator className="h-4 w-4" />,
        },
        {
          id: 'lynch' as CalculatorTab,
          label: 'Peter Lynch',
          sublabel: 'PEG Ratio & Crescimento',
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          id: 'greenblatt' as CalculatorTab,
          label: 'Joel Greenblatt',
          sublabel: 'Fórmula Mágica (EY & ROIC)',
          icon: <Sparkles className="h-4 w-4" />,
        },
        {
          id: 'dcf' as CalculatorTab,
          label: 'DCF Simplificado',
          sublabel: 'Fluxo Caixa Descontado 5a',
          icon: <Layers className="h-4 w-4" />,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto bg-[#0c0d14] text-slate-300 border-r border-white/[0.06] select-none">
      {/* Top Brand & Profile */}
      <div className="p-4 space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/15 via-white/5 to-white/0 border border-white/15 text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
            </div>
            {!isCollapsed && (
              <div className="text-left overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-white">
                    Valuation Screener
                  </span>
                  <span className="rounded bg-white/10 px-1 py-0.2 text-[9px] font-semibold tracking-wide text-zinc-300">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  B3 & Mercado Americano
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Fechar menu lateral"
            className="lg:hidden flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User / Investor Profile Snippet (Like Image 1 & 2) */}
        {!isCollapsed && (
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 transition-all hover:border-white/15">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
              IF
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0c0d14]" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-xs font-semibold text-white truncate">
                Investidor Pro
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>{totalStocksCount} ações monitoradas</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Search Bar (Like Image 1 & 3) */}
        {!isCollapsed && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <div className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] py-2 pl-9 pr-2.5 text-xs text-zinc-400">
              <span>Navegar opções...</span>
              <kbd className="rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                ⌘K
              </kbd>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="space-y-6 pt-2">
          {navSections.map((section) => (
            <div key={section.group} className="space-y-1.5 text-left">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                  {section.group}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
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
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-white/[0.10] text-white shadow-[0_0_15px_rgba(255,255,255,0.04)] border border-white/15'
                          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white border border-transparent'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      {/* Active Notch Indicator on Right (Like Image 2) */}
                      {isActive && (
                        <span className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      )}

                      <span
                        className={`transition-colors shrink-0 ${
                          isActive
                            ? 'text-emerald-400'
                            : 'text-zinc-400 group-hover:text-zinc-200'
                        }`}
                      >
                        {item.icon}
                      </span>

                      {!isCollapsed && (
                        <div className="flex flex-1 items-center justify-between overflow-hidden text-left">
                          <div className="truncate">
                            <div className="font-semibold text-white truncate leading-tight">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate">
                              {item.sublabel}
                            </div>
                          </div>
                          {item.badge && (
                            <span className="ml-1.5 shrink-0 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Actions Section */}
          <div className="space-y-1.5 text-left">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                AÇÕES RÁPIDAS
              </div>
            )}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onOpenAddModal();
                  onCloseMobile();
                }}
                title={isCollapsed ? 'Adicionar Ticker' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-all border border-transparent ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
              >
                <PlusCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                {!isCollapsed && <span>+ Adicionar Ticker</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenSettingsModal();
                  onCloseMobile();
                }}
                title={isCollapsed ? 'Parâmetros & Provedores' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-all border border-transparent ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
              >
                <Settings2 className="h-4 w-4 text-zinc-400 shrink-0" />
                {!isCollapsed && <span>Parâmetros de Mercado</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info & Logout */}
      <div className="p-3 border-t border-white/[0.06] space-y-2">
        {!isCollapsed && (
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-2.5 text-left space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-emerald-400" />
                Status das Fontes
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">100% OK</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              brapi (B3) & FMP (EUA) operacionais com cache inteligente.
            </p>
          </div>
        )}

        {isProtected && onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Bloquear sessão"
            className={`flex w-full items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <Lock className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span>Bloquear Sessão</span>}
          </button>
        )}

        {!isCollapsed && (
          <div className="flex items-center justify-between text-[9px] text-zinc-400 px-1 pt-1">
            <span>Valuation v2.0</span>
            <span className="flex items-center gap-1">
              <Shield className="h-2.5 w-2.5 text-zinc-400" />
              Uso Pessoal
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } h-screen sticky top-0 z-30`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 w-72 max-w-[85vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
