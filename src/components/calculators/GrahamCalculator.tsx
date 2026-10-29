import React, { useState } from 'react';
import type { Currency, GrahamParams } from '../../types/valuation';
import { calculateGraham } from '../../utils/valuationCalculators';
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
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-300">
            Carregar exemplo real:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {grahamPresets.map((preset) => (
            <button
              key={preset.ticker}
              type="button"
              onClick={() => handlePresetSelect(preset.ticker)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                activePreset === preset.ticker
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {preset.ticker}
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            title="Limpar campos"
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-all"
          >
            <RotateCcw className="h-3 w-3" /> Limpar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulário de Entradas */}
        <div className="lg:col-span-7 space-y-5 glass-card rounded-2xl p-6 text-left">
          <div className="border-b border-white/[0.06] pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Parâmetros de Graham
            </h3>
            <p className="text-xs text-zinc-400">
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
              placeholder="0,00"
              helpText="Cotação em bolsa para calcular potencial de valorização."
            />
          </div>

          <MarginSlider
            value={params.marginOfSafety}
            onChange={(val) => setParams({ ...params, marginOfSafety: val })}
          />
        </div>

        {/* Resultado e Metodologia */}
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
            title="Valor Intrínseco — Benjamin Graham"
          />

          <FormulaCard
            title="Fórmula do Valor Intrínseco de Graham"
            author="Benjamin Graham (O Investidor Inteligente)"
            formula="VI = √( 22,5 × LPA × VPA )"
            explanation={
              <div className="space-y-2 text-zinc-300">
                <p>
                  Benjamin Graham, mentor de Warren Buffett, propôs esta fórmula clássica
                  para estimar o valor intrínseco de empresas maduras com lucros e patrimônio
                  positivos.
                </p>
                <p>
                  O multiplicador <strong>22,5</strong> resulta da multiplicação do P/L
                  máximo aceitável por Graham (15x) pelo P/VP máximo aceitável (1,5x):
                </p>
                <div className="rounded-xl bg-white/[0.03] p-2.5 font-mono text-xs text-emerald-300 border border-white/[0.08]">
                  15 (P/L máx) × 1,5 (P/VP máx) = 22,5
                </div>
                <p className="text-zinc-400">
                  Se a cotação estiver abaixo do VI com margem de segurança (ex: 20%),
                  Graham considerava a ação uma oportunidade clássica de valor.
                </p>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};
