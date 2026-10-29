import React from 'react';
import type { Currency } from '../../types/valuation';
import { formatCurrency, formatPercent } from '../../utils/valuationCalculators';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface ResultDisplayProps {
  ceilingPrice: number | null | undefined;
  buyPriceWithMargin: number | null | undefined;
  currentPrice?: number | null;
  upside?: number | null;
  upsideWithMargin?: number | null;
  marginOfSafety: number;
  isApplicable: boolean;
  notApplicableMessage?: string;
  currency?: Currency;
  title?: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  ceilingPrice,
  buyPriceWithMargin,
  currentPrice,
  upside,
  upsideWithMargin,
  marginOfSafety,
  isApplicable,
  notApplicableMessage,
  currency = 'BRL',
  title = 'Resultado do Valuation',
}) => {
  if (!isApplicable || ceilingPrice === null || ceilingPrice === undefined) {
    return (
      <div className="glass-card rounded-2xl border-amber-500/20 bg-amber-500/10 p-5 text-left">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-300">
              Critério Não Aplicável
            </h3>
            <p className="mt-1 text-xs text-amber-200/80 leading-relaxed">
              {notApplicableMessage ||
                'Os critérios fundamentalistas exigidos por esta metodologia não foram satisfeitos (ex: LPA ou VPA negativos).'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasCurrentPrice = currentPrice !== undefined && currentPrice !== null && currentPrice > 0;
  const isBelowCeiling = hasCurrentPrice && currentPrice <= ceilingPrice;
  const isBelowBuyPrice =
    hasCurrentPrice &&
    buyPriceWithMargin !== null &&
    buyPriceWithMargin !== undefined &&
    currentPrice <= buyPriceWithMargin;

  const hasUpside = upside !== undefined && upside !== null;
  const hasUpsideWithMargin = upsideWithMargin !== undefined && upsideWithMargin !== null;

  return (
    <div className="glass-card rounded-2xl p-5 text-left relative overflow-hidden space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            {title}
          </span>
        </div>
        {hasCurrentPrice && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isBelowBuyPrice
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : isBelowCeiling
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isBelowBuyPrice ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Com Margem de Segurança
              </>
            ) : isBelowCeiling ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Abaixo do Preço Teto
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5" /> Acima do Preço Teto
              </>
            )}
          </span>
        )}
      </div>

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Preço Teto Justo */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 text-left">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Preço Teto / Justo
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
            {formatCurrency(ceilingPrice, currency)}
          </div>
          {hasUpside && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400">Upside Estimado:</span>
              <span
                className={`inline-flex items-center font-bold ${
                  upside >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {upside >= 0 ? (
                  <TrendingUp className="mr-0.5 h-3.5 w-3.5 inline" />
                ) : (
                  <TrendingDown className="mr-0.5 h-3.5 w-3.5 inline" />
                )}
                {formatPercent(upside, 1, true)}
              </span>
            </div>
          )}
        </div>

        {/* Preço de Compra com Margem */}
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
              Compra com Margem ({marginOfSafety}%)
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-emerald-400">
            {formatCurrency(buyPriceWithMargin, currency)}
          </div>
          {hasUpsideWithMargin && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400">Margem vs Cotação:</span>
              <span
                className={`inline-flex items-center font-bold ${
                  upsideWithMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatPercent(upsideWithMargin, 1, true)}
              </span>
            </div>
          )}
        </div>
      </div>

      {hasCurrentPrice && (
        <div className="text-center text-xs text-zinc-400 pt-1">
          Cotação atual de referência:{' '}
          <span className="font-bold text-white">
            {formatCurrency(currentPrice, currency)}
          </span>
        </div>
      )}
    </div>
  );
};
