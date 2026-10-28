import React from 'react';
import { Sun, Moon, AlertCircle, TrendingUp, Lock } from 'lucide-react';
import type { Currency } from '../types/valuation';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  isProtected?: boolean;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  currency,
  onCurrencyChange,
  isProtected,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors">
      {/* Aviso Legal Obrigatório (Banner de Topo) */}
      <div className="bg-amber-500/10 px-4 py-1.5 text-center text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-b border-amber-500/20">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Ferramenta de estudo, não é recomendação de investimento.</span>
        </div>
      </div>

      <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Screener de Valuation
              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                B3 & EUA
              </span>
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
              Preço Teto, Rankings e Calculadoras Fundamentalistas
            </p>
          </div>
        </div>

        {/* Controls: Moeda, Dark Mode & Lock */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => onCurrencyChange('BRL')}
              className={`rounded-md px-2 py-1 text-xs font-bold transition-all ${
                currency === 'BRL'
                  ? 'bg-white text-emerald-700 shadow-2xs dark:bg-slate-800 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              R$ BRL
            </button>
            <button
              type="button"
              onClick={() => onCurrencyChange('USD')}
              className={`rounded-md px-2 py-1 text-xs font-bold transition-all ${
                currency === 'USD'
                  ? 'bg-white text-emerald-700 shadow-2xs dark:bg-slate-800 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* Botão de Bloquear Sessão */}
          {isProtected && onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Bloquear sessão com senha"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-2xs transition-colors hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
            >
              <Lock className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
