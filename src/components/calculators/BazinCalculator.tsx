import React, { useState } from 'react';
import type { Currency, BazinParams } from '../../types/valuation';
import { calculateBazin, formatCurrency, formatPercent } from '../../utils/valuationCalculators';
import { bazinPresets } from '../../utils/presets';
import { InputField } from '../ui/InputField';
import { MarginSlider } from '../ui/MarginSlider';
import { ResultDisplay } from '../ui/ResultDisplay';
import { FormulaCard } from '../ui/FormulaCard';
import { Sparkles, RotateCcw } from 'lucide-react';

interface BazinCalculatorProps {
  currency: Currency;
  onValuesChange?: (params: BazinParams) => void;
}

export const BazinCalculator: React.FC<BazinCalculatorProps> = ({ currency }) => {
  const [params, setParams] = useState<BazinParams>({
    dividendPerShare: 4.85,
    dividendType: '12m',
    targetYield: 6.0,
    marginOfSafety: 20,
    currentPrice: 28.5,
  });

  const [activePreset, setActivePreset] = useState<string>('BBAS3 (Banco do Brasil)');

  const result = calculateBazin(params);

  const handlePresetSelect = (presetTicker: string) => {
    const found = bazinPresets.find((p) => p.ticker === presetTicker);
    if (found) {
      setParams(found.params);
      setActivePreset(found.ticker);
    }
  };

  const handleReset = () => {
    setParams({
      dividendPerShare: 0,
      dividendType: '12m',
      targetYield: 6.0,
      marginOfSafety: 20,
      currentPrice: 0,
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
          {bazinPresets.map((preset) => (
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
              Parâmetros de Entrada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Insira o histórico de proventos e a taxa de retorno em dividendos desejada.
            </p>
          </div>

          {/* Tipo de Provento */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Base dos Dividendos
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setParams({ ...params, dividendType: '12m' })}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  params.dividendType === '12m'
                    ? 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Últimos 12 Meses
              </button>
              <button
                type="button"
                onClick={() => setParams({ ...params, dividendType: '5y_avg' })}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  params.dividendType === '5y_avg'
                    ? 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Média de 5 Anos
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {params.dividendType === '12m'
                ? 'Soma de todos os dividendos e JCP pagos por ação nos últimos 12 meses.'
                : 'Média aritmética anual dos proventos pagos nos últimos 5 anos (suaviza oscilações cíclicas).'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="bazin-dividend"
              label={
                params.dividendType === '12m'
                  ? 'Dividendo por Ação (12m)'
                  : 'DPA Médio (5 anos)'
              }
              value={params.dividendPerShare}
              onChange={(val) => setParams({ ...params, dividendPerShare: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="Proventos pagos por ação no período selecionado."
            />

            <InputField
              id="bazin-target-yield"
              label="Dividend Yield Mínimo Exigido"
              value={params.targetYield}
              onChange={(val) => setParams({ ...params, targetYield: val })}
              suffix="%"
              step={0.1}
              helpText="Padrão Bazin: 6,0% a.a. (ajuste para 3% ou 4% em ações americanas)."
            />
          </div>

          <InputField
            id="bazin-current-price"
            label="Cotação Atual da Ação"
            value={params.currentPrice || ''}
            onChange={(val) => setParams({ ...params, currentPrice: val })}
            prefix={currency === 'BRL' ? 'R$' : '$'}
            helpText="Opcional. Usado para calcular o Upside/Downside e status de oportunidade."
          />

          <MarginSlider
            value={params.marginOfSafety}
            onChange={(val) => setParams({ ...params, marginOfSafety: val })}
          />
        </div>

        {/* Painel de Resultados */}
        <div className="lg:col-span-5 space-y-5">
          <ResultDisplay
            ceilingPrice={result.ceilingPrice}
            buyPriceWithMargin={result.buyPriceWithMargin}
            currentPrice={params.currentPrice}
            upside={result.upside}
            upsideWithMargin={result.upsideWithMargin}
            marginOfSafety={params.marginOfSafety}
            isApplicable={result.isApplicable}
            notApplicableMessage={result.notes}
            currency={currency}
            title="Preço Teto de Bazin"
          />

          {/* Card com Detalhamento Matemático */}
          {result.isApplicable && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 text-left space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Resumo dos Cálculos
              </span>
              <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Provento por Ação (DPA):</span>
                  <span className="font-semibold">{formatCurrency(params.dividendPerShare, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Yield Exigido:</span>
                  <span className="font-semibold">{formatPercent(params.targetYield)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1">
                  <span>Preço Teto (DPA ÷ Taxa):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(result.ceilingPrice, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Preço c/ Margem ({params.marginOfSafety}%):</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(result.buyPriceWithMargin, currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <FormulaCard
            title="Preço Teto de Décio Bazin"
            author="Décio Bazin (Faça Fortuna com Ações)"
            formula="Preço Teto = Dividendo por Ação (DPA) ÷ Taxa Exigida (ex: 0,06)"
            explanation={
              <div className="space-y-2">
                <p>
                  O jornalista e investidor Décio Bazin estabeleceu que só vale a pena
                  comprar ações que paguem pelo menos <strong>6% ao ano em dividendos</strong>{' '}
                  sobre o preço pago.
                </p>
                <p>
                  Se a cotação estiver abaixo do Preço Teto, a empresa entregará mais de 6%
                  de Dividend Yield considerando os dividendos projetados.
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Preço Limite de Compra com Margem = Preço Teto × (1 − Margem de Segurança%).
                </p>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};
