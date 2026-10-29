import React from 'react';
import {
  BarChart3,
  Menu,
  RefreshCw,
  Sun,
  Moon,
  Lock,
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

const tabTitles: Record<CalculatorTab, string> = {
  screener: 'Reports',
  comparador: 'Comparador de Tetos',
  bazin: 'Décio Bazin (6%)',
  graham: 'Benjamin Graham (LPA × VPA)',
  lynch: 'Peter Lynch (PEG)',
  greenblatt: 'Joel Greenblatt (Fórmula Mágica)',
  dcf: 'DCF Simplificado',
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
  return (
    <header className="w-full px-6 pt-5 pb-2 flex items-center justify-between select-none">
      {/* Left: Leadwave Report Icon + Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Abrir menu"
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-[#18181b] text-zinc-400 hover:text-white"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <BarChart3 className="h-4 w-4 text-zinc-200" />
          <h1 className="text-base font-semibold text-white tracking-tight">
            {tabTitles[activeTab] || 'Reports'}
          </h1>
        </div>
      </div>

      {/* Right Controls: Minimalist Currency, Refresh, Dark Mode, Lock */}
      <div className="flex items-center gap-2">
        {onRefreshAll && (
          <button
            type="button"
            onClick={onRefreshAll}
            disabled={isRefreshing}
            title="Atualizar cotações"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* Currency Switcher */}
        <div className="flex items-center rounded-lg bg-[#18181b] border border-[#27272a] p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => onCurrencyChange('BRL')}
            className={`rounded-md px-2 py-1 text-xs transition-colors ${
              currency === 'BRL'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            BRL
          </button>
          <button
            type="button"
            onClick={() => onCurrencyChange('USD')}
            className={`rounded-md px-2 py-1 text-xs transition-colors ${
              currency === 'USD'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            USD
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label="Alternar tema"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white transition-colors"
        >
          {darkMode ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-zinc-400" />
          )}
        </button>

        {/* Lock Session */}
        {isProtected && onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Bloquear sessão"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-rose-400 transition-colors"
          >
            <Lock className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
