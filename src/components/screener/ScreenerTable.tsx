import React from 'react';
import type { ApiStockItem } from '../../services/api';
import { formatCurrency, formatPercent } from '../../utils/valuationCalculators';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Trash2,
  Building2,
  Award,
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
      <div className="glass-card rounded-2xl p-12 text-center">
        <Building2 className="mx-auto h-10 w-10 text-zinc-500" />
        <h3 className="mt-3 text-sm font-bold text-white">
          Nenhuma ação encontrada com os filtros selecionados
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          Tente afrouxar os filtros de P/L, ROE ou selecionar "Todos os Mercados".
        </p>
      </div>
    );
  }

  const getRankBadge = (stock: ApiStockItem, idx: number) => {
    let rankNumber: number | null | undefined = null;
    switch (rankingCriterion) {
      case 'bazin':
        rankNumber = stock.rankBazin;
        break;
      case 'graham':
        rankNumber = stock.rankGraham;
        break;
      case 'lynch':
        rankNumber = stock.rankLynch;
        break;
      case 'greenblatt':
        rankNumber = stock.rankGreenblatt;
        break;
      case 'combined':
      default:
        rankNumber = stock.rankCombined;
        break;
    }

    const pos = rankNumber !== null && rankNumber !== undefined ? rankNumber : idx + 1;

    let badgeClass = 'bg-white/[0.06] text-zinc-300 border border-white/[0.08]';
    if (idx === 0) {
      badgeClass = 'bg-amber-400/10 text-amber-300 border border-amber-400/30';
    } else if (idx === 1) {
      badgeClass = 'bg-slate-300/10 text-slate-200 border border-slate-300/30';
    } else if (idx === 2) {
      badgeClass = 'bg-orange-500/10 text-orange-300 border border-orange-500/30';
    }

    return (
      <div className="flex items-center gap-1 font-bold">
        {idx < 3 && <Award className="h-3 w-3 text-amber-400 shrink-0" />}
        <span
          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-lg px-1.5 text-xs font-black ${badgeClass}`}
        >
          #{pos}
        </span>
      </div>
    );
  };

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden text-left shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          {/* Table Header matching Image 2 & 3 */}
          <thead className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="py-3.5 pl-4 pr-2">No</th>
              <th className="py-3.5 px-3">Ticker / Empresa</th>
              <th className="py-3.5 px-3 text-right">Cotação</th>
              <th className="py-3.5 px-3 text-right">Teto Bazin (6%)</th>
              <th className="py-3.5 px-3 text-right">Teto Graham</th>
              <th className="py-3.5 px-3 text-center">Score Lynch</th>
              <th className="py-3.5 px-3 text-center">Greenblatt</th>
              <th className="py-3.5 px-3 text-right">Upside Geral</th>
              <th className="py-3.5 px-3 text-center">Atualização</th>
              <th className="py-3.5 pr-4 pl-2 text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.04]">
            {stocks.map((stock, idx) => {
              const isRefreshing = refreshingTickers.has(stock.ticker);
              const currency = stock.currency || 'BRL';

              // Upside conforme critério ou padrão
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
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  {/* Rank */}
                  <td className="py-3.5 pl-4 pr-2 whitespace-nowrap">
                    {getRankBadge(stock, idx)}
                  </td>

                  {/* Ticker & Nome (Matching Image 2 Coin Name column) */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 text-white font-black text-[11px]">
                        {stock.ticker.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-white text-xs tracking-tight">
                            {stock.ticker}
                          </span>
                          <span className="rounded bg-white/[0.08] px-1 py-0.2 text-[9px] font-semibold text-zinc-300">
                            {stock.market}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate max-w-[160px]">
                          {stock.name || stock.ticker}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cotação Atual */}
                  <td className="py-3.5 px-3 text-right font-bold text-white whitespace-nowrap">
                    {formatCurrency(stock.price, currency)}
                  </td>

                  {/* Teto Bazin */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    {stock.bazinCeiling !== null && stock.bazinCeiling !== undefined ? (
                      <span className="font-semibold text-zinc-200">
                        {formatCurrency(stock.bazinCeiling, currency)}
                      </span>
                    ) : (
                      <span className="text-zinc-500 font-mono">—</span>
                    )}
                  </td>

                  {/* Teto Graham */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    {stock.grahamCeiling !== null && stock.grahamCeiling !== undefined ? (
                      <span className="font-semibold text-zinc-200">
                        {formatCurrency(stock.grahamCeiling, currency)}
                      </span>
                    ) : (
                      <span className="text-zinc-500 font-mono">—</span>
                    )}
                  </td>

                  {/* Score Lynch */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {stock.lynchScore !== null && stock.lynchScore !== undefined ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          stock.lynchScore >= 1.5
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : stock.lynchScore >= 1.0
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                            : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        {stock.lynchScore.toFixed(2)}x
                      </span>
                    ) : (
                      <span className="text-zinc-500 font-mono">—</span>
                    )}
                  </td>

                  {/* Greenblatt Rank */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {stock.rankGreenblatt !== null && stock.rankGreenblatt !== undefined ? (
                      <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-300">
                        #{stock.rankGreenblatt}
                      </span>
                    ) : (
                      <span className="text-zinc-500 font-mono">—</span>
                    )}
                  </td>

                  {/* Upside Geral (Glowing Pill Tag matching Image 2 & 3) */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    {targetUpside !== null && targetUpside !== undefined ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                          isPositive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
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
                      <span className="text-zinc-500 font-mono">—</span>
                    )}
                  </td>

                  {/* Última Atualização */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap text-[11px] text-zinc-400 font-mono">
                    {formatDateTime(stock.quoteUpdatedAt || stock.fundamentalsUpdatedAt)}
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 pr-4 pl-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      {/* Recalcular no comparador */}
                      {onSelectForManualCalc && (
                        <button
                          type="button"
                          onClick={() => onSelectForManualCalc(stock)}
                          title={`Simular valuation de ${stock.ticker}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-all"
                        >
                          <Calculator className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Atualizar cotação individual */}
                      <button
                        type="button"
                        onClick={() => onRefreshTicker(stock.ticker)}
                        disabled={isRefreshing}
                        title={`Atualizar dados de ${stock.ticker}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08] hover:text-emerald-400 transition-all disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                      </button>

                      {/* Remover Ticker */}
                      <button
                        type="button"
                        onClick={() => onRemoveTicker(stock.ticker)}
                        title={`Remover ${stock.ticker}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/20 transition-all"
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
