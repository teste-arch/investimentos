import React from 'react';
import type { ApiStockItem } from '../../services/api';
import { formatCurrency, formatPercent } from '../../utils/valuationCalculators';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  Flame,
} from 'lucide-react';

interface ScreenerExecutiveSummaryProps {
  stocks: ApiStockItem[];
  rankingCriterion: string;
  onSelectStock?: (stock: ApiStockItem) => void;
}

export const ScreenerExecutiveSummary: React.FC<ScreenerExecutiveSummaryProps> = ({
  stocks,
  rankingCriterion: _rankingCriterion,
  onSelectStock,
}) => {
  if (stocks.length === 0) return null;

  const getStockCeiling = (stock: ApiStockItem) => {
    return stock.bazinCeiling || stock.grahamCeiling || stock.lynchCeiling || null;
  };

  // Calculando métricas reais da base
  const totalStocks = stocks.length;
  const b3Stocks = stocks.filter((s) => s.market === 'B3').length;
  const usStocks = stocks.filter((s) => s.market === 'US').length;

  // Upside médio dos ativos com preço teto válido
  const validUpsides = stocks
    .map((s) => s.upside)
    .filter((u): u is number => u !== null && u !== undefined && !isNaN(u));
  const avgUpside =
    validUpsides.length > 0
      ? validUpsides.reduce((acc, curr) => acc + curr, 0) / validUpsides.length
      : 0;

  // Encontrar o ativo com maior upside positivo
  const sortedByUpside = [...stocks]
    .filter((s) => s.upside !== null && s.upside !== undefined)
    .sort((a, b) => (b.upside || 0) - (a.upside || 0));

  const topOpportunity = sortedByUpside[0];
  const runnerUpOpportunity = sortedByUpside[1];

  // Ativos com margem de segurança positiva
  const discountStocksCount = stocks.filter(
    (s) => s.upside !== null && (s.upside || 0) > 0
  ).length;

  return (
    <div className="space-y-4">
      {/* 4 Top KPI Cards (Inspired by Image 1 & Image 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total de Ativos Monitorados */}
        <div className="glass-card rounded-2xl p-4 text-left relative overflow-hidden transition-all duration-200 hover:border-white/15">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Ativos Monitorados
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-white">
              <Building2 className="h-3.5 w-3.5 text-zinc-300" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {totalStocks}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-300 font-semibold">
                🇧🇷 {b3Stocks} B3
              </span>
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-300 font-semibold">
                🇺🇸 {usStocks} EUA
              </span>
            </div>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Ativo
            </span>
          </div>
        </div>

        {/* Card 2: Maior Oportunidade (Top Upside) */}
        <div className="glass-card rounded-2xl p-4 text-left relative overflow-hidden transition-all duration-200 hover:border-white/15">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Maior Desconto
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Flame className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {topOpportunity ? topOpportunity.ticker : '—'}
            </span>
            {topOpportunity && topOpportunity.upside !== null && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                <ArrowUpRight className="h-3 w-3" />
                {formatPercent(topOpportunity.upside, 1, true)}
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-zinc-400 truncate">
            {topOpportunity ? (
              <span>
                Cotação: <strong className="text-zinc-200">{formatCurrency(topOpportunity.price, topOpportunity.currency)}</strong> • Teto:{' '}
                <strong className="text-emerald-400">
                  {formatCurrency(getStockCeiling(topOpportunity), topOpportunity.currency)}
                </strong>
              </span>
            ) : (
              'Nenhum ativo filtrado'
            )}
          </div>
        </div>

        {/* Card 3: Média de Upside da Carteira (With glowing Sparkline Wave) */}
        <div className="glass-card rounded-2xl p-4 text-left relative overflow-hidden transition-all duration-200 hover:border-white/15">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Média de Upside
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-white">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                avgUpside >= 0 ? 'text-white' : 'text-rose-400'
              }`}
            >
              {formatPercent(avgUpside, 1, true)}
            </span>
            <span className="text-[10px] text-zinc-400">vs Preço Justo</span>
          </div>
          {/* Subtle sparkline wave */}
          <div className="mt-2 h-6 w-full">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 100 24">
              <defs>
                <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,18 Q15,22 30,12 T60,10 T85,4 T100,2 L100,24 L0,24 Z"
                fill="url(#sparklineGrad)"
              />
              <path
                d="M0,18 Q15,22 30,12 T60,10 T85,4 T100,2"
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: Oportunidades com Margem de Segurança */}
        <div className="glass-card rounded-2xl p-4 text-left relative overflow-hidden transition-all duration-200 hover:border-white/15">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Oportunidades em Desconto
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-white">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {discountStocksCount}
            </span>
            <span className="text-xs text-zinc-400">
              de {totalStocks} empresas
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Abaixo do preço justo</span>
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
              {Math.round((discountStocksCount / Math.max(1, totalStocks)) * 100)}% do total
            </span>
          </div>
        </div>
      </div>

      {/* Featured Spotlight Cards (Inspired by Image 2 - Bitcoin & Ethereum Cards) */}
      {(topOpportunity || runnerUpOpportunity) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Spotlight Card 1 */}
          {topOpportunity && (
            <div
              onClick={() => onSelectStock && onSelectStock(topOpportunity)}
              className="group glass-card rounded-2xl p-5 text-left relative overflow-hidden cursor-pointer transition-all duration-200 hover:border-white/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 font-black text-sm">
                    {topOpportunity.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-zinc-400">
                        {topOpportunity.market === 'B3' ? 'B3 / Brasil' : 'EUA / Nasdaq'}
                      </span>
                      <span className="rounded bg-white/10 px-1 py-0.2 text-[9px] font-bold text-zinc-300">
                        #1 Destaque
                      </span>
                    </div>
                    <div className="text-base font-bold text-white flex items-center gap-1.5">
                      {topOpportunity.ticker}
                      <span className="text-xs font-normal text-zinc-400 truncate max-w-[140px]">
                        {topOpportunity.name}
                      </span>
                    </div>
                  </div>
                </div>

                {topOpportunity.upside !== null && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      (topOpportunity.upside || 0) >= 0
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {(topOpportunity.upside || 0) >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {formatPercent(topOpportunity.upside, 1, true)}
                  </span>
                )}
              </div>

              {/* Price & Ceiling */}
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-zinc-400">
                    Cotação Atual
                  </div>
                  <div className="text-2xl font-black tracking-tight text-white">
                    {formatCurrency(topOpportunity.price, topOpportunity.currency)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-semibold text-zinc-400">
                    Preço Justo (Teto)
                  </div>
                  <div className="text-lg font-bold text-emerald-400">
                    {formatCurrency(getStockCeiling(topOpportunity), topOpportunity.currency)}
                  </div>
                </div>
              </div>

              {/* Glowing SVG Wave Sparkline with Gradient fill (Like Image 2 & 3) */}
              <div className="mt-4 h-14 w-full relative">
                <svg className="h-full w-full overflow-visible" viewBox="0 0 200 50">
                  <defs>
                    <linearGradient id="glowWave1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,40 Q40,48 70,25 T130,28 T170,12 T200,8 L200,50 L0,50 Z"
                    fill="url(#glowWave1)"
                  />
                  <path
                    d="M0,40 Q40,48 70,25 T130,28 T170,12 T200,8"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Pin Dot */}
                  <circle cx="170" cy="12" r="3.5" fill="#34d399" />
                  <circle
                    cx="170"
                    cy="12"
                    r="7"
                    fill="#34d399"
                    opacity="0.3"
                    className="animate-ping"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Spotlight Card 2 */}
          {runnerUpOpportunity && (
            <div
              onClick={() => onSelectStock && onSelectStock(runnerUpOpportunity)}
              className="group glass-card rounded-2xl p-5 text-left relative overflow-hidden cursor-pointer transition-all duration-200 hover:border-white/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 font-black text-sm">
                    {runnerUpOpportunity.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-zinc-400">
                        {runnerUpOpportunity.market === 'B3' ? 'B3 / Brasil' : 'EUA / Nasdaq'}
                      </span>
                      <span className="rounded bg-white/10 px-1 py-0.2 text-[9px] font-bold text-zinc-300">
                        #2 Destaque
                      </span>
                    </div>
                    <div className="text-base font-bold text-white flex items-center gap-1.5">
                      {runnerUpOpportunity.ticker}
                      <span className="text-xs font-normal text-zinc-400 truncate max-w-[140px]">
                        {runnerUpOpportunity.name}
                      </span>
                    </div>
                  </div>
                </div>

                {runnerUpOpportunity.upside !== null && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      (runnerUpOpportunity.upside || 0) >= 0
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {(runnerUpOpportunity.upside || 0) >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {formatPercent(runnerUpOpportunity.upside, 1, true)}
                  </span>
                )}
              </div>

              {/* Price & Ceiling */}
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-zinc-400">
                    Cotação Atual
                  </div>
                  <div className="text-2xl font-black tracking-tight text-white">
                    {formatCurrency(runnerUpOpportunity.price, runnerUpOpportunity.currency)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-semibold text-zinc-400">
                    Preço Justo (Teto)
                  </div>
                  <div className="text-lg font-bold text-cyan-400">
                    {formatCurrency(getStockCeiling(runnerUpOpportunity), runnerUpOpportunity.currency)}
                  </div>
                </div>
              </div>

              {/* Glowing SVG Wave Sparkline with Gradient fill */}
              <div className="mt-4 h-14 w-full relative">
                <svg className="h-full w-full overflow-visible" viewBox="0 0 200 50">
                  <defs>
                    <linearGradient id="glowWave2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,35 Q50,45 80,30 T140,20 T175,14 T200,6 L200,50 L0,50 Z"
                    fill="url(#glowWave2)"
                  />
                  <path
                    d="M0,35 Q50,45 80,30 T140,20 T175,14 T200,6"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Pin Dot */}
                  <circle cx="140" cy="20" r="3.5" fill="#22d3ee" />
                  <circle
                    cx="140"
                    cy="20"
                    r="7"
                    fill="#22d3ee"
                    opacity="0.3"
                    className="animate-ping"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
