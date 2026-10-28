import React from 'react';
import type { Currency } from '../../types/valuation';
import { formatCurrency, formatPercent } from '../../utils/valuationCalculators';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

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
      <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 text-left dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
              Método Não Se Aplica
            </h3>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-300/90 leading-relaxed">
              {notApplicableMessage ||
                'Os critérios fundamentais exigidos por esta fórmula não foram atendidos.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasCurrentPrice = currentPrice !== undefined && currentPrice !== null && currentPrice > 0;
  const isBelowCeiling = hasCurrentPrice && currentPrice <= ceilingPrice;
  const isBelowBuyPrice = hasCurrentPrice && buyPriceWithMargin !== null && buyPriceWithMargin !== undefined && currentPrice <= buyPriceWithMargin;

  const hasUpside = upside !== undefined && upside !== null;
  const hasUpsideWithMargin = upsideWithMargin !== undefined && upsideWithMargin !== null;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {hasCurrentPrice && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isBelowBuyPrice
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : isBelowCeiling
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
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

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Preço Teto */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/60 dark:bg-slate-800/50 dark:border-slate-700/60">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Preço Teto / Justo
          </div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(ceilingPrice, currency)}
          </div>
          {hasUpside && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Potencial (Upside):</span>
              <span
                className={`inline-flex items-center font-bold ${
                  upside >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
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
        <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/30 dark:bg-emerald-950/30 dark:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Compra com Margem ({marginOfSafety}%)
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {formatCurrency(buyPriceWithMargin, currency)}
          </div>
          {hasUpsideWithMargin && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Margem vs Cotação:</span>
              <span
                className={`inline-flex items-center font-bold ${
                  upsideWithMargin >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatPercent(upsideWithMargin, 1, true)}
              </span>
            </div>
          )}
        </div>
      </div>

      {hasCurrentPrice && (
        <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
          Cotação de referência utilizada:{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {formatCurrency(currentPrice, currency)}
          </span>
        </div>
      )}
    </div>
  );
};

