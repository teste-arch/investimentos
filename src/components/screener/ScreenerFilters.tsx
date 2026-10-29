import React, { useState } from 'react';
import {
  Search,
  Plus,
  Users,
  ChevronDown,
  Calendar,
  Send,
  ArrowUpRight,
  RotateCcw,
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
  onOpenAddModal,
  totalCount,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <div className="space-y-3">
      {/* Leadwave Title: Recent transactions • 202,123 active subscribers */}
      <div className="flex items-center justify-between text-left px-1">
        <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
          <Users className="h-4 w-4 text-zinc-400" />
          <span>Recent transactions • {totalCount > 0 ? (totalCount * 5945).toLocaleString('en-US') : '202,123'} active subscribers</span>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 rounded-lg bg-[#18181b] border border-[#27272a] px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-zinc-400" />
          <span>Add Ticker</span>
        </button>
      </div>

      {/* Filter Row matching Leadwave: Search a name... + Pills */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search input pill */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search a name..."
            className="w-full rounded-lg bg-[#18181b] border border-[#27272a] py-1.5 pl-8 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Leadwave Filter Pills */}
        <div className="relative">
          <select
            value={market}
            onChange={(e) => onMarketChange(e.target.value)}
            className="appearance-none rounded-lg bg-[#18181b] border border-[#27272a] py-1.5 pl-7 pr-7 text-xs text-zinc-300 hover:text-white cursor-pointer focus:outline-hidden"
          >
            <option value="ALL">Signup Date: All Markets</option>
            <option value="B3">B3 (Brasil)</option>
            <option value="US">US (Wall St)</option>
          </select>
          <Calendar className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3 w-3 text-zinc-500" />
        </div>

        <div className="relative">
          <select
            value={ranking}
            onChange={(e) => onRankingChange(e.target.value)}
            className="appearance-none rounded-lg bg-[#18181b] border border-[#27272a] py-1.5 pl-7 pr-7 text-xs text-zinc-300 hover:text-white cursor-pointer focus:outline-hidden"
          >
            <option value="combined">Status: Combined Rank</option>
            <option value="bazin">Status: Bazin (Dividends)</option>
            <option value="graham">Status: Graham (LPA × VPA)</option>
            <option value="lynch">Status: Peter Lynch</option>
            <option value="greenblatt">Status: Greenblatt</option>
          </select>
          <Send className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3 w-3 text-zinc-500" />
        </div>

        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-1.5 rounded-lg border py-1.5 px-3 text-xs transition-colors ${
            showAdvancedFilters
              ? 'bg-zinc-800 border-zinc-600 text-white'
              : 'bg-[#18181b] border-[#27272a] text-zinc-300 hover:text-white'
          }`}
        >
          <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
          <span>Source</span>
          <ChevronDown className="h-3 w-3 text-zinc-500" />
        </button>
      </div>

      {/* Advanced Quantitative Filters Drawer */}
      {showAdvancedFilters && (
        <div className="leadwave-card p-4 text-left space-y-3 mt-2">
          <div className="flex items-center justify-between border-b border-[#202024] pb-2">
            <span className="text-xs font-medium text-zinc-300">
              Quantitative Filters
            </span>
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-medium uppercase text-zinc-500">
                P/L (Min & Max)
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  step="0.5"
                  value={minPe}
                  onChange={(e) =>
                    onMinPeChange(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="3"
                  className="w-full rounded-md bg-[#18181b] border border-[#27272a] px-2 py-1 text-xs text-white"
                />
                <span className="text-xs text-zinc-600">to</span>
                <input
                  type="number"
                  step="0.5"
                  value={maxPe}
                  onChange={(e) =>
                    onMaxPeChange(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="15"
                  className="w-full rounded-md bg-[#18181b] border border-[#27272a] px-2 py-1 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-medium uppercase text-zinc-500">
                Max Net Debt / EBITDA
              </label>
              <input
                type="number"
                step="0.5"
                value={maxDlEbitda}
                onChange={(e) =>
                  onMaxDlEbitdaChange(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="5.0x"
                className="w-full mt-1 rounded-md bg-[#18181b] border border-[#27272a] px-2 py-1 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-medium uppercase text-zinc-500">
                Min ROE (%)
              </label>
              <input
                type="number"
                step="1"
                value={minRoe}
                onChange={(e) =>
                  onMinRoeChange(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="10%"
                className="w-full mt-1 rounded-md bg-[#18181b] border border-[#27272a] px-2 py-1 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-medium uppercase text-zinc-500">
                Min Daily Liquidity
              </label>
              <select
                value={minLiquidity}
                onChange={(e) =>
                  onMinLiquidityChange(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full mt-1 rounded-md bg-[#18181b] border border-[#27272a] px-2 py-1 text-xs text-white"
              >
                <option value="">Any</option>
                <option value="1000000">&gt; 1M</option>
                <option value="10000000">&gt; 10M</option>
                <option value="50000000">&gt; 50M</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-[#202024]">
            <input
              type="checkbox"
              id="exclude-financials-mini"
              checked={excludeFinancials}
              onChange={(e) => onExcludeFinancialsChange(e.target.checked)}
              className="h-3.5 w-3.5 rounded-sm border-zinc-700 bg-zinc-900 text-emerald-500"
            />
            <label
              htmlFor="exclude-financials-mini"
              className="text-xs text-zinc-400 cursor-pointer"
            >
              Excluir instituições financeiras (Fórmula Mágica Greenblatt)
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
