import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface MarginSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export const MarginSlider: React.FC<MarginSliderProps> = ({
  value,
  onChange,
  label = 'Margem de Segurança',
}) => {
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 dark:border-emerald-500/30 dark:bg-emerald-950/20">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {value >= 20 ? (
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          )}
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={70}
            step={1}
            value={value}
            onChange={(e) => {
              const val = Math.max(0, Math.min(70, Number(e.target.value) || 0));
              onChange(val);
            }}
            className="w-14 rounded-md border border-emerald-400/40 bg-white px-2 py-0.5 text-right text-xs font-bold text-emerald-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:bg-slate-900 dark:text-emerald-300"
          />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">%</span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-3">
        <span className="text-[10px] text-slate-400">0%</span>
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-emerald-200 accent-emerald-600 dark:bg-emerald-900/60 dark:accent-emerald-400"
        />
        <span className="text-[10px] text-slate-400">50%</span>
      </div>

      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        Preço de Compra = Preço Teto × (1 − {value}%)
      </p>
    </div>
  );
};
