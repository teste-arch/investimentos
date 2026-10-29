import React, { useState } from 'react';
import type { Currency, GreenblattParams } from '../../types/valuation';
import { calculateGreenblatt, formatCurrency, formatPercent, formatNumber } from '../../utils/valuationCalculators';
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
    ebit: 8200,
    marketCap: 45000,
    netDebt: 6500,
    netWorkingCapital: 4200,
    netFixedAssets: 18000,
    sharesOutstanding: 1200,
    currentPrice: 37.5,
    targetMultipleEV_EBIT: 8.0,
    marginOfSafety: 20,
  });

  const [activePreset, setActivePreset] = useState<string>('VALE3 (Vale)');

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
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-300">
            Carregar exemplo real:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {greenblattPresets.map((preset) => (
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
              Parâmetros da Fórmula Mágica
            </h3>
            <p className="text-xs text-zinc-400">
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
          <div className="glass-card rounded-2xl p-5 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Pilares da Fórmula Mágica
              </span>
              <span className="text-xs font-bold text-emerald-400">
                Joel Greenblatt
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Earnings Yield */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                  <Percent className="h-4 w-4" /> Earnings Yield
                </div>
                <div className="mt-2 text-2xl font-black text-cyan-300">
                  {formatPercent(result.earningsYield)}
                </div>
                <p className="mt-1 text-[10px] text-zinc-400">
                  EBIT ÷ EV (Rendimento Operacional)
                </p>
              </div>

              {/* ROIC */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Activity className="h-4 w-4" /> ROIC Tangível
                </div>
                <div className="mt-2 text-2xl font-black text-emerald-300">
                  {result.roic !== null ? formatPercent(result.roic) : '—'}
                </div>
                <p className="mt-1 text-[10px] text-zinc-400">
                  EBIT ÷ (Giro Líq + Imobilizado)
                </p>
              </div>
            </div>

            {/* Enterprise Value & Capital */}
            <div className="space-y-2 text-xs text-zinc-300 border-t border-white/[0.06] pt-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Enterprise Value (EV = MktCap + Dívida):</span>
                <span className="font-semibold text-white">{formatNumber(result.ev, 0)} mi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Capital Tangível Investido:</span>
                <span className="font-semibold text-white">{formatNumber(result.tangibleCapitalEmployed, 0)} mi</span>
              </div>
            </div>

            {/* Preço Justo Estimado se parâmetros fornecidos */}
            {result.ceilingPrice && result.ceilingPrice > 0 && (
              <div className="rounded-xl bg-white/[0.03] p-4 border border-white/[0.08] space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400">
                  Preço Teto Estimado (EV/EBIT {params.targetMultipleEV_EBIT}x):
                </div>
                <div className="text-2xl font-black text-white">
                  {formatCurrency(result.ceilingPrice, currency)}
                </div>
                <div className="flex justify-between text-xs text-emerald-400">
                  <span className="text-zinc-400">Com Margem ({params.marginOfSafety}%):</span>
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
              <div className="space-y-2 text-zinc-300">
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
                <p className="text-[10px] text-zinc-400">
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
