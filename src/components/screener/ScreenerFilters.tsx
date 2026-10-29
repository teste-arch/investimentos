import React, { useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  RotateCcw,
  PlusCircle,
  Settings2,
  Layers,
  ChevronDown,
  ChevronUp,
  Globe,
} from 'lucide-react';
import type { ApiUsageStats, MarketParameters } from '../../services/api';

interface ScreenerFiltersProps {
  market: string;
  onMarketChange: (val: string) => void;
  ranking: string;
  onRankingChange: (val: string) => void;
  search: string;
  onSearchChange: (val: string) => void;

  minPe: number | '';
  onMinPeChange: (val: number | '') => void;
  maxPe: number | '';
  onMaxPeChange: (val: number | '') => void;
  maxDlEbitda: number | '';
  onMaxDlEbitdaChange: (val: number | '') => void;
  minRoe: number | '';
  onMinRoeChange: (val: number | '') => void;
  minLiquidity: number | '';
  onMinLiquidityChange: (val: number | '') => void;
  excludeFinancials: boolean;
  onExcludeFinancialsChange: (val: boolean) => void;

  onResetFilters: () => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
  onClearExamples?: () => void;
  exampleCount?: number;

  stats?: ApiUsageStats;
  marketParams?: MarketParameters;
  totalCount: number;
}

