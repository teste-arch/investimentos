import React, { useState } from 'react';
import type { Currency, GreenblattParams } from '../../types/valuation';
import { calculateGreenblatt, formatCurrency, formatNumber, formatPercent } from '../../utils/valuationCalculators';
import { greenblattPresets } from '../../utils/presets';
import { InputField } from '../ui/InputField';
import { MarginSlider } from '../ui/MarginSlider';
import { FormulaCard } from '../ui/FormulaCard';
import { Sparkles, RotateCcw, Percent, Activity } from 'lucide-react';

interface GreenblattCalculatorProps {
  currency: Currency;
}

export const GreenblattCalculator: React.FC<GreenblattCalculatorProps> = ({ currency }) => {
  const [params, setParams] = useState<GreenblattParams>({
    ebit: 10500,
    marketCap: 41000,
    netDebt: 8200,
    netWorkingCapital: 2100,
    netFixedAssets: 18500,
    sharesOutstanding: 885,
    currentPrice: 46.3,
    targetMultipleEV_EBIT: 8.0,
    marginOfSafety: 20,
  });

  const [activePreset, setActivePreset] = useState<string>('PRIO3 (PRIO - Prio S.A.)');

  const result = calculateGreenblatt(params);

  const handlePresetSelect = (presetTicker: string) => {
    const found = greenblattPresets.find((p) => p.ticker === presetTicker);
    if (found) {
      setParams(found.params);
      setActivePreset(found.ticker);
    }
  };

  const handleReset = () => {
    setParams({
      ebit: 0,
      marketCap: 0,
      netDebt: 0,
      netWorkingCapital: 0,
      netFixedAssets: 0,
      sharesOutstanding: 0,
      currentPrice: 0,
      targetMultipleEV_EBIT: 8.0,
      marginOfSafety: 20,
    });
    setActivePreset('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner com Seletor de Exemplos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-3.5 shadow-2xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Carregar exemplo real:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {greenblattPresets.map((preset) => (
            <button
              key={preset.ticker}
              type="button"
              onClick={() => handlePresetSelect(preset.ticker)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                activePreset === preset.ticker
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {preset.ticker}
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            title="Limpar campos"
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3 w-3" /> Limpar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulário de Entradas */}
        <div className="lg:col-span-7 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-left">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Parâmetros da Fórmula Mágica
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Valores em milhões ({currency === 'BRL' ? 'R$' : 'US$'}), exceto cotação.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="greenblatt-ebit"
              label="EBIT (Lucro Operacional)"
              value={params.ebit}
              onChange={(val) => setParams({ ...params, ebit: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="Lucro antes de Juros e Impostos nos últimos 12 meses."
            />

            <InputField
              id="greenblatt-marketcap"
              label="Valor de Mercado (Market Cap)"
              value={params.marketCap}
              onChange={(val) => setParams({ ...params, marketCap: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="Cotação atual × total de ações emitidas."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="greenblatt-netdebt"
              label="Dívida Líquida"
              value={params.netDebt}
              onChange={(val) => setParams({ ...params, netDebt: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="Dívida Total − Caixa e equivalentes. (Se caixa > dívida, digite negativo)."
            />

            <InputField
              id="greenblatt-nwc"
              label="Capital de Giro Líquido"
              value={params.netWorkingCapital}
              onChange={(val) => setParams({ ...params, netWorkingCapital: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="Ativo Circulante − Passivo Circulante."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="greenblatt-fixed-assets"
              label="Ativo Imobilizado Líquido"
              value={params.netFixedAssets}
              onChange={(val) => setParams({ ...params, netFixedAssets: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="Imobilizado tangível líquido de depreciação acumulada."
            />

            <InputField
              id="greenblatt-current-price"
              label="Cotação Atual (Unitária)"
              value={params.currentPrice || ''}
              onChange={(val) => setParams({ ...params, currentPrice: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="Preço atual da ação na bolsa."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="greenblatt-shares"
              label="Número de Ações (milhões)"
              value={params.sharesOutstanding || ''}
              onChange={(val) => setParams({ ...params, sharesOutstanding: val })}
              helpText="Para estimativa de preço justo por ação."
            />

            <InputField
              id="greenblatt-target-multiple"
              label="EV/EBIT Justo Alvo"
              value={params.targetMultipleEV_EBIT || 8}
              onChange={(val) => setParams({ ...params, targetMultipleEV_EBIT: val })}
              suffix="x"
              step={0.5}
              helpText="Múltiplo EV/EBIT estimado justo (ex: 8x ou 10x)."
            />
          </div>

          <MarginSlider
            value={params.marginOfSafety}
            onChange={(val) => setParams({ ...params, marginOfSafety: val })}
          />
        </div>

        {/* Painel de Resultados */}
        <div className="lg:col-span-5 space-y-5">
          {/* Métricas Principais da Fórmula Mágica */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pilares da Fórmula Mágica
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Greenblatt
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Earnings Yield */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 dark:border-blue-500/30 dark:bg-blue-950/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                  <Percent className="h-4 w-4" /> Earnings Yield
                </div>
                <div className="mt-2 text-2xl font-black text-blue-800 dark:text-blue-200">
                  {formatPercent(result.earningsYield)}
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  EBIT ÷ EV (Rendimento Operacional)
                </p>
              </div>

              {/* ROIC */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:border-emerald-500/30 dark:bg-emerald-950/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <Activity className="h-4 w-4" /> ROIC Tangível
                </div>
                <div className="mt-2 text-2xl font-black text-emerald-800 dark:text-emerald-200">
                  {result.roic !== null ? formatPercent(result.roic) : '—'}
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  EBIT ÷ (Giro Líq + Imobilizado)
                </p>
              </div>
            </div>

            {/* Enterprise Value & Capital */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Enterprise Value (EV = MktCap + Dívida):</span>
                <span className="font-semibold">{formatNumber(result.ev, 0)} mi</span>
              </div>
              <div className="flex justify-between">
                <span>Capital Tangível Investido:</span>
                <span className="font-semibold">{formatNumber(result.tangibleCapitalEmployed, 0)} mi</span>
              </div>
            </div>

            {/* Preço Justo Estimado se parâmetros fornecidos */}
            {result.ceilingPrice && result.ceilingPrice > 0 && (
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/60 dark:bg-slate-800/50 dark:border-slate-700/60 space-y-2">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Preço Teto Estimado (EV/EBIT {params.targetMultipleEV_EBIT}x):
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(result.ceilingPrice, currency)}
                </div>
                <div className="flex justify-between text-xs text-emerald-700 dark:text-emerald-400">
                  <span>Com Margem ({params.marginOfSafety}%):</span>
                  <span className="font-bold">
                    {formatCurrency(result.buyPriceWithMargin, currency)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <FormulaCard
            title="A Fórmula Mágica de Joel Greenblatt"
            author="Joel Greenblatt (The Little Book That Beats the Market)"
            formula="Rank(Earnings Yield) + Rank(ROIC) = Ranking Final (Menor Soma = Melhor)"
            explanation={
              <div className="space-y-2">
                <p>
                  Joel Greenblatt comprovou que comprar <strong>empresas boas</strong>{' '}
                  (alto ROIC sobre o capital tangível) a <strong>preços pechincha</strong>{' '}
                  (alto Earnings Yield EBIT/EV) bate consistentemente o mercado.
                </p>
                <p>
                  <strong>Earnings Yield = EBIT ÷ EV:</strong> Mede quanto a empresa gera de
                  lucro operacional para cada real de valor total da firma investido.
                </p>
                <p>
                  <strong>ROIC = EBIT ÷ (Capital de Giro Líq + Imobilizado):</strong> Mede a
                  eficiência com que o capital tangível de fato necessário para operar a
                  empresa gera resultado.
                </p>
                <p className="text-[11px] text-slate-500">
                  <em>*Greenblatt exclui instituições financeiras e bancos por terem estruturas de capital distintas.</em>
                </p>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};
