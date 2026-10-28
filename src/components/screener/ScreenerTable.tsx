import React from 'react';
import type { ApiStockItem } from '../../services/api';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/valuationCalculators';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Building2,
  Calendar,
  Award,
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
}) => {
  if (stocks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
        <Building2 className="mx-auto h-10 w-10 text-slate-400" />
        <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
          Nenhuma ação encontrada com os filtros selecionados
        </h3>
        <p className="mt-1 text-xs text-slate-500">
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

    let badgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    if (idx === 0) {
      badgeClass = 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300';
    } else if (idx === 1) {
      badgeClass = 'bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200';
    } else if (idx === 2) {
      badgeClass = 'bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950/60 dark:text-orange-300';
    }

    return (
      <div className="flex items-center gap-1.5 font-bold">
        {idx < 3 && <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
        <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-black ${badgeClass}`}>
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
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 text-left">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          {/* Cabeçalho da Tabela */}
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
            <tr>
              <th className="py-3 pl-4 pr-2">Rank</th>
              <th className="py-3 px-3">Ticker / Empresa</th>
              <th className="py-3 px-3 text-right">Cotação</th>
              <th className="py-3 px-3 text-right">Teto Bazin</th>
              <th className="py-3 px-3 text-right">Teto Graham</th>
              <th className="py-3 px-3 text-center">Score Lynch</th>
              <th className="py-3 px-3 text-center">Greenblatt</th>
              <th className="py-3 px-3 text-right">Upside Geral</th>
              <th className="py-3 px-3 text-center">Última Atualização</th>
              <th className="py-3 pr-4 pl-2 text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
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

              return (
                <tr
                  key={stock.ticker}
                  className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  {/* Rank */}
                  <td className="py-3.5 pl-4 pr-2 whitespace-nowrap">
                    {getRankBadge(stock, idx)}
                  </td>

                  {/* Ticker & Nome */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {stock.ticker}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                          stock.market === 'US'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {stock.market}
                      </span>
                      {stock.isFinancial && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Banco/Financ.
                        </span>
                      )}
                      {stock.isExampleData ? (
                        <span
                          className="rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          title="Estes valores são ilustrativos pré-cadastrados. Atualize via API para obter cotação e fundamentos reais."
                        >
                          ⚠️ DADO DE EXEMPLO
                        </span>
                      ) : (
                        <span
                          className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          title={`Dados obtidos via API oficial (${stock.dataSource || 'Oficial'})`}
                        >
                          ✓ API OFICIAL
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {stock.name}
                    </div>
                  </td>

                  {/* Cotação */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(stock.price, currency)}
                    </div>
                    {stock.changePercent !== null && (
                      <div
                        className={`text-[10px] font-semibold ${
                          stock.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatPercent(stock.changePercent, 2, true)}
                      </div>
                    )}
                  </td>

                  {/* Teto Bazin */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    {stock.bazinCeiling !== null && stock.bazinCeiling > 0 ? (
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(stock.bazinCeiling, currency)}
                        </div>
                        {stock.bazinUpside !== null && (
                          <div
                            className={`text-[10px] font-semibold ${
                              stock.bazinUpside >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {formatPercent(stock.bazinUpside, 1, true)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Teto Graham */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    {stock.grahamApplicable && stock.grahamCeiling !== null ? (
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(stock.grahamCeiling, currency)}
                        </div>
                        {stock.grahamUpside !== null && (
                          <div
                            className={`text-[10px] font-semibold ${
                              stock.grahamUpside >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {formatPercent(stock.grahamUpside, 1, true)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400"
                        title="Graham não se aplica para LPA ou VPA negativo/nulo"
                      >
                        <AlertTriangle className="h-3 w-3" /> Não se aplica
                      </span>
                    )}
                  </td>

                  {/* Score Lynch */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {stock.lynchScore !== null ? (
                      <div>
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                            stock.lynchScore > 2
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : stock.lynchScore >= 1
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          }`}
                        >
                          {formatNumber(stock.lynchScore, 2)}
                        </span>
                        {stock.lynchPeg !== null && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            PEG {formatNumber(stock.lynchPeg, 2)}x
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Posição Greenblatt */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {stock.isFinancial ? (
                      <span className="text-[10px] italic text-slate-400">
                        Excluída (Banco)
                      </span>
                    ) : stock.rankGreenblatt ? (
                      <div>
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                          {stock.rankGreenblatt}º lugar
                        </span>
                        <div className="text-[10px] text-slate-400">
                          EY: {formatPercent(stock.greenblattEy, 1)} | ROIC: {formatPercent(stock.greenblattRoic, 1)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Upside Geral */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    {targetUpside !== null && targetUpside !== undefined ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                          targetUpside >= 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {targetUpside >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatPercent(targetUpside, 1, true)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Data / Hora da Atualização */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap text-slate-400 text-[11px]">
                    {stock.isExampleData ? (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Não atualizado via API
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDateTime(stock.quoteUpdatedAt)}</span>
                      </div>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 pr-4 pl-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onRefreshTicker(stock.ticker)}
                        disabled={isRefreshing}
                        title={`Atualizar cotação de ${stock.ticker}`}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveTicker(stock.ticker)}
                        title={`Remover ${stock.ticker} do monitoramento`}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400"
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
