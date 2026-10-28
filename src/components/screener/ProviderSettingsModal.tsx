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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-left max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Configurações de Mercado & Provedores
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Parâmetros por Mercado */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Sliders className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Parâmetros de Valuation por Mercado</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Taxa Bazin - Brasil (B3)
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={bazinRateB3}
                    onChange={(e) => setBazinRateB3(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-7 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 font-bold">
                    %
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">Padrão Décio Bazin: 6,0%</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Taxa Bazin - EUA (Dólar)
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={bazinRateUS}
                    onChange={(e) => setBazinRateUS(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-7 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 font-bold">
                    %
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">Padrão Mercado EUA: 3,5%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Fator Multiplicador Graham
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={grahamMultiplier}
                  onChange={(e) => setGrahamMultiplier(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <p className="mt-1 text-[10px] text-slate-500">Padrão: 22,5 (15 × 1,5)</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Margem de Segurança Global
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    step="1"
                    value={marginOfSafety}
                    onChange={(e) => setMarginOfSafety(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-7 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 font-bold">
                    %
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">Padrão: 20% de desconto</p>
              </div>
            </div>
          </div>

          {/* Camada de Provedores e Chaves */}
          <div className="space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Server className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Provedores de Dados & Status de APIs</span>
            </div>

            <div className="space-y-2">
              {stats && (
                <div className="rounded-xl border border-slate-200 bg-emerald-50/50 p-3 text-xs dark:border-slate-800 dark:bg-emerald-950/20">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Contador de Consumo Diário de Quota:
                  </div>
                  <div className="mt-1 flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>B3 (brapi.dev):</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      {stats.brapiRequestsToday} / {stats.brapiLimit} requisições hoje
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>EUA (Financial Modeling Prep):</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      {stats.fmpRequestsToday} / {stats.fmpLimit} requisições hoje
                    </span>
                  </div>
                </div>
              )}

              {providers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {p.name}
                      </span>
                      <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[9px] font-bold dark:bg-slate-700">
                        {p.market}
                      </span>
                      {p.isActive && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Ativo
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {p.id === 'brapi'
                        ? 'Consome cotações e proventos da B3 via brapi.dev'
                        : 'Consome balanços e cotações de Wall Street via FMP'}
                    </div>
                  </div>

                  <div>
                    {p.isConfigured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <ShieldCheck className="h-3 w-3" /> Chave Configurada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <Key className="h-3 w-3" /> Usando Cache/Mock
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-blue-500/10 p-3 text-xs text-blue-900 dark:text-blue-300 space-y-1">
              <div className="font-bold">Como adicionar suas chaves de API:</div>
              <p className="text-[11px] leading-relaxed">
                As chaves de API ficam guardadas com segurança no arquivo <code>.env</code> no
                servidor (e <strong>nunca no navegador</strong>):
              </p>
              <pre className="rounded bg-slate-900 p-2 text-[10px] text-emerald-300 overflow-x-auto">
{`BRAPI_API_KEY=sua_chave_brapi_aqui
FMP_API_KEY=sua_chave_fmp_aqui`}
              </pre>
            </div>
          </div>

          {savedSuccess && (
            <div className="rounded-lg bg-emerald-100 p-2 text-center text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ✓ Parâmetros atualizados e rankings recalculados com sucesso!
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar e Recalcular'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