export const ScreenerFilters: React.FC<ScreenerFiltersProps> = ({
  market,
  onMarketChange,
  ranking,
  onRankingChange,
  search,
  onSearchChange,
  minPe,
  onMinPeChange,
  maxPe,
  onMaxPeChange,
  maxDlEbitda,
  onMaxDlEbitdaChange,
  minRoe,
  onMinRoeChange,
  minLiquidity,
  onMinLiquidityChange,
  excludeFinancials,
  onExcludeFinancialsChange,
  onResetFilters,
  onRefreshAll,
  isRefreshing,
  onOpenAddModal,
  onOpenSettingsModal,
  onClearExamples,
  exampleCount = 0,
  stats,
  totalCount,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const rankingOptions = [
    { id: 'combined', label: '⭐ Ranking Geral (Média de Tetos)' },
    { id: 'bazin', label: '💰 Bazin (Foco Dividendos)' },
    { id: 'graham', label: '📐 Graham (Valor Intrínseco)' },
    { id: 'lynch', label: '🚀 Peter Lynch (PEG Ratio)' },
    { id: 'greenblatt', label: '✨ Greenblatt (Fórmula Mágica)' },
  ];

  const marketOptions = [
    { id: 'ALL', label: 'Todos os Mercados', icon: <Globe className="h-3.5 w-3.5" /> },
    { id: 'B3', label: '🇧🇷 B3 Brasil' },
    { id: 'US', label: '🇺🇸 EUA Nasdaq/NYSE' },
  ];

  return (
    <div className="space-y-3">
      {/* Top Header / Actions Bar matching Image 1 & 3 */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Visão do Screener
            </span>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-zinc-200 border border-white/10">
            {totalCount} empresas monitoradas
          </span>

          {/* API Daily Usage Stats */}
          {stats && (
            <div className="hidden md:flex items-center gap-3 text-[11px] text-zinc-400 border-l border-white/10 pl-3">
              <span>Consumo da API:</span>
              <span className="font-mono text-zinc-300">
                B3: {stats.brapiRequestsToday}/{stats.brapiLimit}
              </span>
              <span>•</span>
              <span className="font-mono text-zinc-300">
                EUA: {stats.fmpRequestsToday}/{stats.fmpLimit}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.08] transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-emerald-400 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            {isRefreshing ? 'Atualizando...' : 'Atualizar Cotações'}
          </button>

          {exampleCount > 0 && onClearExamples && (
            <button
              type="button"
              onClick={onClearExamples}
              title="Remover ações que possuem apenas dados de exemplo pré-cadastrados"
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpar Exemplos ({exampleCount})
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-white text-zinc-900 px-3.5 py-1.5 text-xs font-bold shadow-xs hover:bg-zinc-200 transition-all active:scale-95"
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-600" />
            + Adicionar Ticker
          </button>

          <button
            type="button"
            onClick={onOpenSettingsModal}
            title="Configurações de Mercado e Provedores"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Filter Controls matching Image 2 (Market Overview) & Image 3 (Recent transactions) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* Search Bar */}
        <div className="sm:col-span-5 relative text-left">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por ticker, empresa ou setor..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#12141d] py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-400 transition-colors focus:border-white/30 focus:outline-hidden focus:ring-1 focus:ring-white/20"
          />
        </div>

        {/* Market Selector */}
        <div className="sm:col-span-3 text-left">
          <select
            value={market}
            onChange={(e) => onMarketChange(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#12141d] py-2 px-3 text-xs font-semibold text-zinc-200 transition-colors focus:border-white/30 focus:outline-hidden focus:ring-1 focus:ring-white/20 cursor-pointer"
          >
            {marketOptions.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#12141d] text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ranking Criteria Selector */}
        <div className="sm:col-span-3 text-left">
          <select
            value={ranking}
            onChange={(e) => onRankingChange(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#12141d] py-2 px-3 text-xs font-bold text-white transition-colors focus:border-white/30 focus:outline-hidden focus:ring-1 focus:ring-white/20 cursor-pointer"
          >
            {rankingOptions.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#12141d] text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Filters Button */}
        <div className="sm:col-span-1">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            title="Filtros Fundamentalistas Avançados"
            className={`flex w-full h-full items-center justify-center rounded-xl border py-2 px-2 text-xs font-semibold transition-all ${
              showAdvancedFilters
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-white/[0.08] bg-[#12141d] text-zinc-300 hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            {showAdvancedFilters ? (
              <ChevronUp className="h-3.5 w-3.5 ml-1" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Advanced Quantitative Filters Drawer */}
      {showAdvancedFilters && (
        <div className="glass-card rounded-2xl p-4 text-left transition-all space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Critérios Quantitativos de Corte
              </span>
            </div>
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Restaurar Padrões
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* P/L Min e Max */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
                P/L (Mín e Máx)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={minPe}
                  onChange={(e) =>
                    onMinPeChange(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="Min (3)"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-xs text-white focus:border-white/30 focus:outline-hidden"
                />
                <span className="text-xs text-zinc-400">a</span>
                <input
                  type="number"
                  step="0.5"
                  value={maxPe}
                  onChange={(e) =>
                    onMaxPeChange(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="Máx (15)"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-xs text-white focus:border-white/30 focus:outline-hidden"
                />
              </div>
            </div>

            {/* DL / EBITDA Máximo */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
                Dívida Líq / EBITDA Máx
              </label>
              <input
                type="number"
                step="0.5"
                value={maxDlEbitda}
                onChange={(e) =>
                  onMaxDlEbitdaChange(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="Máx (5.0x)"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-xs text-white focus:border-white/30 focus:outline-hidden"
              />
            </div>

            {/* ROE Mínimo */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
                ROE Mínimo (%)
              </label>
              <input
                type="number"
                step="1"
                value={minRoe}
                onChange={(e) =>
                  onMinRoeChange(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="Mín (10%)"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-xs text-white focus:border-white/30 focus:outline-hidden"
              />
            </div>

            {/* Liquidez Diária Mínima */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
                Liquidez Mínima Diária
              </label>
              <select
                value={minLiquidity}
                onChange={(e) =>
                  onMinLiquidityChange(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full rounded-lg border border-white/[0.08] bg-[#12141d] px-2.5 py-1.5 text-xs text-white focus:border-white/30 focus:outline-hidden"
              >
                <option value="" className="bg-[#12141d]">Qualquer liquidez</option>
                <option value="1000000" className="bg-[#12141d]">Acima de 1 Milhão</option>
                <option value="10000000" className="bg-[#12141d]">Acima de 10 Milhões</option>
                <option value="50000000" className="bg-[#12141d]">Acima de 50 Milhões</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-white/[0.06] pt-2.5">
            <input
              type="checkbox"
              id="exclude-financials"
              checked={excludeFinancials}
              onChange={(e) => onExcludeFinancialsChange(e.target.checked)}
              className="h-4 w-4 rounded-sm border-white/20 bg-white/5 text-emerald-500 focus:ring-0 focus:outline-hidden cursor-pointer"
            />
            <label
              htmlFor="exclude-financials"
              className="text-xs font-medium text-zinc-300 cursor-pointer"
            >
              Excluir bancos, seguradoras e financeiras (Regra Joel Greenblatt)
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
