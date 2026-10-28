import React, { useState } from 'react';
import type { Currency, GrahamParams } from '../../types/valuation';
import { calculateGraham, formatCurrency, formatNumber } from '../../utils/valuationCalculators';
import { grahamPresets } from '../../utils/presets';
import { InputField } from '../ui/InputField';
import { MarginSlider } from '../ui/MarginSlider';
import { ResultDisplay } from '../ui/ResultDisplay';
import { FormulaCard } from '../ui/FormulaCard';
import { Sparkles, RotateCcw } from 'lucide-react';

interface GrahamCalculatorProps {
  currency: Currency;
}

export const GrahamCalculator: React.FC<GrahamCalculatorProps> = ({ currency }) => {
  const [params, setParams] = useState<GrahamParams>({
    lpa: 6.85,
    vpa: 31.2,
    multiplier: 22.5,
    marginOfSafety: 20,
    currentPrice: 38.2,
  });

  const [activePreset, setActivePreset] = useState<string>('PETR4 (Petrobras)');

  const result = calculateGraham(params);

  const handlePresetSelect = (presetTicker: string) => {
    const found = grahamPresets.find((p) => p.ticker === presetTicker);
    if (found) {
      setParams(found.params);
      setActivePreset(found.ticker);
    }
  };

  const handleReset = () => {
    setParams({
      lpa: 0,
      vpa: 0,
      multiplier: 22.5,
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
          {grahamPresets.map((preset) => (
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
              Parâmetros de Graham
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Informe o Lucro por Ação (LPA) e o Valor Patrimonial por Ação (VPA).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="graham-lpa"
              label="Lucro por Ação (LPA)"
              value={params.lpa}
              onChange={(val) => setParams({ ...params, lpa: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="LPA = Lucro Líquido ÷ Total de Ações. Se ≤ 0, o método não se aplica."
            />

            <InputField
              id="graham-vpa"
              label="Valor Patrimonial por Ação (VPA)"
              value={params.vpa}
              onChange={(val) => setParams({ ...params, vpa: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="VPA = Patrimônio Líquido ÷ Total de Ações. Se ≤ 0, o método não se aplica."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="graham-multiplier"
              label="Fator Multiplicador"
              value={params.multiplier}
              onChange={(val) => setParams({ ...params, multiplier: val })}
              step={0.5}
              helpText="Padrão Graham: 22,5 (decorrente de P/L máx 15 × P/VP máx 1,5)."
            />

            <InputField
              id="graham-current-price"
              label="Cotação Atual"
              value={params.currentPrice || ''}
              onChange={(val) => setParams({ ...params, currentPrice: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="Cotação de mercado para calcular Upside e margem."
            />
          </div>

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
            notApplicableMessage={result.reasonNotApplicable}
            currency={currency}
            title="Preço Justo de Graham"
          />

          {result.isApplicable && result.ceilingPrice && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 text-left space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detalhamento dos Fatores
              </span>
              <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>LPA × VPA:</span>
                  <span className="font-semibold">{formatNumber(params.lpa * params.vpa, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Produto com Fator ({params.multiplier}):</span>
                  <span className="font-semibold">{formatNumber(params.multiplier * params.lpa * params.vpa, 2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1">
                  <span>Raiz Quadrada (Preço Justo):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(result.ceilingPrice, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Com Margem de Segurança ({params.marginOfSafety}%):</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(result.buyPriceWithMargin, currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <FormulaCard
            title="Fórmula do Preço Justo de Graham"
            author="Benjamin Graham (O Investidor Inteligente)"
            formula="Preço Justo = √(22,5 × LPA × VPA)"
            explanation={
              <div className="space-y-2">
                <p>
                  Benjamin Graham considerava razoável que uma empresa sólida fosse negociada
                  a no máximo <strong>15 vezes seus lucros (P/L ≤ 15)</strong> e a no máximo{' '}
                  <strong>1,5 vezes seu valor patrimonial (P/VP ≤ 1,5)</strong>.
                </p>
                <p>
                  O produto destes dois tetos resulta no multiplicador clássico:{' '}
                  <strong>15 × 1,5 = 22,5</strong>.
                </p>
                <div className="rounded-md bg-amber-500/10 p-2 text-[11px] text-amber-800 dark:text-amber-300">
                  <strong>Regra de Graham:</strong> Se o LPA ou o VPA for zero ou negativo, a
                  fórmula resulta em raiz de número não-positivo, portanto{' '}
                  <strong>não se aplica</strong> a empresas deficitárias ou com patrimônio
                  descoberto.
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};
