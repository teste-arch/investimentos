import React, { useState } from 'react';
import type { Currency, BazinParams } from '../../types/valuation';
import { calculateBazin } from '../../utils/valuationCalculators';
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
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-300">
            Carregar exemplo real:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {bazinPresets.map((preset) => (
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
              Parâmetros de Entrada
            </h3>
            <p className="text-xs text-zinc-400">
              Insira o histórico de proventos e a taxa de retorno em dividendos desejada.
            </p>
          </div>

          {/* Tipo de Provento */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
              Base dos Dividendos
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setParams({ ...params, dividendType: '12m' })}
                className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                  params.dividendType === '12m'
                    ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                    : 'border border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                Últimos 12 Meses
              </button>
              <button
                type="button"
                onClick={() => setParams({ ...params, dividendType: '5y_avg' })}
                className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                  params.dividendType === '5y_avg'
                    ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                    : 'border border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                Média de 5 Anos
              </button>
            </div>
            <p className="text-[10px] text-zinc-400">
              {params.dividendType === '12m'
                ? 'Soma de todos os dividendos e JCP pagos por ação nos últimos 12 meses.'
                : 'Média aritmética anual dos proventos pagos nos últimos 5 anos.'}
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
              placeholder="0,00"
              helpText="Proventos pagos por ação no período selecionado."
            />

            <InputField
              id="bazin-yield"
              label="Yield Mínimo Desejado"
              value={params.targetYield}
              onChange={(val) => setParams({ ...params, targetYield: val })}
              suffix="%"
              placeholder="6,0"
              step={0.5}
              helpText="Taxa de corte de Décio Bazin (6,0% padrão B3)."
            />
          </div>

          <InputField
            id="bazin-price"
            label="Cotação Atual de Mercado (Opcional)"
            value={params.currentPrice || 0}
            onChange={(val) => setParams({ ...params, currentPrice: val })}
            prefix={currency === 'BRL' ? 'R$' : '$'}
            placeholder="0,00"
            helpText="Informe o preço de tela para cálculo de potencial (upside)."
          />

          <MarginSlider
            value={params.marginOfSafety}
            onChange={(val) => setParams({ ...params, marginOfSafety: val })}
          />
        </div>

        {/* Painel Lateral com Resultado e Metodologia */}
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
            title="Preço Teto — Décio Bazin"
          />

          <FormulaCard
            title="Preço Teto de Décio Bazin"
            author="Décio Bazin (Faça Fortuna com Ações)"
            formula="Preço Teto = DPA / Yield Desejado (ex: DPA / 0,06)"
            explanation={
              <div className="space-y-2 text-zinc-300">
                <p>
                  O método de Décio Bazin visa identificar empresas boas pagadoras de
                  dividendos que estejam sendo negociadas a preços que garantam um retorno mínimo
                  de 6% ao ano apenas em proventos.
                </p>
                <p>
                  <strong>Regras de Ouro de Bazin:</strong>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                  <li>Yield mínimo de 6% sobre o preço pago.</li>
                  <li>Endividamento equilibrado (Dívida Líq / EBITDA moderada).</li>
                  <li>Evitar empresas sem histórico consistente de proventos.</li>
                </ul>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};
