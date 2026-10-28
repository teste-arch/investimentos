import React, { useState } from 'react';
import type { Currency, DcfParams } from '../../types/valuation';
import { calculateDcf, formatNumber } from '../../utils/valuationCalculators';
import { dcfPresets } from '../../utils/presets';
import { InputField } from '../ui/InputField';
import { MarginSlider } from '../ui/MarginSlider';
import { ResultDisplay } from '../ui/ResultDisplay';
import { FormulaCard } from '../ui/FormulaCard';
import { Sparkles, RotateCcw, Calculator, Layers } from 'lucide-react';

interface DcfCalculatorProps {
  currency: Currency;
}

export const DcfCalculator: React.FC<DcfCalculatorProps> = ({ currency }) => {
  const [params, setParams] = useState<DcfParams>({
    currentFcf: 42000,
    growthRate5y: 5.0,
    wacc: 12.5,
    perpetualGrowth: 3.0,
    netDebt: 52000,
    sharesCount: 4500,
    marginOfSafety: 20,
    currentPrice: 55.5,
  });

  const [activePreset, setActivePreset] = useState<string>('VALE3 (Vale - B3)');

  const result = calculateDcf(params);

  const handlePresetSelect = (presetTicker: string) => {
    const found = dcfPresets.find((p) => p.ticker === presetTicker);
    if (found) {
      setParams(found.params);
      setActivePreset(found.ticker);
    }
  };

  const handleReset = () => {
    setParams({
      currentFcf: 0,
      growthRate5y: 5.0,
      wacc: 12.0,
      perpetualGrowth: 3.0,
      netDebt: 0,
      sharesCount: 0,
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
          {dcfPresets.map((preset) => (
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
              Parâmetros do DCF Simplificado
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fluxo de Caixa Livre e Dívida na mesma escala (ex: milhões ou bilhões).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="dcf-fcf"
              label="Fluxo de Caixa Livre Atual (FCF₀)"
              value={params.currentFcf}
              onChange={(val) => setParams({ ...params, currentFcf: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="FCF dos últimos 12 meses (FCO − CapEx)."
            />

            <InputField
              id="dcf-growth"
              label="Crescimento Anual (Anos 1 a 5)"
              value={params.growthRate5y}
              onChange={(val) => setParams({ ...params, growthRate5y: val })}
              suffix="% a.a."
              step={0.5}
              helpText="Taxa de expansão anual projetada para os próximos 5 anos."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="dcf-wacc"
              label="WACC (Taxa de Desconto)"
              value={params.wacc}
              onChange={(val) => setParams({ ...params, wacc: val })}
              suffix="%"
              step={0.25}
              helpText="Custo Médio Ponderado de Capital (Brasil ~11% a 14%; EUA ~8% a 10%)."
            />

            <InputField
              id="dcf-perp-growth"
              label="Crescimento Perpétuo (g)"
              value={params.perpetualGrowth}
              onChange={(val) => setParams({ ...params, perpetualGrowth: val })}
              suffix="%"
              step={0.25}
              helpText="Crescimento a longo prazo na perpetuidade (normalmente inflação + PIB: 2,5% a 4%)."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="dcf-netdebt"
              label="Dívida Líquida"
              value={params.netDebt}
              onChange={(val) => setParams({ ...params, netDebt: val })}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="Dívida Bruta − Caixa. Se houver caixa líquido positivo, insira valor negativo."
            />

            <InputField
              id="dcf-shares"
              label="Número Total de Ações"
              value={params.sharesCount}
              onChange={(val) => setParams({ ...params, sharesCount: val })}
              step={1}
              helpText="Total de ações emitidas (na mesma escala do FCF, ex: milhões)."
            />
          </div>

          <InputField
            id="dcf-current-price"
            label="Cotação Atual de Mercado"
            value={params.currentPrice || ''}
            onChange={(val) => setParams({ ...params, currentPrice: val })}
            prefix={currency === 'BRL' ? 'R$' : '$'}
            helpText="Cotação unitária para cálculo de Upside/Downside."
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
            notApplicableMessage={result.error}
            currency={currency}
            title="Preço Teto por Ação (DCF)"
          />

          {/* Decomposição do Valor da Empresa */}
          {result.isApplicable && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-left space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Pontes de Valor (Enterprise Value → Equity)
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>VP dos Fluxos (Anos 1 a 5):</span>
                  <span className="font-semibold">{formatNumber(result.sumPvFcf, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VP do Valor Terminal:</span>
                  <span className="font-semibold">{formatNumber(result.pvTerminalValue, 2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    Enterprise Value (EV):
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatNumber(result.enterpriseValue, 2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>(−) Dívida Líquida:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {formatNumber(params.netDebt, 2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5 font-bold">
                  <span className="text-emerald-700 dark:text-emerald-300">
                    (=) Equity Value (Patrimônio Líquido):
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-300">
                    {formatNumber(result.equityValue, 2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 text-[11px]">
                  <span>Total de Ações:</span>
                  <span>{formatNumber(params.sharesCount, 2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tabela dos 5 Anos de Projeção */}
          {result.projections.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-left space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Projeção dos Próximos 5 Anos Descontados</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                      <th className="py-1">Ano</th>
                      <th className="py-1 text-right">FCF Projetado</th>
                      <th className="py-1 text-right">Fator Desc.</th>
                      <th className="py-1 text-right">Valor Presente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {result.projections.map((p) => (
                      <tr key={p.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-1 font-semibold text-slate-700 dark:text-slate-300">
                          Ano {p.year}
                        </td>
                        <td className="py-1 text-right text-slate-600 dark:text-slate-300">
                          {formatNumber(p.fcf, 1)}
                        </td>
                        <td className="py-1 text-right text-slate-400">
                          {formatNumber(p.discountFactor, 3)}
                        </td>
                        <td className="py-1 text-right font-medium text-emerald-600 dark:text-emerald-400">
                          {formatNumber(p.presentValue, 1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <FormulaCard
            title="Fluxo de Caixa Descontado (DCF) em 2 Estágios"
            author="Metodologia Tradicional de Valuation Corporativo"
            formula="Terminal = FCF₅ × (1 + g) ÷ (WACC − g) | EV = ∑VP(FCF₁..₅) + VP(Terminal)"
            explanation={
              <div className="space-y-2">
                <p>
                  O modelo DCF em 2 estágios projeta o Fluxo de Caixa Livre para a Firma nos
                  primeiros 5 anos à taxa de crescimento $g_1$, e calcula o Valor Terminal
                  pelo Modelo de Crescimento de Gordon.
                </p>
                <p>
                  Todos os fluxos são trazidos a valor presente descontados pelo{' '}
                  <strong>WACC</strong>. Subtraindo a <strong>Dívida Líquida</strong>, obtém-se o{' '}
                  <strong>Equity Value</strong> disponível aos acionistas.
                </p>
                <p className="text-[11px] text-slate-500">
                  <em>*Requisito matemático: O WACC deve ser superior à taxa de perpetuidade $g$ para convergência da fórmula de Gordon.</em>
                </p>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};
