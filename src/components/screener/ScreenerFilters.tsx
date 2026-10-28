import React, { useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  RotateCcw,
  PlusCircle,
  Settings2,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
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
    { id: 'combined', label: '⭐ Ranking Combinado (Média)' },
    { id: 'bazin', label: '💰 Bazin (Dividendos)' },
    { id: 'graham', label: '📐 Graham (LPA × VPA)' },
    { id: 'lynch', label: '🚀 Peter Lynch (Score/PEG)' },
    { id: 'greenblatt', label: '✨ Greenblatt (Fórmula Mágica)' },
  ];

  return (
    <div className="space-y-4">
      {/* Barra de Status e Contadores de API */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-left">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Ativos Monitorados:
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            {totalCount} empresas
          </span>

          {/* Contador de Requisições de API */}
          {stats && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 border-l border-slate-200 pl-3 dark:border-slate-800">
              <span>Uso de API hoje:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                B3 (brapi): {stats.brapiRequestsToday}/{stats.brapiLimit}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                EUA (FMP): {stats.fmpRequestsToday}/{stats.fmpLimit}
              </span>
            </div>
          )}
        </div>

        {/* Botões de Ação do Topo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar Cotações'}
          </button>

          {exampleCount > 0 && onClearExamples && (
            <button
              type="button"
              onClick={onClearExamples}
              title="Remover ações que possuem apenas dados de exemplo pré-cadastrados"
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 shadow-2xs hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Remover Exemplos ({exampleCount})
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            + Adicionar Ticker
          </button>

          <button
            type="button"
            onClick={onOpenSettingsModal}
            title="Configurações de Mercado e Provedores"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Controles Principais: Busca, Mercado e Ranking */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Barra de Pesquisa */}
        <div className="sm:col-span-4 relative text-left">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por ticker, empresa ou setor..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Seletor de Mercado */}
        <div className="sm:col-span-3 text-left">
          <select
            value={market}
            onChange={(e) => onMarketChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">🌐 Todos os Mercados (B3 + EUA)</option>
            <option value="B3">🇧🇷 B3 (Bolsa Brasileira)</option>
            <option value="US">🇺🇸 EUA (Bolsa Americana)</option>
          </select>
        </div>

        {/* Seletor de Ranking */}
        <div className="sm:col-span-3 text-left">
          <select
            value={ranking}
            onChange={(e) => onRankingChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900"
          >
            {rankingOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle de Filtros Avançados */}
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex w-full items-center justify-center gap-1.5 rounded-xl border py-2 px-3 text-xs font-semibold transition-all shadow-2xs ${
              showAdvancedFilters
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filtros</span>
            {showAdvancedFilters ? (
              <ChevronUp className="h-3.5 w-3.5 ml-auto" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 ml-auto" />
            )}
          </button>
        </div>
      </div>

      {/* Gaveta de Filtros Quantitativos Editáveis */}
      {showAdvancedFilters && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-left transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Filtros Quantitativos Fundamentalistas
              </span>
            </div>
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              <RotateCcw className="h-3 w-3" /> Restaurar Padrões
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* P/L Min e Max */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
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
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <span className="text-xs text-slate-400">a</span>
                <input
                  type="number"
                  step="0.5"
                  value={maxPe}
                  onChange={(e) =>
                    onMaxPeChange(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="Máx (15)"
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* DL / EBITDA Máximo */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
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
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* ROE Mínimo */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
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
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Liquidez Diária Mínima */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Liquidez Mínima Diária
              </label>
              <select
                value={minLiquidity}
                onChange={(e) =>
                  onMinLiquidityChange(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">Qualquer liquidez</option>
                <option value="1000000">Acima de 1 Milhão</option>
                <option value="10000000">Acima de 10 Milhões</option>
                <option value="50000000">Acima de 50 Milhões</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
            <input
              type="checkbox"
              id="exclude-financials"
              checked={excludeFinancials}
              onChange={(e) => onExcludeFinancialsChange(e.target.checked)}
              className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label
              htmlFor="exclude-financials"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Excluir bancos, seguradoras e financeiras (Regra Joel Greenblatt)
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
