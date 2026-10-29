import React from 'react';
import {
  Sun,
  Moon,
  AlertCircle,
  Lock,
  Menu,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import type { Currency, CalculatorTab } from '../types/valuation';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  isProtected?: boolean;
  onLogout?: () => void;
  onOpenMobileMenu?: () => void;
  activeTab: CalculatorTab;
  onRefreshAll?: () => void;
  isRefreshing?: boolean;
}

const tabTitles: Record<CalculatorTab, { breadcrumb: string; title: string }> = {
  screener: { breadcrumb: 'Rankings & Screener', title: 'Visão Geral do Mercado' },
  comparador: { breadcrumb: 'Comparador', title: 'Média de Todos os Tetos' },
  bazin: { breadcrumb: 'Método Bazin', title: 'Preço Teto por Dividendos (6%)' },
  graham: { breadcrumb: 'Método Graham', title: 'Fórmula de Benjamin Graham' },
  lynch: { breadcrumb: 'Peter Lynch', title: 'Avaliação por PEG & Crescimento' },
  greenblatt: { breadcrumb: 'Joel Greenblatt', title: 'Fórmula Mágica (EY & ROIC)' },
  dcf: { breadcrumb: 'DCF Simplificado', title: 'Fluxo de Caixa Descontado' },
};

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  currency,
  onCurrencyChange,
  isProtected,
  onLogout,
  onOpenMobileMenu,
  activeTab,
  onRefreshAll,
  isRefreshing = false,
}) => {
  const currentTabInfo = tabTitles[activeTab] || {
    breadcrumb: 'Dashboard',
    title: 'Visão Geral',
  };

  // Mocked/Indicative market tickers matching Image 2 top bar
  const marketTickers = [
    { symbol: 'IBOV', value: '128.450', change: '+0.65%', isUp: true },
    { symbol: 'S&P 500', value: '5.820', change: '+0.32%', isUp: true },
    { symbol: 'USD/BRL', value: 'R$ 5,68', change: '-0.15%', isUp: false },
    { symbol: 'IFIX', value: '3.385', change: '+0.12%', isUp: true },
    { symbol: 'SELIC', value: '10,75% a.a.', change: 'Meta Copom', isNeutral: true },
  ];

  return (
    <header className="sticky top-0 z-20 w-full border-b border-white/[0.06] bg-[#090a0f]/90 backdrop-blur-md transition-colors select-none">
      {/* Top Mini Ticker Tape (Inspired by Image 2 - Live Crypto Updates top ticker bar) */}
      <div className="hidden md:flex items-center justify-between border-b border-white/[0.04] px-4 py-1.5 text-[11px] bg-[#0c0d14]/70 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Mercados ao Vivo</span>
          </div>

          <div className="flex items-center gap-5">
            {marketTickers.map((t) => (
              <div key={t.symbol} className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-400">{t.symbol}</span>
                <span className="font-semibold text-white">{t.value}</span>
                {t.isNeutral ? (
                  <span className="text-[10px] text-zinc-400">{t.change}</span>
                ) : (
                  <span
                    className={`inline-flex items-center text-[10px] font-bold ${
                      t.isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {t.isUp ? (
                      <TrendingUp className="mr-0.5 h-2.5 w-2.5 inline" />
                    ) : (
                      <TrendingDown className="mr-0.5 h-2.5 w-2.5 inline" />
                    )}
                    {t.change}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Small Legal Disclaimer Chip */}
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
          <AlertCircle className="h-3 w-3 text-amber-500/80" />
          <span>Ferramenta de estudo pessoal • Não é recomendação</span>
        </div>
      </div>

      {/* Main Header Content Bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Mobile Menu + Breadcrumbs & Status */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Abrir menu"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          {/* Breadcrumb Navigation (Like Image 1: Dashboards / Overview & Image 2: Overview / Dashboard) */}
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <span className="hover:text-zinc-200 transition-colors cursor-pointer">
                Dashboards
              </span>
              <ChevronRight className="h-3 w-3 text-zinc-400" />
              <span className="font-semibold text-white">
                {currentTabInfo.breadcrumb}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {currentTabInfo.title}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Dados atualizados
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Currency Switcher, Refresh, Dark Mode, Lock */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          {onRefreshAll && (
            <button
              type="button"
              onClick={onRefreshAll}
              disabled={isRefreshing}
              title="Atualizar todas as cotações agora"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-emerald-400 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
            </button>
          )}

          {/* Currency Switcher (Neutral Glass Pill Style) */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-0.5">
            <button
              type="button"
              onClick={() => onCurrencyChange('BRL')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                currency === 'BRL'
                  ? 'bg-white/15 text-white shadow-xs border border-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              R$ BRL
            </button>
            <button
              type="button"
              onClick={() => onCurrencyChange('USD')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                currency === 'USD'
                  ? 'bg-white/15 text-white shadow-xs border border-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label="Alternar modo claro e escuro"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-zinc-300" />
            )}
          </button>

          {/* Lock Session */}
          {isProtected && onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Bloquear sessão com senha"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
            >
              <Lock className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
