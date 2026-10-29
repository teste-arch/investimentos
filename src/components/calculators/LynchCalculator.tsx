import React, { useState } from 'react';
import type { Currency, LynchParams } from '../../types/valuation';
import { calculateLynch, formatCurrency, formatNumber } from '../../utils/valuationCalculators';
import { lynchPresets } from '../../utils/presets';
import { InputField } from '../ui/InputField';
import { MarginSlider } from '../ui/MarginSlider';
import { ResultDisplay } from '../ui/ResultDisplay';
import { FormulaCard } from '../ui/FormulaCard';
import { Sparkles, RotateCcw, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface LynchCalculatorProps {
  currency: Currency;
}

export const LynchCalculator: React.FC<LynchCalculatorProps> = ({ currency }) => {
  const [params, setParams] = useState<LynchParams>({
    currentPrice: 52.4,
    lpa: 3.8,
    earningsGrowth: 15.0,
    dividendYield: 4.2,
    marginOfSafety: 20,
  });

  const [activePreset, setActivePreset] = useState<string>('WEGE3 (WEG)');

  const result = calculateLynch(params);

  const handlePresetSelect = (presetTicker: string) => {
    const found = lynchPresets.find((p) => p.ticker === presetTicker);
    if (found) {
      setParams(found.params);
      setActivePreset(found.ticker);
    }
  };

  const handleReset = () => {
    setParams({
      currentPrice: 0,
      lpa: 0,
      earningsGrowth: 0,
      dividendYield: 0,
      marginOfSafety: 20,
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
          {lynchPresets.map((preset) => (
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
              Parâmetros de Peter Lynch
            </h3>
            <p className="text-xs text-zinc-400">
              Avalie o crescimento dos lucros em relação ao múltiplo P/L e proventos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="lynch-current-price"
              label="Cotação Atual"
              value={params.currentPrice}
              onChange={(val) => setParams({ ...params, currentPrice: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="Preço atual da ação em mercado."
            />

            <InputField
              id="lynch-lpa"
              label="Lucro por Ação (LPA 12m)"
              value={params.lpa}
              onChange={(val) => setParams({ ...params, lpa: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="LPA reportado dos últimos 12 meses."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="lynch-growth"
              label="Crescimento Anual Esperado dos Lucros"
              value={params.earningsGrowth}
              onChange={(val) => setParams({ ...params, earningsGrowth: val })}
              suffix="%"
              step={1}
              helpText="Taxa composta anual de crescimento (CAGR) projetada."
            />

            <InputField
              id="lynch-dy"
              label="Dividend Yield (12m)"
              value={params.dividendYield}
              onChange={(val) => setParams({ ...params, dividendYield: val })}
              suffix="%"
              step={0.5}
              helpText="Rendimento anual em proventos."
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
            notApplicableMessage={result.notes}
            currency={currency}
            title="Preço Teto de Peter Lynch"
          />

          {/* Card Especial de Score Lynch e PEG Ratio */}
          {result.isApplicable && (
            <div className="glass-card rounded-2xl p-5 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Métricas de Peter Lynch
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  (Crescimento + DY) ÷ P/L
                </span>
              </div>

              {/* Lynch Score Badge */}
              <div
                className={`rounded-xl p-4 border transition-all ${
                  result.lynchScoreClassification === 'bom'
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : result.lynchScoreClassification === 'razoavel'
                    ? 'border-cyan-500/40 bg-cyan-500/10'
                    : 'border-rose-500/40 bg-rose-500/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.lynchScoreClassification === 'bom' ? (
                      <ThumbsUp className="h-5 w-5 text-emerald-400" />
                    ) : result.lynchScoreClassification === 'razoavel' ? (
                      <Minus className="h-5 w-5 text-cyan-400" />
                    ) : (
                      <ThumbsDown className="h-5 w-5 text-rose-400" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Score de Lynch:
                    </span>
                  </div>
                  <span
                    className={`text-2xl font-black ${
                      result.lynchScoreClassification === 'bom'
                        ? 'text-emerald-400'
                        : result.lynchScoreClassification === 'razoavel'
                        ? 'text-cyan-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {formatNumber(result.lynchScore, 2)}
                  </span>
                </div>

                <div className="mt-2 text-xs font-medium text-zinc-300">
                  {result.lynchScoreClassification === 'bom' && (
                    <span className="text-emerald-300">
                      ✓ <strong>Acima de 2.0 (Excelente / Barata):</strong> O crescimento somado aos proventos supera amplamente o múltiplo pago.
                    </span>
                  )}
                  {result.lynchScoreClassification === 'razoavel' && (
                    <span className="text-cyan-300">
                      ≈ <strong>Entre 1.0 e 2.0 (Razoável / Justa):</strong> Preço em equilíbrio com a expansão esperada.
                    </span>
                  )}
                  {result.lynchScoreClassification === 'ruim' && (
                    <span className="text-rose-300">
                      ✕ <strong>Abaixo de 1.0 (Ruim / Cara):</strong> O investidor está pagando muito caro para a taxa de expansão do negócio.
                    </span>
                  )}
                </div>
              </div>

              {/* Tabela Resumo */}
              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-400">PEG Ratio (P/L ÷ Crescimento):</span>
                  <span className="font-bold text-white">
                    {result.pegRatio !== null ? `${formatNumber(result.pegRatio, 2)}x` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Teto Lynch (LPA × Crescimento):</span>
                  <span className="font-bold text-emerald-400">
                    {formatCurrency(result.ceilingPrice, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Preço com Margem ({params.marginOfSafety}%):</span>
                  <span className="font-bold text-emerald-400">
                    {formatCurrency(result.buyPriceWithMargin, currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <FormulaCard
            title="Critérios de Peter Lynch (One Up on Wall Street)"
            author="Peter Lynch (Fidelity Magellan Fund)"
            formula="Teto = LPA × Crescimento (%) | Score = (Crescimento + DY) ÷ P/L"
            explanation={
              <div className="space-y-2 text-zinc-300">
                <p>
                  Para Peter Lynch, uma empresa cujo P/L é igual à taxa de crescimento dos
                  lucros está razoavelmente precificada (PEG Ratio = 1).
                </p>
                <p>
                  Ele também criou a métrica ajustada por dividendos:{' '}
                  <strong>(Crescimento % + Dividend Yield %) ÷ P/L</strong>:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                  <li><strong>Acima de 2,0:</strong> Excelente oportunidade (pechincha).</li>
                  <li><strong>Entre 1,0 e 2,0:</strong> Aceitável / Preço justo.</li>
                  <li><strong>Abaixo de 1,0:</strong> Cara / Risco de sobrevalorização.</li>
                </ul>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};
