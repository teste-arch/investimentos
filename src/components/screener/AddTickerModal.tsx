import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle } from 'lucide-react';
import type { MarketType } from '../../../server/providers/types';

interface AddTickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (payload: {
    ticker: string;
    name?: string;
    market: MarketType;
    isFinancial: boolean;
    price?: number;
    lpa?: number;
    vpa?: number;
    dpa?: number;
  }) => Promise<void>;
}

export const AddTickerModal: React.FC<AddTickerModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [market, setMarket] = useState<MarketType>('B3');
  const [isFinancial, setIsFinancial] = useState(false);
  const [price, setPrice] = useState<number | ''>('');
  const [lpa, setLpa] = useState<number | ''>('');
  const [vpa, setVpa] = useState<number | ''>('');
  const [dpa, setDpa] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) {
      setError('O ticker é obrigatório (ex: TAEE11, AAPL).');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await onAdd({
        ticker: ticker.trim().toUpperCase(),
        name: name.trim() || undefined,
        market,
        isFinancial,
        price: price === '' ? undefined : Number(price),
        lpa: lpa === '' ? undefined : Number(lpa),
        vpa: vpa === '' ? undefined : Number(vpa),
        dpa: dpa === '' ? undefined : Number(dpa),
      });
      onClose();
      setTicker('');
      setName('');
      setPrice('');
      setLpa('');
      setVpa('');
      setDpa('');
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar ticker.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Adicionar Ação ao Monitoramento
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

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ticker *
              </label>
              <input
                type="text"
                required
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Ex: ITSA4 ou MSFT"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold uppercase text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mercado
              </label>
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value as MarketType)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="B3">🇧🇷 B3 (Brasil)</option>
                <option value="US">🇺🇸 EUA (Dólar)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nome da Empresa / Razão Social
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Itaúsa S.A."
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Cotação Atual ({market === 'B3' ? 'R$' : '$'})
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ex: 10.50"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Dividendo / Ação (DPA 12m)
              </label>
              <input
                type="number"
                step="0.01"
                value={dpa}
                onChange={(e) => setDpa(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ex: 0.85"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Lucro por Ação (LPA)
              </label>
              <input
                type="number"
                step="0.01"
                value={lpa}
                onChange={(e) => setLpa(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ex: 1.45"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Valor Patrimonial (VPA)
              </label>
              <input
                type="number"
                step="0.01"
                value={vpa}
                onChange={(e) => setVpa(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ex: 9.20"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="modal-is-financial"
              checked={isFinancial}
              onChange={(e) => setIsFinancial(e.target.checked)}
              className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label
              htmlFor="modal-is-financial"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              É banco, seguradora ou instituição financeira
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Adicionar ao Monitoramento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
