import React from 'react';
import type { ApiStockItem } from '../../services/api';
import { formatCurrency, formatPercent } from '../../utils/valuationCalculators';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Trash2,
  Building2,
  Calculator,
} from 'lucide-react';

interface ScreenerTableProps {
  stocks: ApiStockItem[];
  rankingCriterion: string;
  onRefreshTicker: (ticker: string) => void;
  onRemoveTicker: (ticker: string) => void;
  refreshingTickers: Set<string>;
  onSelectForManualCalc?: (stock: ApiStockItem) => void;
}

export const ScreenerTable: React.FC<ScreenerTableProps> = ({
  stocks,
  rankingCriterion,
  onRefreshTicker,
  onRemoveTicker,
  refreshingTickers,
  onSelectForManualCalc,
}) => {
  if (stocks.length === 0) {
    return (
      <div className="leadwave-card p-12 text-center">
        <Building2 className="mx-auto h-8 w-8 text-zinc-600" />
        <h3 className="mt-3 text-xs font-medium text-zinc-300">
          No records match the current filters
        </h3>
      </div>
    );
  }

  return (
    <div className="leadwave-card overflow-hidden text-left">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          {/* Leadwave Table Header */}
          <thead className="border-b border-[#202024] bg-[#141416] text-[11px] font-medium text-zinc-400">
            <tr>
              <th className="py-3 pl-4 pr-2 w-8">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded-sm border-zinc-700 bg-zinc-900 text-emerald-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3 text-right">Revenue / Price</th>
              <th className="py-3 px-3 text-right">Ceiling Bazin</th>
              <th className="py-3 px-3 text-right">Ceiling Graham</th>
              <th className="py-3 px-3 text-right">Upside</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 pr-4 pl-2 text-center w-20">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#1e1e22]">
            {stocks.map((stock) => {
              const isRefreshing = refreshingTickers.has(stock.ticker);
              const currency = stock.currency || 'BRL';

              let targetUpside = stock.upside;
              if (rankingCriterion === 'bazin' && stock.bazinUpside !== null) {
                targetUpside = stock.bazinUpside;
              } else if (rankingCriterion === 'graham' && stock.grahamUpside !== null) {
                targetUpside = stock.grahamUpside;
              } else if (rankingCriterion === 'lynch' && stock.lynchUpside !== null) {
                targetUpside = stock.lynchUpside;
              }

              const isPositive = targetUpside !== null && (targetUpside || 0) >= 0;

              return (
                <tr
                  key={stock.ticker}
                  className="transition-colors hover:bg-[#1a1a1e]"
                >
                  {/* Selection Checkbox */}
                  <td className="py-3 pl-4 pr-2">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded-sm border-zinc-700 bg-zinc-900 text-emerald-500 cursor-pointer"
                    />
                  </td>

                  {/* Name (Ticker & Company) */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#202024] text-zinc-200 text-xs font-semibold">
                        {stock.ticker.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate text-xs">
                          {stock.ticker}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate max-w-[150px]">
                          {stock.name || stock.ticker}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Revenue / Price */}
                  <td className="py-3 px-3 text-right font-medium text-white whitespace-nowrap">
                    {formatCurrency(stock.price, currency)}
                  </td>

                  {/* Ceiling Bazin */}
                  <td className="py-3 px-3 text-right whitespace-nowrap text-zinc-300">
                    {stock.bazinCeiling !== null && stock.bazinCeiling !== undefined
                      ? formatCurrency(stock.bazinCeiling, currency)
                      : '—'}
                  </td>

                  {/* Ceiling Graham */}
                  <td className="py-3 px-3 text-right whitespace-nowrap text-zinc-300">
                    {stock.grahamCeiling !== null && stock.grahamCeiling !== undefined
                      ? formatCurrency(stock.grahamCeiling, currency)
                      : '—'}
                  </td>

                  {/* Upside */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    {targetUpside !== null && targetUpside !== undefined ? (
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatPercent(targetUpside, 1, true)}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-md ${
                        isPositive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {isPositive ? 'Active' : 'Overvalued'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 pr-4 pl-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      {onSelectForManualCalc && (
                        <button
                          type="button"
                          onClick={() => onSelectForManualCalc(stock)}
                          title="Simular no Comparador"
                          className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          <Calculator className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRefreshTicker(stock.ticker)}
                        disabled={isRefreshing}
                        title="Atualizar ticker"
                        className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveTicker(stock.ticker)}
                        title="Remover ticker"
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
