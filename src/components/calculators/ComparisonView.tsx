import React, { useState } from 'react';
import type { Currency } from '../../types/valuation';
import {
  calculateBazin,
  calculateGraham,
  calculateLynch,
  calculateDcf,
  formatCurrency,
  formatPercent,
} from '../../utils/valuationCalculators';
import { InputField } from '../ui/InputField';
import { MarginSlider } from '../ui/MarginSlider';
import { Scale, TrendingUp, TrendingDown } from 'lucide-react';

interface ComparisonViewProps {
  currency: Currency;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ currency }) => {
  const [tickerName, setTickerName] = useState('PETR4 - Petrobras');
  const [currentPrice, setCurrentPrice] = useState(38.2);
  const [marginOfSafety, setMarginOfSafety] = useState(20);

  // Parâmetros integrados
  const [dpa, setDpa] = useState(5.2);
  const [targetYield, setTargetYield] = useState(6.0);

  const [lpa, setLpa] = useState(6.85);
  const [vpa, setVpa] = useState(31.2);
  const [grahamMultiplier, setGrahamMultiplier] = useState(22.5);

  const [earningsGrowth, setEarningsGrowth] = useState(10.0);
  const [dividendYield, setDividendYield] = useState(13.6);

  const [fcfPerShare, setFcfPerShare] = useState(7.5);
  const [wacc, setWacc] = useState(12.5);
  const [perpetualGrowth, setPerpetualGrowth] = useState(3.0);

  // Cálculos
  const bazinRes = calculateBazin({
    dividendPerShare: dpa,
    dividendType: '12m',
    targetYield,
    marginOfSafety,
    currentPrice,
  });

  const grahamRes = calculateGraham({
    lpa,
    vpa,
    multiplier: grahamMultiplier,
    marginOfSafety,
    currentPrice,
  });

  const lynchRes = calculateLynch({
    currentPrice,
    lpa,
    earningsGrowth,
    dividendYield,
    marginOfSafety,
  });

  // DCF unitário por ação
  const dcfRes = calculateDcf({
    currentFcf: fcfPerShare * 1000,
    growthRate5y: earningsGrowth,
    wacc,
    perpetualGrowth,
    netDebt: 0,
    sharesCount: 1000,
    marginOfSafety,
    currentPrice,
  });

  // Consenso Médio
  const validCeilings: { name: string; ceiling: number; buyPrice: number }[] = [];

  if (bazinRes.ceilingPrice && bazinRes.ceilingPrice > 0) {
    validCeilings.push({
      name: 'Bazin (Dividendos)',
      ceiling: bazinRes.ceilingPrice,
      buyPrice: bazinRes.buyPriceWithMargin!,
    });
  }

  if (grahamRes.isApplicable && grahamRes.ceilingPrice && grahamRes.ceilingPrice > 0) {
    validCeilings.push({
      name: 'Graham (LPA × VPA)',
      ceiling: grahamRes.ceilingPrice,
      buyPrice: grahamRes.buyPriceWithMargin!,
    });
  }

  if (lynchRes.isApplicable && lynchRes.ceilingPrice && lynchRes.ceilingPrice > 0) {
    validCeilings.push({
      name: 'Peter Lynch',
      ceiling: lynchRes.ceilingPrice,
      buyPrice: lynchRes.buyPriceWithMargin!,
    });
  }

  if (dcfRes.isApplicable && dcfRes.ceilingPrice && dcfRes.ceilingPrice > 0) {
    validCeilings.push({
      name: 'DCF (Fluxo de Caixa)',
      ceiling: dcfRes.ceilingPrice,
      buyPrice: dcfRes.buyPriceWithMargin!,
    });
  }

  const averageCeiling =
    validCeilings.length > 0
      ? validCeilings.reduce((acc, curr) => acc + curr.ceiling, 0) / validCeilings.length
      : 0;

  const averageBuyPrice = averageCeiling * (1 - marginOfSafety / 100);

  const averageUpside =
    currentPrice > 0 && averageCeiling > 0
      ? ((averageCeiling - currentPrice) / currentPrice) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Banner de Apresentação */}
      <div className="glass-card rounded-2xl p-4 text-left">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-emerald-400">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Painel Comparativo de Valuation Unificado
            </h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              Compare os preços tetos calculados simultaneamente por <strong>Bazin</strong>,{' '}
              <strong>Graham</strong>, <strong>Peter Lynch</strong> e <strong>DCF</strong> para
              uma mesma ação, visualizando a média de consenso e a margem de segurança.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulário de Entradas Unificado */}
        <div className="lg:col-span-5 space-y-4 glass-card rounded-2xl p-6 text-left">
          <div className="border-b border-white/[0.06] pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Dados da Empresa
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                Ticker / Nome
              </label>
              <input
                type="text"
                value={tickerName}
                onChange={(e) => setTickerName(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#12141d] px-3 py-2 text-xs font-semibold text-white focus:border-white/30 focus:outline-hidden"
              />
            </div>
            <InputField
              id="comp-price"
              label="Cotação Atual"
              value={currentPrice}
              onChange={(val) => setCurrentPrice(val)}
              prefix={currency === 'BRL' ? 'R$' : '$'}
              helpText="Preço de tela"
            />
          </div>

          <div className="border-t border-white/[0.06] pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Proventos & Lucro
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField
              id="comp-dpa"
              label="Dividendo / Ação"
              value={dpa}
              onChange={(val) => setDpa(val)}
              prefix={currency === 'BRL' ? 'R$' : '$'}
            />
            <InputField
              id="comp-target-yield"
              label="Taxa Bazin Exigida"
              value={targetYield}
              onChange={(val) => setTargetYield(val)}
              suffix="%"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField
              id="comp-lpa"
              label="Lucro por Ação (LPA)"
              value={lpa}
              onChange={(val) => setLpa(val)}
              prefix={currency === 'BRL' ? 'R$' : '$'}
            />
            <InputField
              id="comp-vpa"
              label="VPA (Patrimonial)"
              value={vpa}
              onChange={(val) => setVpa(val)}
              prefix={currency === 'BRL' ? 'R$' : '$'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField
              id="comp-graham-mult"
              label="Fator Graham"
              value={grahamMultiplier}
              onChange={(val) => setGrahamMultiplier(val)}
              step={0.5}
            />
            <InputField
              id="comp-growth"
              label="Crescimento Lucro (%)"
              value={earningsGrowth}
              onChange={(val) => setEarningsGrowth(val)}
              suffix="%"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField
              id="comp-dy"
              label="Dividend Yield (%)"
              value={dividendYield}
              onChange={(val) => setDividendYield(val)}
              suffix="%"
            />
            <InputField
              id="comp-fcf"
              label="FCF por Ação"
              value={fcfPerShare}
              onChange={(val) => setFcfPerShare(val)}
              prefix={currency === 'BRL' ? 'R$' : '$'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField
              id="comp-wacc"
              label="WACC Desc. (%)"
              value={wacc}
              onChange={(val) => setWacc(val)}
              suffix="%"
            />
            <InputField
              id="comp-perp-g"
              label="Perpetuidade g (%)"
              value={perpetualGrowth}
              onChange={(val) => setPerpetualGrowth(val)}
              suffix="%"
            />
          </div>

          <MarginSlider
            value={marginOfSafety}
            onChange={(val) => setMarginOfSafety(val)}
          />
        </div>

        {/* Quadro Comparativo de Tetos e Média */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card da Média dos Tetos */}
          <div className="glass-card rounded-2xl p-5 text-left border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Consenso Médio dos Métodos Aplicáveis ({tickerName})
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                {validCeilings.length} de 4 Métodos
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Preço Teto Médio Consolidado
                </div>
                <div className="mt-1 text-3xl font-black text-white">
                  {formatCurrency(averageCeiling, currency)}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
                  <span className="text-zinc-400">Upside Médio:</span>
                  <span
                    className={`font-bold ${
                      averageUpside >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {averageUpside >= 0 ? (
                      <TrendingUp className="mr-0.5 h-3.5 w-3.5 inline" />
                    ) : (
                      <TrendingDown className="mr-0.5 h-3.5 w-3.5 inline" />
                    )}
                    {formatPercent(averageUpside, 1, true)}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Preço de Compra com Margem ({marginOfSafety}%)
                </div>
                <div className="mt-1 text-3xl font-black text-emerald-400">
                  {formatCurrency(averageBuyPrice, currency)}
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  Cotação Atual: <strong className="text-white">{formatCurrency(currentPrice, currency)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela Comparativa Detalhada */}
          <div className="glass-card rounded-2xl p-5 text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Comparativo Método a Método
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-zinc-400">
                    <th className="py-2.5">Método</th>
                    <th className="py-2.5 text-right">Preço Teto</th>
                    <th className="py-2.5 text-right">Compra c/ Margem</th>
                    <th className="py-2.5 text-right">Upside</th>
                    <th className="py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {/* Bazin */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 font-semibold text-white">
                      Bazin (Dividendos)
                    </td>
                    <td className="py-3 text-right font-medium text-zinc-300">
                      {formatCurrency(bazinRes.ceilingPrice, currency)}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-400">
                      {formatCurrency(bazinRes.buyPriceWithMargin, currency)}
                    </td>
                    <td className="py-3 text-right font-semibold">
                      <span
                        className={
                          (bazinRes.upside ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {formatPercent(bazinRes.upside, 1, true)}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        {currentPrice <= bazinRes.buyPriceWithMargin ? 'Oportunidade' : 'Abaixo Teto'}
                      </span>
                    </td>
                  </tr>

                  {/* Graham */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 font-semibold text-white">
                      Graham (LPA × VPA)
                    </td>
                    <td className="py-3 text-right font-medium text-zinc-300">
                      {grahamRes.isApplicable
                        ? formatCurrency(grahamRes.ceilingPrice, currency)
                        : 'Não se aplica'}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-400">
                      {grahamRes.isApplicable
                        ? formatCurrency(grahamRes.buyPriceWithMargin, currency)
                        : '—'}
                    </td>
                    <td className="py-3 text-right font-semibold">
                      {grahamRes.isApplicable ? (
                        <span
                          className={
                            (grahamRes.upside ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }
                        >
                          {formatPercent(grahamRes.upside, 1, true)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {grahamRes.isApplicable ? (
                        <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                          Válido
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20">
                          Não se aplica
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Peter Lynch */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 font-semibold text-white">
                      Peter Lynch (LPA × Cresc.)
                    </td>
                    <td className="py-3 text-right font-medium text-zinc-300">
                      {formatCurrency(lynchRes.ceilingPrice, currency)}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-400">
                      {formatCurrency(lynchRes.buyPriceWithMargin, currency)}
                    </td>
                    <td className="py-3 text-right font-semibold">
                      <span
                        className={
                          (lynchRes.upside ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {formatPercent(lynchRes.upside, 1, true)}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          lynchRes.lynchScoreClassification === 'bom'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : lynchRes.lynchScoreClassification === 'razoavel'
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        Score {lynchRes.lynchScoreClassification}
                      </span>
                    </td>
                  </tr>

                  {/* DCF */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 font-semibold text-white">
                      DCF (Fluxo Descontado)
                    </td>
                    <td className="py-3 text-right font-medium text-zinc-300">
                      {formatCurrency(dcfRes.ceilingPrice, currency)}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-400">
                      {formatCurrency(dcfRes.buyPriceWithMargin, currency)}
                    </td>
                    <td className="py-3 text-right font-semibold">
                      <span
                        className={
                          (dcfRes.upside ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {formatPercent(dcfRes.upside, 1, true)}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        Fluxo Livre
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
