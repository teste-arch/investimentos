import React, { useState } from 'react';
import { X, Settings2, Sliders, Server, ShieldCheck, Key } from 'lucide-react';
import type { MarketParameters, ProviderItem, ApiUsageStats } from '../../services/api';

interface ProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketParams: MarketParameters;
  onSaveParams: (params: Partial<MarketParameters>) => Promise<void>;
  providers: ProviderItem[];
  stats?: ApiUsageStats;
}

export const ProviderSettingsModal: React.FC<ProviderSettingsModalProps> = ({
  isOpen,
  onClose,
  marketParams,
  onSaveParams,
  providers,
  stats,
}) => {
  const [bazinRateB3, setBazinRateB3] = useState(marketParams.bazinRateB3);
  const [bazinRateUS, setBazinRateUS] = useState(marketParams.bazinRateUS);
  const [grahamMultiplier, setGrahamMultiplier] = useState(marketParams.grahamMultiplier);
  const [marginOfSafety, setMarginOfSafety] = useState(marketParams.marginOfSafety);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await onSaveParams({
        bazinRateB3,
        bazinRateUS,
        grahamMultiplier,
        marginOfSafety,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#12141d] p-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Configurações de Mercado & Provedores
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Parâmetros por Mercado */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <span>Parâmetros de Valuation por Mercado</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Taxa Bazin - Brasil (B3)
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={bazinRateB3}
                    onChange={(e) => setBazinRateB3(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 pr-7 text-xs font-bold text-white focus:border-white/30 focus:outline-hidden"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-zinc-400 font-bold">
                    %
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-zinc-400">Padrão Décio Bazin: 6,0%</p>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Taxa Bazin - EUA (Dólar)
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={bazinRateUS}
                    onChange={(e) => setBazinRateUS(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 pr-7 text-xs font-bold text-white focus:border-white/30 focus:outline-hidden"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-zinc-400 font-bold">
                    %
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-zinc-400">Padrão Mercado EUA: 3,5%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Fator Multiplicador Graham
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={grahamMultiplier}
                  onChange={(e) => setGrahamMultiplier(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-bold text-white focus:border-white/30 focus:outline-hidden"
                />
                <p className="mt-1 text-[10px] text-zinc-400">Padrão: 22,5 (15 × 1,5)</p>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Margem de Segurança Global
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    step="1"
                    value={marginOfSafety}
                    onChange={(e) => setMarginOfSafety(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 pr-7 text-xs font-bold text-white focus:border-white/30 focus:outline-hidden"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-zinc-400 font-bold">
                    %
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-zinc-400">Padrão: 20% de desconto</p>
              </div>
            </div>
          </div>

          {/* Camada de Provedores e Chaves */}
          <div className="space-y-3 border-t border-white/[0.06] pt-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300">
              <Server className="h-4 w-4 text-emerald-400" />
              <span>Provedores de Dados & Status de APIs</span>
            </div>

            <div className="space-y-2">
              {stats && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs">
                  <div className="font-bold text-white">
                    Contador de Consumo Diário de Quota:
                  </div>
                  <div className="mt-1 flex items-center justify-between text-zinc-400">
                    <span>B3 (brapi.dev):</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {stats.brapiRequestsToday} / {stats.brapiLimit} requisições hoje
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-zinc-400">
                    <span>EUA (Financial Modeling Prep):</span>
                    <span className="font-mono text-cyan-400 font-semibold">
                      {stats.fmpRequestsToday} / {stats.fmpLimit} requisições hoje
                    </span>
                  </div>
                </div>
              )}

              {providers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {p.name}
                      </span>
                      <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] font-bold text-zinc-300">
                        {p.market}
                      </span>
                      {p.isActive && (
                        <span className="rounded bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                          Ativo
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[10px] text-zinc-400">
                      {p.id === 'brapi'
                        ? 'Consome cotações e proventos da B3 via brapi.dev'
                        : 'Consome balanços e cotações de Wall Street via FMP'}
                    </div>
                  </div>

                  <div>
                    {p.isConfigured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="h-3 w-3" /> Chave Configurada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20">
                        <Key className="h-3 w-3" /> Usando Cache/Mock
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-3 text-xs text-zinc-300 space-y-1">
              <div className="font-bold text-white">Como adicionar suas chaves de API:</div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                As chaves de API ficam guardadas com segurança no arquivo <code>.env</code> no
                servidor (e <strong>nunca no navegador</strong>):
              </p>
              <pre className="rounded-lg bg-[#0c0d14] p-2 text-[10px] text-emerald-400 border border-white/[0.06] overflow-x-auto font-mono">
{`BRAPI_API_KEY=sua_chave_brapi_aqui
FMP_API_KEY=sua_chave_fmp_aqui`}
              </pre>
            </div>
          </div>

          {savedSuccess && (
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-2.5 text-center text-xs font-bold text-emerald-300">
              ✓ Parâmetros atualizados e rankings recalculados com sucesso!
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/[0.06] transition-colors"
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-white text-zinc-900 px-4 py-2 text-xs font-bold shadow-xs hover:bg-zinc-200 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Salvando...' : 'Salvar e Recalcular'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
